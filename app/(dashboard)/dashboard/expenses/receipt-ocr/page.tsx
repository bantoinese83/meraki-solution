'use client';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

function parseFieldsFromOCR(text: string) {
  // Try to extract a JSON block from the text
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        description: parsed.merchant || '',
        amount: parsed.total || '',
        date: parsed.date || '',
        category: parsed.category || '',
        currency: parsed.currency || 'USD',
      };
    } catch (e) {
      // Fallback to regex below
    }
  }
  // Remove markdown formatting for easier parsing
  const cleanText = text.replace(/[*_`]+/g, '');
  // Try to extract total, date, merchant, category from the text
  const totalMatch = cleanText.match(/Total[:\s\$]*([\d.,]+)/i);
  const dateMatch = cleanText.match(/Date[:\s]*([\d\/-]+)/i);
  const merchantMatch = cleanText.match(/Merchant[:\s]*([A-Za-z0-9 &]+)/i);
  const categoryMatch = cleanText.match(/Category[:\s]*([A-Za-z &]+)/i);
  return {
    description: merchantMatch ? merchantMatch[1].trim() : '',
    amount: totalMatch ? totalMatch[1].replace(/,/g, '') : '',
    date: dateMatch ? dateMatch[1] : '',
    category: categoryMatch ? categoryMatch[1].trim() : '',
    currency: 'USD',
  };
}

export default function ReceiptOCRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Editable form state
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    currency: 'USD',
  });

  function handleFileChange(f: File | null) {
    setFile(f);
    setOcrResult('');
    setCategory('');
    setForm({ description: '', amount: '', date: '', category: '', currency: 'USD' });
    setSaveSuccess(false);
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setSaveSuccess(false);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/expenses/ocr', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setOcrResult(data.text || '');
    setCategory(data.category || '');
    // Try to parse fields for the form
    const parsed = parseFieldsFromOCR(data.text || '');
    setForm({
      description: parsed.description || '',
      amount: parsed.amount || '',
      date: parsed.date || '',
      category: data.category || parsed.category || '',
      currency: 'USD',
    });
    setLoading(false);
  }

  async function handleSaveExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    // Convert amount to cents if needed
    let amount = form.amount;
    if (amount && !isNaN(Number(amount))) {
      if (Number(amount) < 100) {
        // Assume dollars, convert to cents
        amount = String(Math.round(Number(amount) * 100));
      }
    }
    const payload = {
      description: form.description,
      amount,
      date: form.date,
      category: form.category,
      currency: form.currency,
    };
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaveLoading(false);
    if (res.ok) {
      setSaveSuccess(true);
      setForm({ description: '', amount: '', date: '', category: '', currency: 'USD' });
      setFile(null);
      setPreviewUrl(null);
      setOcrResult('');
      setCategory('');
    } else {
      alert('Failed to save expense.');
    }
  }

  return (
    <main className="max-w-xl mx-auto py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold mb-2">Upload Expense Receipt (OCR)</h1>
        <p className="text-gray-600 mb-2">Upload or drag-and-drop a photo or scan of your receipt. We'll extract the text and auto-categorize your expense for you.</p>
      </div>
      <form onSubmit={handleUpload} className="space-y-6">
        <div
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer ${dragActive ? 'border-orange-400 bg-orange-50' : 'border-orange-200 bg-white hover:bg-orange-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          tabIndex={0}
          aria-label="Upload receipt image"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Receipt preview" className="max-h-48 mb-3 rounded shadow" />
          ) : (
            <ImageIcon className="w-12 h-12 text-orange-300 mb-2" />
          )}
          <div className="text-orange-600 font-semibold mb-1">Drag & drop or click to select a receipt image</div>
          <div className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF. Max size: 5MB.</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
        </div>
        <Button type="submit" disabled={loading || !file} className="btn-meraki w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {loading ? 'Processing...' : 'Upload & Extract'}
        </Button>
      </form>
      {ocrResult && (
        <div className="mt-8 p-4 bg-orange-50 rounded shadow">
          <div className="font-semibold mb-2">Extracted Text:</div>
          <pre className="text-xs whitespace-pre-wrap mb-2">{ocrResult}</pre>
          <div className="mt-2">Auto-Category: <span className="font-bold">{category}</span></div>
        </div>
      )}
      {ocrResult && (
        <form className="mt-8 space-y-4 bg-white rounded-xl shadow p-6" onSubmit={handleSaveExpense}>
          <div className="font-semibold text-lg mb-2">Confirm & Save Expense</div>
          <div className="flex flex-col gap-2">
            <input
              className="border rounded px-2 py-1"
              placeholder="Description (Merchant or Note)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Amount (in dollars)"
              type="number"
              min="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Date (YYYY-MM-DD)"
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              required
            />
            <select
              className="border rounded px-2 py-1"
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <Button type="submit" className="btn-meraki w-full flex items-center justify-center gap-2" disabled={saveLoading}>
            {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} {saveLoading ? 'Saving...' : 'Save Expense'}
          </Button>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
              <CheckCircle className="w-4 h-4" /> Expense saved successfully!
            </div>
          )}
        </form>
      )}
    </main>
  );
} 