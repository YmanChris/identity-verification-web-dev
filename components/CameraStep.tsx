
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DocType, DocSide } from '../types';

interface CameraStepProps {
  docType: DocType;
  side: DocSide;
  onBack: () => void;
  onCapture: (url: string) => void;
}

const CameraStep: React.FC<CameraStepProps> = ({ docType, side, onBack, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const [showFlipScene, setShowFlipScene] = useState(false);

  // Determine side text based on document type
  let sideText = '';
  if (docType === DocType.PASSPORT) {
    sideText = 'Photo Page';
  } else {
    sideText = side === 'FRONT' ? 'Front Side' : 'Back Side';
  }

  const startCamera = useCallback(async () => {
    // 检查是否在安全上下文中 (HTTPS)
    if (!window.isSecureContext) {
      setHasPermission(false);
      setErrorMessage('Camera access requires a secure connection (HTTPS). Please check your URL.');
      return;
    }

    // 检查浏览器是否支持 mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Your browser does not support camera access.');
      return;
    }

    setIsInitializing(true);
    setErrorMessage('');

    try {
      // 清理旧的流
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // 尝试获取后置摄像头
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // 确保视频在设置源后播放
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Video play error:", playErr);
        }
      }
      setHasPermission(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      
      // 根据错误类型给出更具体的提示
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please enable it in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera found on this device.');
      } else {
        setErrorMessage('Could not access camera. Please refresh and try again.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (docType === DocType.NATIONAL_ID && side === 'BACK') {
      setIsFlipAnimating(true);
      setShowFlipScene(true);
      const timer = window.setTimeout(() => {
        setIsFlipAnimating(false);
        setShowFlipScene(false);
      }, 1400);
      return () => {
        window.clearTimeout(timer);
      };
    }
    setIsFlipAnimating(false);
    setShowFlipScene(false);
  }, [docType, side]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && guideRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const srcWidth = video.videoWidth;
      const srcHeight = video.videoHeight;

      if (!srcWidth || !srcHeight) return;

      // Map guidance box (in element coordinates) to video source coordinates
      const videoRect = video.getBoundingClientRect();
      const guideRect = guideRef.current.getBoundingClientRect();

      const vw = videoRect.width;
      const vh = videoRect.height;
      const iw = srcWidth;
      const ih = srcHeight;

      const scale = Math.max(vw / iw, vh / ih);
      const displayW = iw * scale;
      const displayH = ih * scale;
      const offsetX = (vw - displayW) / 2;
      const offsetY = (vh - displayH) / 2;

      const gx = guideRect.left - videoRect.left;
      const gy = guideRect.top - videoRect.top;
      const gw = guideRect.width;
      const gh = guideRect.height;

      let sx = (gx - offsetX) / scale;
      let sy = (gy - offsetY) / scale;
      let sw = gw / scale;
      let sh = gh / scale;

      // Clamp to source bounds
      if (sx < 0) {
        sw += sx;
        sx = 0;
      }
      if (sy < 0) {
        sh += sy;
        sy = 0;
      }
      if (sx + sw > iw) sw = iw - sx;
      if (sy + sh > ih) sh = ih - sy;

      if (sw <= 0 || sh <= 0) return;

      // Crop the guide area directly (no rotation)
      canvas.width = sw;
      canvas.height = sh;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-100">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Camera Permission Required</h3>
        <p className="text-gray-500 mb-8 leading-relaxed max-w-xs mx-auto">
          {errorMessage || 'We need access to your camera to scan your ID. Please enable camera permissions in your browser settings.'}
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button 
            onClick={() => {
              setHasPermission(null);
              setTimeout(startCamera, 100);
            }} 
            disabled={isInitializing}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isInitializing ? 'Requesting...' : 'Grant Camera Access'}
          </button>
          <button 
            onClick={onBack} 
            className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all"
          >
            Go Back
          </button>
        </div>
        {!window.isSecureContext && (
          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-amber-700 text-xs font-medium">
              ⚠️ Tip: Camera access requires HTTPS. Local testing should use localhost or a secure tunnel.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-800/40 uppercase tracking-[0.4em]">Document Scan</span>
          <span key={sideText} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 animate-pulse">
            {sideText}
          </span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Camera Viewfinder Container */}
      <div className="relative w-full aspect-[9/16] bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto border-4 border-gray-50/5">
        <style>{`
          @keyframes idGuidePulse {
            0% { transform: scale(0.98); opacity: 0; }
            50% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 0; }
          }
          .animate-id-guide {
            animation: idGuidePulse 4s ease-in-out infinite;
          }
          .flip-opaque {
            opacity: 0.95;
            animation: none;
          }
          .flip-scene {
            perspective: 1200px;
            -webkit-perspective: 1200px;
          }
          .flip-face {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
          }
          @keyframes flipOut {
            0% { transform: rotateY(0deg); opacity: 0.95; }
            100% { transform: rotateY(90deg); opacity: 0.95; }
          }
          @keyframes flipIn {
            0% { transform: rotateY(-90deg); opacity: 0.95; }
            100% { transform: rotateY(0deg); opacity: 0.95; }
          }
          .flip-out {
            animation: flipOut 0.7s ease-out forwards;
            transform-origin: center center;
            will-change: transform, opacity;
          }
          .flip-in {
            animation: flipIn 0.7s ease-out forwards;
            animation-delay: 0.7s;
            transform-origin: center center;
            will-change: transform, opacity;
          }
          .flip-in.hidden-until {
            opacity: 0;
          }
        `}</style>
        
        {/* Video Background */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Interface Overlay */}
        <div className="absolute inset-0 flex flex-col">
          
          {/* Top Panel: Guidance (Portrait Frame) */}
          <div className="flex-1 relative flex items-center justify-center p-8 z-10">
              {/* Guidance Box */}
              <div ref={guideRef} className="w-[98%] aspect-[1.58/1] relative pointer-events-none">
                  <div className="absolute inset-0 rounded-[1.75rem] border-4 border-lime-400 shadow-[0_0_18px_rgba(34,197,94,0.6)]"></div>
                  
                  {/* Dimming Mask */}
                  <div className="absolute -inset-[2000px] border-[2000px] border-black/80 rounded-[1.75rem]"></div>

                  {/* Front-side ID guidance mock */}
                  {docType === DocType.NATIONAL_ID && side === 'FRONT' && (
                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                      <div className="w-full h-full rounded-2xl bg-white/15 border border-white/30 backdrop-blur-[2px] flex items-center gap-6 px-6 animate-id-guide">
                        <div className="w-[30%] aspect-square rounded-xl bg-white/20 border border-white/40 flex items-center justify-center">
                          <svg className="w-[105%] h-[105%] text-slate-700/80" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="22" r="12" fill="currentColor" />
                            <path d="M12 54c0-11 9-20 20-20s20 9 20 20" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 w-[80%] rounded-full bg-slate-700/70" />
                          <div className="h-4 w-[70%] rounded-full bg-slate-700/60" />
                          <div className="h-4 w-[65%] rounded-full bg-slate-700/55" />
                          <div className="h-4 w-[75%] rounded-full bg-slate-700/60" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flip scene (front -> back) */}
                  {docType === DocType.NATIONAL_ID && side === 'BACK' && showFlipScene && (
                    <div className="absolute inset-6 flex items-center justify-center flip-scene">
                      {/* Front card flips out */}
                      <div className="absolute inset-0 flip-face flip-out">
                        <div className={`w-full h-full rounded-2xl bg-white/15 border border-white/30 backdrop-blur-[2px] flex items-center gap-6 px-6 ${isFlipAnimating ? 'flip-opaque' : 'animate-id-guide'}`}>
                          <div className="w-[30%] aspect-square rounded-xl bg-white/20 border border-white/40 flex items-center justify-center">
                            <svg className="w-[105%] h-[105%] text-slate-700/80" viewBox="0 0 64 64" fill="none">
                              <circle cx="32" cy="22" r="12" fill="currentColor" />
                              <path d="M12 54c0-11 9-20 20-20s20 9 20 20" fill="currentColor" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 w-[80%] rounded-full bg-slate-700/70" />
                            <div className="h-4 w-[70%] rounded-full bg-slate-700/60" />
                            <div className="h-4 w-[65%] rounded-full bg-slate-700/55" />
                            <div className="h-4 w-[75%] rounded-full bg-slate-700/60" />
                          </div>
                        </div>
                      </div>

                      {/* Back card flips in */}
                      <div className="absolute inset-0 flip-face flip-in hidden-until">
                        <div className={`w-full h-full rounded-2xl bg-white/15 border border-white/30 backdrop-blur-[2px] flex flex-col justify-center gap-4 px-6 relative ${isFlipAnimating ? 'flip-opaque' : 'animate-id-guide'}`}>
                          <div className="h-4 w-[55%] rounded-full bg-slate-700/55" />
                          <div className="h-4 w-[80%] rounded-full bg-slate-700/70" />
                          <div className="h-4 w-[65%] rounded-full bg-slate-700/60" />
                          <div className="h-4 w-[70%] rounded-full bg-slate-700/60" />
                          <div className="h-4 w-[45%] rounded-full bg-slate-700/50" />
                          <div className="h-4 w-[75%] rounded-full bg-slate-700/70" />
                        </div>
                      </div>
                    </div>
                  )}

                  {docType === DocType.NATIONAL_ID && side === 'BACK' && (
                    <div className="absolute -bottom-8 inset-x-0 flex justify-center z-30">
                      <span className="bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/25 shadow-lg backdrop-blur-md">
                        Skip →
                      </span>
                    </div>
                  )}

                  {/* Back-side card (static after flip) */}
                  {docType === DocType.NATIONAL_ID && side === 'BACK' && !showFlipScene && (
                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                      <div className={`w-full h-full rounded-2xl bg-white/15 border border-white/30 backdrop-blur-[2px] flex flex-col justify-center gap-4 px-6 relative ${isFlipAnimating ? 'flip-opaque' : 'animate-id-guide'}`}>
                        <div className="h-4 w-[55%] rounded-full bg-slate-700/55" />
                        <div className="h-4 w-[80%] rounded-full bg-slate-700/70" />
                        <div className="h-4 w-[65%] rounded-full bg-slate-700/60" />
                        <div className="h-4 w-[70%] rounded-full bg-slate-700/60" />
                        <div className="h-4 w-[45%] rounded-full bg-slate-700/50" />
                        <div className="h-4 w-[75%] rounded-full bg-slate-700/70" />
                      </div>
                    </div>
                  )}
              </div>

              {/* Instructional Hint */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
                {docType === DocType.NATIONAL_ID && side === 'BACK' ? (
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                    <p className="text-white text-[15px] font-semibold tracking-wide">
                      Please provide the next page.
                    </p>
                  </div>
                ) : (
                  <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                    <p className="text-white text-[15px] font-semibold tracking-wide">
                      Align front side in frame
                    </p>
                  </div>
                )}
              </div>
          </div>

          {/* Bottom Panel: Shutter Control */}
          <div className="h-40 md:h-48 flex flex-col items-center justify-center bg-transparent z-20 pb-8">
            <button 
              onClick={handleCapture}
              disabled={!hasPermission}
              className="group relative flex items-center justify-center active:scale-90 transition-all duration-150 mb-3 disabled:opacity-50"
            >
               <div className="w-20 h-20 rounded-full border-[5px] border-white/30 backdrop-blur-[4px] shadow-2xl group-hover:border-white/50"></div>
               <div className="absolute w-14 h-14 bg-white rounded-full shadow-lg group-active:bg-gray-100"></div>
            </button>
            <span className="text-[11px] text-white/80 uppercase font-black tracking-[0.3em] drop-shadow-lg select-none">Capture</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white text-xs font-bold tracking-widest uppercase">Initializing Camera...</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraStep;
