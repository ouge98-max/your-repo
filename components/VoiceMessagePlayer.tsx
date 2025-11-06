import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from './icons';

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export const VoiceMessagePlayer: React.FC<{ audioUrl: string; duration: number }> = ({ audioUrl, duration }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const remainingTime = duration - currentTime;

    return (
        <div className="flex items-center gap-3 w-60">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <button onClick={togglePlay} className="p-2 bg-primary text-primary-foreground rounded-full flex-shrink-0">
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                {isPlaying && remainingTime > 0 ? formatDuration(remainingTime) : formatDuration(duration)}
            </span>
        </div>
    );
};

export default VoiceMessagePlayer;
