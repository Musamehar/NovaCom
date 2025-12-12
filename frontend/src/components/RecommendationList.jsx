import React, { useEffect, useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const RecommendationList = ({ userId }) => {
  const [recs, setRecs] = useState([]);

  const fetchRecs = () => {
    callBackend('get_recommendations', [userId]).then((data) => {
      if (Array.isArray(data)) setRecs(data);
    });
  };

  useEffect(() => {
    fetchRecs();
  }, [userId]);

  // --- NEW FUNCTION ---
  const handleConnect = async (targetId) => {
    await callBackend('add_friend', [userId, targetId]);
    // Remove the user from the list immediately to show feedback
    setRecs(prev => prev.filter(u => u.id !== targetId));
    alert("Connection established.");
  };

  return (
    <GlassCard className="h-full">
      <h2 className="font-orbitron text-xl text-cyan-supernova drop-shadow-glow mb-4">
        Nova AI Suggestions
      </h2>
      
      {recs.length === 0 ? (
        <p className="text-gray-400 text-sm">No new signals detected.</p>
      ) : (
        <div className="space-y-3">
          {recs.map((user) => (
            <div key={user.id} className="flex justify-between items-center bg-void-black/50 p-3 rounded-lg border border-white/5 hover:border-cyan-supernova/50 transition-all">
              <div>
                <h3 className="font-montserrat font-bold text-white">{user.name}</h3>
                <p className="text-xs text-cosmic-purple">
                  {user.mutual_friends} Mutual Connections
                </p>
              </div>
              
              {/* --- UPDATED BUTTON --- */}
              <button 
                onClick={() => handleConnect(user.id)}
                className="bg-cyan-supernova/10 text-cyan-supernova text-xs px-3 py-1 rounded hover:bg-cyan-supernova hover:text-black transition"
              >
                Connect
              </button>
              
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default RecommendationList;