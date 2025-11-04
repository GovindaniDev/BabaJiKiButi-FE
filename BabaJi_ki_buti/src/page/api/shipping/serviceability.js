import axios from "axios";

let cachedToken = null;
let tokenExpiry = 0; // epoch ms

// ---------- helpers: friendly error normalization ----------
function friendlyError({ code = "UNKNOWN", http = 500, dev, hint }) {
  // message shown to end users
  const msgMap = {
    BAD_REQUEST: "Please check the details you entered and try again.",
    INVALID_PINCODE: "Please enter a valid 6-digit pincode.",
    INVALID_WEIGHT: "Package weight must be a positive number.",
    INVALID_MODE: "Shipping mode must be Air or Surface.",
    AUTH_FAILED: "We’re unable to connect to our shipping partner right now.",
    UNAUTHORIZED: "Session expired. Please try again.",
    FORBIDDEN: "Action not allowed.",
    NOT_FOUND: "Service temporarily unavailable. Please try later.",
    TIMEOUT: "The request took too long. Please try again.",
    RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
    UPSTREAM_ERROR: "Our shipping partner returned an error. Please try again.",
    NETWORK_ERROR: "Network issue. Check your connection and try again.",
    UNKNOWN: "Something went wrong. Please try again.",
  };

  const message = msgMap[code] || msgMap.UNKNOWN;

  return {
    http,
    body: {
      error: true,
      code,
      message,
      // Optional gentle guidance for the UI. Keep short.
      hint: hint || undefined,
    },
    // dev is only logged server-side
    dev,
  };
}

function sendFriendly(res, fErr) {
  // Log detailed diagnostic, send clean body
  if (fErr?.dev) {
    // eslint-disable-next-line no-console
    console.error("[shiprocket]", fErr.code || fErr.body?.code, fErr.dev);
  }
  return res.status(fErr.http).json(fErr.body);
}

const allowedModes = new Set(["Air", "Surface"]);

async function getShiprocketToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  try {
    const { data } = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_API_EMAIL,
        password: process.env.SHIPROCKET_API_PASSWORD,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    if (!data?.token) {
      throw friendlyError({
        code: "AUTH_FAILED",
        http: 502,
        dev: { step: "auth.login", data },
      });
    }

    cachedToken = data.token;
    tokenExpiry = now + 9 * 24 * 60 * 60 * 1000; // refresh a bit before 10 days
    return cachedToken;
  } catch (err) {
    // Map common transport errors
    if (err.code === "ECONNABORTED") {
      throw friendlyError({
        code: "TIMEOUT",
        http: 504,
        dev: { step: "auth.login.timeout" },
      });
    }
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 401) {
        throw friendlyError({
          code: "UNAUTHORIZED",
          http: 502,
          dev: { step: "auth.login.401", response: err.response?.data },
        });
      }
      throw friendlyError({
        code: "UPSTREAM_ERROR",
        http: 502,
        dev: { step: "auth.login", status, response: err.response?.data },
      });
    }
    throw friendlyError({ code: "AUTH_FAILED", http: 502, dev: { err } });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendFriendly(res, friendlyError({ code: "BAD_REQUEST", http: 405, dev: { method: req.method } }));
  }

  try {
    const {
      pickup_postcode,
      delivery_postcode,
      weight = 0.5,
      cod = 1,
      length,
      breadth,
      height,
      declared_value,
      mode, // "Air" | "Surface"
    } = req.body || {};

    // ----------- input validation (user-friendly) -----------
    const isPin = (p) => /^\d{6}$/.test(String(p || "").trim());

    if (!isPin(pickup_postcode) || !isPin(delivery_postcode)) {
      return sendFriendly(
        res,
        friendlyError({
          code: "INVALID_PINCODE",
          http: 400,
          hint: "Pincode should be exactly 6 digits.",
          dev: { pickup_postcode, delivery_postcode },
        })
      );
    }

    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0) {
      return sendFriendly(
        res,
        friendlyError({
          code: "INVALID_WEIGHT",
          http: 400,
          hint: "Example: 0.5 for 500 grams, 1 for 1 kg.",
          dev: { weight },
        })
      );
    }

    if (mode && !allowedModes.has(String(mode))) {
      return sendFriendly(
        res,
        friendlyError({
          code: "INVALID_MODE",
          http: 400,
          hint: "Allowed: Air or Surface.",
          dev: { mode },
        })
      );
    }

    // ----------- token -----------
    const token = await getShiprocketToken();

    // ----------- serviceability call -----------
    const payload = {
      pickup_postcode: Number(pickup_postcode),
      delivery_postcode: Number(delivery_postcode),
      cod,
      weight: w,
      length,
      breadth,
      height,
      declared_value,
      mode,
    };

    try {
      const { data } = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const list = data?.data?.available_courier_companies || [];
      const serviceable = Array.isArray(list) && list.length > 0;

      // If no couriers, return 200 with a gentle message your UI can show.
      if (!serviceable) {
        return res.status(200).json({
          error: false,
          serviceable: false,
          message: "Delivery is not available to this pincode for the given package.",
          hint: "Try a different pincode or change weight/mode.",
          couriers: [],
          raw: data,
        });
      }

      return res.status(200).json({
        error: false,
        serviceable: true,
        couriers: list,
        raw: data,
      });
    } catch (err) {
      // Map axios errors from serviceability call
      if (err.code === "ECONNABORTED") {
        return sendFriendly(res, friendlyError({ code: "TIMEOUT", http: 504, dev: { step: "serviceability.timeout", payload } }));
      }
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          return sendFriendly(res, friendlyError({ code: "UNAUTHORIZED", http: 502, dev: { step: "serviceability.401", data: err.response?.data } }));
        }
        if (status === 403) {
          return sendFriendly(res, friendlyError({ code: "FORBIDDEN", http: 502, dev: { step: "serviceability.403", data: err.response?.data } }));
        }
        if (status === 404) {
          return sendFriendly(res, friendlyError({ code: "NOT_FOUND", http: 502, dev: { step: "serviceability.404", data: err.response?.data } }));
        }
        if (status === 408) {
          return sendFriendly(res, friendlyError({ code: "TIMEOUT", http: 504, dev: { step: "serviceability.408", data: err.response?.data } }));
        }
        if (status === 422) {
          // Shiprocket sometimes returns 422 for bad dimensions/params
          return sendFriendly(
            res,
            friendlyError({
              code: "BAD_REQUEST",
              http: 400,
              hint: "Please review weight and dimensions.",
              dev: { step: "serviceability.422", data: err.response?.data },
            })
          );
        }
        if (status === 429) {
          return sendFriendly(res, friendlyError({ code: "RATE_LIMIT", http: 429, dev: { step: "serviceability.429" } }));
        }
        if (status >= 500) {
          return sendFriendly(res, friendlyError({ code: "UPSTREAM_ERROR", http: 502, dev: { step: "serviceability.5xx", status, data: err.response?.data } }));
        }
      }
      return sendFriendly(res, friendlyError({ code: "NETWORK_ERROR", http: 502, dev: { step: "serviceability.network", err } }));
    }
  } catch (outer) {
    // outer may already be a friendlyError return
    if (outer?.body && outer?.http) {
      return sendFriendly(res, outer);
    }
    return sendFriendly(res, friendlyError({ code: "UNKNOWN", http: 500, dev: { outer } }));
  }
}
