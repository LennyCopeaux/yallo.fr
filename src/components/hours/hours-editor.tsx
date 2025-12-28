"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessHours } from "@/features/hours/actions";

const days = [
  { key: "monday", label: "Lundi", short: "Lun" },
  { key: "tuesday", label: "Mardi", short: "Mar" },
  { key: "wednesday", label: "Mercredi", short: "Mer" },
  { key: "thursday", label: "Jeudi", short: "Jeu" },
  { key: "friday", label: "Vendredi", short: "Ven" },
  { key: "saturday", label: "Samedi", short: "Sam" },
  { key: "sunday", label: "Dimanche", short: "Dim" },
] as const;

const timeSlotSchema = z.object({
  open: z.string(),
  close: z.string(),
});

const dayScheduleSchema = z.union([
  z.object({
    open: z.string(),
    close: z.string(),
  }),
  z.object({
    lunch: timeSlotSchema,
    dinner: timeSlotSchema,
  }),
]);

const formSchema = z.object({
  schedule: z.record(
    z.string(),
    z.object({
      enabled: z.boolean(),
      hasTwoSlots: z.boolean(),
      singleSlot: timeSlotSchema.optional(),
      lunch: timeSlotSchema.optional(),
      dinner: timeSlotSchema.optional(),
    }).optional()
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface HoursEditorProps {
  initialHours: {
    schedule: Record<string, { open: string; close: string } | { lunch: { open: string; close: string }; dinner: { open: string; close: string } }>;
  };
}

function parseScheduleDay(daySchedule: { open: string; close: string } | { lunch: { open: string; close: string }; dinner: { open: string; close: string } } | undefined) {
  if (!daySchedule) {
    return {
      enabled: false,
      hasTwoSlots: false,
      singleSlot: { open: "11:00", close: "22:00" },
      lunch: { open: "11:00", close: "14:00" },
      dinner: { open: "18:00", close: "22:00" },
    };
  }

  if ("lunch" in daySchedule && "dinner" in daySchedule) {
    return {
      enabled: true,
      hasTwoSlots: true,
      singleSlot: undefined,
      lunch: daySchedule.lunch,
      dinner: daySchedule.dinner,
    };
  }

  if ("open" in daySchedule && "close" in daySchedule) {
    return {
      enabled: true,
      hasTwoSlots: false,
      singleSlot: { open: daySchedule.open, close: daySchedule.close },
      lunch: { open: "11:00", close: "14:00" },
      dinner: { open: "18:00", close: "22:00" },
    };
  }

  return {
    enabled: false,
    hasTwoSlots: false,
    singleSlot: { open: "11:00", close: "22:00" },
    lunch: { open: "11:00", close: "14:00" },
    dinner: { open: "18:00", close: "22:00" },
  };
}

export function HoursEditor({ initialHours }: HoursEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const defaultSchedule = Object.fromEntries(
    days.map((day) => [
      day.key,
      parseScheduleDay(initialHours.schedule[day.key]),
    ])
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schedule: defaultSchedule,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSaving(true);
    try {
      const scheduleToSave: Record<string, { open: string; close: string } | { lunch: { open: string; close: string }; dinner: { open: string; close: string } }> = {};
      
      Object.entries(data.schedule).forEach(([day, config]) => {
        if (!config?.enabled) return;

        if (config.hasTwoSlots && config.lunch && config.dinner) {
          scheduleToSave[day] = {
            lunch: {
              open: config.lunch.open,
              close: config.lunch.close,
            },
            dinner: {
              open: config.dinner.open,
              close: config.dinner.close,
            },
          };
        } else if (config.singleSlot) {
          scheduleToSave[day] = {
            open: config.singleSlot.open,
            close: config.singleSlot.close,
          };
        }
      });

      const businessHours = {
        timezone: "Europe/Paris",
        schedule: scheduleToSave,
      };

      const formData = new FormData();
      formData.append("businessHours", JSON.stringify(businessHours));

      const result = await updateBusinessHours(formData);
      if (result.success) {
        toast.success("Horaires enregistrés");
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="bg-card/30 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Configuration des horaires
          </CardTitle>
          <CardDescription>
            Définissez les horaires d&apos;ouverture pour chaque jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {days.map((day) => {
            const daySchedule = form.watch(`schedule.${day.key}`);
            const enabled = daySchedule?.enabled ?? false;
            const hasTwoSlots = daySchedule?.hasTwoSlots ?? false;

            return (
              <div
                key={day.key}
                className={`p-4 rounded-xl border transition-all ${
                  enabled
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background/30"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                      enabled
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {day.short}
                    </div>
                    <Label className="text-base font-medium cursor-pointer" htmlFor={`switch-${day.key}`}>
                      {day.label}
                    </Label>
                  </div>
                  <Switch
                    id={`switch-${day.key}`}
                    checked={enabled}
                    onCheckedChange={(checked) => {
                      form.setValue(`schedule.${day.key}.enabled`, checked, { shouldValidate: true });
                    }}
                    disabled={isSaving}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                {enabled && (
                    <div className="space-y-4 pl-[52px]">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant={hasTwoSlots ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          form.setValue(`schedule.${day.key}.hasTwoSlots`, false, { shouldValidate: true });
                        }}
                        disabled={isSaving}
                        className={hasTwoSlots ? "" : "bg-primary text-black hover:bg-primary/90"}
                      >
                        Un seul créneau
                      </Button>
                      <Button
                        type="button"
                        variant={hasTwoSlots ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          form.setValue(`schedule.${day.key}.hasTwoSlots`, true, { shouldValidate: true });
                        }}
                        disabled={isSaving}
                        className={hasTwoSlots ? "bg-primary text-black hover:bg-primary/90" : ""}
                      >
                        Midi et soir
                      </Button>
                    </div>

                    {hasTwoSlots ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Midi</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              {...form.register(`schedule.${day.key}.lunch.open`)}
                              disabled={isSaving}
                              className="flex-1 bg-background border-border focus:border-primary/50"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              {...form.register(`schedule.${day.key}.lunch.close`)}
                              disabled={isSaving}
                              className="flex-1 bg-background border-border focus:border-primary/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Soir</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              {...form.register(`schedule.${day.key}.dinner.open`)}
                              disabled={isSaving}
                              className="flex-1 bg-background border-border focus:border-primary/50"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              {...form.register(`schedule.${day.key}.dinner.close`)}
                              disabled={isSaving}
                              className="flex-1 bg-background border-border focus:border-primary/50"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          {...form.register(`schedule.${day.key}.singleSlot.open`)}
                          disabled={isSaving}
                          className="flex-1 bg-background border-border focus:border-primary/50"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          {...form.register(`schedule.${day.key}.singleSlot.close`)}
                          disabled={isSaving}
                          className="flex-1 bg-background border-border focus:border-primary/50"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end pt-6 border-t border-border mt-6">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-black hover:bg-primary/90 min-h-[44px] px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les horaires
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
