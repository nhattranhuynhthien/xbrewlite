'use client';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-4 animate-pulse">
      <div className="w-24 h-24 bg-slate-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
