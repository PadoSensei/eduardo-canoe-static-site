import { test, expect } from "@playwright/test";

test.describe("SEO and Metadata", () => {
  test("should have correct SEO tags on the home page", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify Title (Portuguese default)
    await expect(page).toHaveTitle(
      /Pipa Canoa Havaiana | Passeios ao Pôr do Sol e Lua Cheia/i
    );

    // Verify Meta Description
    const description = page.locator('meta[name="description"]').last();
    await expect(description).toHaveAttribute(
      "content",
      /Experimente a magia de Pipa a partir da água/i
    );

    // Verify OpenGraph tags
    const ogTitle = page.locator('meta[property="og:title"]').last();
    await expect(ogTitle).toHaveAttribute(
      "content",
      /Pipa Canoa Havaiana | Passeios ao Pôr do Sol e Lua Cheia/i
    );

    const ogImage = page.locator('meta[property="og:image"]').last();
    await expect(ogImage).toHaveAttribute(
      "content",
      /https:\/\/pipacanoahavaiana.com.br\/img\/sunset_pic.webp/
    );

    // Verify JSON-LD Structured Data
    const jsonLd = await page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    const data = JSON.parse(content || "{}");

    // In our implementation, structuredData is an object with @context and @graph
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"][0]["@type"]).toBe("LocalBusiness");
    expect(data["@graph"][0]["name"]).toBe("Pipa Canoa Havaiana");
    expect(data["@graph"][0]["geo"]["latitude"]).toBe(-6.1868);
  });

  test("should update SEO tags when navigating to About page", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(page).toHaveTitle(/Conheça o Edu | Seu Capitão em Pipa/i);

    const description = page.locator('meta[name="description"]').last();
    await expect(description).toHaveAttribute(
      "content",
      /Saiba mais sobre a jornada de Eduardo/i
    );

    const ogImage = page.locator('meta[property="og:image"]').last();
    await expect(ogImage).toHaveAttribute(
      "content",
      /https:\/\/pipacanoahavaiana.com.br\/img\/Edu_Cover.webp/
    );
  });
});
