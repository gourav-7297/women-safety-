import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Shield, AlertTriangle, Clock, MapPin, MapPinOff, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card } from "@/components/ui/card";

// Fix standard Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const customPulseIcon = L.divIcon({
    className: "custom-pulse-icon",
    html: `<div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-full h-full bg-primary rounded-full animate-ping opacity-75"></div>
          <div class="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"></div>
         </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

export const LiveTrackingView = () => {
    const { id } = useParams<{ id: string }>();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Invalid tracking link.");
            setLoading(false);
            return;
        }

        const fetchSession = async () => {
            try {
                const { data, error } = await supabase
                    .from("safety_sessions")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Tracking session not found.");

                setSession(data);
            } catch (err: any) {
                console.error("Error fetching session:", err);
                setError("Tracking session not found or has expired.");
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        // Subscribe to real-time updates for THIS specific session
        const channel = supabase
            .channel(`safety_session_${id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "safety_sessions",
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    console.log("Real-time update received!", payload.new);
                    setSession(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-bold text-foreground">Locating Signal...</h2>
                <p className="text-muted-foreground text-center mt-2">Connecting to secure safety network</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <MapPinOff className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tracking Unavailable</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    {error || "This tracking link is invalid, expired, or the user has ended their safety session."}
                </p>
            </div>
        );
    }

    const isEnded = session.status === "ended";
    const position: [number, number] = [session.last_known_lat, session.last_known_lng];

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4">
                <Card className="glass-panel p-4 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground leading-tight">Live Tracker</h1>
                            <p className="text-xs text-muted-foreground">SafeGuard Protection</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {isEnded ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                Session Ended
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-safe/10 text-safe text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>
                </Card>
            </div>

            {/* Map Content */}
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={position}
                    zoom={16}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position} icon={customPulseIcon}>
                        <Popup>
                            <div className="text-center font-medium">Last Known Location</div>
                        </Popup>
                    </Marker>
                    <Circle
                        center={position}
                        radius={isEnded ? 0 : 50}
                        pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.1, weight: 1 }}
                    />
                </MapContainer>
            </div>

            {/* Info Bottom Sheet area */}
            <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-safe pointer-events-none">
                <Card className="glass-panel p-5 pointer-events-auto premium-shadow">
                    <h3 className="font-bold text-lg mb-4 text-foreground">Session Details</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                Updated
                            </div>
                            <div className="font-semibold text-foreground truncate">
                                {new Date(session.updated_at || session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                Type
                            </div>
                            <div className="font-semibold text-foreground capitalize truncate">
                                {session.type.replace('_', ' ')}
                            </div>
                        </div>

                        {session.destination && session.destination !== 'N/A' && (
                            <div className="col-span-2 bg-secondary/50 rounded-xl p-3 border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Destination
                                </div>
                                <div className="font-semibold text-foreground truncate">{session.destination}</div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LiveTrackingView;
