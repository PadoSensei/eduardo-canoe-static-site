import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { getActivityLog } from "../src/api";
import config from "../src/core/config";

// Force config to test mode
config.isTest = true;

const API_BASE = "http://localhost:8080/api/v1";

const server = setupServer(
  http.get(`${API_BASE}/tours/specialty/next`, () =>
    HttpResponse.json({ next_date: null })
  ),
  http.get(`${API_BASE}/admin/activity-log`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    const logs = [
      {
        id: 1,
        timestamp: "2024-04-23T10:00:00Z",
        event_type: "payment_confirmed",
        category: "payments",
        display_id: "A1B2C3D4",
        guest_name: "Ana Silva",
        description: "Payment Confirmed",
        tour_details: "Sunset Tour • 23 Abr",
      },
      {
        id: 2,
        timestamp: "2024-04-23T11:00:00Z",
        event_type: "emails_sent",
        category: "communications",
        display_id: "E1F2G3H4",
        guest_name: "John Doe",
        description: "Confirmation Email Sent",
      },
    ];

    let filtered = logs;
    if (category && category !== "all") {
      filtered = filtered.filter((l) => l.category === category);
    }
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.guest_name.toLowerCase().includes(search.toLowerCase()) ||
          l.display_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json(filtered);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Activity Log API", () => {
  test("getActivityLog fetches all logs when no filters are provided", async () => {
    const result = await getActivityLog();
    expect(result).toHaveLength(2);
    expect(result[0].guest_name).toBe("Ana Silva");
  });

  test("getActivityLog filters by category", async () => {
    const result = await getActivityLog({ category: "payments" });
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("payments");
    expect(result[0].guest_name).toBe("Ana Silva");
  });

  test("getActivityLog filters by search term", async () => {
    const result = await getActivityLog({ search: "John" });
    expect(result).toHaveLength(1);
    expect(result[0].guest_name).toBe("John Doe");
  });

  test("getActivityLog handles both category and search", async () => {
    const result = await getActivityLog({
      category: "payments",
      search: "Ana",
    });
    expect(result).toHaveLength(1);
    expect(result[0].guest_name).toBe("Ana Silva");

    const empty = await getActivityLog({
      category: "communications",
      search: "Ana",
    });
    expect(empty).toHaveLength(0);
  });
});
