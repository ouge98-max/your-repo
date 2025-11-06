import React, { useState } from 'react';
import { User, DDListing } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { ImageIcon, X } from './icons';
import toast from 'react-hot-toast';

const CreateDDListingScreen: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<DDListing['category']>('Goods');
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
        if (!title || !price || !image) {
            toast.error("Please fill all required fields and add an image.");
            return;
        }

        setIsPosting(true);
        try {
            await api.createDDListing({
                title,
                description,
                price,
                category,
                imageUrl: image,
                sellerId: currentUser.id,
            });
            toast.success('Listing created successfully!');
            navigate('/explore/dd');
        } catch (error) {
            toast.error('Failed to create listing.');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white">
            <Header 
                title="New Listing" 
                onBack={() => navigate(-1)} 
                rightAction={
                    <button form="listing-form" type="submit" disabled={isPosting} className="font-semibold text-primary disabled:opacity-50">
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                }
            />
            <form id="listing-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                    <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} required={!image}/>
                    <div className="mt-1 flex justify-center p-2 border-2 border-white/20 border-dashed rounded-md bg-black/10 min-h-[160px] items-center">
                        {image ? (
                           <div className="relative">
                                <img src={image} alt="Preview" className="mx-auto h-32 w-auto rounded-md object-contain" />
                                <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 border-2 border-gray-950 hover:bg-red-500" aria-label="Remove image">
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
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-gray-800 px-3 py-2 border border-gray-600 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-gray-800 px-3 py-2 border border-gray-600 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price</label>
                        <input type="text" id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 500 or Inquire" className="mt-1 block w-full bg-gray-800 px-3 py-2 border border-gray-600 rounded-md" required />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className="mt-1 block w-full bg-gray-800 px-3 py-2 border border-gray-600 rounded-md">
                            <option>Goods</option>
                            <option>Delivery</option>
                            <option>Service</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateDDListingScreen;