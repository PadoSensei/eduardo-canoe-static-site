/**
 * Formats a numeric value as BRL currency (R$).
 * @param value The amount to format
 * @returns Formatted string (e.g., R$ 1.250,00)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
