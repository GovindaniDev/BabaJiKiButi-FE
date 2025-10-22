import React from "react";


export default function TabNav({ tabs, active, onChange }) {
return (
<div className="mb-6 flex flex-wrap gap-2">
{tabs.map((t) => (
<button
key={t.key}
onClick={() => onChange(t.key)}
className={`px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 ${
active === t.key ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"
}`}
>
{t.icon ? <t.icon className="h-4 w-4" /> : null}
{t.label}
</button>
))}
</div>
);
}