'use client';
import { useEffect, useState } from 'react';

const COLORS = ['#00E701', '#FFD700', '#1475E1', '#8B5CF6', '#F0443C', '#FFB800'];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

export function Confetti({ show, onDone }: { show: boolean; onDone?: () => void }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    const ps: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      size: 6 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 80,
    }));
    setParticles(ps);

    const timer = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onDone]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
