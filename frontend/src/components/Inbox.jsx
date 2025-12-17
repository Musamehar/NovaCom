import React, { useState, useEffect } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const Inbox = ({ currentUserId, onNavigate }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    callBackend('get_my_dms', [currentUserId]).then(data => {
      if (Array.isArray(data)) setChats(data);
    });
  }, [currentUserId]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-orbitron text-white mb-6">Encrypted Channels</h2>
      
      <GlassCard>
        {chats.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>No active frequencies.</p>
                <button 
                    onClick={() => onNavigate('explore_users')}
                    className="mt-4 bg-cyan-supernova/10 text-cyan-supernova px-4 py-2 rounded border border-cyan-supernova/30"
                >
                    Find Signals
                </button>
            </div>
        )}

        <div className="space-y-2">
            {chats.map(chat => (
                <div 
                    key={chat.id} 
                    onClick={() => onNavigate(`dm_${chat.id}_${chat.name}`)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-0"
                >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-black flex-shrink-0">
                        {chat.avatar && chat.avatar !== "NULL" && chat.avatar !== "none" ? (
                            <img src={chat.avatar} className="w-full h-full object-cover" alt="p" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{chat.name[0]}</div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white text-lg">{chat.name}</h3>
                            <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{chat.last_msg}</p>
                    </div>
                </div>
            ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Inbox;