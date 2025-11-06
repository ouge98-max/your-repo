import React, { useState } from 'react';
import { User, ServiceRequest } from '../types';
import { api } from '../services/mockApi';
import { StarIcon } from './icons';
import { Avatar } from './Avatar';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceRequest: ServiceRequest;
    currentUser: User;
    userToReview: User;
    onSubmit: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, serviceRequest, currentUser, userToReview, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        setIsSubmitting(true);
        await api.submitReview({
            reviewForId: userToReview.id,
            serviceRequestId: serviceRequest.id,
            rating,
            text,
        });
        setIsSubmitting(false);
        onSubmit();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold text-center text-white mb-2">Leave a Review</h2>
                    <div className="flex flex-col items-center text-center">
                        <Avatar user={userToReview} size="lg" className="my-3"/>
                        <p className="text-gray-300">How was your experience with <span className="font-semibold text-white">{userToReview.name}</span>?</p>
                    </div>
                    
                    <div className="flex justify-center my-4">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                                <button
                                    type="button"
                                    key={starValue}
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHoverRating(starValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    aria-label={`Rate ${starValue} stars`}
                                >
                                    <StarIcon
                                        className={`h-8 w-8 cursor-pointer ${(hoverRating || rating) >= starValue ? 'text-yellow-400' : 'text-gray-600'}`}
                                        fill={(hoverRating || rating) >= starValue ? 'currentColor' : 'none'}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    <textarea
                        value={text} onChange={e => setText(e.target.value)} rows={4}
                        className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="Share details of your experience..."
                    />

                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={onClose} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isSubmitting || rating === 0} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700 disabled:opacity-50">
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};