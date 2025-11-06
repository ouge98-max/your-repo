declare global {
  interface Window {
    google: any;
  }
}

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Loader2Icon as Loader2 } from './icons';

// Custom OUMAS branded map style for better visibility and aesthetics
const oumasMapStyle: any[] = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }]
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }]
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }]
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }]
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    featureType: "poi.park",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#023e58" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#059669" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#064e3b" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ccfbf1" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#3a4762" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: { id: string; lat: number; lng: number }[];
  userLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (markerId: string) => void;
  isDraggable?: boolean;
  draggableMarkerPosition?: { lat: number; lng: number };
  onDraggableMarkerChange?: (newPosition: { lat: number; lng: number }) => void;
  onMapDrag?: () => void;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  markers = [],
  userLocation,
  onMarkerClick,
  isDraggable = false,
  draggableMarkerPosition,
  onDraggableMarkerChange,
  onMapDrag
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any | null>(null);
  const librariesRef = useRef<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const draggableMarkerRef = useRef<any | null>(null);
  const userMarkerRef = useRef<any | null>(null);


  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.API_KEY || '',
      version: 'weekly',
    });

    let isMounted = true;

    const initializeMap = async () => {
      try {
        const { Map } = await (loader as any).importLibrary('maps');
        const { Marker } = await (loader as any).importLibrary('marker');

        if (isMounted && mapRef.current) {
          librariesRef.current = {
            Map,
            Marker,
            SymbolPath: window.google.maps.SymbolPath,
            Size: window.google.maps.Size,
          };
          
          setIsLoading(false);
          const map = new Map(mapRef.current, {
            center,
            zoom,
            styles: oumasMapStyle,
            disableDefaultUI: true,
            zoomControl: true,
          });
          mapInstance.current = map;

          if (onMapDrag) {
            map.addListener('drag', onMapDrag);
          }
        }
      } catch (e: any) {
        console.error("Failed to load Google Maps", e);
        if (isMounted) {
          setError("Could not load map.");
          setIsLoading(false);
        }
      }
    };
    
    initializeMap();

    return () => {
      isMounted = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center and zoom
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom]);


  // Handle Static Markers
  useEffect(() => {
    if (!mapInstance.current || !librariesRef.current.Marker) return;
    const map = mapInstance.current;
    const { Marker, SymbolPath } = librariesRef.current;
    
    const currentMarkerIds = new Set(markers.map(m => m.id));
    
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    markers.forEach(markerData => {
      const pos = { lat: markerData.lat, lng: markerData.lng };
      if (markersRef.current.has(markerData.id)) {
        markersRef.current.get(markerData.id)!.setPosition(pos);
      } else {
        const marker = new Marker({
          position: pos,
          map,
          icon: {
            path: SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        if (onMarkerClick) {
          marker.addListener('click', () => {
            onMarkerClick(markerData.id);
          });
        }
        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [markers, onMarkerClick]);
  
  // Handle Draggable Marker
  useEffect(() => {
    if (!mapInstance.current || !librariesRef.current.Marker || !isDraggable || !draggableMarkerPosition) {
      if(draggableMarkerRef.current) {
        draggableMarkerRef.current.setMap(null);
        draggableMarkerRef.current = null;
      }
      return;
    };

    const { Marker, Size } = librariesRef.current;

    if (!draggableMarkerRef.current) {
      draggableMarkerRef.current = new Marker({
        position: draggableMarkerPosition,
        map: mapInstance.current,
        draggable: true,
        icon: {
          url: '/logo.jpg',
          scaledSize: new Size(40, 40),
        },
      });

      if (onDraggableMarkerChange) {
        draggableMarkerRef.current.addListener('dragend', (e: any) => {
          onDraggableMarkerChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      }
    } else {
      draggableMarkerRef.current.setPosition(draggableMarkerPosition);
    }
  }, [isDraggable, draggableMarkerPosition, onDraggableMarkerChange]);

  // Handle User Location Marker
  useEffect(() => {
    if(!mapInstance.current || !librariesRef.current.Marker) return;
    const { Marker, SymbolPath } = librariesRef.current;

    if(userLocation) {
        const userMarkerIcon = {
            path: SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8
        };
        if (!userMarkerRef.current) {
            userMarkerRef.current = new Marker({
                position: userLocation,
                map: mapInstance.current,
                icon: userMarkerIcon,
                title: "Your Location"
            });
        } else {
            userMarkerRef.current.setPosition(userLocation);
        }
    } else {
        if(userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
            userMarkerRef.current = null;
        }
    }
  }, [userLocation]);


  if (error) return <div className="w-full h-full flex items-center justify-center bg-gray-800 text-red-400">{error}</div>;

  return (
    <div className="w-full h-full relative">
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10"><Loader2 className="h-8 w-8 animate-spin text-brandGreen-400" /></div>}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};