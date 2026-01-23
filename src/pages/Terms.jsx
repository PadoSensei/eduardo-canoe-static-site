import React from "react";

const Terms = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 text-gray-800 leading-relaxed">
    <h1 className="text-3xl font-bold mb-6 font-lora">
      Terms of Service (v1.0)
    </h1>
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">1. Cancellation Policy</h2>
      <p>
        Cancellations made more than 24 hours before the tour start time are
        eligible for a full refund. Cancellations made within 24 hours are
        non-refundable.
      </p>

      <h2 className="text-xl font-semibold">2. Pix Refunds</h2>
      <p>
        Refunds for payments made via Pix will be processed manually within 5
        business days to the original account used.
      </p>

      <h2 className="text-xl font-semibold">3. Safety</h2>
      <p>
        The tour guide reserves the right to cancel or reschedule tours due to
        unsafe weather conditions (wind/rain). In such cases, a full refund or
        rescheduling will be offered.
      </p>
    </section>
  </div>
);

export default Terms;
