"use client";
import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

export function Dialog({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 focus:outline-none">
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

Dialog.Content = function DialogContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
};

Dialog.Title = function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mb-4">{children}</h2>;
}; 