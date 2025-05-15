'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define an Expense type
type Expense = { id: number; description: string; amount: number; currency: string; date?: string };

export default function ExpensesPage() {
  const { data: expenses = [], mutate } = useSWR<Expense[]>('/api/expenses', fetcher);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', currency: 'USD' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setLoading(false);
    setShowForm(false);
    setForm({ description: '', amount: '', currency: 'USD' });
    mutate();
  }

  async function handleDelete(id: number) {
    await fetch('/api/expenses', {
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
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Expense'}</Button>
          {showForm && (
            <form className="space-y-2 mt-4" onSubmit={handleSubmit}>
              <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required className="border rounded px-2 py-1 w-64" />
              <input type="number" placeholder="Amount (cents)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required className="border rounded px-2 py-1 w-32" />
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="border rounded px-2 py-1 w-24">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </form>
          )}
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>${(expense.amount / 100).toFixed(2)}</td>
                    <td>{expense.currency}</td>
                    <td>{expense.date ? new Date(expense.date).toLocaleDateString() : ''}</td>
                    <td><Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>Delete</Button></td>
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