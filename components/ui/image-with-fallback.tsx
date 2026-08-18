"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc: string;
};

export function ImageWithFallback({ fallbackSrc, src, alt, ...props }: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const imageSrc = failedSrc === src ? fallbackSrc : src;

  return <Image {...props} src={imageSrc} alt={alt} onError={() => setFailedSrc(src)} />;
}
