import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8000/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/admin/manifest/*`, () =>
    HttpResponse.json([
      {
        tour_id: 101,
        display_name: "Sunrise Tour",
        booked_count: 2,
        capacity: 10,
        status: "available",
        passengers: [],
      },
    ])
  ),
  http.post(`${API_BASE}/admin/tours/*/weather-cancel`, () =>
    HttpResponse.json({ success: true })
  )
);

beforeAll(() => {
  server.listen();
  window.confirm = jest.fn(() => true);
  window.alert = jest.fn();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Weather Cancel button triggers confirmation and API call", async () => {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest date={new Date()} onClose={jest.fn()} />
      </LanguageProvider>
    </MemoryRouter>
  );

  // Wait for the async tour card to appear
  const cancelBtn = await screen.findByRole("button", {
    name: /Weather Cancel/i,
  });
  expect(cancelBtn).toBeInTheDocument();

  fireEvent.click(cancelBtn);

  expect(window.confirm).toHaveBeenCalled();

  // Wait for the alert to be called after the async API call finishes
  await act(async () => {});
  expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Success"));
});
