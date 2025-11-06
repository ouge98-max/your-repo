import React, { useState } from 'react';
import { Header } from './Header';
import { CheckCircleIcon } from './icons';
import { MediaBubble } from './MediaBubble';

interface GalleryPickerProps {
  onClose: () => void;
  onSend: (imageUrl: string) => void;
}

// Generate a list of placeholder images
const MOCK_IMAGES = Array.from({ length: 24 }, (_, i) => ({
  id: `gallery-img-${i}`,
  url: `https://picsum.photos/seed/gallery${i}/300/300`
}));

export const GalleryPicker: React.FC<GalleryPickerProps> = ({ onClose, onSend }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSend = () => {
    if (selectedImage) {
      onSend(selectedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-fade-in">
      <Header
        title="Select Photo"
        onBack={onClose}
        rightAction={
          <button
            onClick={handleSend}
            disabled={!selectedImage}
            className="font-bold text-primary disabled:text-muted-foreground"
          >
            Send
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1">
          {MOCK_IMAGES.map(image => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image.url)}
              className="relative aspect-square focus:outline-none group"
            >
              <MediaBubble
                src={image.url}
                alt="Gallery image"
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
              {selectedImage === image.url ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <div className="absolute top-2 right-2 bg-primary rounded-full text-primary-foreground">
                     <CheckCircleIcon className="h-6 w-6" />
                   </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};