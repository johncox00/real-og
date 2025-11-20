
import React from "react";

function safeDomain(url) {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return "Unknown";
  }
}

function formatDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PreviewCard = ({ request }) => {
  const domain = safeDomain(request.url);

  return (
    <div className="space-y-3">
      {/* OG-like card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {request.result && request.status === "success" ? (
          <div className="h-40 w-full bg-slate-100">
            <img
              src={request.result}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
            {request.status === "error"
              ? request.result
              : "Awaiting og:image..."}
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {domain}
          </p>
          <p className="line-clamp-2 text-sm font-medium text-slate-900">
            {request.ogTitle || "Open Graph preview"}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {request.url}
          </p>
        </div>
      </div>

      {/* Raw metadata */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        <div className="flex justify-between gap-3">
          <span className="font-medium text-slate-700">URL</span>
          <span className="truncate max-w-[70%] text-right">{request.url}</span>
        </div>
        <div className="mt-1 flex justify-between gap-3">
          <span className="font-medium text-slate-700">Created</span>
          <span className="text-right">{formatDate(request.createdAt)}</span>
        </div>
        {request.error && (
          <p className="mt-2 rounded-lg bg-rose-100 px-2 py-1 text-[11px] text-rose-700">
            {request.error}
          </p>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
