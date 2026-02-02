# Configuration CI/CD - Guide de Setup

Ce guide explique comment configurer les secrets GitHub pour le pipeline CI/CD.

---

## 1. Secrets GitHub (pour CI/CD)

### Où les configurer ?

1. Va sur ton repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique sur **New repository secret**

### Secrets à créer

#### VERCEL_TOKEN
1. Va sur https://vercel.com/account/tokens
2. Clique sur **Create Token**
3. Nom : `GitHub Actions`
4. Scope : Full Account
5. Copie le token et ajoute-le dans GitHub Secrets

#### VERCEL_ORG_ID et VERCEL_PROJECT_ID
1. Dans ton projet, va dans le dossier `.vercel` (créé après `vercel link`)
2. Ouvre `.vercel/project.json`
3. Tu trouveras :
```json
{
  "orgId": "team_xxxxxxxx",      ← VERCEL_ORG_ID
  "projectId": "prj_xxxxxxxx"   ← VERCEL_PROJECT_ID
}
```

**OU** via CLI :
```bash
# Lier le projet (si pas déjà fait)
npx vercel link

# Afficher les IDs
cat .vercel/project.json
```

#### SONAR_TOKEN
1. Va sur https://sonarcloud.io
2. Connecte-toi avec GitHub
3. **My Account** → **Security** → **Generate Tokens**
4. Nom : `GitHub Actions`
5. Copie le token et ajoute-le dans GitHub Secrets

---

## 2. Secrets Vercel (pour l'application)

### Où les configurer ?

1. Va sur https://vercel.com
2. Sélectionne ton projet
3. **Settings** → **Environment Variables**

### Variables à configurer

#### Pour tous les environnements (Production + Preview + Development)

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

#### Pour Production uniquement

```env
NEXT_PUBLIC_APP_URL=https://app.yallo.fr
VAPI_PRIVATE_API_KEY=...
VAPI_PUBLIC_API_KEY=...
```

#### Pour Staging/Preview uniquement

```env
NEXT_PUBLIC_APP_URL=https://app.staging.yallo.fr
# Ou utiliser une DB staging dédiée
DATABASE_URL=postgresql://...staging...
```

---

## 3. Configuration SonarCloud

### Étape 1 : Créer un compte
1. Va sur https://sonarcloud.io
2. Clique sur **Log in with GitHub**
3. Autorise l'accès

### Étape 2 : Importer le projet
1. Clique sur **+** → **Analyze new project**
2. Sélectionne ton repository `yallo`
3. Configure l'analyse (GitHub Actions)

### Étape 3 : Mettre à jour sonar-project.properties
```properties
sonar.projectKey=ton-username_yallo
sonar.organization=ton-username
```

---

## 4. Résumé des secrets

### Secrets GitHub (Settings → Secrets → Actions)

| Secret | Valeur | Source |
|--------|--------|--------|
| `VERCEL_TOKEN` | Token Vercel | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | ID Organisation | .vercel/project.json |
| `VERCEL_PROJECT_ID` | ID Projet | .vercel/project.json |
| `SONAR_TOKEN` | Token SonarCloud | sonarcloud.io → Security |

### Variables Vercel (Project → Settings → Environment Variables)

| Variable | Production | Staging |
|----------|------------|---------|
| `DATABASE_URL` | DB Prod | DB Staging |
| `AUTH_SECRET` | Secret Prod | Secret Staging |
| `NEXT_PUBLIC_APP_URL` | `https://app.yallo.fr` | `https://app.staging.yallo.fr` |
| `VAPI_*` | Clés Vapi | Clés Vapi (ou test) |

---

## 5. Vérification

Une fois tout configuré, tu peux vérifier en :

1. **Créant une PR** → Le pipeline doit se lancer
2. **Vérifiant SonarCloud** → Analyse doit apparaître
3. **Vérifiant le déploiement** → Preview URL doit fonctionner

---

## 6. Troubleshooting

### Erreur "VERCEL_TOKEN not found"
→ Le secret GitHub n'est pas configuré ou mal nommé

### Erreur SonarCloud "Project not found"
→ Mettre à jour `sonar-project.properties` avec le bon `projectKey` et `organization`

### Déploiement échoue sur staging
→ Vérifier les variables d'environnement sur Vercel pour l'environnement Preview
→ **IMPORTANT** : Les domaines `staging.yallo.fr` et `app.staging.yallo.fr` doivent être ajoutés **manuellement** dans Vercel → Settings → Domains avant le premier déploiement
→ Voir `SETUP_DOMAINS.md` pour la configuration complète des domaines
