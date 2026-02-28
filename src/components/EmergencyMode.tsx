import { useState, useEffect } from "react";
import { MapPin, Phone, Users, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface EmergencyModeProps {
  onDeactivate: () => void;
}

export const EmergencyMode = ({ onDeactivate }: EmergencyModeProps) => {
  const [countdown, setCountdown] = useState(10);
  const [cancelCode, setCancelCode] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(true);
  const CANCEL_CODE = "1234"; // In production, this would be user-set

  useEffect(() => {
    if (countdown > 0 && showCancelInput) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowCancelInput(false);
      // In production, this would trigger actual emergency services
    }
  }, [countdown, showCancelInput]);

  const handleCancelAttempt = () => {
    if (cancelCode === CANCEL_CODE) {
      onDeactivate();
    } else {
      setCancelCode("");
      // Show error feedback
    }
  };

  return (
    <div className="fixed inset-0 bg-emergency z-50 flex flex-col">
      {/* Pulsing background effect */}
      <div className="absolute inset-0 bg-emergency animate-pulse opacity-20" />

      <div className="relative flex-1 flex flex-col p-6 text-emergency-foreground">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-24 h-24 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-2">EMERGENCY ACTIVE</h1>
          <p className="text-xl opacity-90">Help is on the way</p>
        </div>

        {/* Countdown & Cancel */}
        {showCancelInput && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-6xl font-bold mb-2">{countdown}</div>
              <p className="text-sm opacity-90">
                Emergency services will be contacted in {countdown} seconds
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter cancel code"
                  value={cancelCode}
                  onChange={(e) => setCancelCode(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg"
                  maxLength={4}
                />
                <Button
                  onClick={handleCancelAttempt}
                  variant="secondary"
                  size="lg"
                  className="shrink-0"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-center opacity-75">
                Enter your 4-digit code to cancel false alarm
              </p>
            </div>
          </Card>
        )}

        {/* Status Cards */}
        <div className="space-y-4 flex-1">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Emergency Services</h3>
                <p className="text-sm opacity-90">
                  {showCancelInput
                    ? "Preparing to call 112..."
                    : "Connected to 112 • Sending your location"}
                </p>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Live Location Sharing</h3>
                <p className="text-sm opacity-90">
                  Broadcasting real-time GPS coordinates
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Lat: 28.6139° N, Long: 77.2090° E
                </p>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Trusted Contacts Notified</h3>
                <p className="text-sm opacity-90">
                  3 contacts alerted via SMS & push notification
                </p>
                <div className="flex gap-2 mt-2">
                  <div className="text-xs bg-white/20 px-2 py-1 rounded">
                    Mom • Delivered
                  </div>
                  <div className="text-xs bg-white/20 px-2 py-1 rounded">
                    Dad • Delivered
                  </div>
                </div>
              </div>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          </Card>
        </div>

        {/* Footer message */}
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm opacity-90">
            Stay calm. Your emergency profile and medical info has been shared.
          </p>
          <Button
            onClick={onDeactivate}
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 h-14 text-lg font-semibold backdrop-blur-sm"
          >
            Cancel Emergency
          </Button>
        </div>
      </div>
    </div>
  );
};
