import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db/drizzle';
import { invoices, clients, expenses, timeEntries } from '@/lib/db/schema';

export async function GET() {
  // Fetch analytics data
  const [allInvoices, allClients, allExpenses, allTimeEntries] = await Promise.all([
    db.select().from(invoices),
    db.select().from(clients),
    db.select().from(expenses),
    db.select().from(timeEntries),
  ]);

  const totalRevenue = allInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const outstanding = allInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const paidCount = allInvoices.filter((i) => i.status === 'paid').length;
  const unpaidCount = allInvoices.filter((i) => i.status !== 'paid').length;

  // Top clients by paid invoice total
  const clientTotals: Record<number, number> = {};
  allInvoices.forEach((i) => {
    if (i.status === 'paid') {
      clientTotals[i.clientId] = (clientTotals[i.clientId] || 0) + (i.total || 0);
    }
  });
  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([clientId, total]) => {
      const client = allClients.find((c) => c.id === Number(clientId));
      return { id: clientId, name: client?.name || clientId, total };
    });

  const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalHours = allTimeEntries.reduce((sum, t) => sum + (t.hours || 0), 0);

  // Build summary string for Gemini
  const summary = `
    Revenue: $${(totalRevenue / 100).toFixed(2)}
    Outstanding: $${(outstanding / 100).toFixed(2)}
    Paid Invoices: ${paidCount}
    Unpaid Invoices: ${unpaidCount}
    Top Clients: ${topClients.map((c) => `${c.name} ($${(c.total / 100).toFixed(2)})`).join(', ')}
    Expenses: $${(totalExpenses / 100).toFixed(2)}
    Time Tracked: ${totalHours} hours
  `;

  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
  // Hardcoded Gemini API key for testing
  const apiKey = 'AIzaSyCbw4QGCarS1B3rxWRsUMyKqyO2Xi3aWGY';
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }
  const ai = new GoogleGenerativeAI(apiKey);

  
  const prompt = `
    Analyze the following business analytics data and return 3 actionable insights for the business owner.
    Data:
    ${summary}
    Respond as a JSON object with an "insights" array of strings.
  `;

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 256,
        temperature: 0.3,
      },
    });
    let insights = [];
    let text = '';
    try {
      text = response.response.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.insights)) {
        insights = parsed.insights;
      } else if (Array.isArray(parsed)) {
        insights = parsed;
      } else if (typeof parsed.message === 'string') {
        insights = [parsed.message];
      }
    } catch (e) {
      insights = ['Could not parse Gemini response.'];
    }
    return NextResponse.json({ insights });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({
      insights: [
        'AI service unavailable or returned invalid response.',
        'Please check your Gemini API key and configuration.',
      ],
    }, { status: 500 });
  }
}
