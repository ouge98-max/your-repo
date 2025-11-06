import React, { useState } from 'react';
import { api } from '../services/mockApi';

interface MakeOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceRequestId: string;
    providerId: string;
    onSubmit: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ isOpen, onClose, serviceRequestId, providerId, onSubmit }) => {
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || parseFloat(price) <= 0) {
            alert('Please enter a valid price.');
            return;
        }
        setIsSubmitting(true);
        await api.createOffer({
            serviceRequestId,
            providerId,
            price: parseFloat(price),
            message,
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
                    <h2 className="text-xl font-bold text-center text-white mb-4">Make an Offer</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Your Price (BDT)</label>
                            <input
                                id="price" type="number" value={price} onChange={e => setPrice(e.target.value)}
                                className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                                placeholder="e.g., 5000" required autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message (Optional)</label>
                             <textarea
                                id="message" value={message} onChange={e => setMessage(e.target.value)} rows={3}
                                className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                                placeholder="Add a short message to the client..."
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button type="button" onClick={onClose} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700 disabled:opacity-50">
                            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
