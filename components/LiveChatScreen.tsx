import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { X, MicrophoneIcon as Mic, PhoneOffIcon as PhoneOff, Loader2Icon as Loader } from './icons';
import { hapticFeedback } from '../utils/interaction';
import toast from 'react-hot-toast';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
type TranscriptItem = { speaker: 'user' | 'model', text: string, id: number };

const LiveChatScreen: React.FC = () => {
    const navigate = useNavigate();
    const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
    
    // Refs for session and audio management
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');
    const transcriptIdCounter = useRef(0);

    const endSession = useCallback(async () => {
        setConnectionState('closed');
        hapticFeedback();

        // Stop microphone stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Disconnect script processor
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        // Close audio contexts
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }

        // Stop any playing audio
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        // Close the session
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
            sessionPromiseRef.current = null;
        }
    }, []);

    const startSession = useCallback(async () => {
        setConnectionState('connecting');
        hapticFeedback();

        // Initialize audio contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState('connected');
                        if (!inputAudioContextRef.current) return;
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAIBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle audio output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        // Handle transcription
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            // FIX: Resolved type error by creating a new array of TranscriptItem and conditionally adding non-empty transcripts.
                            const newItems: TranscriptItem[] = [];
                            if (currentInputTranscription.current.trim() !== '') {
                                newItems.push({
                                    speaker: 'user',
                                    text: currentInputTranscription.current,
                                    id: transcriptIdCounter.current++
                                });
                            }
                            if (currentOutputTranscription.current.trim() !== '') {
                                newItems.push({
                                    speaker: 'model',
                                    text: currentOutputTranscription.current,
                                    id: transcriptIdCounter.current++
                                });
                            }
                            if (newItems.length > 0) {
                                setTranscripts(prev => [...prev, ...newItems]);
                            }
                            currentInputTranscription.current = '';
                            currentOutputTranscription.current = '';
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setConnectionState('error');
                        endSession();
                    },
                    onclose: () => {
                        if (connectionState !== 'closed') { // Avoid redundant state set if closed manually
                           endSession();
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    systemInstruction: 'You are Ouma-Ge AI, a friendly and helpful assistant. Keep your responses concise.',
                },
            });

        } catch (e) {
            console.error('Failed to start live session:', e);
            setConnectionState('error');
            toast.error("Could not access microphone.");
            endSession();
        }
    }, [endSession, connectionState]);

    useEffect(() => {
        // Scroll to bottom when transcripts update
        transcriptContainerRef.current?.scrollTo({
            top: transcriptContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [transcripts]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            endSession();
        };
    }, [endSession]);

    return (
        <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col animate-fade-in text-white">
            <header className="p-4 flex items-center justify-between h-16 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Ouma-Ge AI" className="h-8 w-8" />
                    <h1 className="text-xl font-bold">Live Assistant</h1>
                </div>
                <button onClick={() => connectionState === 'idle' ? navigate(-1) : endSession()} aria-label="Close" className="p-2 rounded-full hover:bg-white/10">
                    <X className="h-6 w-6" />
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {connectionState === 'idle' && (
                    <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <p className="max-w-xs text-gray-300">Tap the microphone to start a real-time conversation with Ouma-Ge AI.</p>
                    </div>
                )}

                {(connectionState === 'connecting' || connectionState === 'connected') && (
                    <div ref={transcriptContainerRef} className="w-full max-w-md h-full overflow-y-auto space-y-4 text-left">
                        {transcripts.map(item => (
                            <div key={item.id} className={`p-3 rounded-lg ${item.speaker === 'user' ? 'bg-gray-700 text-gray-200' : 'bg-brandGreen-800/50 text-brandGreen-200'}`}>
                                <p className="font-semibold text-xs mb-1 capitalize">{item.speaker}</p>
                                <p>{item.text}</p>
                            </div>
                        ))}
                    </div>
                )}
                {connectionState === 'error' && (
                     <div className="flex flex-col items-center gap-4 animate-fade-in">
                        <p className="max-w-xs text-red-400">Connection failed. Please check your microphone permissions and try again.</p>
                    </div>
                )}
            </main>

            <footer className="p-8 flex-shrink-0 flex items-center justify-center">
                {connectionState === 'idle' && (
                    <button onClick={startSession} className="w-20 h-20 bg-brandGreen-600 rounded-full flex items-center justify-center shadow-lg hover:bg-brandGreen-700">
                        <Mic className="h-8 w-8 text-white" />
                    </button>
                )}
                {connectionState === 'connecting' && (
                    <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <Loader className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
                 {connectionState === 'connected' && (
                    <button onClick={endSession} className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700">
                        <PhoneOff className="h-8 w-8 text-white" />
                    </button>
                )}
                {(connectionState === 'error' || connectionState === 'closed') && (
                    <button onClick={() => navigate(-1)} className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700">
                        <X className="h-8 w-8 text-white" />
                    </button>
                )}
            </footer>
        </div>
    );
};

export default LiveChatScreen;