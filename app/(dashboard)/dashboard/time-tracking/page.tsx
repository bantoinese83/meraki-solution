'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define a TimeEntry type
type TimeEntry = { id: number; description: string; hours: number; date?: string };

export default function TimeTrackingPage() {
  const { data: entries = [], mutate } = useSWR<TimeEntry[]>('/api/time-entries', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', hours: '', date: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setLoading(false);
    setShowForm(false);
    setForm({ description: '', hours: '', date: '' });
    mutate();
  }

  async function handleDelete(id: number) {
    await fetch('/api/time-entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    mutate();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Time Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Time Entry'}</Button>
          {showForm && (
            <form className="space-y-2 mt-4" onSubmit={handleSubmit}>
              <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="border rounded px-2 py-1 w-64" />
              <input type="number" placeholder="Hours" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} required className="border rounded px-2 py-1 w-24" />
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="border rounded px-2 py-1 w-40" />
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </form>
          )}
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Hours</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: TimeEntry) => (
                  <tr key={entry.id}>
                    <td>{entry.description}</td>
                    <td>{entry.hours}</td>
                    <td>{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</td>
                    <td><Button size="sm" variant="destructive" onClick={() => handleDelete(entry.id)}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 