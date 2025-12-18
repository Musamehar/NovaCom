import React, { useState, useEffect } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const Notifications = ({ currentUserId }) => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    callBackend('get_pending_requests', [currentUserId]).then(data => {
        if (Array.isArray(data)) setRequests(data);
    });
  };

  useEffect(() => { fetchRequests(); }, [currentUserId]);

  const handleAccept = async (requesterId) => {
      await callBackend('accept_request', [currentUserId, requesterId]);
      fetchRequests(); // Refresh list
      alert("Connection Confirmed.");
  };

  const handleDecline = async (requesterId) => {
      await callBackend('decline_request', [currentUserId, requesterId]);
      fetchRequests();
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-orbitron text-white mb-6">Incoming Signals</h2>
      
      {requests.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
              <p>No pending connection requests.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {requests.map(req => (
                  <GlassCard key={req.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-black">
                              {req.avatar && req.avatar !== "NULL" ? <img src={req.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full font-bold text-gray-500">{req.name[0]}</div>}
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-white">{req.name}</h3>
                              <p className="text-xs text-gray-400">Wants to connect</p>
                          </div>
                      </div>
                      
                      <div className="flex gap-3">
                          <button onClick={() => handleAccept(req.id)} className="bg-green-500 text-black font-bold px-4 py-2 rounded hover:bg-green-400 transition">
                              CONFIRM
                          </button>
                          <button onClick={() => handleDecline(req.id)} className="bg-white/10 text-white font-bold px-4 py-2 rounded hover:bg-white/20 transition">
                              DELETE
                          </button>
                      </div>
                  </GlassCard>
              ))}
          </div>
      )}
    </div>
  );
};

export default Notifications;