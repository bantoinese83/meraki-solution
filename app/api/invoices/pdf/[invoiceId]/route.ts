import { db } from '@/lib/db/drizzle';
import { NextRequest } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { eq } from 'drizzle-orm';
import { invoices, clients, invoiceTemplates } from '@/lib/db/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: NextRequest, context: any) {
  const invoiceId = Number(context.params.invoiceId);
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: { items: true },
  });
  if (!invoice) return new Response('Invoice not found', { status: 404 });
  const client = await db.query.clients.findFirst({ where: eq(clients.id, invoice.clientId) });

  // Fetch template if set
  let template = null;
  if (invoice.template) {
    template = await db.query.invoiceTemplates.findFirst({ where: eq(invoiceTemplates.id, Number(invoice.template)) });
  }
  let layout = template ? JSON.parse(template.templateJson) : null;

  // Create a styled PDF invoice using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 760;
  function drawText(text: string, opts: { x: number, y: number, size?: number, font?: any, color?: any }) {
    page.drawText(text, { ...opts, font: opts.font || font, size: opts.size || 12, color: opts.color });
  }

  // Render using template layout if available
  if (layout) {
    for (const item of layout) {
      switch (item.type) {
        case 'logo':
          // TODO: Render logo image if item.logoUrl is present (pdf-lib image embedding)
          y -= 40;
          drawText('[Logo]', { x: 40, y, size: 18, font: boldFont });
          y -= 10;
          break;
        case 'companyInfo':
          y -= 24;
          drawText('Your Company Name', { x: 40, y, size: 14, font: boldFont });
          y -= 16;
          drawText('123 Main St', { x: 40, y, size: 12, font });
          y -= 16;
          drawText('info@company.com', { x: 40, y, size: 12, font });
          y -= 10;
          break;
        case 'clientInfo':
          y -= 24;
          drawText(`Client: ${client?.name || ''}`, { x: 40, y, size: 12, font });
          y -= 16;
          drawText(`Email: ${client?.email || ''}`, { x: 40, y, size: 12, font });
          y -= 16;
          drawText(`Address: ${client?.address || ''}`, { x: 40, y, size: 12, font });
          y -= 10;
          break;
        case 'lineItems':
          y -= 24;
          drawText('Items:', { x: 40, y, size: 14, font: boldFont });
          y -= 20;
          drawText('Description', { x: 40, y, size: 12, font: boldFont });
          drawText('Qty', { x: 300, y, size: 12, font: boldFont });
          drawText('Unit Price', { x: 350, y, size: 12, font: boldFont });
          drawText('Total', { x: 450, y, size: 12, font: boldFont });
          y -= 16;
          page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          y -= 12;
          invoice.items.forEach((item) => {
            drawText(item.description || '', { x: 40, y });
            drawText(String(item.quantity), { x: 300, y });
            drawText(`$${(item.unitPrice / 100).toFixed(2)}`, { x: 350, y });
            drawText(`$${((item.unitPrice * item.quantity) / 100).toFixed(2)}`, { x: 450, y });
            y -= 18;
          });
          y -= 10;
          page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          y -= 10;
          break;
        case 'totals':
          y -= 24;
          drawText('Total:', { x: 350, y, size: 14, font: boldFont });
          drawText(`$${(invoice.total / 100).toFixed(2)}`, { x: 450, y, size: 14, font: boldFont });
          y -= 10;
          break;
        case 'notes':
          if (invoice.notes) {
            y -= 24;
            drawText(`Notes: ${invoice.notes}`, { x: 40, y, size: 12, font });
            y -= 10;
          }
          break;
        case 'customText':
          y -= 24;
          drawText(item.text || '[Custom Text]', { x: 40, y, size: Number(item.fontSize) || 14, font });
          y -= 10;
          break;
        default:
          y -= 24;
          drawText(`[${item.type}]`, { x: 40, y, size: 12, font });
          y -= 10;
      }
    }
    y -= 24;
    drawText('Thank you for your business!', { x: 40, y, size: 12, font, color: rgb(0.2, 0.6, 0.2) });
  } else {
    // Fallback: current default layout
    y = 760;
    page.drawText('INVOICE', { x: 40, y, size: 28, font: boldFont, color: rgb(1, 0.4, 0) });
    y -= 40;
    page.drawText(`Invoice #${invoice.id}`, { x: 40, y, size: 14, font: boldFont });
    page.drawText(`Date: ${invoice.createdAt?.toLocaleDateString?.() || ''}`, {
      x: 400,
      y,
      size: 12,
      font,
    });
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
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 12;
    invoice.items.forEach((item) => {
      page.drawText(item.description || '', { x: 40, y, size: 12, font });
      page.drawText(String(item.quantity), { x: 300, y, size: 12, font });
      page.drawText(`$${(item.unitPrice / 100).toFixed(2)}`, { x: 350, y, size: 12, font });
      page.drawText(`$${((item.unitPrice * item.quantity) / 100).toFixed(2)}`, {
        x: 450,
        y,
        size: 12,
        font,
      });
      y -= 18;
    });
    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 24;
    page.drawText('Total:', { x: 350, y, size: 14, font: boldFont });
    page.drawText(`$${(invoice.total / 100).toFixed(2)}`, { x: 450, y, size: 14, font: boldFont });
    y -= 40;
    page.drawText('Thank you for your business!', {
      x: 40,
      y,
      size: 12,
      font,
      color: rgb(0.2, 0.6, 0.2),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Response(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.id}.pdf`,
    },
  });
}
