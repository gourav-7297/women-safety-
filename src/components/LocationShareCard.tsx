import { MapPin, Share2, Copy, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LocationShareCardProps {
  isActive: boolean;
  duration?: number;
  onToggle: () => void;
}

export const LocationShareCard = ({ isActive, duration = 30, onToggle }: LocationShareCardProps) => {
  const handleCopyLink = () => {
    const link = "https://safeguard.app/share/abc123xyz";
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "SafeGuard - My Location",
        text: "I'm sharing my live location with you for safety.",
        url: "https://safeguard.app/share/abc123xyz",
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className={`p-5 transition-all ${
      isActive 
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            <Button variant="destructive" size="sm" className="w-full" onClick={onToggle}>
              Stop Sharing
            </Button>
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
