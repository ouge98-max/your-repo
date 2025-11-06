import React, { useState, useEffect } from 'react';
import { NewsPost } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import NewsPostCard from './NewsPostCard';
import { Loader2Icon } from './icons';

const NewsScreen: React.FC = () => {
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.getNewsPosts()
            .then(setPosts)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-950">
            <Header title="OumaGe News" onBack={() => navigate('/explore')} />
            <main className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2Icon className="h-8 w-8 animate-spin text-brandGreen-400" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <NewsPostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default NewsScreen;