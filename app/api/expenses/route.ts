import { db } from '@/lib/db/drizzle';
import { expenses } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

export async function GET() {
  const all = await db.select().from(expenses);
  return Response.json(all);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { description, amount, currency } = data;
  if (!description || !amount) {
    return Response.json({ error: 'Description and amount are required.' }, { status: 400 });
  }
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'User not authenticated' }, { status: 401 });
  }
  const team = await getTeamForUser();
  if (!team) {
    return Response.json({ error: 'Team not found' }, { status: 400 });
  }
  const [expense] = await db.insert(expenses).values({
    userId: user.id,
    teamId: team.id,
    description,
    amount: Number(amount),
    currency
  }).returning();
  return Response.json(expense);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return Response.json({ error: 'Expense id required' }, { status: 400 });
  await db.delete(expenses).where(eq(expenses.id, id));
  return Response.json({ success: true });
} 