// src/auth/cart/useCart.js
import { useCallback, useEffect, useRef, useState } from "react";
import { guestCart } from "./guestCart";
import { cartApiV2 as cartApi } from "./cartApiV2";
import { onCartChanged } from "./cartBus";

const mergedKey = (userId) => `__guest_merged_for_user_${userId}`;

export function useCart(userId) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const latestUserId = useRef(userId);

  const refresh = useCallback(async () => {
    try {
      if (typeof latestUserId.current === "undefined") {
        setCart(guestCart.get());
        return;
      }
      if (latestUserId.current === null) {
        setCart(guestCart.get());
        return;
      }
      let server = await cartApi.getCart(latestUserId.current);

      const guest = guestCart.get();
      const key = mergedKey(latestUserId.current);
      const shouldMerge = !localStorage.getItem(key);
      if (shouldMerge && (!server?.items?.length) && guest?.items?.length) {
        for (const it of guest.items) {
          if (it.productId != null) {
            await cartApi.addItem(latestUserId.current, it.productId, it.qty || 1);
          }
        }
        localStorage.setItem(key, "1");
        localStorage.removeItem("guest_cart_v1");
        server = await cartApi.getCart(latestUserId.current);
      }
      setCart(server);
    } catch (e) {
      setCart((prev) => prev ?? null);
    }
  }, []);

  useEffect(() => {
    latestUserId.current = userId;
    (async () => {
      setLoading(true);
      try { await refresh(); } finally { setLoading(false); }
    })();
  }, [userId, refresh]);

  useEffect(() => {
    const off = onCartChanged(refresh);
    return () => off();
  }, [refresh]);

  const actions = {
    async add(productOrId, qty = 1) {
      const uid = latestUserId.current;
      if (uid) {
        const id = typeof productOrId === "object" ? (productOrId.id ?? productOrId.productId) : productOrId;
        if (id != null) await cartApi.addItem(uid, id, qty);
        else guestCart.addItem(productOrId, qty);
      } else {
        guestCart.addItem(productOrId, qty);
      }
      await refresh();
    },
    async update(item, qty) {
      const uid = latestUserId.current;
      const id = item?.cartItemId ?? item?.id ?? item?.itemId ?? item?.key;
      if (uid) await cartApi.updateQty(uid, id, qty);
      else guestCart.updateQty(item.cartItemId, qty);
      await refresh();
    },
    async remove(item) {
      const uid = latestUserId.current;
      const id = item?.cartItemId ?? item?.id ?? item?.itemId ?? item?.key;
      if (uid) await cartApi.removeItem(uid, id);
      else guestCart.removeItem(item.cartItemId);
      await refresh();
    },
    async clear() {
      const uid = latestUserId.current;
      if (uid) { await cartApi.clear(uid); guestCart.clear(); }
      else guestCart.clear();
      await refresh();
    },
  };

  const resolvedUserId = (typeof latestUserId.current === "undefined") ? null : latestUserId.current;
  return { cart, loading, refresh, userId: resolvedUserId, ...actions };
}


