import React, { useState } from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Plus } from './icons';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';
import { ConfirmDeliveryModal } from './ConfirmDeliveryModal';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void; }> = ({ product, onAddToCart }) => {

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(product);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-shadow relative">
            <Link to={`/product/${product.id}`}>
                <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                <div className="p-3">
                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-brandGreen-400 font-bold mt-1">{getCurrencySymbol('BDT')}{product.price.toLocaleString('en-IN')}</p>
                </div>
            </Link>
            <button 
                onClick={handleAddToCartClick}
                aria-label={`Add ${product.name} to cart`}
                className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brandGreen-600"
            >
                <Plus size={18} />
            </button>
        </div>
    );
};

const MarketGridView: React.FC<{ products: Product[] }> = ({ products }) => {
    const [productToAdd, setProductToAdd] = useState<Product | null>(null);
    const { cartItems, addToCart } = useCart();

    const handleAddToCart = (product: Product) => {
        const itemInCart = cartItems.find(item => item.productId === product.id);
        if (itemInCart && itemInCart.deliveryAddress) {
            addToCart(product.id);
            toast.success(`${product.name} added to cart!`);
        } else {
            setProductToAdd(product);
        }
    };

    const handleConfirmDelivery = (address: string) => {
        if (productToAdd) {
            addToCart(productToAdd.id, address);
            toast.success(`${productToAdd.name} added to cart!`);
        }
        setProductToAdd(null);
    };
    
    if (products.length === 0) {
        return <p className="text-center text-gray-500 p-8">No items match your search.</p>
    }

    return (
        <>
            <ConfirmDeliveryModal 
                isOpen={!!productToAdd}
                onClose={() => setProductToAdd(null)}
                onConfirm={handleConfirmDelivery}
            />
            <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
            </div>
        </>
    );
};

export default MarketGridView;
