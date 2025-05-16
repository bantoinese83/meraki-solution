'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Info } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define a Client type
type Client = {
  id: number | undefined;
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
};

export default function ClientsPage() {
  const { data: clients = [], mutate } = useSWR<Client[]>('/api/clients', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Client>({
    id: undefined,
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editId }),
      });
    } else {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setLoading(false);
    setShowForm(false);
    setEditId(undefined);
    setForm({ id: undefined, name: '', email: '', company: '', phone: '', address: '' });
    mutate();
  };

  const handleEdit = (client: Client) => {
    setForm(client);
    setEditId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this client?')) return;
    await fetch('/api/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold mb-8">
        <AuroraText>Clients</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Manage Your Clients</div>
          <div className="text-gray-700">
            Add, edit, and organize all your clients in one place. Keep contact info, company details, and notes up to date. Use the form below to add new clients or update existing ones. Open the client portal for a client to view their activity and invoices.
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client List</CardTitle>
            <Button
              onClick={() => {
                setShowForm((v) => !v);
                setEditId(undefined);
                setForm({ id: undefined, name: '', email: '', company: '', phone: '', address: '' });
              }}
            >
              {showForm ? 'Cancel' : 'Add Client'}
            </Button>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form className="mb-6 space-y-2 bg-orange-50 rounded-xl p-4 shadow-md" onSubmit={handleSubmit}>
                <div className="text-xs text-gray-500 mb-2">Fill out the client details below. Accurate client info helps with invoicing, communication, and reporting.</div>
                <div className="flex gap-2">
                  <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                  />
                  <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                  />
                  <input
                    name="company"
                    placeholder="Company"
                    value={form.company}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? editId
                      ? 'Saving...'
                      : 'Saving...'
                    : editId
                      ? 'Save Changes'
                      : 'Save Client'}
                </Button>
              </form>
            )}
            <ul className="divide-y">
              {clients.length === 0 && <li className="py-4 text-gray-500">No clients found.</li>}
              {clients.map((client: Client) => (
                <li key={client.id} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">
                      {client.email} {client.company && <>· {client.company}</>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id!)}>
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/client-portal/${client.id}`)}
                    >
                      Open Portal
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
