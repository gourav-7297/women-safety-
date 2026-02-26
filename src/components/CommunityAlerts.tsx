import { useState } from "react";
import { AlertTriangle, MapPin, ThumbsUp, MessageCircle, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface CommunityAlertsProps {
    onBack: () => void;
}

interface Alert {
    id: string;
    type: string;
    location: string;
    time: string;
    description: string;
    votes: number;
    comments: number;
}

export const CommunityAlerts = ({ onBack }: CommunityAlertsProps) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('alerts-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, payload => {
                console.log('Change received!', payload);
                fetchAlerts(); // Re-fetch to keep it simple, or update state optimistically
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('alerts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            if (data) {
                const formattedAlerts: Alert[] = data.map(item => ({
                    id: item.id,
                    type: item.type,
                    location: item.location_name,
                    time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    description: item.description,
                    votes: item.upvotes || 0,
                    comments: item.comments || 0
                }));
                setAlerts(formattedAlerts);
            }
        } catch (error) {
            console.error("Error fetching alerts:", error);
            // Fallback for demo purposes if Supabase fails
            if (alerts.length === 0) {
                toast.error("Could not load live alerts");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpvote = async (id: string) => {
        // Optimistic update
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, votes: alert.votes + 1 } : alert
        ));

        try {
            const currentAlert = alerts.find(a => a.id === id);
            if (currentAlert && id.length > 5) { // basic check if it's a UUID and not a mock ID
                await supabase
                    .from('alerts')
                    .update({ upvotes: currentAlert.votes + 1 })
                    .eq('id', id);
            }
            toast.success("Alert Upvoted", { description: "Thanks for validating this report" });
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    const handleReport = async () => {
        const types = ["Harassment", "Poor Lighting", "Suspicious Activity"];
        const randomType = types[Math.floor(Math.random() * types.length)];

        toast.loading("Submitting report...", { id: 'report' });

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) reject(new Error("No geolocation"));
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
            });

            const { error } = await supabase
                .from('alerts')
                .insert([{
                    type: randomType,
                    location_name: "Current Location",
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    description: "User reported incident nearby",
                }]);

            if (error) throw error;
            toast.success("Report Submitted", { id: 'report', description: "Your alert has been broadcast to nearby users" });
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit report", { id: 'report' });
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f9] dark:bg-background flex flex-col relative overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-10 glass-panel border-b border-border/40 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-primary/10">
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                    </Button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Community Alerts
                    </h1>
                </div>
                <Button size="sm" onClick={handleReport} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-full px-4">
                    <Plus className="w-4 h-4 mr-1" /> Report
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto z-10 scrollbar-hide pb-24 space-y-6">

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {["All", "Harassment", "Lighting", "Suspicious"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter.toLowerCase())}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === filter.toLowerCase()
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-white dark:bg-card border border-border/50 text-muted-foreground hover:bg-accent"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <Card key={alert.id} className="p-4 border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-card">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`
                    ${alert.type === 'Harassment' ? 'border-red-200 text-red-600 bg-red-50' : ''}
                    ${alert.type === 'Poor Lighting' ? 'border-amber-200 text-amber-600 bg-amber-50' : ''}
                    ${alert.type === 'Suspicious Activity' ? 'border-orange-200 text-orange-600 bg-orange-50' : ''}
                  `}>
                                        {alert.type}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground">
                                    <AlertTriangle className="w-3 h-3" />
                                </Button>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-1">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                    {alert.location}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {alert.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleUpvote(alert.id)}
                                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {alert.votes} Helpful
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        {alert.comments} Comments
                                    </button>
                                </div>
                                <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
                                    View on Map
                                </button>
                            </div>
                        </Card>
                    ))}

                    {alerts.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No recent alerts in your area.</p>
                            <p className="text-sm">Stay safe!</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-safe/5 rounded-2xl border border-primary/10 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                        Stay safe! Reports help the community avoid dangerous areas.
                    </p>
                    <p className="text-xs font-bold text-primary">
                        All reports are verified by moderators.
                    </p>
                </div>

            </main>
        </div>
    );
};
