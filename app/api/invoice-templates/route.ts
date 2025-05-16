import { db } from '@/lib/db/drizzle';
import { invoiceTemplates } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET: all templates for user/team
export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  const templates = await db.select().from(invoiceTemplates).where(
    and(eq(invoiceTemplates.userId, user.id))
  );
  return new Response(JSON.stringify(templates), { status: 200 });
}

// POST: create new template
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  const { name, templateJson } = await req.json();
  if (!name || !templateJson) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  const [template] = await db.insert(invoiceTemplates).values({
    name,
    userId: user.id,
    teamId: user.teamId || null,
    templateJson,
  }).returning();
  return new Response(JSON.stringify(template), { status: 201 });
}

// PATCH: update template
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  const { id, name, templateJson } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  const [template] = await db.update(invoiceTemplates).set({
    name,
    templateJson,
  }).where(and(eq(invoiceTemplates.id, id), eq(invoiceTemplates.userId, user.id))).returning();
  return new Response(JSON.stringify(template), { status: 200 });
}

// DELETE: delete template
export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  const { id } = await req.json();
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  await db.delete(invoiceTemplates).where(and(eq(invoiceTemplates.id, id), eq(invoiceTemplates.userId, user.id)));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 