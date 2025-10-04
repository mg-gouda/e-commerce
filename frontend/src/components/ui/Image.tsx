'use client';

import NextImage from 'next/image';
import { useState } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function Image({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
}: ImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Construct the full image URL
  const getImageUrl = (imageSrc: string): string => {
    // If already a full URL (starts with http), return as is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }

    // If it's a data URI (base64 encoded), return as is
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }

    // If it starts with /static/, prepend the API URL
    if (imageSrc.startsWith('/static/')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${apiUrl}${imageSrc}`;
    }

    // If it starts with /uploads/, convert to /static/ and prepend API URL
    if (imageSrc.startsWith('/uploads/')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const staticPath = imageSrc.replace('/uploads/', '/static/');
      return `${apiUrl}${staticPath}`;
    }

    // Default: assume it's a path that needs API URL prepended
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return `${apiUrl}/static/${imageSrc}`;
  };

  const imageUrl = getImageUrl(src);

  // Fallback image when error occurs
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';

  if (imageError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        <NextImage
          src={fallbackImage}
          alt="Image not found"
          width={width || 400}
          height={height || 400}
          className={className}
        />
      </div>
    );
  }

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <NextImage
          src={imageUrl}
          alt={alt}
          fill
          style={{ objectFit }}
          priority={priority}
          onError={() => setImageError(true)}
          onLoad={() => setIsLoading(false)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      <NextImage
        src={imageUrl}
        alt={alt}
        width={width || 400}
        height={height || 400}
        className={className}
        priority={priority}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized
      />
    </div>
  );
}
