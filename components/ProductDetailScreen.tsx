

import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingBagIcon, MapPinIcon, GiftIcon } from './icons';
import { Avatar } from './Avatar';
import toast from 'react-hot-toast';
import { GoogleMap } from './GoogleMap';
import { useCart } from '../contexts/CartContext';
import { ConfirmDeliveryModal } from './ConfirmDeliveryModal';
import { getCurrencySymbol } from '../utils/currency';

interface ProductDetailScreenProps {
    currentUser: User;
    onBack: () => void;
    usersMap: Map<string, User>;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ currentUser, onBack, usersMap }) => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        if (!productId) {
            setIsLoading(false);
            return;
        }
        api.getProductById(productId)
            .then(data => {
                if (data) {
                    setProduct(data);
                    setSeller(usersMap.get(data.sellerId) || null);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load product:", err);
                toast.error("Could not load product details.");
                setIsLoading(false);
            });
    }, [productId, usersMap]);
    
    const handleAddToCart = () => {
        if (currentUser.id === seller?.id) {
            toast.error("You cannot buy your own item.");
            return;
        }
        if (product) {
            setIsDeliveryModalOpen(true);
        }
    };

    const handleConfirmDeliveryAndAddToCart = (address: string) => {
        if (product) {
            addToCart(product.id, address);
            toast.success(`${product.name} added to cart!`);
            setIsDeliveryModalOpen(false);
        }
    };
    
    const handleSendAsGift = () => {
        if (!product || isOwnProduct) {
            toast.error("You cannot gift your own item.");
            return;
        }
        navigate('/send', { state: { purpose: 'gift', productId: product.id } });
    };


    if (isLoading) {
        return <div className="flex flex-col h-screen"><Header title="Loading..." onBack={onBack} /><p className="text-center text-gray-400 p-4">Loading item...</p></div>;
    }

    if (!product || !seller) {
        return <div className="flex flex-col h-screen"><Header title="Not Found" onBack={onBack} /><p className="text-center text-red-400 p-4">Item not found.</p></div>;
    }
    
    const isOwnProduct = currentUser.id === seller.id;

    return (
        <>
        <ConfirmDeliveryModal
            isOpen={isDeliveryModalOpen}
            onClose={() => setIsDeliveryModalOpen(false)}
            onConfirm={handleConfirmDeliveryAndAddToCart}
        />
        <div className="flex flex-col h-screen">
            <Header title="Marketplace" onBack={onBack} />
            <main className="flex-1 overflow-y-auto pb-24">
                <img src={product.imageUrl} alt={product.name} className="w-full h-80 object-cover" />
                
                <div className="p-4 border-b border-white/10">
                    <p className="text-sm text-gray-400">{product.category}</p>
                    <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                    <p className="text-3xl font-bold text-brandGreen-400 mt-2">{getCurrencySymbol('BDT')}{product.price.toLocaleString('en-IN')}</p>
                </div>
                
                {product.location && (
                    <div className="py-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3 px-4">Location</h3>
                        <div className="relative h-64 w-full bg-gray-800">
                             <GoogleMap 
                                center={{ lat: product.location.latitude, lng: product.location.longitude }}
                                zoom={15}
                                markers={[{ id: product.id, lat: product.location.latitude, lng: product.location.longitude }]}
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none">
                                <div className="flex items-start gap-3 text-gray-200" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
                                    <MapPinIcon className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                                    <span className="font-semibold">{product.location.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{product.description}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Seller</h3>
                        <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-lg border border-white/10">
                            <Avatar user={seller} />
                            <div>
                                <p className="font-semibold text-white">{seller.name}</p>
                                <p className="text-xs text-gray-500">{isOwnProduct ? 'This is you' : 'View Profile'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {!isOwnProduct && (
                 <footer className="fixed bottom-0 left-0 right-0 md:relative bg-gray-950/80 backdrop-blur-lg border-t border-white/10 p-4">
                    <div className="max-w-md mx-auto flex gap-3">
                         <button onClick={handleSendAsGift} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700">
                            <GiftIcon className="h-5 w-5" /> Send as Gift
                        </button>
                        <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700">
                            <ShoppingBagIcon className="h-5 w-5" /> Add to Cart
                        </button>
                    </div>
                </footer>
            )}
        </div>
        </>
    );
};

export default ProductDetailScreen;