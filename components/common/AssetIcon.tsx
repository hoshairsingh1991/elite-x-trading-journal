"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  resolveAssetIcon,
} from "@/lib/assets/assetIconResolver";

interface AssetIconProps {
  ticker: string;
  assetType?: string;
  contractKey?: string;
  exchange?: string;

  size?:
    | "sm"
    | "md"
    | "lg";

  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    wrapper: "h-5 w-5",
    text: "text-[9px]",
  },

  md: {
    wrapper: "h-6 w-6",
    text: "text-[10px]",
  },

  lg: {
    wrapper: "h-8 w-8",
    text: "text-[11px]",
  },
} as const;

export default function AssetIcon({
  ticker,
  assetType,
  contractKey,
  exchange,
  size = "sm",
  className = "",
}: AssetIconProps) {
  const resolution =
    resolveAssetIcon({
      ticker,
      assetType,
      contractKey,
      exchange,
    });

  const [imageFailed, setImageFailed] =
    useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [
    resolution?.src,
  ]);

  const sizeClasses =
    SIZE_CLASSES[size];

  const showFallback =
    !resolution ||
    imageFailed;

  return (
    <div
      className={`
        ${sizeClasses.wrapper}
        shrink-0
        overflow-hidden
        rounded-full
        border
        border-white/[0.08]
        bg-white/[0.04]
        ${className}
      `}
      aria-label={`${ticker} asset icon`}
    >
      {showFallback ? (
        <div
          className={`
            flex
            h-full
            w-full
            items-center
            justify-center
            ${sizeClasses.text}
            font-semibold
            text-slate-300
          `}
        >
          {
            resolution?.fallbackText ??
            ticker
              .trim()
              .charAt(0)
              .toUpperCase()
          }
        </div>
      ) : (
        <img
          src={resolution.src}
          alt={resolution.alt}
          className="
            h-full
            w-full
            object-contain
          "
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => {
            setImageFailed(true);
          }}
        />
      )}
    </div>
  );
}