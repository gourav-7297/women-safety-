import { useRef, useCallback, useEffect } from 'react';

export const useSiren = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPlayingRef = useRef(false);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playSiren = useCallback(() => {
        if (isPlayingRef.current) return;
        initAudio();

        const ctx = audioCtxRef.current;
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Create fresh nodes for every playback
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; // Harsh, loud waveform

        // Connect nodes: Oscillator -> Gain -> Destination(Speakers)
        osc.connect(gain);
        gain.connect(ctx.destination);

        // Initial frequency (High pitch)
        let freqToggle = false;
        osc.frequency.setValueAtTime(800, ctx.currentTime);

        // Max volume
        gain.gain.setValueAtTime(1, ctx.currentTime);

        // Start playing
        osc.start();

        // Toggle frequency every 400ms to simulate European police siren (Hi-Lo alternating)
        intervalRef.current = setInterval(() => {
            freqToggle = !freqToggle;
            // Abrupt transition
            osc.frequency.setValueAtTime(freqToggle ? 1000 : 800, ctx.currentTime);
        }, 400);

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        isPlayingRef.current = true;
    }, [initAudio]);

    const stopSiren = useCallback(() => {
        if (!isPlayingRef.current) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (oscillatorRef.current && gainNodeRef.current) {
            // Fade out slightly to prevent speaker pop
            if (audioCtxRef.current) {
                gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.015);
                setTimeout(() => {
                    oscillatorRef.current?.stop();
                    oscillatorRef.current?.disconnect();
                    gainNodeRef.current?.disconnect();
                }, 50);
            }
        }
        isPlayingRef.current = false;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopSiren();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, [stopSiren]);

    return { playSiren, stopSiren };
};
