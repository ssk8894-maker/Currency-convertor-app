import { Currency, HistoricalRatePoint } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', flag: '🇮🇶' },
  { code: 'QAR', name: 'Qatari Rial', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: '🇨🇷' },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: '🇳🇮' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦' },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', flag: '🇵🇾' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', flag: '🇧🇴' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', flag: '🇹🇹' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', flag: '🇧🇧' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', flag: '🇧🇿' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: '$', flag: '🇬🇾' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', flag: '🇸🇷' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', flag: '🇷🇸' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', flag: '🇧🇦' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', flag: '🇸🇩' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m', flag: '🇺🇿' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', flag: '🇹🇯' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'сом', flag: '🇰🇬' },
  { code: 'MNT', name: 'Mongolian Tughrik', symbol: '₮', flag: '🇲🇳' },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'रु', flag: '🇳🇵' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SR', flag: '🇸🇨' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', flag: '🇸🇿' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc', flag: '🇨🇻' },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', flag: '🇸🇱' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: '$', flag: '🇱🇷' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', flag: '🇬🇲' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇸🇳' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: '🇵🇫' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: '🇵🇬' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺' },
  { code: 'TOP', name: 'Tongan Pa\'anga', symbol: 'T$', flag: '🇹🇴' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: '🇼🇸' },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ', flag: '🇨🇼' },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', flag: '🇦🇼' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', flag: '🇰🇾' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🇱🇨' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸' },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', flag: '🇭🇹' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧' },
  { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س', flag: '🇸🇾' },
  { code: 'YER', name: 'Yemeni Rial', symbol: 'ر.ي', flag: '🇾🇪' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', flag: '🇮🇷' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', flag: '🇸🇴' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'د.ل', flag: '🇱🇾' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', flag: '🇸🇩' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£', flag: '🇸🇸' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: 'Z$', flag: '🇿🇼' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', flag: '🇸🇹' },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', flag: '🇲🇷' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: '🇲🇴' },
  { code: 'KPT', name: 'North Korean Won', symbol: '₩', flag: '🇰🇵' },
  { code: 'FALK', name: 'Falkland Islands Pound', symbol: '£', flag: '🇫🇰' },
  { code: 'SHP', name: 'Saint Helena Pound', symbol: '£', flag: '🇸🇭' },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', flag: '🇬🇮' },
  { code: 'DKK', name: 'Greenlandic Krone', symbol: 'kr', flag: '🇬🇱' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: '🇲🇴' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧' },
  { code: 'TOP', name: 'Tongan Pa\'anga', symbol: 'T$', flag: '🇹🇴' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: '🇼🇸' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: '🇵🇫' }
];

// Helper to remove duplicate currencies (mainly safekeeping from typos)
export const UNIQUE_CURRENCIES = CURRENCIES.reduce<Currency[]>((acc, current) => {
  const x = acc.find(item => item.code === current.code);
  if (!x) {
    return acc.concat([current]);
  } else {
    return acc;
  }
}, []);

// Map containing quick lookup
export const CURRENCY_MAP = UNIQUE_CURRENCIES.reduce<{ [code: string]: Currency }>((acc, cur) => {
  acc[cur.code] = cur;
  return acc;
}, {});

/**
 * Generates realistic historical exchange rates for high-fidelity charts.
 * Uses a pseudo-random deterministic walker (LCG seeded by currency pair and date)
 * to ensure charts are stable, realistic, and don't load random noise on every tab change.
 */
function seededRandom(seedStr: string): () => number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507) | 0;
    h = Math.imul(h ^ h >>> 13, 3266489909) | 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function generateHistoricalRates(
  fromCode: string,
  toCode: string,
  timeframe: '1D' | '7D' | '1M' | '6M' | '1Y',
  baseRate: number
): HistoricalRatePoint[] {
  const pointsCountMap = {
    '1D': 24, // Hourly points
    '7D': 7,  // Daily points
    '1M': 30, // Daily points
    '6M': 26, // Weekly points
    '1Y': 12  // Monthly points
  };

  const count = pointsCountMap[timeframe];
  const rand = seededRandom(`${fromCode}-${toCode}-${timeframe}-2026`);
  const points: HistoricalRatePoint[] = [];

  const now = new Date();
  
  // Custom date formatting depending on timeframe
  const formatTime = (date: Date, idx: number): string => {
    if (timeframe === '1D') {
      const h = (24 - count + idx) % 24;
      return `${h.toString().padStart(2, '0')}:00`;
    } else if (timeframe === '7D') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === '1M') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timeframe === '6M') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  let currentRate = baseRate;
  
  // Standard walk parameters
  let volatility = 0.008; // 0.8% default
  if (timeframe === '6M') volatility = 0.03;
  if (timeframe === '1Y') volatility = 0.06;
  if (timeframe === '1D') volatility = 0.002;

  // Track coordinates
  const dates: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (timeframe === '1D') {
      d.setHours(now.getHours() - i);
    } else if (timeframe === '7D' || timeframe === '1M') {
      d.setDate(now.getDate() - i);
    } else if (timeframe === '6M') {
      d.setDate(now.getDate() - (i * 7));
    } else {
      d.setMonth(now.getMonth() - i);
    }
    dates.push(d);
  }

  // Generate Brownian motion walk
  const initialTrend = (rand() - 0.5) * volatility; // Deterministic trend
  let rateWalk: number[] = new Array(count);
  
  // Start from past and walk forward to result in baseRate at the end
  rateWalk[count - 1] = baseRate;
  for (let i = count - 2; i >= 0; i--) {
    const step = (rand() - 0.5 + initialTrend) * volatility;
    rateWalk[i] = rateWalk[i + 1] * (1 - step);
  }

  for (let i = 0; i < count; i++) {
    points.push({
      date: formatTime(dates[i], i),
      rate: Number(rateWalk[i].toFixed(5))
    });
  }

  return points;
}
