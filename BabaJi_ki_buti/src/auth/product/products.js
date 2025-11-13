import { app } from "../http";

/** Small helper: unwrap your ApiResponse<T> */
const getPayload = (res) => res?.data?.data ?? res?.data ?? null;

/** Normalize just in case */
const toProduct = (p) => (p ? { ...p } : null);

/** GET /api/products/slug/{slug} */
export async function getProductBySlug(slug) {
  if (!slug) return null;
  try {
    const res = await app.get(`/products/slug/${encodeURIComponent(slug)}`);
    return toProduct(getPayload(res));
  } catch (e) {
    // Fallback: try search endpoint if slug route fails (optional)
    try {
      const res = await app.get(`/products/search`, { params: { q: slug, page: 0, size: 1 } });
      const page = getPayload(res);
      const hit = page?.content?.[0] ?? null;
      return toProduct(hit);
    } catch {
      return null;
    }
  }
}

/** GET /api/products/{id} */
export async function getProductById(id) {
  if (id == null) return null;
  try {
    const res = await app.get(`/products/${id}`);
    return toProduct(getPayload(res));
  } catch {
    return null;
  }
}

/** GET /api/products/all */
export async function getAllProducts() {
  try {
    const res = await app.get(`/products/all`);
    const list = getPayload(res);
    return Array.isArray(list) ? list.map(toProduct) : [];
  } catch {
    // Dev fallback: load from public/mock/products.json
    try {
      const res = await fetch(`/mock/products.json`, { cache: "no-store" });
      const json = await res.json();
      const list = json?.data ?? [];
      return Array.isArray(list) ? list.map(toProduct) : [];
    } catch {
      return [];
    }
  }
}

/** Paginated list: GET /api/products?page=&size=&sort= */
export async function listProducts({ page = 0, size = 20, sort = "productId,desc" } = {}) {
  try {
    const res = await app.get(`/products`, { params: { page, size, sort } });
    const pageObj = getPayload(res);
    return {
      items: pageObj?.content ?? [],
      total: pageObj?.totalElements ?? 0,
      page: pageObj?.number ?? page,
      size: pageObj?.size ?? size,
    };
  } catch {
    return { items: [], total: 0, page, size };
  }
}

/** GET /api/products/search?q=... */
export async function searchProducts(q, { page = 0, size = 20 } = {}) {
  if (!q) return { items: [], total: 0, page, size };
  try {
    const res = await app.get(`/products/search`, { params: { q, page, size } });
    const pageObj = getPayload(res);
    return {
      items: pageObj?.content ?? [],
      total: pageObj?.totalElements ?? 0,
      page: pageObj?.number ?? page,
      size: pageObj?.size ?? size,
    };
  } catch {
    return { items: [], total: 0, page, size };
  }
}

/* ------------------------------------------------------------------
   Optional tiny helper if you ever want to fetch by category server-side
   (falls back to client-side filter on /all if your API doesn’t support it)
------------------------------------------------------------------- */
export async function getProductsByCategory(categoryName) {
  if (!categoryName) return [];
  // try server search first
  try {
    const { items } = await searchProducts(categoryName, { page: 0, size: 100 });
    if (Array.isArray(items) && items.length) return items.map(toProduct);
  } catch {}
  // fallback: client filter
  const all = await getAllProducts();
  const c = (categoryName ?? "").toString().trim().toLowerCase();
  return all.filter((p) => {
    const cat = p?.category || p?.categoryName || p?.categoryEn || p?.type || "";
    return cat.toString().trim().toLowerCase() === c;
  });
}

/** GET /api/products/category/{categoryId}?page=&size= */
export async function getProductsByCategoryId(categoryId, { page = 0, size = 50 } = {}) {
  if (categoryId == null || categoryId === "") return { items: [], total: 0, page: 0, size };
  try {
    // Your controller returns ApiResponse<Page<ProductDto>>
    const res = await app.get(`/products/category/${encodeURIComponent(categoryId)}`, {
      params: { page, size }
    });
    const pageObj = res?.data?.data ?? res?.data ?? null;
    const content = pageObj?.content ?? [];
    return {
      items: Array.isArray(content) ? content.map((p) => ({ ...p })) : [],
      total: pageObj?.totalElements ?? content.length ?? 0,
      page: pageObj?.number ?? page,
      size: pageObj?.size ?? size,
    };
  } catch {
    return { items: [], total: 0, page: 0, size };
  }
}
