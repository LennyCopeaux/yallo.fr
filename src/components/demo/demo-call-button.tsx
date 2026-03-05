"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Lock } from "lucide-react";

interface DemoCallButtonProps {
  phoneNumber: string;
  disabled?: boolean;
}

export function DemoCallButton({ phoneNumber, disabled = false }: Readonly<DemoCallButtonProps>) {
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    if (disabled) return;
    setIsCalling(true);
    globalThis.window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        onClick={handleCall}
        disabled={disabled}
        className={`h-14 px-8 text-lg font-semibold ${
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            : "bg-primary text-black hover:bg-primary/90"
        }`}
      >
        {disabled ? (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Indisponible pour le moment
          </>
        ) : (
          <>
            <Phone className="w-5 h-5 mr-2" />
            Appeler maintenant
          </>
        )}
      </Button>
      {isCalling && !disabled && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Appel en cours...
        </p>
      )}
    </div>
  );
}
