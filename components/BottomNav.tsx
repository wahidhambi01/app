import React from 'react';
import { Home, PlusCircle, TrendingUp, MessageSquareMore } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full shadow-2xl">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`transition-all duration-300 transform ${
            currentView === 'dashboard' ? 'text-blue-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
        </button>

        <button
          onClick={() => onNavigate('add')}
          className={`transition-all duration-300 transform ${
            currentView === 'add' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PlusCircle size={32} strokeWidth={currentView === 'add' ? 2.5 : 2} />
        </button>

        <button
          onClick={() => onNavigate('portfolio')}
          className={`transition-all duration-300 transform ${
            currentView === 'portfolio' ? 'text-blue-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <TrendingUp size={24} strokeWidth={currentView === 'portfolio' ? 2.5 : 2} />
        </button>
        
        <button
          onClick={() => onNavigate('chat')}
          className={`transition-all duration-300 transform ${
            currentView === 'chat' ? 'text-blue-600 -translate-y-1' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageSquareMore size={24} strokeWidth={currentView === 'chat' ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;