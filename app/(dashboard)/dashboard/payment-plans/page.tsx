'use client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/db/schema';
import { Dialog } from '@/components/ui/dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PaymentPlansDashboard() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isAdmin = user && (user.role === 'owner' || user.role === 'admin');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [logPlanId, setLogPlanId] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/payment-plans/all').then(res => res.json()).then(setPlans);
  }, []);

  async function handleDelete(planId: number) {
    if (!isAdmin) return;
    if (!window.confirm('Delete this installment?')) return;
    setLoading(true);
    await fetch(`/api/payment-plans/${planId}`, { method: 'DELETE' });
    setPlans(plans => plans.filter(p => p.id !== planId));
    setMsg('Installment deleted!');
    setTimeout(() => setMsg(''), 2000);
    setLoading(false);
  }

  async function handleShowLog(planId: number) {
    setLogPlanId(planId);
    setShowLog(true);
    const res = await fetch(`/api/payment-plans/logs?planId=${planId}`);
    setLogs(await res.json());
  }

  // Get unique clients for filter dropdown
  const clientOptions = Array.from(new Set(plans.map(p => p.clientName))).filter(Boolean);

  // Filter and search logic
  const filteredPlans = plans.filter(plan => {
    if (clientFilter && plan.clientName !== clientFilter) return false;
    if (statusFilter && plan.status !== statusFilter) return false;
    if (dueFrom && new Date(plan.dueDate) < new Date(dueFrom)) return false;
    if (dueTo && new Date(plan.dueDate) > new Date(dueTo)) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!plan.clientName?.toLowerCase().includes(s) && !String(plan.invoiceId).includes(s)) return false;
    }
    return true;
  });

  return (
    <main className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Payment Plan Management</h1>
      {msg && <div className="text-green-600 mb-2">{msg}</div>}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Client</label>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            {clientOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Due From</label>
          <input type="date" value={dueFrom} onChange={e => setDueFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Due To</label>
          <input type="date" value={dueTo} onChange={e => setDueTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">Search</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Client or Invoice #" className="border rounded px-2 py-1 w-full" />
        </div>
      </div>
      <table className="min-w-full text-sm mb-8">
        <thead>
          <tr>
            <th>Client</th>
            <th>Invoice #</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
            {isAdmin && <th>Audit Log</th>}
          </tr>
        </thead>
        <tbody>
          {filteredPlans.map(plan => (
            <tr key={plan.id} className={plan.status === 'overdue' ? 'bg-red-50' : plan.status === 'paid' ? 'bg-green-50' : ''}>
              <td>{plan.clientName}</td>
              <td>{plan.invoiceId}</td>
              <td>{plan.dueDate ? new Date(plan.dueDate).toLocaleDateString() : ''}</td>
              <td>${(plan.amount / 100).toFixed(2)}</td>
              <td className={plan.status === 'overdue' ? 'text-red-600' : plan.status === 'paid' ? 'text-green-600' : ''}>{plan.status}</td>
              {isAdmin && <td><Button size="sm" variant="destructive" onClick={() => handleDelete(plan.id)} disabled={loading}>Delete</Button></td>}
              {isAdmin && <td><Button size="sm" onClick={() => handleShowLog(plan.id)}>View Log</Button></td>}
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={showLog} onOpenChange={setShowLog}>
        <Dialog.Content>
          <Dialog.Title>Audit Log</Dialog.Title>
          {logs.length === 0 ? (
            <div className="text-gray-500">No log entries.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                    <th>Before</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.userName || log.userEmail}</td>
                      <td>{log.action}</td>
                      <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</td>
                      <td><pre className="whitespace-pre-wrap max-w-xs overflow-x-auto">{log.before}</pre></td>
                      <td><pre className="whitespace-pre-wrap max-w-xs overflow-x-auto">{log.after}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    </main>
  );
} 