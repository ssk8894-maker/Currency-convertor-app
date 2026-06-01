import React, { useState, useMemo } from 'react';
import { 
  Plane, Sparkles, AlertCircle, RefreshCw, Landmark, ShoppingBag, 
  MapPin, HelpCircle, Calendar, Wallet, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Currency, ExchangeRates, TravelBudgetResult } from '../types';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from '../currencies';

interface TravelHelperProps {
  rates: ExchangeRates;
}

export default function TravelHelper({ rates }: TravelHelperProps) {
  // Budget helper states
  const [destination, setDestination] = useState('Paris, France');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetStyle, setBudgetStyle] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range');
  const [homeCurrency, setHomeCurrency] = useState('USD');
  const [localCurrency, setLocalCurrency] = useState('EUR');

  // Loaders & result
  const [isGenerating, setIsGenerating] = useState(false);
  const [budgetResult, setBudgetResult] = useState<TravelBudgetResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Shopping helper states
  const [localPrice, setLocalPrice] = useState<string>('');
  const [taxRate, setTaxRate] = useState<string>('12'); // default 12% VAT
  const [applyTax, setApplyTax] = useState(true);

  // Home equivalents calculation for shopping
  const conversionRate = useMemo(() => {
    if (!rates || !rates[homeCurrency] || !rates[localCurrency]) return 1;
    const homeUsd = rates[homeCurrency];
    const localUsd = rates[localCurrency];
    return localUsd / homeUsd; // cross-rate
  }, [rates, homeCurrency, localCurrency]);

  const shoppingCalculations = useMemo(() => {
    const rawPrice = parseFloat(localPrice);
    if (isNaN(rawPrice) || rawPrice <= 0) return null;
    
    const taxFactor = applyTax ? (1 + parseFloat(taxRate) / 100) : 1;
    const priceWithTax = rawPrice * taxFactor;
    
    // Convert to home currency
    // rate is 1 Home = equivalent Local
    // so Home = Local / conversionRate
    const priceHome = priceWithTax / conversionRate;
    const baseHome = rawPrice / conversionRate;
    const taxHome = priceHome - baseHome;

    return {
      priceWithTax,
      priceHome,
      baseHome,
      taxHome
    };
  }, [localPrice, taxRate, applyTax, conversionRate]);

  // Generate real-time cheat sheet lists for travel
  const cheatSheetItems = useMemo(() => {
    const values = [1, 5, 10, 20, 50, 100, 200, 500];
    return values.map((val) => {
      // 1 Local = ? Home => Home = Local / conversionRate
      const equivalentHome = val / conversionRate;
      // 1 Home = ? Local => Local = Home * conversionRate
      const equivalentLocal = val * conversionRate;
      return {
        unit: val,
        homeToLocal: equivalentLocal,
        localToHome: equivalentHome
      };
    });
  }, [conversionRate]);

  // Handle budget submit
  const handleGenerateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);
    try {
      const response = await fetch('/api/ai/travel-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          durationDays,
          budgetStyle,
          homeCurrency,
          localCurrency,
          conversionRate
        })
      });
      if (!response.ok) throw new Error('Vanguard financial intelligence returned abnormal payload. Check API key.');
      const data = await response.json();
      setBudgetResult(data);
    } catch (err: any) {
      setGenError(err.message || 'Undergoing maintenance. Using offline estimations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentHomeData = CURRENCY_MAP[homeCurrency] || UNIQUE_CURRENCIES[0];
  const currentLocalData = CURRENCY_MAP[localCurrency] || UNIQUE_CURRENCIES[1];

  return (
    <div className="space-y-6" id="travel-helper-panel">
      {/* AI Travel Budget card */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 dark:bg-indigo-500/3 blur-3xl -z-10 rounded-full" />

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-indigo-500" />
            AI Travel Budget Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Let Gemini construct a complete, target-localized daily expenses breakdown for your destination.
          </p>
        </div>

        <form onSubmit={handleGenerateBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Destination Target</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Paris, Tokyo, London"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="1"
                max="90"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Travel Style Mode</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={budgetStyle}
                onChange={(e) => setBudgetStyle(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-medium"
              >
                <option value="budget">Backpacker / Budget</option>
                <option value="mid-range">Comfort / Mid-Range</option>
                <option value="luxury">First-Class / Luxury</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Your Base Home Currency</label>
            <select
              value={homeCurrency}
              onChange={(e) => setHomeCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-medium"
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Target Local Currency</label>
            <select
              value={localCurrency}
              onChange={(e) => setLocalCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-medium"
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Gemini is planning...' : 'Build AI Travel Budget'}
            </button>
          </div>
        </form>

        {genError && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>AI Budget generator failed: {genError}</span>
          </div>
        )}

        {/* AI budget helper output */}
        <AnimatePresence>
          {budgetResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest tracking-wide">
                    {budgetResult.destination} — {budgetResult.durationDays} Days Expense Ledger
                  </h3>
                  <p className="text-xs text-slate-400 capitalize">
                    Tier: {budgetResult.budgetStyle} level
                  </p>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl text-right">
                  <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold block">Grand Total Estimated Forecast</span>
                  <span className="font-mono text-lg font-bold text-slate-800 dark:text-indigo-400 block">
                    {currentHomeData?.symbol} {budgetResult.totalHome?.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                  </span>
                  <span className="font-mono text-xs text-slate-400 block">
                    ~ {currentLocalData?.symbol} {budgetResult.totalLocal?.toLocaleString('en-US', { maximumFractionDigits: 1 })} Destination Value
                  </span>
                </div>
              </div>

              {/* Categorization matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Category Allocation</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {budgetResult.breakdown.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.category}</span>
                          <span className="text-slate-400 text-[10px] leading-tight block">{item.details}</span>
                        </div>
                        <div className="text-right flex-shrink-0 font-mono">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">
                            {currentHomeData?.symbol} {item.amountHome?.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {currentLocalData?.symbol} {item.amountLocal?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Cost-Of-Living & Travel Optimization Advice</div>
                  <div className="p-4 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-500/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-64 overflow-y-auto font-sans shadow-inner">
                    {budgetResult.aiAnalysis}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid: Intelligent International Shopping and Travel Cheat Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Shopping Converter */}
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                Cross-Border Shopping Calculator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Traveling? Input international prices with local VAT or sales tax, and check home total instantly.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Local Item Shelf Price ({localCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">{currentLocalData?.symbol}</span>
                  <input
                    type="number"
                    value={localPrice}
                    onChange={(e) => setLocalPrice(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="apply-tax-input"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="h-4 w-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500 focus:ring-1"
                  />
                  <label htmlFor="apply-tax-input" className="text-xs font-medium text-slate-500 dark:text-slate-300">
                    Apply local tax/VAT percentage
                  </label>
                </div>

                {applyTax && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-16 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 text-xs font-mono font-semibold"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {shoppingCalculations ? (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Calculated Price + VAT ({localCurrency}):</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">
                  {currentLocalData?.symbol} {shoppingCalculations.priceWithTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Equivalent Base Value ({homeCurrency}):</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">
                  {currentHomeData?.symbol} {shoppingCalculations.baseHome.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Tax impact in Home currency:</span>
                <span className="font-mono font-semibold text-red-400">
                  {currentHomeData?.symbol} {shoppingCalculations.taxHome.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs mt-3">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Final Cost in {homeCurrency}:</span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {currentHomeData?.symbol} {shoppingCalculations.priceHome.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-xl text-[10px] text-slate-400 text-center mt-6">
              Enter local shelf values above to parse direct currency metrics.
            </div>
          )}
        </div>

        {/* Travel Pocket Cheat Sheet table */}
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-500" />
              Smart Travel Cheat Sheet
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Direct equivalents matrix based on today's cross rates. Pocket companion helper.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                {homeCurrency} ➔ {localCurrency}
              </div>
              <div className="space-y-1.5">
                {cheatSheetItems.map(({ unit, homeToLocal }) => (
                  <div key={unit} className="flex justify-between items-center text-xs font-mono p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className="text-slate-400">{unit} {homeCurrency} =</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {homeToLocal.toFixed(2)} {localCurrency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l border-slate-100 dark:border-slate-800/80 pl-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                {localCurrency} ➔ {homeCurrency}
              </div>
              <div className="space-y-1.5">
                {cheatSheetItems.map(({ unit, localToHome }) => (
                  <div key={unit} className="flex justify-between items-center text-xs font-mono p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className="text-slate-400">{unit} {localCurrency} =</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {localToHome.toFixed(2)} {homeCurrency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
