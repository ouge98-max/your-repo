import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { useDebounce } from '../utils/hooks';
import { X, UserPlusIcon, Loader2Icon } from './icons';
import { Avatar } from './Avatar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [phone, setPhone] = useState('+880');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const debouncedPhone = useDebounce(phone, 500);

  useEffect(() => {
    if (debouncedPhone.length > 4 && /^\+8801[3-9]\d{8}$/.test(debouncedPhone)) {
      setIsLoading(true);
      setError('');
      api.findUserByPhone(debouncedPhone)
        .then(user => {
          if (user && user.id !== currentUser.id) {
            setSearchedUser(user);
          } else {
            setSearchedUser(null);
            setError('User not found.');
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setSearchedUser(null);
      setError('');
    }
  }, [debouncedPhone, currentUser.id]);
  
  const handleAddContact = async () => {
    if (!searchedUser) return;
    try {
        const chat = await api.getOrCreateChat(currentUser.id, searchedUser.id);
        navigate(`/chats/${chat.id}`);
        onClose();
    } catch (e) {
        toast.error("Could not start chat with user.");
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-popover rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-popover-foreground">Add Contact</h2>
          <button onClick={onClose} className="text-muted-foreground"><X /></button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX" autoFocus
                    className="mt-1 w-full bg-input border border-border rounded-md p-2"
                />
            </div>

            <div className="min-h-[120px] flex items-center justify-center">
                {isLoading ? (
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                ) : searchedUser ? (
                    <div className="w-full flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                        <Avatar user={searchedUser} size="lg" />
                        <p className="font-bold text-lg mt-2 text-foreground">{searchedUser.name}</p>
                        <p className="text-sm text-muted-foreground">{searchedUser.phone}</p>
                        <button onClick={handleAddContact} className="w-full mt-4 bg-primary text-primary-foreground font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                            <UserPlusIcon size={16}/> Message
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{error || 'Enter a valid phone number to find a user.'}</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};