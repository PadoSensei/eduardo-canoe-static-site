import React from "react";
import { TourUI } from "@/api/schemas";

export interface BookingFormProps {
  tour: Partial<TourUI> & { name: string; shortDescription?: string | null };
  selectedDate: string;
  guestName: string;
  setGuestName: (val: string) => void;
  guestEmail: string;
  setGuestEmail: (val: string) => void;
  numPeople: number | string;
  setNumPeople: (val: number | string) => void;
  specialNotes: string;
  setSpecialNotes: (val: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export const BookingForm: React.FC<BookingFormProps>;
