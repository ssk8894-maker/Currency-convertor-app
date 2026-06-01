import React, { useState, useMemo } from 'react';
import { Plane, Compass, ShieldAlert, PhoneCall, Globe, Coffee, Utensils, HelpCircle, CheckCircle2, ChevronRight, Calculator, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from './currencies';
import { ExchangeRates } from './types';

interface TravelKitProps {
  rates: ExchangeRates;
}

interface CountryDetail {
  code: string;
  tippingStandard: string;
  notescoins: string;
  commonScams: string[];
  visaNeeds: string;
  emergencyNumbers: { police: string; medical: string };
  avgCosts: { meal: number; coffee: number; transit: number };
}

const COUNTRY_TRAVEL_DATA: { [currencyCode: string]: CountryDetail } = {
  USD: {
    code: "USD",
    tippingStandard: "15% to 20% in standard sit-down restaurants. $1 to $2 per drink at bar counters.",
    notescoins: "Banknotes look green/black. Key denominations: $1, $5, $10, $20, $50, $100. Quarters (25c) are heavily used in laundry & transit.",
    commonScams: ["Fake taxi cabs operating around JFK/LAX of unmetered rates", "Phony hotel menus slipped beneath doorways requesting credit cards over phone."],
    visaNeeds: "Visa waiver (ESTA) for tourists from Schengen area, UK, Australia; traditional visa for others.",
    emergencyNumbers: { police: "911", medical: "911" },
    avgCosts: { meal: 22, coffee: 5.0, transit: 2.75 }
  },
  EUR: {
    code: "EUR",
    tippingStandard: "Round up to the nearest 5-10% (often 1-2 Euros) for good service. Service charge (Servizio Compreso) is often already included.",
    notescoins: "Notes are highly colorful in decreasing sizing. Coins: 1c, 2c, 5c, 10c, 20c, 50c, €1, €2.",
    commonScams: ["Petition signups and flower sellers in Paris/Rome tying bracelets on wrists", "Waiters changing bill total of credit card transactions by hand."],
    visaNeeds: "90-day visa-free for major partners; ETIAS waiver clearance starting soon.",
    emergencyNumbers: { police: "112", medical: "112" },
    avgCosts: { meal: 18, coffee: 3.5, transit: 2.2 }
  },
  GBP: {
    code: "GBP",
    tippingStandard: "Optional 10% in sit-down restaurants. Service is sometimes auto-added as 'Service Charge' on invoice bills.",
    notescoins: "Waterproof polymer notes featuring outstanding details. Standard pounds: £5, £10, £20, £50.",
    commonScams: ["Counterfeit physical bank notes circulated by peer-to-peer vendors", "Phony airport terminal assistants guiding tourists to private high-rate transport."],
    visaNeeds: "Standard tourist visa exemption for G7 members and Commonwealth partners.",
    emergencyNumbers: { police: "999", medical: "999" },
    avgCosts: { meal: 16, coffee: 4.2, transit: 3.0 }
  },
  JPY: {
    code: "JPY",
    tippingStandard: "No tipping allowed! Tipping on coins is considered rude and can cause severe social confusion.",
    notescoins: "Extravagant watermarks, high-contrast yen bills: 1000, 2000 (rare), 5000, 10000 yen. 500 yen coin is heavy.",
    commonScams: ["Shinjuku/Kabukicho drinking bars adding enormous hidden seating fees", "Waiters running duplicate swipe operations on foreign cards."],
    visaNeeds: "Exempt for up to 90 days for major global partners; eVisa available for standard tourists.",
    emergencyNumbers: { police: "110", medical: "119" },
    avgCosts: { meal: 1100, coffee: 450, transit: 210 }
  },
  INR: {
    code: "INR",
    tippingStandard: "5% to 10% is generous. It is best to hand coins directly to service staff instead of leaving on card slips.",
    notescoins: "Banknotes feature Mahatma Gandhi portrait. Colors: Purple (₹100), Magenta (₹2000), Grey (₹500).",
    commonScams: ["Phony tourist information offices claiming governmental authorizations", "Taxis insisting meters are broken or taking alternate lengthy paths."],
    visaNeeds: "Mandatory eVisa required for almost all foreigners; must apply prior to arrival.",
    emergencyNumbers: { police: "112", medical: "102" },
    avgCosts: { meal: 350, coffee: 120, transit: 40 }
  },
  AED: {
    code: "AED",
    tippingStandard: "10-15% is standard. Tipping valets & luggage handlers AED 5-10 is highly appreciated.",
    notescoins: "Dihram notes feature falcons & national landmarks. Coins include 1 Dirham, 50 fils, 25 fils.",
    commonScams: ["Airport taxicabs requesting double baseline meter charges for baggage delivery.", "Fake designer luxury products offered around souk back-alleys."],
    visaNeeds: "Visa on Arrival (free of charge) at Dubai or Abu Dhabi ports for over 70 nationalities.",
    emergencyNumbers: { police: "901", medical: "998" },
    avgCosts: { meal: 60, coffee: 22, transit: 8 }
  }
};

const DEFAULT_COUNTRY_DATA: CountryDetail = {
  code: "GEN",
  tippingStandard: "Generally 10% for good service in restaurants if not pre-included. Service workers appreciate cash tips.",
  notescoins: "Ensure notes are intact with no rips. Banknotes with small tears are often rejected by local merchants.",
  commonScams: ["Unregistered street cabs offering flat rates that spike dramatically.", "Counterfeit bills provided as change in busy nightclubs or markets."],
  visaNeeds: "Check with local embassies or official governmental consular portals prior to departure.",
  emergencyNumbers: { police: "112", medical: "112" },
  avgCosts: { meal: 15, coffee: 3.8, transit: 2.0 }
};

export default function TravelKit({ rates }: TravelKitProps) {
  const [homeCurrency, setHomeCurrency] = useState('USD');
  const [destinationCurrency, setDestinationCurrency] = useState('EUR');

  // --- Airport Mode Calculations ---
  const airportGrid = useMemo(() => {
    if (!rates || !rates[homeCurrency] || !rates[destinationCurrency]) return [];

    // Conversion multiplier
    const rate = rates[destinationCurrency] / rates[homeCurrency];
    const benchmarks = [1, 5, 10, 20, 50, 100, 250, 500];

    return benchmarks.map(val => ({
      homeVal: val,
      destVal: val * rate
    }));
  }, [homeCurrency, destinationCurrency, rates]);

  const travelGuidelines = useMemo(() => {
    return COUNTRY_TRAVEL_DATA[destinationCurrency] || {
      ...DEFAULT_COUNTRY_DATA,
      code: destinationCurrency
    };
  }, [destinationCurrency]);

  const homeDetails = CURRENCY_MAP[homeCurrency] || UNIQUE_CURRENCIES[0];
  const destDetails = CURRENCY_MAP[destinationCurrency] || UNIQUE_CURRENCIES[1];

  return (
    <div className="space-y-6" id="travel-kit-tab">
      
      {/* 1. Header controls */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-500" />
            Travel Intelligence Suite
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Setup travel path indicators to instantly generate regional tipping, currency alerts, and quick offline matrices.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-32">
            <span className="text-[9px] uppercase font-bold text-slate-400">Home Base</span>
            <select
              value={homeCurrency}
              onChange={(e) => setHomeCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white font-semibold"
            >
              {UNIQUE_CURRENCIES.slice(0, 15).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>

          <div className="flex-grow-0 pt-3 text-slate-450">➔</div>

          <div className="flex-1 md:w-32">
            <span className="text-[9px] uppercase font-bold text-slate-400">Destination</span>
            <select
              value={destinationCurrency}
              onChange={(e) => setDestinationCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white font-semibold"
            >
              {UNIQUE_CURRENCIES.slice(0, 30).map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Airport Quick-Calc & Visa Rules */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Module A: Airport Mode Matrix (Col 5) */}
        <div className="md:col-span-5 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Airport Mode: Quick Swap
            </h3>
            <span className="py-0.5 px-2 bg-emerald-500/10 border border-emerald-500/15 rounded-full text-emerald-500 text-[9px] font-bold uppercase tracking-wider">
              One-Tap View
            </span>
          </div>
          <p className="text-[10px] text-slate-450 leading-relaxed">
            Essential offline multiplier card. Fits on a phone screen for rapid reference while negotiating airport taxis or dining in terminals.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 font-mono text-xs">
            {airportGrid.map(({ homeVal, destVal }) => (
              <div key={homeVal} className="py-2.5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900/30 px-1 rounded transition">
                <span className="font-bold text-slate-700 dark:text-slate-350">{homeDetails?.symbol}{homeVal} {homeCurrency}</span>
                <span className="text-slate-400">➔</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {destDetails?.symbol}{destVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {destinationCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Module B: Local Tipping, Coins & Scam Alert (Col 7) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Tipping & Notes block */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-850 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Coins className="w-4 h-4 text-indigo-500" />
              Tipping & Banknotes (Local Standard)
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-500 font-bold uppercase block">Tipping Rules:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{travelGuidelines.tippingStandard}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">Visual Currency Note Tips:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{travelGuidelines.notescoins}</p>
              </div>
            </div>
          </div>

          {/* Scams & Emergency Numbers block */}
          <div className="p-6 rounded-2xl border border-rose-100 dark:border-rose-500/10 bg-rose-50/10 dark:bg-slate-900/20 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 border-b border-rose-100 dark:border-rose-500/10 pb-3">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Tourist Scams & Emergency Dispatch
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Scams */}
              <div className="space-y-2">
                <span className="text-[10px] text-rose-600 font-bold uppercase block">Regional Scams Alert:</span>
                <ul className="space-y-2">
                  {travelGuidelines.commonScams.map((scam, i) => (
                    <li key={i} className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{scam}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Emergency info */}
              <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-slate-950/80 space-y-3">
                <span className="text-[10px] text-rose-500 font-bold uppercase block">National Helplines</span>
                <div className="space-y-2 leading-none font-mono">
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] text-slate-500">Police dispatch:</span>
                    <strong className="text-slate-800 dark:text-white font-black text-xs">{travelGuidelines.emergencyNumbers.police}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] text-slate-500">Ambulance:</span>
                    <strong className="text-slate-800 dark:text-white font-black text-xs">{travelGuidelines.emergencyNumbers.medical}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Required Visa Rules:</span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-350 font-sans leading-normal font-semibold mt-1">
                    {travelGuidelines.visaNeeds}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Cost of Living Estimates */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-lg">
            <h3 className="text-sm font-semibold text-slate-850 dark:text-white flex items-center gap-1.5 mb-3">
              <Compass className="w-4 h-4 text-emerald-500" />
              Baseline Cost of Living Indicators (Avg)
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
                <Utensils className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Standard Meal</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                  {destDetails?.symbol}{travelGuidelines.avgCosts.meal.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
                <Coffee className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Latte Coffee</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                  {destDetails?.symbol}{travelGuidelines.avgCosts.coffee.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
                <Globe className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">One-Way Metro</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                  {destDetails?.symbol}{travelGuidelines.avgCosts.transit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
