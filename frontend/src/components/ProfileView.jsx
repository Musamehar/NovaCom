import React, { useState, useEffect } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';
import TagSelector from './TagSelector';

const ProfileView = ({ targetId, currentUserId, returnPath, onBack, onNavigate }) => { // Added onNavigate
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [formData, setFormData] = useState({ email: "", avatar: "", tags: [] });
  const isSelf = parseInt(targetId) === parseInt(currentUserId);

  useEffect(() => {
    callBackend('get_user', [targetId]).then(data => {
      if (data && data.id) { setUser(data); setFormData({ email: data.email || "", avatar: data.avatar || "", tags: data.tags || [] }); }
    });
    if (!isSelf) {
        callBackend('get_friends', [currentUserId]).then(friends => {
            if (Array.isArray(friends)) setIsFriend(friends.some(f => f.id === parseInt(targetId)));
        });
    }
  }, [targetId, currentUserId, isSelf]);

  const handleSave = async () => {
    const tagsStr = formData.tags.join(',');
    await callBackend('update_profile', [targetId, formData.email, formData.avatar, tagsStr]);
    setIsEditing(false); setUser(prev => ({ ...prev, ...formData }));
    alert("Updated.");
  };

  const handleConnect = async () => {
    await callBackend('add_friend', [currentUserId, targetId]);
    setIsFriend(true);
    alert("Connected.");
  };

  const handleMessage = () => {
      if(onNavigate) onNavigate(`dm_${user.id}_${user.name}`);
  };

  if (!user) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 relative">
      {returnPath && (
          <button onClick={onBack} className="absolute top-0 left-0 z-50 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 backdrop-blur-md transition">
            <span>⬅</span> Back
          </button>
      )}

      <GlassCard className="relative overflow-hidden p-0 mt-8">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-cyan-supernova/20 via-cosmic-purple/20 to-void-black border-b border-white/10"></div>
        <div className="relative z-10 mt-20 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full border-4 border-void-black bg-deep-void flex items-center justify-center overflow-hidden shadow-2xl relative group">
            {user.avatar && user.avatar !== "NULL" && user.avatar !== "none" ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-6xl font-bold text-gray-700">{user.name[0]}</span>}
          </div>
          <h1 className="mt-4 text-4xl font-orbitron text-white">{user.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-yellow-500/10 text-yellow-400 px-4 py-1 rounded-full text-sm font-bold border border-yellow-500/20">✨ {user.karma} Rep</span>
            <span className="bg-white/5 text-gray-400 px-4 py-1 rounded-full text-xs border border-white/10">ID: {user.id}</span>
          </div>

          {isEditing ? (
            <div className="mt-8 w-full max-w-lg space-y-5 bg-black/40 p-8 rounded-2xl border border-cyan-supernova/30">
                <input className="w-full bg-deep-void p-3 rounded text-white" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} placeholder="Avatar URL" />
                <input className="w-full bg-deep-void p-3 rounded text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />
                <TagSelector selectedTags={formData.tags} setSelectedTags={t => setFormData({...formData, tags: t})} />
                <div className="flex gap-4 pt-4"><button onClick={handleSave} className="flex-1 bg-green-500 text-black py-2 rounded">SAVE</button><button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-700 text-white py-2 rounded">CANCEL</button></div>
            </div>
          ) : (
            <div className="mt-8 text-center space-y-8 w-full max-w-2xl px-4">
                <div className="flex flex-wrap justify-center gap-2">{user.tags && user.tags.map(t => <span key={t} className="px-4 py-1.5 bg-cyan-supernova/5 text-cyan-supernova border border-cyan-supernova/20 rounded-full text-sm">#{t}</span>)}</div>
                
                <div className="pt-4 flex justify-center gap-4">
                    {isSelf ? (
                        <button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl border border-white/20 transition">EDIT PROFILE</button>
                    ) : (
                        <>
                            {isFriend ? (
                                <button disabled className="bg-gray-800 text-gray-400 font-bold px-6 py-3 rounded-xl cursor-not-allowed border border-white/5">✅ Connected</button>
                            ) : (
                                <button onClick={handleConnect} className="bg-cosmic-purple hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg">CONNECT</button>
                            )}
                            {/* MESSAGE BUTTON */}
                            <button onClick={handleMessage} className="bg-cyan-supernova hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl shadow-lg">MESSAGE ✉</button>
                        </>
                    )}
                </div>
            </div>
          )}
        </div>
        <div className="h-10"></div>
      </GlassCard>
    </div>
  );
};

export default ProfileView;