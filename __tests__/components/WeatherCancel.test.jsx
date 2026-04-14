import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitForElementToBeRemoved,
  waitFor,
} from "@testing-library/react";
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
        <DayManifest date={new Date("2026-01-19T12:00:00Z")} onClose={jest.fn()} />
      </LanguageProvider>
    </MemoryRouter>
  );

  // Wait for the async tour card to appear
  const cancelBtn = await screen.findByRole("button", {
    name: /Weather Cancel/i,
  });
  expect(cancelBtn).toBeInTheDocument();

  fireEvent.click(cancelBtn);

  // Instead of window.confirm, we should see the modal
  const modalTitle = await screen.findByText(/Cancel Tour for Weather/i, { selector: 'h3' });
  expect(modalTitle).toBeInTheDocument();

  // Find and click the confirm button in the modal
  // There are two "Weather Cancel" buttons now: one in the card and one in the modal
  const confirmBtns = screen.getAllByRole("button", { name: /Weather Cancel/i });
  fireEvent.click(confirmBtns[confirmBtns.length - 1]);

  // Wait for the success toast (mocked or just wait for effect)
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

  // Since we replaced alert with sonner, we check if the modal is gone
  await waitFor(() => {
    expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
  });
});
