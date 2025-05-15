import { db } from '@/lib/db/drizzle';
import { invoices, clients } from '@/lib/db/schema';

export async function GET() {
  // Get all invoices
  const allInvoices = await db.select().from(invoices);
  const allClients = await db.select().from(clients);

  const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const outstanding = allInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total || 0), 0);
  const paidCount = allInvoices.filter(i => i.status === 'paid').length;
  const unpaidCount = allInvoices.filter(i => i.status !== 'paid').length;

  // Top clients by paid invoice total
  const clientTotals: Record<number, number> = {};
  allInvoices.forEach(i => {
    if (i.status === 'paid') {
      clientTotals[i.clientId] = (clientTotals[i.clientId] || 0) + (i.total || 0);
    }
  });
  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([clientId, total]) => {
      const client = allClients.find(c => c.id === Number(clientId));
      return { id: clientId, name: client?.name || clientId, total };
    });

  return Response.json({ totalRevenue, outstanding, paidCount, unpaidCount, topClients });
} 