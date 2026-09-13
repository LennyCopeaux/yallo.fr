-- Permet de distinguer un mode RUSH declenche automatiquement (seuil de charge)
-- d'un mode RUSH choisi a la main par le restaurateur : seul le premier doit
-- redescendre automatiquement quand la charge baisse.
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS auto_rush_active BOOLEAN NOT NULL DEFAULT false;
