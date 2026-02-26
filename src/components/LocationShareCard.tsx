import { MapPin, Share2, Copy, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface LocationShareCardProps {
  isActive: boolean;
  duration?: number;
  onToggle: () => void;
}

export const LocationShareCard = ({ isActive, duration = 30, onToggle }: LocationShareCardProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (isActive && !sessionId && !isStarting) {
      startSharing();
    } else if (!isActive && sessionId) {
      stopSharing();
    }

    // Cleanup on unmount
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const startSharing = async () => {
    setIsStarting(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsStarting(false);
      onToggle(); // turn off
      return;
    }

    try {
      // 1. Get initial position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      // 2. Create session in DB
      const { data, error } = await supabase
        .from('safety_sessions')
        .insert([{
          type: 'general_share',
          destination: 'N/A',
          last_known_lat: position.coords.latitude,
          last_known_lng: position.coords.longitude,
          estimated_duration_mins: duration,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);

      // 3. Start watching position
      const id = navigator.geolocation.watchPosition(
        async (pos) => {
          if (data.id) {
            await supabase
              .from('safety_sessions')
              .update({
                last_known_lat: pos.coords.latitude,
                last_known_lng: pos.coords.longitude,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.id);
          }
        },
        (err) => console.error("Watch position error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      setWatchId(id);
      toast.success("Live Location Active");

    } catch (error) {
      console.error("Error starting location share:", error);
      toast.error("Failed to start location sharing");
      onToggle(); // Turn off visually if it failed
    } finally {
      setIsStarting(false);
    }
  };

  const stopSharing = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (sessionId) {
      try {
        await supabase
          .from('safety_sessions')
          .update({ status: 'ended' })
          .eq('id', sessionId);
      } catch (error) {
        console.error("Error ending session:", error);
      }
      setSessionId(null);
    }
  };

  const shareUrl = sessionId ? `${window.location.origin}/share/${sessionId}` : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Live tracking link copied");
  };

  const handleShare = () => {
    if (!shareUrl) return;
    if (navigator.share) {
      navigator.share({
        title: "SafeGuard - My Location",
        text: "I'm sharing my live location with you for safety.",
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className={`p-5 transition-all ${isActive
      ? "bg-gradient-to-br from-safe/20 to-primary/10 border-safe/30 animate-fade-in"
      : "bg-card"
      }`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className={`w-5 h-5 ${isActive ? "text-safe" : "text-muted-foreground"}`} />
              <h3 className="font-semibold">Location Sharing</h3>
              {isActive && (
                <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? `Active for ${duration} minutes • Real-time tracking`
                : "Share your live location temporarily"
              }
            </p>
          </div>
        </div>

        {isActive ? (
          <div className="space-y-3">
            {isStarting ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm">Acquiring GPS signal...</span>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink} disabled={!sessionId}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleShare} disabled={!sessionId}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <Button variant="destructive" size="sm" className="w-full" onClick={onToggle}>
                  Stop Sharing
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Share for 15, 30, or 60 minutes</span>
            </div>
            <Button className="w-full" onClick={onToggle}>
              Start Sharing Location
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
