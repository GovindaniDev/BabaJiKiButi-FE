import React from "react";
import SectionCard from "./SectionCard";
import { Gift, CalendarClock } from "lucide-react";


export default function LoyaltyPoints({ loyalty, redeemPts, setRedeemPts, onRedeem }) {
return (
<SectionCard
title="Loyalty Points"
icon={Gift}
action={<div className="text-sm text-gray-600 flex items-center gap-2"><CalendarClock className="h-4 w-4"/> Expiry alerts enabled</div>}
>
<div className="grid md:grid-cols-2 gap-6">
<div>
<div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
<div className="text-sm text-amber-800">Redeem points at checkout to save more.</div>
</div>
<div className="flex items-center gap-3">
<input
type="number"
min={0}
max={loyalty?.balance || 0}
value={redeemPts}
onChange={(e) => setRedeemPts(e.target.value)}
className="w-40 border rounded-xl h-11 px-3"
placeholder="Points"
/>
<button onClick={onRedeem} className="h-11 px-4 rounded-xl bg-gray-900 text-white">Redeem</button>
<div className="text-sm text-gray-600">Max usable now: <b>{loyalty?.balance ?? 0}</b></div>
</div>
<div className="mt-3 text-xs text-gray-500">* Points convert 1:1 to rupees and auto-apply to eligible items.</div>
</div>
<div>
<div className="text-sm font-medium mb-2">Expiring soon</div>
<div className="rounded-xl border border-gray-200 overflow-hidden">
<table className="w-full text-sm">
<thead className="bg-gray-50">
<tr className="text-left">
<th className="p-3">Points</th>
<th className="p-3">Expiry</th>
</tr>
</thead>
<tbody>
{(loyalty?.expiringSoon || []).map((r, idx) => (
<tr key={idx} className="border-t">
<td className="p-3">{r.points}</td>
<td className="p-3">{new Date(r.expiresOn).toLocaleDateString()}</td>
</tr>
))}
{!loyalty?.expiringSoon?.length && (
<tr><td className="p-3 text-gray-500" colSpan={2}>Nothing expiring soon</td></tr>
)}
</tbody>
</table>
</div>
</div>
</div>
</SectionCard>
);
}