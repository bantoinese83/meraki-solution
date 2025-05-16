'use client';

import React from 'react';
import Link from 'next/link';
import { CircleIcon } from 'lucide-react';
import { LineShadowText } from '@/components/magicui/line-shadow-text';
import { AuroraText } from '@/components/magicui/aurora-text';

export default function Error({ reset }: { reset?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <h1 className="text-5xl font-extrabold mb-4">
        <LineShadowText shadowColor="#fb923c">Oops! Something went wrong</LineShadowText>
      </h1>
      <AuroraText className="text-lg mb-8">We're sorry, but an unexpected error occurred.</AuroraText>
      <div className="flex flex-col gap-2 items-center">
        {reset && (
          <button
            onClick={() => reset()}
            className="btn-meraki px-6 py-2 rounded-full text-lg font-semibold shadow-md bg-gradient-to-r from-orange-400 via-orange-500 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 transition-all"
          >
            Try Again
          </button>
        )}
        <Link
          href="/"
          className="w-full flex justify-center py-2 px-4 border border-orange-300 rounded-full shadow-lg text-base font-semibold text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-150"
        >
          Back to Meraki Home
        </Link>
      </div>
    </div>
  );
}
