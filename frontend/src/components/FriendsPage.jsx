import React, { useState, useEffect } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const FriendsPage = ({ currentUserId, onNavigate }) => {
  const [view, setView] = useState("friends"); 
  const [friends, setFriends] = useState([]);
  
  // Search State
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [results, setResults] = useState([]);
  const [relationships, setRelationships] = useState({}); // Stores status for each user

  // 1. Fetch Friends
  const fetchFriends = () => {
    callBackend('get_friends', [currentUserId]).then(data => {
      if (Array.isArray(data)) setFriends(data);
    });
  };

  useEffect(() => { fetchFriends(); }, [currentUserId]);

  // 2. Search & Check Status
  useEffect(() => {
    if (view === 'search') {
        const timer = setTimeout(async () => {
            const data = await callBackend('search_users', [query, tagFilter]);
            if (Array.isArray(data)) {
                setResults(data);
                
                // Check relationship status for each result
                const newRels = {};
                for (const u of data) {
                    const res = await callBackend('get_relationship', [currentUserId, u.id]);
                    if (res && res.status) newRels[u.id] = res.status;
                }
                setRelationships(newRels);
            }
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [query, tagFilter, view]);

  // --- NEW HANDLER: SEND REQUEST ---
  const handleRequest = async (targetId) => {
    const res = await callBackend('send_request', [currentUserId, targetId]);
    if (res.status === "request_sent") {
        setRelationships(prev => ({ ...prev, [targetId]: "pending_sent" }));
        alert("Encrypted handshake signal sent.");
    } else if (res.status === "already_friends") {
        alert("You are already connected.");
    } else {
        alert("Signal failed: " + res.status);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-orbitron text-white">
            {view === 'friends' ? "My Connections" : "Global Directory"}
        </h2>
        <div className="flex bg-deep-void p-1 rounded-lg border border-white/10">
            <button onClick={() => setView('friends')} className={`px-4 py-2 rounded text-sm font-bold transition ${view === 'friends' ? 'bg-cyan-supernova text-black' : 'text-gray-400 hover:text-white'}`}>My Friends</button>
            <button onClick={() => setView('search')} className={`px-4 py-2 rounded text-sm font-bold transition ${view === 'search' ? 'bg-green-400 text-black' : 'text-gray-400 hover:text-white'}`}>Find New</button>
        </div>
      </div>

      {/* VIEW 1: FRIENDS */}
      {view === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No active signals.</p>}
              {friends.map(f => (
                  <div key={f.id} onClick={() => onNavigate(`profile_${f.id}`)} className="cursor-pointer">
                    <GlassCard className="flex items-center gap-4 hover:border-cyan-supernova/50 transition">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-supernova overflow-hidden bg-black flex-shrink-0">
                            {f.avatar && f.avatar !== "NULL" ? <img src={f.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full font-bold text-gray-500 text-xl">{f.name[0]}</div>}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">{f.name}</h3>
                            <div className="text-xs text-green-400 mt-1">● Connected</div>
                        </div>
                    </GlassCard>
                  </div>
              ))}
          </div>
      )}

      {/* VIEW 2: SEARCH */}
      {view === 'search' && (
          <div className="space-y-6 animate-fade-in">
              <GlassCard>
                <div className="flex flex-col md:flex-row gap-4">
                    <input autoFocus placeholder="Search Username..." className="flex-1 bg-deep-void p-3 rounded border border-white/10 text-white focus:border-green-400 outline-none" value={query} onChange={e => setQuery(e.target.value)} />
                    <select onChange={e => setTagFilter(e.target.value)} className="bg-deep-void text-white p-3 rounded border border-white/10 outline-none focus:border-green-400">
                        <option value="All">All Frequencies</option>
                        {["Gaming", "Anime", "Movies", "Student", "Adult", "Teen"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map(u => {
                    const isSelf = parseInt(u.id) === parseInt(currentUserId);
                    const status = relationships[u.id] || "none"; 

                    return (
                        <div key={u.id} onClick={() => onNavigate(`profile_${u.id}`)} className="cursor-pointer">
                            <GlassCard className="flex items-center gap-4 hover:bg-white/5 transition">
                                <div className="w-14 h-14 rounded-full border border-white/20 overflow-hidden bg-black flex-shrink-0">
                                    {u.avatar && u.avatar !== "NULL" ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full font-bold text-gray-500">{u.name[0]}</div>}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-white">{u.name}</h3>
                                    <div className="text-xs text-yellow-400">✨ {u.karma}</div>
                                </div>
                                
                                {/* DYNAMIC BUTTON BASED ON STATUS */}
                                {!isSelf && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (status === "none") handleRequest(u.id);
                                        }} 
                                        disabled={status !== "none"}
                                        className={`text-xs px-4 py-2 rounded font-bold shadow-lg transition
                                            ${status === "friend" ? "bg-transparent text-green-400 border border-green-400" : 
                                              status === "pending_sent" ? "bg-gray-700 text-gray-300 cursor-wait" :
                                              status === "pending_received" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500" :
                                              "bg-green-500 hover:bg-green-400 text-black"
                                            }`}
                                    >
                                        {status === "friend" ? "LINKED" : 
                                         status === "pending_sent" ? "PENDING..." : 
                                         status === "pending_received" ? "CHECK INBOX" : 
                                         "CONNECT"}
                                    </button>
                                )}
                            </GlassCard>
                        </div>
                    );
                })}
              </div>
          </div>
      )}
    </div>
  );
};

export default FriendsPage;