import React, { useState, useRef } from 'react';
import './VideoChat.css';

const VideoRecorder = ({ stream }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const mediaRecorderRef = useRef(null);

    const startRecording = () => {
        if (!stream) return;

        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`control-btn ${isRecording ? 'active' : ''}`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
            <svg viewBox="0 0 24 24">
                {isRecording ? (
                    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                ) : (
                    <circle cx="12" cy="12" r="8" fill="currentColor"/>
                )}
            </svg>
            {isRecording && <span className="recording-indicator"></span>}
        </button>
    );
};

export default VideoRecorder;