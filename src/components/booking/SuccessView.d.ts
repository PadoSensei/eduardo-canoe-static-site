import { Booking } from "@/api/schemas";
import React from "react";

export interface SuccessViewProps {
  guestEmail: string;
  guestPhone?: string;
  booking: Booking | null;
  selectedDate: string;
  onClose: () => void;
  tourName: string;
}

export const SuccessView: React.FC<SuccessViewProps>;
