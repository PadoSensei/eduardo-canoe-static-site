import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Toaster } from "sonner";
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Tours from "./pages/Tours";

// Lazy-loaded pages
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const About = React.lazy(() => import("./pages/About"));

// Admin
const AdminLayout = React.lazy(() => import("./components/admin/AdminLayout"));
const ActivityView = React.lazy(() => import("./pages/admin/ActivityView"));
const EmailsView = React.lazy(() => import("./pages/admin/EmailsView"));

// Components
const BookingSystem = React.lazy(() => import("./components/BookingSystem"));
const AdminAuthProvider = React.lazy(() =>
  import("./components/admin/AdminAuthProvider")
);

const App = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    let initialized = false;
    const initSentry = () => {
      if (initialized) return;
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          }),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        environment: import.meta.env.MODE,
      });
      initialized = true;
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => initSentry());
    } else {
      setTimeout(initSentry, 2000);
    }
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
                  {/* Inner Suspense for secondary pages (FAQ, About, Legal)
                      min-h-[60vh] ensures the footer doesn't jump to the top while loading. */}
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50/50">
                        <Loader2 className="w-10 h-10 text-[#FF6B6B] animate-spin" />
                      </div>
                    }
                  >
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
                  </React.Suspense>
                </main>
                <Footer />
              </>
            }
          />

          {/* Admin Routes with Sidebar Layout
              Wrapped in its own Suspense because AdminLayout itself is lazy-loaded. */}
          <Route
            path="/admin/*"
            element={
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen bg-gray-950">
                    <Loader2 className="w-10 h-10 text-[#FF6B6B] animate-spin" />
                  </div>
                }
              >
                <AdminAuthProvider>
                  <AdminLayout>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Navigate
                            to={`/admin/operations${window.location.search}`}
                            replace
                          />
                        }
                      />
                      <Route path="/operations" element={<Dashboard />} />
                      <Route path="/manifest/:date" element={<Dashboard />} />
                      <Route path="/activity" element={<ActivityView />} />
                      <Route path="/emails" element={<EmailsView />} />
                      <Route
                        path="/settings"
                        element={
                          <Navigate
                            to={`/admin/emails${window.location.search}`}
                            replace
                          />
                        }
                      />
                    </Routes>
                  </AdminLayout>
                </AdminAuthProvider>
              </React.Suspense>
            }
          />
        </Routes>
      </div>
    </Sentry.ErrorBoundary>
  );
};

export default App;
