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

    // 1. Find the copy button SPECIFICALLY (ignores the text in the <p> tag)
    const copyBtn = screen.getByRole("button", { name: /copy/i });

    // 2. Click it
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // 3. Assert: navigator.clipboard.writeText was called correctly
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockPaymentInfo.qr_code
    );

    // 4. Assert: UI changes to "Copied" state
    expect(screen.getByText(/Code Copied!/i)).toBeInTheDocument();

    // 5. Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // 6. Assert: UI reverts back to "Copy" state on the button
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByText(/Code Copied!/i)).not.toBeInTheDocument();
  });

  test("renders the timeout screen when hasConnectionIssue is true", () => {
    renderPaymentView({ hasConnectionIssue: true });
    // The component renders translations key in test env or actual text if not mocked correctly.
    // In our case it seems it's rendering "Payment Timeout" (actual text)
    expect(screen.getByText(/Payment Timeout/i)).toBeInTheDocument();
  });

  test("does not render connection warning by default", () => {
    renderPaymentView({ hasConnectionIssue: false });
    expect(screen.queryByText(/connection slow/i)).not.toBeInTheDocument();
  });
});
