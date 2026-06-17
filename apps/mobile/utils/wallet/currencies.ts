export const SUPPORTED_CURRENCIES = [
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', symbol: 'GH₵' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', symbol: 'KSh' },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

// Approximate indicative rates from GBP base
export const EXCHANGE_RATES: Record<SupportedCurrencyCode, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  NGN: 1980,
  GHS: 19.5,
  KES: 164,
};

export function convertFromGBP(amount: number, toCurrency: string): number {
  const rate = EXCHANGE_RATES[toCurrency as SupportedCurrencyCode] ?? 1;
  return Math.round(amount * rate * 100) / 100;
}
