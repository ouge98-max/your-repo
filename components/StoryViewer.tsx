import React, { useState, useEffect, useRef } from 'react';
import { Story, User } from '../types';
import { Avatar } from './Avatar';
import { X } from './icons';

interface StoryViewerProps {
  stories: Story[];
  initialUser: User;
  onClose: () => void;
  onNextUser: (nextUser: User) => void;
  onPrevUser: (prevUser: User) => void;
}

const StoryItemView: React.FC<{
  user: User;
  items: Story['items'];
  activeItemIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}> = ({ user, items, activeItemIndex, onNext, onPrev, onClose }) => {
  const activeItem = items[activeItemIndex];
  const timerRef = useRef<number | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1); // Reset animation on item change
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      onNext();
    }, 5000); // 5 second timer for each story

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeItemIndex, onNext]);
  
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
      const { clientX, currentTarget } = e;
      const { left, width } = currentTarget.getBoundingClientRect();
      const tapPosition = (clientX - left) / width;
      if (tapPosition > 0.3) {
          onNext();
      } else {
          onPrev();
      }
  };


  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center">
      <img src={activeItem.url} alt={`Story by ${user.name}`} className="object-contain w-full h-full" />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
            {items.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className={`h-1 ${index < activeItemIndex ? 'bg-white' : (index === activeItemIndex ? 'bg-white animate-progress' : 'bg-transparent')}`}
                        style={{ width: '100%', animationDuration: '5s', animationPlayState: 'running' }}
                        key={animationKey}
                    ></div>
                </div>
            ))}
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar user={user} size="sm" />
                <span className="font-bold text-white" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{user.name}</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
                <X size={28} />
            </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute inset-0 flex" onClick={handleTap}>
          <div className="w-1/3 h-full cursor-pointer" />
          <div className="w-2/3 h-full cursor-pointer" />
      </div>
      
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
};


export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialUser, onClose, onNextUser, onPrevUser }) => {
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);

    const currentUserStory = stories.find(s => s.userId === currentUser.id);
    const currentUserIndex = stories.findIndex(s => s.userId === currentUser.id);

    useEffect(() => {
        setCurrentUser(initialUser);
        setActiveStoryIndex(0);
    }, [initialUser]);

    const goToNextStory = () => {
        if (!currentUserStory) return;
        if (activeStoryIndex < currentUserStory.items.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
        } else {
            goToNextUser();
        }
    };

    const goToPrevStory = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
        } else {
            goToPrevUser();
        }
    };

    const goToNextUser = () => {
        if (currentUserIndex < stories.length - 1) {
            onNextUser(stories[currentUserIndex + 1].user);
        } else {
            onClose();
        }
    };
    
    const goToPrevUser = () => {
        if (currentUserIndex > 0) {
            onPrevUser(stories[currentUserIndex - 1].user);
        } else {
            // Can't go back further, maybe close or wiggle? For now, nothing.
        }
    };

    if (!currentUserStory) {
        // This might happen briefly on user switch, close viewer if story not found
        useEffect(() => {
            onClose();
        }, [onClose]);
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 animate-fade-in" onMouseDown={onClose}>
             <div className="w-full h-full max-w-md max-h-[95vh]" onMouseDown={e => e.stopPropagation()}>
                <StoryItemView
                    user={currentUser}
                    items={currentUserStory.items}
                    activeItemIndex={activeStoryIndex}
                    onNext={goToNextStory}
                    onPrev={goToPrevStory}
                    onClose={onClose}
                />
             </div>
        </div>
    );
};
