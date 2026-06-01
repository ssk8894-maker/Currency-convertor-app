/**
 * Types and interfaces for CurrencyX AI
 */

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string; // Emoji
}

export interface ExchangeRates {
  [currencyCode: string]: number;
}

export interface ConversionHistoryItem {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: string;
}

export interface ExchangeRateAlert {
  id: string;
  from: string;
  to: string;
  targetRate: number;
  condition: 'above' | 'below';
  isTriggered: boolean;
  createdAt: string;
}

export interface TravelBudgetItem {
  category: string;
  amountLocal: number;
  amountHome: number;
  details: string;
}

export interface TravelBudgetResult {
  destination: string;
  fromCurrency: string;
  toCurrency: string;
  durationDays: number;
  budgetStyle: 'budget' | 'mid-range' | 'luxury';
  totalLocal: number;
  totalHome: number;
  dailyLocal: number;
  dailyHome: number;
  breakdown: TravelBudgetItem[];
  aiAnalysis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HistoricalRatePoint {
  date: string;
  rate: number;
}
