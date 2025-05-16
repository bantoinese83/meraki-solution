'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { MerakiSpinner } from '@/components/ui/meraki-spinner';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="btn-meraki w-full">
      {pending ? (
        <>
          <MerakiSpinner size={20} className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
