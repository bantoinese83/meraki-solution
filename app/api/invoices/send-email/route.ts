import { db } from '@/lib/db/drizzle';
import { invoices, clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { sendInvoiceEmail } from '@/lib/email/sendInvoiceEmail';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { invoiceId, additionalFiles } = await req.json();
  if (!invoiceId) return Response.json({ error: 'Missing invoiceId' }, { status: 400 });

  // Fetch invoice and client
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: { items: true },
  });
  if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
  const client = await db.query.clients.findFirst({ where: eq(clients.id, invoice.clientId) });
  if (!client?.email) return Response.json({ error: 'Client email not found' }, { status: 404 });

  // Generate PDF (reuse logic from /pdf route)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let y = 760;
  page.drawText('INVOICE', { x: 40, y, size: 28, font: boldFont, color: rgb(1, 0.4, 0) });
  y -= 40;
  page.drawText(`Invoice #${invoice.id}`, { x: 40, y, size: 14, font: boldFont });
  page.drawText(`Date: ${invoice.createdAt?.toLocaleDateString?.() || ''}`, { x: 400, y, size: 12, font });
  y -= 24;
  page.drawText(`Status: ${invoice.status}`, { x: 40, y, size: 12, font });
  y -= 24;
  page.drawText(`Client: ${client?.name || ''}`, { x: 40, y, size: 12, font });
  page.drawText(`Email: ${client?.email || ''}`, { x: 250, y, size: 12, font });
  page.drawText(`Address: ${client?.address || ''}`, { x: 40, y, size: 12, font });
  y -= 32;
  page.drawText('Items:', { x: 40, y, size: 14, font: boldFont });
  y -= 20;
  page.drawText('Description', { x: 40, y, size: 12, font: boldFont });
  page.drawText('Qty', { x: 300, y, size: 12, font: boldFont });
  page.drawText('Unit Price', { x: 350, y, size: 12, font: boldFont });
  page.drawText('Total', { x: 450, y, size: 12, font: boldFont });
  y -= 16;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 12;
  invoice.items.forEach((item) => {
    page.drawText(item.description || '', { x: 40, y, size: 12, font });
    page.drawText(String(item.quantity), { x: 300, y, size: 12, font });
    page.drawText(`$${(item.unitPrice / 100).toFixed(2)}`, { x: 350, y, size: 12, font });
    page.drawText(`$${((item.unitPrice * item.quantity) / 100).toFixed(2)}`, { x: 450, y, size: 12, font });
    y -= 18;
  });
  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 24;
  page.drawText('Total:', { x: 350, y, size: 14, font: boldFont });
  page.drawText(`$${(invoice.total / 100).toFixed(2)}`, { x: 450, y, size: 14, font: boldFont });
  y -= 40;
  page.drawText('Thank you for your business!', { x: 40, y, size: 12, font, color: rgb(0.2, 0.6, 0.2) });
  const pdfBytes = await pdfDoc.save();

  // Prepare attachments
  const attachments = [
    { filename: `invoice-${invoice.id}.pdf`, content: Buffer.from(pdfBytes) },
    // Add additional files if provided (base64 or buffer expected)
    ...(Array.isArray(additionalFiles) ? additionalFiles.map((f) => ({ filename: f.filename, content: Buffer.from(f.content, 'base64') })) : []),
  ];

  // Send email
  await sendInvoiceEmail({
    to: client.email,
    subject: `Invoice #${invoice.id} from Your Company`,
    text: `Dear ${client.name},\n\nPlease find attached your invoice.\n\nThank you!`,
    attachments,
  });

  return Response.json({ success: true });
} 