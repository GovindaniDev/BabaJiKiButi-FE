import React, { useMemo } from "react";

export default function SlidingStrip({ items = [], speedSec = 32, className = "" }) {
  const clean = useMemo(() => items.map(s => (s || "").trim()).filter(Boolean), [items]);
  const doubled = useMemo(() => [...clean, ...clean], [clean]); // seamless loop

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <style>{`
        @keyframes marqueeX {
          0%   { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); } /* content is doubled */
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none !important; }
        }
      `}</style>

      {/* edge fades (optional) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-24 bg-gradient-to-r from-[#1E1E1F] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-24 bg-gradient-to-l from-[#1E1E1F] to-transparent" />

      {/* track: ALWAYS animates, never pauses; spans 200% width */}
      <div
        className="marquee will-change-transform whitespace-nowrap flex items-center min-w-[200%]"
        style={{ animation: `marqueeX ${speedSec}s linear infinite` }}
      >
        {doubled.map((text, i) => (
          <React.Fragment key={`${i}-${text}`}>
            <span className="mx-6 md:mx-12 text-sm md:text-base text-gray-100">{text}</span>
            {/* star after each sentence */}
            <svg
              aria-hidden="true"
              className="mx-6 md:mx-12 h-4 w-4 md:h-5 md:w-5 shrink-0"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25 1.5l3.7 13.9c.5 1.7.7 2.5 1.1 3.2.4.6.9 1.1 1.5 1.5.7.4 1.5.7 3.2 1.1L48.5 25 34.6 28.7c-1.7.5-2.5.7-3.2 1.1-.6.4-1.1.9-1.5 1.5-.4.7-.7 1.5-1.1 3.2L25 48.5l-3.7-13.9c-.5-1.7-.7-2.5-1.1-3.2-.4-.6-.9-1.1-1.5-1.5-.7-.4-1.5-.7-3.2-1.1L1.5 25l13.9-3.7c1.7-.5 2.5-.7 3.2-1.1.6-.4 1.1-.9 1.5-1.5.4-.7.7-1.5 1.1-3.2L25 1.5z"
                stroke="#BB9D7B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
