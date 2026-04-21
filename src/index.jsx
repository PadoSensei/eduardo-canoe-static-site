import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import App from "./App";
import "../src/styles.css";

// --- 1. Sentry Initialization ---
// We initialize this as the very first thing to catch any startup errors.
Sentry.init({
  // Uses Vite environment variable: VITE_SENTRY_DSN
  dsn: import.meta.env.VITE_SENTRY_DSN,

  integrations: [
    // Automatically instruments React Router v6 for performance monitoring
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    // Replay allows you to watch a video-like reconstruction of a user session when it crashes
    Sentry.replayIntegration(),
  ],

  // Performance Monitoring
  // 1.0 (100%) during dev, usually 0.1 (10%) in production to manage quota
  tracesSampleRate: 1.0,

  // Set levels for Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Automatically sets the environment based on Vite mode (development/production)
  environment: import.meta.env.MODE,
});

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
