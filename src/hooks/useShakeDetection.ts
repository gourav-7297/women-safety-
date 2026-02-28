import { useEffect, useRef, useCallback } from 'react';

interface ShakeDetectionOptions {
    threshold?: number; // Acceleration threshold (default: 15)
    duration?: number;  // Required continuous shake duration in ms (default: 4000)
    isEnabled?: boolean;
}

export const useShakeDetection = (
    onShake: () => void,
    options: ShakeDetectionOptions = {}
) => {
    const { threshold = 15, duration = 4000, isEnabled = true } = options;

    const shakeStartTime = useRef<number | null>(null);
    const lastShakeTime = useRef<number | null>(null);

    const handleMotion = useCallback((event: DeviceMotionEvent) => {
        if (!isEnabled) return;

        const current = event.accelerationIncludingGravity;
        if (!current) return;

        const { x, y, z } = current;
        if (x === null || y === null || z === null) return;

        // Calculate magnitude of acceleration vector
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        // Subtract gravity (approx 9.8) to get user acceleration
        const force = Math.abs(acceleration - 9.8);

        const now = Date.now();

        if (force > threshold) {
            // It's a valid shake movement
            if (!shakeStartTime.current) {
                // First shake in a while
                shakeStartTime.current = now;
            } else {
                // Determine if we've been shaking long enough
                const elapsed = now - shakeStartTime.current;

                if (elapsed >= duration) {
                    onShake();
                    // Reset to prevent repeated triggering immediately
                    shakeStartTime.current = null;
                }
            }
            lastShakeTime.current = now;
        } else {
            // Check if we lost the shake sequence (e.g. paused for > 1 second)
            if (lastShakeTime.current && (now - lastShakeTime.current > 1000)) {
                shakeStartTime.current = null; // Reset continuous shake tracking
            }
        }
    }, [isEnabled, threshold, duration, onShake]);

    useEffect(() => {
        if (!isEnabled) return;

        window.addEventListener('devicemotion', handleMotion);
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [isEnabled, handleMotion]);

    return { isSupported: 'DeviceMotionEvent' in window };
};
