import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold">Settings</h1>
        <Link href="/dashboard/settings/fx-rates" className="btn-meraki">FX Rates</Link>
      </div>
      {/* ... existing settings UI ... */}
    </main>
  );
} 