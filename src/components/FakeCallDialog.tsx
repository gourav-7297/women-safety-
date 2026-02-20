import { useState } from "react";
import { Phone, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FakeCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrigger: (name: string, delay: number) => void;
}

export const FakeCallDialog = ({ open, onOpenChange, onTrigger }: FakeCallDialogProps) => {
  const [callerName, setCallerName] = useState("Mom");
  const [delay, setDelay] = useState("5");

  const handleTrigger = () => {
    onTrigger(callerName, parseInt(delay));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Schedule Fake Call
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Caller Name</label>
            <Input
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              placeholder="Who's calling?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Delay (seconds)</label>
            <Select value={delay} onValueChange={setDelay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTrigger} className="flex-1">
              Start Call
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Your phone will ring in {delay} seconds. Perfect for escaping uncomfortable situations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
