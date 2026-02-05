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
  systemPrompt: string | null;
  menuContext: string | null;
  businessHours: string | null;
};

interface AITabProps {
  restaurant: Restaurant;
}

export function AITab({ restaurant }: AITabProps) {
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

  return (
    <div className="space-y-6">
      <Card className={`border ${hasVapiId ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-amber-400/20 bg-amber-400/5'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${hasVapiId ? 'bg-emerald-400/10' : 'bg-amber-400/10'} flex items-center justify-center`}>
              <Bot className={`w-5 h-5 ${hasVapiId ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <p className={`font-medium ${hasVapiId ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasVapiId ? 'IA Active' : 'IA Non configurée'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasVapiId 
                  ? 'L\'assistant vocal est prêt à recevoir des appels'
                  : 'Configurez un ID d\'assistant Vapi pour activer l\'IA'
                }
              </p>
            </div>
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
            <CardDescription>
              L&apos;identifiant de l&apos;assistant Vapi qui gère les appels
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
                  <p className="text-xs text-muted-foreground">
                    L&apos;assistant Vapi est configuré et prêt à recevoir des appels
                  </p>
                </div>
              )}
              {!hasVapiId && (
                <p className="text-sm text-muted-foreground">
                  Cliquez sur le bouton ci-dessous pour créer un assistant Vapi. L&apos;ID sera généré automatiquement.
                </p>
              )}
              {!hasVapiId ? (
                <Button
                  type="button"
                  variant="default"
                  disabled={isCreatingAssistant}
                  onClick={async () => {
                    setIsCreatingAssistant(true);
                    try {
                      const result = await createVapiAssistant(restaurant.id);
                      if (result.success && result.data) {
                        toast.success("Assistant Vapi créé avec succès");
                        router.refresh();
                      } else {
                        toast.error(result.error || "Erreur lors de la création de l'assistant");
                      }
                    } catch {
                      toast.error("Erreur lors de la création de l'assistant");
                    } finally {
                      setIsCreatingAssistant(false);
                    }
                  }}
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
                    onClick={async () => {
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
                    }}
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
                    className="!bg-destructive !text-destructive-foreground hover:!bg-destructive/90 dark:!bg-destructive dark:hover:!bg-destructive/90"
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
                onClick={async () => {
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
                }}
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
                onClick={async () => {
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
                }}
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
                onClick={async () => {
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
                }}
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
              onClick={async () => {
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
              }}
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
