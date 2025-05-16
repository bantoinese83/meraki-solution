import React from 'react';
import { Loader2 } from 'lucide-react';

export function MerakiSpinner({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-label="Loading">
      <Loader2 className="meraki-spinner" style={{ width: size, height: size }} />
    </div>
  );
}
