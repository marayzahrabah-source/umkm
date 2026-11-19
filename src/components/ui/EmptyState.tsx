import React from "react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-cocoa-300/60 bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-cocoa-700">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h3 className="font-display text-lg font-semibold text-cocoa-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-cocoa-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
