import { db } from '@/lib/db/drizzle';
import { paymentPlans, payments, users, paymentPlanLogs, invoices, clients } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { sendPaymentPlanEmail } from '@/lib/email/sendPaymentPlanEmail';

// Utility: auto-update plan statuses
async function autoUpdatePlanStatuses(invoiceId: number) {
  const plans = await db.select().from(paymentPlans).where(eq(paymentPlans.invoiceId, invoiceId)).orderBy(asc(paymentPlans.dueDate));
  const allPayments = await db.select().from(payments).where(eq(payments.invoiceId, invoiceId));
  let paymentPool = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const now = new Date();
  for (const plan of plans) {
    let newStatus = plan.status;
    if (paymentPool >= plan.amount) {
      newStatus = 'paid';
      paymentPool -= plan.amount;
    } else if (new Date(plan.dueDate) < now && newStatus !== 'paid') {
      newStatus = 'overdue';
    } else if (newStatus !== 'paid') {
      newStatus = 'pending';
    }
    if (newStatus !== plan.status) {
      await db.update(paymentPlans).set({ status: newStatus }).where(eq(paymentPlans.id, plan.id));
      // Send overdue notification
      if (newStatus === 'overdue') {
        // Get client email
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, plan.invoiceId));
        if (invoice) {
          const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId));
          if (client) {
            await sendPaymentPlanEmail({
              to: client.email,
              subject: `Installment Overdue for Invoice #${plan.invoiceId}`,
              text: `An installment of $${(plan.amount / 100).toFixed(2)} due on ${new Date(plan.dueDate).toLocaleDateString()} is now overdue. Please pay as soon as possible.`,
              details: {
                invoiceNumber: invoice.id,
                dueDate: plan.dueDate,
                paymentLink: invoice.stripePaymentLink || undefined,
                clientName: client.name,
                amount: plan.amount,
              },
              eventType: 'overdue',
              locale: 'en',
            });
          }
        }
      }
    }
  }
}

// GET /api/payment-plans?invoiceId=123
export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('invoiceId');
  if (!invoiceId) {
    return new Response(JSON.stringify({ error: 'Missing invoiceId' }), { status: 400 });
  }
  await autoUpdatePlanStatuses(Number(invoiceId));
  const plans = await db.select().from(paymentPlans).where(eq(paymentPlans.invoiceId, Number(invoiceId)));
  return new Response(JSON.stringify(plans), { status: 200 });
}

// POST /api/payment-plans { invoiceId, dueDate, amount }
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const { invoiceId, dueDate, amount } = await req.json();
  if (!invoiceId || !dueDate || !amount) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  const [plan] = await db.insert(paymentPlans).values({
    invoiceId: Number(invoiceId),
    dueDate: new Date(dueDate),
    amount: Number(amount),
    status: 'pending',
  }).returning();
  await db.insert(paymentPlanLogs).values({
    planId: plan.id,
    userId: user.id,
    action: 'add',
    before: null,
    after: JSON.stringify(plan),
  });
  // Send notification to client
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, plan.invoiceId));
  if (invoice) {
    const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId));
    if (client) {
      await sendPaymentPlanEmail({
        to: client.email,
        subject: `New Payment Plan Installment for Invoice #${plan.invoiceId}`,
        text: `A new installment of $${(plan.amount / 100).toFixed(2)} is scheduled for ${new Date(plan.dueDate).toLocaleDateString()}.`,
        details: {
          invoiceNumber: invoice.id,
          dueDate: plan.dueDate,
          paymentLink: invoice.stripePaymentLink || undefined,
          clientName: client.name,
          amount: plan.amount,
        },
        eventType: 'new',
        locale: 'en',
      });
    }
  }
  return new Response(JSON.stringify(plan), { status: 201 });
}

// PATCH /api/payment-plans { id, dueDate, amount, status }
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const { id, dueDate, amount, status } = await req.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }
  const beforePlan = await db.select().from(paymentPlans).where(eq(paymentPlans.id, id));
  const update: any = {};
  if (dueDate) update.dueDate = new Date(dueDate);
  if (amount) update.amount = Number(amount);
  if (status) update.status = status;
  const [plan] = await db.update(paymentPlans).set(update).where(eq(paymentPlans.id, id)).returning();
  await db.insert(paymentPlanLogs).values({
    planId: plan.id,
    userId: user.id,
    action: 'edit',
    before: JSON.stringify(beforePlan[0]),
    after: JSON.stringify(plan),
  });
  // Send notification to client
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, plan.invoiceId));
  if (invoice) {
    const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId));
    if (client) {
      await sendPaymentPlanEmail({
        to: client.email,
        subject: `Payment Plan Installment Updated for Invoice #${plan.invoiceId}`,
        text: `An installment of $${(plan.amount / 100).toFixed(2)} is now scheduled for ${new Date(plan.dueDate).toLocaleDateString()}. Status: ${plan.status}`,
        details: {
          invoiceNumber: invoice.id,
          dueDate: plan.dueDate,
          paymentLink: invoice.stripePaymentLink || undefined,
          clientName: client.name,
          amount: plan.amount,
        },
        eventType: 'updated',
        locale: 'en',
      });
    }
  }
  return new Response(JSON.stringify(plan), { status: 200 });
}

// DELETE /api/payment-plans { id }
export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const { id } = await req.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }
  const beforePlan = await db.select().from(paymentPlans).where(eq(paymentPlans.id, id));
  await db.delete(paymentPlans).where(eq(paymentPlans.id, id));
  await db.insert(paymentPlanLogs).values({
    planId: id,
    userId: user.id,
    action: 'delete',
    before: JSON.stringify(beforePlan[0]),
    after: null,
  });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 