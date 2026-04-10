import { formatCurrency } from "@/utils/formatters";

describe("formatCurrency", () => {
  test("formats positive numbers correctly in pt-BR", () => {
    // Note: use toBe because we expect exact string matching including non-breaking spaces if any
    // Different environments might use different space characters (e.g., \u00A0)
    const result = formatCurrency(1250.5);
    // R$ 1.250,50
    expect(result).toMatch(/R\$\s1\.250,50/);
  });

  test("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/R\$\s0,00/);
  });

  test("formats large numbers with correct separators", () => {
    const result = formatCurrency(1000000);
    expect(result).toMatch(/R\$\s1\.000\.000,00/);
  });
});
