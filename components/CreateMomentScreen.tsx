
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { ImageIcon, X, VideoIcon } from './icons';
import UploadProgressModal from './UploadProgressModal';

const CreateMomentScreen: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [video, setVideo] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const imagePromises = filesArray.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file as Blob);
                });
            });

            Promise.all(imagePromises).then(newImages => {
                setImages(prevImages => [...prevImages, ...newImages]);
            });
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideo(reader.result as string);
            };
            reader.readAsDataURL(file as Blob);
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeVideo = () => {
        setVideo(null);
    };

    const handlePost = async () => {
        if (!text.trim() && images.length === 0 && !video) return;
        setIsPosting(true);
        // Simulate upload and processing time
        // The UploadProgressModal handles its own timing
        // When it completes, it will call the onComplete handler
    };

    const onPostComplete = async () => {
        await api.createMoment(currentUser.id, text, images, video || undefined);
        setIsPosting(false);
        navigate('/explore/moments');
    };

    const canPost = text.trim().length > 0 || images.length > 0 || !!video;

    return (
        <>
            {isPosting && <UploadProgressModal onComplete={onPostComplete} />}
            <div className="flex flex-col h-screen bg-gray-950">
                <Header 
                    title="New Moment" 
                    onBack={() => navigate('/explore/moments')}
                    rightAction={
                        <button 
                            onClick={handlePost} 
                            disabled={!canPost || isPosting}
                            className="bg-brandGreen-600 text-white font-bold py-1.5 px-4 rounded-full disabled:opacity-50 text-sm"
                        >
                            Post
                        </button>
                    }
                />
                <main className="flex-1 overflow-y-auto p-4 flex flex-col">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full flex-1 bg-transparent text-gray-200 text-lg focus:outline-none resize-none"
                    />
                    {video && (
                        <div className="mt-4 relative">
                            <video src={video} controls className="rounded-lg w-full" />
                            <button onClick={removeVideo} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5">
                                <X size={14}/>
                            </button>
                        </div>
                    )}
                    {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img src={image} alt={`Preview ${index}`} className="rounded-lg h-24 w-full object-cover"/>
                                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5">
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-white/10 p-2 flex items-center gap-2">
                    <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} multiple disabled={!!video} />
                    <label htmlFor="image-upload" className={`text-gray-400 p-3 rounded-full hover:bg-white/10 ${!!video ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <ImageIcon className="h-6 w-6" />
                    </label>
                    <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={images.length > 0} />
                    <label htmlFor="video-upload" className={`text-gray-400 p-3 rounded-full hover:bg-white/10 ${images.length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <VideoIcon className="h-6 w-6" />
                    </label>
                </footer>
            </div>
        </>
    );
};

export default CreateMomentScreen;
