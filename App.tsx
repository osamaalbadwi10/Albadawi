
import React, { useState, useEffect } from 'react';
import { AppTab, Conversation, User, VideoPost } from './types';
import { Language, translations } from './translations';
import Sidebar from './components/Sidebar';
import ChatRoom from './components/ChatRoom';
import VideoFeed from './components/VideoFeed';
import ConversationList from './components/ConversationList';
import ProfileView from './components/ProfileView';
import { MessageCircle, Compass, PlaySquare, User as UserIcon, UserPlus } from 'lucide-react';

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'مجتمع المبرمجين العرب', description: 'نقاشات تقنية وبرمجية', icon: '💻', membersCount: 1540, lastMessage: 'ما هو رأيكم في Gemini الجديد؟', isPrivate: false },
  { id: '2', name: 'عشاق التصوير', description: 'مشاركة أفضل اللقطات والعدسات', icon: '📸', membersCount: 890, lastMessage: 'صورة رائعة جداً!', isPrivate: false },
  { id: 'p1', name: 'أحمد علي', avatar: 'https://picsum.photos/seed/p1/100', lastMessage: 'هل انتهيت من المشروع؟', isPrivate: true, recipientId: 'u1' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'أحمد علي', username: 'ahmed_dev', avatar: 'https://picsum.photos/seed/p1/100', isOnline: true },
  { id: 'u2', name: 'سارة خالد', username: 'sara_k', avatar: 'https://picsum.photos/seed/p2/100', isOnline: false },
  { id: 'u3', name: 'محمد فهد', username: 'moe_f', avatar: 'https://picsum.photos/seed/p3/100', isOnline: true },
];

const MOCK_VIDEOS: VideoPost[] = [
  { id: 'v1', userId: 'u1', userName: 'أحمد محمد', userAvatar: 'https://picsum.photos/seed/user1/100', videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', thumbnailUrl: 'https://picsum.photos/seed/v1/400/600', caption: 'أجمل إطلالة اليوم في جبال اللوز ❄️ #السعودية #شتاء', likes: 1240, comments: 45, timestamp: Date.now() - 3600000 },
];

const currentUser: User = { id: 'me', name: 'مستخدم البدوي', username: 'albadawi_user', avatar: 'https://picsum.photos/seed/me/100' };

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHATS);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [videos, setVideos] = useState<VideoPost[]>(MOCK_VIDEOS);
  const [lang, setLang] = useState<Language>('ar');

  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const activeConv = conversations.find(c => c.id === selectedConvId);

  const handleCreateGroup = (name: string, description: string, icon: string) => {
    const newGroup: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      name, description, icon, membersCount: 1,
      lastMessage: lang === 'ar' ? 'مرحباً بكم في المجموعة الجديدة!' : 'Welcome to the new group!',
      isPrivate: false
    };
    setConversations([newGroup, ...conversations]);
  };

  const startPrivateChat = (user: User) => {
    const existing = conversations.find(c => c.isPrivate && c.recipientId === user.id);
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      const newPrivate: Conversation = {
        id: `p_${user.id}`,
        name: user.name,
        avatar: user.avatar,
        isPrivate: true,
        recipientId: user.id,
        lastMessage: lang === 'ar' ? 'بدأت محادثة خاصة جديدة' : 'Started a new private chat'
      };
      setConversations([newPrivate, ...conversations]);
      setSelectedConvId(newPrivate.id);
    }
    setActiveTab(AppTab.CHATS);
  };

  const handleUploadVideo = (caption: string, videoUrl: string) => {
    const newVideo: VideoPost = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar,
      videoUrl, thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/400/600`,
      caption, likes: 0, comments: 0, timestamp: Date.now()
    };
    setVideos([newVideo, ...videos]);
    setActiveTab(AppTab.FEED);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950 text-slate-100 ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      <div className={`hidden md:block w-20 lg:w-64 border-slate-800 bg-slate-900 shadow-xl ${isRTL ? 'border-l' : 'border-r'}`}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser} 
          lang={lang} 
          toggleLanguage={toggleLanguage} 
        />
      </div>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {activeTab === AppTab.CHATS && (
          <div className="flex h-full">
            <div className={`${selectedConvId ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-slate-800 overflow-y-auto ${isRTL ? 'border-l' : 'border-r'}`}>
              <ConversationList 
                conversations={conversations} 
                onSelect={setSelectedConvId} 
                selectedId={selectedConvId}
                onCreateGroup={handleCreateGroup}
                lang={lang}
              />
            </div>
            <div className={`${!selectedConvId ? 'hidden lg:flex' : 'flex'} flex-1`}>
              {activeConv ? (
                <ChatRoom 
                  conversation={activeConv} 
                  user={currentUser} 
                  onBack={() => setSelectedConvId(null)} 
                  lang={lang}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                  <MessageCircle size={64} className="mb-4 opacity-20" />
                  <h2 className="text-xl font-semibold mb-2">{t.chats}</h2>
                  <p>{t.encrypted}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === AppTab.FEED && <VideoFeed videos={videos} onUpload={handleUploadVideo} lang={lang} />}

        {activeTab === AppTab.DISCOVER && (
          <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
            <h1 className="text-2xl font-bold mb-8">{t.discover}</h1>
            
            <section className="mb-12">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-400" />
                {lang === 'ar' ? 'أشخاص قد تعرفهم' : 'People you may know'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_USERS.map(user => (
                  <div key={user.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-700" alt={user.name} />
                        {user.isOnline && <div className={`absolute bottom-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full ${isRTL ? 'right-0' : 'left-0'}`}></div>}
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startPrivateChat(user)}
                      className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Compass size={20} className="text-indigo-400" />
                {t.groups}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.filter(c => !c.isPrivate).map(group => (
                  <div key={group.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer">
                    <div className="text-4xl mb-4">{group.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{group.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">{group.membersCount} {t.members}</span>
                      <button 
                        onClick={() => {setSelectedConvId(group.id); setActiveTab(AppTab.CHATS)}}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        {lang === 'ar' ? 'انضم الآن' : 'Join Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === AppTab.PROFILE && <ProfileView user={currentUser} videos={videos.filter(v => v.userId === currentUser.id)} lang={lang} />}
      </main>

      <nav className="md:hidden flex justify-around items-center bg-slate-900 border-t border-slate-800 py-3 px-2 sticky bottom-0 z-50">
        <button onClick={() => setActiveTab(AppTab.CHATS)} className={`flex flex-col items-center gap-1 ${activeTab === AppTab.CHATS ? 'text-indigo-500' : 'text-slate-500'}`}><MessageCircle size={24} /><span className="text-[10px]">{t.chats}</span></button>
        <button onClick={() => setActiveTab(AppTab.DISCOVER)} className={`flex flex-col items-center gap-1 ${activeTab === AppTab.DISCOVER ? 'text-indigo-500' : 'text-slate-500'}`}><Compass size={24} /><span className="text-[10px]">{t.discover}</span></button>
        <button onClick={() => setActiveTab(AppTab.FEED)} className={`flex flex-col items-center gap-1 ${activeTab === AppTab.FEED ? 'text-indigo-500' : 'text-slate-500'}`}><PlaySquare size={24} /><span className="text-[10px]">{t.videos}</span></button>
        <button onClick={() => setActiveTab(AppTab.PROFILE)} className={`flex flex-col items-center gap-1 ${activeTab === AppTab.PROFILE ? 'text-indigo-500' : 'text-slate-500'}`}><UserIcon size={24} /><span className="text-[10px]">{t.profile}</span></button>
      </nav>
    </div>
  );
};

export default App;
