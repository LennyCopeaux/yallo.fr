# Processus de Déploiement - Guide Complet

Ce document explique comment fonctionne le déploiement de staging vers production.

---

## 📋 Vue d'ensemble des environnements

| Environnement | URL Marketing | URL Dashboard | Branche | Usage |
|---------------|--------------|---------------|---------|-------|
| **Local** | `localhost:3000` | `app.localhost:3000` | Toutes | Développement |
| **Staging** | `staging.yallo.fr` | `app.staging.yallo.fr` | `develop` | Tests d'intégration |
| **Production** | `yallo.fr` | `app.yallo.fr` | `main` | Utilisateurs finaux |

---

## 🔄 Processus de déploiement : Staging → Production

### Étape 1 : Développement sur `develop`

1. **Créer une branche feature** :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

2. **Développer et tester localement** :
   ```bash
   npm run dev
   npm run lint
   npm run test:run
   ```

3. **Commit et push** :
   ```bash
   git add .
   git commit -m "feat: ma fonctionnalité"
   git push origin feature/ma-fonctionnalite
   ```

4. **Créer une Pull Request** vers `develop`

### Étape 2 : Validation sur Staging

1. **Merge dans `develop`** :
   - La PR est reviewée
   - Merge dans `develop`

2. **Déploiement automatique** :
   - GitHub Actions détecte le push sur `develop`
   - Le workflow `staging.yml` se déclenche :
     - ✅ Lint + Tests
     - ✅ Build
     - ✅ SonarCloud Analysis
     - ✅ Déploiement Vercel Preview
   - Les domaines `staging.yallo.fr` et `app.staging.yallo.fr` pointent automatiquement vers ce déploiement

3. **Tests sur Staging** :
   - Accéder à `https://staging.yallo.fr`
   - Tester toutes les fonctionnalités
   - Vérifier que tout fonctionne correctement
   - Faire valider par l'équipe si nécessaire

### Étape 3 : Déploiement en Production

Une fois que la version sur staging est **stable et validée** :

1. **Créer une Pull Request** de `develop` vers `main` :
   ```bash
   # Sur GitHub, créer une PR develop → main
   # Ou via CLI :
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

2. **Déploiement automatique** :
   - GitHub Actions détecte le push sur `main`
   - Le workflow `ci.yml` se déclenche :
     - ✅ Lint + Tests
     - ✅ Build
     - ✅ SonarCloud Analysis
     - ✅ Déploiement Vercel Production
   - Les domaines `yallo.fr` et `app.yallo.fr` pointent automatiquement vers ce déploiement

3. **Vérification post-déploiement** :
   - Vérifier que `https://yallo.fr` fonctionne
   - Vérifier que `https://app.yallo.fr` fonctionne
   - Surveiller les logs Vercel pour détecter d'éventuelles erreurs

---

## 🎯 Critères de validation pour passer en Production

Avant de merger `develop` → `main`, vérifier :

- ✅ **Tests passent** : Tous les tests unitaires passent
- ✅ **Lint OK** : Pas d'erreurs de linting critiques
- ✅ **SonarCloud OK** : Pas de nouvelles vulnérabilités critiques
- ✅ **Staging fonctionne** : Toutes les fonctionnalités testées sur staging
- ✅ **Performance OK** : Pas de régression de performance
- ✅ **Sécurité OK** : Pas de nouvelles failles de sécurité

---

## 📊 SonarCloud : Comment ça fonctionne

### Branches dans SonarCloud

- **Branche principale (`main`)** :
  - Marquée comme "Main Branch" dans SonarCloud
  - C'est la référence pour la qualité du code
  - Les métriques principales sont calculées sur cette branche

- **Branche `develop`** :
  - Analysée automatiquement par SonarCloud
  - Les analyses apparaissent dans SonarCloud mais ne sont pas marquées comme "Main Branch"
  - Tu peux voir les analyses en allant dans SonarCloud → Ton projet → Branches

### Coverage (Couverture de code)

Le coverage apparaît dans SonarCloud si :

1. **Le coverage est généré** : `npm run test:coverage` crée `coverage/lcov.info`
2. **Le chemin est correct** : `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
3. **Le fichier existe** : Vérifie que `coverage/lcov.info` est bien créé après `npm run test:coverage`

**Pour voir le coverage dans SonarCloud** :
- Va sur https://sonarcloud.io
- Sélectionne ton projet
- Va dans l'onglet **Measures** → **Coverage**

**Note** : Le coverage n'apparaît que sur la branche `main` si c'est la seule branche analysée avec coverage. Pour voir le coverage de `develop`, il faut que les tests avec coverage soient exécutés sur cette branche aussi.

---

## 🔧 Configuration SonarCloud

### Erreur "No organization with key 'LennyCopeaux'"

Cette erreur signifie que l'organisation `LennyCopeaux` n'existe pas dans SonarCloud.

**Solution** :

1. Va sur https://sonarcloud.io
2. Connecte-toi avec GitHub
3. Vérifie le nom exact de ton organisation :
   - Va dans **My Account** → **Organizations**
   - Note le nom exact (peut être différent de `LennyCopeaux`)
4. Mets à jour `sonar-project.properties` avec le bon nom :
   ```properties
   sonar.organization=ton-nom-exact-d-organisation
   ```
5. Mets aussi à jour `.github/workflows/ci.yml` et `.github/workflows/staging.yml` :
   ```yaml
   -Dsonar.organization=ton-nom-exact-d-organisation
   ```

### Erreur "You are running CI analysis while Automatic Analysis is enabled"

Cette erreur signifie que SonarCloud essaie d'analyser le code de deux façons en même temps :
- **Automatic Analysis** : SonarCloud analyse automatiquement à chaque push GitHub
- **CI Analysis** : GitHub Actions analyse via le workflow

**Pourquoi désactiver Automatic Analysis ?**

- ✅ **Évite les conflits** : Les deux analyses peuvent entrer en conflit
- ✅ **Plus de contrôle** : Tu contrôles quand l'analyse se fait (via CI/CD)
- ✅ **Cohérence** : Toutes les analyses passent par le même pipeline
- ✅ **Meilleure intégration** : Les résultats apparaissent directement dans les PRs GitHub

**Solution** :

1. Va sur https://sonarcloud.io
2. Sélectionne ton projet `LennyCopeaux_yallo.fr`
3. Va dans **Project Settings** → **Analysis Method**
4. Désactive **"Automatic Analysis"**
5. Garde seulement **"CI/CD"** activé

**Alternative** : Si tu veux garder Automatic Analysis, tu peux retirer l'étape SonarCloud des workflows GitHub Actions, mais tu perdras l'intégration dans les PRs.

---

## 🚨 Rollback en cas de problème

Si un déploiement en production cause des problèmes :

### Option 1 : Rollback via Vercel

1. Va sur https://vercel.com
2. Sélectionne ton projet
3. Va dans **Deployments**
4. Trouve le dernier déploiement qui fonctionnait
5. Clique sur **⋯** → **Promote to Production**

### Option 2 : Rollback via Git

1. Identifie le commit stable précédent :
   ```bash
   git log --oneline
   ```

2. Revert le commit problématique :
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. Le workflow CI/CD redéploiera automatiquement

---

## 📝 Checklist avant déploiement Production

- [ ] Tous les tests passent sur `develop`
- [ ] Staging fonctionne correctement
- [ ] Pas d'erreurs critiques dans SonarCloud
- [ ] Variables d'environnement production configurées dans Vercel
- [ ] Base de données production sauvegardée (si modifications de schéma)
- [ ] Équipe informée du déploiement
- [ ] Plan de rollback préparé

---

## 🔐 Sécurité : Séparation Staging/Production

### Recommandations (pour plus tard)

**Base de données** :
- ✅ **Actuellement** : Même DB pour staging et production (OK pour tests)
- 🔄 **Idéalement** : DB séparée pour staging

**Secrets** :
- ✅ **Actuellement** : Même `AUTH_SECRET` (OK pour tests)
- 🔄 **Idéalement** : Secrets différents pour staging et production

**Variables d'environnement** :
- ✅ **Actuellement** : Seule `NEXT_PUBLIC_APP_URL` change (correct)
- ✅ **OK** : Les autres variables peuvent rester identiques

---

## 📚 Ressources

- **Vercel Dashboard** : https://vercel.com/lenny-copeauxs-projects/yallo-fr
- **SonarCloud** : https://sonarcloud.io/project/overview?id=LennyCopeaux_yallo.fr
- **GitHub Actions** : https://github.com/LennyCopeaux/yallo.fr/actions
