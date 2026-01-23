import React from "react";

const Privacy = () => (
  <div className="pt-32 pb-20 max-w-3xl mx-auto px-6 text-gray-800 leading-relaxed">
    <h1 className="text-3xl font-bold mb-6 font-lora">Privacy Policy (v1.0)</h1>
    <section className="space-y-4">
      <p>
        In compliance with the Brazilian General Data Protection Law (LGPD), we
        inform you that:
      </p>
      <ul className="list-disc ml-6">
        <li>
          <strong>Data Collected:</strong> We collect your name and email to
          execute the booking contract.
        </li>
        <li>
          <strong>Purpose:</strong> To send your tickets and provide tour
          updates.
        </li>
        <li>
          <strong>Storage:</strong> Your data is stored securely via Supabase.
          We do not share your data with third-party marketers.
        </li>
      </ul>
    </section>
  </div>
);

export default Privacy;
