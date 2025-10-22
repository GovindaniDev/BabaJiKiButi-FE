// ------------------------------
// File: src/page/profile/sections/Wallet.jsx
// ------------------------------
import React from "react";
import { Wallet as WalletIcon, IndianRupee, CheckCircle2 } from "lucide-react";
import SectionCard from "./SectionCard";


const INR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));


export default function Wallet({ wallet, topupAmt, setTopupAmt, onTopup }) {
return (
<SectionCard
title="Wallet"
icon={WalletIcon}
action={<div className="text-sm text-gray-600 flex items-center gap-2"><IndianRupee className="h-4 w-4"/> Auto-refunds to wallet</div>}
>
<div className="grid md:grid-cols-3 gap-6">
<div className="md:col-span-2">
<div className="flex items-center gap-3 mb-4">
<input type="number" min={0} value={topupAmt} onChange={(e) => setTopupAmt(e.target.value)} className="w-40 border rounded-xl h-11 px-3" placeholder="Amount" />
<button onClick={onTopup} className="h-11 px-4 rounded-xl bg-gray-900 text-white">Top-up</button>
<div className="text-sm text-gray-600">Balance: <b>{INR(wallet?.balance ?? 0)}</b></div>
</div>
<div className="rounded-xl border border-gray-200 overflow-hidden">
<table className="w-full text-sm">
<thead className="bg-gray-50">
<tr className="text-left">
<th className="p-3">Type</th>
<th className="p-3">Amount</th>
<th className="p-3">Date</th>
</tr>
</thead>
<tbody>
{(wallet?.txns || []).map((t) => (
<tr key={t.id} className="border-t">
<td className="p-3">{t.type}</td>
<td className="p-3">{INR(t.amount)}</td>
<td className="p-3">{new Date(t.at).toLocaleDateString()}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
<div className="space-y-3">
<div className="rounded-xl border p-4">
<div className="text-sm font-medium mb-1">Cashback tiers</div>
<ul className="text-sm text-gray-700 space-y-1">
{(wallet?.tiers || []).map((t) => (
<li key={t.name} className="flex items-center gap-2">
<CheckCircle2 className="h-4 w-4 text-emerald-600"/> {t.name}: {Math.round((t.cashbackRate||0)*100)}% back
</li>
))}
</ul>
</div>
<div className="rounded-xl border p-4 bg-gray-50">
<div className="text-sm text-gray-700">Refunds from cancellations are auto-credited to your wallet instantly.</div>
</div>
</div>
</div>
</SectionCard>
);
}