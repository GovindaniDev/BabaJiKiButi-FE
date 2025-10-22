// ------------------------------
// File: src/page/profile/sections/Referral.jsx
// ------------------------------
import React from "react";

import { Share2, Copy, Link as LinkIcon } from "lucide-react";
import SectionCard from "./SectionCard";


const INR2 = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));


export default function Referral({ refStats, onCopy, onShare }) {
return (
<SectionCard title="Referral Program" icon={Share2} action={<div className="text-sm text-gray-600">Earn credits when friends shop</div>}>
<div className="grid md:grid-cols-2 gap-6">
<div>
<div className="flex items-center gap-3 mb-3">
<div className="flex-1 h-11 rounded-xl border px-3 flex items-center justify-between bg-gray-50">
<span className="truncate text-sm">{refStats?.url}</span>
<button onClick={() => onCopy(refStats?.url)} className="px-3 py-1.5 rounded-lg border bg-white flex items-center gap-2 text-sm">
<Copy className="h-4 w-4"/> Copy
</button>
</div>
</div>
<div className="flex items-center gap-3">
<button onClick={onShare} className="h-11 px-4 rounded-xl border bg-white flex items-center gap-2">
<Share2 className="h-4 w-4"/> Share
</button>
<button onClick={() => onCopy(refStats?.code)} className="h-11 px-4 rounded-xl border bg-white flex items-center gap-2">
<LinkIcon className="h-4 w-4"/> Copy Code ({refStats?.code})
</button>
</div>
<div className="text-xs text-gray-500 mt-3">Your friend gets ₹100 off; you get ₹100 wallet credit on their first order. T&C apply.</div>
</div>
<div className="grid grid-cols-2 gap-3">
<div className="rounded-xl border p-4">
<div className="text-xs text-gray-500">Referred friends</div>
<div className="text-2xl font-semibold">{refStats?.referredCount ?? 0}</div>
</div>
<div className="rounded-xl border p-4">
<div className="text-xs text-gray-500">Credits earned</div>
<div className="text-2xl font-semibold">{INR2(refStats?.earnedCredits ?? 0)}</div>
</div>
</div>
</div>
</SectionCard>
);
}