"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Image component with automatic fallback to public image when loading fails (404, broken link, offline)
 */
export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  onError,
  unoptimized,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<any>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  const current = hasError ? fallbackSrc : imgSrc;
  const isRemote =
    typeof current === "string" &&
    (current.startsWith("http://") || current.startsWith("https://"));

  return (
    <Image
      {...rest}
      unoptimized={unoptimized !== undefined ? unoptimized : isRemote}
      src={current}
      alt={alt}
      className={className}
      onError={(e) => {
        if (!hasError && imgSrc !== fallbackSrc) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}

export interface ImgWithFallbackProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc: string;
}

/**
 * Standard <img> tag wrapper with automatic fallback to public image
 */
export function ImgWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  onError,
  ...rest
}: ImgWithFallbackProps) {
  const resolvedSrc = typeof src === "string" && src ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const current = typeof src === "string" && src ? src : fallbackSrc;
    setImgSrc(current);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        if (!hasError && imgSrc !== fallbackSrc) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
        onError?.(e);
      }}
    />
  );
}
