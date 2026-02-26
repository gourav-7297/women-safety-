import { History, AlertTriangle, MapPin, Users, Clock, Loader2, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AlertEvent {
  id: string;
  type: "sos" | "check-in-missed" | "safe-route" | "location-share";
  timestamp: Date;
  status: "resolved" | "active" | "cancelled";
  location?: string;
}

export const AlertHistoryCard = () => {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Fetch from safety sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('safety_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionError) throw sessionError;

      // Map to AlertEvent structure
      const formattedHistory: AlertEvent[] = (sessionData || []).map(session => ({
        id: session.id,
        type: session.type === 'walk_companion' ? 'location-share' : (session.type === 'cab_ride' ? 'safe-route' : 'sos'),
        timestamp: new Date(session.created_at),
        status: session.status === 'active' ? 'active' : (session.status === 'ended' ? 'resolved' : 'cancelled'),
        location: session.destination || "Unknown Location"
      }));

      setAlerts(formattedHistory);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getIcon = (type: AlertEvent["type"]) => {
    switch (type) {
      case "sos":
        return <AlertTriangle className="w-4 h-4" />;
      case "location-share":
        return <MapPin className="w-4 h-4" />;
      case "check-in-missed":
        return <Clock className="w-4 h-4" />;
      case "safe-route":
        return <Navigation className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getLabel = (type: AlertEvent["type"]) => {
    switch (type) {
      case "sos":
        return "SOS Alert";
      case "location-share":
        return "Walk Companion / Location";
      case "safe-route":
        return "Cab Safety Tracker";
      case "check-in-missed":
        return "Missed Check-in";
      default:
        return "Alert";
    }
  };

  const getStatusColor = (status: AlertEvent["status"]) => {
    switch (status) {
      case "resolved":
        return "bg-safe/20 text-safe";
      case "active":
        return "bg-primary/20 text-primary";
      case "cancelled":
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No recent activity found.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      {getIcon(alert.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getLabel(alert.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </Badge>
                </div>
                {alert.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 ml-8">
                    <MapPin className="w-3 h-3" />
                    {alert.location}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
