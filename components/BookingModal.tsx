import React, { useState } from 'react';
import { User } from '../types';
import { Loader2Icon } from './icons';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { date: string; time: string; note: string }) => Promise<void>;
  provider: User;
  serviceTitle: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSubmit, provider, serviceTitle }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ date, time, note });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold text-center text-white mb-2">Book Service</h2>
          <p className="text-sm text-center text-gray-300">Request a booking with <span className="font-semibold">{provider.name}</span> for "{serviceTitle}"</p>
          
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
                <input
                  id="date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  min={today}
                  className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time</label>
                <input
                  id="time" type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-300">Note (Optional)</label>
              <textarea
                id="note" value={note} onChange={e => setNote(e.target.value)} rows={3}
                className="mt-1 block w-full bg-black/20 text-white px-3 py-2 border border-white/20 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                placeholder="Any specific requests or details..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting && <Loader2Icon className="h-5 w-5 animate-spin" />}
                {isSubmitting ? 'Requesting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};