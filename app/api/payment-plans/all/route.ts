import { db } from '@/lib/db/drizzle';
import { paymentPlans, invoices, clients } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  // Join paymentPlans, invoices, clients
  const plans = await db
    .select({
      id: paymentPlans.id,
      invoiceId: paymentPlans.invoiceId,
      dueDate: paymentPlans.dueDate,
      amount: paymentPlans.amount,
      status: paymentPlans.status,
      clientName: clients.name,
    })
    .from(paymentPlans)
    .leftJoin(invoices, eq(paymentPlans.invoiceId, invoices.id))
    .leftJoin(clients, eq(invoices.clientId, clients.id));
  return new Response(JSON.stringify(plans), { status: 200 });
} 