import React from "react";
import SectionCard from "./SectionCard";
import { BarChart3 } from "lucide-react";


export default function Insights({ wallet, loyalty, refStats }) {
return (
<SectionCard title="Insights" icon={BarChart3}>
<div className="grid md:grid-cols-3 gap-4 text-sm">
<div className="rounded-xl border p-4">
<div className="text-gray-600">Best cashback tier reached</div>
<div className="font-semibold mt-1">{(wallet?.tiers||[])[2]?.name || "Platinum"}</div>
</div>
<div className="rounded-xl border p-4">
<div className="text-gray-600">Most points in a month</div>
<div className="font-semibold mt-1">{Math.max(300, (loyalty?.lifetimeEarned||0)/6|0)} pts</div>
</div>
<div className="rounded-xl border p-4">
<div className="text-gray-600">Referrals this quarter</div>
<div className="font-semibold mt-1">{refStats?.referredCount ?? 0}</div>
</div>
</div>
</SectionCard>
);
}