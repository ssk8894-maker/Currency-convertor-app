import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowUpDown, RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Star, Clock, Info, ShieldAlert, AlertTriangle, MessageSquare, Landmark,
  BarChart3, LineChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { Currency, ExchangeRates, ConversionHistoryItem } from '../types';
import { UNIQUE_CURRENCIES, generateHistoricalRates } from '../currencies';

interface CurrencyConverterProps {
  rates: ExchangeRates;
  lastUpdated: string;
  onConvert: (from: string, to: string, amount: number, result: number, rate: number) => void;
  favorites: string[];
  toggleFavorite: (code: string) => void;
  history: ConversionHistoryItem[];
  addAlert: (from: string, to: string, targetRate: number, condition: 'above' | 'below') => void;
  isDarkMode: boolean;
}

export default function CurrencyConverter({
  rates,
  lastUpdated,
  onConvert,
  favorites,
  toggleFavorite,
  history,
  addAlert,
  isDarkMode
}: CurrencyConverterProps) {
  // Input states
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<number>(1000);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

  // Timeframe for charts
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M' | '6M' | '1Y'>('1M');

  // AI Insights states
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    headline: string;
    summary: string;
    economicFactors: string[];
    recentNewsImpact: string;
  } | null>(null);

  const [isForecasting, setIsForecasting] = useState(false);
  const [aiForecast, setAiForecast] = useState<{
    trend: string;
    confidence: number;
    volatility: string;
    support: number;
    resistance: number;
    explanation: string;
    keyDeciders: string[];
  } | null>(null);

  const [aiError, setAiError] = useState<string | null>(null);

  // Alert builder states
  const [customAlertRate, setCustomAlertRate] = useState<string>('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Computed rates & conversions
  const conversionRate = useMemo(() => {
    if (!rates || !rates[fromCurrency] || !rates[toCurrency]) return 1;
    // Calculate custom cross rate (toRate / fromRate)
    const usdToFrom = rates[fromCurrency];
    const usdToTo = rates[toCurrency];
    return usdToTo / usdToFrom;
  }, [rates, fromCurrency, toCurrency]);

  const convertedResult = useMemo(() => {
    return amount * conversionRate;
  }, [amount, conversionRate]);

  // Hook to record transaction in history, debounced to avoid spamming
  useEffect(() => {
    if (amount <= 0) return;
    const timer = setTimeout(() => {
      onConvert(fromCurrency, toCurrency, amount, convertedResult, conversionRate);
    }, 1200);
    return () => clearTimeout(timer);
  }, [amount, fromCurrency, toCurrency, conversionRate, convertedResult]);

  // Generate historical chart points
  const chartData = useMemo(() => {
    return generateHistoricalRates(fromCurrency, toCurrency, timeframe, conversionRate);
  }, [fromCurrency, toCurrency, timeframe, conversionRate]);

  // Filter lists for dropdown search
  const filteredFromCurrencies = useMemo(() => {
    const q = searchFrom.toLowerCase();
    return UNIQUE_CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchFrom]);

  const filteredToCurrencies = useMemo(() => {
    const q = searchTo.toLowerCase();
    return UNIQUE_CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchTo]);

  // Swap handler
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAiExplanation(null);
    setAiForecast(null);
  };

  // AI explanation fetch
  const handleAiExplain = async () => {
    setIsExplaining(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCode: fromCurrency,
          toCode: toCurrency,
          amount,
          currentRate: conversionRate
        })
      });
      if (!response.ok) throw new Error('Failed to capture AI movement report.');
      const data = await response.json();
      setAiExplanation(data);
    } catch (err: any) {
      setAiError(err.message || 'Gemini API not available. Let AI load.');
    } finally {
      setIsExplaining(false);
    }
  };

  // AI forecast fetch
  const handleAiForecast = async () => {
    setIsForecasting(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCode: fromCurrency,
          toCode: toCurrency,
          currentRate: conversionRate
        })
      });
      if (!response.ok) throw new Error('Failed to generate predictive AI forecast.');
      const data = await response.json();
      setAiForecast(data);
    } catch (err: any) {
      setAiError(err.message || 'AI engine is currently warming up.');
    } finally {
      setIsForecasting(false);
    }
  };

  // Alert handler
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(customAlertRate);
    if (!rateVal || isNaN(rateVal)) return;

    addAlert(fromCurrency, toCurrency, rateVal, alertDirection);
    setAlertMessage(`Success! Multi-currency alert initialized when standard rate is ${alertDirection} ${rateVal}`);
    setCustomAlertRate('');
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const currentFromData = UNIQUE_CURRENCIES.find(c => c.code === fromCurrency) || UNIQUE_CURRENCIES[0];
  const currentToData = UNIQUE_CURRENCIES.find(c => c.code === toCurrency) || UNIQUE_CURRENCIES[1];

  return (
    <div className="space-y-6" id="currency-converter-section">
      {/* Primary converter card */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden" id="converter-card">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl -z-10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl -z-10 rounded-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500" />
              Live Swap Conversion
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Direct live world values updated every 10 minutes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              onClick={() => toggleFavorite(fromCurrency)}
              className={`p-2 rounded-lg border transition duration-200 ${
                favorites.includes(fromCurrency) 
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30 text-yellow-500' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600'
              }`}
              title="Favorite base currency"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button 
              onClick={() => toggleFavorite(toCurrency)}
              className={`p-2 rounded-lg border transition duration-200 ${
                favorites.includes(toCurrency) 
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30 text-yellow-500' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600'
              }`}
              title="Favorite target currency"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <span className="text-[10px] font-mono py-1 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
              UTC: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
          
          {/* FROM Input Box */}
          <div className="relative p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">From Base Currency</label>
            <div className="flex items-center gap-3">
              {/* Flag selection dropdown wrapper */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFromDropdownOpen(!isFromDropdownOpen);
                    setIsToDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50"
                >
                  <span className="text-xl">{currentFromData?.flag}</span>
                  <span>{fromCurrency}</span>
                </button>

                {/* Dropdown list */}
                <AnimatePresence>
                  {isFromDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto scrollbar-thin">
                        {filteredFromCurrencies.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setFromCurrency(c.code);
                              setIsFromDropdownOpen(false);
                              setSearchFrom('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                              c.code === fromCurrency ? 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg">{c.flag}</span>
                              <span className="font-mono font-medium">{c.code}</span>
                              <span className="truncate max-w-[120px] text-slate-400">{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Amount field */}
              <input
                type="number"
                value={amount === 0 ? '' : amount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setAmount(isNaN(val) ? 0 : val);
                }}
                className="w-full text-right bg-transparent text-xl font-bold font-mono outline-none text-slate-800 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-1.5 font-sans">
              {currentFromData?.name}
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-3 mx-auto rounded-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-lg transition duration-300 hover:rotate-180 flex items-center justify-center cursor-pointer"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>

          {/* TO Input Box */}
          <div className="relative p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">To Target Currency</label>
            <div className="flex items-center gap-3">
              {/* Flag selection dropdown wrapper */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsToDropdownOpen(!isToDropdownOpen);
                    setIsFromDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50"
                >
                  <span className="text-xl">{currentToData?.flag}</span>
                  <span>{toCurrency}</span>
                </button>

                {/* Dropdown list */}
                <AnimatePresence>
                  {isToDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input
                          type="text"
                          placeholder="Search currency..."
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto scrollbar-thin">
                        {filteredToCurrencies.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setToCurrency(c.code);
                              setIsToDropdownOpen(false);
                              setSearchTo('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                              c.code === toCurrency ? 'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg">{c.flag}</span>
                              <span className="font-mono font-medium">{c.code}</span>
                              <span className="truncate max-w-[120px] text-slate-400">{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400">{c.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Amount result */}
              <input
                type="text"
                readOnly
                value={convertedResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                className="w-full text-right bg-transparent text-xl font-bold font-mono outline-none text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-1.5 font-sans">
              {currentToData?.name}
            </div>
          </div>

        </div>

        {/* Real-time ticker info */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-slate-400" />
            <span>Interactive Exchange Value:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-300 font-mono">
              1 {fromCurrency} = {conversionRate.toFixed(5)} {toCurrency}
            </span>
          </div>
          <div className="font-mono text-slate-400">
            Inverse rate: 1 {toCurrency} = {(1 / conversionRate).toFixed(5)} {fromCurrency}
          </div>
        </div>

        {/* AI Control buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleAiExplain}
            disabled={isExplaining || amount <= 0}
            className="py-2.5 px-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
          >
            <Sparkles className={`w-4 h-4 ${isExplaining ? 'animate-spin' : ''}`} />
            {isExplaining ? 'AI processing...' : 'Explain Rate Movements'}
          </button>
          
          <button
            onClick={handleAiForecast}
            disabled={isForecasting}
            className="py-2.5 px-4 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
          >
            <LineChart className={`w-4 h-4 ${isForecasting ? 'animate-bounce' : ''}`} />
            {isForecasting ? 'Querying Gemini...' : 'Analyze Market Forecast'}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Error loading AI modules: {aiError}. Check your internet connection or Gemini API key.</span>
        </div>
      )}

      {/* AI Explanation Result card */}
      <AnimatePresence>
        {aiExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CurrencyX Intelligent Analysis
            </div>

            <h3 className="text-md font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              {aiExplanation.headline}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {aiExplanation.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" />
                  Primary Economic Drivers
                </h4>
                <ul className="space-y-1.5">
                  {aiExplanation.economicFactors.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Recent Global Context
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {aiExplanation.recentNewsImpact || "Stable macroeconomic policies and global balance of payments remain central elements regarding this valuation pair."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Market Forecast result CARD */}
      <AnimatePresence>
        {aiForecast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 text-[10px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              CXAI Trend Forecasting
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold py-0.5 px-2.5 rounded-full ${
                    aiForecast.trend === 'Bullish' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                    aiForecast.trend === 'Bearish' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    Trend Direction: {aiForecast.trend}
                  </span>
                  
                  <span className="text-xs font-medium text-slate-400">
                    Volatility: <strong className="text-indigo-600 dark:text-indigo-400">{aiForecast.volatility}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {aiForecast.explanation}
                </p>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">Key indicators to watch:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiForecast.keyDeciders.map((item, idx) => (
                      <div key={idx} className="p-2 rounded bg-white/60 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical confidence, resistance stats column */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Forecast Confidence:</span>
                    <span className="font-mono font-semibold">{aiForecast.confidence}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${aiForecast.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Resistance level:</span>
                    <span className="font-mono font-semibold text-red-500">
                      {aiForecast.resistance ? aiForecast.resistance.toFixed(4) : (conversionRate * 1.01).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Support level:</span>
                    <span className="font-mono font-semibold text-emerald-500">
                      {aiForecast.support ? aiForecast.support.toFixed(4) : (conversionRate * 0.99).toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-4 leading-normal flex items-start gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Not investment guidelines or legal financial advice.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical charts container */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg" id="chart-panel">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-md font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-emerald-500" />
              Trend Visualizer & Analysis Chart
            </h3>
            <p className="text-xs text-slate-500">
              Interactive price fluctuations for <span className="font-semibold">{fromCurrency}/{toCurrency}</span>.
            </p>
          </div>

          {/* Timeframe switchers */}
          <div className="flex bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700/60">
            {(['1D', '7D', '1M', '6M', '1Y'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`py-1 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                  timeframe === t 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* High-fidelity Recharts AreaChart */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1f2937" : "#f1f5f9"} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', 
                  borderRadius: '10px',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
                formatter={(val: number) => [val.toFixed(5), `${fromCurrency}/${toCurrency}`]}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#chartGlow)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic quote metrics below chart */}
        <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Period High</span>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
              {Math.max(...chartData.map(p => p.rate)).toFixed(5)}
            </span>
          </div>
          <div className="text-center border-x border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Period Low</span>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
              {Math.min(...chartData.map(p => p.rate)).toFixed(5)}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Fluctuation</span>
            <span className={`font-mono text-xs font-bold ${
              chartData[chartData.length - 1]?.rate >= chartData[0]?.rate ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {(((chartData[chartData.length - 1]?.rate - chartData[0]?.rate) / chartData[0]?.rate) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Extreme rate trigger system (Interactive alert set) */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg" id="creation-alerts">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 mb-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Cross-Border Rate Alert System
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Set up automatic alarm thresholds for {fromCurrency} to {toCurrency}.
        </p>

        {alertMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold leading-relaxed">
            {alertMessage}
          </div>
        )}

        <form onSubmit={handleCreateAlert} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="w-full">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Target Rate Indicator</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={customAlertRate}
                onChange={(e) => setCustomAlertRate(e.target.value)}
                placeholder={`e.g. ${(conversionRate * 1.02).toFixed(4)}`}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-800 dark:text-white"
                required
              />
              <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">{toCurrency}</span>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Condition</label>
            <select
              value={alertDirection}
              onChange={(e) => setAlertDirection(e.target.value as 'above' | 'below')}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-800 dark:text-white font-medium"
            >
              <option value="above">Rises Above (&gt;)</option>
              <option value="below">Falls Below (&lt;)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 hover:bg-slate-800 dark:hover:bg-slate-700 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0"
          >
            Create Alert
          </button>
        </form>
      </div>
    </div>
  );
}
