import React, { useState } from "react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Plus from "lucide-react/dist/esm/icons/plus";
import Minus from "lucide-react/dist/esm/icons/minus";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { adminCreateBooking } from "../../../api";
import ManualBookingSummary from "./ManualBookingSummary";

const ManualBookingForm = ({
  selectedTour,
  onCancel,
  onSuccess,
  dateString: _dateString,
}) => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Calculate available spots for the stepper limit
  const availableSpots = selectedTour.capacity - selectedTour.booked_count;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const controller = new AbortController();
    setIsSubmitting(true);

    try {
      const numericPrice = selectedTour.price || 0;
      const payload = {
        tour_id: selectedTour.tour_id,
        guest_name: guestName,
        guest_email: guestEmail,
        num_people: parseInt(numPeople, 10),
        special_notes: specialNotes,
        total_price: numericPrice * numPeople,
        accepted_terms: true, // Admin override
      };

      const result = await adminCreateBooking(payload, {
        signal: controller.signal,
      });

      if (result && result.booking) {
        setCreatedBooking(result.booking);
        setShowSummary(true);
      } else {
        // Fallback if backend doesn't return booking object but 200 OK
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSummary && createdBooking) {
    return (
      <ManualBookingSummary
        displayId={
          createdBooking.display_id || createdBooking.uuid.substring(0, 8)
        }
        guestName={createdBooking.guest_name || guestName}
        onFinish={() => {
          if (onSuccess) onSuccess();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col w-full h-full duration-300 bg-white shadow-2xl animate-in slide-in-from-bottom">
      {/* Form Header */}
      <div className="flex items-center gap-3 p-4 text-white bg-teal-800 shadow-md shrink-0">
        <button
          onClick={onCancel}
          className="p-2 transition-colors rounded-full hover:bg-teal-700"
          aria-label="Back to manifest"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-lg font-bold leading-none">Add Manual Guest</h2>
          <p className="text-[10px] uppercase tracking-widest text-teal-300 font-bold mt-1">
            {selectedTour.display_name}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50/50"
      >
        {/* Guest Name */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Full Name
          </label>
          <input
            required
            autoFocus
            className="w-full p-4 font-medium transition-all bg-white border border-gray-200 shadow-sm outline-none rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
            placeholder="e.g. John Doe"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>

        {/* Guest Email */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full p-4 font-medium transition-all bg-white border border-gray-200 shadow-sm outline-none rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
            placeholder="guest@example.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
        </div>

        {/* Passenger Stepper */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Passengers (Available: {availableSpots})
          </label>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm max-w-[200px]">
            <button
              type="button"
              disabled={numPeople <= 1}
              onClick={() => setNumPeople(numPeople - 1)}
              className="p-3 text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30"
            >
              <Minus size={20} />
            </button>
            <span className="flex-1 text-2xl font-black text-center text-teal-950">
              {numPeople}
            </span>
            <button
              type="button"
              disabled={numPeople >= availableSpots}
              onClick={() => setNumPeople(numPeople + 1)}
              className="p-3 text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Special Notes */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
            Special Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full p-4 font-medium transition-all bg-white border border-gray-200 shadow-sm outline-none rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500"
            placeholder="Allergies, special occasions, etc..."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || availableSpots <= 0}
            className="w-full py-5 font-black uppercase tracking-widest text-white bg-teal-600 rounded-2xl shadow-lg shadow-teal-200 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-95 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              "Confirm Manual Booking"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualBookingForm;
