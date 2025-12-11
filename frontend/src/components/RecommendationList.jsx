import React, { useEffect, useState } from 'react';
import { callBackend } from '../api'; // Ensure api.js exists from previous steps
import GlassCard from './GlassCard';

const RecommendationList = ({ userId }) => {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    // Call C++: backend.exe get_recommendations <userId>
    callBackend('get_recommendations', [userId]).then((data) => {
      if (Array.isArray(data)) setRecs(data);
    });
  }, [userId]);

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
              <button className="bg-cyan-supernova/10 text-cyan-supernova text-xs px-3 py-1 rounded hover:bg-cyan-supernova hover:text-black transition">
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