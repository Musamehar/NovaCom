import React, { useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const UserExplorer = ({ currentUserId }) => {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const data = await callBackend('search_users', [query, tagFilter]);
    if (Array.isArray(data)) {
        setResults(data);
        setHasSearched(true);
    }
  };

  const connect = async (targetId) => {
    await callBackend('add_friend', [currentUserId, targetId]);
    alert("Signal Link Established.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-orbitron text-white">Global Signal Directory</h2>
      
      <GlassCard>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
               placeholder="Search Username..." 
               className="flex-1 bg-deep-void p-3 rounded border border-white/10 text-white focus:border-cyan-supernova outline-none"
               value={query} onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="bg-cyan-supernova text-black font-bold px-8 py-3 rounded hover:scale-105 transition">SCAN</button>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400">Filter Frequency:</span>
             <select 
                onChange={e => setTagFilter(e.target.value)} 
                className="bg-deep-void text-white p-2 rounded border border-white/10 text-sm focus:border-cyan-supernova outline-none"
             >
                <option value="All">All Frequencies</option>
                {["Gaming", "Anime", "Movies", "Student", "Adult", "Teen"].map(t => <option key={t} value={t}>{t}</option>)}
             </select>
          </div>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {hasSearched && results.length === 0 && (
             <div className="col-span-2 text-center text-gray-500 py-10">
                 No signals found on this frequency. Try broadening search parameters.
             </div>
         )}

         {results.map(u => (
            <GlassCard key={u.id} className="flex items-center gap-4 hover:border-cyan-supernova/30 transition">
               <div className="w-14 h-14 rounded-full border border-white/20 overflow-hidden bg-black">
                   {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{u.name[0]}</div>}
               </div>
               
               <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{u.name}</h3>
                  <div className="flex gap-2 text-xs mt-1">
                      <span className="text-yellow-400">✨ {u.karma}</span>
                      <span className="text-gray-500">ID: {u.id}</span>
                  </div>
               </div>
               
               {parseInt(u.id) !== parseInt(currentUserId) && (
                   <button 
                    onClick={() => connect(u.id)} 
                    className="text-xs bg-cosmic-purple hover:bg-purple-500 text-white px-4 py-2 rounded shadow-lg shadow-purple-500/20 transition"
                   >
                       Connect
                   </button>
               )}
            </GlassCard>
         ))}
      </div>
    </div>
  );
};

export default UserExplorer;