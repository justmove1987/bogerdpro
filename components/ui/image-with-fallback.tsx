"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc: string;
};

export function ImageWithFallback({ fallbackSrc, src, alt, ...props }: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src);

  return <Image {...props} src={imageSrc} alt={alt} onError={() => setImageSrc(fallbackSrc)} />;
}
