"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bot, Brain, FileText, Sparkles, Code, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { createVapiAssistant, updateVapiAssistant, deleteVapiAssistant } from "@/app/(admin)/admin/restaurants/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Restaurant = {
  id: string;
  vapiAssistantId: string | null;
  vapiPhoneNumberId: string | null;
  twilioPhoneNumber: string | null;
  systemPrompt: string | null;
  menuContext: string | null;
  businessHours: string | null;
};

interface AITabProps {
  restaurant: Restaurant;
}

function getAIStatusText(
  isFullyOperational: boolean,
  hasVapiId: boolean,
  hasPhoneLinked: boolean,
  hasTwilioNumber: boolean,
  twilioPhoneNumber: string | null
): { title: string; description: string } {
  if (isFullyOperational) {
    return {
      title: "IA Opérationnelle",
      description: `Agent IA actif sur le ${twilioPhoneNumber}`,
    };
  }
  if (hasVapiId && !hasPhoneLinked) {
    return {
      title: "IA partiellement configurée",
      description: "L'assistant existe mais aucun numéro de téléphone n'est lié",
    };
  }
  if (!hasTwilioNumber) {
    return {
      title: "IA Non configurée",
      description: "Renseignez d'abord le numéro Twilio dans l'onglet Téléphonie",
    };
  }
  return {
    title: "IA Non configurée",
    description: "Créez l'agent IA pour activer la prise de commande vocale",
  };
}

export function AITab({ restaurant }: Readonly<AITabProps>) {
  const router = useRouter();
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingMenuJson, setIsGeneratingMenuJson] = useState(false);
  const [isGeneratingHoursJson, setIsGeneratingHoursJson] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [isUpdatingAssistant, setIsUpdatingAssistant] = useState(false);
  const [isDeletingAssistant, setIsDeletingAssistant] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(restaurant.systemPrompt || "");
  const [menuContext, setMenuContext] = useState(restaurant.menuContext || "");
  const [businessHoursJson, setBusinessHoursJson] = useState<string>("");

  useEffect(() => {
    if (restaurant.businessHours) {
      try {
        setBusinessHoursJson(JSON.stringify(JSON.parse(restaurant.businessHours), null, 2));
      } catch {
        setBusinessHoursJson("");
      }
    }
  }, [restaurant.businessHours]);

  const hasVapiId = !!restaurant.vapiAssistantId;
  const hasPhoneLinked = !!restaurant.vapiPhoneNumberId;
  const hasTwilioNumber = !!restaurant.twilioPhoneNumber;
  const isFullyOperational = hasVapiId && hasPhoneLinked;

  const statusText = getAIStatusText(isFullyOperational, hasVapiId, hasPhoneLinked, hasTwilioNumber, restaurant.twilioPhoneNumber);
  const statusCardClassName = isFullyOperational ? "border-emerald-400/20 bg-emerald-400/5" : "border-amber-400/20 bg-amber-400/5";

  const handleCreateAssistant = async () => {
    setIsCreatingAssistant(true);
    try {
      const result = await createVapiAssistant(restaurant.id);
      if (result.success && result.data) {
        toast.success("Agent IA créé et numéro de téléphone lié avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la création de l'assistant");
      }
    } catch {
      toast.error("Erreur lors de la création de l'assistant");
    } finally {
      setIsCreatingAssistant(false);
    }
  };

  const handleUpdateAssistant = async () => {
    setIsUpdatingAssistant(true);
    try {
      const result = await updateVapiAssistant(restaurant.id);
      if (result.success) {
        toast.success("Assistant Vapi mis à jour avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour de l'assistant");
      }
    } catch {
      toast.error("Erreur lors de la mise à jour de l'assistant");
    } finally {
      setIsUpdatingAssistant(false);
    }
  };

  const handleDeleteAssistant = async () => {
    setShowDeleteDialog(false);
    setIsDeletingAssistant(true);
    try {
      const result = await deleteVapiAssistant(restaurant.id);
      if (result.success) {
        toast.success("Agent IA supprimé avec succès");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la suppression de l'agent");
      }
    } catch {
      toast.error("Erreur lors de la suppression de l'agent");
    } finally {
      setIsDeletingAssistant(false);
    }
  };

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/generate-system-prompt`);
      if (!response.ok) throw new Error("Erreur lors de la génération");
      const data = await response.json();
      setSystemPrompt(data.systemPrompt);
      toast.success("Prompt système généré");
    } catch {
      toast.error("Erreur lors de la génération du prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateMenuJson = async () => {
    setIsGeneratingMenuJson(true);
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/generate-menu-json`);
      if (!response.ok) throw new Error("Erreur lors de la génération");
      const data = await response.json();
      if (data.menuJson === "Menu non configuré") {
        setMenuContext("Menu non configuré");
        toast.info("Aucun menu configuré pour ce restaurant");
      } else {
        setMenuContext(data.menuJson);
        toast.success("JSON menu généré");
      }
    } catch {
      toast.error("Erreur lors de la génération du JSON");
    } finally {
      setIsGeneratingMenuJson(false);
    }
  };

  const handleGenerateHoursJson = async () => {
    setIsGeneratingHoursJson(true);
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurant.id}/generate-business-hours-json`);
      if (!response.ok) {
        throw new Error("Erreur lors de la génération");
      }
      const data = await response.json();
      if (data.businessHoursJson === "Horaires d'ouverture non configurée") {
        setBusinessHoursJson("Horaires d'ouverture non configurée");
        toast.info("Aucun horaire configuré pour ce restaurant");
      } else {
        setBusinessHoursJson(data.businessHoursJson);
        toast.success("JSON horaires généré");
      }
    } catch {
      toast.error("Erreur lors de la génération du JSON");
    } finally {
      setIsGeneratingHoursJson(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className={`border ${statusCardClassName}`}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${isFullyOperational ? "bg-emerald-400/10" : "bg-amber-400/10"} flex items-center justify-center`}>
                <Bot className={`w-5 h-5 ${isFullyOperational ? "text-emerald-400" : "text-amber-400"}`} />
              </div>
              <div>
                <p className={`font-medium ${isFullyOperational ? "text-emerald-400" : "text-amber-400"}`}>
                  {statusText.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {statusText.description}
                </p>
              </div>
            </div>
            {hasVapiId && (
              <div className="flex items-center gap-4 ml-[52px] text-xs">
                <span className={`flex items-center gap-1.5 ${hasVapiId ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasVapiId ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  Assistant
                </span>
                <span className={`flex items-center gap-1.5 ${hasPhoneLinked ? 'text-emerald-400' : 'text-red-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasPhoneLinked ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {hasPhoneLinked ? `Numéro lié (${restaurant.twilioPhoneNumber})` : 'Numéro non lié'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Assistant Vapi
            </CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">
                L&apos;identifiant de l&apos;assistant Vapi qui gère les appels (voix ElevenLabs Turbo v2.5 —{" "}
                <code className="font-mono text-xs">ELEVENLABS_VOICE_ID</code> optionnel).
              </span>
              <span className="block text-xs text-muted-foreground border-l-2 border-amber-500/40 pl-2">
                <strong>Vercel / prod :</strong> définissez{" "}
                <code className="font-mono rounded bg-muted px-0.5">VAPI_WEBHOOK_SECRET</code> (chaîne secrète, ex.{" "}
                <code className="font-mono">openssl rand -hex 32</code>
                ) puis cliquez sur <strong>Mettre à jour l&apos;assistant</strong> pour que Vapi envoie ce secret au
                webhook. Sans cela, les commandes vocales échouent (erreur « server rejected »). Optionnel :{" "}
                <code className="font-mono">NEXT_PUBLIC_APP_URL</code> en https vers votre app.
              </span>
              <span className="block text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                Dans le dashboard Vapi, le menu <strong>Tools</strong> peut proposer des outils workspace (
                <code className="font-mono">api_request_tool</code>, etc.) : ce n&apos;est pas obligatoire. La prise de
                commande utilise la fonction <code className="font-mono">submit_order</code> poussée par Yallo dans le
                modèle ; ne la remplacez pas manuellement par un outil vide.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasVapiId && (
                <div className="space-y-2">
                  <Label htmlFor="vapiAssistantId">ID de l&apos;assistant Vapi</Label>
                  <Input
                    id="vapiAssistantId"
                    readOnly
                    disabled
                    value={restaurant.vapiAssistantId || ""}
                    className="bg-muted/50 cursor-not-allowed font-mono"
                  />
                  {hasPhoneLinked && (
                    <p className="text-xs text-emerald-400">
                      Numéro {restaurant.twilioPhoneNumber} lié à l&apos;assistant — les appels sont routés vers l&apos;IA
                    </p>
                  )}
                  {!hasPhoneLinked && (
                    <p className="text-xs text-red-400">
                      Aucun numéro lié — supprimez l&apos;agent et recréez-le après avoir configuré le numéro Twilio
                    </p>
                  )}
                </div>
              )}
              {!hasVapiId && (
                <p className="text-sm text-muted-foreground">
                  {hasTwilioNumber
                    ? `Le numéro ${restaurant.twilioPhoneNumber} sera automatiquement importé dans Vapi et lié à l'agent.`
                    : 'Renseignez d\'abord le numéro Twilio dans l\'onglet Téléphonie, puis revenez ici pour créer l\'agent.'}
                </p>
              )}
              {!hasVapiId ? (
                <Button
                  type="button"
                  variant="default"
                  disabled={isCreatingAssistant || !hasTwilioNumber}
                  onClick={handleCreateAssistant}
                  className="w-full"
                >
                  {isCreatingAssistant ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Créer l&apos;agent IA
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUpdatingAssistant || isDeletingAssistant}
                    onClick={handleUpdateAssistant}
                    className="flex-1"
                  >
                    {isUpdatingAssistant ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mettre à jour
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeletingAssistant}
                    className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Prompt Système
                </CardTitle>
                <CardDescription>
                  Instructions personnalisées pour l&apos;IA de ce restaurant (surcharge le prompt par défaut)
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGeneratingPrompt}
                onClick={handleGeneratePrompt}
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer le Prompt System
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Instructions de l&apos;IA</Label>
              <Textarea
                id="systemPrompt"
                readOnly
                disabled
                value={systemPrompt}
                rows={8}
                placeholder={`Tu es l'assistant téléphonique de [NOM DU RESTAURANT].

Ton rôle est de :
- Prendre les commandes des clients
- Répondre aux questions sur le menu
- Proposer des suggestions appropriées
- Confirmer les commandes et les horaires de retrait

Règles importantes :
- Reste professionnel et amical
- Si tu ne comprends pas, demande de répéter
- Transfère vers un humain si le client le demande`}
                className="bg-muted/50 cursor-not-allowed font-mono text-sm resize-y min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                {systemPrompt.length} / 10 000 caractères (lecture seule)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Contexte Menu
                </CardTitle>
                <CardDescription>
                  Le menu du restaurant au format texte ou JSON. L&apos;IA utilisera ces informations pour comprendre les produits.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGeneratingMenuJson}
                onClick={handleGenerateMenuJson}
              >
                {isGeneratingMenuJson ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Générer JSON Menu
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <Label htmlFor="menuContext">Données du menu</Label>
                <Textarea
                  id="menuContext"
                  readOnly
                  disabled
                  value={menuContext}
                  rows={12}
                  placeholder={`{
  "categories": [
    {
      "name": "Kebabs",
      "items": [
        { "name": "Kebab Poulet", "price": 7.50, "sizes": ["Normal", "XL"] },
        { "name": "Kebab Viande", "price": 7.50, "sizes": ["Normal", "XL"] }
      ]
    },
    {
      "name": "Boissons",
      "items": [
        { "name": "Coca-Cola", "price": 2.50 },
        { "name": "Fanta", "price": 2.50 }
      ]
    }
  ]
}`}
                  className="bg-muted/50 cursor-not-allowed font-mono text-sm resize-y min-h-[300px]"
                />
                <p className="text-xs text-muted-foreground">
                  {menuContext.length} / 50 000 caractères (lecture seule)
                </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Horaires d&apos;ouverture
                </CardTitle>
                <CardDescription>
                  Configuration des horaires au format JSON (utilisés par l&apos;IA pour informer les clients)
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isGeneratingHoursJson}
                onClick={handleGenerateHoursJson}
              >
                {isGeneratingHoursJson ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 mr-2" />
                    Générer JSON Horaires
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="businessHours">Horaires (JSON)</Label>
              <Textarea
                id="businessHours"
                readOnly
                disabled
                value={businessHoursJson}
                rows={12}
                placeholder={`{
  "timezone": "Europe/Paris",
  "schedule": {
    "monday": { "open": "11:00", "close": "22:00" },
    "tuesday": { "open": "11:00", "close": "22:00" }
  }
}`}
                className="bg-muted/50 cursor-not-allowed font-mono text-sm resize-y min-h-[250px]"
              />
              <p className="text-xs text-muted-foreground">
                Format JSON avec les jours de la semaine et les horaires d&apos;ouverture/fermeture (lecture seule)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;agent IA</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l&apos;agent IA ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssistant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAssistant ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
