import React, { useState, useRef } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { CameraIcon } from './icons';
import toast from 'react-hot-toast';

interface ProfileEditScreenProps {
  user: User;
  onBack: () => void;
  onProfileUpdate: () => void;
}

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  as?: 'input' | 'textarea';
}> = ({ id, label, value, onChange, type = 'text', as = 'input' }) => {
  const commonProps = {
    id,
    name: id,
    value,
    onChange,
    className: "mt-1 block w-full bg-secondary text-secondary-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
  };
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">{label}</label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
};


const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ user, onBack, onProfileUpdate }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [status, setStatus] = useState(user.statusMessage);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    name !== user.name ||
    phone !== user.phone ||
    status !== user.statusMessage ||
    bio !== (user.bio || '') ||
    avatarUrl !== user.avatarUrl;

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      if (avatarUrl !== user.avatarUrl) {
        await api.updateUserAvatar(user.id, avatarUrl);
      }
      if (name !== user.name || phone !== user.phone || status !== user.statusMessage || bio !== (user.bio || '')) {
         await api.updateUserProfile(user.id, name, phone, status, bio);
      }
      onProfileUpdate();
      toast.success('Profile updated successfully!');
      onBack();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarChangeClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image is too large. Please select a file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header
        title="Edit Profile"
        onBack={onBack}
        rightAction={
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-primary text-primary-foreground font-bold py-1.5 px-4 rounded-full disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto">
        <form className="max-w-md mx-auto p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar user={{ ...user, avatarUrl }} size="xl" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <button
                type="button"
                onClick={handleAvatarChangeClick}
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full border-4 border-background"
                aria-label="Change profile photo"
              >
                <CameraIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
             <InputField id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
             <InputField id="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
             <InputField id="status" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
             <InputField id="bio" label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} as="textarea" />
          </div>

          <div className="text-sm text-muted-foreground pt-2 text-center">
              Joined on {new Date(user.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfileEditScreen;