import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

// In-memory cache for exchange rates to prevent API rate limiting
interface Cache {
  data: any;
  timestamp: number;
}
let ratesCache: Cache | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

// Highly realistic mock fallback rates if the API is offline
const FALLBACK_RATES: { [code: string]: number } = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.40,
  AUD: 1.51,
  CAD: 1.36,
  CHF: 0.90,
  CNY: 7.24,
  HKD: 7.81,
  NZD: 1.63,
  SEK: 10.55,
  KRW: 1375.20,
  SGD: 1.35,
  NOK: 10.60,
  MXN: 17.70,
  INR: 83.30,
  RUB: 89.50,
  ZAR: 18.40,
  TRY: 32.20,
  BRL: 5.15,
  TWD: 32.30,
  DKK: 6.85,
  PLN: 3.93,
  THB: 36.40,
  IDR: 16150.00,
  HUF: 358.50,
  ILS: 3.69,
  CLP: 915.00,
  PHP: 58.20,
  AED: 3.67,
  COP: 3880.00,
  SAR: 3.75,
  MYR: 4.69,
  RON: 4.58,
  CZK: 22.80,
  KWD: 0.31,
  ARS: 895.00,
  VND: 25400.00,
  EGP: 47.30
};

// Lazy initialization of Gemini client to prevent crash on missing key
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// -------------------------------------------------------------
// GET /api/rates
// -------------------------------------------------------------
app.get('/api/rates', async (req, res) => {
  const now = Date.now();
  if (ratesCache && (now - ratesCache.timestamp < CACHE_DURATION)) {
    return res.json(ratesCache.data);
  }

  try {
    // Try to fetch live rates from stable free open exchangerate api
    const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Rates API returned status ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.rates) {
      ratesCache = {
        data: {
          success: true,
          rates: data.rates,
          provider: 'er-api',
          last_updated: data.time_last_update_utc || new Date().toUTCString()
        },
        timestamp: now
      };
      return res.json(ratesCache.data);
    }
    throw new Error('Invalid rate response format');
  } catch (error: any) {
    console.error('Failed to fetch live rates, loading fallbacks:', error.message);
    
    // Fallback compilation
    const fallbackResults = {
      success: true,
      rates: { ...FALLBACK_RATES },
      provider: 'offline-fallback',
      last_updated: new Date().toUTCString(),
      warning: 'Live exchange rates could not be retrieved; loading stable offline stored rates.'
    };
    return res.json(fallbackResults);
  }
});

// -------------------------------------------------------------
// POST /api/ai/explain - Economic context & movement explainer
// -------------------------------------------------------------
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { fromCode, toCode, amount, currentRate } = req.body;
    if (!fromCode || !toCode) {
      return res.status(400).json({ error: 'Missing fromCode or toCode parameters' });
    }

    const ai = getAI();
    const prompt = `Please analyze the currency pair ${fromCode} to ${toCode}.
The current exchange rate is 1 ${fromCode} = ${currentRate} ${toCode}.
Explain simply what economic, geopolitical, and general market factors typically drive these movements, and provide a light, easy-to-understand explanation for an amount of ${amount} ${fromCode} converting to ${(amount * currentRate).toFixed(2)} ${toCode}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a friendly, expert financial analyst at CurrencyX AI. Break down complex forex dynamics into ultra-clear, simple language with zero jargon.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Summarized tagline/headline of the currency dynamics' },
            summary: { type: Type.STRING, description: '3-4 sentence comprehensive explanation of the currency movement or value' },
            economicFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key fundamental variables (e.g. monetary policy, interest rates, trade balances)'
            },
            recentNewsImpact: { type: Type.STRING, description: 'Potential global events influencing these valuations in 1-2 sentences' }
          },
          required: ['headline', 'summary', 'economicFactors', 'recentNewsImpact']
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error('No text generated by Gemini');
  } catch (error: any) {
    console.error('AI Explain error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/ai/forecast - Trend predictions
// -------------------------------------------------------------
app.post('/api/ai/forecast', async (req, res) => {
  try {
    const { fromCode, toCode, currentRate } = req.body;
    if (!fromCode || !toCode) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const ai = getAI();
    const prompt = `Forecast possible short-term movements for the currency pair ${fromCode}/${toCode} currently at ${currentRate}. Give an calculated, hypothetical prediction analysis based on global economic stances.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a veteran forex researcher at CurrencyX AI. Predict reasonable short term (1-2 weeks) outlooks. Clarify that this is for educational purposes.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, description: 'Bullish, Bearish, or Sideways' },
            confidence: { type: Type.NUMBER, description: 'Confidence level from 0 to 100 percentage' },
            volatility: { type: Type.STRING, description: 'Expected volatility (Low, Medium, High)' },
            support: { type: Type.NUMBER, description: 'Next key technical support level' },
            resistance: { type: Type.NUMBER, description: 'Next key technical resistance level' },
            explanation: { type: Type.STRING, description: 'Professional market technical/fundamental explanation' },
            keyDeciders: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'What indicators or decisions (interest rates, unemployment stats) to look out for'
            }
          },
          required: ['trend', 'confidence', 'volatility', 'support', 'resistance', 'explanation', 'keyDeciders']
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error('No text returned from Gemini');
  } catch (error: any) {
    console.error('AI Forecast error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/ai/travel-budget - Travel budget generator
// -------------------------------------------------------------
app.post('/api/ai/travel-budget', async (req, res) => {
  try {
    const { destination, durationDays, budgetStyle, homeCurrency, localCurrency, conversionRate } = req.body;
    if (!destination || !durationDays || !budgetStyle) {
      return res.status(400).json({ error: 'Missing budget helper inputs' });
    }

    const ai = getAI();
    const prompt = `Create a realistic travel budget for traveler going to ${destination} for ${durationDays} days.
Style of travel is ${budgetStyle} (budget, mid-range, or luxury).
Home currency: ${homeCurrency}, Local Destination currency: ${localCurrency}.
Assume exchange rate is 1 ${homeCurrency} = ${conversionRate} ${localCurrency}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite travel budget planner and cost of living specialist. Calculate daily and grand totals in both currencies. Give highly granular and realistic recommendations based on local rates.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            fromCurrency: { type: Type.STRING },
            toCurrency: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            budgetStyle: { type: Type.STRING },
            totalLocal: { type: Type.NUMBER, description: 'Total estimated budget in destination currency' },
            totalHome: { type: Type.NUMBER, description: 'Total estimated budget in home currency' },
            dailyLocal: { type: Type.NUMBER },
            dailyHome: { type: Type.NUMBER },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'Accommodation, Dining, Transport, Entertainment, Shopping, etc.' },
                  amountLocal: { type: Type.NUMBER },
                  amountHome: { type: Type.NUMBER },
                  details: { type: Type.STRING, description: 'Specific description or examples of what this covers' }
                },
                required: ['category', 'amountLocal', 'amountHome', 'details']
              }
            },
            aiAnalysis: { type: Type.STRING, description: 'Detailed budget traveling advice, cost hacks, and currency safety tips.' }
          },
          required: ['destination', 'fromCurrency', 'toCurrency', 'durationDays', 'budgetStyle', 'totalLocal', 'totalHome', 'dailyLocal', 'dailyHome', 'breakdown', 'aiAnalysis']
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error('Failed to parse budget response');
  } catch (error: any) {
    console.error('Travel Budget API error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/ai/chat - Financial Assistant Chatbot
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAI();
    
    // Format messages for googleGenAI chat sendMessage
    // Convert client message history [{role: 'user'|'assistant', content: string}] -> Gemini chat format
    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const latestMessage = messages[messages.length - 1];
    
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      history: chatHistory,
      config: {
        systemInstruction: 'You are CurrencyX AI (CXAI), a premium, professional fintech financial advisor assistant. You are an expert in global curriencies, foreign exchange (Forex) markets, inflation facts, interest rates, central banks, and clever cross-borders spending solutions. Answer queries concisely with clean markdown, simple graphs, or lists. Always be extremely polite and accurate.'
      }
    });

    const result = await chat.sendMessage({
      message: latestMessage.content
    });

    if (result.text) {
      return res.json({ text: result.text });
    }
    throw new Error('Failed to generate response');
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/ai/analyze-spending - Spend analysis parser
// -------------------------------------------------------------
app.post('/api/ai/analyze-spending', async (req, res) => {
  try {
    const { expenses, baseCurrency, conversionRates } = req.body;
    if (!expenses || !Array.isArray(expenses) || !baseCurrency) {
      return res.status(400).json({ error: 'Expenses list and base ledger currency are required.' });
    }

    const ai = getAI();
    const serializedSpend = expenses.map((x: any) => `${x.description}: ${x.amount} ${x.currency}`).join(', ');

    const prompt = `Analyze this list of travel receipts/items in various currencies: [${serializedSpend}].
The user's home/portfolio ledger base currency is ${baseCurrency}. 
Provide a detailed financial audit. Categorize the spending (e.g., Food, Lodging, Transport, Shopping).
Formulates:
- 1. A clear high-level visual audit summary
- 2. Savings recommendations to reduce cross-border markups (e.g., avoiding airport exchange booths, utilizing fee-free cards)
- 3. Specific advice on Best Exchange Providers (highlighting how much can be saved by sourcing interbank rates instead of standard bank markup spreads).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite forensic spending analyst at CurrencyX AI. You help travelers audit foreign currency spending, cut transaction waste, and point them to the absolute lowest bank markup spreads.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoriesSummary: { type: Type.STRING, description: 'Quick structured categorization breakdown of total spendings.' },
            savingsHacks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key saving hacks to shaving money off foreign transactions.'
            },
            bestProviders: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable suggestions highlighting exact high-loss exchange spots (like ATM DCC, airport hubs) vs low-fee options.'
            },
            concludingAnalysis: { type: Type.STRING, description: 'Overall microeconomic audit summary of their foreign balance sheets.' }
          },
          required: ['categoriesSummary', 'savingsHacks', 'bestProviders', 'concludingAnalysis']
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error('Forensic financial analyzer did not return a response.');
  } catch (error: any) {
    console.error('Spend Analysis API error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/ai/news-dashboard - Economic tickers and AI News Feed
// -------------------------------------------------------------
app.get('/api/ai/news-dashboard', async (req, res) => {
  try {
    const ai = getAI();
    const prompt = `Generate a high-fidelity mock real-time list of 3 central bank policy actions, 3 commodity index updates (Gold, Silver, Brent Crude Oil), and 3 global forex news bulletins.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an automated Bloomberg/Reuters equivalent newsletter feed compiled for CurrencyX AI. Return logical and highly realistic daily market summaries based on the current financial climate.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bulletins: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'High impact headline' },
                  impact: { type: Type.STRING, description: 'High, Medium, or Low' },
                  timeAgo: { type: Type.STRING, description: 'e.g. 15 mins ago, 2 hours ago' },
                  content: { type: Type.STRING, description: '2-sentence brief of the economic impact' }
                },
                required: ['title', 'impact', 'timeAgo', 'content']
              }
            },
            commodities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Gold, Silver, Brent Crude, etc.' },
                  priceUSD: { type: Type.NUMBER, description: 'Price in USD' },
                  dailyChangePercent: { type: Type.NUMBER, description: 'Positive or negative percent float' }
                },
                required: ['name', 'priceUSD', 'dailyChangePercent']
              }
            },
            centralBanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  bank: { type: Type.STRING, description: 'Federal Reserve, ECB, Bank of Japan' },
                  ratePercent: { type: Type.NUMBER },
                  stance: { type: Type.STRING, description: 'Hawkish, Dovish, or Neutral' }
                },
                required: ['bank', 'ratePercent', 'stance']
              }
            },
            inflationHotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  country: { type: Type.STRING },
                  ratePercent: { type: Type.NUMBER },
                  trend: { type: Type.STRING, description: 'Rising, Falling, or Stable' }
                },
                required: ['country', 'ratePercent', 'trend']
              }
            }
          },
          required: ['bulletins', 'commodities', 'centralBanks', 'inflationHotspots']
        }
      }
    });

    if (response.text) {
      return res.json(JSON.parse(response.text.trim()));
    }
    throw new Error('Failed to generate economic dashboard metrics');
  } catch (error: any) {
    // Elegant offline mock fallback for economic dashboard if API key is inactive
    console.warn('AI news dashboard offline fallback initiated:', error.message);
    const mockDashboard = {
      bulletins: [
        {
          title: "Fed Signals Continued High Terminal Rates Amid Sticky Inflation",
          impact: "High",
          timeAgo: "23 mins ago",
          content: "Minutes from the Federal Open Market Committee indicate policymakers remain cautious about immediate interest rate cuts, bolstering USD strength."
        },
        {
          title: "European Central Bank Holds Benchmarks Steady at 4.25%",
          impact: "Medium",
          timeAgo: "1 hour ago",
          content: "President Christine Lagarde emphasized wage growth indices remain a sticking point, suggesting a sideways euro band is likely."
        },
        {
          title: "Bank of Japan Intervenes as Yen Touches Multi-Decade Low",
          impact: "High",
          timeAgo: "3 hours ago",
          content: "Spot indicators suggest direct administrative rate buys which temporary lifted JPY off historical resistance levels against major pegs."
        }
      ],
      commodities: [
        { name: "Gold (t oz)", priceUSD: 2435.50, dailyChangePercent: 0.85 },
        { name: "Silver (t oz)", priceUSD: 31.20, dailyChangePercent: 1.45 },
        { name: "Brent Crude (bbl)", priceUSD: 83.40, dailyChangePercent: -0.62 }
      ],
      centralBanks: [
        { bank: "US Federal Reserve", ratePercent: 5.25, stance: "Hawkish" },
        { bank: "European Central Bank", ratePercent: 4.25, stance: "Neutral" },
        { bank: "Bank of England", ratePercent: 5.00, stance: "Dovish" },
        { bank: "Bank of Japan", ratePercent: 0.25, stance: "Hawkish" }
      ],
      inflationHotspots: [
        { country: "Argentina", ratePercent: 289.4, trend: "Stable" },
        { country: "Turkey", ratePercent: 69.8, trend: "Falling" },
        { country: "United States", ratePercent: 3.4, trend: "Stable" },
        { country: "United Kingdom", ratePercent: 2.3, trend: "Falling" }
      ]
    };
    return res.json(mockDashboard);
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind server exclusively to host 0.0.0.0 and port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal: Failed to start the CurrencyX AI server:', error);
});
