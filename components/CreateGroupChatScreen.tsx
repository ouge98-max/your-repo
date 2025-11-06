import React, { useState, useEffect } from 'react';
import { User, Chat } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { CheckCircleIcon } from './icons';

interface CreateGroupChatScreenProps {
  currentUser: User;
  onBack: () => void;
  onGroupCreated: (chat: Chat) => void;
}

const CreateGroupChatScreen: React.FC<CreateGroupChatScreenProps> = ({ currentUser, onBack, onGroupCreated }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set([currentUser.id]));
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    api.getAllUsers().then(users => {
        // Exclude the current user from the list of selectable users
        setAllUsers(users.filter(u => u.id !== currentUser.id));
    });
  }, [currentUser.id]);

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

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedUserIds.size > 1) {
        setIsLoading(true);
        const newChat = await api.createGroupChat(currentUser.id, Array.from(selectedUserIds), groupName.trim());
        setIsLoading(false);
        onGroupCreated(newChat);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header title="Create Group" onBack={onBack} />
      <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border">
          <label htmlFor="groupName" className="sr-only">Group Name</label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="w-full text-lg px-4 py-3 bg-secondary text-secondary-foreground backdrop-blur-xl border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">Select Participants</h3>
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
        </div>
        
        <footer className="p-4 border-t border-border bg-background/70 backdrop-blur-lg">
             <button
              type="submit"
              disabled={isLoading || groupName.trim().length === 0 || selectedUserIds.size < 2}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : `Create Group (${selectedUserIds.size - 1} selected)`}
            </button>
        </footer>
      </form>
    </div>
  );
};

export default CreateGroupChatScreen;