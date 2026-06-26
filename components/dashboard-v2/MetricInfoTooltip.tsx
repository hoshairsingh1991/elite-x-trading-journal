import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";



type MetricInfoTooltipProps = {
  definition: string;
  formula: string;
  calculation: string;
  interpretation: string;

  className?: string;
};

export default function MetricInfoTooltip({
  definition,
  formula,
  calculation,
  interpretation,
  className,
}: MetricInfoTooltipProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [portalReady, setPortalReady] =
    useState(false);

  const triggerRef =
    useRef<HTMLDivElement>(null);

  const tooltipRef =
    useRef<HTMLDivElement>(null);

  const closeTimeout =
    useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPortalReady(true);

    return () => {
      if (closeTimeout.current) {
        clearTimeout(
          closeTimeout.current
        );
      }
    };
  }, []);

  const openTooltip = () => {
    if (closeTimeout.current) {
      clearTimeout(
        closeTimeout.current
      );
    }

    setIsOpen(true);
  };

  const closeTooltip = () => {
    closeTimeout.current =
      setTimeout(() => {
        setIsOpen(false);
      }, 80);
  };

  const rect =
    triggerRef.current?.getBoundingClientRect();

  const tooltip = isOpen &&
    portalReady &&
    rect
      ? createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            className="
              fixed
              z-[999999]
              rounded-[16px]
              border
              border-cyan-500/20
              bg-[#081526]
              px-7
              py-6
              shadow-[0_12px_40px_rgba(0,0,0,0.55)]
            "
style={{
  top: rect.bottom + 12,
  left: rect.left,
  width: "400px",
}}
          >
            <div className="h-3" />
            <div
              className="
                space-y-4
                text-center
              "
            >
              <div>
                <p
                  className="
                    mb-1
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Definition
                </p>

                <p
                  className="
                    text-[13px]
                    text-slate-200
                  "
                >
                  {definition}
                </p>
                
              </div>
 <div className="h-2" />
              <div>
                <p
                  className="
                    mb-1
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Formula
                </p>

                <p
                  className="
                    text-[13px]
                    text-slate-200
                  "
                >
                  {formula}
                </p>
              </div>
 <div className="h-2" />
              <div>
                <p
                  className="
                    mb-1
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Your Calculation
                </p>

                <p
                  className="
                    text-[13px]
                    text-slate-300
                  "
                >
                  {calculation}
                </p>
              </div>
 <div className="h-2" />
              <div>
                <p
                  className="
                    mb-1
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Interpretation
                </p>

                <p
                  className="
                    text-[13px]
                    text-slate-300
                  "
                >
                  {interpretation}
                </p>
              </div>

              <div className="h-2" />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
  ref={triggerRef}
  className={`
    relative
    -translate-x-1
    -translate-y-0.3

    ${className ?? ""}
  `}
  onMouseEnter={openTooltip}
  onMouseLeave={closeTooltip}
>
        <button
          type="button"
          className="
            flex
            h-3
            w-3
            items-center
            justify-center
            rounded-full
            border
            border-slate-600
            text-[10px]
            text-slate-400
            transition-colors
            hover:border-cyan-400
            hover:text-cyan-400
          "
        >
          i
        </button>
      </div>

      {tooltip}
    </>
  );
}