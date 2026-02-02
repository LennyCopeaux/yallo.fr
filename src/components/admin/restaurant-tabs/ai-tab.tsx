"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Bot, Brain, FileText, Sparkles, Code } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantAI, createVapiAssistant, updateVapiAssistant } from "@/app/(admin)/admin/restaurants/actions";

const formSchema = z.object({
  vapiAssistantId: z.string().max(100).optional(),
  systemPrompt: z.string().max(10000, "Prompt trop long").optional(),
  menuContext: z.string().max(50000, "Menu trop long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Restaurant = {
  id: string;
  vapiAssistantId: string | null;
  systemPrompt: string | null;
  menuContext: string | null;
};

interface AITabProps {
  restaurant: Restaurant;
}

export function AITab({ restaurant }: AITabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingMenuJson, setIsGeneratingMenuJson] = useState(false);
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [isUpdatingAssistant, setIsUpdatingAssistant] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vapiAssistantId: restaurant.vapiAssistantId || "",
      systemPrompt: restaurant.systemPrompt || "",
      menuContext: restaurant.menuContext || "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    const result = await updateRestaurantAI(restaurant.id, {
      vapiAssistantId: data.vapiAssistantId || null,
      systemPrompt: data.systemPrompt || null,
      menuContext: data.menuContext || null,
    });

    if (result.success) {
      toast.success("Configuration IA mise à jour");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }

    setIsLoading(false);
  }

  const hasVapiId = !!form.watch("vapiAssistantId");

  return (
    <div className="space-y-6">
      {/* Status Card */}
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Assistant Vapi */}
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
              <div className="space-y-2">
                <Label htmlFor="vapiAssistantId">ID de l&apos;assistant Vapi</Label>
                <Input
                  id="vapiAssistantId"
                  {...form.register("vapiAssistantId")}
                  disabled={isLoading || isCreatingAssistant}
                  placeholder="a7f3b2c9-8d4e-4f1a-9b6c-3e5d7a8f2c1b"
                  className="bg-background/50 border-border focus:border-primary/50 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {hasVapiId 
                    ? "L'assistant Vapi est configuré et prêt à recevoir des appels"
                    : "Créez un assistant Vapi ou entrez manuellement l'ID existant"
                  }
                </p>
              </div>
              {!hasVapiId ? (
                <Button
                  type="button"
                  variant="default"
                  disabled={isCreatingAssistant || isLoading}
                  onClick={async () => {
                    setIsCreatingAssistant(true);
                    try {
                      const result = await createVapiAssistant(restaurant.id);
                      if (result.success && result.data) {
                        form.setValue("vapiAssistantId", result.data.assistantId);
                        toast.success("Assistant Vapi créé avec succès");
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
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdatingAssistant || isLoading}
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
                  className="w-full"
                >
                  {isUpdatingAssistant ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Mettre à jour l&apos;agent IA
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prompt Système */}
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
                    form.setValue("systemPrompt", data.systemPrompt);
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
                {...form.register("systemPrompt")}
                disabled={isLoading}
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
                className="bg-background/50 border-border focus:border-primary/50 font-mono text-sm resize-y min-h-[200px]"
              />
              {form.formState.errors.systemPrompt && (
                <p className="text-sm text-red-400">{form.formState.errors.systemPrompt.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.watch("systemPrompt")?.length || 0} / 10 000 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Context */}
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
                    form.setValue("menuContext", data.menuJson);
                    toast.success("JSON menu généré");
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
                  {...form.register("menuContext")}
                  disabled={isLoading}
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
                  className="bg-background/50 border-border focus:border-primary/50 font-mono text-sm resize-y min-h-[300px]"
                />
                {form.formState.errors.menuContext && (
                  <p className="text-sm text-red-400">{form.formState.errors.menuContext.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {form.watch("menuContext")?.length || 0} / 50 000 caractères
                </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-black hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer la configuration IA
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
