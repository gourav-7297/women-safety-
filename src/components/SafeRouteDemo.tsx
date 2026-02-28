import { ArrowLeft, Navigation, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Link } from "react-router-dom";

// Fix for default marker icon
import { useEffect } from "react";

const SafeRouteDemo = ({ onBack }: { onBack: () => void }) => {

  useEffect(() => {
    // Fix for default marker icon in React Leaflet
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconUrl: markerIconPng,
      shadowUrl: "leaflet/dist/images/marker-shadow.png"
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6 relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Button variant="ghost" onClick={onBack} className="hover:bg-primary/10 px-2">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="font-semibold text-sm">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">Safe Zone Routing</h1>
          <p className="text-sm text-muted-foreground">
            AI-optimized routes for maximum safety
          </p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6 relative z-10">
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="p-4 space-y-3 glass-panel border-primary/20">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Location</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Connaught Place, New Delhi"
                  className="flex-1 bg-background/50 border-primary/20 focus:border-primary/50"
                  defaultValue="Connaught Place, New Delhi"
                />
                <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10">
                  <Navigation className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Input placeholder="Enter destination address" className="bg-background/50 border-primary/20 focus:border-primary/50" />
            </div>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all" size="lg">
              Find Safest Route
            </Button>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20 backdrop-blur-sm">
            <div className="flex gap-3">
              <div className="p-2 bg-primary/10 rounded-lg h-fit">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Safety Awareness Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Real-time crime data overlay active. Avoid red zones.
                </p>
              </div>
            </div>
          </Card>

          {/* Risk Factors */}
          <Card className="p-4 glass-panel border-primary/10">
            <h3 className="font-semibold mb-3">Real-time Risk Assessment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Crime Incident Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-safe/20 rounded-full overflow-hidden">
                    <div className="h-full bg-safe w-1/4" />
                  </div>
                  <span className="text-xs font-medium text-safe">Low</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Street Lighting Coverage</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-safe/20 rounded-full overflow-hidden">
                    <div className="h-full bg-safe w-5/6" />
                  </div>
                  <span className="text-xs font-medium text-safe">High</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-2 relative h-[600px] lg:h-auto rounded-3xl overflow-hidden border-2 border-primary/10 shadow-2xl z-0">
          <MapContainer
            center={[28.6139, 77.2090]} // Delhi
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url={import.meta.env.VITE_OSM_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="topright" />
            <Marker position={[28.6139, 77.2090]}>
              <Popup>
                Connaught Place
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default SafeRouteDemo;
