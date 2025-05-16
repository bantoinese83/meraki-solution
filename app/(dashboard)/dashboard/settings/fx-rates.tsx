import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function FXRatesPage() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  async function fetchRates() {
    setLoading(true);
    const res = await fetch('/api/fx-rates');
    const data = await res.json();
    setRates(data.rates || {});
    setLoading(false);
  }

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <main className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">FX Rates (Live)</h1>
      <Button onClick={fetchRates} disabled={loading} className="btn-meraki mb-4">{loading ? 'Updating...' : 'Refresh Rates'}</Button>
      <div className="bg-orange-50 rounded shadow p-4">
        {Object.keys(rates).length === 0 ? (
          <div>No rates available.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr><th>Currency</th><th>Rate (vs USD)</th></tr>
            </thead>
            <tbody>
              {Object.entries(rates).map(([cur, rate]) => (
                <tr key={cur}><td>{cur}</td><td>{rate}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
} 