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
