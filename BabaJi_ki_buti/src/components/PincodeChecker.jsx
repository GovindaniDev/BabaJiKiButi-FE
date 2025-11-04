// src/components/PincodeChecker.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { checkServiceability } from "../auth/shippingApi";

const PIN_RE = /^\d{6}$/;
const isPin = (p) => PIN_RE.test(String(p || "").trim());

export default function PincodeChecker({
  pickupPincode = "110030",
  defaultWeight = 0.5,    // in KG (0.5 = 500g)
  allowCOD = true,
  declaredValue,
  mode = "Surface",       // "Air" | "Surface"
  onResult,               // (serviceable, bestCourier, fullPayload) => void
  autoCheckFor,           // optional: a pincode to auto-check on mount/update
  storageKey = "lastPincode" // localStorage key to remember successful pin
}) {
  const [pin, setPin] = useState("");
  const [cod, setCod] = useState(allowCOD);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");
  const [fieldErrs, setFieldErrs] = useState({}); // backend validation field errors

  // sanitize input to digits
  const onPinChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPin(onlyDigits);
    setErr("");
    setFieldErrs({});
  };

  const canSubmit = useMemo(() => isPin(pin) && !loading, [pin, loading]);

  const runCheck = useCallback(async (targetPin) => {
    setErr("");
    setInfo(null);
    setFieldErrs({});

    if (!isPin(targetPin)) {
      setErr("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    try {
      const data = await checkServiceability({
        pickup_postcode: pickupPincode,
        delivery_postcode: targetPin,
        weight: defaultWeight,        // kg
        cod: cod ? 1 : 0,
        declared_value: declaredValue,
        mode,
      });

      setInfo(data);
      // remember last successful pin
      if (data && typeof window !== "undefined") {
        try { localStorage.setItem(storageKey, targetPin); } catch {}
      }
     
      const payload={
        ...data,
        meta:{
          delivery_postcode:data?.meta?.delivery_postcode || targetPin,
          pickup_postcode:data?.meta?.pickup_postcode || pickupPincode,
          weight:data?.meta?.weight || defaultWeight,
          cod:data?.meta?.cod || (cod ? 1 : 0),
         
          mode:data?.meta?.mode || mode,
        },
      };
       onResult && onResult(Boolean(data.serviceable), data.couriers?.[0] || null, payload);
    } catch (e) {
      // Prefer friendly server text if present
      const api = e?.response?.data;
      const apiMsg = api?.message;
      const apiHint = api?.hint;
      const msg = apiMsg || e?.message || "Check failed";

      // surface field errors (VALIDATION_ERROR)
      if (api?.code === "VALIDATION_ERROR" && api?.fields) {
        setFieldErrs(api.fields);
      }

      setErr(apiHint ? `${msg} — ${apiHint}` : msg);
    } finally {
      setLoading(false);
    }
  }, [pickupPincode, defaultWeight, cod, declaredValue, mode, onResult, storageKey]);

  async function onCheck() {
    await runCheck(pin);
  }

  // support Enter key
  const onKeyDown = (e) => {
    if (e.key === "Enter" && canSubmit) {
      e.preventDefault();
      onCheck();
    }
  };

  // auto-check if prop provided
  useEffect(() => {
    if (autoCheckFor && isPin(autoCheckFor)) {
      setPin(autoCheckFor);
      runCheck(autoCheckFor);
    }
  }, [autoCheckFor, runCheck]);

  // prefill last successful pincode
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && isPin(saved)) setPin(saved);
    } catch {}
  }, [storageKey]);

  const best = info?.couriers?.[0];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-40"
          placeholder="Enter pincode"
          value={pin}
          onChange={onPinChange}
          onKeyDown={onKeyDown}
          maxLength={6}
          inputMode="numeric"
          aria-invalid={Boolean(err || fieldErrs.deliveryPostcode)}
          aria-describedby="pin-error"
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={!canSubmit}
          onClick={onCheck}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cod}
          disabled={loading}
          onChange={(e) => setCod(e.target.checked)}
        />
        Cash on Delivery
      </label>

      {/* errors */}
      {(err || fieldErrs.pickupPostcode || fieldErrs.deliveryPostcode || fieldErrs.weight) && (
        <div id="pin-error" className="text-red-600 text-sm space-y-0.5">
          {err ? <p>{err}</p> : null}
          {fieldErrs.pickupPostcode ? <p>Pickup pincode: {fieldErrs.pickupPostcode}</p> : null}
          {fieldErrs.deliveryPostcode ? <p>Delivery pincode: {fieldErrs.deliveryPostcode}</p> : null}
          {fieldErrs.weight ? <p>Weight: {fieldErrs.weight}</p> : null}
        </div>
      )}

      {/* result */}
      {info && (
        <div className="text-sm border rounded p-3">
          {info.serviceable ? (
            <>
              <div className="font-medium">Deliverable ✔</div>
              {best && (
                <ul className="list-disc ml-4">
                  <li>Courier: {best.courier_name}</li>
                  <li>ETA: {best.etd ? `${best.etd} days` : "N/A"}</li>
                  <li>Rate (incl. GST): ₹{best.rate}</li>
                  <li>Mode: {best.mode || "-"}</li>
                  <li>COD: {Number(best.cod) === 1 ? "Available" : "Unavailable"}</li>
                </ul>
              )}
            </>
          ) : (
            <div className="text-amber-700">
              <div>Not serviceable to this pincode.</div>
              {info.message && <div className="mt-1 text-[12px]">{info.message}</div>}
              {info.hint && <div className="text-[12px]">{info.hint}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
