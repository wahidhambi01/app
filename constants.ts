import { Category } from './types';

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.FOOD]: '#FF6B6B',
  [Category.SHOPPING]: '#FFD93D',
  [Category.TRANSPORT]: '#4D96FF',
  [Category.VEHICLE]: '#6BCB77',
  [Category.HOUSING]: '#9A616D',
  [Category.INTERNET]: '#A8D8EA',
  [Category.INVESTMENT]: '#6C5CE7',
  [Category.SALARY]: '#00B894',
  [Category.BONUS]: '#FDCB6E',
  [Category.OTHER]: '#B2BEC3',
};

// Expanded mock data to simulate US and Thai stocks
export const MOCK_STOCK_PRICES: Record<string, number> = {
  // US Stocks (USD assumed to be converted or raw, for demo we use THB equivalent approx or raw value logic)
  'AAPL': 175.50 * 35,
  'TSLA': 240.30 * 35,
  'GOOGL': 135.20 * 35,
  'MSFT': 330.00 * 35,
  'NVDA': 460.10 * 35,
  'AMZN': 130.00 * 35,
  'META': 300.00 * 35,
  
  // Thai Stocks (THB)
  'PTT': 33.50,
  'AOT': 71.25,
  'CPALL': 62.00,
  'KBANK': 128.50,
  'SCB': 105.00,
  'DELTA': 82.00,
  'GULF': 45.00,
  'ADVANC': 220.00,
  'BDMS': 27.00,
  'SCC': 300.00,
};

export const EXPENSE_CATEGORIES = [
  Category.FOOD,
  Category.SHOPPING,
  Category.TRANSPORT,
  Category.VEHICLE,
  Category.HOUSING,
  Category.INTERNET,
  Category.INVESTMENT,
  Category.OTHER,
];

export const INCOME_CATEGORIES = [
  Category.SALARY,
  Category.BONUS,
  Category.OTHER,
];