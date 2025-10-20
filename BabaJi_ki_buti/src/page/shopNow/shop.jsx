// src/pages/Product.jsx
import React from "react";
import ShopNow from "../../components/shop/product"; // or your actual path
import { useMe } from "../../auth/user/useMe"; // ✅ import the hook

export default function Product() {
  const { me, loading } = useMe();
  const userId = me?.id ?? null;

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading products...</div>;
  }

  return (
    <div>
      <ShopNow userId={userId} /> {/* ✅ pass userId prop */}
    </div>
  );
}
