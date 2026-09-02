'use client';

import { useState } from 'react';

export default function PosterThumb({ src, alt, color }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className="poster-fallback"
        style={{ background: `linear-gradient(160deg, ${color} 0%, #0a0a0c 85%)` }}
      >
        <style jsx>{`
          .poster-fallback {
            width: 100%; height: 100%; border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.12);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="poster-thumb" onError={() => setError(true)} />
      <style jsx>{`
        .poster-thumb {
          width: 100%; height: 100%; object-fit: cover; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12); display: block;
        }
      `}</style>
    </>
  );
}
