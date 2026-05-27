# Cahier des Charges – Yallo V2

> Dernière mise à jour : 26 mai 2026
> Branche de référence : `develop`
> Version logicielle : `0.3.0`

---

## 1. Vision Produit

**Yallo** est un SaaS vertical pour la restauration rapide (kebabs, tacos, sushi, burgers) qui automatise la prise de commandes téléphoniques grâce à une IA vocale.

**Proposition de valeur :** "Zero Latency" — capturer le chiffre d'affaires perdu par les appels manqués en remplaçant la ligne téléphonique par un agent IA disponible 24/7.

### Structure du produit

| Module | Public cible | Objectif |
|--------|-------------|----------|
| **Site Marketing** | Prospects restaurateurs | Conversion → formulaire de contact |
| **Dashboard Restaurant (PWA)** | Staff en cuisine (tablette) | Gestion des commandes en temps réel |
| **Agent Vocal IA (Yallo)** | Client final (téléphone) | Prise de commande vocale automatisée |
| **Panel Admin** | Équipe Yallo interne | Gestion des restaurants, utilisateurs, configuration |

### Offres tarifaires (3 plans)

| Plan | Prix | Commission | Minutes | HubRise |
|------|------|------------|---------|---------|
| **Starter** | 29€/mois | 7% / commande | Illimitées | ❌ |
| **Essential** | 149€/mois | 0% | 400 incluses (0,25€/min sup.) | ✅ |
| **Infinity** | 349€/mois | 0% | 1200 incluses (0,20€/min sup.) | ✅ |

---

## 2. Stack Technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 16.0.7 (App Router) |
| Langage | TypeScript 5.9.3 (strict) |
| Base de données | PostgreSQL (Neon Serverless) + Drizzle ORM 0.44.7 |
| Auth | Supabase Auth (`@supabase/ssr` 0.10 + `@supabase/supabase-js` 2.101) |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix UI) |
| Animations | Motion 12.23 (motion/react) |
| Formulaires | React Hook Form 7.67 + Zod 4.1 |
| Voice AI (appels réels) | **VAPI** — assistant IA vocal pour la prise de commande téléphonique |
| Voice AI (preview UI) | **ElevenLabs** — aperçu voix dans les paramètres du dashboard uniquement |
| Téléphonie | Twilio (provisioning numéros + SMS de confirmation) |
| Email | Resend 6.5 + React Email |
| AI Menu | OpenAI 6.17 (GPT-4o Vision, parsing menu depuis photos) |
| Intégration caisse | HubRise (lecture catalogue + push commandes) |
| Paiement | Stripe 22 (abonnements, webhook) |
| Tests | Vitest 4 + Testing Library |
| CI/CD | GitHub Actions (lint + tests + build) → Vercel + SonarCloud |

> ℹ️ **Architecture Voice AI :** VAPI gère tous les appels téléphoniques réels. ElevenLabs est conservé uniquement pour la fonctionnalité de **prévisualisation de voix** dans l'interface paramètres du dashboard. NextAuth est conservé comme dépendance legacy (à retirer). Les champs `vapiAssistantId`, `vapiStructuredOutputIds`, `vapiPhoneNumberId` sont utilisés par VAPI.

---

## 3. État des lieux – Ce qui est FAIT

### 3.1 Site Marketing ✅

| Page / Composant | Statut | Détails |
|-----------------|--------|---------|
| Page d'accueil | ✅ Complet | Hero animé, Social Proof, How It Works, Features, Pricing (DB-driven), FAQ, CTA, Footer |
| Section Pricing | ✅ Complet | 3 cartes dynamiques depuis la BDD, carousel mobile, section Enterprise |
| Page Contact | ✅ Complet | Formulaire Zod + envoi email Resend |
| Page Démo | ⚠️ Partiel | Numéro de téléphone placeholder (`0000000000`) |
| Page Guide | ✅ Complet | 5 étapes d'onboarding |
| Page Mentions Légales | ⚠️ Partiel | Données entreprise placeholder (RCS, SIRET, adresse) |
| Page Legal (CGU/RGPD) | ✅ Complet | CGU, politique de confidentialité, cookies |
| SEO | ✅ Complet | robots.ts, sitemap.ts, metadata, Open Graph |
| Navigation | ✅ Complet | Navbar glassmorphism, mode toggle, login button |

### 3.2 Dashboard Restaurant ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Tableau de bord | ✅ Complet | KPIs (CA, commandes, panier moyen), grille commandes |
| Gestion commandes | ✅ Complet | Cycle de vie NEW → PREPARING → READY → DELIVERED / CANCELLED |
| Ticket de commande | ✅ Complet | Détails client, articles, options, total, heure de retrait |
| Statut cuisine | ✅ Complet | CALM / NORMAL / RUSH / STOP avec délais d'attente configurables par statut |
| Gestion menu | ✅ Complet | Import IA (photos → JSON via GPT-4o Vision), éditeur, suppression |
| Horaires d'ouverture | ✅ Complet | Par jour, créneaux simples ou midi/soir, timezone |
| **Paramètres** | ✅ **NOUVEAU** | Transfert d'appel + voix assistant + upsell auto + SMS confirmation + auto-RUSH (seuil) |
| Navigation | ✅ Complet | Sidebar rétractable : Dashboard, Menu, Horaires, Paramètres, Abonnement |
| Mise à jour assistant | ✅ Complet | Synchronisation VAPI automatique après modifications (menu, horaires, charge cuisine, paramètres) |
| Abonnement | ✅ Complet | Gestion Stripe au niveau organisation, statut abonnement, portail client |
| **Usage appels** | ✅ **NOUVEAU** | Minutes consommées, coût estimé, nombre d'appels, remise à zéro — lié à la période Stripe |

### 3.3 Panel Admin ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Dashboard | ✅ Complet | Onglets Organisations / Restaurants / Utilisateurs, KPIs |
| CRUD Restaurants | ✅ Complet | Création, édition, suppression, filtres, recherche, pagination |
| CRUD Utilisateurs | ✅ Complet | Création (rôles ADMIN/OWNER/EMPLOYEE), édition, suppression, envoi welcome/reset email |
| **CRUD Rôles** | ✅ **NOUVEAU** | Gestion des rôles personnalisés (nom + description). Rôles système ADMIN/OWNER/EMPLOYEE protégés en lecture seule |
| Détail Restaurant | ✅ Complet | Onglets : Général, IA & Menu, Téléphonie, Facturation, HubRise |
| Configuration IA | ✅ Complet | Création/mise à jour/suppression agent ElevenLabs, prompt système |
| Configuration Téléphonie | ✅ Complet | Import numéro Twilio dans ElevenLabs + assignation à l'agent |
| Configuration HubRise | ✅ Complet | Location ID + Access Token + Catalog ID |
| Génération menu JSON | ✅ Complet | Endpoint admin pour parser les images via OpenAI |
| Navigation | ✅ Complet | Sidebar admin : Dashboard + Rôles (sidebar simplifiée) |

### 3.4 Auth ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Login | ✅ Complet | Email/password via Supabase Auth, rôles ADMIN/OWNER/EMPLOYEE |
| Changement mot de passe | ✅ Complet | Flow Supabase update-password |
| Middleware | ✅ Complet | Routage par sous-domaine, protection par rôle : ADMIN → /admin, EMPLOYEE → /dashboard, OWNER → /org |
| Mapping utilisateur | ✅ Complet | `authUserId` lie Supabase Auth → table `users` locale |
| Déconnexion | ✅ Corrigé | Détection staging/localhost, redirige vers le bon domaine |
| **Contrôle d'accès EMPLOYEE** | ✅ **NOUVEAU** | EMPLOYEE : accès commandes + statut cuisine uniquement. Menu, Horaires, Paramètres, /org bloqués. |

### 3.5 Intégrations

| Service | Statut | Détails |
|---------|--------|---------|
| **ElevenLabs** | ✅ Fonctionnel | Prévisualisation voix uniquement (CRUD agent, sync auto depuis paramètres) |
| **VAPI** | ✅ Fonctionnel | Appels téléphoniques réels : tool `submit_order` + `end-of-call-report` (enregistrement call_logs) |
| **Twilio** | ✅ Fonctionnel | Import numéro dans ElevenLabs + SMS de confirmation commande au client |
| **HubRise** | ✅ Fonctionnel | Lecture catalogue (fallback menu) + push commandes vers caisse |
| **OpenAI** | ✅ Fonctionnel | Parsing menu depuis photos (GPT-4o Vision) |
| **Resend** | ✅ Fonctionnel | Welcome email, reset password, formulaire contact |
| **Stripe** | ✅ Fonctionnel | Webhooks abonnements (checkout.session.completed, subscription.updated/deleted) |

### 3.6 Flux de commande vocale ✅ (OPÉRATIONNEL — VAPI)

```
Client appelle → Numéro Twilio → VAPI (assistant IA vocal)
                                         ↓
                           Prompt système dynamique :
                           - Menu (menuData JSON ou HubRise catalog)
                           - Horaires d'ouverture
                           - Statut cuisine (CALM/RUSH/STOP)
                           - Instructions transfert (si activé)
                                         ↓
                           LLM gère la conversation vocale
                                         ↓
                    ┌────────────────────┴─────────────────────┐
                    │                                           │
              Client demande              Client finalise
              à parler au patron          sa commande
                    │                                           │
              transfer_call               submit_order
              (VAPI built-in)         → POST /api/vapi/webhook?rid=<id>
                    │                           │
              Transfert vers                Commande BDD
              numéro du restaurateur        (orders + order_items)
                                            │           │
                                      SMS client    HubRise push
                                      (Twilio)      (si configuré)
                                                         │
                                      Fin d'appel → end-of-call-report
                                      → POST /api/vapi/webhook?rid=<id>
                                                         │
                                               INSERT call_logs
                                               (durée, statut, callId)
```

### 3.7 Tests

- **213 tests** dans 28 fichiers (Vitest 4)
- Scope : services (ElevenLabs, VAPI, HubRise, Twilio, Stripe, menu parser, system prompt), features (orders, hours, kitchen-status, menu, billing usage, restaurant switch), utils, validators, composants, API webhooks
- Pipeline CI : lint → tests → build sur chaque push `develop`

### 3.8 Organisations (multi-restaurants)

| Élément | Statut | Détails |
|---------|--------|----------|
| Table `organizations` | ✅ Complet | Propriétaire, liens Stripe, restaurants liés |
| FK `organizationId` sur `restaurants` | ✅ Complet | Chaque restaurant appartient à une organisation |
| `getUserOrganization()` | ✅ Complet | Retourne l'org avec ses restaurants en une requête |
| Stripe au niveau org | ✅ Complet | Checkout + webhook → mise à jour `organizations` + propagation aux `restaurants` |
| Sélecteur de restaurant (sidebar) | ✅ Complet | Affiché si l'org a >1 restaurant, cookie `yallo_restaurant_id` |
| `switchRestaurant()` server action | ✅ Complet | Sécurisé : valide l'appartenance via `restaurant_members` avant de poser le cookie |
| **Tables membres** | ✅ **NOUVEAU** | `organization_members` (orgId, userId, role) + `restaurant_members` (restaurantId, userId, role) |
| **Accès restaurant EMPLOYEE** | ✅ **NOUVEAU** | `getAccessibleRestaurant()` / `getAccessibleRestaurantForUser()` — résoud le restaurant actif via `restaurant_members` (support OWNER + EMPLOYEE) |

### 3.9 Facturation à la minute (call_logs)

| Élément | Statut | Détails |
|---------|--------|----------|
| Table `call_logs` | ✅ Complet | Par appel : restaurantId, organizationId, provider, durée, statut |
| VAPI `end-of-call-report` | ✅ Complet | Webhook qui insère dans `call_logs` (idempotent via `onConflictDoNothing`) |
| `getCallUsageForCurrentPeriod()` | ✅ Complet | Agrège minutes + coût pour la période de facturation Stripe en cours |
| Page Abonnement (usage) | ✅ Complet | 4 cartes : Minutes consommées, Coût estimé, Appels traités, Remise à zéro |
| Tarif par plan | ✅ Complet | 19 cts/min (Essentiel), 17 cts/min (Pro), 15 cts/min (Business) |

---

## 4. Ce qui reste à faire

### 4.1 🔴 CRITIQUE – Bloquant pour la mise en production

#### 4.1.1 Notifications temps réel sur le dashboard
**Actuellement :** Le dashboard utilise `router.refresh()`. Aucune notification quand une commande arrive pendant que le staff est sur l'interface.

**À faire :**
- Polling automatique toutes les 30s ou Server-Sent Events
- Notification sonore (bip) à l'arrivée d'une commande
- Badge/indicateur de nouvelles commandes non vues

#### 4.1.2 Numéro de téléphone de démo
**Actuellement :** La page `/demo` affiche `0000000000`.

**À faire :**
- Configurer un numéro VAPI/Twilio de démo réel
- Ou intégrer le widget web VAPI pour tester depuis le navigateur

#### 4.1.3 Formulaire de contact – Sujets tarifaires
**Actuellement :** Les liens pricing utilisent des slugs (`plan-starter`, `plan-essential`, etc.) que le formulaire de contact ne reconnaît pas.

**À faire :**
- Aligner les valeurs du schéma Zod du formulaire avec les slugs des plans
- Labels : Plan Starter, Plan Essential, Plan Infinity, Enterprise

### 4.2 🟠 IMPORTANT – Nécessaire pour une V1 propre

#### 4.2.1 PWA (Progressive Web App)
**Actuellement :** Aucune configuration PWA. Le dashboard est prévu tablet-first.

**À faire :**
- `manifest.json` (nom, icônes, thème, orientation landscape)
- Service worker (cache offline basique)
- Meta tags PWA dans le layout `/app`

#### 4.2.2 KPIs du dashboard – Valeurs hardcodées
**Actuellement :** Les pourcentages de variation (`+12.5%`, `+3.2%`) et les temps (`1m 30s`) sont en dur.

**À faire :**
- Calculer les vrais KPIs par comparaison J vs J-1
- Temps moyen de traitement estimé depuis les données de commande
- Graphique d'activité par tranche horaire (Recharts ou similar)

#### 4.2.3 Données légales réelles
**Actuellement :** RCS, SIRET, adresse sont des placeholders dans `/mentions-legales`.

**À faire :**
- Remplacer par les vraies données d'immatriculation

#### 4.2.4 Planification tarifaire — stripePriceId → plan mapping
**Actuellement :** `getCallUsageForCurrentPeriod()` utilise un fallback hardcodé sur le tarif Essentiel (19 cts/min).

**À faire :**
- Stocker le `planId` dans `organizations.metadata` lors du checkout Stripe
- Mapper `stripePriceId` → plan pour calculer le bon tarif à la minute

### 4.3 🟡 SOUHAITABLE

#### 4.3.1 Impersonation Admin
**Actuellement :** L'action `impersonateRestaurant` est codée côté serveur mais le bouton UI est désactivé avec "(À venir)".

**À faire :**
- Wirer le bouton UI à l'action serveur
- Bandeau visible "Mode impersonation" sur le dashboard du restaurateur

#### 4.3.2 Navigation mobile marketing
**Actuellement :** Les liens de nav sont cachés sur mobile (`hidden md:flex`), pas de menu hamburger.

**À faire :**
- Menu hamburger / Sheet mobile avec tous les liens + CTAs

#### 4.3.3 Coverage SonarCloud
**Actuellement :** ~12% sur SonarCloud (fichiers UI non couverts).

**À faire :**
- Ajouter `coverage/` au `.gitignore`
- Augmenter la couverture sur les actions critiques (settings, billing)
- Objectif ≥ 40% pour le Quality Gate

#### 4.3.4 Multi-site — filtrage données par restaurant sélectionné
**Actuellement :** La sidebar affiche le sélecteur de restaurant (cookie `yallo_restaurant_id`). Les commandes et KPIs respectent déjà la sélection via `getUserRestaurant()`.

**À faire (si org avec >1 restaurants) :**
- Vue agrégée "Tous les sites" pour les KPIs du dashboard
- Filtrage des exports / analytics par restaurant
- Vérifier que toutes les pages dashboard respectent bien le cookie de sélection

### 4.4 🔵 POST-V1 – Améliorations futures

| Fonctionnalité | Description |
|---------------|-------------|
| **HubRise OAuth** | Flow OAuth pour connecter HubRise auto (au lieu de copier-coller les tokens) |
| **Tableau de bord analytique** | Graphiques avancés, historique commandes, export CSV |
| **Notifications push PWA** | Push notifications pour nouvelles commandes |
| **Mode hors-ligne** | Cache des commandes en cours si perte de connexion |
| **Upsell intelligent** | Suggestions contextuelles basées sur l'historique, panier et statut cuisine |
| **Multi-langue** | Support anglais pour l'agent vocal et le dashboard |
| **Webhook entrant HubRise** | Réception d'événements HubRise (ex : changement statut commande) |
| **Analytics appels** | Graphique minutes/jour, taux de no-answer, durée moyenne par restaurant |
| **Webhook entrant HubRise** | Réception d'événements HubRise (ex : changement statut commande) |

---

## 5. Schéma de la base de données

```
users
├── id (uuid, PK)
├── authUserId (text, unique) → FK Supabase Auth
├── email (text, unique, not null)
├── firstName (text, nullable)
├── lastName (text, nullable)
├── role (ADMIN | OWNER | EMPLOYEE, default OWNER)
└── createdAt (timestamp)

organization_members                  ← NOUVEAU (contrôle d'accès)
├── id (uuid, PK)
├── organizationId (uuid, FK → organizations)
├── userId (uuid, FK → users)
├── role (owner | member, default member)
└── UNIQUE (organizationId, userId)

restaurant_members                    ← NOUVEAU (contrôle d'accès)
├── id (uuid, PK)
├── restaurantId (uuid, FK → restaurants)
├── userId (uuid, FK → users)
├── role (owner | member, default member)
└── UNIQUE (restaurantId, userId)

roles                                 ← NOUVEAU (référentiel rôles)
├── id (uuid, PK)
├── name (text, unique, not null)   ← ADMIN / OWNER / EMPLOYEE + rôles custom
├── description (text, nullable)
└── createdAt (timestamp)

Note : La protection des rôles système (ADMIN/OWNER/EMPLOYEE) est assurée
       par validation côté serveur sur le nom — pas de colonne is_system.

organizations                         ← NOUVEAU (multi-restaurants)
├── id (uuid, PK)
├── name (text, not null)
├── ownerId (uuid, FK → users)
│
├── -- Stripe (facturation au niveau organisation) --
├── stripeCustomerId (text, nullable)
├── stripeSubscriptionId (text, nullable)
├── stripeSubscriptionStatus (text, nullable)
├── stripePriceId (text, nullable)
├── stripeCurrentPeriodEnd (timestamp, nullable)
├── billingStartDate (text, nullable)
│
├── isActive (boolean, default true)
├── createdAt (timestamp)
└── updatedAt (timestamp)

restaurants
├── id (uuid, PK)
├── organizationId (uuid, FK → organizations) ← NOUVEAU
├── name (text, not null)
├── address (text, nullable)
├── phoneNumber (text, not null)  ← numéro de contact public du restaurant
├── ownerId (uuid, FK → users, cascade delete)
├── status (onboarding | active | suspended, default onboarding)
├── isActive (boolean, default true)
├── plan (fixed | commission, default commission)
├── commissionRate (integer, default 5)
│
├── -- ElevenLabs (preview voix uniquement) --
├── elevenLabsAgentId (text, nullable)
├── elevenLabsPhoneNumberId (text, nullable)
│
├── -- VAPI (appels réels) --
├── vapiAssistantId (text, nullable)
├── vapiStructuredOutputIds (text, nullable)
├── vapiPhoneNumberId (text, nullable)
│
├── -- Téléphonie --
├── twilioPhoneNumber (text, nullable)        ← numéro Twilio dans VAPI
├── forwardingPhoneNumber (text, nullable)    ← numéro du restaurateur pour transfert
├── callForwardingEnabled (boolean, default false)
│
├── -- Agent & Menu --
├── systemPrompt (text, nullable)
├── menuContext (text, nullable)
├── menuData (jsonb, nullable) → MenuData { categories[], option_lists[] }
├── businessHours (text, nullable) → JSON { timezone, schedule: { lundi: ... } }
│
├── -- HubRise --
├── hubriseLocationId (text, nullable)
├── hubriseAccessToken (text, nullable)
├── hubriseCatalogId (text, nullable)
│
├── -- Cuisine --
├── currentStatus (CALM | NORMAL | RUSH | STOP, default CALM)
├── statusSettings (jsonb) → { CALM: { fixed|min/max }, ..., STOP: { message } }
│
├── createdAt (timestamp)
└── updatedAt (timestamp)

call_logs                             ← NOUVEAU (facturation à la minute)
├── id (uuid, PK)
├── restaurantId (uuid, FK → restaurants)
├── organizationId (uuid, FK → organizations)
├── externalCallId (text, not null)  ← call.id depuis VAPI
├── provider (vapi | elevenlabs)
├── durationSeconds (integer, nullable)
├── startedAt (timestamp, nullable)
├── endedAt (timestamp, nullable)
├── status (completed | failed | no-answer, default completed)
├── createdAt (timestamp)
│
└── UNIQUE INDEX (externalCallId, provider)  ← idempotence webhook

orders
├── id (uuid, PK)
├── restaurantId (uuid, FK → restaurants, cascade delete)
├── orderNumber (text, not null)
├── customerName (text, nullable)
├── customerPhone (text, nullable)
├── status (NEW | PREPARING | READY | DELIVERED | CANCELLED, default NEW)
├── totalAmount (integer, centimes, default 0)
├── pickupTime (timestamp, nullable)
├── notes (text, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

order_items
├── id (uuid, PK)
├── orderId (uuid, FK → orders, cascade delete)
├── productName (text, not null)
├── quantity (integer, not null)
├── unitPrice (integer, centimes)
├── totalPrice (integer, centimes)
├── options (text, nullable)
└── createdAt (timestamp)
```

---

## 6. Architecture des flux

### Flux de commande vocale (OPÉRATIONNEL)

```
Client appelle → Numéro Twilio → ElevenLabs Conversational AI
                                         ↓
                           Prompt système dynamique :
                           - Menu (HubRise ou menuData JSON)
                           - Horaires d'ouverture
                           - Statut cuisine (CALM/RUSH/STOP)
                           - Instructions transfert (si activé)
                                         ↓
                           GPT-4.1-nano gère la conversation
                                         ↓
                    ┌────────────────────┴─────────────────────┐
                    │                                           │
              Client demande              Client finalise
              à parler au patron          sa commande
                    │                                           │
              transfer_call               submit_order
              (système EL)           → POST /api/elevenlabs/webhook
                    │                           │
              Transfert vers                Commande BDD
              numéro du restaurateur        (orders + order_items)
                                            │           │
                                      SMS client    HubRise push
                                      (Twilio)      (si configuré)
```

### Flux d'onboarding restaurant

```
Prospect → Site Marketing → Formulaire Contact
                                   ↓
Admin crée le restaurant + utilisateur (panel admin)
                                   ↓
Email de bienvenue (Resend) avec identifiants Supabase
                                   ↓
Owner se connecte → Configuration :
  - Menu : import photos IA ou connexion HubRise
  - Horaires d'ouverture
  - Paramètres : transfert d'appel (on/off + numéro)
                                   ↓
Admin configure (panel) :
  - Import numéro Twilio dans ElevenLabs
  - Assignation de l'agent au numéro
                                   ↓
L'agent IA est opérationnel — numéro Twilio actif
```

### Flux de mise à jour de l'agent

```
Owner modifie Menu / Horaires / Paramètres / Statut cuisine
                    ↓
Bouton "Mettre à jour l'assistant" (ou save auto)
                    ↓
updateElevenLabsAgent(agentId, restaurant)
  - Régénère le prompt système (menu + horaires + statut + forwarding)
  - Met à jour les tools (submit_order + transfer_call si activé)
  - PATCH /v1/convai/agents/{agentId}
```

---

## 7. Variables d'environnement requises

```env
# Base de données
DATABASE_URL=

# Auth Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App URLs (multi-domaine)
NEXT_PUBLIC_APP_URL=         # https://app.yallo.fr (ou staging)
NEXT_PUBLIC_SITE_URL=        # https://yallo.fr (ou staging)
AUTH_SECRET=                 # NextAuth legacy (à conserver pour compatibilité)

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_WEBHOOK_SECRET=   # Optionnel, sécurise le webhook
ELEVENLABS_VOICE_ID=         # Optionnel, défaut EXAVITQu4vr4xnSDxMaL
ELEVENLABS_LLM_MODEL=        # Optionnel, défaut gpt-4.1-nano-2025-04-14
ELEVENLABS_TTS_MODEL=        # Optionnel, défaut eleven_turbo_v2_5

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_API_KEY=
TWILIO_API_SECRET=
TWILIO_SMS_FROM=             # Optionnel, fallback sur twilioPhoneNumber du restaurant
TWILIO_ORDER_CONFIRMATION_SMS=  # Mettre "false" pour désactiver les SMS

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_TO_EMAIL=

# HubRise (optionnel, pour les restaurants connectés)
# Configuré par restaurant dans le panel admin
```

---

## 8. Critères d'acceptation V1

La V1 est considérée comme **prête au lancement** quand :

- [x] Un restaurant peut recevoir des commandes téléphoniques via l'IA vocale (ElevenLabs)
- [x] Les commandes sont créées en base de données via le webhook ElevenLabs
- [x] Le cycle de vie complet d'une commande fonctionne (NEW → DELIVERED)
- [x] Le menu peut être configuré (IA photos ou HubRise)
- [x] Les horaires d'ouverture sont respectés par l'agent vocal
- [x] Le statut cuisine (CALM/RUSH/STOP) influence le comportement de l'IA
- [x] SMS de confirmation envoyé au client après commande
- [x] Push commandes vers HubRise si configuré
- [x] Transfert d'appel vers le restaurateur (configurable)
- [x] Les abonnements Stripe sont gérés (création, mise à jour, résiliation)
- [ ] Le site marketing a un vrai numéro de démo fonctionnel
- [ ] Les formulaires de contact acceptent tous les sujets tarifaires
- [ ] Les pages légales contiennent les vraies informations
- [ ] Le dashboard affiche des KPIs réels (pas de valeurs hardcodées)
- [ ] Le dashboard est installable comme PWA sur tablette
- [ ] Tous les tests passent et le build est propre ✅ (191/191)
├── customerName (text, nullable)
├── customerPhone (text, nullable)
├── status (NEW | PREPARING | READY | DELIVERED | CANCELLED)
├── totalAmount (integer)
├── pickupTime (timestamp, nullable)
├── notes (text, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

order_items
├── id (uuid, PK)
├── orderId (uuid, FK → orders)
├── productName (text)
├── quantity (integer)
├── unitPrice (integer)
├── totalPrice (integer)
├── options (text, nullable)
└── createdAt (timestamp)
```
