'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import type { Client, Invoice, User } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientPortalPage() {
  const { clientId } = useParams();
  const { data: invoices = [] } = useSWR<Invoice[]>('/api/invoices', fetcher);
  const { data: clients = [] } = useSWR<Client[]>('/api/clients', fetcher);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const client = clients.find((c) => String(c.id) === String(clientId));
  const clientInvoices = invoices.filter((inv) => String(inv.clientId) === String(clientId));
  const paidInvoices = clientInvoices.filter((inv) => inv.paidAt);
  const unpaidInvoices = clientInvoices.filter((inv) => !inv.paidAt);

  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    address: client?.address || '',
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [paymentsMap, setPaymentsMap] = useState<Record<number, any[]>>({});
  const [amountMap, setAmountMap] = useState<Record<number, string>>({});
  const [methodMap, setMethodMap] = useState<Record<number, string>>({});
  const [noteMap, setNoteMap] = useState<Record<number, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [planMap, setPlanMap] = useState<Record<number, any[]>>({});
  const [showAddPlanMap, setShowAddPlanMap] = useState<Record<number, boolean>>({});
  const [newPlanDueMap, setNewPlanDueMap] = useState<Record<number, string>>({});
  const [newPlanAmountMap, setNewPlanAmountMap] = useState<Record<number, string>>({});
  const [editPlanId, setEditPlanId] = useState<number | null>(null);
  const [editPlanDue, setEditPlanDue] = useState('');
  const [editPlanAmount, setEditPlanAmount] = useState('');
  const [editPlanStatus, setEditPlanStatus] = useState('pending');
  const [planMsg, setPlanMsg] = useState('');

  const isAdmin = user && (user.role === 'owner' || user.role === 'admin');

  useEffect(() => {
    async function fetchPaymentsAndPlans() {
      const pMap: Record<number, any[]> = {};
      const plMap: Record<number, any[]> = {};
      for (const invoice of unpaidInvoices) {
        const res = await fetch(`/api/payments?invoiceId=${invoice.id}`);
        pMap[invoice.id] = await res.json();
        const plRes = await fetch(`/api/payment-plans?invoiceId=${invoice.id}`);
        plMap[invoice.id] = await plRes.json();
      }
      setPaymentsMap(pMap);
      setPlanMap(plMap);
    }
    fetchPaymentsAndPlans();
  }, [unpaidInvoices.length]);

  async function handlePayNow(invoiceId: number) {
    setMsg(null);
    setErr(null);
    const res = await fetch('/api/invoices/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setErr('Payment initiation failed.');
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await fetch(`/api/clients`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clientId, ...form }),
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

  async function handlePartialPayment(e: React.FormEvent, invoiceId: number) {
    e.preventDefault();
    setLoadingMap((m) => ({ ...m, [invoiceId]: true }));
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        amount: amountMap[invoiceId],
        method: methodMap[invoiceId],
        note: noteMap[invoiceId],
      }),
    });
    setAmountMap((m) => ({ ...m, [invoiceId]: '' }));
    setMethodMap((m) => ({ ...m, [invoiceId]: '' }));
    setNoteMap((m) => ({ ...m, [invoiceId]: '' }));
    // Refresh payments
    const res = await fetch(`/api/payments?invoiceId=${invoiceId}`);
    const payments = await res.json();
    setPaymentsMap((m) => ({ ...m, [invoiceId]: payments }));
    setLoadingMap((m) => ({ ...m, [invoiceId]: false }));
  }

  async function handleAddPlan(e: React.FormEvent, invoiceId: number) {
    e.preventDefault();
    await fetch('/api/payment-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        dueDate: newPlanDueMap[invoiceId],
        amount: newPlanAmountMap[invoiceId],
      }),
    });
    setNewPlanDueMap(m => ({ ...m, [invoiceId]: '' }));
    setNewPlanAmountMap(m => ({ ...m, [invoiceId]: '' }));
    setShowAddPlanMap(m => ({ ...m, [invoiceId]: false }));
    setPlanMsg('Installment added!');
    setTimeout(() => setPlanMsg(''), 2000);
    // Refresh plans
    const plRes = await fetch(`/api/payment-plans?invoiceId=${invoiceId}`);
    const plans = await plRes.json();
    setPlanMap(m => ({ ...m, [invoiceId]: plans }));
  }

  async function handleEditPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!editPlanId) return;
    await fetch('/api/payment-plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editPlanId,
        dueDate: editPlanDue,
        amount: editPlanAmount,
        status: editPlanStatus,
      }),
    });
    setEditPlanId(null); setEditPlanDue(''); setEditPlanAmount(''); setEditPlanStatus('pending');
    setPlanMsg('Installment updated!');
    setTimeout(() => setPlanMsg(''), 2000);
    // Refresh all plans
    for (const invoice of unpaidInvoices) {
      const plRes = await fetch(`/api/payment-plans?invoiceId=${invoice.id}`);
      const plans = await plRes.json();
      setPlanMap(m => ({ ...m, [invoice.id]: plans }));
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Client Portal</h1>
      {client ? (
        <div className="mb-8 p-4 bg-gray-50 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Your Info</h2>
          <div className="mb-2">
            Name: <span className="font-medium">{client.name}</span>
          </div>
          <div className="mb-2">
            Email: <span className="font-medium">{client.email}</span>
          </div>
          <div className="mb-2">
            Address: <span className="font-medium">{client.address}</span>
          </div>
          <form className="mt-4 space-y-2" onSubmit={handleUpdate}>
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <Button size="sm" type="submit">
              Update Info
            </Button>
            {msg && <div className="text-green-600 text-sm">{msg}</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}
          </form>
        </div>
      ) : (
        <div className="mb-8 text-gray-500">Loading client info...</div>
      )}

      <h2 className="text-lg font-semibold mb-4">Outstanding Invoices</h2>
      {unpaidInvoices.length === 0 ? (
        <div className="text-gray-500 mb-8">No outstanding invoices.</div>
      ) : (
        unpaidInvoices.map((invoice) => {
          const payments = paymentsMap[invoice.id] || [];
          const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
          const outstanding = invoice.total - paid;
          return (
            <div key={invoice.id} className="mb-8 p-4 bg-orange-50 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Invoice #{invoice.id}</div>
                <div className="text-sm text-gray-600">Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</div>
              </div>
              <div>Status: <b>{invoice.status}</b></div>
              <div>Total: <b>${(invoice.total / 100).toFixed(2)}</b></div>
              <div>Outstanding: <b className={outstanding > 0 ? 'text-red-600' : 'text-green-600'}>${(outstanding / 100).toFixed(2)}</b></div>
              <div className="mt-2">
                <b>Payment History:</b>
                {payments.length === 0 ? (
                  <div className="text-gray-500">No payments yet.</div>
                ) : (
                  <table className="min-w-full text-xs mb-2 mt-1">
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
              </div>
              <form onSubmit={e => handlePartialPayment(e, invoice.id)} className="space-y-2 mt-2 bg-white rounded-xl p-3 shadow-md">
                <div className="font-semibold mb-1">Make a Payment</div>
                <input type="number" placeholder="Amount (cents)" value={amountMap[invoice.id] || ''} onChange={e => setAmountMap(m => ({ ...m, [invoice.id]: e.target.value }))} required className="border rounded px-2 py-1 w-32" />
                <input type="text" placeholder="Method (e.g. Card, Bank)" value={methodMap[invoice.id] || ''} onChange={e => setMethodMap(m => ({ ...m, [invoice.id]: e.target.value }))} className="border rounded px-2 py-1 w-32" />
                <input type="text" placeholder="Note (optional)" value={noteMap[invoice.id] || ''} onChange={e => setNoteMap(m => ({ ...m, [invoice.id]: e.target.value }))} className="border rounded px-2 py-1 w-48" />
                <Button type="submit" disabled={loadingMap[invoice.id] || !amountMap[invoice.id]} className="btn-meraki">{loadingMap[invoice.id] ? 'Processing...' : 'Add Payment'}</Button>
              </form>
              {/* Payment plan schedule */}
              {planMap[invoice.id] && planMap[invoice.id].length > 0 && (
                <div className="mt-4">
                  <b>Payment Plan Schedule:</b>
                  <table className="min-w-full text-xs mt-1 mb-2">
                    <thead>
                      <tr><th>Due Date</th><th>Amount</th><th>Status</th>{isAdmin && <th>Edit</th>}</tr>
                    </thead>
                    <tbody>
                      {planMap[invoice.id].map((plan: any) => (
                        <tr key={plan.id}>
                          <td>{plan.dueDate ? new Date(plan.dueDate).toLocaleDateString() : ''}</td>
                          <td>${(plan.amount / 100).toFixed(2)}</td>
                          <td className={plan.status === 'overdue' ? 'text-red-600' : plan.status === 'paid' ? 'text-green-600' : ''}>{plan.status}</td>
                          {isAdmin && <td><Button size="xs" onClick={() => { setEditPlanId(plan.id); setEditPlanDue(plan.dueDate ? plan.dueDate.slice(0,10) : ''); setEditPlanAmount(plan.amount); setEditPlanStatus(plan.status); }}>Edit</Button></td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {isAdmin && <Button size="xs" className="mt-2" onClick={() => setShowAddPlanMap(m => ({ ...m, [invoice.id]: !m[invoice.id] }))}>{showAddPlanMap[invoice.id] ? 'Cancel' : 'Add Installment'}</Button>}
              {isAdmin && showAddPlanMap[invoice.id] && (
                <form onSubmit={e => handleAddPlan(e, invoice.id)} className="flex gap-2 mt-2 items-center">
                  <input type="date" value={newPlanDueMap[invoice.id] || ''} onChange={e => setNewPlanDueMap(m => ({ ...m, [invoice.id]: e.target.value }))} required className="border rounded px-2 py-1" />
                  <input type="number" placeholder="Amount (cents)" value={newPlanAmountMap[invoice.id] || ''} onChange={e => setNewPlanAmountMap(m => ({ ...m, [invoice.id]: e.target.value }))} required className="border rounded px-2 py-1 w-32" />
                  <Button size="xs" type="submit">Add</Button>
                </form>
              )}
              {isAdmin && editPlanId && (
                <form onSubmit={handleEditPlan} className="flex gap-2 mt-2 items-center bg-orange-100 p-2 rounded">
                  <input type="date" value={editPlanDue} onChange={e => setEditPlanDue(e.target.value)} required className="border rounded px-2 py-1" />
                  <input type="number" placeholder="Amount (cents)" value={editPlanAmount} onChange={e => setEditPlanAmount(e.target.value)} required className="border rounded px-2 py-1 w-32" />
                  <select value={editPlanStatus} onChange={e => setEditPlanStatus(e.target.value)} className="border rounded px-2 py-1">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <Button size="xs" type="submit">Save</Button>
                  <Button size="xs" type="button" onClick={() => setEditPlanId(null)}>Cancel</Button>
                </form>
              )}
              {planMsg && <div className="text-green-600 text-xs mt-1">{planMsg}</div>}
              {/* Notification/status for fully paid invoice */}
              {outstanding <= 0 && <div className="text-green-700 font-semibold mt-2">Invoice fully paid!</div>}
              {/* Notification/status for overdue installment */}
              {planMap[invoice.id] && planMap[invoice.id].some((p: any) => p.status === 'overdue') && <div className="text-red-600 font-semibold mt-2">One or more installments are overdue!</div>}
            </div>
          );
        })
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
                <td className="px-2 py-1">
                  {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : ''}
                </td>
                <td className="px-2 py-1">${(invoice.total / 100).toFixed(2)}</td>
                <td className="px-2 py-1">
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(invoice.id)}>
                    Download PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
