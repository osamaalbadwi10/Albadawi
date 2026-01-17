
import React, { useState } from 'react';
// Use Conversation instead of Group as it is the exported member from types
import { Conversation } from '../types';
import { Search, Plus, X } from 'lucide-react';

interface GroupListProps {
  groups: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateGroup: (name: string, description: string, icon: string) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, selectedId, onSelect, onCreateGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🔥');

  // Handle optional description when filtering by using optional chaining
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newDesc) {
      onCreateGroup(newName, newDesc, newIcon);
      setNewName('');
      setNewDesc('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">المجموعات</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="بحث عن مجموعة..."
            className="w-full bg-slate-800 border-none rounded-xl pr-10 pl-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelect(group.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedId === group.id ? 'bg-indigo-600/20 border-r-4 border-indigo-600' : 'hover:bg-slate-800 border-r-4 border-transparent'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                {group.icon}
              </div>
              <div className="text-right overflow-hidden">
                <p className={`font-bold truncate ${selectedId === group.id ? 'text-indigo-400' : 'text-slate-200'}`}>{group.name}</p>
                <p className="text-xs text-slate-500 truncate">{group.lastMessage}</p>
              </div>
              <div className="mr-auto text-[10px] text-slate-600 whitespace-nowrap">
                {group.membersCount} ع
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-10 text-slate-600">
            <p>لا يوجد نتائج</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">إنشاء مجموعة جديدة</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">اسم المجموعة</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="مثلاً: عشاق القهوة"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">الوصف</label>
                <textarea
                  required
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="عن ماذا تتحدث المجموعة؟"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">أيقونة المجموعة</label>
                <div className="flex gap-2">
                  {['🔥', '💡', '🎮', '⚽', '🎨', '🚀'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewIcon(emoji)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${newIcon === emoji ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
              >
                إنشاء الآن
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;
