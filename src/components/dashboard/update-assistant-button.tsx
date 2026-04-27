"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { updateElevenLabsAgent } from "@/app/(admin)/admin/restaurants/actions";

interface UpdateAssistantButtonProps {
  restaurantId: string;
}

export function UpdateAssistantButton({ restaurantId }: Readonly<UpdateAssistantButtonProps>) {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={isUpdating}
      onClick={async () => {
        setIsUpdating(true);
        try {
          const result = await updateElevenLabsAgent(restaurantId);
          if (result.success) {
            toast.success("Assistant IA mis à jour avec succès");
          } else {
            toast.error(result.error || "Erreur lors de la mise à jour de l'assistant");
          }
        } catch {
          toast.error("Erreur lors de la mise à jour de l'assistant");
        } finally {
          setIsUpdating(false);
        }
      }}
    >
      {isUpdating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Mise à jour...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Mettre à jour l&apos;assistant IA
        </>
      )}
    </Button>
  );
}
