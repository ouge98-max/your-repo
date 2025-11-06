import React, { useState, useEffect, useRef } from 'react';
import { User, Chat } from '../types';
import { api } from '../services/mockApi';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar } from './Avatar';
import { PhoneOffIcon, MicrophoneIcon, MicrophoneSlashIcon } from './icons';
import toast from 'react-hot-toast';

interface AudioCallScreenProps {
    currentUser: User;
    onHangUp: (chatId: string, duration: number) => void;
}

const AudioCallScreen: React.FC<AudioCallScreenProps> = ({ currentUser, onHangUp }) => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();

    const [chat, setChat] = useState<Chat | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState('Ringing...');
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const callStartTime = useRef<number>(0);
    const hangUpCalled = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const ringtoneIntervalRef = useRef<number | null>(null);
    const ringtoneNodesRef = useRef<{ o1: OscillatorNode, gain: GainNode }[]>([]);


    const otherParticipant = chat?.participants.find(p => p.id !== currentUser.id);

    // Effect for simulating remote speaker indicator
    useEffect(() => {
        if (callStatus !== 'Connected') {
            setIsSpeaking(false);
            return;
        }

        let speakingTimer: number;

        const simulateConversation = () => {
            const isSpeakingNow = Math.random() > 0.4; // 60% chance of "speaking"
            setIsSpeaking(isSpeakingNow);
            const nextToggle = (isSpeakingNow ? 1000 + Math.random() * 2000 : 500 + Math.random() * 1500); // Speak for longer than pause
            speakingTimer = window.setTimeout(simulateConversation, nextToggle);
        };

        speakingTimer = window.setTimeout(simulateConversation, 500); // Start after a short delay

        return () => clearTimeout(speakingTimer);
    }, [callStatus]);


    useEffect(() => {
        if (!chatId) return;
        
        api.getChatById(chatId).then(setChat);

        let timer: number;
        let streamInstance: MediaStream | null = null;
        let connectTimeout: number;

        // --- Ringtone simulation ---
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        const playRingingTone = () => {
            if (!audioContextRef.current) return;
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            const playRing = () => {
                if (!audioContextRef.current) return;
                const o1 = audioContextRef.current.createOscillator();
                const gain = audioContextRef.current.createGain();
                o1.type = 'sine';
                o1.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
                gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
                o1.connect(gain);
                gain.connect(audioContextRef.current.destination);
                o1.start();
                const nodes = { o1, gain };
                ringtoneNodesRef.current.push(nodes);
                setTimeout(() => {
                    try {
                        nodes.o1.stop();
                        nodes.gain.disconnect();
                        ringtoneNodesRef.current = ringtoneNodesRef.current.filter(n => n !== nodes);
                    } catch(e) {}
                }, 2000); // Ring for 2 seconds
            };
            playRing(); // Initial ring
            ringtoneIntervalRef.current = window.setInterval(playRing, 4000); // Ring every 4 seconds
        };

        const stopRingingTone = () => {
            if (ringtoneIntervalRef.current) clearInterval(ringtoneIntervalRef.current);
            ringtoneIntervalRef.current = null;
            ringtoneNodesRef.current.forEach(nodes => {
                try {
                    nodes.o1.stop();
                    nodes.gain.disconnect();
                } catch(e) {
                    // Ignore errors from stopping nodes that might have already stopped
                }
            });
            ringtoneNodesRef.current = [];
        };

        // --- End Ringtone simulation ---

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                streamInstance = stream;
                setLocalStream(stream);
                
                playRingingTone();

                // Simulate connection after a delay
                connectTimeout = window.setTimeout(() => {
                    if (hangUpCalled.current) return;
                    stopRingingTone();
                    setCallStatus('Connected');
                    callStartTime.current = Date.now();
                    timer = window.setInterval(() => {
                        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
                    }, 1000);
                }, 3500);

            })
            .catch(err => {
                console.error("Error accessing microphone.", err);
                setError("Microphone access denied. Please enable permissions in your browser settings.");
            });

        const handleHangUpCleanup = () => {
             if (!hangUpCalled.current) {
                hangUpCalled.current = true;
                const duration = callStartTime.current > 0 ? Math.floor((Date.now() - callStartTime.current) / 1000) : 0;
                if (chatId) {
                    onHangUp(chatId, duration);
                }
                streamInstance?.getTracks().forEach(track => track.stop());
                stopRingingTone();
            }
        }

        window.addEventListener('beforeunload', handleHangUpCleanup);

        return () => {
            clearTimeout(connectTimeout);
            clearInterval(timer);
            handleHangUpCleanup();
            window.removeEventListener('beforeunload', handleHangUpCleanup);
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [chatId, onHangUp]);

    const handleToggleMute = () => {
        localStream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMuted(!isMuted);
    };

    const handleHangUp = () => {
        if (hangUpCalled.current) return;
        hangUpCalled.current = true;

        const duration = callStartTime.current > 0 ? Math.floor((Date.now() - callStartTime.current) / 1000) : 0;
        if(chatId) {
            onHangUp(chatId, duration);
        }
        localStream?.getTracks().forEach(track => track.stop());
        navigate(-1);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-300 p-4 text-center">
                <h2 className="text-xl font-bold text-red-400 mb-4">Call Failed</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="mt-8 bg-gray-800 px-6 py-3 rounded-lg font-semibold text-white">
                    Back to Chat
                </button>
            </div>
        );
    }

    if (!otherParticipant) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">
                <p>Connecting...</p>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-screen bg-gray-950 text-white flex flex-col items-center justify-between overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-full h-full object-cover blur-2xl scale-125 opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/50"></div>
            </div>
            
            {/* Call Info */}
            <div className="relative z-10 flex flex-col items-center text-center pt-24">
                <div className="relative">
                    <Avatar user={otherParticipant} size="xl" className="h-40 w-40" />
                    <div className={`absolute -inset-2 rounded-full border-4 border-brandGreen-500 transition-opacity duration-300 ${isSpeaking ? 'opacity-50 animate-pulse' : 'opacity-0'}`} />
                </div>
                <h2 className="text-4xl font-bold text-white mt-6" style={{textShadow: '0 2px 6px rgba(0,0,0,0.5)'}}>{otherParticipant.name}</h2>
                <p className="text-lg font-mono tracking-wider text-gray-300 mt-2" style={{textShadow: '0 1px 4px rgba(0,0,0,0.5)'}}>
                    {callStatus === 'Connected' ? formatDuration(callDuration) : callStatus}
                </p>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center justify-center gap-8 p-8">
                <button onClick={handleToggleMute} className="bg-white/10 p-5 rounded-full hover:bg-white/20 transition-colors text-white">
                    {isMuted ? <MicrophoneSlashIcon className="h-7 w-7" /> : <MicrophoneIcon className="h-7 w-7" />}
                </button>
                <button onClick={handleHangUp} className="bg-red-600 p-6 rounded-full hover:bg-red-700 transition-colors text-white">
                    <PhoneOffIcon className="h-8 w-8" />
                </button>
            </div>
        </div>
    );
};

export default AudioCallScreen;