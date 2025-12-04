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
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      // We can use delta time here if needed
      // const deltaTime = time - previousTimeRef.current;
    }
    previousTimeRef.current = time;
    setTime(time);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
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
