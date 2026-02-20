import { MapPin, Users, Route, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      id: "contacts",
      icon: Users,
      label: "Trusted Contacts",
      description: "Manage emergency contacts",
      color: "bg-primary/10 text-primary hover:bg-primary/20",
    },
    {
      id: "safe-route",
      icon: Route,
      label: "Safe Route",
      description: "Plan safest path",
      color: "bg-safe/10 text-safe hover:bg-safe/20",
    },
    {
      id: "location",
      icon: MapPin,
      label: "Share Location",
      description: "Real-time tracking",
      color: "bg-accent text-accent-foreground hover:bg-accent/80",
    },
    {
      id: "profile",
      icon: UserCircle,
      label: "Emergency Profile",
      description: "Medical info & contacts",
      color: "bg-muted text-muted-foreground hover:bg-muted/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.id}
            className="p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            onClick={() => onNavigate(action.id)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-xl ${action.color} transition-colors`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{action.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
