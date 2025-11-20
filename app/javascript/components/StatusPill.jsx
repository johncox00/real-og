import React from "react";

const statusStyles = {
  requested: "bg-slate-100 text-slate-700 border-slate-200",
  processing: "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-rose-50 text-rose-800 border-rose-200",
};

const statusLabels = {
  requested: "Requested",
  processing: "Processing",
  success: "Completed",
  error: "Failed",
};

const StatusPill = ({ status, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]} ${className}`}
  >
    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    {statusLabels[status]}
  </span>
);

export default StatusPill;
