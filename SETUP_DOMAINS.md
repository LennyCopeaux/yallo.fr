# Configuration des Domaines - Guide Complet

Ce guide explique comment configurer les domaines `staging.yallo.fr` et `app.staging.yallo.fr` sur Vercel et OVH.

---

## 📋 Vue d'ensemble

| Environnement | Marketing | Dashboard | Configuration |
|---------------|-----------|-----------|---------------|
| **Production** | `yallo.fr` | `app.yallo.fr` | Déjà configuré |
| **Staging** | `staging.yallo.fr` | `app.staging.yallo.fr` | À configurer |

---

## 🔧 Étape 1 : Configuration sur Vercel

### 1.1 Ajouter les domaines dans Vercel

1. Va sur https://vercel.com
2. Sélectionne ton projet **yallo-fr**
3. Va dans **Settings** → **Domains**
4. Clique sur **Add Domain**

#### Ajouter `staging.yallo.fr` :
- Domaine : `staging.yallo.fr`
- Clique sur **Add**
- Vercel va te donner des instructions DNS (note-les)

#### Ajouter `app.staging.yallo.fr` :
- Domaine : `app.staging.yallo.fr`
- Clique sur **Add**
- Vercel va te donner des instructions DNS (note-les)

### 1.2 Vérifier la configuration

Vercel devrait te donner quelque chose comme :
```
staging.yallo.fr → CNAME → cname.vercel-dns.com
app.staging.yallo.fr → CNAME → cname.vercel-dns.com
```

**OU** si tu utilises des enregistrements A :
```
staging.yallo.fr → A → 76.76.21.21
app.staging.yallo.fr → A → 76.76.21.21
```

---

## 🌐 Étape 2 : Configuration DNS sur OVH

### 2.1 Accéder à la gestion DNS

1. Connecte-toi sur https://www.ovh.com/manager/web/
2. Va dans **Domaines** → Sélectionne `yallo.fr`
3. Clique sur **Zone DNS**

### 2.2 Ajouter les enregistrements

#### Option A : CNAME (Recommandé)

Ajoute deux nouveaux enregistrements **CNAME** :

| Type | Sous-domaine | Cible | TTL |
|------|--------------|-------|-----|
| CNAME | `staging` | `cname.vercel-dns.com` | 3600 |
| CNAME | `app.staging` | `cname.vercel-dns.com` | 3600 |

**Note :** Pour `app.staging`, tu dois créer un sous-domaine `app` dans `staging`, donc :
- Sous-domaine : `app.staging`
- Cible : `cname.vercel-dns.com`

#### Option B : A (Si Vercel le demande)

Ajoute deux nouveaux enregistrements **A** :

| Type | Sous-domaine | Cible | TTL |
|------|--------------|-------|-----|
| A | `staging` | `76.76.21.21` | 3600 |
| A | `app.staging` | `76.76.21.21` | 3600 |

### 2.3 Propagation DNS

- La propagation peut prendre **5 minutes à 48 heures**
- Tu peux vérifier avec : `dig staging.yallo.fr` ou `nslookup staging.yallo.fr`

---

## ⚙️ Étape 3 : Configuration Vercel pour Staging

### 3.1 Variables d'environnement

Dans Vercel → **Settings** → **Environment Variables**, configure :

#### Pour l'environnement **Preview** (staging) :

```env
NEXT_PUBLIC_APP_URL=https://app.staging.yallo.fr
DATABASE_URL=postgresql://... (DB staging si tu en as une)
AUTH_SECRET=... (secret staging)
```

#### Pour l'environnement **Production** :

```env
NEXT_PUBLIC_APP_URL=https://app.yallo.fr
DATABASE_URL=postgresql://... (DB production)
AUTH_SECRET=... (secret production)
```

### 3.2 Assigner les domaines aux environnements

Dans **Settings** → **Domains**, pour chaque domaine :

1. Clique sur le domaine (`staging.yallo.fr`)
2. Dans **Environment**, sélectionne :
   - ✅ **Production** (si tu veux que `main` déploie sur staging)
   - ✅ **Preview** (si tu veux que `develop` déploie sur staging)

**Recommandation :** Pour staging, active **Preview** uniquement.

---

## 🔄 Étape 4 : Vérification du Workflow GitHub Actions

Le workflow `.github/workflows/staging.yml` devrait maintenant :

1. Déployer sur Vercel
2. Assigner automatiquement les domaines via `alias-domains`

Si ça ne fonctionne pas, vérifie que :
- Les secrets GitHub sont bien configurés (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- Les domaines sont bien ajoutés dans Vercel avant le déploiement

---

## 🧪 Étape 5 : Test

### 5.1 Test DNS

```bash
# Vérifier que les domaines pointent vers Vercel
dig staging.yallo.fr
dig app.staging.yallo.fr

# Ou avec nslookup
nslookup staging.yallo.fr
nslookup app.staging.yallo.fr
```

### 5.2 Test Déploiement

1. Push sur `develop` : `git push origin develop`
2. Le workflow GitHub Actions devrait déployer
3. Vérifie les URLs :
   - https://staging.yallo.fr
   - https://app.staging.yallo.fr

---

## 🐛 Troubleshooting

### Erreur "Domain not found" sur Vercel

→ Les domaines doivent être ajoutés **manuellement** dans Vercel avant que le workflow puisse les utiliser.

### Erreur "DNS not configured"

→ Vérifie que les enregistrements DNS sur OVH sont corrects et propagés.

### Le workflow échoue avec "Unexpected error"

→ Vérifie :
1. Les secrets GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
2. Que les domaines existent dans Vercel
3. Les logs Vercel pour plus de détails

### Les domaines ne fonctionnent pas après déploiement

→ Vérifie dans Vercel → **Deployments** → Clique sur le dernier déploiement → **Domains** pour voir si les domaines sont bien assignés.

---

## 📝 Résumé

1. ✅ Ajouter `staging.yallo.fr` et `app.staging.yallo.fr` dans Vercel → Domains
2. ✅ Configurer les DNS sur OVH (CNAME ou A)
3. ✅ Configurer les variables d'environnement dans Vercel (Preview)
4. ✅ Assigner les domaines à l'environnement Preview
5. ✅ Tester avec un push sur `develop`

Une fois tout configuré, le workflow GitHub Actions devrait déployer automatiquement sur staging à chaque push sur `develop`.
