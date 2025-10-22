import React from "react";


export default function StatTile({ icon: Icon, label, value, sub, accent = "" }) {
return (
<div className="rounded-2xl border border-gray-200/60 bg-white p-4 md:p-5 shadow-sm">
<div className="flex items-center gap-3">
<div className={`h-10 w-10 rounded-xl bg-gray-900/5 flex items-center justify-center ${accent}`}>
{Icon ? <Icon className="h-5 w-5" /> : null}
</div>
<div>
<div className="text-xs text-gray-500">{label}</div>
<div className="text-lg font-semibold">{value}</div>
{sub && <div className="text-[11px] text-gray-500">{sub}</div>}
</div>
</div>
</div>
);
}