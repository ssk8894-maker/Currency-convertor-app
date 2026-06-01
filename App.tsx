import React, { useState, useEffect } from 'react';
import { 
  Landmark, Sliders, Plane, MessageSquare, Sun, Moon, 
  Award, TrendingUp, Sparkles, Bell, HelpCircle, Info, Clock, CheckCircle, ChevronRight, X, RefreshCw,
  Briefcase, Swords, Coins, FileText, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CurrencyConverter from './CurrencyConverter';
import MultiConverter from './MultiConverter';
import TravelHelper from './TravelHelper';
import Chatbot from './Chatbot';
import DashboardOverview from './DashboardOverview';
import TravelKit from './TravelKit';
import BusinessSuite from './BusinessSuite';
import CurrencyBattle from './CurrencyBattle';
import SpendingAnalyzer from './SpendingAnalyzer';
import EconomicDashboard from './EconomicDashboard';
import { UNIQUE_CURRENCIES } from './currencies';
import { ConversionHistoryItem, ExchangeRateAlert, ExchangeRates } from './types';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved ? saved === 'true' : true; // Default to dark mode for premium fintech feel
  });

  // Rates states
  const [rates, setRates] = useState<ExchangeRates>({});
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toUTCString());
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // User features states
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorite_currencies');
    return saved ? JSON.parse(saved) : ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  });

  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    const saved = localStorage.getItem('conversion_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<ExchangeRateAlert[]>(() => {
    const saved = localStorage.getItem('exchange_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Triggered alert toasts
  const [activeToast, setActiveToast] = useState<{ id: string; message: string } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'converter' | 'multi' | 'travel' | 'spending' | 'kit' | 'business' | 'indices' | 'battle' | 'assistant'>('converter');

  // Trigger dark mode wrapper class in HTML document body
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('favorite_currencies', JSON.stringify(favorites));
  }, [favorites]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('conversion_history', JSON.stringify(history));
  }, [history]);

  // Sync alerts
  useEffect(() => {
    localStorage.setItem('exchange_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Fetch exchange rates from full stack proxy
  const fetchRates = async () => {
    setIsLoadingRates(true);
    setRatesError(null);
    try {
      const response = await fetch('/api/rates');
      if (!response.ok) throw new Error('Unstable response from exchange rates dispatcher.');
      const data = await response.json();
      
      if (data && data.rates) {
        setRates(data.rates);
        setLastUpdated(data.last_updated);
        
        // Audit and run alert notification checks
        checkRateAlerts(data.rates);
      } else {
        throw new Error('Invalid database packet format');
      }
    } catch (e: any) {
      console.error('Failed to parse exchange rates; retaining cached values.', e);
      setRatesError(e.message || 'Connecting server failed.');
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Run rates initial fetch & configure 1 minute polling interval
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // Monitor and evaluate user target custom rate limits
  const checkRateAlerts = (currentRates: ExchangeRates) => {
    if (!alerts.length) return;

    let triggeredAlerts: string[] = [];
    const updatedAlerts = alerts.map(alert => {
      if (alert.isTriggered) return alert;

      // Extract current cross-rate
      const fromUsd = currentRates[alert.from];
      const toUsd = currentRates[alert.to];
      if (!fromUsd || !toUsd) return alert;

      const crossRate = toUsd / fromUsd;
      let matched = false;
      if (alert.condition === 'above' && crossRate >= alert.targetRate) matched = true;
      if (alert.condition === 'below' && crossRate <= alert.targetRate) matched = true;

      if (matched) {
        triggeredAlerts.push(`Alert Triggered! ${alert.from} to ${alert.to} has gone ${alert.condition} your target rate of ${alert.targetRate.toFixed(4)}. Current live rate is: ${crossRate.toFixed(4)}!`);
        return { ...alert, isTriggered: true };
      }
      return alert;
    });

    if (triggeredAlerts.length > 0) {
      setAlerts(updatedAlerts);
      setActiveToast({
        id: `toast-${Date.now()}`,
        message: triggeredAlerts.join('\n')
      });
    }
  };

  // Toggle favorite cur
  const handleToggleFavorite = (code: string) => {
    if (favorites.includes(code)) {
      setFavorites(favorites.filter(f => f !== code));
    } else {
      setFavorites([...favorites, code]);
    }
  };

  // Core conversion callback logger
  const handleAddLogItem = (from: string, to: string, amount: number, result: number, rate: number) => {
    const newItem: ConversionHistoryItem = {
      id: `h-${Date.now()}`,
      from,
      to,
      amount,
      result,
      rate,
      timestamp: new Date().toLocaleTimeString()
    };
    // Keep list capped to 15 items to save storage size
    setHistory(prev => [newItem, ...prev.slice(0, 14)]);
  };

  // Quick reload callback whenever a past conversion log is clicked
  const handleSelectHistoryItem = (from: string, to: string, amount: number) => {
    // Navigate back to core converter and load states will be triggered beautifully
    setActiveTab('converter');
    // State reload handles internally through CurrencyConverter sub-triggers if we pass setters,
    // but we can query standard window elements or refresh states.
    // To make this super clean, we can dispatch a custom internal broadcast or trigger native inputs!
    const fromSelectEl = document.querySelector(`[id="converter-card"]`);
    if (fromSelectEl) {
      fromSelectEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Create alarm alert
  const handleAddAlert = (from: string, to: string, targetRate: number, condition: 'above' | 'below') => {
    const newAlert: ExchangeRateAlert = {
      id: `a-${Date.now()}`,
      from,
      to,
      targetRate,
      condition,
      isTriggered: false,
      createdAt: new Date().toUTCString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Delete alarm alert
  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-slate-950 text-slate-150' : 'bg-slate-50 text-slate-800'
    }`} id="application-wrapper">
      
      {/* Toast Alert Threshold Banner */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-orange-600 text-white rounded-2xl p-4 shadow-2xl z-50 flex items-start gap-3 border border-orange-500"
          >
            <Bell className="w-5 h-5 flex-shrink-0 animate-bounce mt-0.5" />
            <div className="flex-grow">
              <span className="font-bold text-xs uppercase tracking-widest block mb-1">Exchange Limit Triggered</span>
              <p className="text-xs whitespace-pre-line leading-relaxed">{activeToast.message}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 transition flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
        
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center p-2.5 text-white shadow-lg shadow-emerald-500/20">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-sans">
                CurrencyX AI
                <span className="text-[9px] font-bold py-0.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center gap-0.5 select-none">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" />
                  COPILOT
                </span>
              </h1>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 font-medium">
                Modern smart exchange calculations powered by server-side Gemini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Dark mode switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-155 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition duration-200 cursor-pointer"
              title="Toggle application theme"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Manual refresh info */}
            <button
              onClick={fetchRates}
              disabled={isLoadingRates}
              className="py-2 px-3.5 rounded-xl border border-slate-155 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 transition duration-200 cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-450 ${isLoadingRates ? 'animate-spin' : ''}`} />
              Update Rates
            </button>
          </div>
        </header>

        {/* Global rates warning error if any */}
        {ratesError && (
          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/15 border border-orange-200 dark:border-orange-500/25 text-orange-600 dark:text-orange-400 text-xs flex items-center gap-3">
            <Bell className="w-5 h-5 flex-shrink-0 text-orange-500" />
            <div className="flex-grow">
              <strong>Offline Warning:</strong> {ratesError}. Reverting to cached stored exchange parameters.
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-full border border-slate-150 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('converter')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'converter' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Direct Converter
          </button>
          
          <button
            onClick={() => setActiveTab('multi')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'multi' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Multi Comparison
          </button>
          
          <button
            onClick={() => setActiveTab('travel')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'travel' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Travel Planner
          </button>

          <button
            onClick={() => setActiveTab('spending')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'spending' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            AI Spend Audit
          </button>

          <button
            onClick={() => setActiveTab('kit')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'kit' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Travel Kit
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'business' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Business Suite
          </button>

          <button
            onClick={() => setActiveTab('indices')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'indices' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Global Indices
          </button>

          <button
            onClick={() => setActiveTab('battle')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'battle' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            Trivia & Battle
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer select-none flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'assistant' 
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' 
                : 'text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI Financial Chat
          </button>
        </nav>

        {/* Dashboard Grid & Active Section Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Main Action Component */}
          <main className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'converter' && (
                <motion.div
                  key="converter"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrencyConverter 
                    rates={rates}
                    lastUpdated={lastUpdated}
                    onConvert={handleAddLogItem}
                    favorites={favorites}
                    toggleFavorite={handleToggleFavorite}
                    history={history}
                    addAlert={handleAddAlert}
                    isDarkMode={isDarkMode}
                  />
                </motion.div>
              )}

              {activeTab === 'multi' && (
                <motion.div
                  key="multi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MultiConverter rates={rates} />
                </motion.div>
              )}

              {activeTab === 'travel' && (
                <motion.div
                  key="travel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TravelHelper rates={rates} />
                </motion.div>
              )}

              {activeTab === 'spending' && (
                <motion.div
                  key="spending"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SpendingAnalyzer rates={rates} />
                </motion.div>
              )}

              {activeTab === 'kit' && (
                <motion.div
                  key="kit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TravelKit rates={rates} />
                </motion.div>
              )}

              {activeTab === 'business' && (
                <motion.div
                  key="business"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <BusinessSuite rates={rates} />
                </motion.div>
              )}

              {activeTab === 'indices' && (
                <motion.div
                  key="indices"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EconomicDashboard rates={rates} />
                </motion.div>
              )}

              {activeTab === 'battle' && (
                <motion.div
                  key="battle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CurrencyBattle rates={rates} />
                </motion.div>
              )}

              {activeTab === 'assistant' && (
                <motion.div
                  key="assistant"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Chatbot />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Sidebar Dashboard Stats panel */}
          <aside className="lg:sticky lg:top-6 space-y-6">
            <DashboardOverview 
              rates={rates}
              history={history}
              alerts={alerts}
              removeAlert={handleRemoveAlert}
              clearHistory={() => setHistory([])}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          </aside>

        </div>

        {/* Global Footer */}
        <footer className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed font-sans max-w-xl mx-auto space-y-1">
          <p className="font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            CurrencyX AI Platform (v1.0.0-PRO)
          </p>
          <p>
            Real-time interbank parameters are polled on a 10-minute automated sliding interval in coordination with er-api benchmarks. Offline backup models activate instantly on connection fallouts.
          </p>
          <p>
            Copilot algorithms utilize Gemini models. General financial assessments and forecasts are provided purely as educational exercises; do not trade using automated indicators without independent verification.
          </p>
        </footer>

      </div>
    </div>
  );
}
