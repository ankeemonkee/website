'use client';

import { useEffect, useRef, useState } from 'react';
import { locations } from '@/data/locations';

interface Props {
  location: typeof locations[0];
  x: number;
  y: number;
  onMouseLeave: () => void;
}

export default function HoverCard({ location, x, y, onMouseLeave }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [location.name]);

  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const vw = window.innerWidth;
    const cardW = 260;
    const cardH = card.offsetHeight || 220;
    const margin = 16;

    let cx = x - cardW / 2;
    let cy = y - cardH - 18;

    if (cx + cardW > vw - margin) cx = vw - cardW - margin;
    if (cx < margin) cx = margin;
    if (cy < margin) cy = y + 40;

    setPos({ x: cx, y: cy });
  }, [x, y, location]);

  return (
    <div
      ref={cardRef}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 260,
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Photo grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, height: 130 }}>
        {location.photos.map((photo, i) => (
          <div
            key={i}
            style={{
              background: `url(${photo}) center/cover no-repeat`,
              backgroundColor: '#1a1a1a',
              gridColumn: i === 0 ? 'span 2' : 'span 1',
            }}
          />
        ))}
      </div>

      {/* Label */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{
          margin: 0,
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 4,
        }}>
          {location.country}
        </p>
        <p style={{
          margin: 0,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 20,
          fontWeight: 300,
          color: '#fff',
          letterSpacing: '0.02em',
          lineHeight: 1.2,
        }}>
          {location.name}
        </p>
        <p style={{
          margin: '6px 0 0',
          fontFamily: "'DM Mono', 'Courier New', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.08em',
        }}>
          {location.photoCount} photos
        </p>
      </div>
    </div>
  );
}
