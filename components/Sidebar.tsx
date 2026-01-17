
import React from 'react';
import { AppTab, User } from '../types';
import { Language, translations } from '../translations';
import { MessageCircle, Compass, PlaySquare, User as UserIcon, LogOut, ShieldCheck, Languages } from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: User;
  lang: Language;
  toggleLanguage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, lang, toggleLanguage }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const menuItems = [
    { id: AppTab.CHATS, icon: MessageCircle, label: t.chats },
    { id: AppTab.DISCOVER, icon: Compass, label: t.discover },
    { id: AppTab.FEED, icon: PlaySquare, label: t.videos },
    { id: AppTab.PROFILE, icon: UserIcon, label: t.profile },
  ];

  return (
    <div className="h-full flex flex-col py-6 px-4">
      <div className={`flex items-center gap-3 px-2 mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-black text-white hidden lg:block tracking-tight">{t.appName}</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
              activeTab === item.id 
                ? 'bg-indigo-600/10 text-indigo-500 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="hidden lg:block text-lg">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
        >
          <Languages size={24} className="group-hover:text-indigo-400" />
          <span className="hidden lg:block text-sm font-bold">{t.switchLanguage}</span>
        </button>

        <div className={`flex items-center gap-3 px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-indigo-500/30" />
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-500 truncate">@{currentUser.username}</p>
          </div>
          <button className={`hidden lg:block text-slate-500 hover:text-red-400 transition-colors ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
