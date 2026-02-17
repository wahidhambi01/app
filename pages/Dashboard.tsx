import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trash2, TrendingDown, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Transaction, TransactionType, Category, SummaryPeriod } from '../types';
import { CATEGORY_COLORS } from '../constants';
import GlassCard from '../components/GlassCard';

interface DashboardProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onDelete, currentDate, onDateChange }) => {
  const [period, setPeriod] = useState<SummaryPeriod>('month');

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const now = new Date(currentDate);

      if (period === 'day') {
        return tDate.toDateString() === now.toDateString();
      } else if (period === 'week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return tDate >= firstDay && tDate <= lastDay;
      } else {
        // Month
        return tDate.getMonth() === currentDate.getMonth() && 
               tDate.getFullYear() === currentDate.getFullYear();
      }
    });
  }, [transactions, currentDate, period]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let investment = 0;
    const chartDataMap: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        if (t.category === Category.INVESTMENT) {
          investment += t.amount;
        } else {
          expense += t.amount;
          chartDataMap[t.category] = (chartDataMap[t.category] || 0) + t.amount;
        }
      }
    });

    const chartData = Object.keys(chartDataMap).map(cat => ({
      name: cat,
      value: chartDataMap[cat],
      color: CATEGORY_COLORS[cat] || '#ccc'
    }));

    return { income, expense, investment, balance: income - expense - investment, chartData };
  }, [filteredTransactions]);

  const sortedHistory = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    onDateChange(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    onDateChange(newDate);
  };

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Date Selectors */}
      <div className="flex gap-4">
        <GlassCard className="flex-1 !p-2">
          <select 
            value={currentDate.getMonth()} 
            onChange={handleMonthChange}
            className="w-full bg-transparent border-none text-blue-600 font-semibold text-center focus:ring-0 outline-none"
          >
            {thaiMonths.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </GlassCard>
        <GlassCard className="flex-1 !p-2">
          <select 
            value={currentDate.getFullYear()} 
            onChange={handleYearChange}
            className="w-full bg-transparent border-none text-blue-600 font-semibold text-center focus:ring-0 outline-none"
          >
            {[0, 1, 2].map(offset => {
              const y = new Date().getFullYear() - offset;
              return <option key={y} value={y}>{y + 543} (ค.ศ. {y})</option>;
            })}
          </select>
        </GlassCard>
      </div>

      {/* Period Toggle Bar */}
      <GlassCard className="!p-1 flex justify-between items-center bg-gray-100/50">
        {(['day', 'week', 'month'] as SummaryPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'day' && 'รายวัน'}
            {p === 'week' && 'รายสัปดาห์'}
            {p === 'month' && 'รายเดือน'}
          </button>
        ))}
      </GlassCard>

      {/* Balance Card */}
      <GlassCard className="text-center relative overflow-hidden">
        <div className="text-gray-500 text-sm mb-1">ยอดคงเหลือสุทธิ ({period === 'day' ? 'วันนี้' : period === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'})</div>
        <div className={`text-4xl font-bold tracking-tight ${summary.balance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
          {summary.balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          <span className="text-lg font-normal text-gray-400 ml-1">บาท</span>
        </div>
        
        <div className="flex justify-between mt-6 px-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <TrendingUp size={12} className="text-green-500" /> รายรับ
            </div>
            <div className="font-semibold text-green-600">{summary.income.toLocaleString()}</div>
          </div>
          <div className="w-px bg-gray-300/50 h-8 mx-2"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <TrendingDown size={12} className="text-red-500" /> รายจ่าย
            </div>
            <div className="font-semibold text-red-500">{summary.expense.toLocaleString()}</div>
          </div>
          <div className="w-px bg-gray-300/50 h-8 mx-2"></div>
          <div className="text-center">
             <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
              <TrendingUp size={12} className="text-blue-500" /> ลงทุน
            </div>
            <div className="font-semibold text-blue-600">{summary.investment.toLocaleString()}</div>
          </div>
        </div>
      </GlassCard>

      {/* Chart */}
      <GlassCard className="h-64 flex flex-col items-center justify-center">
        <h3 className="text-gray-600 font-semibold mb-2 self-start w-full text-sm uppercase tracking-wider">สัดส่วนค่าใช้จ่าย</h3>
        {summary.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {summary.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                 formatter={(value: number) => value.toLocaleString()}
                 contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-400 text-sm italic">ไม่มีรายการค่าใช้จ่ายในช่วงนี้</div>
        )}
      </GlassCard>

      {/* History */}
      <GlassCard>
        <h3 className="text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wider">ประวัติรายการล่าสุด</h3>
        <div className="space-y-4">
          {sortedHistory.length === 0 ? (
             <div className="text-center text-gray-400 py-4 text-sm">ไม่พบรายการ</div>
          ) : (
            sortedHistory.map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{t.item}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(t.date).toLocaleDateString('th-TH')} • {t.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;