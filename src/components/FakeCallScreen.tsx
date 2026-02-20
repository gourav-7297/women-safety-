import { Phone, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FakeCallScreenProps {
  callerName: string;
  onAnswer: () => void;
  onDecline: () => void;
}

export const FakeCallScreen = ({ callerName, onAnswer, onDecline }: FakeCallScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-50 flex flex-col text-white animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-32 h-32 bg-gradient-to-br from-primary/40 to-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <User className="w-16 h-16" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{callerName}</h2>
        <p className="text-lg text-gray-400 mb-1">Incoming call...</p>
        <p className="text-sm text-gray-500">Mobile</p>
        
        <div className="mt-12 flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-gray-400 animate-pulse">Ringing...</span>
        </div>
      </div>

      <div className="p-8 flex justify-center gap-12">
        <button
          onClick={onDecline}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center group-active:scale-90 transition-transform">
            <PhoneOff className="w-8 h-8" />
          </div>
          <span className="text-sm">Decline</span>
        </button>

        <button
          onClick={onAnswer}
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-20 h-20 rounded-full bg-safe flex items-center justify-center group-active:scale-90 transition-transform animate-glow">
            <Phone className="w-8 h-8" />
          </div>
          <span className="text-sm">Answer</span>
        </button>
      </div>
    </div>
  );
};
