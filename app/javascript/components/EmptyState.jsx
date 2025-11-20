import React from "react";
const EmptyState = () => (
  <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
    <p className="text-sm font-medium text-slate-800">
      No preview selected yet
    </p>
    <p className="mt-1 max-w-xs text-xs text-slate-500">
      Submit a URL to see its Open Graph preview here. As processing completes,
      this card will update automatically.
    </p>
  </div>
);

export default EmptyState;
