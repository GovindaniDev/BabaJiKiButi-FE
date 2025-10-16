import { cartApi } from "@/auth/cart/cartApi";
import { guestCart } from "@/auth/cart/guestCart";
import { emitCartChanged } from "@/auth/cart/cartBus";

/** Call this from buttons on product cards and PDP.
 *  Accepts either `product` (object) or `productId` (number/string).
 */
export async function addToCartUnified({ userId, product, productId, qty = 1 }) {
  // derive a usable productId for server mode
  const pid =
    productId ??
    product?.productId ??
    product?.id ??
    product?.sku ?? // only if your backend accepts sku (else drop)
    null;

  if (userId) {
    if (pid == null) {
      console.error("[addToCartUnified] Missing productId for server add:", { product, productId });
      return;
    }
    await cartApi.addItem(userId, pid, Number(qty) || 1);
  } else {
    // for guest we pass the full product so we can snapshot price/title/image
    if (!product && pid != null) product = { id: pid };
    guestCart.addItem(product, Number(qty) || 1);
  }

  // notify all listeners (mini-cart, cart page)
  emitCartChanged("button:addToCart");
}
