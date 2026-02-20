import { useEffect, useState, useCallback } from 'react';

interface ShakeDetectionOptions {
    threshold?: number; // Acceleration threshold (default: 15)
    timeout?: number;   // Time between shakes in ms (default: 1000)
    isEnabled?: boolean;
}

export const useShakeDetection = (
    onShake: () => void,
    options: ShakeDetectionOptions = {}
) => {
    const { threshold = 15, timeout = 1000, isEnabled = true } = options;

    const [lastShake, setLastShake] = useState(0);

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

        if (force > threshold) {
            const now = Date.now();
            if (now - lastShake > timeout) {
                setLastShake(now);
                onShake();
            }
        }
    }, [isEnabled, threshold, timeout, lastShake, onShake]);

    useEffect(() => {
        if (!isEnabled) return;

        window.addEventListener('devicemotion', handleMotion);
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [isEnabled, handleMotion]);

    return { isSupported: 'DeviceMotionEvent' in window };
};
