import React, { useState, useEffect } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';
import TagSelector from './TagSelector';

const ProfileView = ({ targetId, currentUserId }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    email: "", avatar: "", tags: []
  });

  const isSelf = parseInt(targetId) === parseInt(currentUserId);

  // Load User Data
  useEffect(() => {
    callBackend('get_user', [targetId]).then(data => {
      if (data && data.id) {
        setUser(data);
        // Initialize form data
        setFormData({
            email: data.email || "",
            avatar: data.avatar || "",
            tags: data.tags || []
        });
      }
    });
  }, [targetId]);

  const handleSave = async () => {
    const tagsStr = formData.tags.join(',');
    await callBackend('update_profile', [targetId, formData.email, formData.avatar, tagsStr]);
    
    setIsEditing(false);
    // Refresh local data
    setUser(prev => ({ ...prev, ...formData }));
    alert("Profile Updated Successfully");
  };

  const handleConnect = async () => {
    await callBackend('add_friend', [currentUserId, targetId]);
    alert(`Connection request sent to ${user.name}`);
  };

  if (!user) return <div className="text-white">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <GlassCard className="relative overflow-hidden">
        {/* Background Banner Effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-cyan-supernova/20 to-cosmic-purple/20"></div>

        <div className="relative z-10 mt-16 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-void-black bg-deep-void flex items-center justify-center overflow-hidden shadow-2xl">
            {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
                <span className="text-4xl font-bold text-gray-600">{user.name[0]}</span>
            )}
          </div>

          {/* Name & Karma */}
          <h1 className="mt-4 text-3xl font-orbitron text-white">{user.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/20">
                ✨ {user.karma} Reputation
            </span>
            <span className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-xs">
                ID: {user.id}
            </span>
          </div>

          {/* EDIT MODE */}
          {isEditing ? (
            <div className="mt-8 w-full max-w-lg space-y-4 bg-black/20 p-6 rounded-xl border border-white/10">
                <h3 className="text-cyan-supernova font-bold mb-2">Edit Identity</h3>
                
                <div>
                    <label className="text-xs text-gray-400">Avatar URL</label>
                    <input 
                        className="w-full bg-deep-void p-2 rounded border border-white/10 text-white"
                        value={formData.avatar}
                        onChange={e => setFormData({...formData, avatar: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Email Relay</label>
                    <input 
                        className="w-full bg-deep-void p-2 rounded border border-white/10 text-white"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Interest Tags</label>
                    <TagSelector 
                        selectedTags={formData.tags} 
                        setSelectedTags={t => setFormData({...formData, tags: t})} 
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={handleSave} className="flex-1 bg-green-500 text-black font-bold py-2 rounded">SAVE CHANGES</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-600 text-white py-2 rounded">CANCEL</button>
                </div>
            </div>
          ) : (
            /* VIEW MODE */
            <div className="mt-8 text-center space-y-6">
                
                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                    {user.tags && user.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-cyan-supernova/10 text-cyan-supernova border border-cyan-supernova/30 rounded text-sm">
                            #{t}
                        </span>
                    ))}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 text-left bg-white/5 p-6 rounded-xl">
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Email</p>
                        <p className="text-white">{isSelf ? user.email : "Hidden (Privacy Protocol)"}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Status</p>
                        <p className="text-green-400">Online</p>
                    </div>
                </div>

                {/* Actions */}
                {isSelf ? (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-2 rounded border border-white/20 transition"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <button 
                        onClick={handleConnect}
                        className="bg-cosmic-purple hover:bg-purple-500 text-white font-bold px-8 py-2 rounded shadow-lg shadow-purple-500/20 transition"
                    >
                        Connect Signal
                    </button>
                )}
            </div>
          )}

        </div>
      </GlassCard>
    </div>
  );
};

export default ProfileView;