import { db } from '@/lib/db/drizzle';
import { invoices, clients, expenses, timeEntries } from '@/lib/db/schema';
import { NextRequest } from 'next/server';

function toCSV(rows: unknown[], columns: string[]) {
  const header = columns.join(',');
  const csvRows = rows.map((row) =>
    columns.map((col) => JSON.stringify((row as Record<string, unknown>)[col] ?? '')).join(','),
  );
  return [header, ...csvRows].join('\n');
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  let rows = [];
  let columns: string[] = [];
  switch (type) {
    case 'invoices':
      rows = await db.select().from(invoices);
      columns = [
        'id',
        'clientId',
        'issueDate',
        'dueDate',
        'status',
        'total',
        'currency',
        'tax',
        'paidAt',
      ];
      break;
    case 'payments':
      rows = (await db.select().from(invoices)).filter((i) => i.status === 'paid');
      columns = ['id', 'clientId', 'issueDate', 'dueDate', 'total', 'currency', 'tax', 'paidAt'];
      break;
    case 'clients':
      rows = await db.select().from(clients);
      columns = ['id', 'name', 'email', 'company', 'phone', 'address', 'createdAt'];
      break;
    case 'expenses':
      rows = await db.select().from(expenses);
      columns = [
        'id',
        'userId',
        'teamId',
        'description',
        'amount',
        'currency',
        'date',
        'createdAt',
      ];
      break;
    case 'time-entries':
      rows = await db.select().from(timeEntries);
      columns = ['id', 'userId', 'teamId', 'description', 'hours', 'date', 'createdAt'];
      break;
    default:
      return new Response('Invalid type', { status: 400 });
  }
  const csv = toCSV(rows, columns);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${type}.csv"`,
    },
  });
}
