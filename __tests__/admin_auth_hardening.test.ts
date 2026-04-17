import { fetchDayManifest } from "../src/api";
import { supabase } from "../src/supabaseClient";

jest.mock("../src/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("../src/core/config", () => ({
  __esModule: true,
  default: {
    apiBaseUrl: "http://localhost:8000/api/v1",
    isProduction: false,
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Admin Auth Hardening", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw MISSING_AUTH_SESSION if includeAuth is true but no session exists", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(fetchDayManifest("2024-05-20")).rejects.toThrow(
      "MISSING_AUTH_SESSION"
    );
  });

  it("should attach Authorization header if session exists", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "fake-token" } },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [], // ManifestResponseSchema expects an array
    });

    await fetchDayManifest("2024-05-20");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/admin/manifest/2024-05-20"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("should log auth status in dev mode", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: "fake-token" } },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await fetchDayManifest("2024-05-20");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "🔐 Auth Status for /admin/manifest/2024-05-20: TOKEN_ATTACHED"
      )
    );

    consoleSpy.mockRestore();
  });
});
