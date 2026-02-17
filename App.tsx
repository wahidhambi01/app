import React, { useState, useEffect } from 'react';
import { Transaction, ViewState, UserProfile } from './types';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Portfolio from './pages/Portfolio';
import LoginScreen from './components/LoginScreen';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
     const savedUser = localStorage.getItem('currentUser');
     return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load transactions based on User ID
  useEffect(() => {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        const savedData = localStorage.getItem(`data_${user.id}`);
        setTransactions(savedData ? JSON.parse(savedData) : []);
    } else {
        localStorage.removeItem('currentUser');
        setTransactions([]);
    }
  }, [user]);

  // Save transactions when changed
  useEffect(() => {
    if (user) {
        localStorage.setItem(`data_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [...prev, transaction]);
    setCurrentView('dashboard');
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่ไหม?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleLogout = () => {
      setUser(null);
  };

  if (!user) {
      return (
          <div className="min-h-screen w-full relative overflow-hidden bg-[#f3f4f6]">
             <div className="fixed top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-300 rounded-full blur-3xl opacity-40 animate-pulse -z-10" />
             <LoginScreen onLogin={setUser} />
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-blue-200 selection:text-blue-900 bg-[#f3f4f6]">
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-300 rounded-full blur-3xl opacity-40 animate-pulse -z-10" />
      <div className="fixed bottom-[10%] right-[-5%] w-[250px] h-[250px] bg-purple-300 rounded-full blur-3xl opacity-40 animate-pulse -z-10" style={{ animationDelay: '1s' }} />

      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen p-5 pt-8">
        
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {user.name} AI Budget
            </h1>
            <p className="text-xs text-gray-500 font-medium">จัดการเงินอัจฉริยะ</p>
          </div>
          <div 
             onClick={handleLogout}
             className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform"
             title="ออกจากระบบ"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Views */}
        <div className="relative">
          {currentView === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          )}
          
          {currentView === 'add' && (
            <AddTransaction onSave={handleAddTransaction} />
          )}

          {currentView === 'portfolio' && (
            <Portfolio transactions={transactions} />
          )}
          
          {currentView === 'chat' && (
            <ChatBot transactions={transactions} userName={user.name} />
          )}
        </div>
      </main>

      {/* Navigation */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      
      {/* Inline styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;