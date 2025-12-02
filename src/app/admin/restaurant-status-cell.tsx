"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleRestaurantStatus } from "./actions";

interface RestaurantStatusCellProps {
  restaurantId: string;
  isActive: boolean;
}

export function RestaurantStatusCell({
  restaurantId,
  isActive,
}: RestaurantStatusCellProps) {
  const [currentStatus, setCurrentStatus] = useState(isActive);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle(newStatus: boolean) {
    setIsLoading(true);
    
    try {
      const result = await toggleRestaurantStatus(restaurantId, newStatus);
      
      if (result.success) {
        setCurrentStatus(newStatus);
        toast.success(
          newStatus ? "Restaurant activé" : "Restaurant désactivé",
          {
            description: newStatus
              ? "Le restaurant est maintenant actif"
              : "Le restaurant est maintenant inactif",
          }
        );
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
        // Revert l'état en cas d'erreur
        setCurrentStatus(!newStatus);
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      // Revert l'état en cas d'erreur
      setCurrentStatus(!newStatus);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <Switch
            checked={currentStatus}
            onCheckedChange={handleToggle}
            disabled={isLoading}
            className={`scale-110 ${
              currentStatus
                ? "data-[state=checked]:bg-[#f6cf62]"
                : "data-[state=unchecked]:bg-white/10"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              currentStatus ? "text-[#f6cf62]" : "text-muted-foreground"
            }`}
          >
            {currentStatus ? "Actif" : "Inactif"}
          </span>
        </>
      )}
    </div>
  );
}

