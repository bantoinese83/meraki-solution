import { db } from '@/lib/db/drizzle';
import { paymentPlans } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  // Extract planId from the URL
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const planIdStr = segments[segments.length - 1];
  const planId = Number(planIdStr);
  if (!planId) {
    return new Response(JSON.stringify({ error: 'Missing planId' }), { status: 400 });
  }
  await db.delete(paymentPlans).where(eq(paymentPlans.id, planId));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 