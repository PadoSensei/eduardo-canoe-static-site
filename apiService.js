// apiService.js (Corrected with ES Module 'export' syntax)

// ✅ Keep the constant, but export it.
export const API_BASE_URL = "http://localhost:8000/api/v1";

let toursCache = null;

// ✅ Add 'export' before the function definition.
export function formatErrorMessage(status, message) {
  return `${status} - ${message}`;
}

// ✅ Add 'export'
export async function fetchWithRetry(url, options = {}, retries = 3) {
  // ... function body remains the same
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt === retries) {
        throw lastErr;
      }
    }
  }
}

// ✅ Add 'export'
export async function fetchTours() {
  // ... function body remains the same
  if (toursCache) return toursCache;
  const url = `${API_BASE_URL}/tours`;
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg =
      errBody && errBody.detail
        ? errBody.detail
        : `Error fetching tours: ${res.status}`;
    throw new Error(formatErrorMessage(res.status, msg));
  }
  const data = await res.json();
  toursCache = data;
  return data;
}

// ✅ Add 'export'
export async function fetchAvailability(date) {
  // ... function body remains the same
  const url = `${API_BASE_URL}/tours/available?tour_date=${date}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg =
      errBody && errBody.detail
        ? errBody.detail
        : `Error fetching availability: ${res.status}`;
    throw new Error(formatErrorMessage(res.status, msg));
  }
  return res.json();
}

// ✅ Add 'export'
export async function createBooking(bookingData) {
  // ... function body remains the same
  const url = `${API_BASE_URL}/bookings`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body && (body.detail || body.message)) ||
      `Error creating booking: ${res.status}`;
    return { success: false, message };
  }
  return { success: true, data: body };
}

// ✅ Add 'export'
export async function fetchAvailabilityAndDetails(date) {
  // ... function body remains the same
  const url = `${API_BASE_URL}/availability/${date}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch availability");
  const json = await response.json();
  if (!json.success || !json.data || !json.data.tours) return [];
  return json.data.tours;
}

// ✅ Add 'export'
export function clearCache() {
  toursCache = null;
}

// ✅ Add 'export' to your new ping function too
export async function pingBackend() {
  // We will ping the /tours endpoint. We know this must exist for the app to work.
  const url = `${API_BASE_URL}/tours`; // CHANGED FROM /health

  try {
    // We only need the headers, not the full body, so a 'HEAD' request is efficient.
    // However, a 'GET' works perfectly fine too if your server doesn't support HEAD.
    const response = await fetch(url, { method: "GET" });

    // response.ok is true for any successful status code (like 200)
    return response.ok;
  } catch (error) {
    // This will catch network errors like CORS or if the server is down.
    console.error("Ping failed:", error);
    return false;
  }
}
