import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import VideoRecorder from './VideoRecorder';
import './VideoChat.css';

const VideoChat = ({ isOpen, onClose }) => {
    const [stream, setStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [participants, setParticipants] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const audioContextRef = useRef(null);
    const audioAnalyserRef = useRef(null);
    const audioDataRef = useRef(new Uint8Array(1024));
    const [inviteLink, setInviteLink] = useState('');
    const localVideoRef = useRef(null);
    const socketRef = useRef(null);
    const remoteVideosRef = useRef({});
    const { roomId: joinRoomId } = useParams();



    const peerConnectionsRef = useRef({});

    const createPeerConnection = (userId) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'webrtc@live.com',
                    credential: 'muazkh'
                }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });

        const addStreamToPeer = (mediaStream) => {
            mediaStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, mediaStream);
            });
        };

        if (stream) addStreamToPeer(stream);
        if (screenStream) addStreamToPeer(screenStream);

        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteStream) {
                remoteVideosRef.current[userId] = remoteStream;
                setParticipants(prev => {
                    const existingParticipant = prev.find(p => p.id === userId);
                    if (existingParticipant) {
                        return prev.map(p => p.id === userId ? { ...p, stream: remoteStream } : p);
                    }
                    return [...prev, { id: userId, stream: remoteStream }];
                });

                // Ensure the stream is immediately available for the video element
                const videoElements = document.querySelectorAll('video');
                videoElements.forEach(video => {
                    if (video.dataset.userId === userId) {
                        video.srcObject = remoteStream;
                        video.play().catch(console.error);
                    }
                });
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('signal', {
                    userId,
                    signal: { type: 'ice-candidate', candidate: event.candidate }
                });
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                console.log('Connection failed, attempting reconnection...');
                peerConnection.restartIce();
                
                // Attempt to renegotiate after a brief delay
                setTimeout(async () => {
                    try {
                        const offer = await peerConnection.createOffer({ iceRestart: true });
                        await peerConnection.setLocalDescription(offer);
                        socketRef.current?.emit('signal', {
                            userId,
                            signal: { type: 'offer', sdp: offer }
                        });
                    } catch (error) {
                        console.error('Error during ICE restart:', error);
                    }
                }, 2000);
            }
        };

        // Monitor connection quality
        setInterval(() => {
            if (peerConnection.getStats) {
                peerConnection.getStats().then(stats => {
                    stats.forEach(report => {
                        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                            const rtt = report.currentRoundTripTime;
                            if (rtt > 1) { // High latency threshold (1 second)
                                console.log('High latency detected:', rtt);
                            }
                        }
                    });
                });
            }
        }, 5000);

        peerConnectionsRef.current[userId] = peerConnection;
        return peerConnection;
    };

    useEffect(() => {
        if (isOpen) {
            startVideo();
            const socket = io(process.env.REACT_APP_BACKEND_URL);
            socketRef.current = socket;

            if (joinRoomId) {
                setRoomId(joinRoomId);
                socket.emit('join-room', { roomId: joinRoomId });
            } else {
                const newRoomId = Math.random().toString(36).substring(7);
                setRoomId(newRoomId);
                setInviteLink(`${window.location.origin}/join/${newRoomId}`);
                socket.emit('create-room', newRoomId);
            }

            socket.on('room-created', ({ roomId, isHost: host }) => {
                setIsHost(host);
            });

            socket.on('host-privileges-granted', () => {
                setIsHost(true);
            });

            socket.on('participant-updated', ({ participant, activeSpeaker }) => {
                setParticipants(prev => prev.map(p => 
                    p.id === participant.id ? { ...p, ...participant } : p
                ));
                setActiveSpeaker(activeSpeaker);
            });

            socket.on('user-joined', async ({ participant }) => {
                setParticipants(prev => [...prev, participant]);
                const peerConnection = createPeerConnection(participant.id);
                
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit('signal', {
                    userId: participant.id,
                    signal: { type: 'offer', sdp: offer }
                });
            });

            socket.on('signal', async ({ userId, signal }) => {
                try {
                    const peerConnection = peerConnectionsRef.current[userId] || createPeerConnection(userId);

                    if (signal.type === 'offer') {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        socketRef.current?.emit('signal', {
                            userId,
                            signal: { type: 'answer', sdp: answer }
                        });
                    } else if (signal.type === 'answer') {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    } else if (signal.type === 'ice-candidate' && peerConnection.remoteDescription) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    }
                } catch (error) {
                    console.error('Error handling signal:', error);
                }
            });

            socket.on('receive-message', (message) => {
                setMessages(prev => [...prev, {
                    userId: message.userId,
                    message: message.message,
                    timestamp: message.timestamp
                }]);
            });

            socket.on('user-left', ({ userId, newHost }) => {
                setParticipants(prev => prev.filter(p => p.id !== userId));
                if (remoteVideosRef.current[userId]) {
                    const stream = remoteVideosRef.current[userId];
                    stream.getTracks().forEach(track => track.stop());
                    delete remoteVideosRef.current[userId];
                }
                if (peerConnectionsRef.current[userId]) {
                    peerConnectionsRef.current[userId].close();
                    delete peerConnectionsRef.current[userId];
                }
                if (newHost === socketRef.current?.id) {
                    setIsHost(true);
                }
                if (activeSpeaker === userId) {
                    setActiveSpeaker(null);
                }
            });
        } else {
            stopVideo();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
        return () => {
            stopVideo();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen]);

    const setupAudioAnalyser = (stream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            audioAnalyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(audioAnalyserRef.current);

            const checkAudioLevel = () => {
                if (audioAnalyserRef.current) {
                    audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current);
                    const average = audioDataRef.current.reduce((a, b) => a + b) / audioDataRef.current.length;
                    setAudioLevel(average);

                    if (average > 30) { // Threshold for active speaker
                        socketRef.current?.emit('user-action', { type: 'speaking', isSpeaking: true });
                    } else {
                        socketRef.current?.emit('user-action', { type: 'speaking', isSpeaking: false });
                    }
                }
                requestAnimationFrame(checkAudioLevel);
            };

            checkAudioLevel();
        }
    };

    const startVideo = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 },
                    aspectRatio: { ideal: 16/9 },
                    resizeMode: 'crop-and-scale'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 2
                }
            });
            
            // Ensure stream is set before attaching to video element
            setStream(mediaStream);
            
            // Immediately attach stream to video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
                localVideoRef.current.muted = true; // Mute local video to prevent echo
                
                try {
                    await localVideoRef.current.play();
                } catch (e) {
                    console.error('Error playing video:', e);
                    // Add auto-play fallback
                    const playVideo = async () => {
                        try {
                            await localVideoRef.current.play();
                            document.removeEventListener('click', playVideo);
                        } catch (err) {
                            console.error('Error playing video on click:', err);
                        }
                    };
                    document.addEventListener('click', playVideo);
                }
            }
            
            // Update existing peer connections with the new stream
            Object.values(peerConnectionsRef.current).forEach(pc => {
                mediaStream.getTracks().forEach(track => {
                    pc.addTrack(track, mediaStream);
                });
            });
            
            setupAudioAnalyser(mediaStream);
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    const stopVideo = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
        setIsMuted(false);
        setIsCameraOff(false);
        setIsScreenSharing(false);
        setIsHandRaised(false);
        setMessages([]);
        setParticipants([]);
        Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
        peerConnectionsRef.current = {};
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = isMuted);
            setIsMuted(!isMuted);
            socketRef.current?.emit('user-action', { type: 'mute', isMuted: !isMuted });
        }
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = isCameraOff);
            setIsCameraOff(!isCameraOff);
            socketRef.current?.emit('user-action', { type: 'camera', isCameraOff: !isCameraOff });
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                if (screenStream) {
                    screenStream.getTracks().forEach(track => {
                        track.stop();
                        Object.values(peerConnectionsRef.current).forEach(pc => {
                            const sender = pc.getSenders().find(s => s.track === track);
                            if (sender) pc.removeTrack(sender);
                        });
                    });
                    setScreenStream(null);
                }
            } else {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always"
                    },
                    audio: false
                });
                
                displayStream.getVideoTracks()[0].onended = () => {
                    toggleScreenShare();
                };
                
                setScreenStream(displayStream);
                Object.values(peerConnectionsRef.current).forEach(pc => {
                    displayStream.getTracks().forEach(track => pc.addTrack(track, displayStream));
                });
            }
            setIsScreenSharing(!isScreenSharing);
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    };

    const toggleHandRaise = () => {
        setIsHandRaised(!isHandRaised);
        socketRef.current?.emit('user-action', { type: 'hand-raise', isRaised: !isHandRaised });
    };

    if (!isOpen) return null;

    const sendMessage = () => {
        if (newMessage.trim() && socketRef.current) {
            socketRef.current.emit('send-message', {
                roomId,
                message: newMessage.trim()
            });
            setNewMessage('');
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Invite link copied to clipboard!');
    };

    return (
        <div className="video-chat-container">
            <div className="video-chat-content">
                <div className="video-section">
                    <div className={`video-grid participants-${participants.length + 1}`}>
                        <div className="video-wrapper">
                            <div className="video-container">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    data-user-id="local"
                                    className={`video ${activeSpeaker === 'local' ? 'active-speaker' : ''}`}
                                />
                                <div className="participant-name">You {isHandRaised && '✋'}</div>
                            </div>
                        </div>
                        {participants.map(participant => (
                            <div key={participant.id} className="video-wrapper">
                                <div className="video-container">
                                    <video
                                        key={participant.id}
                                        data-user-id={participant.id}
                                        autoPlay
                                        playsInline
                                        ref={el => {
                                            if (el && participant.stream && !el.srcObject) {
                                                el.srcObject = participant.stream;
                                                el.play().catch(e => {
                                                    console.error('Error playing remote video:', e);
                                                    el.addEventListener('click', () => {
                                                        el.play();
                                                    }, { once: true });
                                                });
                                            }
                                        }}
                                        className={`video ${activeSpeaker === participant.id ? 'active-speaker' : ''}`}
                                    />
                                    <div className="participant-name">
                                        Participant {participant.id.slice(0, 5)} {participant.isHandRaised && '✋'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="controls">
                        <button 
                            onClick={toggleMute}
                            className={`control-btn ${isMuted ? 'active' : ''}`}
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <svg viewBox="0 0 24 24">
                                {isMuted ? (
                                    <path fill="currentColor" d="M12 4L9 7H5v6h4l3 3V4z M17 12l2-2l-1-1l-2 2l-2-2l-1 1l2 2l-2 2l1 1l2-2l2 2l1-1l-2-2z"/>
                                ) : (
                                    <path fill="currentColor" d="M12 4L9 7H5v6h4l3 3V4z M17 7v6c1.1 0 2-0.9 2-2s-0.9-2-2-2"/>
                                )}
                            </svg>
                        </button>
                        <button 
                            onClick={toggleCamera}
                            className={`control-btn ${isCameraOff ? 'active' : ''}`}
                            title={isCameraOff ? 'Start Video' : 'Stop Video'}
                        >
                            <svg viewBox="0 0 24 24">
                                {isCameraOff ? (
                                    <path fill="currentColor" d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
                                ) : (
                                    <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                                )}
                            </svg>
                        </button>
                        <button
                            onClick={toggleScreenShare}
                            className={`control-btn screen-share ${isScreenSharing ? 'active' : ''}`}
                            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                        >
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 16V6h16v10.01L4 16zm9-6.87c-3.89.54-5.44 3.2-6 4.87 1.39-1.87 3.22-2.72 6-2.72v2.19l4-3.74L13 7v2.13z"/>
                            </svg>
                        </button>
                        <button
                            onClick={toggleHandRaise}
                            className={`control-btn hand-raise ${isHandRaised ? 'active' : ''}`}
                            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                        >
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z"/>
                            </svg>
                        </button>
                        <VideoRecorder stream={stream} />
                        <button onClick={onClose} className="control-btn close-btn" title="Leave Meeting">
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="sidebar">
                    <div className="invite-section">
                        <h3>Invite Others</h3>
                        <div className="invite-link">
                            <input type="text" value={inviteLink} readOnly />
                            <button onClick={copyInviteLink}>Copy</button>
                        </div>
                    </div>
                    <div className="participants-section">
                        <h3>Participants ({participants.length + 1})</h3>
                        <ul>
                            <li>You (Host)</li>
                            {participants.map(userId => (
                                <li key={userId}>Participant {userId.slice(0, 5)}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="chat-section">
                        <h3>Chat</h3>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="message">
                                    <span className="user">{msg.userId === socketRef.current?.id ? 'You' : 'Participant'}:</span>
                                    <span className="text">{msg.message}</span>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoChat;