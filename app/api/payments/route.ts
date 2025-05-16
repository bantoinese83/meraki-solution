import { db } from '@/lib/db/drizzle';
import { payments } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

// GET /api/payments?invoiceId=123
export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('invoiceId');
  if (!invoiceId) {
    return new Response(JSON.stringify({ error: 'Missing invoiceId' }), { status: 400 });
  }
  const allPayments = await db.select().from(payments).where(eq(payments.invoiceId, Number(invoiceId)));
  return new Response(JSON.stringify(allPayments), { status: 200 });
}

// POST /api/payments { invoiceId, amount, method, note }
export async function POST(req: NextRequest) {
  const { invoiceId, amount, method, note } = await req.json();
  if (!invoiceId || !amount) {
    return new Response(JSON.stringify({ error: 'Missing invoiceId or amount' }), { status: 400 });
  }
  const [payment] = await db.insert(payments).values({
    invoiceId: Number(invoiceId),
    amount: Number(amount),
    method: method || null,
    note: note || null,
  }).returning();
  return new Response(JSON.stringify(payment), { status: 201 });
} 