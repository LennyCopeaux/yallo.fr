"use client";

import { motion } from "motion/react";
import { Link2, CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HubRiseInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>HubRise Connecté</CardTitle>
              <CardDescription className="mt-1">
                Synchronisation automatique activée
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Synchronisation en temps réel</h3>
              <p className="text-sm text-muted-foreground">
                Votre menu est automatiquement synchronisé avec HubRise. Toutes les modifications effectuées dans HubRise sont instantanément reflétées dans votre système Yallo.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <RefreshCw className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Gestion centralisée</h3>
              <p className="text-sm text-muted-foreground">
                Les produits, catégories, prix et disponibilités sont gérés directement depuis votre compte HubRise. Vous n&apos;avez pas besoin de modifier votre menu manuellement ici.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <ExternalLink className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Modifier votre menu</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Pour ajouter, modifier ou supprimer des produits, connectez-vous à votre compte HubRise.
              </p>
              <motion.a
                href="https://manager.hubrise.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Accéder à HubRise
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="pt-4 border-t border-border"
          >
            <p className="text-xs text-muted-foreground text-center">
              Les commandes reçues via votre assistant vocal Yallo sont également synchronisées avec HubRise automatiquement.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
