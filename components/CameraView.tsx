import React, { useState, useEffect, useRef } from 'react';
import { X, SwitchCameraIcon, Send } from './icons';
import toast from 'react-hot-toast';

interface CameraViewProps {
  onClose: () => void;
  onPictureTaken: (dataUrl: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onClose, onPictureTaken }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      cleanupStream();
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (active && videoRef.current) {
          videoRef.current.srcObject = newStream;
          streamRef.current = newStream;
          setError(null);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions in your browser settings.");
        toast.error("Could not access camera.");
      }
    };
    
    if (!capturedImage) {
        startCamera();
    } else {
        cleanupStream();
    }

    return () => {
      active = false;
      cleanupStream();
    };
  }, [facingMode, capturedImage]);

  const handleTakePicture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      if (facingMode === 'user') {
          context.translate(video.videoWidth, 0);
          context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleSend = () => {
    if (capturedImage) {
      onPictureTaken(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-4">
        <p className="text-red-400 mb-4 text-center">{error}</p>
        <button onClick={onClose} className="bg-white/20 px-4 py-2 rounded-lg">Close</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />

      {capturedImage ? (
        // Preview View
        <>
          <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
          <div className="absolute top-0 right-0 p-4 z-10">
            <button onClick={onClose} aria-label="Close camera" className="p-2 bg-black/50 rounded-full text-white">
              <X size={28} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
            <button onClick={handleRetake} className="text-white font-bold text-lg px-4 py-2 rounded-lg bg-black/30 hover:bg-black/50">Retake</button>
            <button onClick={handleSend} aria-label="Send picture" className="bg-brandGreen-600 rounded-full p-4 text-white hover:bg-brandGreen-700">
              <Send size={28} />
            </button>
          </div>
        </>
      ) : (
        // Camera View
        <>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute top-0 right-0 p-4 z-10">
            <button onClick={onClose} aria-label="Close camera" className="p-2 bg-black/50 rounded-full text-white">
              <X size={28} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-around items-center bg-gradient-to-t from-black/80 to-transparent">
            <div className="w-16 h-16"></div> {/* Placeholder for alignment */}
            <button onClick={handleTakePicture} aria-label="Take picture" className="w-20 h-20 rounded-full bg-white border-4 border-black/30 active:bg-gray-300"></button>
            <button onClick={handleSwitchCamera} aria-label="Switch camera" className="p-3 bg-white/30 rounded-full text-white hover:bg-white/50">
              <SwitchCameraIcon size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
