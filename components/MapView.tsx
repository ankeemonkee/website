'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import HoverCard from './HoverCard';
import { locations } from '@/data/locations';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface CardState {
  location: typeof locations[0];
  x: number;
  y: number;
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [card, setCard] = useState<CardState | null>(null);

  const hideCard = useCallback(() => setCard(null), []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [18, 50],
      zoom: 3.8,
      minZoom: 2,
      maxZoom: 10,
      projection: { name: 'mercator' },
    });

    map.current.on('load', () => {
      locations.forEach((loc) => {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <div class="marker-ring"></div>
          <div class="marker-dot"></div>
          <span class="marker-label">${loc.name}</span>
        `;

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(loc.coords)
          .addTo(map.current!);

        el.addEventListener('mouseenter', (e) => {
          const rect = el.getBoundingClientRect();
          setCard({
            location: loc,
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
          el.classList.add('active');
        });

        el.addEventListener('mouseleave', () => {
          el.classList.remove('active');
          // Delay so user can move into card
          setTimeout(() => {
            setCard((prev) => {
              if (prev?.location.name === loc.name) return null;
              return prev;
            });
          }, 200);
        });

        markersRef.current.push(marker);
      });
    });

    map.current.on('click', hideCard);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.current?.remove();
    };
  }, [hideCard]);

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {card && (
        <HoverCard
          location={card.location}
          x={card.x}
          y={card.y}
          onMouseLeave={hideCard}
        />
      )}

      <style>{`
        .custom-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }

        .marker-ring {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(4px);
          transition: all 0.25s ease;
          position: relative;
          z-index: 1;
        }

        .marker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.25s ease;
        }

        .marker-label {
          margin-top: 7px;
          font-family: 'DM Mono', 'Courier New', monospace;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          white-space: nowrap;
          transition: color 0.25s ease;
        }

        .custom-marker:hover .marker-ring,
        .custom-marker.active .marker-ring {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.15);
          border-color: #fff;
          box-shadow: 0 0 0 6px rgba(255,255,255,0.06);
        }

        .custom-marker:hover .marker-dot,
        .custom-marker.active .marker-dot {
          background: #fff;
          box-shadow: 0 0 8px rgba(255,255,255,0.8);
        }

        .custom-marker:hover .marker-label,
        .custom-marker.active .marker-label {
          color: rgba(255, 255, 255, 1);
        }

        /* Hide Mapbox attribution for clean look (keep for production if required) */
        .mapboxgl-ctrl-bottom-right {
          opacity: 0.3;
        }
      `}</style>
    </>
  );
}
