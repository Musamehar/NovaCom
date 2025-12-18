import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { callBackend } from '../api';
import PollMessage from './PollMessage';
import CreatePollModal from './CreatePollModal';

const CommunityChat = ({ commId, currentUserId, onLeave, onAbout }) => {
  const [details, setDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  
  // UI STATES
  const [showPollModal, setShowPollModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); 
  const [expandedImage, setExpandedImage] = useState(null);

  // RECORDING STATE
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Pagination State
  const [offset, setOffset] = useState(0);
  const [totalMsgs, setTotalMsgs] = useState(0);
  const [loading, setLoading] = useState(false);
  const MSG_LIMIT = 50;

  // Refs
  const scrollContainerRef = useRef(null);
  const prevScrollHeight = useRef(0);
  const isAtBottom = useRef(true);
  const loadingHistory = useRef(false);
  const fileInputRef = useRef(null);

  // 1. Fetch Latest
  const fetchLatest = async () => {
    if (loadingHistory.current) return;

    const data = await callBackend('get_community', [commId, currentUserId, 0, MSG_LIMIT]);
    if (data && data.id) {
        setDetails(data);
        setTotalMsgs(data.total_msgs);
        setPinnedMessages(data.messages.filter(m => m.pinned)); 
        if (offset === 0) setMessages(data.messages);
    }
  };

  useEffect(() => {
    setOffset(0); isAtBottom.current = true; fetchLatest();
    const interval = setInterval(() => { if (offset === 0) fetchLatest(); }, 2000);
    return () => clearInterval(interval);
  }, [commId]);

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    const { scrollHeight } = scrollContainerRef.current;
    if (isAtBottom.current) scrollContainerRef.current.scrollTop = scrollHeight;
    else if (prevScrollHeight.current > 0) {
        scrollContainerRef.current.scrollTop = scrollHeight - prevScrollHeight.current;
        prevScrollHeight.current = 0;
    }
  }, [messages]);

  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAtBottom.current = atBottom;

    if (scrollTop === 0 && messages.length < totalMsgs && !loading && !loadingHistory.current) {
        setLoading(true); loadingHistory.current = true; prevScrollHeight.current = scrollHeight;
        const newOffset = offset + MSG_LIMIT;
        const data = await callBackend('get_community', [commId, currentUserId, newOffset, MSG_LIMIT]);
        if (data && data.messages.length > 0) { setMessages(prev => [...data.messages, ...prev]); setOffset(newOffset); }
        setLoading(false); loadingHistory.current = false;
    }
  };

  // --- ACTIONS ---

  const sendMessage = async (content, type = "text", mediaUrl = "NONE") => {
    const replyId = replyTarget ? replyTarget.index : -1;
    // send_message <comm> <sender> <replyTo> <type> <mediaUrl> <content>
    await callBackend('send_message', [commId, currentUserId, replyId, type, mediaUrl, content]);
    setMsgInput(""); setReplyTarget(null); setOffset(0); isAtBottom.current = true; fetchLatest();
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    await sendMessage(msgInput, "text", "NONE");
  };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result;
              sendMessage("Sent an image", "image", base64);
          };
          reader.readAsDataURL(file);
      }
  };

  // --- VOICE NOTE LOGIC ---
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob); 
            reader.onloadend = () => {
                sendMessage("Voice Message 🎤", "audio", reader.result);
            };
            stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Mic error:", err);
        alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  // --- MODERATION ---
  const handleLeaveCommunity = async () => {
    if (window.confirm(`Leave ${details.name}?`)) { await callBackend('leave_community', [currentUserId, commId]); onLeave(); }
  };
  const handleVote = async (index) => { await callBackend('vote_message', [commId, currentUserId, index]); fetchLatest(); };
  const handlePin = async (index) => { await callBackend('mod_pin', [commId, currentUserId, index]); fetchLatest(); };
  const handleDelete = async (index) => { if(window.confirm("Delete?")) { await callBackend('mod_delete', [commId, currentUserId, index]); fetchLatest(); }};
  const handleBan = async (targetId) => { if(window.confirm(`Ban User ${targetId}?`)) { await callBackend('mod_ban', [commId, currentUserId, targetId]); fetchLatest(); }};
  const handleUnban = async () => { const t = prompt("User ID to Unban:"); if (t) { await callBackend('mod_unban', [commId, currentUserId, t]); alert("Done."); }};

  if (!details) return <div className="text-white text-center mt-10 animate-pulse">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative bg-void-black/50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-void-black/80 backdrop-blur z-20 shrink-0">
        <div>
          <h2 className="text-xl font-orbitron text-white flex items-center gap-2">
            <span className="text-cyan-supernova">#</span> {details.name}
            {details.is_mod && <span className="text-[10px] bg-red-500 text-white px-2 rounded">MOD</span>}
          </h2>
          <p className="text-xs text-gray-400">{details.desc}</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onAbout} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded border border-white/10">About</button>
            {details.is_mod && <button onClick={handleUnban} className="bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-1 rounded border border-white/10">Bans</button>}
            {details.is_member && <button onClick={handleLeaveCommunity} className="bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-200 text-xs px-3 py-1 rounded border border-red-500/30 transition">Leave</button>}
            <button onClick={onLeave} className="text-gray-400 hover:text-white text-sm px-2">✕</button>
        </div>
      </div>

      {/* PINNED MESSAGES */}
      {pinnedMessages.length > 0 && (
        <div className="bg-void-black/90 border-b border-cyan-supernova/30 p-2 z-10 shadow-lg shadow-cyan-supernova/5 shrink-0">
             <div className="flex items-center gap-2 text-cyan-supernova text-xs font-bold uppercase mb-1"><span>📌 Pinned</span></div>
             <div className="flex flex-col gap-1 max-h-20 overflow-y-auto scrollbar-none">
                {pinnedMessages.map((m, i) => (
                    <div key={i} className="text-sm text-white truncate flex justify-between items-center bg-white/5 p-1 rounded">
                         <span className="truncate w-11/12"><span className="font-bold text-gray-400 mr-2">{m.sender}:</span> {m.content}</span>
                         {details.is_mod && <button onClick={() => handlePin(m.index)} className="text-[10px] text-red-400 hover:text-white ml-2">Unpin</button>}
                    </div>
                ))}
             </div>
        </div>
      )}

      {/* CHAT SCROLL AREA */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
        {loading && <div className="text-center text-xs text-cyan-supernova animate-pulse pb-2">Retrieving Archives...</div>}
        
        {messages.map((m, idx) => {
            const isMe = m.senderId === parseInt(currentUserId);
            return (
              <div key={`${m.id}-${idx}`} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                 
                 {/* Message Row */}
                 <div className={`flex max-w-[90%] gap-3 group items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* AVATAR */}
                    <div className="w-8 h-8 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0">
                        {m.senderAvatar && m.senderAvatar !== "NULL" ? (
                            <img src={m.senderAvatar} className="w-full h-full object-cover" alt="p" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-bold">{m.sender[0]}</div>
                        )}
                    </div>

                    {/* BUBBLE WRAPPER */}
                    <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        
                        {!isMe && <div className="text-[10px] text-gray-400 ml-1 mb-0.5">{m.sender}</div>}

                        {/* REPLY PREVIEW */}
                        {m.replyTo > -1 && (
                            <div className={`text-xs p-2 mb-1 rounded-lg border-l-2 opacity-80 ${isMe ? "bg-white/10 border-white/50 text-gray-300" : "bg-gray-800 border-gray-500 text-gray-400"}`}>
                                <span className="opacity-60 text-[10px] uppercase block mb-0.5">Replying to:</span>
                                <span className="italic line-clamp-1 max-w-[200px]">"{m.replyPreview || "Message unavailable"}"</span>
                            </div>
                        )}

                        {/* MAIN CONTENT (Poll, Image, Audio, Text) */}
                        {m.type === "poll" ? (
                            <div className={`px-2 py-2 text-sm shadow-lg backdrop-blur-sm rounded-xl ${isMe ? "bg-cyan-supernova/10 border border-cyan-supernova/30" : "bg-white/5 border border-white/10"}`}>
                                <PollMessage poll={m.poll} msgId={m.id} commId={commId} currentUserId={currentUserId} onUpdate={fetchLatest} />
                            </div>
                        ) : m.type === "image" ? (
                            <div className={`p-1 shadow-lg backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer ${isMe ? "bg-cyan-supernova/10 border border-cyan-supernova/30" : "bg-white/5 border border-white/10"}`}>
                                <img 
                                    src={m.mediaUrl} 
                                    alt="shared" 
                                    className="max-w-[250px] max-h-[300px] rounded-lg object-cover hover:opacity-90 transition"
                                    onClick={() => setExpandedImage(m.mediaUrl)}
                                />
                            </div>
                        ) : m.type === "audio" ? (
                            <div className={`p-2 shadow-lg backdrop-blur-sm rounded-xl min-w-[260px] flex items-center justify-center ${isMe ? "bg-cyan-supernova/10 border border-cyan-supernova/30" : "bg-white/5 border border-white/10"}`}>
                                <audio 
                                    controls 
                                    src={m.mediaUrl} 
                                    className="w-full h-10 rounded-md focus:outline-none" 
                                    style={{ filter: isMe ? "invert(1) hue-rotate(180deg)" : "invert(0.9)" }} 
                                />
                            </div>
                        ) : (
                            <div className={`px-4 py-2 text-sm shadow-lg backdrop-blur-sm 
                                ${m.pinned ? "border-2 border-cyan-supernova/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]" : ""} 
                                ${isMe ? "bg-cyan-supernova/10 border border-cyan-supernova/30 text-white rounded-2xl rounded-tr-none" : "bg-white/5 border border-white/10 text-gray-200 rounded-2xl rounded-tl-none"}`}>
                                {m.content}
                            </div>
                        )}

                        {/* METADATA */}
                        <div className="absolute -bottom-5 w-full flex justify-between px-1 min-w-[60px]">
                            <span className="text-[10px] text-gray-500">{m.time}</span>
                            {m.votes > 0 && <span className="text-[10px] font-bold text-gray-400">▲ {m.votes}</span>}
                        </div>
                    </div>

                    {/* HOVER TOOLS */}
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-black/40 backdrop-blur rounded-lg p-1 border border-white/5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                         <button onClick={() => setReplyTarget({ index: m.id, content: m.type==='image'?'[Image]':m.type==='audio'?'[Audio]':m.content })} className="p-1.5 text-gray-500 hover:text-cyan-supernova hover:bg-white/10 rounded" title="Reply">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                         </button>
                         <button onClick={() => handleVote(m.index)} className={`p-1.5 rounded text-xs ${m.has_voted ? "text-cyan-supernova font-bold" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>▲</button>
                         {(details.is_mod || isMe) && (
                            <>
                                {details.is_mod && <button onClick={() => handlePin(m.index)} className={`p-1.5 text-xs rounded hover:bg-white/10 ${m.pinned ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}>📌</button>}
                                <button onClick={() => handleDelete(m.index)} className="p-1.5 text-xs text-gray-400 hover:text-red-500 hover:bg-white/10 rounded">🗑️</button>
                                {details.is_mod && !isMe && <button onClick={() => handleBan(m.senderId)} className="px-1.5 py-0.5 text-[9px] text-red-500 font-bold border border-red-500/30 rounded hover:bg-red-500/10 ml-1">BAN</button>}
                            </>
                         )}
                    </div>

                 </div>
              </div>
            );
        })}
      </div>

      {/* REPLY CONTEXT BAR */}
      {replyTarget && (
          <div className="bg-black/80 border-t border-cyan-supernova/30 p-2 px-4 flex justify-between items-center animate-slide-up backdrop-blur shrink-0">
              <div className="text-xs text-gray-300 pl-2 border-l-2 border-cyan-supernova">
                  <span className="text-cyan-supernova font-bold mr-2">Replying to:</span> 
                  <span className="italic opacity-80 line-clamp-1">{replyTarget.content}</span>
              </div>
              <button onClick={() => setReplyTarget(null)} className="text-gray-500 hover:text-white hover:bg-white/10 rounded-full p-1 transition">✕</button>
          </div>
      )}

      {/* POLL MODAL */}
      {showPollModal && <CreatePollModal commId={commId} currentUserId={currentUserId} onClose={() => setShowPollModal(false)} onRefresh={fetchLatest} />}

      {/* INPUT */}
      <div className="p-4 bg-void-black/80 border-t border-white/10 shrink-0">
        {details.is_member ? (
          <form onSubmit={handleSendText} className="flex gap-2 items-center">
            
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

            {/* Tools Group */}
            <div className="flex gap-1">
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-400 hover:text-cyan-supernova p-2 rounded-full hover:bg-white/5 transition" title="Image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </button>
                <button type="button" onClick={() => setShowPollModal(true)} className="text-gray-400 hover:text-cyan-supernova p-2 rounded-full hover:bg-white/5 transition" title="Poll">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                </button>
                <button 
                    type="button" 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`p-2 rounded-full transition duration-200 ${isRecording ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_red]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    title="Hold to Record"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </button>
            </div>

            <input 
              className="flex-1 bg-deep-void px-4 py-2.5 rounded-xl border border-white/10 text-white focus:border-cyan-supernova focus:ring-1 focus:ring-cyan-supernova outline-none placeholder-gray-600 transition"
              placeholder={replyTarget ? "Type your reply..." : isRecording ? "Recording..." : `Message #${details.name}...`}
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              disabled={isRecording}
            />
            <button type="submit" className="bg-cyan-supernova text-black font-bold px-6 py-2.5 rounded-xl hover:bg-cyan-400 shadow-lg transition">SEND</button>
          </form>
        ) : (
             <div className="text-center"><button onClick={() => callBackend('join_community', [currentUserId, commId]).then(fetchLatest)} className="bg-green-500 text-black font-bold px-6 py-2 rounded shadow-lg hover:scale-105 transition">JOIN CHANNEL</button></div>
        )}
      </div>

      {/* IMAGE VIEWER */}
      {expandedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in" onClick={() => setExpandedImage(null)}>
              <button onClick={() => setExpandedImage(null)} className="absolute top-6 right-6 text-white hover:text-red-500 bg-white/10 hover:bg-white/20 p-2 rounded-full transition">✕</button>
              <img src={expandedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain cursor-default" onClick={(e) => e.stopPropagation()} alt="Enlarged"/>
          </div>
      )}

    </div>
  );
};

export default CommunityChat;