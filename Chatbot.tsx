import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, ArrowRight, User, HelpCircle, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: "Hello! I am CXAI, your dedicated CurrencyX Financial Advisor assistant. I specialize in historical exchange rate movements, forex analysis, central bank decisions (Fed, ECB, BoJ), travel spending calculations, or global macroeconomics. What financial topics can I assist you with today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick helper prompts
  const QUICK_PROMPTS = [
    "How do central bank interest rates influence exchange rates?",
    "Compare cost of living: Tokyo vs London",
    "What is a Pip and margin in FX trading?",
    "Explain the history of the Bretton Woods system"
  ];

  // Scroll to bottom on updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('AI engine is currently rebooting. Please try back shortly.');
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text || "I was unable to analyze this request. Please restate your query.",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `m-err-${Date.now()}`,
        role: 'assistant',
        content: `Error connecting to Gemini API: ${err.message}. Please verify your network and GEMINI_API_KEY environment variable.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(textInput);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl relative overflow-hidden flex flex-col h-[520px] md:h-[600px] justify-between" id="ai-chat-interface">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/2 blur-3xl -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/2 blur-3xl -z-10 rounded-full" />

      {/* Header element */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-150 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center p-2 text-emerald-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-md font-semibold text-slate-800 dark:text-white flex items-center gap-1">
            CurrencyX Assistant
            <span className="text-[9px] font-bold py-0.5 px-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 animate-bounce" />
              Gemini Pro Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time advisory on cross-border valuations, trading metrics, & budgets.
          </p>
        </div>
      </div>

      {/* Message space stack */}
      <div className="flex-grow my-4 overflow-y-auto pr-1 scrollbar-thin scroll-smooth flex flex-col gap-4">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center ${
              m.role === 'user' 
                ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-200' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {m.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Landmark className="w-4.5 h-4.5" />}
            </div>

            {/* Bubble element */}
            <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
              m.role === 'user' 
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-850 dark:to-slate-800 border-slate-900 text-slate-50 dark:text-white rounded-tr-none shadow-md' 
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-line font-sans prose prose-slate dark:prose-invert">
                {m.content}
              </div>
              <div className="text-[9px] text-right text-slate-400 mt-1.5 font-mono">
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 self-start max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Footer input and quick advice pills */}
      <div className="space-y-3.5">
        {/* Quick prompts pills */}
        {messages.length === 1 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-450" />
              Suggested Queries:
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-350 select-none cursor-pointer text-left leading-normal"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real Form Textfield */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ask CXAI Advisor about forex trends, inflation, calculations..."
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isTyping}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
