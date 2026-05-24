"use client";

import Image from "next/image";
import { useState } from "react";

interface AssetImageProps {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

function isSvgSrc(path: string): boolean {
  return path.split("?")[0].toLowerCase().endsWith(".svg");
}

export default function AssetImage({
  src,
  fallback,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
  sizes,
}: AssetImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (currentSrc !== fallback) setCurrentSrc(fallback);
  };

  if (isSvgSrc(currentSrc)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className}`}
          onError={handleError}
          draggable={false}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        draggable={false}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={handleError}
    />
  );
}
