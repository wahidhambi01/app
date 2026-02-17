import React, { useState } from 'react';
import { UserProfile } from '../types';
import GlassCard from './GlassCard';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Validation: Username must be at least 4 characters
  const validateID = (val: string) => val.trim().length >= 4;
  
  // Validation: Password must be 6 digits (keeping existing rule for simplicity unless requested otherwise)
  const validatePass = (val: string) => /^\d{6}$/.test(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateID(id)) {
      setError('ชื่อผู้ใช้งานต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (!validatePass(password)) {
      setError('กรุณากรอกรหัสผ่านตัวเลข 6 หลัก');
      return;
    }

    // Local Storage Logic
    const storedUser = localStorage.getItem(`user_${id}`);
    
    if (isRegistering) {
        if (!name) { setError('กรุณาระบุชื่อ'); return; }
        if (storedUser) { setError('ชื่อผู้ใช้งานนี้มีอยู่แล้ว'); return; }
        
        const newUser: UserProfile = { id, name, isLoggedIn: true };
        localStorage.setItem(`user_${id}`, JSON.stringify({ ...newUser, password })); // In real app, hash password!
        onLogin(newUser);
    } else {
        if (!storedUser) { setError('ไม่พบผู้ใช้งาน กรุณาลงทะเบียน'); return; }
        const parsed = JSON.parse(storedUser);
        if (parsed.password !== password) { setError('รหัสผ่านไม่ถูกต้อง'); return; }
        
        onLogin({ id: parsed.id, name: parsed.name, isLoggedIn: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          AI Budget
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">เข้าสู่ระบบเพื่อจัดการการเงินของคุณ</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
             <div>
                <label className="text-xs font-semibold text-gray-500 ml-1">ชื่อเรียก (Nickname)</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="เช่น พี่หมอ, น้องพลอย"
                />
             </div>
          )}
          
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">ชื่อผู้ใช้งาน (Username)</label>
            <input 
              type="text" 
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ตั้งชื่อผู้ใช้งาน..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">รหัสผ่าน (ตัวเลข 6 หลัก)</label>
            <input 
              type="password" 
              maxLength={6}
              value={password}
              onChange={e => setPassword(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="xxxxxx"
            />
          </div>

          {error && <div className="text-red-500 text-xs text-center">{error}</div>}

          <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">
             {isRegistering ? 'ลงทะเบียนใช้งาน' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-4 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-sm text-blue-600 hover:underline"
            >
                {isRegistering ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ผู้ใช้งานใหม่? ลงทะเบียน'}
            </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default LoginScreen;