import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MomentPost, User } from '../types';
import { api } from '../services/mockApi';
import MomentPostCard from './MomentPostCard';
import toast from 'react-hot-toast';
import { Loader2Icon } from './icons';

interface MomentsScreenProps {
    currentUser: User;
}

const MomentsScreen: React.FC<MomentsScreenProps> = ({ currentUser }) => {
    const [moments, setMoments] = useState<MomentPost[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastMomentElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        setLoading(true);
        setError(false);
        api.getMoments(page, 5)
            .then(data => {
                // Prevent duplicates when refetching
                setMoments(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newPosts = data.posts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newPosts];
                });
                setHasMore(data.hasMore);
            })
            .catch(err => {
                setError(true);
                console.error("Failed to load moments:", err);
                toast.error("Could not load moments.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page]);

    const refreshMoments = useCallback(() => {
        setPage(1);
        setMoments([]);
        setHasMore(true);
    }, []);

    const isInitialLoad = loading && moments.length === 0;

    return (
        <div className="space-y-4 animate-fade-in-up">
            {isInitialLoad ? (
                <div className="flex justify-center p-8">
                    <Loader2Icon className="h-8 w-8 animate-spin text-brandGreen-400" />
                </div>
            ) : moments.length > 0 ? (
                moments.map((post, index) => (
                    <div ref={moments.length === index + 1 ? lastMomentElementRef : null} key={post.id}>
                        <MomentPostCard post={post} currentUser={currentUser} onUpdate={refreshMoments} />
                    </div>
                ))
            ) : (
                !loading && !error && <p className="text-center text-gray-500 p-4">No moments to show yet.</p>
            )}

            {loading && !isInitialLoad && (
                <div className="flex justify-center p-4">
                    <Loader2Icon className="h-8 w-8 animate-spin text-brandGreen-400" />
                </div>
            )}

            {!loading && !hasMore && moments.length > 0 && (
                <p className="text-center text-gray-500 p-4">You've reached the end!</p>
            )}

            {error && (
                <div className="text-center text-red-500 p-4">
                    <p>Something went wrong.</p>
                    <button onClick={refreshMoments} className="mt-2 text-brandGreen-400 font-semibold">Try again</button>
                </div>
            )}
        </div>
    );
};

export default MomentsScreen;
