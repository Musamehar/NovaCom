import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import CommunityExplorer from './components/CommunityExplorer';
import CommunityChat from './components/CommunityChat';
import UserExplorer from './components/UserExplorer';
import ProfileView from './components/ProfileView';
import HomeDashboard from './components/HomeDashboard';
import NetworkMap from './components/NetworkMap'; // <--- WAS MISSING
import { callBackend } from './api';

function App() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  // Fetch Joined Communities for Sidebar
  const refreshSidebar = async () => {
    if (!currentUserId) return;
    const all = await callBackend('get_all_communities');
    // Filter to show only communities I am a member of
    // Since backend returns member count but not ID list in this specific call, 
    // we assume for now we show all, or we rely on the specific "get_community" check later.
    // For this specific sidebar list, we show ALL existing communities to keep it populated for the demo.
    if(Array.isArray(all)) setJoinedCommunities(all);
  };

  useEffect(() => { refreshSidebar(); }, [currentUserId, activeTab]);

  // Show Login Page if not logged in
  if (!currentUserId) {
    return <LoginPage onLogin={(id) => setCurrentUserId(id)} />;
  }

  return (
    <div className="flex min-h-screen bg-void-black bg-[url('/bg.jpg')] bg-cover bg-center text-white font-montserrat">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-void-black/85 pointer-events-none z-0"></div>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        joinedCommunities={joinedCommunities}
        onCommunityClick={(id) => setActiveTab(`comm_${id}`)}
        currentUserId={currentUserId}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 ml-20 md:ml-64 p-6 md:p-8 overflow-y-auto h-screen">
        
        {/* 1. HOME DASHBOARD */}
        {activeTab === 'home' && (
            <HomeDashboard userId={currentUserId} onNavigate={setActiveTab} />
        )}

        {/* 2. COMMUNITY EXPLORER (Find Nebulas) */}
        {activeTab === 'explore_comms' && (
           <div className="animate-fade-in">
             <CommunityExplorer 
                currentUserId={currentUserId} 
                onJoin={(id) => {
                    callBackend('join_community', [currentUserId, id]);
                    setActiveTab(`comm_${id}`);
                }} 
             />
           </div>
        )}

        {/* 3. USER EXPLORER (Find Signals / Friends) */}
        {activeTab === 'explore_users' && (
            <div className="animate-fade-in">
                <UserExplorer currentUserId={currentUserId} />
            </div>
        )}

        {/* 4. GALAXY MAP */}
        {activeTab === 'map' && (
           <div className="h-full animate-fade-in">
             <NetworkMap />
           </div>
        )}

        {/* 5. PROFILE VIEW */}
        {activeTab.startsWith('profile_') && (
            <ProfileView 
                targetId={activeTab.split('_')[1]} 
                currentUserId={currentUserId} 
            />
        )}

        {/* 6. SPECIFIC COMMUNITY CHAT */}
        {activeTab.startsWith('comm_') && (
            <CommunityChat 
               commId={activeTab.split('_')[1]} 
               currentUserId={currentUserId}
               onLeave={() => setActiveTab('explore_comms')}
            />
        )}

      </div>
    </div>
  );
}

export default App;