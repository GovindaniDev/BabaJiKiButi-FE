// src/auth/cart/useCart.js
import { useCallback, useEffect, useRef, useState } from "react";
import { guestCart } from "./guestCart";
import { cartApi } from "./cartApi";
import { onCartChanged } from "./cartBus";

const DBG_CART = true;
const dlog = (...a) => DBG_CART && console.log("[useCart]", ...a);

const mergedKey = (userId) => `__guest_merged_for_user_${userId}`;

/**
 * useCart(userId)
 * userId states:
 *   - undefined => auth not resolved yet (show guest cart but don't merge)
 *   - null      => guest session
 *   - number    => logged in
 */
export function useCart(userId) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const latestUserId = useRef(userId);

  const refresh = useCallback(async () => {
    dlog("refresh start", { userId: latestUserId.current });

    try {
      // Auth not resolved yet: show guest cart so UI isn't empty
      if (typeof latestUserId.current === "undefined") {
        const g = guestCart.get();
        dlog("refresh auth:undefined -> show guest", g);
        setCart(g);
        return;
      }

      // Explicit guest (null)
      if (latestUserId.current === null) {
        const g = guestCart.get();
        dlog("refresh guest ->", g);
        setCart(g);
        return;
      }

      // Logged-in path (number)
      let server = await cartApi.getCart(latestUserId.current);
      dlog("refresh server initial ->", server);

      // One-time merge of guest -> server (if server empty and guest has items)
      const guest = guestCart.get();
      const mergeKey = mergedKey(latestUserId.current);
      const shouldMerge = !localStorage.getItem(mergeKey);
      dlog("merge check", {
        shouldMerge,
        guestItems: guest?.items?.length,
        serverItems: server?.items?.length,
      });

      if (shouldMerge && (!server?.items?.length) && guest?.items?.length) {
        try {
          dlog("merge start");
          await guestCart.mergeIntoServer(latestUserId.current, cartApi);
          localStorage.setItem(mergeKey, "1");
          server = await cartApi.getCart(latestUserId.current);
          dlog("merge done -> server reloaded", server);
        } catch (e) {
          dlog("merge ERROR, fallback to guest", e);
          setCart(guest);
          return;
        }
      }

      setCart(server);
      dlog("refresh setCart(server)");
    } catch (e) {
      dlog("refresh ERROR", e);
      // Keep last good cart instead of instantly flipping to empty
      setCart((prev) => {
        const fallback =
          typeof latestUserId.current === "undefined" || latestUserId.current === null
            ? guestCart.get()
            : null;
        dlog("refresh ERROR setCart(prev||fallback)", { prev, fallback });
        return prev ?? fallback;
      });
    }
  }, []);

  useEffect(() => {
    latestUserId.current = userId;
    (async () => {
      setLoading(true);
      dlog("effect init -> setLoading(true)");
      try {
        await refresh();
      } finally {
        setLoading(false);
        dlog("effect init -> setLoading(false)");
      }
    })();
  }, [userId, refresh]);

  // Stay in sync with all mutations, focus changes, tab changes
  useEffect(() => {
    const off = onCartChanged(refresh);
    const refetch = () => {
      dlog("window focus -> refetch");
      refresh();
    };
    const vis = () => {
      if (document.visibilityState === "visible") {
        dlog("visibility visible -> refetch");
        refresh();
      }
    };
    window.addEventListener("focus", refetch);
    document.addEventListener("visibilitychange", vis);
    return () => {
      off();
      window.removeEventListener("focus", refetch);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [refresh]);

  // Convenience mutators that also re-sync both stores
  const actions = {
    async add(productOrId, qty = 1) {
      const uid = latestUserId.current;
      dlog("actions.add start", { userId: uid, productOrId, qty });
      if (uid) {
        const id =
          typeof productOrId === "object"
            ? productOrId.id ?? productOrId.productId
            : productOrId;
        if (id != null) {
          await cartApi.addItem(uid, id, qty);
        } else {
          dlog("actions.add fallback to guest (no id/sku)");
          guestCart.addItem(productOrId, qty);
        }
      } else {
        guestCart.addItem(productOrId, qty);
      }
      await refresh();
      dlog("actions.add done");
    },

    async update(item, qty) {
      const uid = latestUserId.current;
      const id = item?.cartItemId ?? item?.id ?? item?.itemId ?? item?.key;
      dlog("actions.update", { userId: uid, id, qty, item });
      if (uid) await cartApi.updateQty(uid, id, qty);
      else guestCart.updateQty(item.cartItemId, qty);
      await refresh();
    },

    async remove(item) {
      const uid = latestUserId.current;
      const id = item?.cartItemId ?? item?.id ?? item?.itemId ?? item?.key;
      dlog("actions.remove", { userId: uid, id, item });
      if (uid) await cartApi.removeItem(uid, id);
      else guestCart.removeItem(item.cartItemId);
      await refresh();
    },

    async clear() {
      const uid = latestUserId.current;
      dlog("actions.clear start", { userId: uid });
      if (uid) {
        await cartApi.clear(uid);
        // mirror clear in guest so a later guest session doesn't revive old items
        guestCart.clear();
      } else {
        guestCart.clear();
      }
      await refresh();
      dlog("actions.clear done");
    },
  };

  // Expose resolved userId (never undefined) for consumers that need it
  const resolvedUserId = (typeof latestUserId.current === "undefined") ? null : latestUserId.current;

  return { cart, loading, refresh, userId: resolvedUserId, ...actions };
}
