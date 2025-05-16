'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuroraText } from '@/components/magicui/aurora-text';
import { Info } from 'lucide-react';

function downloadCSV(type: string) {
  window.open(`/api/reports?type=${type}`, '_blank');
}

export default function ReportsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold mb-8">
        <AuroraText>Reports</AuroraText>
      </h1>
      <div className="mb-8 bg-orange-50 rounded-xl p-6 shadow flex items-center gap-4">
        <Info className="w-8 h-8 text-orange-400 flex-shrink-0" />
        <div>
          <div className="text-lg font-semibold text-orange-700 mb-1">Export and Analyze Your Data</div>
          <div className="text-gray-700">
            Download detailed CSV reports for invoices, payments, clients, expenses, and time entries. Use these files for accounting, tax preparation, business analysis, or importing into other tools like Excel, Google Sheets, or your favorite analytics platform.
          </div>
        </div>
      </div>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle>Download Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Button className="btn-meraki w-full" onClick={() => downloadCSV('invoices')}>
                Download Invoices CSV
              </Button>
              <div className="text-xs text-gray-500 ml-1">All invoices, including client, status, amount, and due dates.</div>
              <Button className="btn-meraki w-full" onClick={() => downloadCSV('payments')}>
                Download Payments CSV
              </Button>
              <div className="text-xs text-gray-500 ml-1">Paid invoices only, for payment reconciliation and revenue tracking.</div>
              <Button className="btn-meraki w-full" onClick={() => downloadCSV('clients')}>
                Download Clients CSV
              </Button>
              <div className="text-xs text-gray-500 ml-1">Your full client list, including contact info and company details.</div>
            </div>
            <div className="space-y-4">
              <Button className="btn-meraki w-full" onClick={() => downloadCSV('expenses')}>
                Download Expenses CSV
              </Button>
              <div className="text-xs text-gray-500 ml-1">All business expenses, with categories, dates, and amounts.</div>
              <Button className="btn-meraki w-full" onClick={() => downloadCSV('time-entries')}>
                Download Time Entries CSV
              </Button>
              <div className="text-xs text-gray-500 ml-1">All tracked hours, including project, description, and date.</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-10 text-center text-gray-500 text-sm">
        Need help with reports or want to automate exports? <a href="mailto:support@meraki.com" className="text-orange-500 hover:underline">Contact Support</a>
      </div>
    </main>
  );
}
