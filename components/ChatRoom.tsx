
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { Language, translations } from '../translations';
import { Send, ArrowRight, Sparkles, MoreVertical, Paperclip, Loader2, ShieldCheck, Phone, Video } from 'lucide-react';
import { getAiResponse } from '../services/geminiService';
import CallOverlay from './CallOverlay';

interface ChatRoomProps {
  conversation: Conversation;
  user: User;
  onBack: () => void;
  lang: Language;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ conversation, user, onBack, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      senderId: 'system', 
      text: conversation.isPrivate ? t.systemPrivate : t.systemGroup.replace('{name}', conversation.name), 
      timestamp: Date.now() - 3600000 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video', isAi: boolean } | null>(null);
  const [showAiInput, setShowAiInput] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);
  const mainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (showAiInput && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [showAiInput]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), senderId: user.id, text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');

    if (currentInput.startsWith('@ذكاء') || currentInput.toLowerCase().startsWith('@ai')) {
      setIsAiLoading(true);
      const aiReply = await getAiResponse([...messages, userMsg], currentInput.replace(/@ذكاء|@ai/gi, '').trim(), lang);
      setIsAiLoading(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), senderId: 'ai', text: aiReply, timestamp: Date.now(), isAi: true }]);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;

    const prefix = isRTL ? 'سؤال للبدوي' : 'Question to Albadawi';
    const userMsg: Message = { id: Date.now().toString(), senderId: user.id, text: `🤖 ${prefix}: ${aiInputText}`, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    
    const prompt = aiInputText;
    setAiInputText('');
    setIsAiLoading(true);

    const aiReply = await getAiResponse([...messages, userMsg], prompt, lang);
    setIsAiLoading(false);
    
    setMessages(prev => [...prev, { 
      id: (Date.now() + 1).toString(), 
      senderId: 'ai', 
      text: aiReply, 
      timestamp: Date.now(), 
      isAi: true 
    }]);
  };

  const startCall = (type: 'audio' | 'video', isAi = false) => {
    setActiveCall({ type, isAi });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {activeCall && (
        <CallOverlay 
          user={user} 
          target={conversation} 
          isAiCall={activeCall.isAi} 
          callType={activeCall.type}
          onEnd={() => setActiveCall(null)} 
          lang={lang}
        />
      )}

      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-20 shrink-0">
        <button onClick={onBack} className="lg:hidden p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowRight size={20} className={isRTL ? 'scale-x-1' : 'scale-x-[-1]'} />
        </button>
        {conversation.isPrivate ? (
          <div className="relative shrink-0">
            <img src={conversation.avatar} className="w-10 h-10 rounded-full border border-indigo-500/30 object-cover" alt="" />
            <div className={`absolute bottom-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full ${isRTL ? 'left-0' : 'right-0'}`}></div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">{conversation.icon}</div>
        )}
        <div className={`flex-1 overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-1.5 ${isRTL ? 'justify-start' : 'justify-start'}`}>
            <h3 className="font-bold truncate text-slate-100">{conversation.name}</h3>
            {conversation.isPrivate && <ShieldCheck size={14} className="text-indigo-400" />}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {conversation.isPrivate ? `${t.online} • ${t.encrypted}` : `${conversation.membersCount} ${t.members}`}
          </p>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {!conversation.isPrivate && (
            <button 
              onClick={() => setShowAiInput(!showAiInput)}
              className={`p-2.5 rounded-xl transition-all ${showAiInput ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
              title={t.askAi}
            >
              <Sparkles size={20} />
            </button>
          )}
          {conversation.isPrivate ? (
            <>
              <button onClick={() => startCall('audio')} className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all"><Phone size={20} /></button>
              <button onClick={() => startCall('video')} className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all"><Video size={20} /></button>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => startCall('audio', true)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-xs font-bold"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">{t.callAi}</span>
              </button>
              <button 
                onClick={() => startCall('video', true)} 
                className="p-1.5 text-indigo-400 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-500/20"
              >
                <Video size={18} />
              </button>
            </div>
          )}
          <button className="p-2.5 text-slate-400 hover:bg-slate-800 rounded-xl"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-slate-950/20">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const isSystem = msg.senderId === 'system';
          const isAi = msg.senderId === 'ai' || msg.isAi;
          
          return (
            <div key={msg.id} className={`flex w-full ${isSystem ? 'justify-center' : isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
              <div className={`relative max-w-[85%] lg:max-w-[70%] p-3.5 rounded-2xl shadow-sm ${
                isSystem ? 'bg-slate-900/50 text-slate-500 text-[10px] border border-slate-800 px-6' :
                isMe ? `bg-indigo-600 text-white ${isRTL ? 'rounded-tr-none' : 'rounded-tl-none'}` : 
                isAi ? `bg-indigo-950/80 text-indigo-200 ${isRTL ? 'rounded-tl-none' : 'rounded-tr-none'} border border-indigo-500/30 shadow-indigo-500/10` :
                `bg-slate-800 text-slate-100 ${isRTL ? 'rounded-tl-none' : 'rounded-tr-none'} border border-slate-700`
              }`}>
                {isAi && (
                  <div className={`flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-indigo-500/20 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <Sparkles size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t.aiName}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" dir="auto">
                  {msg.text}
                </p>
                {!isSystem && (
                  <div className={`flex items-center gap-1 mt-1 opacity-60 text-[9px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {isAiLoading && (
          <div className={`flex animate-pulse ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center gap-2 border border-indigo-500/20">
              <Loader2 size={14} className="animate-spin text-indigo-500" />
              <span className="text-xs text-slate-400 font-medium">{t.aiThinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>

      {/* Inputs Area */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/50 space-y-3 shrink-0">
        {showAiInput && !conversation.isPrivate && (
          <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className={`flex items-center justify-between mb-2 px-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{t.askAi}</span>
              </div>
              <button onClick={() => setShowAiInput(false)} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">{isRTL ? 'إغلاق' : 'Close'}</button>
            </div>
            <form onSubmit={handleAskAi} className={`flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/40 rounded-2xl p-2 shadow-inner group focus-within:border-indigo-500/80 transition-all ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <input
                ref={aiInputRef}
                type="text" 
                dir="auto"
                placeholder={t.askAi + '...'}
                className={`flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-indigo-100 placeholder:text-indigo-400/40 ${isRTL ? 'text-right' : 'text-left'}`}
                value={aiInputText} 
                onChange={(e) => setAiInputText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!aiInputText.trim() || isAiLoading} 
                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                  aiInputText.trim() && !isAiLoading
                    ? 'bg-indigo-600 text-white shadow-lg active:scale-90' 
                    : 'bg-slate-800 text-slate-600 opacity-50'
                }`}
              >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              </button>
            </form>
          </div>
        )}

        <form onSubmit={handleSendMessage} className={`max-w-5xl mx-auto flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-xl transition-all focus-within:border-indigo-500/40 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <button type="button" className="p-2.5 text-slate-500 hover:text-indigo-400 transition-colors shrink-0">
            <Paperclip size={20} />
          </button>
          
          <input
            ref={mainInputRef}
            type="text" 
            dir="auto"
            placeholder={t.typeMessage}
            className={`flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-2.5 px-2 text-slate-100 placeholder:text-slate-600 ${isRTL ? 'text-right' : 'text-left'}`}
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
          />

          {!conversation.isPrivate && (
            <button 
              type="button"
              onClick={() => setShowAiInput(!showAiInput)}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                showAiInput ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-800'
              }`}
            >
              <Sparkles size={18} className={showAiInput ? 'animate-pulse' : ''} />
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={!inputText.trim()} 
            className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              inputText.trim() 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 active:scale-90' 
                : 'bg-slate-800 text-slate-600 scale-95 opacity-50 cursor-not-allowed'
            }`}
          >
            <Send size={18} className={isRTL ? 'scale-x-[-1]' : ''} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
