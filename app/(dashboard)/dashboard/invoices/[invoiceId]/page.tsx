'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';

// Define types for item and invoice, or use 'any' if not available
type PaletteItem = any; // Replace 'any' with a more specific type if available
type Invoice = any; // Replace 'any' with a more specific type if available

const PALETTE_MAP = {
  logo: (item: PaletteItem, invoice: Invoice) => item.logoUrl ? <img src={item.logoUrl} alt="Logo" className="max-h-16 mb-2" /> : null,
  companyInfo: (item: PaletteItem, invoice: Invoice) => <div className="mb-2 font-semibold">Your Company Name<br />123 Main St<br />info@company.com</div>,
  clientInfo: (item: PaletteItem, invoice: Invoice) => <div className="mb-2">Client: {invoice.clientName || invoice.clientId}</div>,
  lineItems: (item: PaletteItem, invoice: Invoice) => (
    <table className="min-w-full text-sm mb-2">
      <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>
        {(invoice.items || []).map((li: any, idx: number) => (
          <tr key={idx}>
            <td>{li.description}</td>
            <td>{li.quantity}</td>
            <td>${(li.unitPrice / 100).toFixed(2)}</td>
            <td>${((li.quantity * li.unitPrice) / 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  totals: (item: PaletteItem, invoice: Invoice) => <div className="font-bold text-lg">Total: ${(invoice.total / 100).toFixed(2)}</div>,
  notes: (item: PaletteItem, invoice: Invoice) => invoice.notes ? <div className="mt-2 italic">Notes: {invoice.notes}</div> : null,
  customText: (item: PaletteItem, invoice: Invoice) => <div style={{ fontSize: item.fontSize || 16 }}>{item.text || '[Custom Text]'}</div>,
};

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices?id=${invoiceId}`)
      .then(res => res.json())
      .then(async (inv) => {
        setInvoice(inv);
        if (inv && inv.template) {
          const res = await fetch('/api/invoice-templates');
          const templates = await res.json();
          const t = templates.find((tpl: any) => String(tpl.id) === String(inv.template));
          setTemplate(t);
        }
        setLoading(false);
      });
  }, [invoiceId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!invoice) return <div className="p-8">Invoice not found.</div>;

  let layout = template ? JSON.parse(template.templateJson) : null;

  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Invoice #{invoiceId}</h1>
      {template && (
        <Button className="mb-4" onClick={() => router.push(`/dashboard/invoice-templates?edit=${template.id}`)}>
          Edit Template
        </Button>
      )}
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        {layout ? (
          layout.map((item: any, idx: number) => (
            <div key={item.id || idx} className="mb-4 p-2 rounded" style={{ background: item.bgColor || '#fff' }}>
              {PALETTE_MAP[item.type] ? PALETTE_MAP[item.type](item, invoice) : <div>[{item.type}]</div>}
            </div>
          ))
        ) : (
          <>
            <div className="mb-2 font-semibold">Your Company Name<br />123 Main St<br />info@company.com</div>
            <div className="mb-2">Client: {invoice.clientName || invoice.clientId}</div>
            <table className="min-w-full text-sm mb-2">
              <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>
                {(invoice.items || []).map((li: any, idx: number) => (
                  <tr key={idx}>
                    <td>{li.description}</td>
                    <td>{li.quantity}</td>
                    <td>${(li.unitPrice / 100).toFixed(2)}</td>
                    <td>${((li.quantity * li.unitPrice) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="font-bold text-lg">Total: ${(invoice.total / 100).toFixed(2)}</div>
            {invoice.notes && <div className="mt-2 italic">Notes: {invoice.notes}</div>}
          </>
        )}
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Payment History</h2>
        {payments.length === 0 ? (
          <div className="text-gray-500">No payments yet.</div>
        ) : (
          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Method</th><th>Note</th></tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id}>
                  <td>{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                  <td>${(p.amount / 100).toFixed(2)}</td>
                  <td>{p.method || ''}</td>
                  <td>{p.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form onSubmit={handlePayment} className="space-y-2 bg-orange-50 rounded-xl p-4 shadow-md">
          <div className="font-semibold mb-2">Make a Payment</div>
          <input type="number" placeholder="Amount (cents)" value={amount} onChange={e => setAmount(e.target.value)} required className="border rounded px-2 py-1 w-32" />
          <input type="text" placeholder="Method (e.g. Card, Bank)" value={method} onChange={e => setMethod(e.target.value)} className="border rounded px-2 py-1 w-32" />
          <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="border rounded px-2 py-1 w-48" />
          <Button type="submit" disabled={loading || !amount} className="btn-meraki">{loading ? 'Processing...' : 'Add Payment'}</Button>
        </form>
      </section>
    </main>
  );
} 