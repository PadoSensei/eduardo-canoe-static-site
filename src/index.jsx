import React from "react";
import ReactDOM from "react-dom/client";
import BookingSystem from "./components/BookingSystem.jsx";

// 1. Find the div in our HTML where we want our React app to live.
const rootElement = document.getElementById("react-booking-app");

// 2. Tell React to take control of that element.
const root = ReactDOM.createRoot(rootElement);

// 3. Render our main component inside that element.
root.render(
  <React.StrictMode>
    <BookingSystem />
  </React.StrictMode>
);
