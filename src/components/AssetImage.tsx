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
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
