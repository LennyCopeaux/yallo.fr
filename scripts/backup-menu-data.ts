/**
 * Script de backup des données menu AVANT migration vers l'architecture document-oriented.
 * 
 * NOTE: Ce script est un snapshot historique. Les tables référencées ont été supprimées
 * après la migration vers l'architecture document-oriented (menuData jsonb).
 * 
 * Pour restaurer les données, utiliser les fichiers JSON dans /backups/
 * 
 * Usage (avant migration uniquement): npx tsx scripts/backup-menu-data.ts
 */

console.log("⚠️  Ce script référence des tables supprimées après la migration.");
console.log("Les données de backup sont dans /backups/menu-backup-*.json");
console.log("");
console.log("Structure actuelle: Le menu est stocké dans restaurant.menuData (JSONB)");
