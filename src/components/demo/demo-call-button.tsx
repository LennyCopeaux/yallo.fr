"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface DemoCallButtonProps {
  phoneNumber: string;
}

export function DemoCallButton({ phoneNumber }: DemoCallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        onClick={handleCall}
        className="bg-primary text-black hover:bg-primary/90 h-14 px-8 text-lg font-semibold"
      >
        <Phone className="w-5 h-5 mr-2" />
        Appeler maintenant
      </Button>
      {isCalling && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Appel en cours...
        </p>
      )}
    </div>
  );
}
