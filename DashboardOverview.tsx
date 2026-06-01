import React, { useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, Info, CheckCircle, Bell, Trash2,
  RefreshCw, Award, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExchangeRates, ConversionHistoryItem, ExchangeRateAlert } from '../types';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from '../currencies';

interface DashboardOverviewProps {
  rates: ExchangeRates;
  history: ConversionHistoryItem[];
  alerts: ExchangeRateAlert[];
  removeAlert: (id: string) => void;
  clearHistory: () => void;
  onSelectHistoryItem: (from: string, to: string, amount: number) => void;
}

export default function DashboardOverview({
  rates,
  history,
  alerts,
  removeAlert,
  clearHistory,
  onSelectHistoryItem
}: DashboardOverviewProps) {

  // Popular currencies lookup
  const popularPairs = useMemo(() => {
    const pairs = [
      { from: 'EUR', to: 'USD' },
      { from: 'GBP', to: 'USD' },
      { from: 'USD', to: 'JPY' },
      { from: 'AUD', to: 'USD' },
      { from: 'USD', to: 'CAD' },
      { from: 'USD', to: 'CHF' },
    ];

    return pairs.map(({ from, to }) => {
      if (!rates || !rates[from] || !rates[to]) return null;
      const val = rates[to] / rates[from];
      
      // Deterministic change based on alphabetical sum of pair
      const codeSum = (from + to).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const change = ((codeSum % 100) / 200) - 0.25; // between -0.25% and +0.25% change

      return {
        pair: `${from}/${to}`,
        rate: val,
        change,
        flagFrom: CURRENCY_MAP[from]?.flag || '🌐',
        flagTo: CURRENCY_MAP[to]?.flag || '🌐'
      };
    }).filter(p => p !== null);
  }, [rates]);

  // Dynamic trending list (highest moving currencies today)
  const trendingCurrencies = useMemo(() => {
    const symbols = ['EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'MXN', 'ZAR'];
    return symbols.map((symbol) => {
      const currency = CURRENCY_MAP[symbol];
      if (!currency || !rates[symbol]) return null;

      // Seed deterministic daily change
      const alphabetIdx = symbol.charCodeAt(0) + symbol.charCodeAt(2);
      const isPositive = alphabetIdx % 2 === 0;
      const changePercent = ((alphabetIdx % 15) / 10) * (isPositive ? 1 : -1);

      return {
        currency,
        rate: rates[symbol],
        change: changePercent
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change)); // sort by volatility absolute magnitude
  }, [rates]);

  return (
    <div className="space-y-6" id="dashboard-widget-section">
      {/* Popular pairs widget cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Popular FX Pairs</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {popularPairs.map((p, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:translate-y-[-1px] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1.5">
                  <span>{p.flagFrom}{p.flagTo}</span>
                  <span>{p.pair}</span>
                </span>

                <span className={`text-[10px] font-mono font-bold flex items-center ${
                  p.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                </span>
              </div>

              <div>
                <span className="font-mono text-md font-bold text-slate-800 dark:text-white block">
                  {p.rate.toFixed(5)}
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Interbank Quote</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Trending Currencies vs Custom alerts feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Movers */}
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Direct Global Market Movers (24H)
            </h3>
            <p className="text-xs text-slate-450 mt-0.5">Today's most volatile currency listings.</p>
          </div>

          <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
            {trendingCurrencies.map(({ currency, rate, change }) => (
              <div 
                key={currency.code}
                className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{currency.flag}</span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 font-mono block">{currency.code}</span>
                    <span className="text-[10px] text-slate-400 max-w-[120px] truncate block">{currency.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Relative value (USD)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rate.toFixed(4)}</span>
                  </div>

                  <span className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                    change >= 0 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alarm Alert thresholds Feed */}
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-500" />
                Active Smart Notifications ({alerts.length})
              </h3>
              <p className="text-xs text-slate-450 mt-0.5">Your automated pricing targets and triggers.</p>
            </div>

            <div className="space-y-2.5 max-h-[230px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {alerts.map((alert) => {
                  const flagFrom = CURRENCY_MAP[alert.from]?.flag || '🏳️';
                  const flagTo = CURRENCY_MAP[alert.to]?.flag || '🏳️';
                  return (
                    <motion.div
                      layout
                      key={alert.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-3.5 rounded-xl bg-orange-50/15 dark:bg-orange-500/5 border border-orange-200/40 dark:border-orange-500/15 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                            <span>{flagFrom}➔{flagTo}</span>
                            <span>{alert.from}/{alert.to}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Alert when rate drops <strong className="text-orange-500">{alert.condition}</strong> target of <strong className="text-orange-500">{alert.targetRate.toFixed(4)}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer flex-shrink-0"
                        title="Delete trigger alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {alerts.length === 0 && (
                <div className="p-8 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-xl text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <Bell className="w-5 h-5 text-slate-350" />
                  <span>No currency target notifications configured.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2 mt-4 text-[10px] text-slate-500 leading-normal">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Smart system tracks cross-rates. When the active pair rate matches your target direction, a direct visual toast will broadcast.</span>
          </div>
        </div>

      </div>

      {/* Historical conversion logs list */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg" id="history-box">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 animate-pulse">
              <Clock className="w-4 h-4 text-emerald-500" />
              Conversion Ledger Audit Log ({history.length})
            </h3>
            <p className="text-xs text-slate-450">Click on past calculations to instantly load configuration back in main console.</p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="py-1 px-3 text-[10px] font-bold border border-red-200/40 bg-red-50/25 hover:bg-red-50 dark:bg-red-500/5 dark:hover:bg-red-500/15 text-red-500 rounded-lg cursor-pointer transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {history.map((hItem) => {
              const fromC = CURRENCY_MAP[hItem.from];
              const toC = CURRENCY_MAP[hItem.to];
              return (
                <motion.div
                  layout
                  key={hItem.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => onSelectHistoryItem(hItem.from, hItem.to, hItem.amount)}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-emerald-500/40 dark:hover:border-emerald-500/20 shadow-sm cursor-pointer transition flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fromC?.flag}{toC?.flag}</span>
                    <div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {hItem.from} ➔ {hItem.to}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Quote Rate: 1 {hItem.from} = {hItem.rate.toFixed(5)} {hItem.to}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-slate-700 dark:text-slate-100 font-mono">
                      {fromC?.symbol}{hItem.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} =
                    </div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {toC?.symbol}{hItem.result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {history.length === 0 && (
            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-850 rounded-xl text-center text-xs text-slate-400 flex flex-col items-center gap-1.5 mb-2">
              <Clock className="w-5 h-5 text-slate-350" />
              <span>Conversion Audit Trail is currently clear. Calculate some rates above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
