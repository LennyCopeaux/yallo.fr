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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Save, Bot, Brain, FileText, AlertCircle, Sparkles, Code } from "lucide-react";
import { toast } from "sonner";
import { updateRestaurantAI } from "@/app/(admin)/admin/restaurants/actions";

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
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generatedMenuJson, setGeneratedMenuJson] = useState<string | null>(null);

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
            <div className="space-y-2">
              <Label htmlFor="vapiAssistantId">ID de l&apos;assistant Vapi</Label>
              <Input
                id="vapiAssistantId"
                {...form.register("vapiAssistantId")}
                disabled={isLoading}
                placeholder="asst_xxxxxxxxxxxxxxxxxxxx"
                className="bg-background/50 border-border focus:border-primary/50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Trouvez cet ID dans votre dashboard Vapi
              </p>
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
              <Dialog>
                <DialogTrigger asChild>
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
                        setGeneratedPrompt(data.systemPrompt);
                      } catch (error) {
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
                </DialogTrigger>
                {generatedPrompt && (
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Prompt Système Généré</DialogTitle>
                      <DialogDescription>
                        Ce prompt sera utilisé par Vapi lors des appels clients (mode lecture seule pour debug)
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      readOnly
                      value={generatedPrompt}
                      rows={20}
                      className="font-mono text-sm bg-background/50"
                    />
                  </DialogContent>
                )}
              </Dialog>
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
              <Dialog>
                <DialogTrigger asChild>
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
                        setGeneratedMenuJson(data.menuJson);
                      } catch (error) {
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
                </DialogTrigger>
                {generatedMenuJson && (
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>JSON Menu Généré</DialogTitle>
                      <DialogDescription>
                        Format JSON du menu actuel pour vérification technique
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      readOnly
                      value={generatedMenuJson}
                      rows={20}
                      className="font-mono text-sm bg-background/50"
                    />
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Alert */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
                <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-cyan-400 font-medium">Format recommandé</p>
                  <p className="text-muted-foreground mt-1">
                    Utilisez un format structuré (JSON ou liste) avec les noms de produits, prix, et variantes disponibles.
                  </p>
                </div>
              </div>

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
