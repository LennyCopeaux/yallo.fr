"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Save, Trash2, AlertCircle, CheckCircle2, Loader2, ImageIcon, X } from "lucide-react";
import { MenuData } from "@/db/schema";
import { generateMenuFromImages, saveMenuData, clearMenuData } from "@/features/menu/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MenuManagerProps = {
  initialMenuData: MenuData | null;
};

export function MenuManager({ initialMenuData }: MenuManagerProps) {
  const [menuJson, setMenuJson] = useState<string>(
    initialMenuData ? JSON.stringify(initialMenuData, null, 2) : ""
  );
  const [images, setImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setSuccess(null);

    if (images.length + acceptedFiles.length > 5) {
      setError("Maximum 5 images autorisées");
      return;
    }

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImages((prev) => [...prev, base64]);
        setImagePreviews((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Ajoutez au moins une image du menu");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateMenuFromImages(images);

      if (result.success && result.menuData) {
        setMenuJson(JSON.stringify(result.menuData, null, 2));
        setSuccess("Menu généré avec succès ! Vérifiez et modifiez si nécessaire.");
      } else {
        setError(result.error || "Erreur lors de la génération");
      }
    } catch {
      setError("Erreur lors de la génération du menu");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    let parsedMenu: MenuData;
    try {
      parsedMenu = JSON.parse(menuJson);
    } catch {
      setError("JSON invalide. Vérifiez la syntaxe.");
      return;
    }

    if (!parsedMenu.categories || !Array.isArray(parsedMenu.categories)) {
      setError("Le JSON doit contenir un tableau 'categories'");
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveMenuData(parsedMenu);

      if (result.success) {
        setSuccess("Menu sauvegardé avec succès !");
      } else {
        setError(result.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      setError("Erreur lors de la sauvegarde du menu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer tout le menu ?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await clearMenuData();

      if (result.success) {
        setMenuJson("");
        setImages([]);
        setImagePreviews([]);
        setSuccess("Menu supprimé");
      } else {
        setError(result.error || "Erreur lors de la suppression");
      }
    } catch {
      setError("Erreur lors de la suppression du menu");
    }
  };

  const hasMenuData = menuJson.trim().length > 0;

  return (
    <>
      <Dialog open={isGenerating}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              Analyse en cours...
            </DialogTitle>
            <DialogDescription className="pt-2">
              L&apos;IA analyse vos images de menu. Cela peut prendre quelques minutes selon le nombre et la complexité des images.
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                Veuillez patienter, ne fermez pas cette page.
              </span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
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

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Menu page ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
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
            disabled={images.length === 0 || isGenerating}
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
              setError(null);
              setSuccess(null);
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

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={!hasMenuData || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder le menu
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={!hasMenuData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
