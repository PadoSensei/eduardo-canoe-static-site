import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShieldedButton from "../../../src/components/common/ShieldedButton";

describe("ShieldedButton", () => {
  jest.useFakeTimers();

  it("triggers onClick handler once when clicked", async () => {
    const handleClick = jest.fn();
    render(<ShieldedButton onClick={handleClick}>Click Me</ShieldedButton>);

    const button = screen.getByText("Click Me");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("ignores additional clicks for 1000ms after the first click", async () => {
    const handleClick = jest.fn();
    render(<ShieldedButton onClick={handleClick}>Click Me</ShieldedButton>);

    const button = screen.getByText("Click Me");

    // First click
    await act(async () => {
      fireEvent.click(button);
    });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Rapid-fire second click (100ms later)
    await act(async () => {
      jest.advanceTimersByTime(100);
      fireEvent.click(button);
    });
    expect(handleClick).toHaveBeenCalledTimes(1); // Still 1

    // Another click (500ms later)
    await act(async () => {
      jest.advanceTimersByTime(500);
      fireEvent.click(button);
    });
    expect(handleClick).toHaveBeenCalledTimes(1); // Still 1

    // After 1000ms cooldown
    await act(async () => {
      jest.advanceTimersByTime(401); // Total 1001ms
    });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(handleClick).toHaveBeenCalledTimes(2); // Now 2
  });

  it("stays disabled during cooldown even if isProcessing is false", async () => {
    const handleClick = jest.fn(() => Promise.resolve());
    render(<ShieldedButton onClick={handleClick}>Click Me</ShieldedButton>);

    const button = screen.getByRole("button");

    // Click and wait for promise to resolve but stay in cooldown
    await act(async () => {
      fireEvent.click(button);
    });

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();

    // Advance 500ms, should still be disabled
    await act(async () => {
      jest.advanceTimersByTime(500);
      fireEvent.click(button);
    });
    expect(button).toBeDisabled();
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Advance to 1001ms, should be enabled
    await act(async () => {
      jest.advanceTimersByTime(501);
    });
    expect(button).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(button);
    });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("shows loading spinner when isLoading prop is true", () => {
    render(<ShieldedButton isLoading={true}>Click Me</ShieldedButton>);
    expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
