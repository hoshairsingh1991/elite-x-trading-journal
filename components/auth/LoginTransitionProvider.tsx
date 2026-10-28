"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

type LoginTransitionContextValue = {
  startLoginTransition: () => Promise<void>;
};

const LoginTransitionContext =
  createContext<LoginTransitionContextValue | null>(null);

const TRANSITION_DURATION_MS = 2800;

export function LoginTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const startLoginTransition = useCallback((): Promise<void> => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setIsVisible(true);

    timeoutRef.current = setTimeout(
      () => {
        setIsVisible(false);
        timeoutRef.current = null;
      },
      prefersReducedMotion ? 100 : TRANSITION_DURATION_MS
    );

    // Give React and the browser an opportunity to render the overlay
    // before the login handler starts navigating to the dashboard.
    return new Promise<void>((resolve) => {
      let completed = false;

      function finish() {
        if (completed) return;

        completed = true;
        window.clearTimeout(fallbackId);
        resolve();
      }

      const fallbackId = window.setTimeout(finish, 100);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(finish);
      });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <LoginTransitionContext.Provider
      value={{ startLoginTransition }}
    >
      {children}

      {isVisible && (
        <div
          className="login-transition-overlay"
          role="status"
          aria-label="Preparing your Elite X workspace"
        >
          <div className="login-transition-content">
            <svg
              aria-hidden="true"
              className="login-transition-chart"
              viewBox="0 0 120 60"
              fill="none"
            >
              <path
                d="M8 46 L29 34 L43 39 L63 19 L79 27 L108 9"
                pathLength={100}
                className="login-transition-chart-line"
              />

              <circle
                cx="108"
                cy="9"
                r="3"
                className="login-transition-chart-point"
              />
            </svg>

            <div className="login-transition-wordmark">
              <span>Elite</span>
              <span className="login-transition-x">X</span>
            </div>

            <p className="login-transition-subtitle">
              TRADING JOURNAL
            </p>

            <div className="login-transition-caption">
              <span className="login-transition-status-dot" />
              <span>PREPARING YOUR WORKSPACE</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
.login-transition-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  pointer-events: none;
  background: #040914;

  animation-name: login-transition-fade;
  animation-duration: ${TRANSITION_DURATION_MS + "ms"};
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: forwards;
}

.login-transition-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  background: radial-gradient(
    circle at 50% 44%,
    rgba(79, 140, 255, 0.12) 0%,
    transparent 32%
  );

  opacity: 0.7;
  animation: login-transition-glow 1800ms ease-in-out infinite alternate;
}

.login-transition-content {
  position: relative;
  top: 16px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  animation: login-content-reveal 480ms
    cubic-bezier(0.22, 1, 0.36, 1)
    both;
}

        .login-transition-chart {
          width: 100px;
          height: 50px;
          margin-bottom: 20px;
          overflow: visible;
          filter: drop-shadow(
            0 0 12px rgba(79, 140, 255, 0.16)
          );
        }

.login-transition-chart-line {
  stroke: #62a5ff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;

  animation-name: login-chart-draw;
  animation-duration: 1900ms;
  animation-delay: 0ms;
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: forwards;
}

.login-transition-chart-point {
  fill: #8bd5ff;
  opacity: 0;

  filter:
    drop-shadow(0 0 4px rgba(139, 213, 255, 0.9))
    drop-shadow(0 0 9px rgba(79, 140, 255, 0.65));

  animation-name: login-chart-point-reveal;
  animation-duration: 180ms;
  animation-delay: 1450ms;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

        .login-transition-wordmark {
          display: flex;
          align-items: baseline;
          color: #f8fafc;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.06em;
          line-height: 1;
        }

        .login-transition-x {
          margin-left: 5px;
          color: #4f8cff;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .login-transition-subtitle {
          margin-top: 9px;
          color: rgba(203, 213, 225, 0.72);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.34em;
        }

        .login-transition-caption {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 34px;
          color: #8290a5;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .login-transition-status-dot {
          width: 5px;
          height: 5px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #62a5ff;
          box-shadow: 0 0 10px rgba(98, 165, 255, 0.65);
          animation: login-status-pulse 1s ease-in-out infinite;
        }

@keyframes login-transition-glow {
  from {
    opacity: 0.55;
  }

  to {
    opacity: 0.95;
  }
}

@keyframes login-transition-fade {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  96% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

        @keyframes login-content-reveal {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes login-chart-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes login-chart-point-reveal {
          to {
            opacity: 1;
          }
        }

        @keyframes login-status-pulse {
          0%,
          100% {
            opacity: 0.5;
          }

          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
.login-transition-overlay,
.login-transition-overlay::before,
.login-transition-content,
.login-transition-chart-line,
.login-transition-chart-point,
.login-transition-status-dot {
  animation: none !important;
}

          .login-transition-overlay {
            opacity: 1;
          }

          .login-transition-content {
            opacity: 1;
            transform: none;
          }

          .login-transition-chart-line {
            stroke-dashoffset: 0;
          }

          .login-transition-chart-point {
            opacity: 1;
          }
        }
      `}</style>
    </LoginTransitionContext.Provider>
  );
}

export function useLoginTransition() {
  const context = useContext(LoginTransitionContext);

  if (!context) {
    throw new Error(
      "useLoginTransition must be used within LoginTransitionProvider"
    );
  }

  return context;
}
