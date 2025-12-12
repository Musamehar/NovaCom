import React, { useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const UserSearch = ({ currentUserId, onFriendAdded, existingFriends = [] }) => {
  const [searchId, setSearchId] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [degree, setDegree] = useState(null); // Store connection degree
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    // 1. Get User Details
    const data = await callBackend('get_user', [searchId]);
    
    if (data && data.id) {
      setFoundUser(data);
      setError("");

      // 2. Check Degree of Connection
      const rel = await callBackend('get_relation', [currentUserId, data.id]);
      if (rel) setDegree(rel.degree);
    } else {
      setFoundUser(null);
      setError("User not found in the galaxy.");
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;
    await callBackend('add_friend', [currentUserId, foundUser.id]);
    alert(`Signal linked: You are now connected with ${foundUser.name}`);
    setFoundUser(null);
    setSearchId("");
    if (onFriendAdded) onFriendAdded();
  };

  const isSelf = foundUser && parseInt(foundUser.id) === parseInt(currentUserId);

  return (
    <GlassCard className="mb-6">
      <h3 className="font-orbitron text-lg text-cyan-supernova mb-2">Find Signal</h3>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input 
          type="number" placeholder="Enter ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)}
          className="bg-deep-void text-white p-2 rounded-lg w-full border border-white/10 focus:border-cyan-supernova outline-none font-montserrat"
        />
        <button type="submit" className="bg-white/10 hover:bg-cyan-supernova/20 text-cyan-supernova px-4 rounded-lg font-bold border border-cyan-supernova/50 transition">SCAN</button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {foundUser && (
        <div className="bg-void-black/60 p-4 rounded-xl border border-cosmic-purple/50 flex justify-between items-center animate-pulse">
          <div>
            <div className="flex items-center gap-2">
                <h4 className="font-orbitron text-xl text-white">{foundUser.name}</h4>
                
                {/* DEGREE BADGE */}
                {degree > 0 && degree <= 3 && (
                    <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest">
                        {degree === 1 ? "1st" : degree === 2 ? "2nd" : "3rd"} Degree
                    </span>
                )}
            </div>
            
            <div className="flex gap-3 text-xs mt-1">
                <span className="text-gray-400">ID: {foundUser.id}</span>
                {/* KARMA BADGE */}
                <span className="text-yellow-400 font-bold">✨ {foundUser.karma || 0} Reputation</span>
            </div>
          </div>
          
          {/* LOGIC CHANGE: Hide if Self OR Degree is 1 (Direct Friend) */}
          {!isSelf && degree !== 1 && (
            <button 
              onClick={handleAddFriend}
              className="bg-cosmic-purple hover:bg-purple-500 text-white text-sm px-4 py-2 rounded shadow-lg shadow-purple-500/30 transition-all"
            >
              + CONNECT
            </button>
          )}

          {/* If Degree is 1, show Linked */}
          {degree === 1 && (
             <span className="text-green-400 text-xs font-bold border border-green-500/50 px-2 py-1 rounded">
               ✅ Friend
             </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default UserSearch;