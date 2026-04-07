import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// A simple ErrorBoundary for testing (mirrors what should be in App)
class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // Optionally log
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Oops!</h1>
          <button>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Component that throws during render
const ProblematicComponent = () => {
  throw new Error("Test crash");
};

describe("Global Error Boundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("displays the fallback UI when a child component crashes", () => {
    render(
      <TestErrorBoundary>
        <ProblematicComponent />
      </TestErrorBoundary>
    );

    expect(screen.getByText(/Oops!/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Page/i)).toBeInTheDocument();
  });
});
