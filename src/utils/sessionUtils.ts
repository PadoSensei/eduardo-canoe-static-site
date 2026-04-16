import { toast } from "sonner";
import { translations } from "@/data/translations";

/**
 * Shared utility to handle session expiration consistently across the app.
 */
export const handleSessionExpired = (navigate: (path: string) => void) => {
  localStorage.removeItem("pending_booking");

  const lang =
    (localStorage.getItem("language") as keyof typeof translations) || "pt";
  const t = translations[lang] || translations["en"];

  toast.error(t.booking_session_expired);

  // If we are on the booking modal or flow, redirect to catalog
  navigate("/tours");
};
