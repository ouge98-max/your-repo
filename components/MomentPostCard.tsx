
import React, { useState, useRef } from 'react';
import { MomentPost, User, Comment } from '../types';
import { Avatar } from './Avatar';
import { api } from '../services/mockApi';
import { Heart, MessageCircle, PaperAirplaneIcon } from './icons';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const ImageCarousel: React.FC<{ imageUrls: string[] }> = ({ imageUrls }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const width = scrollRef.current.clientWidth;
            setCurrentIndex(Math.round(scrollLeft / width));
        }
    };

    return (
        <div className="relative">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {imageUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Moment post ${index + 1}`} className="w-full h-auto object-cover snap-center flex-shrink-0" />
                ))}
            </div>
            {imageUrls.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageUrls.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                </div>
            )}
        </div>
    );
};

const MomentPostCard: React.FC<{ post: MomentPost; currentUser: User; onUpdate: () => void; }> = ({ post, currentUser, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [optimisticLikes, setOptimisticLikes] = useState(post.likes);
    const [optimisticIsLiked, setOptimisticIsLiked] = useState(post.isLiked);

    const handleLike = async () => {
        const newIsLiked = !optimisticIsLiked;
        const newLikes = optimisticLikes + (newIsLiked ? 1 : -1);
        
        // Stash original state for potential rollback
        const originalIsLiked = optimisticIsLiked;
        const originalLikes = optimisticLikes;

        setOptimisticIsLiked(newIsLiked);
        setOptimisticLikes(newLikes);
        
        try {
            await api.likeMoment(post.id, newIsLiked);
        } catch (error) {
            console.error("Failed to update like:", error);
            toast.error("Couldn't update like status.");
            // Revert on error
            setOptimisticIsLiked(originalIsLiked);
            setOptimisticLikes(originalLikes);
        }
    };
    
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const newCommentData = await api.addCommentToMoment(post.id, currentUser.id, newComment.trim());
            if (newCommentData) {
                setNewComment('');
                onUpdate(); // Refetch to show the new comment
            } else {
                throw new Error("API returned null");
            }
        } catch (error) {
            console.error('Failed to post comment', error);
            toast.error("Failed to post comment.");
        } finally {
            setIsSubmittingComment(false);
        }
    }
    
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
            <div className="p-4">
                <Link to={`/profile/view/${post.author.id}`} className="flex items-center gap-3 group">
                    <Avatar user={post.author} size="sm" />
                    <div>
                        <p className="font-bold text-white group-hover:underline">{post.author.name}</p>
                        <p className="text-xs text-gray-400">{timeAgo(post.timestamp)}</p>
                    </div>
                </Link>
                <p className="text-gray-300 my-4 whitespace-pre-wrap">{post.text}</p>
            </div>

            {post.videoUrl && (
                <div className="bg-black">
                    <video src={post.videoUrl} controls className="w-full h-auto max-h-[70vh]" />
                </div>
            )}

            {post.imageUrls && post.imageUrls.length > 0 && !post.videoUrl && (
                <ImageCarousel imageUrls={post.imageUrls} />
            )}
            
            <div className="p-4">
                <div className="flex items-center gap-6 text-gray-400">
                    <button onClick={handleLike} className="flex items-center gap-2 hover:text-red-500 transition-colors">
                        <Heart size={20} className={optimisticIsLiked ? 'text-red-500 fill-current' : ''} />
                        <span className="text-sm font-semibold">{optimisticLikes}</span>
                    </button>
                     <div className="flex items-center gap-2">
                        <MessageCircle size={20} />
                        <span className="text-sm font-semibold">{post.comments.length}</span>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 px-4 py-3">
                {post.comments.map((comment, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                        <Avatar user={comment.user} size="sm" className="h-8 w-8 mt-1" />
                        <div className="bg-gray-800 rounded-lg px-3 py-2">
                            <p className="text-sm font-bold text-gray-200">{comment.user.name}</p>
                            <p className="text-sm text-gray-300">{comment.text}</p>
                        </div>
                    </div>
                ))}
                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-4">
                    <Avatar user={currentUser} size="sm" className="h-8 w-8" />
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                    />
                    <button type="submit" disabled={isSubmittingComment} className="text-brandGreen-400 p-2 rounded-full hover:bg-white/10 disabled:opacity-50">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MomentPostCard;
