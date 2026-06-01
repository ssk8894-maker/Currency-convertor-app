import React, { useState, useMemo } from 'react';
import { Sparkles, Trash2, Plus, Wallet, FileText, Compass, AlertCircle, AlertTriangle, ShieldCheck, HelpCircle, Check, Landmark, MessageSquare, Landmark as Bank } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from './currencies';
import { ExchangeRates } from './types';

interface SpendingAnalyzerProps {
  rates: ExchangeRates;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
}

export default function SpendingAnalyzer({ rates }: SpendingAnalyzerProps) {
  // Expense items states
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', description: 'Boutique Hotel (Paris)', amount: 480, currency: 'EUR', category: 'Lodging' },
    { id: '2', description: 'Airport taxi cab (JFK)', amount: 65, currency: 'USD', category: 'Transport' },
    { id: '3', description: 'Michelin Dinner', amount: 120, currency: 'EUR', category: 'Food' },
    { id: '4', description: 'Souvenirs (London)', amount: 45, currency: 'GBP', category: 'Shopping' }
  ]);

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState<string>('');
  const [curr, setCurr] = useState('EUR');
  const [cat, setCat] = useState('Food');
  const [baseHomeCurr, setBaseHomeCurr] = useState('USD');

  // Loaders and dynamic results
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<{
    categoriesSummary: string;
    savingsHacks: string[];
    bestProviders: string[];
    concludingAnalysis: string;
  } | null>(null);

  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  // Copilot States
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isCopilotQuerying, setIsCopilotQuerying] = useState(false);

  // Import mock statement handler
  const handleLoadSimulatedStatement = () => {
    setExpenses([
      { id: 'sim-1', description: 'Champs Elysees Shopping', amount: 220, currency: 'EUR', category: 'Shopping' },
      { id: 'sim-2', description: 'Train to Amsterdam', amount: 85, currency: 'EUR', category: 'Transport' },
      { id: 'sim-3', description: 'Starbucks Coffee', amount: 6.80, currency: 'USD', category: 'Food' },
      { id: 'sim-4', description: 'Ryokan Resort (Kyoto)', amount: 42000, currency: 'JPY', category: 'Lodging' },
      { id: 'sim-5', description: 'Emergency taxi hack', amount: 45, currency: 'AED', category: 'Transport' }
    ]);
    setAnalyzerResult(null);
  };

  // Manual sum calculations
  const totals = useMemo(() => {
    let totalInBase = 0;
    const itemized = expenses.map(x => {
      if (!rates || !rates[x.currency] || !rates[baseHomeCurr]) {
        return { ...x, amountConverted: x.amount };
      }
      const rawUsd = x.amount / rates[x.currency];
      const converted = rawUsd * rates[baseHomeCurr];
      totalInBase += converted;
      return {
        ...x,
        amountConverted: converted
      };
    });

    // Category grouping
    const categoriesMap: { [c: string]: number } = {};
    expenses.forEach(x => {
      let convertedValue = x.amount;
      if (rates && rates[x.currency] && rates[baseHomeCurr]) {
        convertedValue = (x.amount / rates[x.currency]) * rates[baseHomeCurr];
      }
      categoriesMap[x.category] = (categoriesMap[x.category] || 0) + convertedValue;
    });

    return {
      items: itemized,
      totalInBase,
      categoriesBreakdown: Object.entries(categoriesMap).map(([name, val]) => ({ name, val }))
    };
  }, [expenses, baseHomeCurr, rates]);

  // Trigger Spending Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalyzerError(null);
    try {
      const response = await fetch('/api/ai/analyze-spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          baseCurrency: baseHomeCurr,
          conversionRates: rates
        })
      });
      if (!response.ok) throw new Error('Forensic spend audit model rejected the payload.');
      const data = await response.json();
      setAnalyzerResult(data);
    } catch (err: any) {
      setAnalyzerError(err.message || 'Under maintenance. Sourcing mock intelligence reports.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add Item handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amt);
    if (!desc.trim() || isNaN(parsed) || parsed <= 0) return;

    const newItem: ExpenseItem = {
      id: `m-${Date.now()}`,
      description: desc,
      amount: parsed,
      currency: curr,
      category: cat
    };
    setExpenses([...expenses, newItem]);
    setDesc('');
    setAmt('');
    setAnalyzerResult(null);
  };

  const removeItem = (id: string) => {
    setExpenses(expenses.filter(x => x.id !== id));
    setAnalyzerResult(null);
  };

  // Copilot mechanics
  const handleCopilotQuery = async (queryText: string) => {
    const activeQuery = queryText || copilotQuery;
    if (!activeQuery.trim()) return;

    setIsCopilotQuerying(true);
    setCopilotResponse(null);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Specifically travel financial copilot question: ${activeQuery}. Please tell me regarding pricing, transfers, safety, and whether this budget is sufficient or if I can optimize cost.` }]
        })
      });
      if (!response.ok) throw new Error('Copilot response timed out.');
      const data = await response.json();
      setCopilotResponse(data.text);
    } catch (err: any) {
      setCopilotResponse("Error getting reply. Make sure your Gemini API key is configured. Predefined response: Sourcing mid-tier hotels and utilizing public transport passes rather than taxis can usually save up to 40% of standard travel budgets.");
    } finally {
      setIsCopilotQuerying(false);
    }
  };

  const currentHomeDetails = CURRENCY_MAP[baseHomeCurr] || UNIQUE_CURRENCIES[0];

  return (
    <div className="space-y-6" id="spending-analyzer-tab">
      
      {/* 1. Spending Analyzer block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left side: Receipts inputs & List tracker */}
        <div className="md:col-span-5 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-500" />
                Travel Receipt Ledger
              </h3>
              <p className="text-[10px] text-slate-450 mt-1">
                Collate spending lines in foreign currencies. Let AI audit the balance sheets.
              </p>
            </div>
            
            <button
              onClick={handleLoadSimulatedStatement}
              className="py-1 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-550 dark:text-slate-300 text-[10px] font-semibold transition cursor-pointer"
            >
              Simulate Bank Log
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAddItem} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Record Receipt Item</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Description e.g. Uber"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white"
                required
              />
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white"
              >
                <option value="Food">🍔 Food / Dining</option>
                <option value="Lodging">🏨 Lodging / Stays</option>
                <option value="Transport">🚖 Transport / Cabs</option>
                <option value="Shopping">🛍️ Shopping / Gifts</option>
                <option value="Sightseeing">🎟️ Entertainment</option>
              </select>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                className="col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white font-mono"
                required
              />
              <select
                value={curr}
                onChange={(e) => setCurr(e.target.value)}
                className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1 py-1 text-xs text-slate-800 dark:text-white"
              >
                {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Add Entry
            </button>
          </form>

          {/* List items representation */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {totals.items.map((item) => {
              const sym = CURRENCY_MAP[item.currency]?.symbol || '';
              return (
                <div key={item.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate max-w-[140px]">{item.description}</span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Category: {item.category} • Base Unit: {item.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-800 dark:text-white block">{sym}{item.amount}</span>
                      <span className="text-[9px] text-slate-400 block">≈ {currentHomeDetails?.symbol}{item.amountConverted.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Aggregated Ledger</span>
                <span className="font-mono text-sm font-extrabold text-slate-850 dark:text-emerald-400 mt-0.5 block">
                  {currentHomeDetails?.symbol} {totals.totalInBase.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Ledger:</span>
                <select
                  value={baseHomeCurr}
                  onChange={(e) => setBaseHomeCurr(e.target.value)}
                  className="bg-transparent text-slate-600 dark:text-slate-200 border-none font-bold text-xs select-none outline-none focus:ring-0 p-0"
                >
                  {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || expenses.length === 0}
              className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Auditing Ledger...' : 'Audit Cross-Border Waste'}
            </button>
          </div>
        </div>

        {/* Right side: Categories breakdown & Gemini response */}
        <div className="md:col-span-7 flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {analyzerResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-lg space-y-4"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">AI Forensic Spending Report</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Calculated by CurrencyX AI dynamic auditors</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="bg-white/80 dark:bg-slate-905 bg-white dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">Categorization Audit</span>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-sans">{analyzerResult.categoriesSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Card Markup & Transfer Spreads
                      </span>
                      <ul className="space-y-1.5">
                        {analyzerResult.bestProviders.map((x, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Travel cost Hacks
                      </span>
                      <ul className="space-y-1.5">
                        {analyzerResult.savingsHacks.map((x, idx) => (
                          <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block mb-1">Final Audit conclusion</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{analyzerResult.concludingAnalysis}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-white/40 dark:bg-slate-900/20 h-full">
                <Compass className="w-8 h-8 text-indigo-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Awaiting Audit Execution</h4>
                  <p className="text-[11px] text-slate-450 mt-1 max-w-sm">
                    Pre-populate standard travel receipt lines, then run our forensic spending analyzer to audit hidden banking spreads, fees, and travel hacks.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 2. Dream Feature: Global Financial Copilot */}
      <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-3 text-[10px] uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Financial Travel Copilot Active
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-850 dark:text-white flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Global Financial Destination Copilot
          </h3>
          <p className="text-xs text-slate-500">
            Ask complex logistical questions regarding target country budgets, ATMs, tax recovery schemes, or destination guidelines.
          </p>
        </div>

        {/* Preset quick questions row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "I am going to Dubai with 50,000 INR, is that enough for 3 days of comfort?",
            "What is the tourist VAT tax refund policy (tax-free shopping) in Tokyo?",
            "Can I use standard Wise or Revolut cards in UK and is it cheaper than cash?",
            "How can I spot the hidden dynamic currency conversion (DCC) trap at ATMs?"
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCopilotQuery(preset);
                handleCopilotQuery(preset);
              }}
              className="py-1 px-3 border border-emerald-500/10 hover:border-emerald-500/20 rounded-full text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-550 dark:text-slate-300 text-left transition cursor-pointer max-w-sm truncate"
            >
              ❔ {preset}
            </button>
          ))}
        </div>

        {/* Input dialog */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="e.g., Going to Switzerland for a week, what is the best currency-mix and daily budget?"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleCopilotQuery('')}
            disabled={isCopilotQuerying || !copilotQuery.trim()}
            className="px-5 py-2 hover:bg-emerald-600 bg-emerald-55 bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer disabled:opacity-40"
          >
            {isCopilotQuerying ? 'Querying...' : 'Ask Copilot'}
          </button>
        </div>

        {/* Response block */}
        <AnimatePresence>
          {copilotResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-emerald-200/40 text-xs leading-relaxed font-sans text-slate-650 dark:text-slate-300 max-h-60 overflow-y-auto"
            >
              <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[9px] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Copilot Destination Advice
              </div>
              <p className="whitespace-pre-line">{copilotResponse}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
