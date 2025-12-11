import React, { useEffect, useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const FriendList = ({ userId }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    // Call C++: backend.exe get_friends <userId>
    callBackend('get_friends', [userId]).then((data) => {
      if (Array.isArray(data)) setFriends(data);
    });
  }, [userId]);

  return (
    <GlassCard>
      <h2 className="font-orbitron text-xl text-white mb-4">
        Active Links <span className="text-xs text-gray-400">({friends.length})</span>
      </h2>
      
      <div className="grid grid-cols-1 gap-3">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-purple to-cyan-supernova flex items-center justify-center font-bold text-black">
              {friend.name[0]}
            </div>
            <span className="font-montserrat text-lg">{friend.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default FriendList;