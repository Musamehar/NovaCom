import { useState } from 'react';
import FriendList from './components/FriendList';
import RecommendationList from './components/RecommendationList';
import UserSearch from './components/UserSearch'; // Import the new component

function App() {
  const [currentUserId, setCurrentUserId] = useState(1);
  
  // This state forces components to re-fetch when we add a friend
  const [refreshKey, setRefreshKey] = useState(0); 

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-void-black bg-[url('/bg.jpg')] bg-cover bg-center text-white font-montserrat p-4 md:p-8">
      <div className="fixed inset-0 bg-void-black/80 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="font-orbitron text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-supernova to-cosmic-purple drop-shadow-glow">
              NOVA COM
            </h1>
            <p className="text-sm text-gray-400 tracking-widest">INTERSTELLAR NETWORK</p>
          </div>
          
          {/* User Switcher (For Testing) */}
          <div className="flex items-center gap-4 bg-nebula-blue/50 p-2 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="text-sm text-gray-400 pl-3">LOGGED IN AS ID:</span>
            <input 
              type="number" 
              value={currentUserId} 
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="w-12 bg-deep-void text-cyan-supernova font-bold text-center rounded border border-white/20 focus:border-cyan-supernova outline-none"
            />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-supernova to-blue-600"></div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Search & Navigation (3 Cols) */}
          <div className="md:col-span-3 space-y-6">
            {/* Search Component */}
            <UserSearch 
                currentUserId={currentUserId} 
                onFriendAdded={refreshData} 
            />

            <div className="bg-nebula-blue/40 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
               <h3 className="font-orbitron text-xl text-white">STATUS</h3>
               <div className="mt-2 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                 ONLINE
               </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Friends (5 Cols) */}
          <div className="md:col-span-5">
            {/* key={refreshKey} forces this component to reload when we add a friend */}
            <FriendList key={refreshKey} userId={currentUserId} />
          </div>

          {/* RIGHT COLUMN: Recommendations (4 Cols) */}
          <div className="md:col-span-4">
            <RecommendationList key={refreshKey} userId={currentUserId} />
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;