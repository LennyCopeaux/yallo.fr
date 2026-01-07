"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Loader2 } from "lucide-react";
import { updateKitchenStatus, updateStatusSettings, type StatusSettings } from "@/features/kitchen-status/actions";
import { DEFAULT_STATUS_SETTINGS } from "@/features/kitchen-status/constants";
import { type KitchenStatus } from "@/db/schema";
import { toast } from "sonner";

interface KitchenStatusControlProps {
  currentStatus: KitchenStatus;
  statusSettings: StatusSettings | null | undefined;
}

const STATUS_CONFIG = {
  CALM: {
    label: "Calme",
    activeColor: "bg-emerald-600 border-2 border-emerald-400 text-white hover:bg-emerald-700 hover:border-emerald-500",
    inactiveColor: "bg-muted border border-border text-muted-foreground hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:border-emerald-800 dark:hover:text-emerald-300",
  },
  NORMAL: {
    label: "Normal",
    activeColor: "bg-yellow-600 border-2 border-yellow-400 text-white hover:bg-yellow-700 hover:border-yellow-500",
    inactiveColor: "bg-muted border border-border text-muted-foreground hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 dark:hover:bg-yellow-950 dark:hover:border-yellow-800 dark:hover:text-yellow-300",
  },
  RUSH: {
    label: "Rush",
    activeColor: "bg-red-600 border-2 border-red-400 text-white hover:bg-red-700 hover:border-red-500",
    inactiveColor: "bg-muted border border-border text-muted-foreground hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-300",
  },
  STOP: {
    label: "Stop",
    activeColor: "bg-gray-600 border-2 border-gray-400 text-white hover:bg-gray-700 hover:border-gray-500",
    inactiveColor: "bg-muted border border-border text-muted-foreground hover:bg-gray-50 hover:border-gray-200 hover:text-gray-700 dark:hover:bg-gray-950 dark:hover:border-gray-800 dark:hover:text-gray-300",
  },
} as const;

type StatusConfigType = typeof STATUS_CONFIG[KitchenStatus];

export function KitchenStatusControl({ currentStatus, statusSettings }: KitchenStatusControlProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  // Initialiser la config avec les valeurs par défaut ou existantes
  const getInitialConfig = (): StatusSettings => {
    if (statusSettings) {
      return statusSettings;
    }
    return DEFAULT_STATUS_SETTINGS;
  };

  const [config, setConfig] = useState<StatusSettings>(getInitialConfig());
  const [stopMessage, setStopMessage] = useState<string>(
    statusSettings?.STOP?.message || "Nous ne prenons plus de commandes"
  );

  // État pour chaque statut : délai fixe ou plage horaire
  const [useFixedForCalm, setUseFixedForCalm] = useState<boolean>(
    statusSettings?.CALM ? "fixed" in statusSettings.CALM : true
  );
  const [useFixedForNormal, setUseFixedForNormal] = useState<boolean>(
    statusSettings?.NORMAL ? "fixed" in statusSettings.NORMAL : false
  );
  const [useFixedForRush, setUseFixedForRush] = useState<boolean>(
    statusSettings?.RUSH ? "fixed" in statusSettings.RUSH : false
  );

  const handleStatusChange = (status: KitchenStatus) => {
    if (isPending) return;
    
    startTransition(async () => {
      try {
        await updateKitchenStatus(status);
        toast.success(`Statut mis à jour : ${STATUS_CONFIG[status].label}`);
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du statut");
        console.error(error);
      }
    });
  };

  const handleSaveConfig = () => {
    startTransition(async () => {
      try {
        const settingsToSave: StatusSettings = {
          ...config,
          STOP: { message: stopMessage },
        };
        await updateStatusSettings(settingsToSave);
        toast.success("Configuration sauvegardée");
        setIsConfigOpen(false);
      } catch (error) {
        toast.error("Erreur lors de la sauvegarde");
        console.error(error);
      }
    });
  };

  const updateStatusConfig = (
    status: "CALM" | "NORMAL" | "RUSH",
    useFixed: boolean,
    value: number | { min: number; max: number }
  ) => {
    setConfig({
      ...config,
      [status]: useFixed 
        ? { fixed: typeof value === "number" ? value : value.min }
        : { min: typeof value === "number" ? value : value.min, max: typeof value === "number" ? value : value.max },
    });
  };

  return (
    <div className="w-full">
      {/* Barre de contrôle principale */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Charge Cuisine</h3>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                aria-label="Configurer les délais"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configuration des délais</DialogTitle>
                <DialogDescription>
                  Configurez les temps d&apos;attente annoncés pour chaque état de la cuisine.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* CALME */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Calme</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Plage horaire</span>
                      <Switch
                        checked={useFixedForCalm}
                        onCheckedChange={(checked) => {
                          setUseFixedForCalm(checked);
                          const current = config.CALM;
                          if (checked && current && "min" in current) {
                            updateStatusConfig("CALM", true, current.min);
                          } else if (!checked && current && "fixed" in current) {
                            updateStatusConfig("CALM", false, { min: current.fixed, max: current.fixed });
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Délai fixe</span>
                    </div>
                  </div>
                  {useFixedForCalm ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="calm-fixed" className="text-xs text-muted-foreground">
                        Délai (minutes)
                      </Label>
                      <Input
                        id="calm-fixed"
                        type="number"
                        min="0"
                        value={config.CALM && "fixed" in config.CALM ? config.CALM.fixed : 15}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateStatusConfig("CALM", true, value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        L&apos;IA dira &quot;{config.CALM && "fixed" in config.CALM ? config.CALM.fixed : 15} minutes&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="calm-min" className="text-xs text-muted-foreground">
                          Min (minutes)
                        </Label>
                        <Input
                          id="calm-min"
                          type="number"
                          min="0"
                          value={config.CALM && "min" in config.CALM ? config.CALM.min : 15}
                          onChange={(e) => {
                            const min = parseInt(e.target.value) || 0;
                            const max = config.CALM && "max" in config.CALM ? config.CALM.max : 15;
                            updateStatusConfig("CALM", false, { min, max });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="calm-max" className="text-xs text-muted-foreground">
                          Max (minutes)
                        </Label>
                        <Input
                          id="calm-max"
                          type="number"
                          min="0"
                          value={config.CALM && "max" in config.CALM ? config.CALM.max : 15}
                          onChange={(e) => {
                            const max = parseInt(e.target.value) || 0;
                            const min = config.CALM && "min" in config.CALM ? config.CALM.min : 15;
                            updateStatusConfig("CALM", false, { min, max });
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground col-span-2">
                        L&apos;IA dira &quot;entre {config.CALM && "min" in config.CALM ? config.CALM.min : 15} et {config.CALM && "max" in config.CALM ? config.CALM.max : 15} minutes&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* NORMAL */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Normal</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Plage horaire</span>
                      <Switch
                        checked={useFixedForNormal}
                        onCheckedChange={(checked) => {
                          setUseFixedForNormal(checked);
                          const current = config.NORMAL;
                          if (checked && current && "min" in current) {
                            updateStatusConfig("NORMAL", true, current.min);
                          } else if (!checked && current && "fixed" in current) {
                            updateStatusConfig("NORMAL", false, { min: current.fixed, max: current.fixed });
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Délai fixe</span>
                    </div>
                  </div>
                  {useFixedForNormal ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="normal-fixed" className="text-xs text-muted-foreground">
                        Délai (minutes)
                      </Label>
                      <Input
                        id="normal-fixed"
                        type="number"
                        min="0"
                        value={config.NORMAL && "fixed" in config.NORMAL ? config.NORMAL.fixed : 30}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateStatusConfig("NORMAL", true, value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        L&apos;IA dira &quot;{config.NORMAL && "fixed" in config.NORMAL ? config.NORMAL.fixed : 30} minutes&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="normal-min" className="text-xs text-muted-foreground">
                          Min (minutes)
                        </Label>
                        <Input
                          id="normal-min"
                          type="number"
                          min="0"
                          value={config.NORMAL && "min" in config.NORMAL ? config.NORMAL.min : 25}
                          onChange={(e) => {
                            const min = parseInt(e.target.value) || 0;
                            const max = config.NORMAL && "max" in config.NORMAL ? config.NORMAL.max : 35;
                            updateStatusConfig("NORMAL", false, { min, max });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="normal-max" className="text-xs text-muted-foreground">
                          Max (minutes)
                        </Label>
                        <Input
                          id="normal-max"
                          type="number"
                          min="0"
                          value={config.NORMAL && "max" in config.NORMAL ? config.NORMAL.max : 35}
                          onChange={(e) => {
                            const max = parseInt(e.target.value) || 0;
                            const min = config.NORMAL && "min" in config.NORMAL ? config.NORMAL.min : 25;
                            updateStatusConfig("NORMAL", false, { min, max });
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground col-span-2">
                        L&apos;IA dira &quot;entre {config.NORMAL && "min" in config.NORMAL ? config.NORMAL.min : 25} et {config.NORMAL && "max" in config.NORMAL ? config.NORMAL.max : 35} minutes&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* RUSH */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Rush</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Plage horaire</span>
                      <Switch
                        checked={useFixedForRush}
                        onCheckedChange={(checked) => {
                          setUseFixedForRush(checked);
                          const current = config.RUSH;
                          if (checked && current && "min" in current) {
                            updateStatusConfig("RUSH", true, current.min);
                          } else if (!checked && current && "fixed" in current) {
                            updateStatusConfig("RUSH", false, { min: current.fixed, max: current.fixed });
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Délai fixe</span>
                    </div>
                  </div>
                  {useFixedForRush ? (
                    <div className="space-y-1.5">
                      <Label htmlFor="rush-fixed" className="text-xs text-muted-foreground">
                        Délai (minutes)
                      </Label>
                      <Input
                        id="rush-fixed"
                        type="number"
                        min="0"
                        value={config.RUSH && "fixed" in config.RUSH ? config.RUSH.fixed : 50}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateStatusConfig("RUSH", true, value);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        L&apos;IA dira &quot;{config.RUSH && "fixed" in config.RUSH ? config.RUSH.fixed : 50} minutes&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="rush-min" className="text-xs text-muted-foreground">
                          Min (minutes)
                        </Label>
                        <Input
                          id="rush-min"
                          type="number"
                          min="0"
                          value={config.RUSH && "min" in config.RUSH ? config.RUSH.min : 45}
                          onChange={(e) => {
                            const min = parseInt(e.target.value) || 0;
                            const max = config.RUSH && "max" in config.RUSH ? config.RUSH.max : 60;
                            updateStatusConfig("RUSH", false, { min, max });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="rush-max" className="text-xs text-muted-foreground">
                          Max (minutes)
                        </Label>
                        <Input
                          id="rush-max"
                          type="number"
                          min="0"
                          value={config.RUSH && "max" in config.RUSH ? config.RUSH.max : 60}
                          onChange={(e) => {
                            const max = parseInt(e.target.value) || 0;
                            const min = config.RUSH && "min" in config.RUSH ? config.RUSH.min : 45;
                            updateStatusConfig("RUSH", false, { min, max });
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground col-span-2">
                        L&apos;IA dira &quot;entre {config.RUSH && "min" in config.RUSH ? config.RUSH.min : 45} et {config.RUSH && "max" in config.RUSH ? config.RUSH.max : 60} minutes&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* STOP */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Stop</Label>
                  <div className="space-y-1.5">
                    <Label htmlFor="stop-message" className="text-xs text-muted-foreground">
                      Message personnalisé
                    </Label>
                    <Input
                      id="stop-message"
                      type="text"
                      value={stopMessage}
                      onChange={(e) => setStopMessage(e.target.value)}
                      placeholder="Nous ne prenons plus de commandes"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Message annoncé aux clients lorsque le statut est STOP.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfigOpen(false)}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button onClick={handleSaveConfig} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Boutons d'état */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(STATUS_CONFIG) as KitchenStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const isActive = currentStatus === status;
            
            return (
              <Button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isPending}
                className={`
                  h-11 sm:h-12
                  font-medium text-sm
                  transition-all duration-200
                  ${isActive ? config.activeColor : config.inactiveColor}
                  ${isPending ? "opacity-50 cursor-not-allowed" : ""}
                  touch-manipulation
                `}
                aria-pressed={isActive}
                aria-label={`Statut ${config.label}`}
              >
                {isPending && isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{config.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
