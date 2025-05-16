import { db } from '@/lib/db/drizzle';
import { paymentPlanLogs, users } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const planId = req.nextUrl.searchParams.get('planId');
  if (!planId) {
    return new Response(JSON.stringify({ error: 'Missing planId' }), { status: 400 });
  }
  const logs = await db
    .select({
      id: paymentPlanLogs.id,
      action: paymentPlanLogs.action,
      timestamp: paymentPlanLogs.timestamp,
      before: paymentPlanLogs.before,
      after: paymentPlanLogs.after,
      userName: users.name,
      userEmail: users.email,
    })
    .from(paymentPlanLogs)
    .leftJoin(users, eq(paymentPlanLogs.userId, users.id))
    .where(eq(paymentPlanLogs.planId, Number(planId)))
    .orderBy(paymentPlanLogs.timestamp);
  return new Response(JSON.stringify(logs), { status: 200 });
} 