import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div 
      className={`
        bg-white/70 backdrop-blur-xl 
        border border-white/40 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
        rounded-2xl 
        ${noPadding ? '' : 'p-5'} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;