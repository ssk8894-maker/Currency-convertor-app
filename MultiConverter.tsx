import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Sliders, DollarSign, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Currency, ExchangeRates } from './types';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from './currencies';

interface MultiConverterProps {
  rates: ExchangeRates;
}

export default function MultiConverter({ rates }: MultiConverterProps) {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState<number>(100);
  const [comparisonCodes, setComparisonCodes] = useState<string[]>(['EUR', 'GBP', 'JPY', 'CAD', 'AUD']);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  // Compute calculated equivalents
  const targetComparisons = useMemo(() => {
    return comparisonCodes.map((code) => {
      const currency = CURRENCY_MAP[code];
      if (!currency || !rates[baseCurrency] || !rates[code]) return null;

      const baseUsd = rates[baseCurrency];
      const targetUsd = rates[code];
      const conversionRate = targetUsd / baseUsd;
      const result = amount * conversionRate;

      return {
        currency,
        conversionRate,
        result
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [baseCurrency, amount, comparisonCodes, rates]);

  // Handle adding currency
  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToAdd) return;
    if (comparisonCodes.includes(selectedToAdd)) return;
    if (comparisonCodes.length >= 5) {
      alert('You can compare a maximum of 5 currencies simultaneously.');
      return;
    }
    setComparisonCodes([...comparisonCodes, selectedToAdd]);
    setSelectedToAdd('');
  };

  // Remove comparison currency
  const handleRemove = (code: string) => {
    setComparisonCodes(comparisonCodes.filter((c) => c !== code));
  };

  // List of remaining currencies to allow adding (not current base and not already in comparison)
  const availableToAdd = useMemo(() => {
    return UNIQUE_CURRENCIES.filter(
      (c) => c.code !== baseCurrency && !comparisonCodes.includes(c.code)
    );
  }, [baseCurrency, comparisonCodes]);

  const baseCurrencyData = CURRENCY_MAP[baseCurrency] || UNIQUE_CURRENCIES[0];

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden" id="multi-converter-panel">
      {/* Glow background */}
      <div className="absolute top-0 left-0 w-36 h-36 bg-blue-500/5 dark:bg-blue-500/3 blur-3xl -z-10 rounded-full" />

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-500" />
          Multi-Currency Portfolio Comparison
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Simultaneously convert a base amount to up to 5 distinct world benchmarks.
        </p>
      </div>

      {/* Base row controller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Base Currency</label>
          <select
            value={baseCurrency}
            onChange={(e) => {
              const val = e.target.value;
              setBaseCurrency(val);
              // Remove if the base is now comparison to avoid duplicates
              setComparisonCodes(comparisonCodes.filter((c) => c !== val));
            }}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 dark:text-white"
          >
            {UNIQUE_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Base Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-mono font-bold">{baseCurrencyData?.symbol}</span>
            <input
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAmount(isNaN(val) ? 0 : val);
              }}
              placeholder="0.00"
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Comparisons outputs stack */}
      <div className="space-y-3 mb-6">
        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Portfolio Breakdown ({targetComparisons.length}/5)</div>

        <AnimatePresence mode="popLayout">
          {targetComparisons.map(({ currency, conversionRate, result }) => (
            <motion.div
              layout
              key={currency.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 shadow-sm hover:border-slate-200 dark:hover:border-slate-700/60 transition flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currency.flag}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{currency.code}</span>
                    <span className="text-slate-400 text-xs">({currency.name})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    Rate: 1 {baseCurrency} = {conversionRate.toFixed(5)} {currency.code}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono font-bold text-md text-slate-800 dark:text-emerald-400">
                    {currency.symbol} {result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Inverse: 1 {currency.code} = {(1 / conversionRate).toFixed(4)} {baseCurrency}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(currency.code)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                  title="Remove comparator"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {targetComparisons.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-xs text-slate-400 flex flex-col items-center gap-2">
            <Info className="w-6 h-6 text-slate-300" />
            <span>Your portfolio comparison is empty. Add currencies below.</span>
          </div>
        )}
      </div>

      {/* Add comparison selector */}
      {comparisonCodes.length < 5 && (
        <form onSubmit={handleAddCurrency} className="flex gap-2">
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-600 dark:text-slate-300"
          >
            <option value="">-- Add a target benchmark --</option>
            {availableToAdd.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} - {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!selectedToAdd}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Compare
          </button>
        </form>
      )}
    </div>
  );
}
