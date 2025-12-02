# Guide d'utilisation du script de seed du menu

## Prérequis

1. **Base de données configurée** : Assurez-vous que votre `.env.local` contient la variable `DATABASE_URL`
2. **Restaurant créé** : Vous devez avoir créé un restaurant dans le panel admin
3. **Utilisateur Owner créé** : Vous devez avoir créé un utilisateur avec le rôle OWNER

## Étapes pour lancer le seed

### 1. Modifier la configuration dans le script

Ouvrez le fichier `src/db/seed-menu.ts` et modifiez les constantes en haut du fichier :

```typescript
const RESTAURANT_NAME = "Kebab La Medina"; // Remplacez par le nom de VOTRE restaurant
const OWNER_EMAIL = "owner@kebab-lamedina.fr"; // Remplacez par l'email de VOTRE owner
```

### 2. Lancer le script

Vous avez **deux options** :

#### Option A : Via le script npm (recommandé)
```bash
pnpm seed:menu
```

#### Option B : Directement avec tsx
```bash
npx tsx src/db/seed-menu.ts
```

### 3. Vérifier le résultat

Le script va :
- ✅ Créer tous les ingrédients (viandes, sauces, suppléments, boissons, pains)
- ✅ Créer les catégories (Sandwichs, Tacos, Assiettes, etc.)
- ✅ Créer les produits et leurs variations avec les prix
- ✅ Créer les groupes de modificateurs et lier les ingrédients

Si tout se passe bien, vous verrez :
```
🌱 Démarrage du seed du menu...
✅ Restaurant trouvé: Kebab La Medina (ID: ...)
✅ X ingrédients créés
✅ X catégories créées
✅ Produits et variations créés
✅ Groupes de modificateurs et modificateurs créés
🎉 Seed terminé avec succès !
```

## En cas d'erreur

### Erreur : "Restaurant non trouvé"
- Vérifiez que le nom du restaurant correspond exactement à celui dans la base de données
- Vous pouvez vérifier avec : `SELECT name FROM restaurants;`

### Erreur : "Owner non trouvé"
- Vérifiez que l'email de l'owner correspond exactement
- Vous pouvez vérifier avec : `SELECT email FROM users WHERE role = 'OWNER';`

### Erreur de connexion à la base de données
- Vérifiez votre `.env.local` et la variable `DATABASE_URL`
- Assurez-vous que la base de données est accessible

## Note importante

⚠️ **Le script peut être exécuté plusieurs fois** mais il créera des doublons si vous le relancez. Pour éviter cela, vous pouvez :
1. Supprimer les données existantes avant de relancer
2. Ajouter des vérifications dans le script pour éviter les doublons

