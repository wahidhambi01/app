import React, { useMemo } from 'react';
import { Transaction, Category, PortfolioItem } from '../types';
import { MOCK_STOCK_PRICES } from '../constants';
import GlassCard from '../components/GlassCard';
import { TrendingUp, TrendingDown, DollarSign, Globe } from 'lucide-react';

interface PortfolioProps {
  transactions: Transaction[];
}

const Portfolio: React.FC<PortfolioProps> = ({ transactions }) => {
  
  const portfolioData = useMemo(() => {
    const stocks: Record<string, { totalUnits: number; totalCost: number }> = {};

    // Aggregate data
    transactions.forEach(t => {
      if (t.category === Category.INVESTMENT && t.note && t.units) {
        const symbol = t.note.toUpperCase();
        if (!stocks[symbol]) {
          stocks[symbol] = { totalUnits: 0, totalCost: 0 };
        }
        stocks[symbol].totalUnits += t.units;
        stocks[symbol].totalCost += t.amount;
      }
    });

    // Calculate metrics
    const items: PortfolioItem[] = Object.entries(stocks)
      .filter(([_, data]) => data.totalUnits > 0)
      .map(([symbol, data]) => {
        // Mock price logic: if constant exists use it
        // Otherwise, generate a price based on hashing the symbol to keep it consistent but "random"
        let currentPrice = MOCK_STOCK_PRICES[symbol];
        
        if (!currentPrice) {
          const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          currentPrice = (hash % 200) + 50; 
        }

        const marketValue = data.totalUnits * currentPrice;
        const plAmount = marketValue - data.totalCost;
        const plPercentage = (plAmount / data.totalCost) * 100;

        return {
          symbol,
          totalUnits: data.totalUnits,
          totalCost: data.totalCost,
          avgCost: data.totalCost / data.totalUnits,
          marketPrice: currentPrice,
          marketValue,
          plAmount,
          plPercentage
        };
      });

    return items.sort((a, b) => b.marketValue - a.marketValue);
  }, [transactions]);

  const totalPortfolioValue = portfolioData.reduce((acc, item) => acc + item.marketValue, 0);
  const totalCost = portfolioData.reduce((acc, item) => acc + item.totalCost, 0);
  const totalPL = totalPortfolioValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Portfolio Summary */}
      <GlassCard className="bg-gradient-to-br from-blue-600 to-indigo-700 !bg-opacity-90 text-white border-none shadow-blue-900/20">
        <div className="opacity-80 text-sm mb-1">มูลค่าพอร์ตลงทุนรวม</div>
        <div className="text-4xl font-bold tracking-tight mb-2">
          {totalPortfolioValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          <span className="text-lg font-normal opacity-60 ml-1">บาท</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md flex items-center gap-1 ${totalPL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {totalPL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(totalPLPercent).toFixed(2)}% ({totalPL > 0 ? '+' : ''}{totalPL.toLocaleString()})
          </span>
          <span className="opacity-60 text-xs ml-auto">ราคาล่าสุด (โดยประมาณ)</span>
        </div>
      </GlassCard>

      {/* Stock List */}
      <GlassCard>
        <h3 className="text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <Globe size={16} /> สินทรัพย์ของคุณ (US & Thai)
        </h3>
        
        <div className="space-y-4">
          {portfolioData.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              ยังไม่มีการลงทุน เริ่มต้นโดยการเพิ่มรายการหมวด "หุ้น/การลงทุน"
            </div>
          ) : (
            portfolioData.map((stock) => (
              <div key={stock.symbol} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-lg">{stock.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{stock.totalUnits.toLocaleString()} หุ้น</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ทุนเฉลี่ย: {stock.avgCost.toLocaleString()} • ตลาด: {stock.marketPrice.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-gray-800">{stock.marketValue.toLocaleString()}</div>
                  <div className={`text-xs font-medium flex items-center justify-end gap-1 ${stock.plAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                     {stock.plAmount >= 0 ? '+' : ''}{stock.plAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                     <span>({stock.plPercentage.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Portfolio;