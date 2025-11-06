import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { ImageIcon, X } from './icons';
import UploadProgressModal from './UploadProgressModal';
import toast from 'react-hot-toast';

interface SellItemScreenProps {
    currentUser: User;
    onBack: () => void;
}

const SellItemScreen: React.FC<SellItemScreenProps> = ({ currentUser, onBack }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !image || isPosting) return;

        setIsPosting(true);
        toast.loading('Listing your item...');

        await api.listProduct({
            name,
            description,
            price: parseFloat(price),
            imageUrl: image,
            category: 'General', // Mock category
            sellerId: currentUser.id,
        });
        
        toast.dismiss();
        toast.success('Item listed successfully!');
        setIsPosting(false);
        navigate('/explore');
    };

    const canPost = name.trim() && price.trim() && image;

    return (
        <div className="flex flex-col h-screen">
            <Header 
                title="List an Item" 
                onBack={onBack}
                rightAction={
                    <button 
                        onClick={handleSubmit} 
                        disabled={!canPost || isPosting}
                        className="bg-brandGreen-500 text-black font-bold py-1.5 px-4 rounded-full disabled:opacity-50 text-sm"
                    >
                        {isPosting ? 'Listing...' : 'List Item'}
                    </button>
                }
            />
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                    <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} required={!image}/>
                    <div className="mt-1 flex justify-center p-2 border-2 border-white/20 border-dashed rounded-md bg-black/10 min-h-[160px] items-center">
                        {image ? (
                           <div className="relative">
                                <img src={image} alt="Preview" className="mx-auto h-32 w-auto rounded-md object-contain" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setImage(null); }}
                                    className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 border-2 border-gray-950 hover:bg-red-500"
                                    aria-label="Remove image"
                                >
                                    <X size={14}/>
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="image-upload" className="space-y-1 text-center cursor-pointer p-4">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                                <p className="text-sm text-gray-400">Click to upload an image</p>
                            </label>
                        )}
                    </div>
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Item Name</label>
                    <input
                        type="text" id="name" value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full bg-white/5 text-white px-3 py-2 border border-white/20 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="e.g., Vintage Leather Watch" required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                        id="description" value={description}
                        onChange={(e) => setDescription(e.target.value)} rows={4}
                        className="mt-1 block w-full bg-white/5 text-white px-3 py-2 border border-white/20 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="Describe your item..."
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (BDT)</label>
                    <input
                        type="number" id="price" value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full bg-white/5 text-white px-3 py-2 border border-white/20 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="0.00" required
                    />
                </div>
            </form>
        </div>
    );
};

export default SellItemScreen;