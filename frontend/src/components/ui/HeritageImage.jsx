import React, { useState } from 'react';

/**
 * HeritageImage — renders heritage images with graceful fallback
 * Tries multiple image extensions and falls back to a styled placeholder
 */
export default function HeritageImage({
  folder,
  alt,
  className,
  style,
  placeholderEmoji = '🏛',
  placeholderBg = 'linear-gradient(135deg, #2C1A0E, #1B6B6B)',
  height,
}) {
  const [error, setError] = useState(false);
  const [triedIdx, setTriedIdx] = useState(0);

  // Build candidate paths from folder
  const candidates = folder ? [
    `${folder}/1.jpg`,
    `${folder}/1.jpeg`,
    `${folder}/1.png`,
    `${folder}/2.jpg`,
    `${folder}/image.jpg`,
    `${folder}/photo.jpg`,
    `${folder}/main.jpg`,
  ] : [];

  const handleError = () => {
    if (triedIdx < candidates.length - 1) {
      setTriedIdx(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  if (error || candidates.length === 0) {
    return (
      <div
        className={className}
        style={{
          background: placeholderBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: height ? height * 0.35 : 64,
          height: height || 'auto',
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        {placeholderEmoji}
      </div>
    );
  }

  return (
    <img
      src={candidates[triedIdx]}
      alt={alt}
      className={className}
      style={{ height, objectFit: 'cover', ...style }}
      onError={handleError}
    />
  );
}
