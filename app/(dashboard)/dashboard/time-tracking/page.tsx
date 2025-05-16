'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState } from 'react';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Info } from 'lucide-react';

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
      body: JSON.stringify(form),
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
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-8">
        <AuroraText>Time Tracking</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Log and Analyze Your Work Hours</div>
          <div className="text-gray-700">
            Track billable and non-billable hours for yourself or your team. Add time entries for projects, clients, or tasks. Use this data for payroll, invoicing, productivity analysis, or exporting to reports.
          </div>
        </div>
      </div>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button className="btn-meraki" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Time Entry'}
            </Button>
            {showForm && (
              <form className="space-y-2 mt-4 bg-orange-50 rounded-xl p-4 shadow-md" onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Description (e.g. Design work, Meeting)"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    className="border rounded px-2 py-1 w-full md:w-64"
                  />
                  <input
                    type="number"
                    placeholder="Hours"
                    value={form.hours}
                    onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                    required
                    className="border rounded px-2 py-1 w-full md:w-24"
                  />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="border rounded px-2 py-1 w-full md:w-40"
                  />
                </div>
                <Button type="submit" disabled={loading} className="btn-meraki">
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <div className="text-xs text-gray-500 mt-2">Tip: Use this form to log time for any project, client, or task. Accurate time tracking helps with billing, payroll, and productivity analysis.</div>
              </form>
            )}
          </div>
          <div className="mt-6">
            <div className="text-md font-semibold text-orange-700 mb-2">All Time Entries</div>
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
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">No time entries yet. Start tracking your work hours above!</td>
                  </tr>
                ) : (
                  entries.map((entry: TimeEntry) => (
                    <tr key={entry.id}>
                      <td>{entry.description}</td>
                      <td>{entry.hours}</td>
                      <td>{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="mt-10 text-center text-gray-500 text-sm">
        Need help with time tracking or want to automate entries? <a href="mailto:support@meraki.com" className="text-orange-500 hover:underline">Contact Support</a>
      </div>
    </main>
  );
}
