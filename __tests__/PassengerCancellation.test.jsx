import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import DayManifest from "../src/components/dashboard/DayManifest";
import { LanguageProvider } from "../src/context/LanguageContext";

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

const mockTour = {
  tour_id: 101,
  display_name: "Cancellation Test Tour",
  booked_count: 2,
  capacity: 10,
  status: "available",
  passengers: [
    {
      id: 1,
      uuid: "uuid-1",
      guest_name: "To Be Cancelled",
      num_people: 2,
      status: "confirmed",
      checked_in: false,
    },
  ],
};

const server = setupServer();

beforeAll(() => {
  server.listen();
  window.confirm = jest.fn(() => true);
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Passenger Cancellation", () => {
  test("Cancel Booking button triggers confirmation and API call", async () => {
    let manifestData = [mockTour];

    server.use(
      http.get(`${API_BASE}/admin/manifest/*`, () => HttpResponse.json(manifestData)),
      http.post(`${API_BASE}/admin/bookings/*/cancel`, () => {
        manifestData = [{
          ...mockTour,
          passengers: [{
            ...mockTour.passengers[0],
            status: "cancelled"
          }]
        }];
        return HttpResponse.json({ success: true });
      })
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

    // Open tour details
    const tourCard = await screen.findByText("Cancellation Test Tour");
    fireEvent.click(tourCard);

    // Find Cancel Booking button
    const cancelBtn = await screen.findByLabelText(/Cancelar Reserva|Cancel Booking/i);
    expect(cancelBtn).toBeInTheDocument();

    // Click cancel
    fireEvent.click(cancelBtn);

    // Should have called window.confirm
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringMatching(/release 2 seats|liberará 2 vagas/i)
    );

    // Wait for the UI to reflect the change
    await waitFor(() => {
      expect(screen.getByText(/Nenhum passageiro ativo|No active passengers/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Also verify the passenger moved to the inactive section
    const inactiveBtn = screen.getByText(/Cancelled \/ Inactive/i);
    expect(inactiveBtn).toBeInTheDocument();
  });

  test("Cancel Booking button is NOT visible for inactive statuses", async () => {
    const cancelledTour = {
        ...mockTour,
        passengers: [
            {
                id: 2,
                uuid: "uuid-2",
                guest_name: "Already Cancelled",
                num_people: 1,
                status: "cancelled",
                checked_in: false,
            }
        ]
    };

    server.use(
        http.get(`${API_BASE}/admin/manifest/*`, () =>
          HttpResponse.json([cancelledTour])
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

    fireEvent.click(await screen.findByText("Cancellation Test Tour"));

    expect(screen.queryByLabelText(/Cancelar Reserva|Cancel Booking/i)).not.toBeInTheDocument();
  });
});
