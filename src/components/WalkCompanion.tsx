import { useState, useEffect } from "react";
import { Footprints, MapPin, Clock, Users, Phone, Video, ChevronLeft, Navigation, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckInTimer } from "@/components/CheckInTimer";
import { supabase } from "@/lib/supabase";

interface WalkCompanionProps {
    onBack: () => void;
}

export const WalkCompanion = ({ onBack }: WalkCompanionProps) => {
    const [isActive, setIsActive] = useState(false);
    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState("");
    const [selectedContact, setSelectedContact] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [watchId]);

    const handleStartWalk = async () => {
        if (!destination || !selectedContact) {
            toast.error("Missing Info", { description: "Please select a contact and destination" });
            return;
        }

        if (!navigator.geolocation) {
            toast.error("Error", { description: "Geolocation is not supported by your browser" });
            return;
        }

        setIsStarting(true);
        toast.loading("Starting Walk Companion...", { id: 'walk-start' });

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
            });

            const { data, error } = await supabase
                .from('safety_sessions')
                .insert([{
                    type: 'walk',
                    destination: destination,
                    last_known_lat: position.coords.latitude,
                    last_known_lng: position.coords.longitude,
                    estimated_duration_mins: parseInt(duration) || 15,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;

            setSessionId(data.id);
            setIsActive(true);

            const id = navigator.geolocation.watchPosition(
                async (pos) => {
                    await supabase
                        .from('safety_sessions')
                        .update({
                            last_known_lat: pos.coords.latitude,
                            last_known_lng: pos.coords.longitude,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', data.id);
                },
                (err) => console.error("GPS error", err),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            setWatchId(id);
            toast.success("Walk Companion Active", { id: 'walk-start', description: "Your contact can now see your live location" });

        } catch (error) {
            console.error(error);
            toast.error("Failed to start walk tracker", { id: 'walk-start' });
        } finally {
            setIsStarting(false);
        }
    };

    const handleEndWalk = async () => {
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
                console.error("Error ending walk", error);
            }
        }

        setIsActive(false);
        setSessionId(null);
        toast.success("Walk Ended", { description: "Glad you arrived safely!" });
    };

    return (
        <div className="min-h-screen bg-[#faf9f9] dark:bg-background flex flex-col relative overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-10 glass-panel border-b border-border/40 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={onBack} className="rounded-full hover:bg-primary/10 px-2">
                        <ChevronLeft className="w-6 h-6 text-foreground" />
                        <span className="font-semibold px-1">Back</span>
                    </Button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Walk Companion
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto z-10 scrollbar-hide pb-24 space-y-6">

                {!isActive ? (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Intro */}
                        <div className="text-center space-y-2 mb-6">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Footprints className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold">Virtual Escort</h2>
                            <p className="text-sm text-muted-foreground px-6">
                                Share your live location with a friend who can watch you walk home safely in real-time.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-white dark:bg-card p-6 rounded-3xl shadow-sm border border-border/50 space-y-6">
                            <div className="space-y-2">
                                <Label>Where are you walking to?</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Home / Dorm / Station"
                                        className="pl-10 h-12 rounded-xl bg-muted/30"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Est. Duration (mins)</Label>
                                <Input
                                    type="number"
                                    placeholder="15"
                                    className="h-12 rounded-xl bg-muted/30"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Select Companion</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3].map((contact) => (
                                        <div
                                            key={contact}
                                            onClick={() => setSelectedContact(contact)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${selectedContact === contact
                                                ? "border-primary bg-primary/5"
                                                : "border-transparent bg-muted/50 hover:bg-muted"
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                {contact === 1 ? 'M' : contact === 2 ? 'D' : 'S'}
                                            </div>
                                            <span className="text-[10px] font-medium">
                                                {contact === 1 ? 'Mom' : contact === 2 ? 'Dad' : 'Sarah'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleStartWalk}
                                disabled={isStarting}
                                className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-green-500/20 bg-gradient-to-r from-green-500 to-emerald-600 hover:to-green-500 text-white"
                            >
                                {isStarting ? "Starting..." : "Start Walking"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Use CheckInTimer as the main visuals */}
                        <CheckInTimer
                            duration={duration ? parseInt(duration) : 15}
                            onTimeout={() => toast.error("Time exceeded!", { description: "Sending alert to companion" })}
                            onCheckIn={handleEndWalk}
                            label="Walking Home..."
                        />

                        {/* Live Map Placeholder */}
                        <div className="aspect-square bg-muted/30 rounded-3xl border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-74.006,40.7128,13,0/600x600@2x?access_token=pk.123')] bg-cover bg-center opacity-50" />
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
                                </div>
                                <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                    Sharing GPS to Cloud
                                </span>
                            </div>
                            <div className="absolute bottom-2 right-2 flex gap-1 items-center bg-background/80 px-2 py-1 rounded-full text-[10px] font-mono">
                                <MapPin className="w-3 h-3 text-primary" /> LIVE
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="h-12 rounded-xl font-bold bg-white shadow-sm" onClick={() => toast.info("Calling companion...")}>
                                <Phone className="w-4 h-4 mr-2 text-green-600" /> Call
                            </Button>
                            <Button variant="secondary" className="h-12 rounded-xl font-bold bg-white shadow-sm" onClick={() => toast.info("Video call started...")}>
                                <Video className="w-4 h-4 mr-2 text-indigo-600" /> Video
                            </Button>
                        </div>

                        <Button size="lg" variant="destructive" className="w-full h-14 rounded-xl font-bold shadow-lg shadow-red-500/20" onClick={handleEndWalk}>
                            End Walk (I'm Safe)
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};
