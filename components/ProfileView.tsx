
import React from 'react';
import { User, VideoPost } from '../types';
import { Language, translations } from '../translations';
import { Settings, Grid, Heart, Play, Edit3 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  videos: VideoPost[];
  lang: Language;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, videos, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 pb-20 md:pb-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`flex flex-col md:flex-row items-center gap-8 mb-12 ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
          <div className="relative group shrink-0">
            <img src={user.avatar} alt={user.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-indigo-600 p-1 shadow-2xl" />
            <button className={`absolute bottom-2 bg-indigo-600 p-2 rounded-full border-4 border-slate-950 hover:scale-110 transition-transform ${isRTL ? 'right-2' : 'left-2'}`}>
              <Edit3 size={16} />
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-3xl font-black">{user.name}</h1>
                <p className="text-slate-400">@{user.username}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-slate-800 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors">{t.editProfile}</button>
                <button className="bg-slate-800 p-2.5 rounded-xl hover:bg-slate-700"><Settings size={20} /></button>
              </div>
            </div>
            
            <div className="flex justify-center md:justify-start gap-8 py-4 border-y border-slate-800/50">
              <div className="text-center">
                <p className="text-xl font-bold">{videos.length}</p>
                <p className="text-xs text-slate-500">{t.videos}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">12.5k</p>
                <p className="text-xs text-slate-500">{t.followers}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">850</p>
                <p className="text-xs text-slate-500">{t.following}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-800 mb-6">
          <button className={`flex items-center gap-2 px-6 py-4 border-b-2 border-indigo-600 text-indigo-500 font-bold`}>
            <Grid size={18} />
            <span>{t.myVideos}</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-300">
            <Heart size={18} />
            <span>{t.likedVideos}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {videos.map(video => (
            <div key={video.id} className="aspect-[3/4] relative group cursor-pointer overflow-hidden rounded-xl bg-slate-900">
              <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={24} fill="white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
