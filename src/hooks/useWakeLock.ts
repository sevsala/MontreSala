import { useEffect, useRef } from 'react';

/**
 * Screen Wake Lock hook:
 * Keeps the screen awake indefinitely on smart displays, tablets, or wall-mounted monitors.
 * Automatically re-acquires the lock if visibility changes.
 * Safely degrades on legacy devices without throwing errors.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // Wake Lock may be rejected if battery is low or not supported, ignore silently
      }
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current && wakeLockRef.current.release) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);
}
