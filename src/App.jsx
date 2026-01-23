import React from "react";
import { Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react"; // 1. Import Sentry
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Components
import BookingSystem from "./components/BookingSystem";

const App = () => {
  return (
    // 2. Wrap the entire UI in an ErrorBoundary
    <Sentry.ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 text-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-lora">
              Oops!
            </h1>
            <p className="text-gray-600 mb-8">
              Something went wrong on our end. Please try refreshing the page or
              contact support if the issue persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF6B6B] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-[#FF5252] transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />
            <Route
              path="/book"
              element={
                <div className="pt-24">
                  <BookingSystem />
                </div>
              }
            />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Admin Route */}
            <Route path="/admin" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Sentry.ErrorBoundary>
  );
};

export default App;
