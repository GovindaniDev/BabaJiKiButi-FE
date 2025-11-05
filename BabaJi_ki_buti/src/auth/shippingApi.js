// src/auth/shippingApi.js
import { pub } from "./publicHttp";

export async function checkServiceability(payload) {
  const res = await pub.post("/shipping/serviceability", payload);
  return res.data; // expects ServiceabilityResponse with {serviceable,couriers,meta,...}
}
