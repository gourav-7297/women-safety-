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

const DirectCall = registerPlugin<{ call(options: { number: string }): Promise<void> }>('DirectCall');
const DirectSms = registerPlugin<{ send(options: { numbers: string[], message: string }): Promise<void> }>('DirectSms');

const queryClient = new QueryClient();

const AppContent = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

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

          // 1. Silent SMS Broadcast stringing
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const message = `EMERGENCY SOS! I need help. My live location is: https://maps.google.com/?q=${lat},${lng}`;

              const numbers = contacts.map(c => c.phone);
              try {
                await DirectSms.send({ numbers, message });
                toast.success("Silent SMS Broadcast Sent");
              } catch (smsError) {
                console.error("Failed to send silent SMS", smsError);
              }
            }, (error) => {
              console.error("SOS SMS: Could not get location", error);
            });
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
    toast.success("Emergency Cancelled", {
      description: "All alerts have been cancelled successfully.",
    });
  };

  useShakeDetection(handleSOSActivate, {
    isEnabled: true,  // Globally enabled
    threshold: 15,    // Sensitivity
    timeout: 2000     // Debounce 2s
  });

  if (isEmergencyMode) {
    return <EmergencyMode onDeactivate={handleDeactivate} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Index />} />
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
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
