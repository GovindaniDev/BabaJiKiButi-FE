// src/components/Loading.jsx
import React from "react";

export default function Loading({ label = "Loading..." }) {
  return (
    <div style={backdrop}>
      <div style={box}>
        <div style={spinner}></div>
        <span>{label}</span>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000
};

const box = {
  background: "#fff",
  padding: "20px 28px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  fontFamily: "system-ui, sans-serif",
  fontWeight: "600",
  fontSize: "18px"
};

// 🔥 Larger spinner
const spinner = {
  width: "36px",
  height: "36px",
  border: "4px solid #ddd",
  borderTopColor: "#333",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};

// inject keyframes
if (typeof document !== "undefined" && !document.getElementById("spin-style")) {
  const style = document.createElement("style");
  style.id = "spin-style";
  style.innerHTML = `@keyframes spin {to { transform: rotate(360deg); }}`;
  document.head.appendChild(style);
}
