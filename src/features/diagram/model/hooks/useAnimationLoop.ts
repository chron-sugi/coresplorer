import { useState, useEffect, useRef } from 'react';

/**
 * useAnimationLoop
 *
 * A hook that provides a continuous animation loop using requestAnimationFrame.
 * Returns the current timestamp, updating on every frame when active.
 *
 * @param isActive - Whether the animation loop should be running
 * @returns number - The current timestamp (performance.now())
 */
export function useAnimationLoop(isActive: boolean): number {
  const [time, setTime] = useState<number>(0);
  const requestRef = useRef<number | undefined>(undefined);
  const animateRef = useRef<(timestamp: number) => void>(() => {});

  // Store the animate function in a ref to avoid closure issues
  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      setTime(timestamp);
      requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
    };
  });

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame((t) => animateRef.current(t));
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive]);

  return time;
}
