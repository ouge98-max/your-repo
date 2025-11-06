import React, { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import toast from 'react-hot-toast';
import * as jsqrNs from 'jsqr';

interface QrScannerProps {
    onBack: () => void;
    onScanSuccess: (data: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onBack, onScanSuccess }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        let active = true;

        const scanQrCode = () => {
            if (!active || !videoRef.current || !canvasRef.current) return;
            
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const jsQR = (jsqrNs as any).default || jsqrNs;
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code) {
                    active = false; // Stop scanning
                    toast.success('QR Code Scanned!', { icon: '✅' });
                    onScanSuccess(code.data);
                    // Cleanup will happen in the return function of useEffect
                    return; // Stop the loop
                }
            }
            animationFrameId.current = requestAnimationFrame(scanQrCode);
        };
        
        const startCamera = async () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });

                if (active && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    // Start scanning once the video is playing
                    videoRef.current.oncanplay = () => {
                        if (animationFrameId.current) {
                           cancelAnimationFrame(animationFrameId.current);
                        }
                        animationFrameId.current = requestAnimationFrame(scanQrCode);
                    };
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                setError("Could not access camera. Please check permissions in your browser settings.");
                toast.error("Could not access camera.");
            }
        };
        
        startCamera();

        return () => {
            active = false;
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScanSuccess]);
    
    if (error) {
        return (
            <div className="flex flex-col h-full bg-background text-foreground">
                <Header title="Scan to Pay" onBack={onBack} />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-destructive">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-black text-white">
            <Header title="Scan to Pay" onBack={onBack} />
            <main className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-background/80 relative">
                <canvas ref={canvasRef} className="hidden" />
                <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover" />
                
                <div 
                    className="absolute w-64 h-64 rounded-lg"
                    style={{ boxShadow: '0 0 0 2000px rgba(var(--background), 0.8)' }}
                ></div>

                <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary animate-scan-line shadow-[0_0_20px_2px_theme(colors.primary)]"></div>
                </div>

                <p className="mt-8 text-white text-lg font-medium z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    Place a QR code inside the frame
                </p>
            </main>
        </div>
    );
};

export default QrScanner;