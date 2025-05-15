'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Client, Invoice } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientPortalPage() {
  const { clientId } = useParams();
  const { data: invoices = [] } = useSWR<Invoice[]>('/api/invoices', fetcher);
  const { data: clients = [] } = useSWR<Client[]>('/api/clients', fetcher);
  const client = clients.find((c) => String(c.id) === String(clientId));
  const clientInvoices = invoices.filter((inv) => String(inv.clientId) === String(clientId));
  const paidInvoices = clientInvoices.filter((inv) => inv.paidAt);
  const unpaidInvoices = clientInvoices.filter((inv) => !inv.paidAt);

  const [form, setForm] = useState({ name: client?.name || '', email: client?.email || '', address: client?.address || '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handlePayNow(invoiceId: number) {
    setMsg(null); setErr(null);
    const res = await fetch('/api/invoices/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setErr('Payment initiation failed.');
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setErr(null);
    const res = await fetch(`/api/clients`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId, ...form })
    });
    if (res.ok) {
      setMsg('Contact info updated!');
    } else {
      setErr('Update failed.');
    }
  }

  function handleDownloadPDF(invoiceId: number) {
    window.open(`/api/invoices/pdf/${invoiceId}`);
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Client Portal</h1>
      {client ? (
        <div className="mb-8 p-4 bg-gray-50 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Your Info</h2>
          <div className="mb-2">Name: <span className="font-medium">{client.name}</span></div>
          <div className="mb-2">Email: <span className="font-medium">{client.email}</span></div>
          <div className="mb-2">Address: <span className="font-medium">{client.address}</span></div>
          <form className="mt-4 space-y-2" onSubmit={handleUpdate}>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="border rounded px-2 py-1 flex-1" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <input className="border rounded px-2 py-1 w-full" placeholder="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Button size="sm" type="submit">Update Info</Button>
            {msg && <div className="text-green-600 text-sm">{msg}</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}
          </form>
        </div>
      ) : <div className="mb-8 text-gray-500">Loading client info...</div>}

      <h2 className="text-lg font-semibold mb-4">Outstanding Invoices</h2>
      {unpaidInvoices.length === 0 ? (
        <div className="text-gray-500 mb-8">No outstanding invoices.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1">Invoice #</th>
              <th className="px-2 py-1">Due Date</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Total</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {unpaidInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-orange-50">
                <td className="px-2 py-1">{invoice.id}</td>
                <td className="px-2 py-1">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</td>
                <td className="px-2 py-1">{invoice.status}</td>
                <td className="px-2 py-1">${(invoice.total / 100).toFixed(2)}</td>
                <td className="px-2 py-1 flex gap-2">
                  <Button size="sm" onClick={() => handlePayNow(invoice.id)}>Pay Now</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(invoice.id)}>Download PDF</Button>
                  {invoice.stripePaymentLink && (
                    <a href={invoice.stripePaymentLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Payment Link</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-lg font-semibold mb-4">Payment History</h2>
      {paidInvoices.length === 0 ? (
        <div className="text-gray-500">No payment history yet.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1">Invoice #</th>
              <th className="px-2 py-1">Paid Date</th>
              <th className="px-2 py-1">Total</th>
              <th className="px-2 py-1">Download</th>
            </tr>
          </thead>
          <tbody>
            {paidInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-green-50">
                <td className="px-2 py-1">{invoice.id}</td>
                <td className="px-2 py-1">{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ''}</td>
                <td className="px-2 py-1">${(invoice.total / 100).toFixed(2)}</td>
                <td className="px-2 py-1">
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(invoice.id)}>Download PDF</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
} 