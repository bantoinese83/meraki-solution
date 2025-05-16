import { db } from '@/lib/db/drizzle';
import { clients } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allClients = await db.select().from(clients).orderBy(clients.createdAt);
  return Response.json(allClients);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, email, company, phone, address } = data;
  if (!name || !email) {
    return Response.json({ error: 'Name and email are required.' }, { status: 400 });
  }
  const [client] = await db
    .insert(clients)
    .values({ name, email, company, phone, address })
    .returning();
  return Response.json(client);
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, ...fields } = data;
  if (!id) return Response.json({ error: 'Client id required' }, { status: 400 });
  const [client] = await db.update(clients).set(fields).where(eq(clients.id, id)).returning();
  return Response.json(client);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return Response.json({ error: 'Client id required' }, { status: 400 });
  await db.delete(clients).where(eq(clients.id, id));
  return Response.json({ success: true });
}
