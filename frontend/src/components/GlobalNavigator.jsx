import React from 'react';

const GlobalNavigator = ({ onBack, onForward, loading }) => {
    return (
        <div className="fixed bottom-10 right-10 z-[9999] flex gap-4 animate-bounce-slow">
            <button
                onClick={onBack}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-void-black/80 backdrop-blur-xl border border-cyan-supernova text-cyan-supernova shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                title="Undo (Go Back)"
            >
                <span className="text-2xl group-hover:-rotate-45 transition-transform">⟲</span>
            </button>
            <button
                onClick={onForward}
                disabled={loading}
                className="w-14 h-14 rounded-full bg-void-black/80 backdrop-blur-xl border border-cosmic-purple text-cosmic-purple shadow-[0_0_20px_rgba(108,99,255,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                title="Redo (Go Forward)"
            >
                <span className="text-2xl group-hover:rotate-45 transition-transform">⟳</span>
            </button>
        </div>
    );
};

export default GlobalNavigator;