import React, { useEffect, useRef, useState } from "react";

// ---- your categories (can also be passed as a prop) ----
const CATEGORIES = [
  { name: "Energy " },
  { name: "Pain Relief"},
  { name: "Hair Care" },
  { name: "Skin Care" },
  { name: "Men's Health"},
  { name: "Immunity" },
];

export default function SearchBar() {
  // ---- Tuning ----
  const TYPE_MS = 90;
  const ERASE_MS = 45;
  const HOLD_END_MS = 1200;
  const HOLD_NEXT_MS = 400;

  // ---- State/Refs ----
  const [value, setValue] = useState("");
  const namesRef = useRef([]);
  const iRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const pausedRef = useRef(false);
  const tRef = useRef(null);

  useEffect(() => {
    // build a clean, unique list of category names
    namesRef.current = Array.from(
      new Set(CATEGORIES.map(c => (("Search For "+c?.name) ?? "").toString().trim()).filter(Boolean))
    );
    if (namesRef.current.length) tick();

    return () => clearTimeout(tRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function schedule(fn, ms) {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(fn, ms);
  }

  function tick() {
    if (pausedRef.current) return;
    const list = namesRef.current;
    if (!list.length) return;

    const full = list[iRef.current];

    if (!deletingRef.current && charRef.current < full.length) {
      setValue(full.slice(0, charRef.current + 1));
      charRef.current++;
      schedule(tick, TYPE_MS);
    } else if (!deletingRef.current && charRef.current === full.length) {
      schedule(() => {
        deletingRef.current = true;
        tick();
      }, HOLD_END_MS);
    } else if (deletingRef.current && charRef.current > 0) {
      setValue(full.slice(0, charRef.current - 1));
      charRef.current--;
      schedule(tick, ERASE_MS);
    } else {
      deletingRef.current = false;
      iRef.current = (iRef.current + 1) % list.length;
      schedule(tick, HOLD_NEXT_MS);
    }
  }

  function onFocus() {
    pausedRef.current = true;
    if (tRef.current) clearTimeout(tRef.current);
  }
  function onBlur() {
    pausedRef.current = false;
    if (!value) tick();
  }

 return (
  <div className="relative">
    <div className="relative w-full max-w-[22rem]">
      <svg
        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  </div>
);
}
