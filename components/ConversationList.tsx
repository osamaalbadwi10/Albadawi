
import React, { useState } from 'react';
import { Conversation } from '../types';
import { Language, translations } from '../translations';
import { Search, Plus, X, Users, MessageSquareLock } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateGroup: (name: string, description: string, icon: string) => void;
  lang: Language;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelect, onCreateGroup, lang }) => {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const groups = conversations.filter(c => !c.isPrivate && (c.name.toLowerCase().includes(searchTerm.toLowerCase())));
  const privates = conversations.filter(c => c.isPrivate && (c.name.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newDesc) {
      onCreateGroup(newName, newDesc, '🔥');
      setNewName(''); setNewDesc('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-white">{t.chats}</h2>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative group">
          <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
          <input
            type="text" 
            placeholder={t.searchPlaceholder}
            className={`w-full bg-slate-800 border border-transparent focus:border-indigo-600/50 rounded-xl py-2 text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none font-medium placeholder:text-slate-600 ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {privates.length > 0 && (
          <div>
            <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MessageSquareLock size={12} /> {t.privateMessages}
            </h3>
            <div className="space-y-1">
              {privates.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedId === c.id ? 'bg-indigo-600/20 border-indigo-600 border-x-4' : 'hover:bg-slate-800 border-transparent border-x-4'
                  }`}
                >
                  <img src={c.avatar} className="w-12 h-12 rounded-full border-2 border-slate-700 shrink-0" alt="" />
                  <div className={`overflow-hidden flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className={`font-bold truncate text-sm ${selectedId === c.id ? 'text-indigo-400' : 'text-slate-200'}`}>{c.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Users size={12} /> {t.groups}
          </h3>
          <div className="space-y-1">
            {groups.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedId === c.id ? 'bg-indigo-600/20 border-indigo-600 border-x-4' : 'hover:bg-slate-800 border-transparent border-x-4'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">{c.icon}</div>
                <div className={`overflow-hidden flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`font-bold truncate text-sm ${selectedId === c.id ? 'text-indigo-400' : 'text-slate-200'}`}>{c.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                </div>
                <div className="text-[10px] text-slate-600 whitespace-nowrap bg-slate-800 px-1.5 py-0.5 rounded">
                  {c.membersCount}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{t.createGroup}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">{t.groupName}</label>
                <input type="text" required className={`w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none ${isRTL ? 'text-right' : 'text-left'}`} value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5 font-medium">{t.description}</label>
                <textarea required className={`w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] ${isRTL ? 'text-right' : 'text-left'}`} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">{t.create}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
