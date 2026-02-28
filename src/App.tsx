import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useShakeDetection } from "@/hooks/useShakeDetection";
import { EmergencyMode } from "@/components/EmergencyMode";
import { toast } from "sonner";
import { useState } from "react";
import { TrustedContact } from "@/hooks/useContacts";
import { registerPlugin } from '@capacitor/core';
import { AuthProvider } from "@/contexts/AuthContext";
import { LiveTrackingView } from "@/pages/LiveTrackingView";
import { supabase } from "@/lib/supabase";

const DirectCall = registerPlugin<{ call(options: { number: string }): Promise<void> }>('DirectCall');
const DirectSms = registerPlugin<{
  send(options: { numbers: string[], message: string }): Promise<void>;
  requestPermissions(): Promise<{ sms: string }>;
}>('DirectSms');

const queryClient = new QueryClient();

const AppContent = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [emergencyWatchId, setEmergencyWatchId] = useState<number | null>(null);

  const handleSOSActivate = async () => {
    setIsEmergencyMode(true);
    toast.error("EMERGENCY ACTIVATED", {
      description: "Contacting emergency services and trusted contacts...",
    });

    try {
      const stored = localStorage.getItem('trusted_contacts');
      if (stored) {
        const contacts: TrustedContact[] = JSON.parse(stored);
        if (contacts.length > 0) {

          // Request SMS permission early
          try {
            await DirectSms.requestPermissions();
          } catch (e) {
            console.log("Could not request SMS permissions (may be running in browser)", e);
          }

          let lat = null;
          let lng = null;

          // Try to get location with a 10 second timeout
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error("No geolocation"));
                return;
              }
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch (locErr) {
            console.error("Could not get location for SOS", locErr);
            toast.error("Could not get GPS location for emergency request.");
          }

          let sessionId = "";
          let trackingUrl = "";

          // Create a safety session in Supabase for live tracking if we have a location
          if (lat !== null && lng !== null) {
            try {
              const { data, error } = await supabase
                .from('safety_sessions')
                .insert([{
                  type: 'walk_companion', // compatible enum
                  destination: 'SOS Emergency',
                  last_known_lat: lat,
                  last_known_lng: lng,
                  estimated_duration_mins: 60,
                  status: 'active'
                }])
                .select()
                .single();

              if (data && !error) {
                sessionId = data.id;
                trackingUrl = `${window.location.origin}/share/${sessionId}`;

                // Start live location tracking
                const watchId = navigator.geolocation.watchPosition(
                  async (pos) => {
                    await supabase
                      .from('safety_sessions')
                      .update({
                        last_known_lat: pos.coords.latitude,
                        last_known_lng: pos.coords.longitude,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', sessionId);
                  },
                  (err) => console.error("SOS tracking error:", err),
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
                setEmergencyWatchId(watchId);
              }
            } catch (err) {
              console.error("Failed to create safety session", err);
            }

            if (!trackingUrl) {
              trackingUrl = `https://maps.google.com/?q=${lat},${lng}`;
            }
          }

          const message = trackingUrl
            ? `EMERGENCY SOS! I need help. My live location is: ${trackingUrl}`
            : `EMERGENCY SOS! I need help, but my location is currently unavailable. Please contact me immediately.`;

          const numbers = contacts.map(c => c.phone);
          try {
            await DirectSms.send({ numbers, message });
            toast.success("Silent SMS Broadcast Sent");
          } catch (smsError) {
            console.error("Failed to send silent SMS", smsError);
            toast.error("Failed to send silent SMS. Ensure permissions are granted.");
          }

          // 2. Attempt the native bypass dialer for the primary contact
          try {
            await DirectCall.call({ number: contacts[0].phone });
          } catch (pluginError) {
            console.log("DirectCall plugin failed, falling back to tel:", pluginError);
            window.location.href = `tel:${contacts[0].phone}`;
          }
        }
      }
    } catch (error) {
      console.error("Could not dial trusted contact", error);
    }
  };

  const handleDeactivate = () => {
    setIsEmergencyMode(false);
    if (emergencyWatchId !== null) {
      navigator.geolocation.clearWatch(emergencyWatchId);
      setEmergencyWatchId(null);
    }
    toast.success("Emergency Cancelled", {
      description: "All alerts have been cancelled successfully.",
    });
  };

  useShakeDetection(handleSOSActivate, {
    isEnabled: true,  // Globally enabled
    threshold: 15,    // Sensitivity
    duration: 4000    // Require 4 seconds continuous shake
  });

  if (isEmergencyMode) {
    return <EmergencyMode onDeactivate={handleDeactivate} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
        <Route path="/share/:id" element={<LiveTrackingView />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
