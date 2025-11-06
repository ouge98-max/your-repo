import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { GoogleMap } from './GoogleMap';
import { api } from '../services/mockApi';
import { Loader2Icon, MapPinIcon as MapPin } from './icons';
import toast from 'react-hot-toast';

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (location: { latitude: number; longitude: number; address: string; }) => void;
}

const DEFAULT_LOCATION = { lat: 23.8765805, lng: 90.3795438 }; // Dhaka

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [markerPosition, setMarkerPosition] = useState(DEFAULT_LOCATION);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState('Loading your location...');
    const [isGeocoding, setIsGeocoding] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setInitialLoad(true);
            toast.loading('Getting your location...', { id: 'geo-toast' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    toast.success('Location found!', { id: 'geo-toast' });
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(newLoc);
                    setMarkerPosition(newLoc);
                    setInitialLoad(false);
                },
                (error) => {
                    toast.error('Could not get location. Please set it manually.', { id: 'geo-toast' });
                    setInitialLoad(false);
                    // keep default Dhaka location
                },
                { enableHighAccuracy: true }
            );
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (!initialLoad) {
            setIsGeocoding(true);
            const handler = setTimeout(() => {
                api.reverseGeocode(markerPosition.lat, markerPosition.lng).then(addr => {
                    setAddress(addr);
                    setIsGeocoding(false);
                });
            }, 500); // Debounce geocoding
            return () => clearTimeout(handler);
        }
    }, [markerPosition, initialLoad]);


    const handleMarkerDrag = (newPosition: { lat: number; lng: number }) => {
        setMarkerPosition(newPosition);
        setAddress('Updating address...');
    };
    
    const handleConfirm = () => {
        if (!isGeocoding) {
            onConfirm({
                latitude: markerPosition.lat,
                longitude: markerPosition.lng,
                address: address,
            });
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-950 z-40 flex flex-col animate-fade-in">
            <Header title="Select Location" onBack={onClose} />
            <div className="flex-1 relative">
                <GoogleMap
                    center={markerPosition}
                    zoom={16}
                    userLocation={userLocation}
                    isDraggable={true}
                    draggableMarkerPosition={markerPosition}
                    onDraggableMarkerChange={handleMarkerDrag}
                />
            </div>
            <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-white/10 p-4">
                <div className="bg-gray-800 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-300">Selected Address</p>
                    <div className="flex items-center gap-2 mt-1 min-h-[20px]">
                        {isGeocoding ? <Loader2Icon size={16} className="animate-spin text-gray-400" /> : <MapPin size={16} className="text-brandGreen-400" />}
                        <p className="text-white">{address}</p>
                    </div>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={isGeocoding}
                    className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                    Confirm Location
                </button>
            </footer>
        </div>
    );
};
