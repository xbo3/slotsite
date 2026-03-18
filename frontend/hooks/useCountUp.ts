'use client';

import { useState, useEffect, useRef } from 'react';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(end: number, duration: number = 800): number {
  const [current, setCurrent] = useState(0);
  const prevEnd = useRef(end);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const startVal = prevEnd.current !== end ? 0 : current;
    prevEnd.current = end;

    if (end === 0) {
      setCurrent(0);
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const value = startVal + (end - startVal) * easedProgress;
      setCurrent(value);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setCurrent(end);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration]);

  return current;
}
