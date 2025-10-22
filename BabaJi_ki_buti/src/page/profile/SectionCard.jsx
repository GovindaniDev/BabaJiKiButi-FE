// ------------------------------
// File: src/components/account/SectionCard.jsx
// ------------------------------
import React from "react";


export default function SectionCard({ title, icon: Icon, children, action }) {
return (
<section className="rounded-2xl border border-gray-200/60 bg-white p-5 md:p-6 shadow-sm">
<div className="flex items-center justify-between mb-4">
<h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold">
{Icon ? <Icon className="h-5 w-5" /> : null} {title}
</h2>
{action}
</div>
{children}
</section>
);
}