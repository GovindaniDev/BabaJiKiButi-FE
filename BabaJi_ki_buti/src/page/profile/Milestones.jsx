// ------------------------------
// File: src/page/profile/sections/Milestones.jsx
// ------------------------------
import React from "react";
import { Trophy, ChevronRight, CheckCircle2 } from "lucide-react";
import SectionCard from "./SectionCard";


const INR3 = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));


export default function Milestones({ milestones, progressPct }) {
return (
<SectionCard title="Purchase Milestones" icon={Trophy} action={<div className="text-sm text-gray-600">Auto-applied discounts</div>}>
<div className="grid md:grid-cols-3 gap-6">
<div className="md:col-span-2">
<div className="rounded-2xl border p-5">
<div className="flex items-center justify-between mb-3">
<div className="text-sm text-gray-600">Progress to next milestone</div>
<div className="text-sm font-medium">Next at {INR3(milestones?.nextMilestone || 0)}</div>
</div>
<div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
<div className="h-full bg-gray-900" style={{ width: `${Math.min(100, Math.max(0, Math.round((progressPct || 0) * 100)))}%` }} />
</div>
<div className="mt-2 text-xs text-gray-600">You have spent {INR3(milestones?.currentSpend || 0)} this year.</div>
</div>
</div>
<div className="space-y-3">
{(milestones?.tiers || []).map((t) => (
<div key={t.threshold} className={`rounded-xl border p-4 flex items-center justify-between ${t.reached ? "bg-emerald-50 border-emerald-200" : ""}`}>
<div>
<div className="text-sm font-medium">{INR3(t.threshold)}</div>
<div className="text-xs text-gray-600">Reward: {t.rewardLabel}</div>
</div>
{t.reached ? (
<span className="inline-flex items-center gap-1 text-emerald-700 text-xs"><CheckCircle2 className="h-4 w-4"/> Reached</span>
) : (
<span className="inline-flex items-center gap-1 text-gray-600 text-xs"><ChevronRight className="h-4 w-4"/> Upcoming</span>
)}
</div>
))}
</div>
</div>
</SectionCard>
);
}