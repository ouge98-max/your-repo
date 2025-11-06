import React, { useState, ChangeEvent, FormEvent } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { CameraIcon, CheckCircleIcon, IdentificationIcon } from './icons';

interface KYCFormProps {
  user: User;
  onBack: () => void;
  onVerificationComplete: () => void;
}

const KYCForm: React.FC<KYCFormProps> = ({ user, onBack, onVerificationComplete }) => {
  const [nidNumber, setNidNumber] = useState('');
  const [nidPhoto, setNidPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNidPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nidNumber || !nidPhoto) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError('');
    const success = await api.submitKyc(user.id, nidNumber, nidPhoto);
    setIsLoading(false);
    if (success) {
      setIsSubmitted(true);
    } else {
      setError('KYC submission failed. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header title="Verification Submitted" onBack={onVerificationComplete} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <CheckCircleIcon className="h-20 w-20 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground">Submission Received</h2>
                <p className="text-muted-foreground mt-2">Your documents have been submitted for verification. This process usually takes 1-2 business days.</p>
                <button onClick={onVerificationComplete} className="mt-8 w-full max-w-xs bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90">
                    Back to Profile
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header title="KYC Verification" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6">
          <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Verify Your Identity</h2>
              <p className="text-muted-foreground mt-1">Please provide your National ID details.</p>
          </div>

          <div>
            <label htmlFor="nid-photo" className="block text-sm font-medium text-foreground/80 mb-2">National ID Photo</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md bg-card border-border">
              <div className="space-y-1 text-center">
                {photoPreview ? (
                    <img src={photoPreview} alt="NID Preview" className="mx-auto h-32 w-auto rounded-md object-contain" />
                ) : (
                    <CameraIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex text-sm text-muted-foreground justify-center">
                  <label htmlFor="nid-photo-input" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring px-2">
                    <span>{photoPreview ? 'Change photo' : 'Upload a file'}</span>
                    <input id="nid-photo-input" name="nid-photo" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="nid-number" className="block text-sm font-medium text-foreground/80">National ID Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdentificationIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <input
                    type="text"
                    name="nid-number"
                    id="nid-number"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="focus:ring-ring focus:border-ring block w-full pl-10 sm:text-sm bg-card border-input text-foreground rounded-md py-3"
                    placeholder="e.g. 1990123456789"
                />
            </div>
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading || !nidNumber || !nidPhoto}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default KYCForm;