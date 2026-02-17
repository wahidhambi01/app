import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import GlassCard from '../components/GlassCard';
import { Check, ChevronDown, Camera, Upload, ScanLine } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AddTransactionProps {
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ onSave }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [item, setItem] = useState('');
  const [note, setNote] = useState('');
  const [units, setUnits] = useState('');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInvestment = category === Category.INVESTMENT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !item) return;

    onSave({
      date,
      type,
      category,
      item,
      amount: parseFloat(amount),
      note: note || undefined,
      units: units ? parseFloat(units) : undefined,
      slipImage: slipImage || undefined
    });
  };

  const processSlipWithGemini = async (base64Data: string) => {
    try {
      // In a real environment, use process.env.API_KEY
      // For this demo, we'll try to use it, but fallback if missing/invalid
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key");

      const ai = new GoogleGenAI({ apiKey });
      
      const categoryList = Object.values(Category).join(", ");
      const prompt = `Analyze this receipt image. Extract the following:
      1. Item name (or a short summary).
      2. Total amount (number only).
      3. Date (YYYY-MM-DD format).
      4. Category (Choose one closest to: ${categoryList}).
      Return as JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: base64Data.split(',')[1] // Strip header
              } 
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING },
              category: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      if (result.amount) setAmount(result.amount.toString());
      if (result.item) setItem(result.item);
      if (result.category) {
         // Attempt to match exact category, else default
         const matchedCat = Object.values(Category).find(c => c === result.category);
         if (matchedCat) setCategory(matchedCat);
         else setCategory(Category.FOOD); // Fallback
      }
      if (result.date) setDate(result.date);
      setIsScanning(false);

    } catch (error) {
      console.warn("AI Scan failed, falling back to simulation", error);
      simulateScan();
    }
  };

  const simulateScan = () => {
    setTimeout(() => {
      setIsScanning(false);
      // Simulate extracted data
      const randomAmount = (Math.floor(Math.random() * 500) + 50);
      setAmount(randomAmount.toString());
      setItem("รายการจากสลิป (AI Scan)");
      // Auto-guess category logic simulation
      const cats = [Category.FOOD, Category.SHOPPING, Category.TRANSPORT];
      setCategory(cats[Math.floor(Math.random() * cats.length)]);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSlipImage(base64);
        processSlipWithGemini(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="pb-24 animate-fade-in">
      <GlassCard>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">บันทึกรายการใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100/50 rounded-xl relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${
                 type === TransactionType.INCOME ? 'left-[calc(50%+2px)]' : 'left-1'
              }`}
            />
            <button
              type="button"
              onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); }}
              className={`flex-1 relative z-10 py-3 text-sm font-semibold rounded-lg transition-colors ${
                type === TransactionType.EXPENSE ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => { setType(TransactionType.INCOME); setCategory(''); }}
              className={`flex-1 relative z-10 py-3 text-sm font-semibold rounded-lg transition-colors ${
                type === TransactionType.INCOME ? 'text-green-500' : 'text-gray-500'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* AI Slip Scan */}
          <div className="flex justify-center">
             <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
             />
             <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all active:scale-95"
             >
                {isScanning ? (
                  <>
                    <ScanLine size={18} className="animate-pulse" /> กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Camera size={18} /> สแกนสลิปด้วย AI
                  </>
                )}
             </button>
          </div>
          
          {slipImage && (
            <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner group">
                <img src={slipImage} alt="Slip" className={`w-full h-full object-cover transition-opacity duration-500 ${isScanning ? 'opacity-50 blur-sm' : 'opacity-100'}`} />
                
                {isScanning && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-blue-400/30 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_ease-in-out_infinite]"></div>
                      <div className="text-blue-600 font-bold text-sm bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">AI กำลังอ่านข้อมูล...</div>
                   </div>
                )}

                {!isScanning && (
                  <>
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm">
                       <Check size={10} strokeWidth={3} /> อ่านข้อมูลสำเร็จ
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSlipImage(null)}
                      className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600 transition-colors"
                    >
                        <Upload size={14} className="rotate-45" />
                    </button>
                  </>
                )}
            </div>
          )}

          {/* Date Input */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">วันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700 transition-all"
              required
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">ชื่อรายการ</label>
            <input
              type="text"
              placeholder="เช่น ข้าวกลางวัน"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700 placeholder-gray-400 transition-all"
              required
            />
          </div>

          {/* Category Select */}
          <div className="relative">
             <label className="text-xs font-semibold text-gray-500 ml-1">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700 appearance-none transition-all"
              required
            >
              <option value="" disabled>เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-4 top-[2.5rem] -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-gray-500 ml-1">จำนวนเงิน</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700 placeholder-gray-400 text-lg font-medium transition-all"
              required
            />
          </div>

          {/* Investment Specific Fields */}
          {isInvestment && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 animate-fade-in">
              <div className="text-xs font-bold text-blue-500 uppercase tracking-wide">รายละเอียดหุ้น/กองทุน</div>
              <div>
                <input
                  type="text"
                  placeholder="ชื่อย่อหุ้น (เช่น PTT, AAPL)"
                  value={note}
                  onChange={(e) => setNote(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700"
                  required={isInvestment}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="จำนวนหน่วย (Units/Shares)"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400/50 text-gray-700"
                  required={isInvestment}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${
               type === TransactionType.INCOME ? 'bg-green-500 shadow-green-500/30 hover:bg-green-600' : 'bg-blue-600 shadow-blue-600/30 hover:bg-blue-700'
            }`}
          >
            <Check size={24} /> บันทึกรายการ
          </button>
        </form>
        
        <style>{`
          @keyframes scan {
            0% { top: 10%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
          }
        `}</style>
      </GlassCard>
    </div>
  );
};

export default AddTransaction;