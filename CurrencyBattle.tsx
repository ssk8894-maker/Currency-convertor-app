import React, { useState, useMemo } from 'react';
import { Swords, Crown, Award, Check, X, RotateCcw, Sparkles, AlertCircle, HelpCircle, Flame, ShieldCheck, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UNIQUE_CURRENCIES, CURRENCY_MAP } from './currencies';
import { ExchangeRates } from './types';

interface CurrencyBattleProps {
  rates: ExchangeRates;
}

interface TriviaQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 1,
    question: "Which of these countries uses the 'Loti' (plural: Maloti) as its official currency?",
    options: ["Lesotho", "Madagascar", "Mozambique", "Botswana"],
    answer: "Lesotho",
    explanation: "Lesotho uses the Lesotho Loti (LSL), which is pegged at 1:1 ratio to the South African Rand (ZAR)."
  },
  {
    id: 2,
    question: "What does the global currency symbol '₪' represent?",
    options: ["Indian Rupee", "Israeli New Shekel", "Thai Baht", "Costa Rican Colón"],
    answer: "Israeli New Shekel",
    explanation: "The symbol ₪ is the sign for the Israeli New Shekel (ILS), representing the Hebrew letters Shin and Het."
  },
  {
    id: 3,
    question: "Which monetary framework established in 1944 fixed global currencies to the US Dollar?",
    options: ["The Treaty of Versailles", "The Maastricht Treaty", "The Bretton Woods System", "The Plaza Accord"],
    answer: "The Bretton Woods System",
    explanation: "The Bretton Woods agreement in 1944 established fixed exchange rates pegged to the USD, which was backed by gold."
  },
  {
    id: 4,
    question: "What is the oldest officially existing currency still in active use today?",
    options: ["British Pound Sterling", "Swiss Franc", "Japanese Yen", "US Dollar"],
    answer: "British Pound Sterling",
    explanation: "The British Pound Sterling (GBP) dates back to Anglo-Saxon times (around 775 AD), making it the oldest continuous currency."
  },
  {
    id: 5,
    question: "Which African country recently introduced a gold-backed currency called 'ZiG'?",
    options: ["Nigeria", "Zimbabwe", "Ghana", "Kenya"],
    answer: "Zimbabwe",
    explanation: "Zimbabwe introduced the Zimbabwe Gold (ZiG) in April 2024 to combat hyperinflation and stabilize the country's economy."
  },
  {
    id: 6,
    question: "Which central bank has the primary mandate of maintaining price stability for the Eurozone?",
    options: ["Federal Reserve", "Bank of England", "European Central Bank", "Swiss National Bank"],
    answer: "European Central Bank",
    explanation: "The European Central Bank (ECB), based in Frankfurt, manages the monetary policy and stability of the common Euro currency."
  },
  {
    id: 7,
    question: "What has the nickname 'The Loonie' in global foreign exchange trading?",
    options: ["Australian Dollar", "New Zealand Dollar", "Canadian Dollar", "Norwegian Krone"],
    answer: "Canadian Dollar",
    explanation: "The Canadian 1-dollar coin features a common loon (a water bird) on its reverse, which gave rise to the nickname 'Loonie'."
  }
];

export default function CurrencyBattle({ rates }: CurrencyBattleProps) {
  // Battle states
  const [currencyA, setCurrencyA] = useState('USD');
  const [currencyB, setCurrencyB] = useState('EUR');

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreSummary, setShowScoreSummary] = useState(false);

  // Computed metrics for head-to-head battle
  const battleMetrics = useMemo(() => {
    if (!rates || !rates[currencyA] || !rates[currencyB]) return null;

    // Relative strength to USD (USD rate is 1. Higher USD/Currency rate means weaker unit value)
    const valA = rates[currencyA];
    const valB = rates[currencyB];

    const strengthA = 100 / valA;
    const strengthB = 100 / valB;

    // Volatility deterministic scores
    const seedCode = (currencyA + currencyB).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const growthScoreA = (seedCode % 40) + 50; // 50 to 90
    const growthScoreB = ((seedCode + 7) % 40) + 50;

    const stabilityScoreA = ((seedCode * 3) % 35) + 60; // 60 to 95
    const stabilityScoreB = (((seedCode + 12) * 5) % 35) + 60;

    // Reserve ratio factor estimates
    const reserveAllocations: { [code: string]: number } = {
      USD: 58.4,
      EUR: 19.8,
      JPY: 5.6,
      GBP: 4.8,
      CNY: 2.3,
      AUD: 2.1,
      CAD: 2.0,
      CHF: 0.2
    };

    const reserveA = reserveAllocations[currencyA] || 0.1;
    const reserveB = reserveAllocations[currencyB] || 0.1;

    // Absolute values compared
    const rawRatio = rates[currencyB] / rates[currencyA];

    // Determine weights for overall battle score
    // 30% Strength, 25% Growth rating, 25% Stability coefficient, 20% Reserve Index
    const overallScoreA = (strengthA > strengthB ? 30 : 10) + (growthScoreA * 0.25) + (stabilityScoreA * 0.25) + (reserveA * 0.8);
    const overallScoreB = (strengthB > strengthA ? 30 : 10) + (growthScoreB * 0.25) + (stabilityScoreB * 0.25) + (reserveB * 0.8);

    const winner = overallScoreA >= overallScoreB ? currencyA : currencyB;

    return {
      strengthA,
      strengthB,
      growthScoreA,
      growthScoreB,
      stabilityScoreA,
      stabilityScoreB,
      reserveA,
      reserveB,
      rawRatio,
      overallScoreA,
      overallScoreB,
      winner
    };
  }, [rates, currencyA, currencyB]);

  const dataA = CURRENCY_MAP[currencyA] || UNIQUE_CURRENCIES[0];
  const dataB = CURRENCY_MAP[currencyB] || UNIQUE_CURRENCIES[1];

  // Quiz mechanics
  const currentQuestion = TRIVIA_QUESTIONS[quizIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === currentQuestion.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    if (quizIndex < TRIVIA_QUESTIONS.length - 1) {
      setQuizIndex(i => i + 1);
    } else {
      setShowScoreSummary(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowScoreSummary(false);
  };

  return (
    <div className="space-y-8" id="currency-battle-quiz-tab">
      
      {/* 1. Visual Currency Battle */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/5 dark:bg-rose-500/3 blur-3xl -z-10 rounded-full" />

        <div className="mb-6 flex items-start gap-4 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-500" />
              Fintech Currency Battle Arena
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Surgically pit two currencies against each other based on unit strength, stability indexes, and reserve weights.
            </p>
          </div>
          <div className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/15 rounded-lg text-rose-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Competitive Score
          </div>
        </div>

        {/* Currency selection row */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Contender A</label>
            <select
              value={currencyA}
              onChange={(e) => setCurrencyA(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 font-semibold text-slate-800 dark:text-white"
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} disabled={c.code === currencyB}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-rose-500 text-white rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
            VS
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Contender B</label>
            <select
              value={currencyB}
              onChange={(e) => setCurrencyB(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 font-semibold text-slate-800 dark:text-white"
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} disabled={c.code === currencyA}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Battle results representation */}
        {battleMetrics && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {/* Winner banner */}
            <div className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-rose-600/5 border border-rose-500/20 text-center relative overflow-hidden">
              <div className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider block">Winner Prediction</span>
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 mt-0.5">
                <span>{battleMetrics.winner === currencyA ? dataA.flag : dataB.flag}</span>
                <span>{battleMetrics.winner === currencyA ? dataA.name : dataB.name} ({battleMetrics.winner})</span>
                <span className="text-xs bg-rose-500 text-white py-0.5 px-2 rounded-full font-mono">
                  Score: {battleMetrics.winner === currencyA ? battleMetrics.overallScoreA.toFixed(1) : battleMetrics.overallScoreB.toFixed(1)} pts
                </span>
              </span>
            </div>

            {/* Spec breakdown rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Unit Strength Scale */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Unit Worth value (vs USD)</span>
                  <span className="font-mono text-rose-500">
                    {battleMetrics.strengthA > battleMetrics.strengthB ? currencyA : currencyB} +{Math.max(battleMetrics.strengthA / (battleMetrics.strengthB || 1), battleMetrics.strengthB / (battleMetrics.strengthA || 1)).toFixed(1)}x
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyA}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(10, battleMetrics.strengthA * 1.5))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{(battleMetrics.strengthA / 100).toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyB}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(10, battleMetrics.strengthB * 1.5))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{(battleMetrics.strengthB / 100).toFixed(3)}</span>
                </div>
              </div>

              {/* Reserve Ratio Index */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Global Central Bank Reserves</span>
                  <span className="font-mono text-emerald-500">
                    {battleMetrics.reserveA > battleMetrics.reserveB ? currencyA : currencyB} dominant
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyA}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(5, battleMetrics.reserveA))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.reserveA}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyB}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-400 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(5, battleMetrics.reserveB))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.reserveB}%</span>
                </div>
              </div>

              {/* Stability Margin */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Price Stability Rating</span>
                  <span className="font-mono text-slate-500">Anti-Inflation scale</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyA}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${battleMetrics.stabilityScoreA}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.stabilityScoreA}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyB}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full" 
                      style={{ width: `${battleMetrics.stabilityScoreB}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.stabilityScoreB}/100</span>
                </div>
              </div>

              {/* Economic Growth Potential */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/10 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Trade Volume & Velocity</span>
                  <span className="font-mono text-indigo-500">Liquidity Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyA}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${battleMetrics.growthScoreA}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.growthScoreA}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-slate-500 truncate font-bold">{currencyB}</span>
                  <div className="flex-grow bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full" 
                      style={{ width: `${battleMetrics.growthScoreB}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{battleMetrics.growthScoreB}/100</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 2. Gamified Currency Quiz */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 dark:bg-amber-500/2 blur-3xl -z-10 rounded-full" />
        
        <div className="mb-6 flex items-start gap-4 justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Global Currency Scholar Challenge
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Test your knowledge about world monetary signs, pegs, names, and macroeconomic history.
            </p>
          </div>
          
          <div className="py-1 px-3 bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
            Score: {score}/{TRIVIA_QUESTIONS.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showScoreSummary ? (
            <motion.div
              key={quizIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 block mb-1">
                  Question {quizIndex + 1} of {TRIVIA_QUESTIONS.length}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal font-sans">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt) => {
                  let buttonStyle = "border-slate-150 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-200 pointer-events-auto";
                  let badge = null;

                  if (isAnswered) {
                    if (opt === currentQuestion.answer) {
                      buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
                      badge = <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
                    } else if (opt === selectedAnswer) {
                      buttonStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-450 font-medium";
                      badge = <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
                    } else {
                      buttonStyle = "opacity-45 border-slate-100 dark:border-slate-800 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`p-3 text-left text-xs rounded-xl border flex items-center justify-between transition cursor-pointer select-none leading-relaxed ${buttonStyle}`}
                    >
                      <span>{opt}</span>
                      {badge}
                    </button>
                  );
                })}
              </div>

              {/* Explanation block */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900/40 border border-amber-200/40 dark:border-slate-800/80 text-xs leading-relaxed space-y-2.5"
                >
                  <p className="text-slate-600 dark:text-slate-300 font-sans">
                    <strong className="text-amber-500">Explanation:</strong> {currentQuestion.explanation}
                  </p>

                  <button
                    onClick={handleNextQuestion}
                    className="py-1.5 px-4 bg-amber-505 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs tracking-wide transition cursor-pointer self-end w-max block"
                  >
                    {quizIndex === TRIVIA_QUESTIONS.length - 1 ? "Finish Scholar Quiz" : "Next Question ➔"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center p-3 text-amber-500 text-3xl">
                🏆
              </div>

              <div>
                <h3 className="text-md font-bold text-slate-800 dark:text-white uppercase tracking-wider">Course Complete!</h3>
                <p className="text-xs text-slate-450 mt-1 font-medium">
                  You scored <strong className="text-amber-500 font-bold">{score} out of {TRIVIA_QUESTIONS.length}</strong> questions correctly.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {score === TRIVIA_QUESTIONS.length ? "Incredible Mastermind! Wall Street is calling." : "Perfect your cross-border skills with currency modules."}
                </p>
              </div>

              <button
                onClick={handleRestartQuiz}
                className="py-2 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold font-sans transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
