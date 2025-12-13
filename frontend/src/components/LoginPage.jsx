import React, { useState } from 'react';
import { callBackend } from '../api';
import GlassCard from './GlassCard';
import TagSelector from './TagSelector';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "", password: "", email: "", avatar: "", tags: ["Gaming"]
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      // REGISTER
      if (!formData.username || !formData.password) return setError("Missing fields");
      const tagsStr = formData.tags.join(',');
      
      const res = await callBackend('register', [
        formData.username, formData.email || "none", formData.password, formData.avatar || "none", tagsStr
      ]);
      
      if (res.error) setError(res.error);
      else onLogin(res.id); // Success -> Login
    } else {
      // LOGIN
      const res = await callBackend('login', [formData.username, formData.password]);
      if (res.error) setError(res.error);
      else onLogin(res.id);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void-black bg-[url('/bg.jpg')] bg-cover">
      <GlassCard className="w-full max-w-md p-8 border-cyan-supernova/30">
        <h1 className="font-orbitron text-4xl text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-supernova to-cosmic-purple">
          NOVA COM
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Username" 
            className="w-full bg-deep-void p-3 rounded border border-white/10 text-white focus:border-cyan-supernova outline-none"
            value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full bg-deep-void p-3 rounded border border-white/10 text-white focus:border-cyan-supernova outline-none"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {isRegistering && (
            <>
              <input 
                type="email" placeholder="Email" 
                className="w-full bg-deep-void p-3 rounded border border-white/10 text-white focus:border-cyan-supernova outline-none"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="text" placeholder="Avatar URL (Image Link)" 
                className="w-full bg-deep-void p-3 rounded border border-white/10 text-white focus:border-cyan-supernova outline-none"
                value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})}
              />
              <div>
                <label className="text-xs text-gray-400">Select Interests:</label>
                <TagSelector selectedTags={formData.tags} setSelectedTags={t => setFormData({...formData, tags: t})} />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}

          <button type="submit" className="w-full bg-cyan-supernova text-black font-bold py-3 rounded hover:scale-105 transition">
            {isRegistering ? "INITIALIZE ACCOUNT" : "ESTABLISH LINK"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400 text-sm cursor-pointer hover:text-white" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an ID? Login" : "New User? Create Identity"}
        </p>
      </GlassCard>
    </div>
  );
};

export default LoginPage;