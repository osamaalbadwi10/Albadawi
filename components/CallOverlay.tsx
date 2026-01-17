
import React, { useEffect, useRef, useState } from 'react';
import { User, Conversation } from '../types';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Sparkles, Loader2, RefreshCw, AlertCircle, Camera, Download, X as CloseIcon } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, encodeBase64, decodeAudioData, createPcmBlob } from '../services/audioService';

interface CallOverlayProps {
  user: User;
  target: Conversation;
  isAiCall: boolean;
  callType: 'audio' | 'video';
  onEnd: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ user, target, isAiCall, callType, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callStatus, setCallStatus] = useState('جاري الاتصال...');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isConnectionLost, setIsConnectionLost] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isAiCall) {
      startAiCall();
    } else {
      setTimeout(() => setCallStatus(callType === 'video' ? 'مكالمة فيديو مباشرة' : '00:01'), 1500);
      setupLocalPreview();
    }
    return () => {
      stopAiCall();
    };
  }, []);

  const setupLocalPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  const startAiCall = async () => {
    setIsConnectionLost(false);
    setIsReconnecting(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: 'أنت البدوي، مساعد صوتي ومرئي ودود وذكي جداً. تحدث بالعربية بلهجة بيضاء مريحة. أنت الآن في مكالمة حية مع المستخدم.'
        },
        callbacks: {
          onopen: () => {
            setCallStatus(callType === 'video' ? 'مكالمة فيديو مع البدوي' : 'متصل بذكاء البدوي');
            setIsConnectionLost(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted || isConnectionLost) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsAiResponding(true);
              const buffer = await decodeAudioData(decodeBase64(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              const startAt = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(startAt);
              nextStartTimeRef.current = startAt + buffer.duration;
              source.onended = () => setIsAiResponding(false);
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setIsConnectionLost(true);
          },
          onclose: (e) => {
            if (!e.wasClean) {
              setIsConnectionLost(true);
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setCallStatus('خطأ في الاتصال');
      setIsConnectionLost(true);
    }
  };

  const handleReconnect = () => {
    setIsReconnecting(true);
    stopAiCall();
    startAiCall();
  };

  const stopAiCall = () => {
    sessionRef.current?.close();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `albadawi-capture-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between p-12 overflow-hidden" dir="rtl">
      {/* Hidden elements for capture */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Image Preview Overlay */}
      {capturedImage && (
        <div className="absolute top-24 left-6 z-[120] w-32 md:w-48 animate-in zoom-in-50 duration-300">
          <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl">
            <img src={capturedImage} className="w-full aspect-video object-cover" alt="Captured" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={downloadPhoto} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500">
                <Download size={16} />
              </button>
              <button onClick={() => setCapturedImage(null)} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-1 bg-indigo-600 text-[8px] text-center font-bold text-white uppercase tracking-widest">
              تم الالتقاط
            </div>
          </div>
        </div>
      )}

      {/* Lost Connection Notification */}
      {isConnectionLost && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <AlertCircle size={18} className="text-amber-500" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">انقطع الاتصال</p>
                <p className="text-[10px] text-amber-200/70">تحقق من شبكة الإنترنت الخاصة بك</p>
              </div>
            </div>
            <button 
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isReconnecting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] ${isAiResponding ? 'animate-pulse' : ''}`}></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className={`mx-auto w-32 h-32 md:w-48 md:h-48 rounded-full border-4 ${isAiResponding ? 'border-indigo-500 scale-105 shadow-[0_0_50px_rgba(79,70,229,0.4)]' : 'border-slate-800'} transition-all duration-500 overflow-hidden bg-slate-900 relative`}>
          {callType === 'video' && !isVideoOff && (
            <div className="absolute inset-0 z-20 overflow-hidden rounded-full">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror scale-110" 
              />
            </div>
          )}
          
          {(isVideoOff || callType === 'audio') && (
            isAiCall ? (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles size={64} className={`text-indigo-400 ${isAiResponding ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
            ) : (
              <img src={target.avatar || 'https://picsum.photos/seed/call/200'} className="w-full h-full object-cover" alt="" />
            )
          )}
        </div>
        <h2 className="text-3xl font-black text-white">{isAiCall ? 'ذكاء البدوي' : target.name}</h2>
        <div className="flex items-center justify-center gap-2 text-indigo-400 font-medium">
          {(callStatus === 'جاري الاتصال...' || isReconnecting) && <Loader2 size={16} className="animate-spin" />}
          <span className="tracking-widest uppercase text-sm">{isReconnecting ? 'جاري إعادة الاتصال...' : callStatus}</span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="relative z-10 flex items-center justify-center gap-1 h-12">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 bg-indigo-500/50 rounded-full transition-all duration-150 ${isAiResponding ? 'animate-wave' : 'h-2'} ${isConnectionLost ? 'bg-slate-700' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          ></div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="relative z-10 flex items-center gap-4 md:gap-6 flex-wrap justify-center">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          className={`p-4 md:p-5 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          title={isVideoOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
          className={`p-4 md:p-5 rounded-full transition-all ${isVideoOff ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'}`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        {callType === 'video' && !isVideoOff && (
          <button 
            onClick={takePhoto}
            title="التقاط صورة"
            className="p-4 md:p-5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full hover:bg-indigo-500 hover:text-white transition-all active:scale-90"
          >
            <Camera size={24} />
          </button>
        )}
        
        <button 
          onClick={onEnd}
          title="إنهاء المكالمة"
          className="p-6 md:p-7 bg-red-600 text-white rounded-full hover:bg-red-500 hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-red-600/40"
        >
          <PhoneOff size={32} fill="currentColor" />
        </button>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 40px; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default CallOverlay;