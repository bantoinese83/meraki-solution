import { db } from '@/lib/db/drizzle';
import { invoices, clients, expenses } from '@/lib/db/schema';

export async function GET() {
  // Get all invoices and expenses
  const allInvoices = await db.select().from(invoices);
  const allClients = await db.select().from(clients);
  const allExpenses = await db.select().from(expenses);

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

  // Monthly Revenue & Expenses (last 6 months)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  const monthlyRevenue = months.map(({ year, month }) =>
    allInvoices
      .filter(
        (i) =>
          i.status === 'paid' &&
          i.issueDate &&
          new Date(i.issueDate).getFullYear() === year &&
          new Date(i.issueDate).getMonth() === month,
      )
      .reduce((sum, i) => sum + (i.total || 0), 0),
  );
  const monthlyExpenses = months.map(({ year, month }) =>
    allExpenses
      .filter(
        (e) =>
          e.date &&
          new Date(e.date).getFullYear() === year &&
          new Date(e.date).getMonth() === month,
      )
      .reduce((sum, e) => sum + (e.amount || 0), 0),
  );
  const monthLabels = months.map((m) => m.label);

  return Response.json({
    totalRevenue,
    outstanding,
    paidCount,
    unpaidCount,
    topClients,
    monthlyRevenue,
    monthlyExpenses,
    monthLabels,
  });
}
