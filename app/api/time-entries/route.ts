import { db } from '@/lib/db/drizzle';
import { timeEntries } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

export async function GET() {
  const all = await db.select().from(timeEntries);
  return Response.json(all);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { description, hours, date } = data;
  if (!hours) {
    return Response.json({ error: 'Hours are required.' }, { status: 400 });
  }
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'User not authenticated' }, { status: 401 });
  }
  const team = await getTeamForUser();
  if (!team) {
    return Response.json({ error: 'Team not found' }, { status: 400 });
  }
  const [entry] = await db
    .insert(timeEntries)
    .values({
      userId: user.id,
      teamId: team.id,
      description,
      hours: Number(hours),
      date: date ? new Date(date) : new Date(),
    })
    .returning();
  return Response.json(entry);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return Response.json({ error: 'Time entry id required' }, { status: 400 });
  await db.delete(timeEntries).where(eq(timeEntries.id, id));
  return Response.json({ success: true });
}
