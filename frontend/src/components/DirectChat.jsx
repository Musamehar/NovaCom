import React, { useState, useEffect, useRef } from 'react';
import { callBackend } from '../api';

const DirectChat = ({ currentUserId, friendId, friendName, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // Stores { id, content }
  const scrollRef = useRef(null);

  // Poll for messages
  const fetchMessages = async () => {
    const data = await callBackend('get_dm', [currentUserId, friendId]);
    if (data && data.messages) {
        setMessages(data.messages);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [friendId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    // replyId is -1 if no reply selected
    const replyId = replyTarget ? replyTarget.id : -1;
    
    await callBackend('send_dm', [currentUserId, friendId, replyId, msgInput]);
    
    setMsgInput("");
    setReplyTarget(null); // Clear reply context
    fetchMessages();
  };

  const handleReaction = async (msgId) => {
    const reaction = prompt("Enter Emoji (e.g. ❤️, 😂):");
    if (reaction) {
        await callBackend('react_dm', [currentUserId, friendId, msgId, reaction]);
        fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-void-black">
      
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 bg-void-black/80 backdrop-blur z-20 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-orbitron text-white">@{friendName}</h2>
            <p className="text-xs text-green-400">Private Frequency</p>
        </div>
        <button onClick={onBack} className="text-gray-400 hover:text-white px-3">✕ Close</button>
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
            const isMe = m.senderId === parseInt(currentUserId);
            return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    
                    {/* MESSAGE BUBBLE */}
                    <div className={`relative max-w-[75%] group`}>
                        
                        {/* REPLY PREVIEW (Rendered above bubble) */}
                        {m.replyTo !== -1 && (
                            <div className="text-[10px] bg-white/10 p-1 rounded-t px-2 text-gray-400 border-l-2 border-gray-500 mb-0.5">
                                ↪ Replying to: {m.replyPreview || "Unknown message"}
                            </div>
                        )}

                        <div 
                            className={`p-3 rounded-lg text-sm relative ${
                                isMe ? "bg-cosmic-purple text-white" : "bg-deep-void border border-white/10 text-gray-200"
                            }`}
                            onDoubleClick={() => handleReaction(m.id)}
                        >
                            {m.content}
                            
                            {/* REACTION DISPLAY */}
                            {m.reaction && (
                                <div className="absolute -bottom-2 -right-2 bg-black/80 rounded-full px-1 text-xs border border-white/20 shadow">
                                    {m.reaction}
                                </div>
                            )}
                        </div>

                        {/* SEEN STATUS (Only for My messages) */}
                        {isMe && (
                            <div className="text-[10px] text-right mt-1 text-gray-500">
                                {m.isSeen ? <span className="text-cyan-supernova">✓✓ Seen</span> : "✓ Sent"}
                            </div>
                        )}

                        {/* HOVER TOOLS (Reply Button) */}
                        <button 
                            onClick={() => setReplyTarget({ id: m.id, content: m.content })}
                            className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white px-2"
                            style={{ [isMe ? 'left' : 'right']: '100%' }}
                            title="Reply to this message"
                        >
                            ↩
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* REPLY CONTEXT BAR */}
      {replyTarget && (
          <div className="bg-void-black border-t border-white/10 p-2 px-4 flex justify-between items-center animate-slide-up">
              <div className="text-xs text-gray-400 border-l-2 border-cyan-supernova pl-2">
                  <span className="font-bold text-cyan-supernova">Replying to:</span> {replyTarget.content}
              </div>
              <button onClick={() => setReplyTarget(null)} className="text-gray-500 hover:text-white">✕</button>
          </div>
      )}

      {/* INPUT */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-void-black/80 flex gap-2">
        <input 
            className="flex-1 bg-deep-void p-3 rounded-lg border border-white/10 text-white focus:border-cyan-supernova outline-none placeholder-gray-600"
            placeholder={replyTarget ? "Type your reply..." : "Send a secure message..."}
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
        />
        <button type="submit" className="bg-cyan-supernova text-black font-bold px-6 rounded-lg hover:bg-cyan-supernova/80">
            SEND
        </button>
      </form>
    </div>
  );
};

export default DirectChat;