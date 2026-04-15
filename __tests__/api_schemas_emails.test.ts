import { EmailSettingSchema } from "../src/api/schemas";

describe("EmailSettingSchema", () => {
  it("should validate a correct email setting", () => {
    const validData = {
      slug: "admin_daily_manifest",
      display_name: "Daily Manifest",
      description: "Send daily manifest to admin",
      is_enabled: true,
      scheduled_time: "08:00:00",
    };
    const result = EmailSettingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should handle null values for scheduled_time", () => {
    const dataWithNullTime = {
      slug: "guest_confirmation",
      display_name: "Guest Confirmation",
      description: "Send confirmation to guest",
      is_enabled: true,
      scheduled_time: null,
    };
    const result = EmailSettingSchema.safeParse(dataWithNullTime);
    expect(result.success).toBe(true);
  });

  it("should fail if scheduled_time is missing", () => {
    const invalidData = {
      slug: "guest_confirmation",
      display_name: "Guest Confirmation",
      description: "Send confirmation to guest",
      is_enabled: true,
    };
    const result = EmailSettingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail if is_enabled is not a boolean", () => {
    const invalidData = {
      slug: "guest_confirmation",
      display_name: "Guest Confirmation",
      description: "Send confirmation to guest",
      is_enabled: "yes",
      scheduled_time: null,
    };
    const result = EmailSettingSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
