import React, { useState, useRef } from 'react';
import { NewsPost } from '../types';
import { Play, Pause, Eye } from './icons';

const formatViews = (views: number) => {
    if (views > 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
    if (views > 1_000) return `${(views / 1_000).toFixed(1)}K views`;
    return `${views} views`;
};

const NewsPostCard: React.FC<{ post: NewsPost }> = ({ post }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTogglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleVideoClick = () => {
        if(videoRef.current) {
             if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="relative aspect-video bg-black" onClick={handleVideoClick}>
                <video
                    ref={videoRef}
                    src={post.videoUrl}
                    poster={post.thumbnailUrl}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    loop
                />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-white leading-tight">{post.title}</h3>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                    <p className="font-semibold">{post.source}</p>
                    <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{formatViews(post.views)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsPostCard;