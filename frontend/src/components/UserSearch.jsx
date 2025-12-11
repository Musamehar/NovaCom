import React, { useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const UserSearch = ({ currentUserId, onFriendAdded }) => {
  const [searchId, setSearchId] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    // Call C++: get_user <id>
    const data = await callBackend('get_user', [searchId]);
    
    if (data && data.id) {
      setFoundUser(data);
      setError("");
    } else {
      setFoundUser(null);
      setError("User not found in the galaxy.");
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;

    // Call C++: add_friend <currentUserId> <foundUserId>
    await callBackend('add_friend', [currentUserId, foundUser.id]);
    
    alert(`Signal linked: You are now connected with ${foundUser.name}`);
    setFoundUser(null);
    setSearchId("");
    
    // Refresh the dashboard
    if (onFriendAdded) onFriendAdded();
  };

  return (
    <GlassCard className="mb-6">
      <h3 className="font-orbitron text-lg text-cyan-supernova mb-2">Find Signal</h3>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input 
          type="number" 
          placeholder="Enter ID..." 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="bg-deep-void text-white p-2 rounded-lg w-full border border-white/10 focus:border-cyan-supernova outline-none font-montserrat"
        />
        <button type="submit" className="bg-white/10 hover:bg-cyan-supernova/20 text-cyan-supernova px-4 rounded-lg font-bold border border-cyan-supernova/50 transition">
          SCAN
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {foundUser && (
        <div className="bg-void-black/60 p-4 rounded-xl border border-cosmic-purple/50 flex justify-between items-center animate-pulse">
          <div>
            <p className="text-xs text-gray-400">ID: {foundUser.id}</p>
            <h4 className="font-orbitron text-xl text-white">{foundUser.name}</h4>
          </div>
          
          {/* Don't show Add button if it's yourself */}
          {parseInt(foundUser.id) !== parseInt(currentUserId) && (
            <button 
              onClick={handleAddFriend}
              className="bg-cosmic-purple hover:bg-purple-500 text-white text-sm px-4 py-2 rounded shadow-lg shadow-purple-500/30 transition-all"
            >
              + CONNECT
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default UserSearch;