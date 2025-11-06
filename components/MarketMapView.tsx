import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { GoogleMap } from './GoogleMap';
import { CrosshairIcon, NavigationIcon, ChevronRight } from './icons';
import toast from 'react-hot-toast';
import { getDistanceFromLatLonInKm } from '../utils/geolocation';
import { getCurrencySymbol } from '../utils/currency';

const MarketMapView: React.FC<{ products: Product[] }> = ({ products }) => {
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    const [mapCenter, setMapCenter] = useState({ lat: 23.8765805, lng: 90.3795438 });
    const [isFollowing, setIsFollowing] = useState(true);
    const isFollowingRef = useRef(isFollowing);

     useEffect(() => {
        isFollowingRef.current = isFollowing;
    }, [isFollowing]);

    useEffect(() => {
        let watchId: number | null = null;
        if (navigator.geolocation) {
             toast.loading('Getting your location...', { id: 'geo-toast' });
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    toast.success('Location found!', { id: 'geo-toast', duration: 1500 });
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(newLoc);
                    if (isFollowingRef.current) {
                        setMapCenter(newLoc);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Could not get location.", { id: 'geo-toast' });
                    setLocationError("Unable to retrieve your location.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            toast.error("Geolocation not supported.", { id: 'geo-toast' });
        }
        
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const productsWithLocation = useMemo(() => products.filter(p => p.location), [products]);

    const markers = useMemo(() => productsWithLocation.map(p => ({
        id: p.id,
        lat: p.location!.latitude,
        lng: p.location!.longitude,
    })), [productsWithLocation]);
    
    const distance = useMemo(() => {
        if (activeProduct?.location && userLocation) {
            return getDistanceFromLatLonInKm(
                userLocation.lat, userLocation.lng,
                activeProduct.location.latitude, activeProduct.location.longitude
            );
        }
        return null;
    }, [activeProduct, userLocation]);


    const handleMarkerClick = (productId: string) => {
        const product = productsWithLocation.find(p => p.id === productId);
        if (product) {
            setActiveProduct(product);
        }
    };
    
    const handleFollowToggle = () => {
        if (isFollowing) {
            setIsFollowing(false);
            toast('Manual navigation enabled.', { icon: '🖐️' });
        } else {
            if (userLocation) {
                setIsFollowing(true);
                setMapCenter(userLocation);
                toast.success("Following your location.");
            } else {
                toast.error(locationError || "Cannot find your location.");
            }
        }
    };

    return (
        <div className="relative w-full h-[65vh] bg-gray-800 rounded-2xl overflow-hidden border border-white/10 animate-fade-in-up">
            <GoogleMap
                center={mapCenter}
                zoom={isFollowing ? 15 : 12}
                markers={markers}
                userLocation={userLocation}
                onMarkerClick={handleMarkerClick}
                onMapDrag={() => {
                    if (isFollowing) {
                        setIsFollowing(false);
                        toast('Manual navigation enabled.', { icon: '🖐️' });
                    }
                }}
            />

            <button
                onClick={handleFollowToggle}
                aria-label={isFollowing ? "Disable location following" : "Follow my location"}
                className="absolute top-4 right-4 z-10 p-2.5 bg-gray-900/70 backdrop-blur-md rounded-full text-white border border-white/20 shadow-lg hover:bg-gray-800 transition-colors"
            >
                {isFollowing ? <NavigationIcon className="h-5 w-5 text-brandGreen-400" /> : <CrosshairIcon className="h-5 w-5" />}
            </button>

            {activeProduct && (
                <Link
                    to={`/product/${activeProduct.id}`}
                    className="absolute bottom-4 left-4 right-4 z-10 bg-gray-900/80 backdrop-blur-lg border border-white/10 p-3 rounded-xl flex items-center gap-4 animate-fade-in-up shadow-lg hover:border-brandGreen-500/30 transition-colors"
                >
                    <img src={activeProduct.imageUrl} alt={activeProduct.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-white truncate">{activeProduct.name}</p>
                        <p className="text-brandGreen-400 font-bold">{getCurrencySymbol('BDT')}{activeProduct.price.toLocaleString('en-IN')}</p>
                         {distance !== null && (
                            <p className="text-sm text-gray-400 mt-1">
                                Approx. {distance.toFixed(1)} km away
                            </p>
                        )}
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                </Link>
            )}
        </div>
    );
};

export default MarketMapView;
