import React from 'react';
import Link from 'next/link';
import { CircleIcon } from 'lucide-react';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { AuroraText } from '@/components/magicui/aurora-text';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <SparklesText className="text-6xl font-extrabold mb-4">404</SparklesText>
      <AuroraText className="text-lg mb-8">Sorry, we couldn't find that page.</AuroraText>
      <Link
        href="/"
        className="btn-meraki px-6 py-2 rounded-full text-lg font-semibold shadow-md bg-gradient-to-r from-orange-400 via-orange-500 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
