import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../../src/context/LanguageContext";

const API_BASE = "http://localhost:8080/api/v1";

jest.mock("@/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "fake-token" } },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

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
  ),
  http.patch(`${API_BASE}/admin/bookings/*/check-in`, () =>
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
        <DayManifest
          date={new Date("2026-01-19T12:00:00Z")}
          onClose={jest.fn()}
        />
      </LanguageProvider>
    </MemoryRouter>
  );

  // PT default is "Cancelar Clima"
  const cancelBtn = await screen.findByRole("button", {
    name: /Cancelar Clima|Weather Cancel/i,
  });
  expect(cancelBtn).toBeInTheDocument();
  fireEvent.click(cancelBtn);

  // Modal title — PT is "Cancelar Passeio por Clima?"
  const modalTitle = await screen.findByText(
    /Cancelar Passeio por Clima|Cancel Tour for Weather/i,
    { selector: "h3" }
  );
  expect(modalTitle).toBeInTheDocument();

  // Click confirm button in the modal (last one if multiple)
  const confirmBtns = screen.getAllByRole("button", {
    name: /Cancelar Clima|Weather Cancel/i,
  });
  fireEvent.click(confirmBtns[confirmBtns.length - 1]);

  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

  // Modal should be gone after confirmation
  await waitFor(() => {
    expect(
      screen.queryByText(/Cancelar Passeio por Clima|Cancel Tour for Weather/i)
    ).not.toBeInTheDocument();
  });
});

test("should_calculate_headcount_including_pending_payment", async () => {
  const mockTour = {
    tour_id: 103,
    display_name: "Headcount Test Tour",
    booked_count: 3,
    capacity: 10,
    status: "available",
    passengers: [
      {
        id: 1,
        uuid: "uuid-1",
        guest_name: "Confirmed Guest",
        num_people: 2,
        status: "confirmed",
        checked_in: false,
      },
      {
        id: 2,
        uuid: "uuid-2",
        guest_name: "Pending Guest",
        num_people: 1,
        status: "pending_payment",
        checked_in: false,
      },
    ],
  };

  server.use(
    http.get(`${API_BASE}/admin/manifest/*`, () =>
      HttpResponse.json([mockTour])
    )
  );

  render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest
          date={new Date("2026-01-19T12:00:00Z")}
          onClose={jest.fn()}
        />
      </LanguageProvider>
    </MemoryRouter>
  );

  // Click on the tour to see details/headcount
  fireEvent.click(await screen.findByText("Headcount Test Tour"));

  // Iron Shield: Now counts BOTH confirmed (2) and pending_payment (1) = 3
  await screen.findByText(/Boarding Status/i);

  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByText("/ 3")).toBeInTheDocument();

  // Verify percentage is 0%
  expect(screen.getByText("0%")).toBeInTheDocument();

  // Now mock checking in the confirmed guest
  const checkInBtn = screen.getAllByLabelText(/Check-in/i)[0]; // First guest
  fireEvent.click(checkInBtn);

  // After check-in of 2 pax, it should be 2 / 3
  expect(await screen.findByText("2")).toBeInTheDocument();
  expect(screen.getByText("67%")).toBeInTheDocument();
});

test("should handle 0 active passengers without crashing", async () => {
  const mockTour = {
    tour_id: 104,
    display_name: "Empty Tour",
    booked_count: 1,
    capacity: 10,
    status: "available",
    passengers: [
      {
        id: 3,
        uuid: "uuid-3",
        guest_name: "Expired Guest",
        num_people: 1,
        status: "expired",
        checked_in: false,
      },
    ],
  };

  server.use(
    http.get(`${API_BASE}/admin/manifest/*`, () =>
      HttpResponse.json([mockTour])
    )
  );

  render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest
          date={new Date("2026-01-19T12:00:00Z")}
          onClose={jest.fn()}
        />
      </LanguageProvider>
    </MemoryRouter>
  );

  fireEvent.click(await screen.findByText("Empty Tour"));

  // Assert 0 / 0 and 0% (since expired guest is inactive)
  expect(await screen.findByText("0")).toBeInTheDocument();
  expect(screen.getByText("/ 0")).toBeInTheDocument();
  expect(screen.getByText("0%")).toBeInTheDocument();
});

test("Cancelled tour shows badge and no Weather Cancel button", async () => {
  server.use(
    http.get(`${API_BASE}/admin/manifest/*`, () =>
      HttpResponse.json([
        {
          tour_id: 102,
          display_name: "Sunset Tour",
          booked_count: 4,
          capacity: 8,
          status: "cancelled",
          passengers: [],
        },
      ])
    )
  );

  render(
    <MemoryRouter>
      <LanguageProvider>
        <DayManifest
          date={new Date("2026-01-19T12:00:00Z")}
          onClose={jest.fn()}
        />
      </LanguageProvider>
    </MemoryRouter>
  );

  // Select the cancelled tour first — alert only renders after selection
  fireEvent.click(await screen.findByText("Sunset Tour"));

  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent(/This tour has been cancelled/i);

  expect(
    screen.queryByRole("button", { name: /Cancelar Clima|Weather Cancel/i })
  ).not.toBeInTheDocument();
});
