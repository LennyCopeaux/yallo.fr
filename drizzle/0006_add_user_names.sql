-- Migration: Ajout des champs prénom, nom et réinitialisation de mot de passe
-- Description: Ajoute les champs firstName, lastName et resetToken/resetTokenExpires à la table users

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_token_expires" timestamp;

