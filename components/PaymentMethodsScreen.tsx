import React, { useState, useRef, useEffect } from 'react';
import { MediaBubble } from './MediaBubble';
import { User, CreditCard, LinkedAccount } from '../types';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Trash2, PlusCircleIcon as PlusCircle, StarIcon } from './icons';
import { ConfirmModal } from './ConfirmModal';
import { api } from '../services/mockApi';
import toast from 'react-hot-toast';

interface PaymentMethodsScreenProps {
  user: User;
  onUpdate: () => void;
}

const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({ user, onUpdate }) => {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    const [accountToUnlink, setAccountToUnlink] = useState<LinkedAccount | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteCard = async () => {
        if (!cardToDelete) return;
        toast.loading('Removing card...', { id: 'delete-card' });
        const success = await api.deleteCreditCard(user.id, cardToDelete.id);
        if (success) {
            toast.success('Card removed', { id: 'delete-card' });
            onUpdate();
        } else {
            toast.error('Failed to remove card', { id: 'delete-card' });
        }
        setCardToDelete(null);
    };

    const handleUnlinkAccount = async () => {
        if (!accountToUnlink) return;
        toast.loading('Unlinking account...', { id: 'unlink-account' });
        const success = await api.unlinkAccount(user.id, accountToUnlink.id);
        if (success) {
            toast.success('Account unlinked', { id: 'unlink-account' });
            onUpdate();
        } else {
            toast.error('Failed to unlink account', { id: 'unlink-account' });
        }
        setAccountToUnlink(null);
    };

    const handleSetDefault = async (accountId: string) => {
        setOpenMenuId(null);
        toast.loading('Setting as default...', { id: 'set-default' });
        const updatedUser = await api.setAsDefaultAccount(user.id, accountId);
        if (updatedUser) {
            toast.success('Default account updated.', { id: 'set-default' });
            onUpdate();
        } else {
            toast.error('Failed to set default account.', { id: 'set-default' });
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={!!cardToDelete}
                onClose={() => setCardToDelete(null)}
                onConfirm={handleDeleteCard}
                title="Remove Card"
                description={`Are you sure you want to remove your ${cardToDelete?.brand} card ending in ${cardToDelete?.last4}?`}
                confirmText="Remove"
                isDestructive
            />
            <ConfirmModal
                isOpen={!!accountToUnlink}
                onClose={() => setAccountToUnlink(null)}
                onConfirm={handleUnlinkAccount}
                title="Unlink Account"
                description={`Are you sure you want to unlink your ${accountToUnlink?.name} account?`}
                confirmText="Unlink"
                isDestructive
            />
            <div className="flex flex-col h-full bg-background text-foreground">
                <Header title="Payment Methods" onBack={() => navigate(-1)} rightAction={
                    <button onClick={() => navigate('/me/add-payment-method')} className="p-2 text-primary hover:bg-muted rounded-full">
                        <PlusCircle size={24} />
                    </button>
                } />
                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Linked Accounts */}
                    <div>
                        <h3 className="font-semibold text-foreground px-2 mb-2">Linked Accounts</h3>
                        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 space-y-3">
                            {(user.linkedAccounts && user.linkedAccounts.length > 0) ? user.linkedAccounts.map(acc => (
                                <div key={acc.id} className="flex items-center gap-3">
                                    <MediaBubble
                                      src={acc.logoUrl}
                                      alt={acc.name}
                                      type="image"
                                      size={40}
                                      fit="contain"
                                      style={{ backgroundColor: '#ffffff', padding: '4px' }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-card-foreground flex items-center gap-2">
                                            {acc.name}
                                            {acc.isDefault && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Default</span>}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{acc.number || acc.email}</p>
                                    </div>
                                    <div className="relative">
                                        <button onClick={() => setOpenMenuId(acc.id)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><MoreVertical size={20} /></button>
                                        {openMenuId === acc.id && (
                                            <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-popover rounded-md shadow-lg z-10 border border-border divide-y divide-border">
                                                {!acc.isDefault && (
                                                    <button onClick={() => handleSetDefault(acc.id)} className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"><StarIcon size={14}/> Set as Default</button>
                                                )}
                                                <button onClick={() => { setAccountToUnlink(acc); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 size={14}/> Unlink</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-muted-foreground text-sm text-center py-4">No linked accounts.</p>}
                        </div>
                    </div>

                    {/* Saved Cards */}
                    <div>
                        <h3 className="font-semibold text-foreground px-2 mb-2">Saved Cards</h3>
                        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 space-y-3">
                            {(user.creditCards && user.creditCards.length > 0) ? user.creditCards.map(card => (
                                <div key={card.id} className="flex items-center gap-3">
                                    <img src={card.brand === 'visa' ? 'https://i.imgur.com/gTUMp3A.png' : 'https://i.imgur.com/MAuz2i7.png'} alt={card.brand} className="h-8 object-contain" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-card-foreground capitalize">{card.brand} Card</p>
                                        <p className="text-sm text-muted-foreground">•••• {card.last4}</p>
                                    </div>
                                    <div className="relative">
                                        <button onClick={() => setOpenMenuId(card.id)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><MoreVertical size={20} /></button>
                                        {openMenuId === card.id && (
                                            <div ref={menuRef} className="absolute right-0 top-full mt-1 w-32 bg-popover rounded-md shadow-lg z-10 border border-border">
                                                <button onClick={() => { setCardToDelete(card); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 size={14}/> Remove</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-muted-foreground text-sm text-center py-4">No saved cards.</p>}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default PaymentMethodsScreen;