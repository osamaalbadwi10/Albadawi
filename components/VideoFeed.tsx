
import React, { useState } from 'react';
import { VideoPost } from '../types';
import { Language, translations } from '../translations';
import { Heart, MessageCircle, Share2, Plus, X, Music, Upload } from 'lucide-react';

interface VideoFeedProps {
  videos: VideoPost[];
  onUpload: (caption: string, videoUrl: string) => void;
  lang: Language;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, onUpload, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caption, setCaption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (caption) {
      onUpload(caption, 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');
      setCaption('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none">
        {videos.map((video) => (
          <div key={video.id} className="relative h-full w-full snap-start flex items-center justify-center bg-slate-950">
            <div className="relative w-full h-full max-w-[500px] flex items-center justify-center overflow-hidden">
               <img src={video.thumbnailUrl} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-md" />
               <video src={video.videoUrl} className="relative z-10 w-full h-full object-contain" loop autoPlay muted playsInline />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className={`flex items-end justify-between gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                      <img src={video.userAvatar} alt={video.userName} className="w-10 h-10 rounded-full border-2 border-white" />
                      <div>
                        <h4 className="font-bold text-white">@{video.userName}</h4>
                        <p className="text-xs text-slate-300">{isRTL ? 'منذ 1 ساعة' : '1h ago'}</p>
                      </div>
                      <button className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full">{t.follow}</button>
                    </div>
                    <p className="text-sm text-white line-clamp-2 leading-relaxed" dir="auto">{video.caption}</p>
                    <div className={`flex items-center gap-2 text-xs text-slate-300 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      <Music size={12} className="animate-spin-slow" />
                      <span>{isRTL ? 'صوت أصلي' : 'Original Sound'} - {video.userName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 items-center px-2">
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform">
                        <Heart size={28} className="text-white group-active:text-red-500 fill-transparent group-active:fill-red-500 transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-white">{video.likes}</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-white">{video.comments}</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform">
                        <Share2 size={28} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-white">{isRTL ? 'مشاركة' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setIsModalOpen(true)} className={`fixed bottom-24 md:bottom-10 z-40 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-indigo-500/50 hover:scale-110 active:scale-95 transition-all ${isRTL ? 'right-6' : 'left-6'}`}>
        <Plus size={32} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{t.uploadVideo}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="aspect-[9/16] bg-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-colors group cursor-pointer">
                <Upload className="text-indigo-500 mb-4" size={32} />
                <p className="text-slate-300 font-medium">{isRTL ? 'اختر فيديو' : 'Select Video'}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">{t.videoCaption}</label>
                <textarea required className={`w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] ${isRTL ? 'text-right' : 'text-left'}`} value={caption} onChange={e => setCaption(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">{t.publish}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
