import { Booking } from "@/api/schemas";

export interface SuccessViewProps {
  guestEmail: string;
  guestPhone?: string;
  booking: Booking | null;
  selectedDate: string;
  onClose: () => void;
  tourName: string;
}

declare const SuccessView: React.FC<SuccessViewProps>;
export default SuccessView;
