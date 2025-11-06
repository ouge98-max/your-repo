

import React from 'react';
import { Message } from '../types';
import { Reply, PencilIcon, Trash2, Copy, FaceSmileIcon } from './icons';

export interface MessageActionsProps {
  message: Message;
  currentUserIsSender: boolean;
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  // onReact defined for EmojiPicker, but here we directly use QUICK_REACTIONS.
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '💯', '🔥'];

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  currentUserIsSender,
  onClose,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  position,
}) => {
  const actionItems = [
    { label: 'Reply', icon: Reply, action: onReply, show: true },
    { label: 'Copy', icon: Copy, action: onCopy, show: message.type === 'text' },
    { label: 'Edit', icon: PencilIcon, action: onEdit, show: currentUserIsSender && message.type === 'text' && !message.isDeleted },
    { label: 'Delete', icon: Trash2, action: onDelete, show: currentUserIsSender, isDestructive: true },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        style={position}
        className="absolute z-50 flex flex-col gap-1 animate-fade-in-up transform-gpu"
        role="dialog"
        aria-label="Message actions"
      >
        <div className="flex items-center bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-full shadow-lg p-1">
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="text-2xl p-1.5 rounded-full hover:bg-white/10 transition-transform transform hover:scale-110 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden py-1">
          {actionItems.filter(item => item.show).map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-medium hover:bg-white/10 ${item.isDestructive ? 'text-red-400' : 'text-gray-200'}`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};