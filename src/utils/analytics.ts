// src/utils/analytics.ts

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

type EventName =
  | "view_item"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase";

interface EventParams {
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string | number;
    item_name: string;
    price?: number;
    quantity?: number;
  }>;
  transaction_id?: string;
  [key: string]: any;
}

/**
 * Tracks a GA4 event if the gtag function is available.
 */
export const trackEvent = (eventName: EventName, params: EventParams) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);

    if (import.meta.env.MODE !== "production") {
      console.log(`📊 GA4 Event: ${eventName}`, params);
    }
  }
};

/**
 * Ensures the purchase event only fires once per booking UUID.
 */
export const trackPurchaseOnce = (bookingUuid: string, params: EventParams) => {
  const storageKey = `ga_purchase_fired_${bookingUuid}`;
  if (localStorage.getItem(storageKey)) return;

  trackEvent("purchase", params);
  localStorage.setItem(storageKey, "true");
};
