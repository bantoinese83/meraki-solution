import { NextRequest } from 'next/server';

// Mock FX rates (in production, fetch from a real API)
const mockRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157.5,
  CAD: 1.36,
  AUD: 1.51,
};

export async function GET(req: NextRequest) {
  // In production, fetch from exchangerate-api.com, openexchangerates.org, etc.
  return new Response(JSON.stringify({ rates: mockRates }), { status: 200 });
} 