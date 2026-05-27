"use client";

import { useState, useTransition, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic2, Save, CheckCircle2, XCircle, Loader2, Play, Square } from "lucide-react";
import { updateVoiceId } from "@/features/settings/actions";
import type { ElevenLabsVoice } from "@/features/settings/actions";

interface VoicePickerCardProps {
  initialVoiceId: string | null;
  voices: ElevenLabsVoice[];
}

export function VoicePickerCard({ initialVoiceId, voices }: VoicePickerCardProps) {
  const [selectedVoiceId, setSelectedVoiceId] = useState(initialVoiceId ?? "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDirty = selectedVoiceId !== (initialVoiceId ?? "");
  const selectedVoice = voices.find((v) => v.voice_id === selectedVoiceId);

  function handlePreview(voice: ElevenLabsVoice) {
    if (!voice.preview_url) return;

    if (playingId === voice.voice_id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voice.preview_url);
    audioRef.current = audio;
    setPlayingId(voice.voice_id);
    audio.play().catch(() => setPlayingId(null));
    audio.onended = () => setPlayingId(null);
  }

  function handleSave() {
    if (!selectedVoiceId) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateVoiceId({ voiceId: selectedVoiceId });
      if (result.success) {
        setSuccessMessage("Voix mise à jour et agent vocal synchronisé.");
      } else {
        setErrorMessage(result.error ?? "Une erreur est survenue.");
      }
    });
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mic2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Voix de l&apos;assistant</CardTitle>
            <CardDescription className="mt-1">
              Choisissez la voix utilisée par votre assistant vocal lors des appels clients.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {voices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune voix disponible.</p>
        ) : (
          <div className="space-y-3">
            <Select
              value={selectedVoiceId}
              onValueChange={(val) => {
                setSelectedVoiceId(val);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une voix…" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    <span className="flex items-center gap-2">
                      {voice.name}
                      {voice.labels?.gender && (
                        <Badge variant="secondary" className="text-xs">
                          {voice.labels.gender === "male" ? "Homme" : voice.labels.gender === "female" ? "Femme" : voice.labels.gender}
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVoice?.preview_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(selectedVoice)}
                disabled={isPending}
                className="gap-2"
              >
                {playingId === selectedVoice.voice_id ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    Arrêter la préecoute
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Préecouter
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={!isDirty || !selectedVoiceId || isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
