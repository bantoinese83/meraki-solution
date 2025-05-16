import { db } from '@/lib/db/drizzle';
import { paymentPlans } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function DELETE(req: NextRequest, { params }: { params: { planId: string } }) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const planId = Number(params.planId);
  if (!planId) {
    return new Response(JSON.stringify({ error: 'Missing planId' }), { status: 400 });
  }
  await db.delete(paymentPlans).where(eq(paymentPlans.id, planId));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 