import React from 'react';
import { AiServiceRequestData } from '../types';
import { MegaphoneIcon } from './icons';

interface AiServiceRequestCardProps {
    request: AiServiceRequestData;
    onConfirm: (request: AiServiceRequestData) => void;
    onCancel: (request: AiServiceRequestData) => void;
}

export const AiServiceRequestCard: React.FC<AiServiceRequestCardProps> = ({ request, onConfirm, onCancel }) => {
    const { title, description, category, budget, status } = request;
    const isPending = status === 'pending';

    return (
        <div className="bg-gray-800 p-4 rounded-2xl max-w-sm w-full space-y-3 border border-indigo-500/30 shadow-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-full">
                    <MegaphoneIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white">Confirm Service Request</h3>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg space-y-2 text-sm">
                <p><strong className="text-gray-400">Title:</strong> <span className="text-gray-200">{title}</span></p>
                <p><strong className="text-gray-400">Category:</strong> <span className="text-gray-200">{category}</span></p>
                {budget && <p><strong className="text-gray-400">Budget:</strong> <span className="text-gray-200">{budget}</span></p>}
                <p><strong className="text-gray-400">Description:</strong> <span className="text-gray-200 line-clamp-2">{description}</span></p>
            </div>

            {isPending ? (
                <div className="flex gap-2">
                    <button onClick={() => onCancel(request)} className="w-full bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500">Cancel</button>
                    <button onClick={() => onConfirm(request)} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">
                        Post Request
                    </button>
                </div>
            ) : (
                <p className="text-center text-sm font-semibold text-gray-400 italic">
                    {status === 'confirmed' ? 'Request has been posted.' : 'Request cancelled.'}
                </p>
            )}
        </div>
    );
};