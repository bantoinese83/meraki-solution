'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { useState } from 'react';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Info, AlertCircle, Upload } from 'lucide-react';
import Link from 'next/link';

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
      body: JSON.stringify(form),
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
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-end items-center mb-6">
        <Link href="/dashboard/expenses/receipt-ocr" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 text-orange-600 bg-white hover:bg-orange-50 shadow-sm transition-all text-sm font-semibold">
          <Upload className="w-4 h-4" /> Upload Receipt (OCR)
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold mb-8">
        <AuroraText>Expenses</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Track and Manage Your Expenses</div>
          <div className="text-gray-700">
            Add, categorize, and review all your business expenses in one place. Keeping your expenses up to date helps with budgeting, tax preparation, and financial analysis. Use the form below to add new expenses or update existing ones.
          </div>
        </div>
      </div>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="btn-meraki" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Expense'}
          </Button>
          {showForm && (
            <form className="space-y-2 mt-4 bg-orange-50 rounded-xl p-4 shadow-md" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                className="border rounded px-2 py-1 w-64"
              />
              <input
                type="number"
                placeholder="Amount (cents)"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
                className="border rounded px-2 py-1 w-32"
              />
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="border rounded px-2 py-1 w-24"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <Button type="submit" disabled={loading} className="btn-meraki">
                {loading ? 'Saving...' : 'Save'}
              </Button>
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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-orange-400 mb-2" />
                        <div className="text-lg font-semibold text-gray-700 mb-1">No expenses found</div>
                        <div className="text-sm text-gray-500 max-w-xs">
                          Start tracking your business expenses to get better insights into your spending. Add your first expense above!
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense: Expense) => (
                    <tr key={expense.id}>
                      <td>{expense.description}</td>
                      <td>${(expense.amount / 100).toFixed(2)}</td>
                      <td>{expense.currency}</td>
                      <td>{expense.date ? new Date(expense.date).toLocaleDateString() : ''}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="btn-meraki"
                          onClick={() => handleDelete(expense.id)}
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
        Need help with expenses or want to automate tracking?{' '}
        <a href="mailto:support@meraki.com" className="text-orange-500 hover:underline">Contact Support</a>
      </div>
    </main>
  );
}
