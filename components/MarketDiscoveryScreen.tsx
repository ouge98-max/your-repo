import React from 'react';
import { Header } from './Header';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ShoppingBagIcon } from './icons';
import MarketScreen from './MarketScreen';
import { useCart } from '../contexts/CartContext';

const MarketDiscoveryScreen: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex flex-col h-full bg-gray-950 text-gray-200">
             <button
                onClick={() => navigate('/sell')}
                className="fixed bottom-20 right-4 md:hidden z-20 w-14 h-14 bg-brandGreen-600 rounded-full flex items-center justify-center shadow-lg shadow-brandGreen-500/30 transition-transform hover:scale-105 animate-fab-pop-in"
                aria-label="Sell Item"
            >
                <Plus size={28} className="text-white" />
            </button>
            <Header title="Local Market" onBack={() => navigate('/explore')} rightAction={
                 <div className="flex items-center gap-2">
                    <Link to="/cart" className="relative text-gray-400 p-2 rounded-full hover:bg-white/10" aria-label={`View cart with ${cartItemCount} items`}>
                        <ShoppingBagIcon className="h-6 w-6"/>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => navigate('/sell')} className="hidden md:flex items-center gap-2 bg-brandGreen-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                        <Plus size={18} /> Sell Item
                    </button>
                 </div>
            } />
            <main className="flex-1 overflow-y-auto p-4">
                <MarketScreen />
            </main>
        </div>
    )
};

export default MarketDiscoveryScreen;