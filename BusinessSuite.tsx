import React, { useState, useMemo } from 'react';
import { Briefcase, Receipt, Percent, Plus, Trash2, Coins, Calculator, FileText, Landmark, Wallet, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from '../currencies';
import { ExchangeRates } from '../types';

interface BusinessSuiteProps {
  rates: ExchangeRates;
}

interface EarningItem {
  id: string;
  source: string;
  amount: number;
  currency: string;
  date: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function BusinessSuite({ rates }: BusinessSuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<'freelance' | 'invoice' | 'profit'>('freelance');

  // 1. Freelancer mode states
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [earnings, setEarnings] = useState<EarningItem[]>([
    { id: '1', source: 'YouTube AdSense payouts', amount: 1200, currency: 'USD', date: '2026-05-10' },
    { id: '2', source: 'UI Consultation (Paris client)', amount: 1500, currency: 'EUR', date: '2026-05-18' },
    { id: '3', source: 'Ghostwriting retainer', amount: 800, currency: 'GBP', date: '2026-05-24' },
    { id: '4', source: 'Dev Contract (Mumbai startup)', amount: 45000, currency: 'INR', date: '2026-05-28' }
  ]);
  const [earningSource, setEarningSource] = useState('');
  const [earningAmt, setEarningAmt] = useState<string>('');
  const [earningCurr, setEarningCurr] = useState('USD');

  // 2. Invoice converter states
  const [invoiceClient, setInvoiceClient] = useState('Acme Global Inc.');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-089');
  const [invoiceBaseCurrency, setInvoiceBaseCurrency] = useState('USD');
  const [invoiceClientCurrency, setInvoiceClientCurrency] = useState('EUR');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Cross-Border Localization Consulting', quantity: 1, unitPrice: 2200 },
    { id: '2', description: 'Technical documentation hours', quantity: 15, unitPrice: 85 }
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('80');
  const [invoiceTax, setInvoiceTax] = useState('5'); // 5% flat VAT
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);

  // 3. Profit margin calculator states
  const [importCost, setImportCost] = useState('5000'); // Base Cost
  const [importCurrency, setImportCurrency] = useState('USD');
  const [exportCost, setExportCost] = useState('8000'); // Selling Price
  const [exportCurrency, setExportCurrency] = useState('EUR');
  const [bankSpread, setBankSpread] = useState('1.5'); // bank exchange fee markup %

  // --- Freelancer core conversions ---
  const consolidatedEarnings = useMemo(() => {
    let totalInBase = 0;
    const itemsWithConversions = earnings.map(item => {
      if (!rates || !rates[item.currency] || !rates[baseCurrency]) {
        return { ...item, amountConverted: item.amount };
      }
      // Calculate conversion: value in USD * baseUSD
      const amtUsd = item.amount / rates[item.currency];
      const converted = amtUsd * rates[baseCurrency];
      totalInBase += converted;
      return {
        ...item,
        amountConverted: converted
      };
    });

    return {
      items: itemsWithConversions,
      totalInBase
    };
  }, [earnings, baseCurrency, rates]);

  const handleAddEarning = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(earningAmt);
    if (!earningSource.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    const newItem: EarningItem = {
      id: `e-${Date.now()}`,
      source: earningSource,
      amount: parsedAmt,
      currency: earningCurr,
      date: new Date().toISOString().split('T')[0]
    };
    setEarnings([newItem, ...earnings]);
    setEarningSource('');
    setEarningAmt('');
  };

  const handleRemoveEarning = (id: string) => {
    setEarnings(earnings.filter(item => item.id !== id));
  };

  // --- Invoice calculator conversions ---
  const invoiceCalculations = useMemo(() => {
    const rawSubtotal = invoiceItems.reduce((acc, x) => acc + (x.quantity * x.unitPrice), 0);
    const taxRate = parseFloat(invoiceTax) || 0;
    const rawTax = rawSubtotal * (taxRate / 100);
    const baseTotal = rawSubtotal + rawTax;

    // Convert to client currency
    let crossRate = 1;
    if (rates && rates[invoiceBaseCurrency] && rates[invoiceClientCurrency]) {
      crossRate = rates[invoiceClientCurrency] / rates[invoiceBaseCurrency];
    }
    const clientSubtotal = rawSubtotal * crossRate;
    const clientTax = rawTax * crossRate;
    const clientTotal = baseTotal * crossRate;

    return {
      rawSubtotal,
      rawTax,
      baseTotal,
      crossRate,
      clientSubtotal,
      clientTax,
      clientTotal
    };
  }, [invoiceItems, invoiceTax, invoiceBaseCurrency, invoiceClientCurrency, rates]);

  const handleAddInvoiceItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(newItemQty);
    const price = parseFloat(newItemPrice);
    if (!newItemDesc.trim() || isNaN(qty) || isNaN(price) || price <= 0) return;

    const newItem: InvoiceItem = {
      id: `i-${Date.now()}`,
      description: newItemDesc,
      quantity: qty,
      unitPrice: price
    };
    setInvoiceItems([...invoiceItems, newItem]);
    setNewItemDesc('');
    setNewItemQty('1');
    setNewItemPrice('80');
  };

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  // --- Importer/Exporter Profit calculator calculations ---
  const profitCalculations = useMemo(() => {
    const rawImport = parseFloat(importCost) || 0;
    const rawExport = parseFloat(exportCost) || 0;
    const spreadPercent = parseFloat(bankSpread) || 0;

    if (!rates || !rates[importCurrency] || !rates[exportCurrency]) return null;

    // We do conversions in ImportCurrency (the vendor's sourcing cost)
    // 1 Export Currency = ? Import Currency => conversion rate with bank fee spread
    const rawCross = rates[importCurrency] / rates[exportCurrency];
    
    // Spread reduces export payout (i.e. importer pays more importCurrency to clear the rate)
    const effectiveCross = rawCross * (1 - (spreadPercent / 100));

    // Convert export margin back to ImportCurrency
    const exportRevenueInImportCurrency = rawExport * effectiveCross;
    const netProfitInImportCurrency = exportRevenueInImportCurrency - rawImport;
    const spreadDeductionInImportCurrency = rawExport * rawCross * (spreadPercent / 100);

    const marginPercent = exportRevenueInImportCurrency > 0 
      ? (netProfitInImportCurrency / exportRevenueInImportCurrency) * 100 
      : 0;

    return {
      rawCross,
      effectiveCross,
      exportRevenueInImportCurrency,
      netProfitInImportCurrency,
      spreadDeductionInImportCurrency,
      marginPercent
    };
  }, [importCost, exportCost, importCurrency, exportCurrency, bankSpread, rates]);

  const currentBaseData = CURRENCY_MAP[baseCurrency] || UNIQUE_CURRENCIES[0];

  return (
    <div className="space-y-6" id="business-suite-tab">
      
      {/* Sub menu controls */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-full border border-slate-150 dark:border-slate-800/60 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveSubTab('freelance')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'freelance'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Freelancer Earnings
        </button>
        <button
          onClick={() => setActiveSubTab('invoice')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'invoice'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Invoice Converter
        </button>
        <button
          onClick={() => setActiveSubTab('profit')}
          className={`py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'profit'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Import/Export Profit Margin
        </button>
      </div>

      {/* VIEW 1: Freelancer Mode */}
      {activeSubTab === 'freelance' && (
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl space-y-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Freelance Global Ledger Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add income items in foreign currencies and track consolidated worth in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Consolidated overview card */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 md:col-span-1">
              <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold block">Consolidated worth</span>
              <span className="font-mono text-2xl font-extrabold text-slate-850 dark:text-emerald-400 block mt-1">
                {currentBaseData?.symbol} {consolidatedEarnings.totalInBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Ledger Unit:</span>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="bg-transparent text-slate-600 dark:text-slate-200 border-none font-bold text-xs select-none outline-none focus:ring-0 p-0"
                >
                  {UNIQUE_CURRENCIES.slice(0, 15).map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Earning form */}
            <form onSubmit={handleAddEarning} className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Payment Description</label>
                <input
                  type="text"
                  placeholder="e.g. YouTube AdSense May"
                  value={earningSource}
                  onChange={(e) => setEarningSource(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-705 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-805 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                <input
                  type="number"
                  placeholder="Amount"
                  value={earningAmt}
                  onChange={(e) => setEarningAmt(e.target.value)}
                  className="col-span-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-705 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-500 text-slate-805 dark:text-white font-mono"
                  required
                />
                <select
                  value={earningCurr}
                  onChange={(e) => setEarningCurr(e.target.value)}
                  className="col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-705 rounded-lg px-1 py-1.5 text-xs focus:outline-none text-slate-805 dark:text-white"
                >
                  {UNIQUE_CURRENCIES.slice(0, 20).map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="sm:col-span-2 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Track Income Entry
              </button>
            </form>
          </div>

          {/* List items representation */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Itemized Ledger</div>
            {consolidatedEarnings.items.map((item) => {
              const itemData = CURRENCY_MAP[item.currency];
              return (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-850 dark:text-white block">{item.source}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.date} • Base unit: {itemData?.flag} {item.currency}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-850 dark:text-white block">
                        {itemData?.symbol}{item.amount.toLocaleString()} {item.currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ≈ {currentBaseData?.symbol}{item.amountConverted.toFixed(2)} {baseCurrency}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveEarning(item.id)}
                      className="p-1 px-1.5 rounded bg-red-50 dark:bg-red-500/10 text-red-500 hover:text-red-600 cursor-pointer text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Invoice Converter */}
      {activeSubTab === 'invoice' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Invoice builder form panel */}
          <div className="md:col-span-5 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-500" />
                Invoice Metadata & Items
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Client Business Name</label>
                <input
                  type="text"
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Flat Tax/VAT (%)</label>
                  <input
                    type="number"
                    value={invoiceTax}
                    onChange={(e) => setInvoiceTax(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Your Billing Unit</label>
                  <select
                    value={invoiceBaseCurrency}
                    onChange={(e) => setInvoiceBaseCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white"
                  >
                    {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Client Settlement Unit</label>
                  <select
                    value={invoiceClientCurrency}
                    onChange={(e) => setInvoiceClientCurrency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white"
                  >
                    {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Line item appending form */}
            <form onSubmit={handleAddInvoiceItem} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Add Line item</span>
              
              <input
                type="text"
                placeholder="Description e.g. Consulting, Dev tasks"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white"
                required
              />

              <div className="grid grid-cols-5 gap-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white font-mono"
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="col-span-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-white transition cursor-pointer"
              >
                + Add Item line
              </button>
            </form>
          </div>

          {/* Rendered Invoice Sheet panel */}
          <div className="md:col-span-7 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 shadow-xl relative flex flex-col justify-between">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">TAX INVOICE</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Invoice Ref: {invoiceNumber}</span>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-semibold font-mono">
                  Date: {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">BILLED TO</span>
                  <span className="font-bold text-slate-850 dark:text-white block">{invoiceClient}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">VALUED EXHANGE RATE</span>
                  <span className="font-mono text-[11px] font-bold text-emerald-500">
                    1 {invoiceBaseCurrency} = {invoiceCalculations.crossRate.toFixed(5)} {invoiceClientCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Line items list */}
            <div className="my-5 divide-y divide-slate-100 dark:divide-slate-850 max-h-48 overflow-y-auto pr-1">
              {invoiceItems.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-850 dark:text-white block">{item.description}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.quantity} units @ {CURRENCY_MAP[invoiceBaseCurrency]?.symbol}{item.unitPrice}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-855 dark:text-white block">
                      {CURRENCY_MAP[invoiceBaseCurrency]?.symbol}{(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ~ {CURRENCY_MAP[invoiceClientCurrency]?.symbol}{(item.quantity * item.unitPrice * invoiceCalculations.crossRate).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations subtotals */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({invoiceBaseCurrency}):</span>
                <span className="font-mono font-medium">{CURRENCY_MAP[invoiceBaseCurrency]?.symbol}{invoiceCalculations.rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated VAT Tax ({invoiceTax}%):</span>
                <span className="font-mono font-medium">{CURRENCY_MAP[invoiceBaseCurrency]?.symbol}{invoiceCalculations.rawTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2.5 px-3 bg-emerald-55 border-emerald-100 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl text-xs font-bold mt-2">
                <span className="text-slate-700 dark:text-slate-350">Client Grand Total Due ({invoiceClientCurrency}):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {CURRENCY_MAP[invoiceClientCurrency]?.symbol}{invoiceCalculations.clientTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Importer Profit Calculator */}
      {activeSubTab === 'profit' && (
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl space-y-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-500" />
              Importer & Exporter Arbitrage Profit Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculate exact profit margins factoring in exchange rate fluctuation and financial institution spreads (markup).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input params column */}
            <div className="md:col-span-1 space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Cost of Goods (Import Cost)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={importCost}
                    onChange={(e) => setImportCost(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-mono font-bold"
                  />
                  <select
                    value={importCurrency}
                    onChange={(e) => setImportCurrency(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-205 rounded-lg py-1.5 px-1.5 text-xs"
                  >
                    {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Contract Selling Price (Export Price)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={exportCost}
                    onChange={(e) => setExportCost(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-mono font-bold"
                  />
                  <select
                    value={exportCurrency}
                    onChange={(e) => setExportCurrency(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-205 rounded-lg py-1.5 px-1.5 text-xs"
                  >
                    {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Bank Spread/Transfer Margin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bankSpread}
                  onChange={(e) => setBankSpread(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Metric outputs side */}
            {profitCalculations ? (
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Result Block A: Net Profits */}
                <div className="p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold block">Estimated Project Profit</span>
                    <span className={`font-mono text-xl font-extrabold block mt-2 ${
                      profitCalculations.netProfitInImportCurrency >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {CURRENCY_MAP[importCurrency]?.symbol}{profitCalculations.netProfitInImportCurrency.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Clearing Currency: {importCurrency}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <span className="text-[10px] text-slate-400 block">Arbitrage ROI margin:</span>
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-white block mt-0.5">
                      {profitCalculations.marginPercent.toFixed(1)}% Export Margin
                    </span>
                  </div>
                </div>

                {/* Result Block B: bank dynamic fee rates */}
                <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 space-y-3.5 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">FX Exchange rates breakdown</span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Interbank Mid-Rate:</span>
                        <span className="font-semibold text-slate-800 dark:text-white">1 {exportCurrency} = {profitCalculations.rawCross.toFixed(4)} {importCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450">Effective Markup Rate:</span>
                        <span className="font-bold text-indigo-500">1 {exportCurrency} = {profitCalculations.effectiveCross.toFixed(4)} {importCurrency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Fee Loss to Bank spread:</span>
                      <span className="font-mono font-bold text-red-500">
                        {CURRENCY_MAP[importCurrency]?.symbol}{profitCalculations.spreadDeductionInImportCurrency.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="md:col-span-2 p-10 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
                Setup import export currency variables above to retrieve arbitrage forecasts.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
