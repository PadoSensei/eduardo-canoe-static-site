import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PaymentView } from "../../src/components/booking/PaymentView";
import { LanguageProvider } from "../../src/context/LanguageContext";

const mockPaymentInfo = {
  qr_code: "00020126360014BR.GOV.BCB.PIX0114MOCKKEY123",
  qr_code_image: "https://example.com/qr.png",
};

const renderPaymentView = (props = {}) => {
  return render(
    <LanguageProvider>
      <PaymentView
        paymentInfo={mockPaymentInfo}
        onClose={jest.fn()}
        {...props}
      />
    </LanguageProvider>
  );
};

describe("PaymentView Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("copies Pix key to clipboard and shows feedback", async () => {
    renderPaymentView();

    // 1. Find the copy button — component renders "Copiar Código Pix"
    const copyBtn = screen.getByRole("button", { name: /copiar código pix/i });

    // 2. Click it
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // 3. Assert: navigator.clipboard.writeText was called correctly
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockPaymentInfo.qr_code
    );

    // 4. Assert: UI changes to "Copiado" state (Portuguese feedback)
    //    Use queryByRole so we're checking the button label changed,
    //    falling back to queryByText if the component shows a separate element.
    expect(
      screen.getByRole("button", { name: /copiado/i })
    ).toBeInTheDocument();

    // 5. Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // 6. Assert: UI reverts back to "Copiar Código Pix"
    expect(
      screen.getByRole("button", { name: /copiar código pix/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /copiado/i })
    ).not.toBeInTheDocument();
  });

  test("renders the timeout screen when hasConnectionIssue is true", () => {
    renderPaymentView({ hasConnectionIssue: true });

    // Component renders in Portuguese — confirmed from error output HTML
    expect(
      screen.getByText(/tempo de pagamento expirado/i)
    ).toBeInTheDocument();
  });

  test("does not render connection warning by default", () => {
    renderPaymentView({ hasConnectionIssue: false });

    // Component renders in Portuguese — check for absence of timeout heading
    expect(
      screen.queryByText(/tempo de pagamento expirado/i)
    ).not.toBeInTheDocument();
  });
});
