// Maps backend/HTTP failures into friendly end-user messages.
// Use everywhere you show errors to users.

export function userErrorMessage(input) {
  // Accepts: Error object, fetch result { ok:false, status, error, raw }, or string
  const pick = (obj, keys) =>
    Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

  let status = 0;
  let server = "";
  let code = "";
  let detail = "";

  if (typeof input === "string") {
    server = input;
  } else if (input && typeof input === "object") {
    // subscriptionApi http() shape
    if ("status" in input) status = Number(input.status) || 0;
    server =
      input.userMessage ||
      input.error ||
      input.message ||
      (typeof input.raw === "string" ? input.raw : "") ||
      "";
    // Try to glean code/detail if backend sends them
    if (input.raw && typeof input.raw === "object") {
      code = input.raw.code || input.raw.errorCode || "";
      detail = input.raw.detail || input.raw.reason || "";
    }
    if (input.name === "ApiError" && input.message) server = input.message;
  } else if (input instanceof Error) {
    server = input.message || "Something went wrong";
  }

  // Normalize (remove noisy prefixes, JSON, etc.)
  try {
    if (server && server.length > 280) server = server.slice(0, 280);
    server = String(server).replace(/^\s*Error:\s*/i, "").trim();
  } catch {}

  // Status buckets → friendly messages
  if (status === 0) {
    return "We couldn’t reach the server. Check your internet and try again.";
  }
  if (status === 401) {
    return "Please sign in to continue.";
  }
  if (status === 403) {
    return "You don’t have access to do that.";
  }
  if (status === 404) {
    return "This resource was not found. Please refresh and try again.";
  }
  if (status === 409) {
    // Duplicate/pending scenarios for subscriptions
    return "A subscription payment is already in progress. You can abort it and try again.";
  }
  if (status === 422) {
    return detail || server || "Some details look invalid. Please check and try again.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "We’re facing an issue on our side. Please try again in a minute.";
  }

  // Fallback: use cleaned server text or a generic message
  return (
    server ||
    "Something went wrong. Please try again. If the problem persists, contact support."
  );
}

// Optional: a single confirm helper for destructive/risky actions
export function confirmMessage(kind, extra = {}) {
  switch (kind) {
    case "abort-pending":
      return (
        (extra.server || "A subscription payment is already in progress.") +
        "\n\nDo you want to abort it and start a fresh checkout?"
      );
    case "cancel-subscription":
      return "Cancel membership now? Benefits remain until the end of your current period.";
    default:
      return "Are you sure?";
  }
}
