import { useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CheckInTimerProps {
  duration: number; // in seconds
  onTimeout: () => void;
  onCheckIn: () => void;
  label?: string;
}

export const CheckInTimer = ({ duration, onTimeout, onCheckIn, label = "Check-In Timer Active" }: CheckInTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const totalSeconds = duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-safe/10 border-primary/20 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{label}</h3>
          </div>
          {timeLeft <= 60 && (
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full animate-pulse">
              Low time!
            </span>
          )}
        </div>

        <div className="text-center py-4">
          <div className="text-4xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {timeLeft <= 60
              ? "Check in now or emergency contacts will be alerted!"
              : "Time until auto-alert"
            }
          </p>
        </div>

        <Progress value={progress} className="h-2" />

        <Button onClick={onCheckIn} className="w-full" size="lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          I'm Safe - Check In
        </Button>
      </div>
    </Card>
  );
};
