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

interface StatusDelayConfigProps {
  status: "CALM" | "NORMAL" | "RUSH";
  label: string;
  config: StatusSettings;
  useFixed: boolean;
  onUseFixedChange: (checked: boolean) => void;
  onConfigUpdate: (status: "CALM" | "NORMAL" | "RUSH", useFixed: boolean, value: number | { min: number; max: number }) => void;
  defaultFixed: number;
  defaultMin: number;
  defaultMax: number;
}

function StatusDelayConfig({
  status,
  label,
  config,
  useFixed,
  onUseFixedChange,
  onConfigUpdate,
  defaultFixed,
  defaultMin,
  defaultMax,
}: StatusDelayConfigProps) {
  const currentConfig = config[status];
  const fixedValue = currentConfig && "fixed" in currentConfig ? currentConfig.fixed : defaultFixed;
  const minValue = currentConfig && "min" in currentConfig ? currentConfig.min : defaultMin;
  const maxValue = currentConfig && "max" in currentConfig ? currentConfig.max : defaultMax;

  function handleSwitchChange(checked: boolean) {
    onUseFixedChange(checked);
    if (checked && currentConfig && "min" in currentConfig) {
      onConfigUpdate(status, true, currentConfig.min);
    } else if (!checked && currentConfig && "fixed" in currentConfig) {
      onConfigUpdate(status, false, { min: currentConfig.fixed, max: currentConfig.fixed });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Plage horaire</span>
          <Switch checked={useFixed} onCheckedChange={handleSwitchChange} />
          <span className="text-xs text-muted-foreground">Délai fixe</span>
        </div>
      </div>
      {useFixed ? (
        <div className="space-y-1.5">
          <Label htmlFor={`${status.toLowerCase()}-fixed`} className="text-xs text-muted-foreground">
            Délai (minutes)
          </Label>
          <Input
            id={`${status.toLowerCase()}-fixed`}
            type="number"
            min="0"
            value={fixedValue}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value) || 0;
              onConfigUpdate(status, true, value);
            }}
          />
          <p className="text-xs text-muted-foreground">
            L&apos;IA dira &quot;{fixedValue} minutes&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${status.toLowerCase()}-min`} className="text-xs text-muted-foreground">
              Min (minutes)
            </Label>
            <Input
              id={`${status.toLowerCase()}-min`}
              type="number"
              min="0"
              value={minValue}
              onChange={(e) => {
                const min = Number.parseInt(e.target.value) || 0;
                onConfigUpdate(status, false, { min, max: maxValue });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${status.toLowerCase()}-max`} className="text-xs text-muted-foreground">
              Max (minutes)
            </Label>
            <Input
              id={`${status.toLowerCase()}-max`}
              type="number"
              min="0"
              value={maxValue}
              onChange={(e) => {
                const max = Number.parseInt(e.target.value) || 0;
                onConfigUpdate(status, false, { min: minValue, max });
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground col-span-2">
            L&apos;IA dira &quot;entre {minValue} et {maxValue} minutes&quot;
          </p>
        </div>
      )}
    </div>
  );
}

export function KitchenStatusControl({ currentStatus, statusSettings }: Readonly<KitchenStatusControlProps>) {
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
                <StatusDelayConfig
                  status="CALM"
                  label="Calme"
                  config={config}
                  useFixed={useFixedForCalm}
                  onUseFixedChange={setUseFixedForCalm}
                  onConfigUpdate={updateStatusConfig}
                  defaultFixed={15}
                  defaultMin={15}
                  defaultMax={15}
                />
                <StatusDelayConfig
                  status="NORMAL"
                  label="Normal"
                  config={config}
                  useFixed={useFixedForNormal}
                  onUseFixedChange={setUseFixedForNormal}
                  onConfigUpdate={updateStatusConfig}
                  defaultFixed={30}
                  defaultMin={25}
                  defaultMax={35}
                />
                <StatusDelayConfig
                  status="RUSH"
                  label="Rush"
                  config={config}
                  useFixed={useFixedForRush}
                  onUseFixedChange={setUseFixedForRush}
                  onConfigUpdate={updateStatusConfig}
                  defaultFixed={50}
                  defaultMin={45}
                  defaultMax={60}
                />

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
