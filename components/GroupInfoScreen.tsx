

import React, { useState, useEffect, useCallback } from 'react';
import { User, Chat } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { UsersIcon, UserPlusIcon, PencilIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, X } from './icons';
import { ConfirmModal } from './ConfirmModal';
import { Link } from 'react-router-dom';

interface GroupInfoScreenProps {
  chatId: string;
  currentUser: User;
  onBack: () => void;
}

const AddParticipantsView: React.FC<{
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  onParticipantsAdded: (chat: Chat) => void;
}> = ({ chat, currentUser, onBack, onParticipantsAdded }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    api.getAllUsers().then(users => {
      // Exclude users already in the group and the current user
      const existingParticipantIds = new Set(chat.participants.map(p => p.id));
      setAllUsers(users.filter(u => !existingParticipantIds.has(u.id) && !u.isAi));
    });
  }, [chat.participants]);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAddParticipants = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.size > 0) {
        setIsLoading(true);
        const updatedChat = await api.addParticipantToGroup(chat.id, Array.from(selectedUserIds), currentUser.id);
        setIsLoading(false);
        if (updatedChat) {
            onParticipantsAdded(updatedChat);
        }
    }
  };

  return (
    <div className="flex flex-col h-screen absolute inset-0 bg-background z-20 text-foreground">
      <Header title="Add Participants" onBack={onBack} />
      <form onSubmit={handleAddParticipants} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Select People to Add</h3>
            {allUsers.length > 0 ? (
                <ul className="space-y-1">
                    {allUsers.map(user => (
                        <li key={user.id} onClick={() => handleToggleUser(user.id)} className="flex items-center p-3 hover:bg-muted cursor-pointer rounded-lg">
                            <Avatar user={user} size="sm" className="mr-4" />
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                            </div>
                            {selectedUserIds.has(user.id) ? (
                                <CheckCircleIcon className="h-6 w-6 text-primary" />
                            ) : (
                                <div className="h-6 w-6 border-2 border-border rounded-full"></div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-center text-muted-foreground p-8">No other users to add.</p>
            )}
        </div>
        
        <footer className="p-4 border-t border-border bg-background/70 backdrop-blur-lg">
             <button
              type="submit"
              disabled={isLoading || selectedUserIds.size === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : `Add Participants (${selectedUserIds.size} selected)`}
            </button>
        </footer>
      </form>
    </div>
  );
};

const GroupInfoScreen: React.FC<GroupInfoScreenProps> = ({ chatId, currentUser, onBack }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<User | null>(null);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);


  const fetchChatDetails = useCallback(() => {
    api.getChatById(chatId).then(data => {
      setChat(data || null);
      if (data) {
        setEditedName(data.name || '');
      }
    });
  }, [chatId]);

  useEffect(() => {
    fetchChatDetails();
  }, [fetchChatDetails]);

  const handleLeaveGroup = async () => {
    if (chat) {
        setIsConfirmingLeave(true);
    }
  };
  
  const confirmLeaveGroup = async () => {
    if (!chat) return;
    await api.removeParticipantFromGroup(chat.id, currentUser.id, currentUser.id);
    onBack();
  };

  const handleSaveName = async () => {
    if (!chat || !editedName.trim() || editedName.trim() === chat.name) {
      setIsEditingName(false);
      return;
    }
    await api.renameGroupChat(chat.id, editedName.trim(), currentUser.id);
    fetchChatDetails();
    setIsEditingName(false);
  };
  
  const handleRemoveParticipant = (participant: User) => {
    if (chat) {
        setParticipantToRemove(participant);
    }
  };
  
  const confirmRemoveParticipant = async () => {
      if (!chat || !participantToRemove) return;
      const result = await api.removeParticipantFromGroup(chat.id, participantToRemove.id, currentUser.id);
      if (result) {
          fetchChatDetails();
      }
      setParticipantToRemove(null);
  }
  
  if (isAddingParticipants && chat) {
      return <AddParticipantsView 
        chat={chat} 
        currentUser={currentUser} 
        onBack={() => setIsAddingParticipants(false)}
        onParticipantsAdded={() => {
            fetchChatDetails();
            setIsAddingParticipants(false);
        }}
      />
  }

  if (!chat) {
    return (
      <div className="flex flex-col h-full bg-background text-foreground">
        <Header title="Group Info" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading group info...</p>
        </div>
      </div>
    );
  }

  const isCreator = chat.creatorId === currentUser.id;

  return (
    <>
        <ConfirmModal
            isOpen={isConfirmingLeave}
            onClose={() => setIsConfirmingLeave(false)}
            onConfirm={confirmLeaveGroup}
            title="Leave Group"
            description="Are you sure you want to leave this group?"
            confirmText="Leave"
            isDestructive
        />
        <ConfirmModal
            isOpen={!!participantToRemove}
            onClose={() => setParticipantToRemove(null)}
            onConfirm={confirmRemoveParticipant}
            title={`Remove ${participantToRemove?.name || 'member'}`}
            description={`Are you sure you want to remove ${participantToRemove?.name || 'this member'} from the group?`}
            confirmText="Remove"
            isDestructive
        />

        <div className="flex flex-col h-full bg-background text-foreground">
          <Header title="Group Info" onBack={onBack} />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col items-center mb-6">
                {chat.participants[0] && <Avatar user={chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0]} size="xl" />}
                <div className="flex items-center gap-2 mt-4 justify-center">
                    {isEditingName && isCreator ? (
                        <div className="flex items-center gap-2 w-full max-w-sm">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="flex-1 text-2xl font-bold text-foreground bg-secondary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') setIsEditingName(false);
                                }}
                            />
                            <button onClick={handleSaveName} className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-lg text-sm">Save</button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-foreground">{chat.name}</h2>
                            {isCreator && (
                                <button onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-foreground p-1">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                            )}
                        </>
                    )}
                </div>
                <p className="text-muted-foreground">{chat.participants.length} members</p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-card-foreground">
                    <UsersIcon className="w-5 h-5 text-muted-foreground" />
                    <span>Members</span>
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {chat.participants.map(p => (
                        <Link to={`/profile/view/${p.id}`} key={p.id} className="relative flex flex-col items-center text-center group">
                            <Avatar user={p} size="md" />
                            <p className="text-xs mt-1 truncate w-full text-muted-foreground group-hover:text-foreground">{p.id === currentUser.id ? 'You' : p.name.split(' ')[0]}</p>
                            {isCreator && p.id !== currentUser.id && (
                                <button
                                    onClick={(e) => { e.preventDefault(); handleRemoveParticipant(p); }}
                                    className="absolute -top-1 -right-1 bg-destructive rounded-full p-0.5 border-2 border-card text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                    aria-label={`Remove ${p.name}`}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </Link>
                    ))}
                    {isCreator && (
                         <button onClick={() => setIsAddingParticipants(true)} className="flex flex-col items-center justify-center text-center text-muted-foreground hover:text-foreground">
                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                                <UserPlusIcon className="w-6 h-6" />
                            </div>
                            <p className="text-xs mt-1">Add</p>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleLeaveGroup}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-destructive/10 text-destructive font-semibold rounded-lg hover:bg-destructive/20"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Leave Group
                </button>
            </div>

          </main>
        </div>
    </>
  );
};

export default GroupInfoScreen;
