-- Migration: Suppression de la table pricing_config
-- Description: Cette table est remplacée par pricing_plans qui gère les 3 offres individuellement

DROP TABLE IF EXISTS "pricing_config";
