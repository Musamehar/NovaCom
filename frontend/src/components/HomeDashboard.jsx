import React, { useEffect, useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const HomeDashboard = ({ userId, onNavigate }) => {
  const [popular, setPopular] = useState([]);
  const [friends, setFriends] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    callBackend('get_user', [userId]).then(setUser);
    callBackend('get_popular').then(setPopular);
    callBackend('get_friends', [userId]).then(setFriends);
  }, [userId]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-supernova to-cosmic-purple">
          WELCOME, {user?.name?.toUpperCase()}
        </h1>
        <p className="text-gray-400">System Status: Online</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Popular Nebulas */}
        <GlassCard className="col-span-2">
          <h2 className="font-orbitron text-xl text-white mb-4">🔥 Trending Nebulas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popular.map(c => (
              <div key={c.id} onClick={() => onNavigate(`comm_${c.id}`)} className="cursor-pointer bg-void-black/50 p-4 rounded-xl border border-white/10 hover:border-cyan-supernova transition group relative overflow-hidden">
                {c.cover && <img src={c.cover} alt="cover" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition" />}
                <div className="relative z-10">
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className="text-xs text-gray-400">{c.members} Members</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* My Friends */}
        <GlassCard>
          <h2 className="font-orbitron text-xl text-white mb-4">Your Signals</h2>
          <div className="space-y-3">
            {friends.map(f => (
              <div key={f.id} onClick={() => onNavigate(`profile_${f.id}`)} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                 <div className="w-8 h-8 rounded-full bg-cyan-supernova/20 border border-cyan-supernova flex items-center justify-center text-xs">
                    {f.name[0]}
                 </div>
                 <span>{f.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default HomeDashboard;