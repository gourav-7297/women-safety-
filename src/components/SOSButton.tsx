import { useState, useRef, useEffect } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SOSButtonProps {
  onActivate: () => void;
  isEmergencyMode: boolean;
}

export const SOSButton = ({ onActivate, isEmergencyMode }: SOSButtonProps) => {
  const { t } = useTranslation();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const HOLD_DURATION = 3000; // 3 seconds as per F.A.M. Protocol

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startHold = () => {
    if (isEmergencyMode) return;

    setIsHolding(true);
    setProgress(0);

    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Activation timer
    holdTimeoutRef.current = setTimeout(() => {
      onActivate();
      setIsHolding(false);
      setProgress(0);
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    setIsHolding(false);
    setProgress(0);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative w-64 h-64 rounded-full transition-all duration-500 hover:scale-[1.02]",
          isEmergencyMode ? "animate-pulse" : "animate-pulse-glow"
        )}
      >
        {/* Outer glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isHolding && "animate-ping bg-emergency/20",
            isEmergencyMode && "bg-emergency/30"
          )}
        />

        {/* Progress ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "text-border transition-all duration-300",
              (isHolding || isEmergencyMode) && "text-emergency/30"
            )}
          />
          {isHolding && (
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
              className="text-emergency transition-all duration-100"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Main button */}
        <Button
          size="lg"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          className={cn(
            "absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] rounded-full",
            "flex flex-col items-center justify-center gap-3",
            "text-2xl font-bold tracking-wide",
            "shadow-2xl transition-all duration-500",
            "touch-none select-none",
            isEmergencyMode
              ? "bg-emergency hover:bg-emergency text-emergency-foreground cursor-default shadow-[0_0_60px_rgba(255,50,50,0.6)]"
              : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground active:scale-95 shadow-[0_0_40px_rgba(220,50,100,0.4)] border border-white/20"
          )}
        >
          {isEmergencyMode ? (
            <>
              <AlertCircle className="w-16 h-16" />
              <span className="text-lg">{t('EMERGENCY')}</span>
              <span className="text-sm font-normal">{t('ACTIVE')}</span>
            </>
          ) : (
            <>
              <Shield className="w-16 h-16" />
              <span>{t('HOLD')}</span>
              <span className="text-sm font-normal">{t('FOR SOS')}</span>
            </>
          )}
        </Button>
      </div>

      {!isEmergencyMode && (
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {isHolding ? t('Keep holding...') : t('Press and hold for 3 seconds')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('Triggers emergency alert & location sharing')}
          </p>
        </div>
      )}
    </div>
  );
};
