"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Save, Trash2, Loader2, ImageIcon, X } from "lucide-react";
import { MenuData } from "@/db/schema";
import { generateMenuFromImages, saveMenuData, clearMenuData } from "@/features/menu/actions";
import { toast } from "sonner";
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

type MenuManagerProps = {
  initialMenuData: MenuData | null;
};

type MenuState = "initial" | "generated" | "saved";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      const error = reader.error ?? new Error("Failed to read file");
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    reader.readAsDataURL(file);
  });
}

export function MenuManager({ initialMenuData }: Readonly<MenuManagerProps>) {
  const [menuState, setMenuState] = useState<MenuState>(
    initialMenuData ? "saved" : "initial"
  );
  const [menuJson, setMenuJson] = useState<string>(
    initialMenuData ? JSON.stringify(initialMenuData, null, 2) : ""
  );
  const [imageItems, setImageItems] = useState<Array<{ id: string; data: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (imageItems.length + acceptedFiles.length > 5) {
      toast.error("Maximum 5 images autorisées");
      return;
    }

    const base64List = await Promise.all(acceptedFiles.map(readFileAsDataUrl));
    const newItems = base64List.map((data) => ({
      id: crypto.randomUUID(),
      data,
    }));
    setImageItems((prev) => [...prev, ...newItems]);
  }, [imageItems.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeImage = (id: string) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGenerate = async () => {
    if (imageItems.length === 0) {
      toast.error("Ajoutez au moins une image du menu");
      return;
    }

    setIsGenerating(true);
    
    // Afficher le toast
    toast.info("Traitement en cours", {
      description: "Cela peut prendre quelques minutes",
      duration: 60000, // 1 minute
    });

    try {
      const result = await generateMenuFromImages(imageItems.map((item) => item.data));

      if (result.success && result.menuData) {
        setMenuJson(JSON.stringify(result.menuData, null, 2));
        setMenuState("generated");
        toast.success("Menu généré avec succès !");
      } else {
        toast.error(result.error || "Erreur lors de la génération");
      }
    } catch {
      toast.error("Erreur lors de la génération du menu");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    let parsedMenu: MenuData;
    try {
      parsedMenu = JSON.parse(menuJson);
    } catch {
      toast.error("JSON invalide. Vérifiez la syntaxe.");
      return;
    }

    if (!parsedMenu.categories || !Array.isArray(parsedMenu.categories)) {
      toast.error("Le JSON doit contenir un tableau 'categories'");
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveMenuData(parsedMenu);

      if (result.success) {
        setMenuState("saved");
        toast.success("Menu enregistré avec succès !");
      } else {
        toast.error(result.error || "Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement du menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setMenuJson("");
    setImageItems([]);
    setMenuState("initial");
  };

  const handleClear = async () => {
    setShowDeleteDialog(false);
    
    try {
      const result = await clearMenuData();

      if (result.success) {
        setMenuJson("");
        setImageItems([]);
        setMenuState("initial");
        toast.success("Menu supprimé");
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch {
      toast.error("Erreur lors de la suppression du menu");
    }
  };

  const hasMenuData = menuJson.trim().length > 0;
  const showMagicImport = menuState === "initial";
  const showEditor = menuState === "generated" || menuState === "saved";

  return (
    <div className="space-y-6">
      {showMagicImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Magic Import
            </CardTitle>
            <CardDescription>
              Uploadez des photos de votre menu papier et l&apos;IA extraira automatiquement les produits, prix et options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary">Déposez les images ici...</p>
              ) : (
                <div>
                  <p className="text-muted-foreground">
                    Glissez-déposez vos photos de menu ici
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    ou cliquez pour sélectionner (max 5 images, 20MB chacune)
                  </p>
                </div>
              )}
            </div>

            {imageItems.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {imageItems.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.data}
                      alt={`Menu page ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(item.id)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={imageItems.length === 0 || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer le menu avec l&apos;IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {showEditor && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Éditeur de Menu (JSON)
              </CardTitle>
              <CardDescription>
                Modifiez directement le JSON du menu. Structure : categories, products, skus, option_lists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={menuJson}
                onChange={(e) => {
                  setMenuJson(e.target.value);
                }}
                placeholder={`{
  "categories": [
    {
      "name": "Tacos",
      "products": [
        {
          "name": "Tacos M",
          "skus": [{ "ref": "TAC-M", "name": "Standard", "price": "8.00" }],
          "option_list_refs": ["sauces"]
        }
      ]
    }
  ],
  "option_lists": [
    {
      "ref": "sauces",
      "name": "Sauces",
      "options": [{ "ref": "sauce-blanche", "name": "Sauce Blanche", "price": "0.00" }]
    }
  ]
}`}
                className="font-mono text-sm min-h-[400px] resize-y"
              />

            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            {menuState === "generated" ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasMenuData || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={!hasMenuData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasMenuData || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le menu</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer tout le menu ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
