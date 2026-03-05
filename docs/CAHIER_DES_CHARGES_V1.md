# Cahier des Charges – Yallo V1

> Dernière mise à jour : 1er février 2026
> Branche de référence : `develop`

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
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript 5.9 (strict) |
| Base de données | PostgreSQL (Neon Serverless) + Drizzle ORM |
| Auth | NextAuth v5 (JWT, Credentials) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | motion/react (v12+) |
| Voice AI | Vapi (orchestrateur) + GPT-4o (LLM) + Deepgram Nova 2 (transcription) |
| Email | Resend + React Email |
| AI Menu | OpenAI GPT-4o Vision |
| Intégration caisse | HubRise |
| Tests | Vitest + Testing Library |
| CI/CD | GitHub Actions + Vercel + SonarCloud |

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
| Page Legal | ✅ Complet | CGU, RGPD, cookies |
| SEO | ✅ Complet | robots.ts, sitemap.ts, metadata, JSON-LD, Open Graph |
| Navigation | ✅ Complet | Navbar glassmorphism, mode toggle, login button |
| Testimonials Carousel | ⚠️ Non utilisé | Composant créé mais pas intégré à la landing page |

### 3.2 Dashboard Restaurant ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Tableau de bord | ✅ Complet | KPIs (CA, commandes, panier moyen), grille commandes |
| Gestion commandes | ✅ Complet | Cycle de vie NEW → PREPARING → READY → DELIVERED/CANCELLED |
| Ticket de commande | ✅ Complet | Détails client, articles, options, total, temps de retrait |
| Statut cuisine | ✅ Complet | CALM / NORMAL / RUSH / STOP avec délais configurables |
| Gestion menu | ✅ Complet | Import magique (IA) via photos, éditeur JSON, suppression |
| Horaires d'ouverture | ✅ Complet | Par jour, créneaux simples ou midi/soir |
| Menu HubRise | ✅ Complet | Page informative quand HubRise est connecté |
| Navigation | ✅ Complet | Menu desktop (bouton) + barre fixe mobile |
| Mise à jour assistant | ✅ Complet | Bouton de sync Vapi |
| Simulation commande | ✅ Complet | Pour les tests uniquement |

### 3.3 Panel Admin ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Dashboard | ✅ Complet | Onglets Restaurants / Utilisateurs, KPIs |
| CRUD Restaurants | ✅ Complet | Création, édition, suppression, filtres, recherche |
| CRUD Utilisateurs | ✅ Complet | Création, édition, suppression, envoi welcome/reset email |
| Détail Restaurant | ✅ Complet | 5 onglets : Général, IA & Menu, Téléphonie, Facturation, HubRise |
| Configuration IA | ✅ Complet | Création/mise à jour/suppression assistant Vapi, prompt système |
| Configuration HubRise | ✅ Complet | Location ID + Access Token manuels |
| Gestion des offres | ✅ Complet | Formulaire complet pour les 3 plans tarifaires |
| Navigation | ✅ Complet | Menu desktop + mobile, paramètres |

### 3.4 Auth ✅

| Fonctionnalité | Statut | Détails |
|---------------|--------|---------|
| Login | ✅ Complet | Email/password, rôles ADMIN/OWNER |
| Changement mot de passe | ✅ Complet | Premier login + reset via token |
| Middleware | ✅ Complet | Routage par domaine, protection par rôle, redirection |
| Session | ✅ Complet | JWT avec id, email, role, mustChangePassword |

### 3.5 Intégrations

| Service | Statut | Détails |
|---------|--------|---------|
| **Vapi** | ✅ Fonctionnel | CRUD assistant, prompt dynamique via webhook |
| **HubRise** | ⚠️ Partiel | Lecture catalogue uniquement, pas de push commandes |
| **OpenAI** | ✅ Fonctionnel | Parsing menu depuis photos |
| **Resend** | ✅ Fonctionnel | Welcome, reset password, contact |
| **Stripe** | ❌ Placeholder | Champ `stripeCustomerId` stocké, aucun SDK/webhook |
| **Twilio** | ❌ Placeholder | Champ `twilioPhoneNumber` stocké, aucun SDK |

### 3.6 Tests

- **200 tests** dans 23 fichiers
- **Coverage** : 92.67% statements, 94.52% lines (Vitest)
- **SonarCloud** : ~12.7% (beaucoup de fichiers UI non testés)

---

## 4. Ce qui reste à faire pour la V1

### 4.1 🔴 CRITIQUE – Bloquant pour le lancement

#### 4.1.1 Webhook Vapi → Création de commandes réelles
**Actuellement :** Les commandes sont créées uniquement via `simulateOrder()`. L'agent vocal Vapi n'a aucun moyen de créer une commande dans la BDD.

**À faire :**
- Créer un endpoint `/api/vapi/webhook` (ou `/api/vapi/end-of-call`) pour recevoir les résultats de conversation Vapi
- Parser le résumé de commande (articles, quantités, options, nom client, téléphone)
- Créer la commande dans la BDD
- Déclencher une notification temps réel sur le dashboard (polling, SSE, ou WebSocket)

#### 4.1.2 Notifications temps réel sur le dashboard
**Actuellement :** Le dashboard utilise `router.refresh()` pour rafraîchir les commandes. Aucune notification sonore ou visuelle quand une nouvelle commande arrive.

**À faire :**
- Polling régulier ou Server-Sent Events pour les nouvelles commandes
- Notification sonore (bip) quand une commande arrive
- Badge / indicateur de nouvelles commandes

#### 4.1.3 Numéro de téléphone de démo
**Actuellement :** La page `/demo` affiche `0000000000`.

**À faire :**
- Configurer un numéro Vapi de démonstration réel
- Ou implémenter un player Vapi web (widget SDK) pour tester directement depuis le navigateur

#### 4.1.4 Formulaire de contact – Sujets manquants
**Actuellement :** Les liens de la section pricing envoient `?subject=plan-starter`, `plan-essential`, `plan-infinity`, `enterprise`, mais le formulaire de contact n'accepte que `plan-commission`, `plan-fixe`.

**À faire :**
- Mettre à jour les valeurs acceptées dans le schéma Zod du formulaire de contact
- Ajouter les labels correspondants : Plan Starter, Plan Essential, Plan Infinity, Enterprise

### 4.2 🟠 IMPORTANT – Nécessaire pour une V1 propre

#### 4.2.1 PWA (Progressive Web App)
**Actuellement :** Aucune configuration PWA. Le dashboard est censé être tablet-first.

**À faire :**
- Créer `manifest.json` (nom, icônes, thème, orientation)
- Configurer le service worker (mode hors-ligne basique, cache)
- Ajouter les meta tags PWA dans le layout
- Tester l'installation sur tablette

#### 4.2.2 KPIs du dashboard – Valeurs hardcodées
**Actuellement :** Les pourcentages de variation sont en dur : `+12.5%`, `+3.2%`, `-5s`, `1m 30s`.

**À faire :**
- Calculer les vrais KPIs par comparaison jour J vs J-1
- Temps moyen IA : récupérer depuis les logs Vapi ou estimer depuis les données de commande
- Graphique d'activité : implémenter un vrai graphique (Recharts) par tranche horaire

#### 4.2.3 Données entreprise – Mentions légales
**Actuellement :** RCS, SIRET, adresse sont des placeholders.

**À faire :**
- Remplacer par les vraies données d'immatriculation
- Créer la page `/confidentialite` (lien cassé depuis mentions-legales)

#### 4.2.4 Menu Parser – Alignement de schéma
**Actuellement :** Le prompt OpenAI demande un format (`donnees_menu`/`categorie`/`articles`/`tarifs`) différent du schéma `MenuData` (`categories`/`products`/`skus`). Le parsing peut échouer silencieusement.

**À faire :**
- Ajouter une couche de transformation entre la sortie OpenAI et le schéma `MenuData`
- Ou aligner le prompt avec le schéma exact
- Ajouter des tests pour la transformation

#### 4.2.5 Fichier `.env.example`
**Actuellement :** Pas de `.env.example`. Les variables sont inférées du code.

**À faire :**
- Créer `.env.example` avec toutes les variables documentées
- `DATABASE_URL`, `AUTH_SECRET`, `VAPI_PRIVATE_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`

### 4.3 🟡 SOUHAITABLE – Pour une V1 de qualité

#### 4.3.1 HubRise – Push commandes
**Actuellement :** HubRise est en lecture seule (catalogue). Les commandes prises par l'IA ne sont pas poussées vers le système de caisse.

**À faire :**
- Implémenter `pushOrderToHubRise()` pour envoyer les commandes vers la caisse
- Déclencher après la création de commande via le webhook Vapi

#### 4.3.2 Navigation mobile marketing
**Actuellement :** Pas de menu hamburger sur mobile. Les liens de navigation sont cachés (`hidden md:flex`).

**À faire :**
- Ajouter un menu hamburger / sheet pour mobile
- Inclure tous les liens de navigation + CTAs

#### 4.3.3 Testimonials
**Actuellement :** Le composant `TestimonialsCarousel` existe mais n'est pas utilisé sur la landing page.

**À faire :**
- Intégrer le carousel entre les sections existantes (après Features ou avant FAQ)
- Ou le supprimer si non pertinent pour le lancement

#### 4.3.4 Impersonation Admin
**Actuellement :** L'action `impersonateRestaurant` existe côté serveur, mais le bouton UI est désactivé avec "(À venir)".

**À faire :**
- Wire le bouton UI à l'action serveur
- Gérer le cookie/session d'impersonation dans `getUserRestaurant`
- Ajouter un bandeau visible "Mode impersonation" sur le dashboard

#### 4.3.5 FAQ – Contenu cohérent
**Actuellement :** La FAQ mentionne "5% par commande" alors que les plans sont dynamiques depuis la BDD.

**À faire :**
- Mettre à jour la FAQ pour refléter les vrais tarifs
- Ou rendre la FAQ dynamique avec les données des plans

#### 4.3.6 Coverage SonarCloud
**Actuellement :** ~12.7% sur SonarCloud (beaucoup de fichiers UI non testés).

**À faire :**
- Ajouter `coverage/` au `.gitignore`
- Augmenter la couverture des fichiers critiques (actions, services)
- Objectif : ≥ 40% pour le Quality Gate SonarCloud

### 4.4 🔵 POST-V1 – Améliorations futures

| Fonctionnalité | Description |
|---------------|-------------|
| **Stripe Billing** | Intégration complète : Checkout, abonnements, webhooks, facturation automatique |
| **Twilio** | Provisioning automatique de numéros, routage d'appels |
| **HubRise OAuth** | Flow OAuth pour connecter HubRise automatiquement (au lieu de copier-coller les tokens) |
| **Tableau de bord analytique** | Graphiques avancés, historique, export CSV |
| **Multi-langue** | Support anglais pour l'agent vocal et le dashboard |
| **Notifications push** | PWA push notifications pour nouvelles commandes |
| **Mode hors-ligne** | Cache des commandes en cours si perte de connexion |
| **Upsell intelligent** | IA qui propose des suppléments basés sur l'historique |

---

## 5. Schéma de la base de données

```
users
├── id (uuid, PK)
├── email (text, unique)
├── passwordHash (text)
├── firstName (text, nullable)
├── lastName (text, nullable)
├── role (ADMIN | OWNER)
├── mustChangePassword (boolean)
├── resetToken (text, nullable)
├── resetTokenExpires (timestamp, nullable)
└── createdAt (timestamp)

restaurants
├── id (uuid, PK)
├── name (text)
├── address (text, nullable)
├── phoneNumber (text)
├── ownerId (uuid, FK → users)
├── status (onboarding | active | suspended)
├── isActive (boolean)
├── plan (fixed | commission)
├── commissionRate (integer)
├── stripeCustomerId (text, nullable)
├── billingStartDate (text, nullable)
├── vapiAssistantId (text, nullable)
├── systemPrompt (text, nullable)
├── menuContext (text, nullable)
├── menuData (JSONB, nullable)
├── twilioPhoneNumber (text, nullable)
├── businessHours (text, nullable)
├── hubriseLocationId (text, nullable)
├── hubriseAccessToken (text, nullable)
├── currentStatus (CALM | NORMAL | RUSH | STOP)
├── statusSettings (JSONB, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

pricing_plans
├── id (uuid, PK)
├── name (text, unique)
├── subtitle (text)
├── target (text)
├── monthlyPrice (integer, centimes)
├── setupFee (integer, nullable)
├── commissionRate (integer, nullable)
├── includedMinutes (integer, nullable)
├── overflowPricePerMinute (integer, nullable)
├── hubrise (boolean)
├── popular (boolean)
├── createdAt (timestamp)
└── updatedAt (timestamp)

orders
├── id (uuid, PK)
├── restaurantId (uuid, FK → restaurants)
├── orderNumber (text)
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

---

## 6. Architecture des flux

### Flux de commande vocale (cible V1)

```
Client appelle → Twilio → Vapi (IA vocale)
                              ↓
                     GPT-4o traite la conversation
                              ↓
                     Vapi POST /api/vapi/webhook
                              ↓
                     Création commande en BDD
                              ↓
                     Dashboard restaurant (notification)
                              ↓
                     Staff prépare la commande
                              ↓
                     (Optionnel) Push vers HubRise → Caisse
```

### Flux d'onboarding restaurant

```
Prospect → Site Marketing → Formulaire Contact
                                    ↓
Admin crée le restaurant + utilisateur dans le panel
                                    ↓
Email de bienvenue avec identifiants temporaires
                                    ↓
Owner se connecte → Force changement mot de passe
                                    ↓
Owner configure : Menu (photos IA ou HubRise) + Horaires
                                    ↓
Admin configure : Assistant Vapi + Numéro Twilio
                                    ↓
L'agent IA est opérationnel
```

---

## 7. Estimation de charge – Roadmap V1

| Tâche | Priorité | Complexité | Estimation |
|-------|----------|------------|------------|
| Webhook Vapi → commandes | 🔴 Critique | Haute | 3-5 jours |
| Notifications temps réel dashboard | 🔴 Critique | Moyenne | 2-3 jours |
| Fix formulaire contact (sujets) | 🔴 Critique | Basse | 0.5 jour |
| Numéro démo ou player web Vapi | 🔴 Critique | Moyenne | 1-2 jours |
| PWA (manifest + service worker) | 🟠 Important | Moyenne | 2-3 jours |
| KPIs réels dashboard | 🟠 Important | Moyenne | 2-3 jours |
| Données légales réelles | 🟠 Important | Basse | 0.5 jour |
| Menu parser alignment | 🟠 Important | Moyenne | 1-2 jours |
| `.env.example` | 🟠 Important | Basse | 0.5 jour |
| HubRise push commandes | 🟡 Souhaitable | Haute | 3-4 jours |
| Navigation mobile marketing | 🟡 Souhaitable | Basse | 1 jour |
| Testimonials intégration | 🟡 Souhaitable | Basse | 0.5 jour |
| FAQ cohérence tarifs | 🟡 Souhaitable | Basse | 0.5 jour |
| Coverage SonarCloud | 🟡 Souhaitable | Moyenne | 2-3 jours |
| **Total estimé** | | | **~20-28 jours** |

---

## 8. Critères d'acceptation V1

La V1 est considérée comme **prête au lancement** quand :

- [ ] Un restaurant peut recevoir des commandes téléphoniques via l'IA vocale
- [ ] Les commandes apparaissent en temps réel sur le dashboard
- [ ] Le cycle de vie complet d'une commande fonctionne (NEW → DELIVERED)
- [ ] Le menu peut être configuré (IA photos ou HubRise)
- [ ] Les horaires d'ouverture sont respectés par l'agent vocal
- [ ] Le statut cuisine (CALM/RUSH/STOP) influence le comportement de l'IA
- [ ] Le site marketing est fonctionnel avec un vrai numéro de démo
- [ ] Les formulaires de contact fonctionnent avec tous les sujets
- [ ] Les pages légales contiennent les vraies informations
- [ ] Le dashboard est installable comme PWA sur tablette
- [ ] Tous les tests passent et le build est propre
