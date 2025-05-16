'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Info } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define a Client type for better type safety
// TODO: Replace with actual type from your schema if available

type Client = { id: number; name: string };
type InvoiceItem = { description: string; quantity: number; unitPrice: number };
type Invoice = {
  id: number;
  clientId: number;
  issueDate?: string;
  dueDate?: string;
  status: string;
  total: number;
  paidAt?: string;
  stripePaymentLink?: string;
  items?: InvoiceItem[];
  template?: string;
};

export default function InvoicesPage() {
  const { data: invoices = [], mutate } = useSWR('/api/invoices', fetcher);
  const { data: clients = [] } = useSWR('/api/clients', fetcher);
  const { data: templatesRaw = [] } = useSWR('/api/invoice-templates', fetcher);
  const templates = Array.isArray(templatesRaw) ? templatesRaw : [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: undefined,
    clientId: '',
    dueDate: '',
    total: '',
    status: 'draft',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    currency: 'USD',
    tax: '',
    recurring: 0,
    recurringInterval: 'monthly',
    template: '',
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const selectedTemplateObj = templates.find((t: any) => String(t.id) === String(form.template));

  useEffect(() => {
    if (!showForm) {
      setForm({
        id: undefined,
        clientId: '',
        dueDate: '',
        total: '',
        status: 'draft',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        currency: 'USD',
        tax: '',
        recurring: 0,
        recurringInterval: 'monthly',
        template: '',
      });
      setEditId(undefined);
    }
  }, [showForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: unknown) => {
    const items = [...form.items];
    if (field === 'quantity' || field === 'unitPrice') {
      items[idx][field] = Number(value) as InvoiceItem[typeof field];
    } else if (field === 'description') {
      items[idx][field] = value as string;
    }
    setForm({ ...form, items });
    // Update total
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setForm((f) => ({ ...f, total: total.toString() }));
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (idx: number) => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm({ ...form, items });
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    setForm((f) => ({ ...f, total: total.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, total: Number(form.total), items: form.items };
    if (editId) {
      await fetch('/api/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: editId }),
      });
    } else {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setLoading(false);
    setShowForm(false);
    setEditId(undefined);
    mutate();
  };

  const handleEdit = (invoice: unknown) => {
    const inv = invoice as Invoice;
    setForm({
      ...inv,
      clientId: inv.clientId.toString(),
      items: inv.items || [{ description: '', quantity: 1, unitPrice: 0 }],
      currency: 'USD',
      tax: '',
      recurring: 0,
      recurringInterval: 'monthly',
      template: inv.template || '',
      id: undefined,
      dueDate: inv.dueDate || '',
      total: inv.total ? inv.total.toString() : '',
      status: inv.status || 'draft',
    });
    setEditId(inv.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this invoice?')) {
      return;
    }
    await fetch('/api/invoices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  async function handlePayNow(invoiceId: number) {
    const res = await fetch('/api/invoices/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  // Add handler for sending invoice by email
  async function handleSendByEmail(invoiceId: number) {
    try {
      const res = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (res.ok) {
        window.alert('Invoice sent by email!');
      } else {
        const data = await res.json();
        window.alert(data.error || 'Failed to send invoice by email');
      }
    } catch (err) {
      window.alert('Failed to send invoice by email');
    }
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-4xl font-extrabold mb-8">
        <AuroraText>Invoices</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Create, Send, and Track Invoices</div>
          <div className="text-gray-700">
            Manage all your business invoices in one place. Add new invoices, track payment status, and send reminders. Export invoices for accounting, tax, or analytics. Use the form below to create or edit invoices for your clients.
          </div>
        </div>
      </div>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice List</CardTitle>
          <Button
            className="btn-meraki"
            style={{ minWidth: 180 }}
            aria-label="Download all invoices as PDF"
            onClick={() => window.open('/api/invoices/pdf/all', '_blank')}
          >
            Download All Invoices (PDF)
          </Button>
          <Button
            className="btn-meraki"
            onClick={() => {
              setShowForm((v) => !v);
              setEditId(undefined);
            }}
          >
            {showForm ? 'Cancel' : 'Add Invoice'}
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form className="mb-6 space-y-2 bg-orange-50 rounded-xl p-4 shadow-md" onSubmit={handleSubmit}>
              <div className="text-xs text-gray-500 mb-2">Fill out the invoice details, add line items, and select a client. You can also set recurring options and choose a template.</div>
              <div className="flex gap-2">
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">Select Client</option>
                  {clients.map((c: unknown) => {
                    const client = c as Client;
                    return (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    );
                  })}
                </select>
                <input
                  name="dueDate"
                  type="date"
                  placeholder="Due Date"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="mb-2">
                <div className="font-medium mb-1">Line Items</div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-1 items-center">
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="border p-2 rounded w-1/3"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="border p-2 rounded w-16"
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="Unit Price (cents)"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="border p-2 rounded w-32"
                    />
                    <span>= {(item.quantity * item.unitPrice) / 100} $</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button size="sm" type="button" onClick={addItem}>
                  Add Item
                </Button>
              </div>
              <div className="flex gap-2">
                <select
                  name="currency"
                  value={form.currency || 'USD'}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  {/* Add more currencies as needed */}
                </select>
                <input
                  type="number"
                  name="tax"
                  placeholder="Tax (%)"
                  value={form.tax || ''}
                  onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>
              <div className="flex gap-2 items-center mt-2">
                <label>
                  <input
                    type="checkbox"
                    checked={!!form.recurring}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, recurring: e.target.checked ? 1 : 0 }))
                    }
                  />{' '}
                  Recurring
                </label>
                {form.recurring ? (
                  <select
                    name="recurringInterval"
                    value={form.recurringInterval || 'monthly'}
                    onChange={(e) => setForm((f) => ({ ...f, recurringInterval: e.target.value }))}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                ) : null}
              </div>
              <div className="flex gap-2 items-center mt-2">
                <div className="relative">
                  <select
                    name="template"
                    value={form.template || ''}
                    onChange={(e) => setForm((f) => ({ ...f, template: e.target.value }))}
                    onFocus={() => setShowTemplatePreview(true)}
                    onBlur={() => setTimeout(() => setShowTemplatePreview(false), 200)}
                  >
                    <option value="">Default Template</option>
                    {templates.length === 0 && (
                      <div className="text-red-500 text-xs mb-2">No templates found or failed to load templates.</div>
                    )}
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {showTemplatePreview && selectedTemplateObj && (
                    <div className="absolute left-0 mt-2 z-20 w-64">
                      <Card className="p-3 border shadow-lg">
                        <div className="font-semibold mb-1">Preview: {selectedTemplateObj.name}</div>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {JSON.parse(selectedTemplateObj.templateJson).map((item: any, idx: number) => (
                            <span key={item.id || idx} className="px-2 py-1 bg-gray-100 rounded border mr-1 mb-1">
                              {item.type}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-2">
                Total: <b>${(Number(form.total) / 100).toFixed(2)}</b>
              </div>
              <Button type="submit" disabled={loading}>
                {loading
                  ? editId
                    ? 'Saving...'
                    : 'Saving...'
                  : editId
                    ? 'Save Changes'
                    : 'Save Invoice'}
              </Button>
            </form>
          )}
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: unknown) => {
                  const invoice = inv as Invoice;
                  const client = clients.find(
                    (c: unknown) => (c as Client).id === invoice.clientId,
                  ) as Client | undefined;
                  return (
                    <tr key={invoice.id}>
                      <td>{client ? client.name : invoice.clientId}</td>
                      <td>
                        {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ''}
                      </td>
                      <td>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}
                      </td>
                      <td>{invoice.status}</td>
                      <td>${(invoice.total / 100).toFixed(2)}</td>
                      <td>
                        {invoice.paidAt ? (
                          <span className="text-green-600 font-semibold">Paid</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(invoice.id)}
                            disabled={!!invoice.paidAt || loading}
                          >
                            Pay Now
                          </Button>
                        )}
                        {invoice.stripePaymentLink && !invoice.paidAt && (
                          <a
                            href={invoice.stripePaymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 underline"
                          >
                            Payment Link
                          </a>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(invoice)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendByEmail(invoice.id)}
                            className="ml-2"
                          >
                            Send by Email
                          </Button>
                          <a
                            href={`/api/invoices/pdf/${invoice.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download invoice #${invoice.id} as PDF`}
                          >
                            <Button size="sm" className="btn-meraki" type="button">
                              Download PDF
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
