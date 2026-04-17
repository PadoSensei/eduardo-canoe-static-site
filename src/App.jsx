import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Toaster } from "sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import NotificationSettings from "./components/admin/NotificationSettings";

// Components
import BookingSystem from "./components/BookingSystem";
import { supabase } from "./supabaseClient";
import config from "./core/config";

const App = () => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!config.isProduction) {
        // eslint-disable-next-line no-console
        console.log(
          `🔐 AUTH_EVENT: ${event} | User: ${session?.user?.email || "NONE"}`
        );
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen px-6 text-center bg-gray-50">
          <div className="max-w-md">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 font-lora">
              Oops!
            </h1>
            <p className="mb-8 text-gray-600">
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
        <Toaster position="top-right" richColors closeButton />

        <Routes>
          {/* Public Routes with Header/Footer */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="flex-grow">
                  <Routes>
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
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />

          {/* Admin Routes with Sidebar Layout */}
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/manifest/:date" element={<Dashboard />} />
                  <Route path="/settings" element={<NotificationSettings />} />
                </Routes>
              </AdminLayout>
            }
          />
        </Routes>
      </div>
    </Sentry.ErrorBoundary>
  );
};

export default App;
