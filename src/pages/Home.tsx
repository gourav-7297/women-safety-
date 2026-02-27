import { useState, useEffect } from "react";
import { Shield, MapPin, Users, User, Bell, LogOut, Phone, Clock, Zap, Mic, MicOff, Heart, AlertTriangle, Car, Footprints, BookOpen, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SOSButton } from "@/components/SOSButton";
import { EmergencyMode } from "@/components/EmergencyMode";
import SafeRouteDemo from "@/components/SafeRouteDemo";
import { SafetyTipsView } from "@/components/SafetyTipsView";
import { CommunityAlerts } from "@/components/CommunityAlerts";
import { EvidenceRecorder } from "@/components/EvidenceRecorder";
import { CabSafetyTracker } from "@/components/CabSafetyTracker";
import { WalkCompanion } from "@/components/WalkCompanion";
import { FakeCallDialog } from "@/components/FakeCallDialog";
import { FakeCallScreen } from "@/components/FakeCallScreen";
import { CheckInTimer } from "@/components/CheckInTimer";
import { LocationShareCard } from "@/components/LocationShareCard";
import { AlertHistoryCard } from "@/components/AlertHistoryCard";
import { useVoiceActivation } from "@/hooks/useVoiceActivation";
import { useContacts } from "@/hooks/useContacts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type ViewMode = "home" | "safe-route" | "safety-tips" | "community" | "evidence" | "cab" | "companion";
type BottomTab = "home" | "contacts" | "activity" | "profile";

const Home = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [showFakeCallDialog, setShowFakeCallDialog] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [fakeCallName, setFakeCallName] = useState("Mom");
  const [checkInActive, setCheckInActive] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const { contacts, addContact, removeContact } = useContacts();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleSOSActivate = () => {
    setIsEmergencyMode(true);
    toast.error("EMERGENCY ACTIVATED", {
      description: "Contacting emergency services and trusted contacts...",
    });
  };

  const { isListening, isSupported: voiceSupported } = useVoiceActivation({
    onTrigger: handleSOSActivate,
    keywords: ['emergency', 'help', 'sos'],
    isEnabled: voiceActivationEnabled
  });

  const handleDeactivate = () => {
    setIsEmergencyMode(false);
    toast.success("Emergency Cancelled", {
      description: "All alerts have been cancelled successfully.",
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleFakeCall = (name: string, delay: number) => {
    setFakeCallName(name);
    toast.success(`Fake call scheduled`, {
      description: `Your phone will ring in ${delay} seconds`,
    });
    setTimeout(() => {
      setShowFakeCall(true);
    }, delay * 1000);
  };

  const handleCheckInTimeout = () => {
    toast.error("Check-in missed!", {
      description: "Emergency contacts have been notified",
    });
    setCheckInActive(false);
  };

  const handleCheckIn = () => {
    toast.success("Check-in successful!", {
      description: "You're marked as safe",
    });
    setCheckInActive(false);
  };

  if (isEmergencyMode) {
    return <EmergencyMode onDeactivate={handleDeactivate} />;
  }

  if (showFakeCall) {
    return (
      <FakeCallScreen
        callerName={fakeCallName}
        onAnswer={() => {
          setShowFakeCall(false);
          toast.success("Call ended");
        }}
        onDecline={() => {
          setShowFakeCall(false);
          toast.info("Call declined");
        }}
      />
    );
  }

  if (viewMode === "safe-route") {
    return <SafeRouteDemo onBack={() => setViewMode("home")} />;
  }

  if (viewMode === "safety-tips") {
    return <SafetyTipsView onBack={() => setViewMode("home")} />;
  }

  if (viewMode === "community") {
    return <CommunityAlerts onBack={() => setViewMode("home")} />;
  }

  if (viewMode === "evidence") {
    return <EvidenceRecorder onBack={() => setViewMode("home")} />;
  }

  if (viewMode === "cab") {
    return <CabSafetyTracker onBack={() => setViewMode("home")} />;
  }

  if (viewMode === "companion") {
    return <WalkCompanion onBack={() => setViewMode("home")} />;
  }

  const quickActions = [
    {
      id: "fake-call",
      icon: Phone,
      label: "Fake Call",
      desc: "Escape Route",
      color: "from-purple-500 to-indigo-500",
      onClick: () => setShowFakeCallDialog(true)
    },
    {
      id: "check-in",
      icon: Clock,
      label: "Check-In",
      desc: "Safety Timer",
      color: "from-emerald-500 to-teal-500",
      onClick: () => {
        if (!checkInActive) {
          setCheckInActive(true);
          toast.success("Check-in timer started");
        }
      }
    },
    {
      id: "safe-route",
      icon: MapPin,
      label: "Safe Route",
      desc: "AI Navigation",
      color: "from-blue-500 to-cyan-500",
      onClick: () => setViewMode("safe-route")
    },
    {
      id: "tips",
      icon: BookOpen,
      label: "Safety Tips",
      desc: "Self Defense",
      color: "from-pink-500 to-rose-500",
      onClick: () => setViewMode("safety-tips")
    },
    {
      id: "community",
      icon: AlertTriangle,
      label: "Alerts",
      desc: "Community",
      color: "from-amber-500 to-orange-500",
      onClick: () => setViewMode("community")
    },
    {
      id: "evidence",
      icon: Video,
      label: "Record",
      desc: "Evidence",
      color: "from-red-500 to-pink-600",
      onClick: () => setViewMode("evidence")
    },
    {
      id: "cab",
      icon: Car,
      label: "Cab Safe",
      desc: "Ride Tracker",
      color: "from-yellow-400 to-amber-500",
      onClick: () => setViewMode("cab")
    },
    {
      id: "companion",
      icon: Footprints,
      label: "Companion",
      desc: "Virtual Walk",
      color: "from-green-400 to-emerald-500",
      onClick: () => setViewMode("companion")
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#faf9f9] dark:bg-background flex flex-col pb-24 relative overflow-hidden transition-colors duration-300">
        {/* Ambient Backlight */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex items-center justify-between relative z-10">
          <div>
            <p className="text-foreground/70 font-bold text-xs tracking-wider uppercase mb-1">{greeting}</p>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {user?.email?.split('@')[0] || "Guest"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-emergency rounded-full border-2 border-white" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
              <LogOut className="w-5 h-5 text-foreground" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 overflow-y-auto z-10 scrollbar-hide">
          {activeTab === "home" && (
            <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">

              {/* SOS Section */}
              <div className="py-2 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] group-hover:blur-[60px] transition-all duration-500" />
                  <SOSButton onActivate={handleSOSActivate} isEmergencyMode={isEmergencyMode} />
                </div>
              </div>

              {/* Status & Voice */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-2xl shadow-sm border transition-all flex flex-col gap-2 bg-white dark:bg-card border-safe/50 hover:border-safe"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                    <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground leading-tight">Shake On</p>
                    <p className="text-[10px] text-muted-foreground">Shake to SOS (Global)</p>
                  </div>
                </div>

                <div
                  onClick={() => setVoiceActivationEnabled(!voiceActivationEnabled)}
                  className={`p-4 rounded-2xl shadow-sm border transition-all cursor-pointer flex flex-col gap-2 ${voiceActivationEnabled
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white dark:bg-card border-border/50 hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${voiceActivationEnabled ? "text-white/80" : "text-muted-foreground"}`}>Voice</span>
                    {voiceActivationEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{voiceActivationEnabled ? "Listening..." : "Voice Off"}</p>
                    <p className={`text-[10px] ${voiceActivationEnabled ? "text-white/80" : "text-muted-foreground"}`}>
                      Say "Help"
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h3 className="text-[13px] font-extrabold text-foreground/90 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-4 gap-x-2 gap-y-6">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-2.5 transition-all group"
                    >
                      <div className={`p-4 rounded-[1.25rem] bg-gradient-to-br ${action.color} shadow-lg group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] group-hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 dark:border-white/10 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <action.icon className="w-6 h-6 text-white relative z-10" />
                      </div>
                      <span className="text-[11px] font-bold text-center leading-tight text-foreground/80 tracking-wide">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Features List */}
              <div className="space-y-3">
                {checkInActive && (
                  <CheckInTimer
                    duration={5}
                    onTimeout={handleCheckInTimeout}
                    onCheckIn={handleCheckIn}
                  />
                )}

                <LocationShareCard
                  isActive={locationSharing}
                  duration={30}
                  onToggle={() => {
                    setLocationSharing(!locationSharing);
                    toast.success(locationSharing ? "Location sharing stopped" : "Location sharing started");
                  }}
                />
              </div>

            </div>
          )}

          {activeTab === "contacts" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold">Trusted Contacts</h2>

              {showAddContact && (
                <div className="bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border/50 space-y-3">
                  <Input
                    placeholder="Name (e.g., Mom)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        if (newName && newPhone) {
                          addContact({ name: newName, phone: newPhone });
                          setNewName("");
                          setNewPhone("");
                          setShowAddContact(false);
                          toast.success("Contact added!");
                        } else {
                          toast.error("Please enter a name and phone number");
                        }
                      }}
                    >Save</Button>
                    <Button variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {contacts.length === 0 && !showAddContact && (
                  <p className="text-center text-muted-foreground py-8">No trusted contacts added yet. Add one to enable automatic SOS calling.</p>
                )}

                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{contact.name}</h3>
                      <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeContact(contact.id)}>Remove</Button>
                  </div>
                ))}

                {!showAddContact && (
                  <Button
                    className="w-full h-12 rounded-xl border-dashed border-2 border-border bg-transparent text-muted-foreground hover:bg-primary/5 hover:border-primary/50"
                    onClick={() => setShowAddContact(true)}
                  >
                    + Add New Contact
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold">Activity History</h2>
              <AlertHistoryCard />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-white text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold">{user?.email ? user.email.split('@')[0] : "Guest User"}</h2>
                <p className="text-white/80 text-sm">{user?.email || "Not signed in"}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">O+ Blood</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">No Allergies</span>
                </div>
              </div>

              <div className="space-y-2">
                {['Medical ID', 'Emergency Settings', 'Privacy & Security', 'Help & Support'].map((item) => (
                  <button key={item} className="w-full bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-border/50 text-left font-medium flex justify-between items-center hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors">
                    {item}
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-accent flex items-center justify-center">
                      <span className="text-xs">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-6 left-6 right-6 glass-nav z-50 rounded-full pb-0 mb-safe premium-shadow border border-white/20 dark:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 dark:from-white/0 dark:to-white/5 pointer-events-none" />
          <div className="flex justify-around items-center px-2 py-3 relative z-10">
            {[
              { id: "home", icon: Shield, label: "Home" },
              { id: "contacts", icon: Users, label: "Contacts" },
              { id: "activity", icon: Heart, label: "Activity" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BottomTab)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? "fill-current" : ""}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1 h-1 bg-primary rounded-full absolute -bottom-1" />
                )}
              </button>
            ))}
          </div>
        </nav>

        <FakeCallDialog
          open={showFakeCallDialog}
          onOpenChange={setShowFakeCallDialog}
          onTrigger={handleFakeCall}
        />
      </div>
    </TooltipProvider>
  );
};

export default Home;
