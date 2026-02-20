import { useState, useEffect } from "react";
import { Car, MapPin, Clock, Share2, ShieldCheck, AlertTriangle, ChevronLeft, Phone, Navigation, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckInTimer } from "@/components/CheckInTimer";

interface CabSafetyTrackerProps {
    onBack: () => void;
}

export const CabSafetyTracker = ({ onBack }: CabSafetyTrackerProps) => {
    const [isActive, setIsActive] = useState(false);
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");
    const [destination, setDestination] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("");
    const [showTimer, setShowTimer] = useState(false);

    // Mock tracking
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                // Simulate tracking updates
                console.log("Tracking active...");
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleStartRide = () => {
        if (!vehicleNo || !destination) {
            toast.error("Missing Details", { description: "Please enter vehicle number and destination" });
            return;
        }
        setIsActive(true);
        setShowTimer(true);
        toast.success("Ride Tracking Started", { description: "Sharing live details with trusted contacts" });
    };

    const handleEndRide = () => {
        setIsActive(false);
        setShowTimer(false);
        toast.success("Ride Ended", { description: "You've arrived safely" });
    };

    const shareRideDetails = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Track my ride',
                text: `I'm in a cab (${vehicleNo}) driven by ${driverName || 'Unknown'}. Going to ${destination}. Track me here:`,
                url: window.location.href
            }).catch(console.error);
        } else {
            toast.info("Link Copied", { description: "Ride tracking link copied to clipboard" });
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
                        Cab Safety
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto z-10 scrollbar-hide pb-24 space-y-6">

                {!isActive ? (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-white dark:bg-card p-6 rounded-3xl shadow-lg border border-border/50">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Car className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h2 className="text-center text-lg font-bold mb-6">Enter Ride Details</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vehicle">Vehicle Number *</Label>
                                    <Input
                                        id="vehicle"
                                        placeholder="e.g. MH 02 AB 1234"
                                        className="h-12 rounded-xl bg-muted/30"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="driver">Driver Name (Optional)</Label>
                                    <Input
                                        id="driver"
                                        placeholder="Driver's Name"
                                        className="h-12 rounded-xl bg-muted/30"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dest">Destination *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="dest"
                                            placeholder="Where are you going?"
                                            className="pl-10 h-12 rounded-xl bg-muted/30"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time">Est. Duration (mins)</Label>
                                    <Input
                                        id="time"
                                        type="number"
                                        placeholder="20"
                                        className="h-12 rounded-xl bg-muted/30"
                                        value={estimatedTime}
                                        onChange={(e) => setEstimatedTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleStartRide}
                                className="w-full h-14 mt-8 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:to-primary"
                            >
                                Start Safety Tracking
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm flex gap-3">
                            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            <p>We'll automatically notify your trusted contacts if you stop moving for too long or deviate from the route.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Active Ride Card */}
                        <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">{vehicleNo}</h2>
                                    <p className="text-white/80 text-sm flex items-center gap-1">
                                        <Car className="w-4 h-4" /> Cab Ride Active
                                    </p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    LIVE
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl border border-white/10">
                                    <Navigation className="w-5 h-5 text-yellow-300" />
                                    <div>
                                        <p className="text-xs text-white/60">Heading to</p>
                                        <p className="font-semibold text-sm">{destination}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="secondary" className="h-10 text-xs font-bold bg-white text-primary hover:bg-white/90" onClick={shareRideDetails}>
                                        <Share2 className="w-3.5 h-3.5 mr-2" /> Share Trip
                                    </Button>
                                    <Button variant="destructive" className="h-10 text-xs font-bold bg-red-500 hover:bg-red-600 border-none" onClick={() => toast.error("SOS Alert Sent!")}>
                                        <AlertTriangle className="w-3.5 h-3.5 mr-2" /> SOS
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Safety Checks */}
                        {showTimer && (
                            <CheckInTimer
                                duration={estimatedTime ? parseInt(estimatedTime) : 30}
                                onTimeout={() => toast.error("Time exceeded!", { description: "Alerting contacts" })}
                                onCheckIn={handleEndRide}
                                label="Ride Safety Check"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/50">
                                <Phone className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Fake Call</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/50">
                                <Video className="w-6 h-6 text-primary" />
                                <span className="text-xs font-medium">Record</span>
                            </Button>
                        </div>

                        <Button size="lg" variant="secondary" className="w-full rounded-xl font-bold" onClick={handleEndRide}>
                            End Ride & Mark Safe
                        </Button>
                    </div>
                )}

            </main>
        </div>
    );
};
