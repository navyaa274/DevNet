import { Server } from 'socket.io';

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.WEB_URL,
            methods: ['GET', 'POST']
        }
    });

    const rooms = new Map();
    const activeParticipants = new Map();
    const screenShares = new Map();
    const recordings = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('create-room', (roomId) => {
            socket.join(roomId);
            rooms.set(roomId, { 
                host: socket.id, 
                participants: [{ id: socket.id, isHost: true, isMuted: false, isCameraOff: false, isHandRaised: false }],
                messages: [],
                activeSpeaker: null
            });
            activeParticipants.set(socket.id, { roomId, lastActive: Date.now() });
            socket.emit('room-created', { roomId, isHost: true });
        });

        socket.on('join-room', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room) {
                socket.join(roomId);
                const participant = { 
                    id: socket.id, 
                    isHost: false, 
                    isMuted: false, 
                    isCameraOff: false, 
                    isHandRaised: false 
                };
                room.participants.push(participant);
                activeParticipants.set(socket.id, { roomId, lastActive: Date.now() });
                socket.to(roomId).emit('user-joined', { participant });
                socket.emit('room-joined', {
                    roomId,
                    participants: room.participants,
                    messages: room.messages,
                    activeSpeaker: room.activeSpeaker
                });
            } else {
                socket.emit('room-not-found');
            }
        });

        socket.on('send-message', ({ roomId, message }) => {
            io.to(roomId).emit('receive-message', {
                userId: socket.id,
                message,
                timestamp: new Date().toISOString()
            });
        });

        socket.on('user-action', ({ type, ...data }) => {
            const participantInfo = activeParticipants.get(socket.id);
            if (!participantInfo) return;

            const room = rooms.get(participantInfo.roomId);
            if (!room) return;

            const participant = room.participants.find(p => p.id === socket.id);
            if (!participant) return;

            switch(type) {
                case 'mute':
                    participant.isMuted = data.isMuted;
                    break;
                case 'camera':
                    participant.isCameraOff = data.isCameraOff;
                    break;
                case 'hand-raise':
                    participant.isHandRaised = data.isRaised;
                    break;
                case 'speaking':
                    room.activeSpeaker = data.isSpeaking ? socket.id : null;
                    break;
            }

            io.to(participantInfo.roomId).emit('participant-updated', {
                participant,
                activeSpeaker: room.activeSpeaker
            });
        });

        socket.on('signal', ({ userId, signal, type }) => {
            io.to(userId).emit('signal', {
                userId: socket.id,
                signal,
                type
            });
        });

        socket.on('start-screen-share', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room) {
                const currentSharer = screenShares.get(roomId);
                if (currentSharer) {
                    if (currentSharer === socket.id) {
                        // Allow the same user to update their screen share
                        io.to(roomId).emit('screen-share-updated', { userId: socket.id });
                    } else {
                        socket.emit('screen-share-error', { 
                            message: 'Someone is already sharing their screen',
                            currentSharer
                        });
                    }
                    return;
                }
                screenShares.set(roomId, socket.id);
                io.to(roomId).emit('screen-share-started', { 
                    userId: socket.id,
                    timestamp: Date.now()
                });
            }
        });

        socket.on('stop-screen-share', ({ roomId }) => {
            if (screenShares.get(roomId) === socket.id) {
                screenShares.delete(roomId);
                io.to(roomId).emit('screen-share-stopped', { userId: socket.id });
            }
        });

        socket.on('start-recording', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.find(p => p.id === socket.id)?.isHost) {
                recordings.set(roomId, { startTime: Date.now(), recorderId: socket.id });
                io.to(roomId).emit('recording-started', { userId: socket.id });
            }
        });

        socket.on('stop-recording', ({ roomId }) => {
            const recording = recordings.get(roomId);
            if (recording && (recording.recorderId === socket.id || rooms.get(roomId)?.participants.find(p => p.id === socket.id)?.isHost)) {
                recordings.delete(roomId);
                io.to(roomId).emit('recording-stopped', { userId: socket.id });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const participantInfo = activeParticipants.get(socket.id);
            if (participantInfo) {
                const room = rooms.get(participantInfo.roomId);
                if (room) {
                    const index = room.participants.findIndex(p => p.id === socket.id);
                    if (index !== -1) {
                        const isHost = room.participants[index].isHost;
                        const wasScreenSharing = screenShares.get(participantInfo.roomId) === socket.id;
                        const wasRecording = recordings.get(participantInfo.roomId)?.recorderId === socket.id;
                        
                        room.participants.splice(index, 1);
                        
                        if (room.participants.length === 0) {
                            console.log(`Room ${participantInfo.roomId} is empty, cleaning up...`);
                            rooms.delete(participantInfo.roomId);
                            screenShares.delete(participantInfo.roomId);
                            recordings.delete(participantInfo.roomId);
                        } else {
                            if (isHost && room.participants.length > 0) {
                                const newHost = room.participants[0];
                                newHost.isHost = true;
                                io.to(newHost.id).emit('host-privileges-granted');
                                console.log(`New host assigned in room ${participantInfo.roomId}: ${newHost.id}`);
                            }
                            
                            if (wasScreenSharing) {
                                screenShares.delete(participantInfo.roomId);
                                io.to(participantInfo.roomId).emit('screen-share-stopped', { userId: socket.id });
                            }
                            
                            if (wasRecording) {
                                recordings.delete(participantInfo.roomId);
                                io.to(participantInfo.roomId).emit('recording-stopped', { 
                                    userId: socket.id,
                                    reason: 'participant_left'
                                });
                            }
                            
                            if (room.activeSpeaker === socket.id) {
                                room.activeSpeaker = null;
                            }
                            
                            io.to(participantInfo.roomId).emit('user-left', { 
                                userId: socket.id,
                                newHost: isHost ? room.participants[0].id : null,
                                wasScreenSharing,
                                wasRecording
                            });
                        }
                    }
                }
                activeParticipants.delete(socket.id);
            }
        });
    });

    return io;
};

export default initializeSocket;