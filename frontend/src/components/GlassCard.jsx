import React from 'react';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`
      bg-nebula-blue/30 
      backdrop-blur-md 
      border border-white/10 
      rounded-2xl 
      p-6 
      shadow-lg 
      text-white 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default GlassCard;