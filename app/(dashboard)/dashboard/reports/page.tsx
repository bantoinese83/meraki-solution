'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function downloadCSV(type: string) {
  window.open(`/api/reports?type=${type}`, '_blank');
}

export default function ReportsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={() => downloadCSV('invoices')}>Download Invoices CSV</Button>
            <Button onClick={() => downloadCSV('payments')}>Download Payments CSV</Button>
            <Button onClick={() => downloadCSV('clients')}>Download Clients CSV</Button>
            <Button onClick={() => downloadCSV('expenses')}>Download Expenses CSV</Button>
            <Button onClick={() => downloadCSV('time-entries')}>Download Time Entries CSV</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 