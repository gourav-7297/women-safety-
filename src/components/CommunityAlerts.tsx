import { useState } from "react";
import { AlertTriangle, MapPin, ThumbsUp, MessageCircle, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

    // Mock data - will be replaced with Supabase data in Phase 3
    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: "1",
            type: "Harassment",
            location: "Central Park West Entrance",
            time: "10 mins ago",
            description: "Group of men catcalling and following women near the gate.",
            votes: 12,
            comments: 3
        },
        {
            id: "2",
            type: "Poor Lighting",
            location: "5th Avenue Subway Station",
            time: "25 mins ago",
            description: "Street lights are out in the pedestrian tunnel. Very dark.",
            votes: 8,
            comments: 1
        },
        {
            id: "3",
            type: "Suspicious Activity",
            location: "Oak Street Parking Lot",
            time: "1 hour ago",
            description: "Unmarked van parked for 2 hours with engine running.",
            votes: 5,
            comments: 0
        }
    ]);

    const handleUpvote = (id: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, votes: alert.votes + 1 } : alert
        ));
        toast.success("Alert Upvoted", { description: "Thanks for validating this report" });
    };

    const handleReport = () => {
        toast.success("Report Submitted", { description: "Your alert has been broadcast to nearby users" });
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
                                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {alert.votes} Helpful
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        {alert.comments} Comments
                                    </button>
                                </div>
                                <button className="text-xs font-bold text-primary hover:underline">
                                    View on Map
                                </button>
                            </div>
                        </Card>
                    ))}
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
