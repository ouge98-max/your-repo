

import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ChatListScreen } from './ChatListScreen';
import { ChatBubbleIcon as MessageSquare } from './icons';

const ChatLayout: React.FC = () => {
    const { chatId } = useParams();

    return (
        <div className="md:grid md:grid-cols-[350px_1fr] h-full">
            {/* 
              Chat List:
              - Mobile: Hidden if a chat is selected (chatId exists).
              - Desktop: Always visible.
            */}
            <div className={`
                ${chatId ? 'hidden md:flex' : 'flex'} 
                flex-col h-full md:border-r md:border-border bg-background md:bg-transparent
            `}>
                <ChatListScreen />
            </div>

            {/* 
              Detail View (Outlet for ChatScreen or placeholder):
              - Mobile: Shown only if a chat is selected.
              - Desktop: Always visible.
            */}
            <div className={`
                ${chatId ? 'flex' : 'hidden md:flex'} 
                flex-col h-full bg-background
            `}>
                {chatId ? (
                    <Outlet />
                ) : (
                    <div className="h-full items-center justify-center hidden md:flex flex-col text-center text-muted-foreground p-8">
                        <MessageSquare size={64} className="opacity-50" />
                        <h2 className="mt-4 text-xl font-semibold text-foreground">Select a conversation</h2>
                        <p className="max-w-xs mt-1">Choose from your existing conversations on the left to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatLayout;
