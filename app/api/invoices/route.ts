import { db } from '@/lib/db/drizzle';
import { invoices, invoiceItems } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

export async function GET() {
  // Get all invoices with their items
  const allInvoices = await db.query.invoices.findMany({
    with: { items: true },
  });
  return Response.json(allInvoices);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { clientId, dueDate, total, status, items } = data;
  if (!clientId || !dueDate || !total) {
    return Response.json({ error: 'Client, due date, and total are required.' }, { status: 400 });
  }
  const [invoice] = await db
    .insert(invoices)
    .values({
      clientId: Number(clientId),
      dueDate: new Date(dueDate),
      total: Number(total),
      status,
    })
    .returning();
  if (items && Array.isArray(items)) {
    for (const item of items) {
      await db.insert(invoiceItems).values({
        invoiceId: invoice.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.quantity) * Number(item.unitPrice),
      });
    }
  }
  const invoiceWithItems = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoice.id),
    with: { items: true },
  });
  return Response.json(invoiceWithItems);
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  const { id, clientId, dueDate, total, status, items, paid } = data;
  if (!id) return Response.json({ error: 'Invoice id required' }, { status: 400 });
  let paidAt = undefined;
  if (paid) paidAt = new Date();
  const [invoice] = await db
    .update(invoices)
    .set({
      clientId: Number(clientId),
      dueDate: new Date(dueDate),
      total: Number(total),
      status,
      paidAt,
    })
    .where(eq(invoices.id, id))
    .returning();
  // Remove old items and insert new ones
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  if (items && Array.isArray(items)) {
    for (const item of items) {
      await db.insert(invoiceItems).values({
        invoiceId: invoice.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.quantity) * Number(item.unitPrice),
      });
    }
  }
  const invoiceWithItems = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoice.id),
    with: { items: true },
  });
  return Response.json(invoiceWithItems);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  const { id } = data;
  if (!id) return Response.json({ error: 'Invoice id required' }, { status: 400 });
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  await db.delete(invoices).where(eq(invoices.id, id));
  return Response.json({ success: true });
}

// Bulk invoice creation endpoint
export async function POST_bulk(req: Request) {
  try {
    const { invoices: invoicesData } = await req.json();
    if (!Array.isArray(invoicesData)) {
      return Response.json({ error: 'invoices must be an array' }, { status: 400 });
    }
    const results = [];
    for (const invoiceData of invoicesData) {
      try {
        // Insert invoice
        const [invoice] = await db
          .insert(invoices)
          .values({
            clientId: invoiceData.clientId,
            issueDate: invoiceData.issueDate,
            dueDate: invoiceData.dueDate,
            status: invoiceData.status || 'draft',
            total: invoiceData.total,
            notes: invoiceData.notes,
            stripePaymentLink: invoiceData.stripePaymentLink,
            recurring: invoiceData.recurring || 0,
            recurringInterval: invoiceData.recurringInterval,
            currency: invoiceData.currency || 'USD',
            tax: invoiceData.tax,
            template: invoiceData.template,
            customFields: invoiceData.customFields ? JSON.stringify(invoiceData.customFields) : null,
            wireInstructions: invoiceData.wireInstructions,
          })
          .returning();
        // Insert items
        if (Array.isArray(invoiceData.items)) {
          for (const item of invoiceData.items) {
            await db.insert(invoiceItems).values({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            });
          }
        }
        results.push({ invoiceId: invoice.id, status: 'success' });
      } catch (err) {
        results.push({ error: err instanceof Error ? err.message : String(err), invoice: invoiceData });
      }
    }
    return Response.json({ results });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
