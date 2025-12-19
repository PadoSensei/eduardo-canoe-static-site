import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard"; // <--- NEW IMPORT

// Components
import BookingSystem from "./components/BookingSystem";

const App = () => {
  return (
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

          {/* Admin Route */}
          <Route path="/admin" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
