export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum Category {
  FOOD = 'ค่าอาหาร',
  SHOPPING = 'ช้อปปิ้ง',
  TRANSPORT = 'เดินทาง',
  VEHICLE = 'ผ่อนรถ/ยานพาหนะ',
  HOUSING = 'ค่าบ้าน/หอพัก',
  INTERNET = 'เน็ต/โทรศัพท์',
  INVESTMENT = 'หุ้น/การลงทุน',
  SALARY = 'เงินเดือน',
  BONUS = 'โบนัส',
  OTHER = 'อื่นๆ'
}

export interface Transaction {
  id: string;
  date: string; // ISO Date String
  item: string;
  category: string;
  amount: number;
  type: TransactionType;
  note?: string; // Ticker symbol for investments
  units?: number; // Number of shares for investments
  slipImage?: string; // Base64 string of the slip
}

export interface UserProfile {
  id: string; // Username
  name: string;
  isLoggedIn: boolean;
}

export interface PortfolioItem {
  symbol: string;
  totalUnits: number;
  totalCost: number;
  avgCost: number;
  marketPrice: number;
  marketValue: number;
  plAmount: number;
  plPercentage: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
}

export type ViewState = 'dashboard' | 'add' | 'portfolio' | 'chat';

export type SummaryPeriod = 'day' | 'week' | 'month';