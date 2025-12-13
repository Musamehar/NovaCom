import React, { useState, useEffect, useRef } from 'react';
import { callBackend } from '../api';

const CommunityChat = ({ commId, currentUserId, onLeave }) => {
  const [details, setDetails] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const chatEndRef = useRef(null);

  const fetchDetails = async () => {
    const data = await callBackend('get_community', [commId, currentUserId]);
    if (data && data.id) setDetails(data);
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 2000);
    return () => clearInterval(interval);
  }, [commId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [details?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    await callBackend('send_message', [commId, currentUserId, msgInput]);
    setMsgInput("");
    fetchDetails();
  };

  const handleJoin = async () => {
    await callBackend('join_community', [currentUserId, commId]);
    fetchDetails();
  };

  const handleVote = async (index) => {
    await callBackend('vote_message', [commId, index]);
    fetchDetails();
  };

  // --- MOD FUNCTIONS ---
  const handlePin = async (index) => {
    await callBackend('mod_pin', [commId, currentUserId, index]);
    fetchDetails();
  };

  const handleDelete = async (index) => {
    if(window.confirm("Delete this transmission?")) {
        await callBackend('mod_delete', [commId, currentUserId, index]);
        fetchDetails();
    }
  };

  const handleBan = async (targetId) => {
    if(window.confirm(`Ban User ID ${targetId} from this sector?`)) {
        await callBackend('mod_ban', [commId, currentUserId, targetId]);
        fetchDetails();
    }
  };

  if (!details) return <div className="text-white">Loading frequency...</div>;

  // Filter pinned messages
  const pinnedMsgs = details.messages.filter(m => m.pinned);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-void-black/50 backdrop-blur">
        <div>
          <h2 className="text-2xl font-orbitron text-white flex items-center gap-3">
            <span className="text-cyan-supernova">#</span> {details.name}
            {details.is_mod && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded">MODERATOR</span>}
          </h2>
          <p className="text-sm text-gray-400">{details.desc}</p>
        </div>

        <div className="flex gap-3">
            {/* GO BACK BUTTON (Navigation) */}
            <button 
                onClick={onLeave} 
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition"
            >
                Go Back
            </button>

            {/* LEAVE COMMUNITY BUTTON (Backend Action) */}
            {details.is_member && (
                <button 
                    onClick={async () => {
                        if (window.confirm(`Are you sure you want to leave ${details.name}?`)) {
                            await callBackend('leave_community', [currentUserId, commId]);
                            onLeave(); // Go back after leaving
                        }
                    }} 
                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/50 text-sm px-4 py-2 rounded transition"
                >
                    Leave Community
                </button>
            )}
        </div>
      </div>

      {/* PINNED MESSAGES AREA */}
      {pinnedMsgs.length > 0 && (
        <div className="bg-cyan-supernova/10 border-b border-cyan-supernova/20 p-2 flex flex-col gap-1">
            <div className="text-[10px] text-cyan-supernova font-bold uppercase tracking-widest mb-1">📌 Pinned Transmissions</div>
            {pinnedMsgs.map((m, idx) => (
                <div key={idx} className="text-xs text-white truncate px-2">
                    <span className="font-bold text-cyan-supernova">{m.sender}: </span>
                    {m.content}
                </div>
            ))}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {details.messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.senderId === parseInt(currentUserId) ? "items-end" : "items-start"}`}>
             <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${m.senderId === parseInt(currentUserId) ? "text-cyan-supernova" : "text-cosmic-purple"}`}>{m.sender}</span>
                {/* Mod Ban Button (Only visible if you are mod and sender is not you) */}
                {details.is_mod && m.senderId !== parseInt(currentUserId) && (
                    <button onClick={() => handleBan(m.senderId)} className="text-[10px] text-red-500 hover:text-red-400 font-bold border border-red-500/30 px-1 rounded">BAN</button>
                )}
             </div>
             
             <div className="flex items-end gap-2 group relative">
                {/* Message Bubble */}
                <div className={`px-4 py-2 rounded-lg max-w-[70%] ${m.pinned ? "border-l-4 border-l-cyan-supernova" : ""} ${m.senderId === parseInt(currentUserId) ? "bg-cyan-supernova/10 border border-cyan-supernova/30 text-white" : "bg-white/5 border border-white/10 text-gray-200"}`}>
                  {m.content}
                </div>

                {/* Vote & Mod Tools */}
                <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition">
                     {/* Mod Tools */}
                     {details.is_mod && (
                        <div className="flex gap-1 mb-1">
                            <button onClick={() => handlePin(m.index)} title="Pin" className="text-xs text-yellow-400 hover:scale-110">📌</button>
                            <button onClick={() => handleDelete(m.index)} title="Delete" className="text-xs text-red-500 hover:scale-110">🗑️</button>
                        </div>
                     )}
                     
                     <button onClick={() => handleVote(m.index)} className="hover:text-cyan-supernova text-gray-500">▲</button>
                     <span className="text-[10px] font-bold text-gray-400">{m.votes || 0}</span>
                </div>
             </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-void-black/50">
        {details.is_member ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              className="flex-1 bg-deep-void p-3 rounded-lg border border-white/10 text-white focus:border-cyan-supernova outline-none"
              placeholder={`Message #${details.name}...`}
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
            />
            <button type="submit" className="bg-cyan-supernova text-black font-bold px-6 rounded-lg hover:bg-cyan-supernova/80">SEND</button>
          </form>
        ) : (
          <div className="flex justify-center items-center gap-4">
            <button onClick={handleJoin} className="bg-green-500 text-black font-bold px-6 py-2 rounded">JOIN TO CHAT</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;