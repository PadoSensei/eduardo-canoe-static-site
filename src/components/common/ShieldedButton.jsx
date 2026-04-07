import React, { useState, useEffect, useRef } from "react";

/**
 * ShieldedButton - A reusable button that prevents double-submissions.
 * It stays disabled for at least 1000ms after the first click.
 */
const ShieldedButton = ({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);

  const handleClick = async (e) => {
    if (isProcessing || isCooldown || isLoading || disabled) {
      return;
    }

    setIsProcessing(true);
    setIsCooldown(true);

    // Start 1000ms cooldown immediately
    cooldownTimerRef.current = setTimeout(() => {
      setIsCooldown(false);
    }, 1000);

    if (onClick) {
      try {
        await onClick(e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const showLoading = isProcessing || isLoading;
  const isButtonDisabled = disabled || isProcessing || isCooldown || isLoading;

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`relative flex items-center justify-center transition-all ${className} ${
        isButtonDisabled ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {showLoading && (
        <svg
          className="absolute w-5 h-5 text-current animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="button-spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className={showLoading ? "invisible" : "visible"}>{children}</span>
    </button>
  );
};

export default ShieldedButton;
