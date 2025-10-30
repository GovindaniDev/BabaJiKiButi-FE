// src/pages/Wishlist.jsx
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { wishlistApi } from "../../auth/wishlist/wishlistApi";
import { useAuth } from "../../auth/AuthContext";
import { useMe } from "../../auth/user/useMe";

export default function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });
  const userId = me?.id;

  const [state, setState] = React.useState({
    loading: true,
    error: null,
    wishlist: { id: null, userId: null, items: [], total: 0 },
  });

  const load = React.useCallback(async () => {
    if (!userId) {
      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        wishlist: { id: null, userId: null, items: [], total: 0 },
      }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const wl = await wishlistApi.get(userId);
      setState({ loading: false, error: null, wishlist: wl });
    } catch (e) {
      setState({
        loading: false,
        error: e,
        wishlist: { id: null, userId, items: [], total: 0 },
      });
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChanged = (e) => {
      const wl = e?.detail?.wishlist;
      if (wl && wl.userId === userId)
        setState({ loading: false, error: null, wishlist: wl });
      else load();
    };
    window.addEventListener("wishlist:changed", onChanged);
    return () => window.removeEventListener("wishlist:changed", onChanged);
  }, [userId, load]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#fffdf9]">
        <div className="animate-pulse text-neutral-600">Checking session…</div>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fffdf9] px-4">
        <h1 className="text-xl font-semibold text-neutral-800">Please log in</h1>
        <p className="mt-1 text-neutral-600 text-sm">
          Sign in to view and manage your wishlist.
        </p>
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="mt-6 px-5 py-2.5 rounded-full bg-neutral-900 text-white"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const items = state.wishlist.items || [];

  const onRemove = async (itemId) => {
    try {
      await wishlistApi.removeItem(userId, itemId);
      load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Couldn't remove item.");
    }
  };

  const onMoveToCart = async (itemId) => {
    try {
      if (!userId) {
        alert("Please log in to move items to cart.");
        return;
      }
      await wishlistApi.moveToCart(userId, itemId, 1);
      load();
      navigate("/cart"); // optional
    } catch (e) {
      console.error(e);
      alert(e.message || "Couldn't move item to cart. Please try again.");
    }
  };

  const onClearAll = async () => {
    try {
      await wishlistApi.clear(userId);
      load();
    } catch (e) {
      console.error(e);
      alert(e.message || "Couldn't clear wishlist.");
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#fffdf9]">
        <div className="animate-pulse text-neutral-600">Loading wishlist…</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fffdf9] px-4 py-35">
        <img
          src="https://placehold.co/200x200/fff2cc/8a7a55?text=Wishlist"
          alt="Empty Wishlist"
          className="rounded-xl mb-6"
        />
        <h1 className="text-xl font-semibold text-neutral-800">Your wishlist is empty</h1>
        <p className="mt-1 text-neutral-600 text-sm">
          Save your favorite products here to shop later.
        </p>
        <Link
          to="/shop"
          className="mt-6 px-5 py-2.5 rounded-full bg-neutral-900 text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fffdf9] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-30">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Wishlist ({items.length})</h1>
          <button
            className="text-sm text-neutral-700 hover:underline"
            onClick={onClearAll}
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => {
              const productUrl = it.slug ? `/products/${it.slug}` : `/products/${it.productId}`;
              const name = it.name || it.productName || "Product";

              return (
                <div
                  key={it.id}
                  className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 flex gap-4"
                >
                  <Link
                    to={productUrl}
                    className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 border rounded-lg overflow-hidden bg-white"
                  >
                    <img
                      src={
                        it.image ||
                        "https://placehold.co/300x300/f6f6f6/9aa1a9?text=Product"
                      }
                      alt={name}
                      className="w-full h-full object-contain"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://placehold.co/300x300/f6f6f6/9aa1a9?text=Product")
                      }
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={productUrl}>
                      <h3 className="font-semibold line-clamp-2">{name}</h3>
                    </Link>

                    {/* CTA row */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => onMoveToCart(it.id)}
                        className="px-3 py-1.5 rounded-full bg-neutral-900 text-white text-sm flex items-center gap-2"
                        title="Move to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Move to Cart
                      </button>

                      <button
                        onClick={() => onRemove(it.id)}
                        className="px-3 py-1.5 rounded-full border border-neutral-200 text-sm flex items-center gap-2"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-neutral-500">
                      Price and availability will be shown on the product page.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h4 className="font-semibold mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="mt-5 w-full px-4 py-2.5 rounded-full bg-neutral-900 text-white text-sm"
              >
                Go to Cart
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
