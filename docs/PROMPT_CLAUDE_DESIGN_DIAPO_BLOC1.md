# PROMPT COMPLET POUR CLAUDE DESIGN — DIAPORAMA BLOC 1

---

## CONTEXTE ET MISSION

Tu es un designer expert en présentations professionnelles. Je dois passer un oral de 30 minutes (20 min de présentation + 10 min d'échanges) devant un jury dans le cadre de la validation du **Bloc 1 – "Cadrer un projet de développement d'applications logicielles"** du titre RNCP 39583 Expert en développement logiciel (Niveau 7).

Je dois te fournir absolument tout le contenu, et toi tu vas créer un diaporama **complet, visuellement professionnel, moderne et impactant** qui couvrira l'intégralité des exigences de l'épreuve.

---

## IDENTITÉ VISUELLE DU PROJET

**Nom du produit :** Yallo
**Positionnement :** Vertical SaaS pour la restauration rapide (kebabs, tacos, sushi, burgers)
**Tagline :** "Zero Latency — L'IA vocale qui répond à votre place"
**Palette :** Fond sombre (proche du noir/anthracite), accents jaune-doré/amber (#F59E0B ou similaire), blanc pour le texte, gris moyen pour les éléments secondaires
**Typographie :** Sans-serif moderne (Inter, Geist, ou Satoshi)
**Ambiance :** Startup tech B2B, sérieux mais moderne, innovant

---

## STRUCTURE EXACTE DU DIAPORAMA (23 slides)

### SLIDE 1 — Page de Titre

**Contenu :**
- Titre principal : **"Yallo — Vertical SaaS pour la Restauration Rapide"**
- Sous-titre : **"Cadrage du Projet de Développement Logiciel"**
- Mention : Bloc 1 — RNCP 39583 — Expert en Développement Logiciel — Niveau 7
- Date : Mai 2026
- Fond avec dégradé sombre, logo ou nom "Yallo" en grand, accent doré

---

### SLIDE 2 — Plan de la Présentation

**Contenu (liste numérotée avec icônes) :**
1. Contexte et Problématique
2. Cartographie des Parties Prenantes
3. Analyse de la Demande
4. Analyse SWOT
5. Audit Technique de l'Existant
6. Cartographie des Risques
7. Veille Technologique
8. Étude Comparative des Solutions
9. Cahier des Charges Fonctionnel
10. Estimation de la Charge
11. Budget Prévisionnel
12. Architecture Logicielle
13. Préconisations & Conclusion

---

### SLIDE 3 — Cartographie des Parties Prenantes

**Titre :** "Cartographie des Acteurs du Projet"

**Schéma en cercles concentriques ou organigramme :**

**CERCLE INTERNE — Équipe projet (implication forte) :**
- Développeur Fullstack (moi) — Architecture, développement, tests, déploiement
- Chef de projet — Pilotage, planning, budget

**CERCLE MÉDIAN — Acteurs métier (implication forte) :**
- Commanditaire / Restaurateur — Définit les besoins, valide les livrables, financeur
- Staff cuisine — Utilisateur direct du dashboard tablette
- Admin Yallo (back-office interne) — Gère les restaurants et la configuration

**CERCLE EXTERNE — Partenaires et utilisateurs finaux (implication modérée) :**
- Client final (téléphone) — Passe commande via l'agent IA vocal
- Vapi — Fournisseur d'orchestration IA vocale
- HubRise — Middleware d'intégration caisses enregistreuses
- Neon (PostgreSQL) — Fournisseur base de données serverless
- Vercel — Hébergement et déploiement
- Twilio — Fournisseur de numéros de téléphone

**Tableau à afficher :**

| Acteur | Rôle | Niveau d'implication |
|--------|------|---------------------|
| Commanditaire (restaurateur) | Définir besoins, valider, financer | Fort |
| Développeur fullstack | Concevoir, développer, tester | Fort |
| Staff cuisine | Utiliser le dashboard tablette | Fort |
| Admin Yallo | Configurer, gérer les comptes | Fort |
| Client final | Passer commande par téléphone | Moyen |
| Partenaires API (Vapi, HubRise…) | Fournir des services tiers | Faible |

---

### SLIDE 4 — Profils Utilisateurs (Personas)

**Titre :** "Qui sont les Utilisateurs ?"

**3 cartes personas côte à côte :**

**Persona 1 : Mohamed — Gérant de Kebab**
- Âge : 38 ans
- Frustration : "Je perds 30% de mes appels en heure de pointe"
- Besoin : Solution clé en main, aucune compétence technique requise
- Device : Tablette en caisse ou en cuisine
- Critère décisif : ROI rapide, moins de 3 mois

**Persona 2 : Sarah — Employée en Cuisine**
- Âge : 24 ans
- Frustration : "L'interface doit rester lisible même avec des mains sales et sous la lumière des spots"
- Besoin : Gros boutons, fort contraste, réactivité immédiate
- Device : Tablette partagée montée au mur
- Critère décisif : Zéro temps de formation

**Persona 3 : Le Client Final (au téléphone)**
- Frustration : "Je tombe sur le répondeur ou j'attends trop longtemps"
- Besoin : Commander rapidement, de façon naturelle, en français
- Interface : 100% vocal (agent IA Yallo)
- Critère décisif : Fluidité de la conversation, commande validée en < 2 minutes

---

### SLIDE 5 — Analyse de la Demande

**Titre :** "La Problématique Client"

**Citation centrale (stylisée, grande) :**
> *"Je perds 30% de mon chiffre d'affaires car personne ne répond au téléphone pendant le rush."*

**3 colonnes (Constat → Impact → Besoin identifié) :**

| Constat | Impact | Besoin identifié |
|---------|--------|------------------|
| Téléphone sans réponse en heure de pointe | Perte de CA estimée à 30% | Agent IA vocal disponible 24h/24, 7j/7 |
| Staff débordé, multitâche | Stress, erreurs de commande, mauvais CX | Délégation totale de la prise de commande |
| Aucune traçabilité des commandes | Commandes perdues, litiges clients | Dashboard en temps réel avec historique |
| Pas d'intégration avec la caisse | Double saisie manuelle | Connexion automatique via HubRise |

**KPIs de succès attendus :**
- Taux de réponse téléphonique : **≥ 95%**
- Temps moyen de commande : **< 2 minutes**
- Satisfaction staff (NPS) : **> 40**

---

### SLIDE 6 — Objectifs et Enjeux par Partie Prenante

**Titre :** "Objectifs et Enjeux Croisés"

**Tableau complet :**

| Partie Prenante | Objectifs | Enjeux | Indicateurs de succès |
|-----------------|-----------|--------|----------------------|
| **Restaurateur** | Augmenter le CA, réduire les appels manqués | ROI rapide, adoption immédiate | +30% CA sur commandes tél. |
| **Staff cuisine** | Interface simple, ne pas perturber le travail | Pas de formation longue | Adoption en < 1 heure |
| **Client final** | Commander vite et naturellement | Expérience vocale fluide | Commande validée < 2 min |
| **Équipe dev** | Code maintenable et évolutif | Stack moderne, CI/CD robuste | 0 régressions en prod |
| **Admin Yallo** | Gérer efficacement le parc restaurants | Scalabilité de la plateforme | Onboarding < 30 min |

---

### SLIDE 7 — Analyse SWOT

**Titre :** "Cartographie des Opportunités et Menaces"

**Matrice SWOT classique en 4 quadrants colorés :**

**FORCES (vert) :**
- Stack technique moderne et éprouvée (Next.js 16, TypeScript strict)
- Solution verticale spécialisée (pas généraliste)
- IA vocale innovante avec latence <500ms
- Architecture serverless → coûts proportionnels
- PWA tablet-first adaptée aux contraintes cuisine
- CI/CD automatisé (GitHub Actions, Vercel, SonarCloud)
- 200 tests, coverage 92.67%

**FAIBLESSES (orange) :**
- Dépendance forte aux APIs tierces (Vapi, HubRise, Neon)
- Marché de niche (restauration rapide uniquement)
- Pas d'application mobile native
- Webhook Vapi → BDD non encore implémenté (V1 en cours)
- Stripe non intégré (facturation manuelle)
- Données légales à finaliser (SIRET, RCS)

**OPPORTUNITÉS (bleu) :**
- Marché de la restauration rapide en croissance (+5%/an)
- Adoption croissante de l'IA conversationnelle
- HubRise comme standard du marché (intégration caisse simplifiée)
- Réglementation favorable pour les SaaS B2B
- Expansion Europe à moyen terme
- Intégration future livraison (Uber Eats, Deliverect)

**MENACES (rouge) :**
- Concurrents directs (Otter, Toast, Deliverect, Sunday)
- Risque de hausse tarifaire des APIs (Vapi, OpenAI)
- RGPD et AI Act → données vocales réglementées
- Réticence technologique de certains restaurateurs
- Concentration du marché par les grandes plateformes de livraison

---

### SLIDE 8 — Impact Environnemental et Sécurité

**Titre :** "Éco-conception et Sécurité by Design"

**2 colonnes :**

**IMPACT ENVIRONNEMENTAL :**
- Hébergement Vercel sur serveurs en énergie verte
- Architecture Edge Functions → exécution proche de l'utilisateur → moins de latence → moins d'énergie consommée
- Base de données Neon serverless → scale to zero (aucune consommation à l'inactivité)
- PWA (Progressive Web App) → pas de téléchargement d'application → moins de stockage et de bandes passantes
- Pas de serveurs dédiés → empreinte carbone réduite

**SÉCURITÉ :**
- HTTPS obligatoire (SSL Vercel, A+)
- Authentification NextAuth v5 (JWT, sessions sécurisées)
- Rôles distincts (ADMIN / OWNER) avec middleware de routage
- Données vocales traitées en streaming, jamais stockées côté Yallo
- Validation Zod sur toutes les entrées utilisateur (Server Actions)
- Variables d'environnement chiffrées (Vercel)
- Pipeline CI/CD avec audit de sécurité (`pnpm audit`)
- Conformité RGPD en cours de finalisation

---

### SLIDE 9 — Audit de l'Existant

**Titre :** "Diagnostic des Infrastructures Existantes"

**Avant Yallo — état des lieux type :**

| Infrastructure | État avant Yallo | Contrainte identifiée |
|----------------|------------------|-----------------------|
| Téléphone fixe | Sonne dans le vide en heure de pointe | Besoin d'automatisation 24/7 |
| Caisse enregistreuse | Non connectée à internet ou propriétaire | Intégration via HubRise (middleware standard) |
| Présence digitale | Inexistante ou basique | Pas de pré-requis numérique |
| Données commandes | Papier ou mémoire | Aucune traçabilité |
| Équipe technique | Zéro DSI interne | Solution clé en main obligatoire |

**Contraintes identifiées et réponses apportées :**

| Contrainte | Type | Réponse Yallo |
|------------|------|---------------|
| Budget limité des restaurateurs | Financier | SaaS mensuel (29€ à 349€/mois), 0 setup fee |
| Pas de DSI | Humain | Onboarding guidé, dashboard no-code |
| Matériel existant (tablette) | Technique | PWA — fonctionne sur tout navigateur |
| Caisses hétérogènes | Intégration | HubRise comme couche d'abstraction |
| Accents et dialectes | IA/Vocal | Deepgram Nova 2 (leader FR en précision) |

---

### SLIDE 10 — Faisabilité Technique

**Titre :** "Avis Critique sur la Faisabilité"

**Tableau d'évaluation :**

| Critère | Évaluation | Justification |
|---------|------------|---------------|
| Faisabilité technique | ✅ Validée | Stack mature et documentée (Next.js, TypeScript, PostgreSQL) |
| Intégrations tierces | ✅ Validée | APIs documentées avec SDKs officiels (Vapi, HubRise) |
| Budget | ✅ Maîtrisé | Architecture serverless, coûts variables selon usage |
| Délais (MVP) | ⚠️ Serré | 3 mois MVP réaliste, V1 complète en 6 mois |
| Ressources humaines | ✅ Suffisantes | 1 développeur fullstack couvre le périmètre MVP |
| Réglementaire | ⚠️ À surveiller | AI Act en cours, RGPD données vocales à finaliser |

**Verdict :**
> ✅ **Projet techniquement faisable. Risques identifiés et maîtrisables. Lancement recommandé.**

---

### SLIDE 11 — Cartographie des Risques

**Titre :** "Cartographie des Risques Techniques et Fonctionnels"

**Matrice de risques (axe X = Probabilité, axe Y = Impact) :**

- **R1 — Indisponibilité API Vapi** → Probabilité: Faible / Impact: Critique → Zone ROUGE
- **R2 — Erreurs de transcription vocale** → Probabilité: Moyen / Impact: Majeur → Zone ORANGE
- **R3 — Dépassement de budget** → Probabilité: Moyen / Impact: Majeur → Zone ORANGE
- **R4 — Non-adoption par le staff** → Probabilité: Moyen / Impact: Modéré → Zone JAUNE
- **R5 — Latence élevée en production** → Probabilité: Faible / Impact: Modéré → Zone JAUNE
- **R6 — Fuite de données / RGPD** → Probabilité: Faible / Impact: Critique → Zone ROUGE
- **R7 — Hausse tarifaire APIs** → Probabilité: Moyen / Impact: Modéré → Zone JAUNE

---

### SLIDE 12 — Référentiel des Risques et Indicateurs de Contrôle

**Titre :** "Référentiel d'Évaluation et de Suivi des Incidents"

**Tableau complet :**

| ID | Risque | Prob. | Impact | Mitigation | Indicateur de contrôle | Seuil d'alerte |
|----|--------|-------|--------|------------|------------------------|----------------|
| R1 | Indisponibilité API Vapi | Faible | Critique | Fallback vers message vocal statique + numéro humain | Uptime Vapi > 99,9% | < 99,5% |
| R2 | Transcription erronée | Moyen | Majeur | Confirmation vocale par l'agent IA | Taux d'erreur < 5% | > 8% |
| R3 | Dépassement budget | Moyen | Majeur | Suivi hebdomadaire, alertes coûts API | Écart budget < 10% | > 15% |
| R4 | Non-adoption staff | Moyen | Modéré | UX simplifiée, formation 30 min, vidéo | NPS staff > 40 | < 25 |
| R5 | Latence prod | Faible | Modéré | Edge computing Vercel, optimisation requêtes | P95 latence < 200ms | > 500ms |
| R6 | Fuite de données | Faible | Critique | Audit sécurité CI/CD, rotation secrets, HTTPS | 0 vulnérabilité critique | Toute détection |
| R7 | Hausse APIs | Moyen | Modéré | Contrats préférentiels, alternatives identifiées (Groq) | Coût/min < 0,07€ | > 0,12€ |

**Processus de gestion des incidents :**
`Détection (monitoring) → Qualification (criticité) → Escalade → Traitement → Clôture → Bilan`

---

### SLIDE 13 — Veille Technologique

**Titre :** "Stratégie de Veille Technologique et Réglementaire"

**Schéma du processus :**
`Sources → Collecte → Analyse → Décision → Roadmap`

**Sources par domaine :**

| Domaine | Sources | Fréquence |
|---------|---------|-----------|
| Technologique | GitHub Trending, HackerNews, Dev.to, Changelog Next.js/Vapi | Quotidien |
| Réglementaire | CNIL.fr, Journal Officiel, AI Act EU, ANSSI | Mensuel |
| Marché | TechCrunch, Restaurant Tech News, CB Insights | Hebdomadaire |
| Concurrence | Sites Otter, Toast, Deliverect, Sunday, Lunchr | Mensuel |

**Outils utilisés :**
- Feedly (agrégation RSS multi-sources)
- Google Alerts (mots-clés : "voice AI ordering", "restaurant SaaS", "AI Act")
- LinkedIn (réseau professionnel, annonces acteurs du marché)
- Newsletters : TLDR Tech, Bytes, Pointer.io
- Salons : NRF, HoReCa, VivaTech (veille marché)

**Bénéfices de la veille :**
- Validation des choix technologiques par benchmarking
- Anticipation des évolutions réglementaires (AI Act, RGPD vocal)
- Avantage concurrentiel : adoption early de Vapi avant ses concurrents

---

### SLIDE 14 — Résultats de la Veille

**Titre :** "Évolutions Identifiées et Impact sur le Projet"

**Tableau des évolutions :**

| Évolution | Source identifiée | Impact Métier | Impact Environnemental | Décision |
|-----------|-------------------|---------------|------------------------|----------|
| Next.js 15 App Router (Server Components) | GitHub Changelog | Performance +30%, sécurité accrue | Moins de JS client = moins de bandwidth | ✅ Adopté |
| Vapi v2 (latence optimisée) | Docs Vapi | Latence -50ms, réponse plus naturelle | Moins d'appels redondants | ✅ Adopté |
| Groq (LLM ultra-rapide) | HackerNews | Coût inférence -70% vs GPT-4o | Inference optimisée, green datacenter | 🔄 Post-V1 |
| EU AI Act (classification IA) | CNIL / Commission EU | Obligation de transparence sur l'IA | N/A | ⚠️ Surveiller |
| Deepgram Nova 2 (STT) | Benchmark vocal | Meilleure précision FR, accents | Inférence locale disponible | ✅ Adopté |

---

### SLIDE 15 — Étude Comparative — Framework Frontend

**Titre :** "Comparatif des Solutions Techniques — Frontend"

**Tableau comparatif :**

| Critère | Next.js 16 | Nuxt.js 3 | Remix | SvelteKit |
|---------|-----------|-----------|-------|-----------|
| SSR / SSG natif | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Écosystème React | ⭐⭐⭐ | ❌ Vue | ⭐⭐⭐ | ❌ Svelte |
| Performance | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Sécurité (Server Components) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| Déploiement intégré | ✅ Vercel natif | Netlify | Vercel | Vercel |
| Communauté | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| Accessibilité | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Impact écologique | ⭐⭐ Edge | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ léger |
| **Choix retenu** | ✅ **OUI** | | | |

**Justification :** Écosystème React le plus mature, Server Components pour la sécurité, intégration native Vercel, expérience équipe, support TypeScript first-class.

---

### SLIDE 16 — Étude Comparative — Solutions IA Vocale

**Titre :** "Comparatif des Solutions Vocales IA"

**Tableau comparatif :**

| Critère | **Vapi** | Retell AI | Bland AI | Solution Custom |
|---------|---------|-----------|----------|-----------------|
| Latence moyenne | **~500ms** | ~800ms | ~600ms | Variable |
| Coût / minute | **0,05€** | 0,07€ | 0,06€ | 0,15€+ |
| Intégrations | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⚠️ À construire |
| Transcription | Deepgram Nova 2 | Whisper | Deepgram | Custom |
| LLM supportés | GPT-4o, Claude | GPT-4 | GPT-4 | Libre |
| Maintenance | ✅ Managé | ✅ Managé | ✅ Managé | ❌ Interne |
| Documentation | ⭐⭐⭐ | ⭐⭐ | ⭐ | N/A |
| **Choix retenu** | ✅ **OUI** | | | |

**Justification :** Meilleure latence, coût maîtrisé, SDK complet, webhook natif, modèle managé = time-to-market optimal.

**Ressources matérielles et techniques nécessaires :**
- Serveur applicatif : Vercel (serverless, Edge Network mondial)
- Base de données : Neon PostgreSQL (serverless, scale to zero)
- CDN : Vercel Edge Network (180 points de présence)
- Téléphonie : Twilio (numéros locaux français, portabilité)
- Monitoring : Vercel Analytics + SonarCloud

---

### SLIDE 17 — Cahier des Charges Fonctionnel

**Titre :** "Diagramme des Fonctionnalités — Hiérarchisation"

**Arbre de fonctionnalités :**

```
YALLO
├── MODULE MARKETING (yallo.fr)
│   ├── P0 — Landing page (hero, pricing, FAQ)
│   ├── P0 — Formulaire de contact (lead capture)
│   ├── P1 — Page démo (numéro d'appel ou widget web)
│   └── P2 — Blog / Témoignages
│
├── MODULE DASHBOARD RESTAURANT (app.yallo.fr)
│   ├── P0 — Gestion des commandes en temps réel (NEW → DELIVERING)
│   ├── P0 — Statut cuisine (CALM / NORMAL / RUSH / STOP)
│   ├── P0 — Ticket de commande détaillé
│   ├── P1 — Gestion du menu (import IA via photo)
│   ├── P1 — Gestion des horaires d'ouverture
│   ├── P1 — KPIs (CA, panier moyen, nb commandes)
│   └── P2 — Intégration HubRise (caisse)
│
├── MODULE AGENT IA VOCAL (Vapi)
│   ├── P0 — Prise de commande vocale (NLP francophone)
│   ├── P0 — Confirmation de commande et montant
│   ├── P1 — Questions/réponses sur le menu
│   └── P2 — Transfert vers un humain si nécessaire
│
└── MODULE ADMIN (app.yallo.fr/admin)
    ├── P0 — CRUD Restaurants et Utilisateurs
    ├── P0 — Configuration assistant Vapi par restaurant
    ├── P1 — Gestion des offres tarifaires
    └── P2 — Analytics et reporting
```

**Tableau de priorités :**

| Priorité | Fonctions | Type |
|----------|-----------|------|
| P0 (Must-have) | Prise commande vocale, Dashboard commandes, Auth | Principale |
| P1 (Should-have) | Gestion menu IA, Horaires, Admin CRUD | Secondaire |
| P2 (Nice-to-have) | Analytics, HubRise push, Stripe complet | Complémentaire |

**Note UX :** Interface dashboard conçue tablet-first, forts contrastes, boutons larges ≥ 44px, mode sombre par défaut.

---

### SLIDE 18 — Estimation de la Charge de Travail

**Titre :** "Estimation de la Charge — Jours/Homme"

**Tableau complet :**

| Module | Fonctionnalité | Complexité | Charge (j/h) |
|--------|----------------|------------|--------------|
| **Infrastructure** | Setup projet, CI/CD, environnements | Moyenne | 5 |
| | Base de données (schéma, migrations) | Moyenne | 3 |
| | Authentification (NextAuth, rôles) | Moyenne | 3 |
| **Dashboard** | Gestion commandes (cycle de vie complet) | Élevée | 10 |
| | Statut cuisine (CALM/RUSH/STOP) | Faible | 2 |
| | Gestion menu (import IA + éditeur) | Élevée | 8 |
| | Horaires d'ouverture | Faible | 2 |
| | KPIs dashboard | Moyenne | 3 |
| **Agent Vocal** | Intégration Vapi (CRUD assistant) | Élevée | 6 |
| | Prompt système dynamique | Moyenne | 4 |
| | Webhook Vapi → création commandes | Élevée | 5 |
| | Tests vocaux (scénarios) | Moyenne | 5 |
| **Marketing** | Landing page (sections animées) | Moyenne | 5 |
| | Formulaire contact (Zod + Resend) | Faible | 2 |
| | SEO (metadata, sitemap, JSON-LD) | Faible | 2 |
| **Admin** | CRUD restaurants + utilisateurs | Moyenne | 5 |
| | Configuration Vapi par restaurant | Moyenne | 3 |
| **Intégrations** | HubRise (lecture catalogue) | Élevée | 4 |
| | OpenAI Vision (parsing menu) | Moyenne | 3 |
| **Tests** | Tests unitaires (200 tests, 92% coverage) | Élevée | 8 |
| **TOTAL** | | | **~88 j/h** |

**Méthode :** Estimation par analogie + décomposition WBS (Work Breakdown Structure)

---

### SLIDE 19 — Budget Prévisionnel

**Titre :** "Estimation des Coûts — Budget Prévisionnel Année 1"

**Tableau des coûts :**

| Poste | Coût Unitaire | Quantité | Total Année 1 |
|-------|---------------|----------|---------------|
| **Développement** (TJM 350€) | 350€/jour | 88 jours | 30 800€ |
| **Hébergement Vercel Pro** | 20€/mois | 12 mois | 240€ |
| **Base de données Neon** | 19€/mois | 12 mois | 228€ |
| **Vapi Voice AI** | 0,05€/min × 10 000 min/mois | 12 mois | 6 000€ |
| **Twilio (numéros + appels)** | 15€/mois | 12 mois | 180€ |
| **OpenAI (API menu)** | ~10€/mois | 12 mois | 120€ |
| **Resend (emails)** | Gratuit puis ~5€/mois | 12 mois | 60€ |
| **Domaine + SSL** | 15€/an | 1 an | 15€ |
| **SonarCloud** | Gratuit (open source) | — | 0€ |
| **Divers (outils, tests, monitoring)** | Forfait | — | 500€ |
| **TOTAL ANNÉE 1** | | | **~38 000€** |

**Répartition (graphique camembert) :**
- Développement : 81%
- APIs Voice (Vapi) : 16%
- Infrastructure (hébergement, BDD, téléphonie) : 3%

**Plans tarifaires Yallo (revenus) :**

| Plan | Prix | Commission | Minutes incluses |
|------|------|------------|-----------------|
| Starter | 29€/mois | 7%/commande | Illimitées |
| Essential | 149€/mois | 0% | 400 min |
| Infinity | 349€/mois | 0% | 1 200 min |

**Seuil de rentabilité :** ~18 restaurants plan Essential pour couvrir les coûts fixes.

---

### SLIDE 20 — Architecture Logicielle — Vue Globale

**Titre :** "Architecture Logicielle — Vue Globale"

**Schéma d'architecture en couches :**

```
┌──────────────────────────────────────────────────────────┐
│                      UTILISATEURS                         │
│    Client (tél.)    Staff Cuisine (tablette)   Admin     │
└──────────┬────────────────┬─────────────────────┬────────┘
           │                │                     │
           ▼                ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                  FRONTEND — Next.js 16                    │
│   yallo.fr (Marketing)  │  app.yallo.fr (Dashboard+Admin)│
└──────────────────────────┬───────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌───────────────┐ ┌──────────────┐ ┌───────────────┐
│ Server Actions│ │  API Routes  │ │  Middleware   │
│ (Mutations)   │ │  (/api/*)    │ │  (Auth/Route) │
└───────┬───────┘ └──────┬───────┘ └───────┬───────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         ▼
         ┌──────────────────────────────────┐
         │    SERVICES INTERNES             │
         │  NextAuth v5 │ Drizzle ORM       │
         └──────────────┬───────────────────┘
                        ▼
         ┌──────────────────────────────────┐
         │  PostgreSQL — Neon Serverless     │
         │  Users, Restaurants, Orders      │
         │  Menu (JSONB), Pricing Plans     │
         └──────────────────────────────────┘
                        
         ┌──────────────────────────────────────────┐
         │         INTÉGRATIONS EXTERNES            │
         │  Vapi (Voice AI) │ HubRise │ Twilio      │
         │  OpenAI GPT-4o   │ Resend  │ Vercel CDN  │
         └──────────────────────────────────────────┘
```

**Pattern architectural :** Vertical Slices Feature-based (par domaine métier : orders, menu, kitchen-status, hours)

---

### SLIDE 21 — Architecture Détaillée — Flux de Commande Vocale

**Titre :** "Flux de Commande Vocale — Architecture Cible V1"

**Diagramme de séquence :**

```
Client (Appel) → Twilio (routage) → Vapi (orchestration IA)
                                          ↓
                               GPT-4o traite la conversation
                               (contexte : menu du restaurant)
                                          ↓
                             Vapi POST → /api/vapi/webhook
                                          ↓
                          Parsing JSON → Création commande BDD
                                          ↓
                         Notification Dashboard (SSE / polling)
                                          ↓
                      Staff cuisine voit la commande en temps réel
                                          ↓
                       Cycle : NOUVEAU → PRÉPARATION → PRÊT → LIVRÉ
                                          ↓
                       (Optionnel) Push commande → HubRise → Caisse
```

**Stack technique détaillée :**

| Couche | Technologie | Justification |
|--------|------------|---------------|
| Framework | Next.js 16 (App Router) | SSR, Server Components, Edge |
| Langage | TypeScript 5.9 strict | Fiabilité, maintenabilité |
| BDD | PostgreSQL (Neon) + Drizzle ORM | Serverless, type-safe |
| Auth | NextAuth v5 (JWT) | Standard industrie |
| Voice AI | Vapi + GPT-4o + Deepgram Nova 2 | Latence optimale, précision FR |
| Email | Resend + React Email | Templates réutilisables |
| Tests | Vitest + Testing Library | 200 tests, 92.67% coverage |
| CI/CD | GitHub Actions + Vercel + SonarCloud | Qualité continue |

---

### SLIDE 22 — Préconisations et Axes de Solution

**Titre :** "Préconisations — Axes de Solutions Recommandés"

**Tableau de décisions architecturales :**

| Décision | Option A | Option B | Choix | Argumentaire |
|----------|----------|----------|-------|-------------|
| Déploiement | PWA | App native iOS/Android | ✅ **PWA** | Déploiement instantané, 0 store, tablet-first |
| Infrastructure | Serverless (Vercel + Neon) | VPS dédié | ✅ **Serverless** | Coûts proportionnels, 0 maintenance serveur |
| Voice AI | Vapi managé | Stack custom | ✅ **Vapi** | Time-to-market, SLA garanti, SDK complet |
| Intégration caisse | HubRise (middleware) | Direct POS | ✅ **HubRise** | Standard marché, 300+ caisses compatibles |
| Pattern code | Vertical Slices | MVC en couches | ✅ **Vertical Slices** | Maintenabilité, isolation des domaines |
| CI/CD | GitHub Actions + Vercel | Jenkins + AWS | ✅ **GH Actions** | Coût nul, natif GitHub, intégration Vercel |

**Roadmap recommandée :**

| Phase | Horizon | Fonctionnalités |
|-------|---------|-----------------|
| **MVP V1** | J+3 mois | Commande vocale + Dashboard + Admin de base |
| **V1 complète** | J+6 mois | Stripe, notif. temps réel, PWA, HubRise push |
| **V2** | J+12 mois | Analytics avancés, multi-langue, app mobile |
| **V3** | J+18 mois | API publique, franchise mode, IA prédictive |

---

### SLIDE 23 — Conclusion et Argumentaire Final

**Titre :** "Pourquoi Yallo ? — Synthèse et Décision"

**3 arguments centraux (grandes cartes visuelles) :**

**1. PROBLÈME RÉEL ET QUANTIFIÉ**
> 30% du CA perdu par les appels sans réponse — un problème quotidien, non résolu, dans 200 000 restaurants fast-food en France.

**2. SOLUTION TECHNIQUE VALIDÉE**
> Stack éprouvée (Next.js, PostgreSQL, TypeScript), architecture serverless scalable, 200 tests automatisés, CI/CD complet — une base solide pour la production.

**3. MODÈLE ÉCONOMIQUE VIABLE**
> SaaS avec 3 plans tarifaires (29€ → 349€/mois), seuil de rentabilité à 18 clients, coûts maîtrisés grâce à l'infrastructure serverless.

**Récapitulatif des compétences mobilisées (obligatoire pour le jury) :**

| Compétence | Ce qui a été fait |
|------------|------------------|
| C1.1.1 — Cartographie acteurs | Schéma parties prenantes, 3 niveaux d'implication, personas |
| C1.2.2 — Faisabilité technique | Audit, contraintes, verdict argumenté |
| C1.3.2 — Architecture comparative | Tableaux comparatifs Frontend + Voice AI |
| C1.4.1 — Charge de travail | Estimation 88 j/h par module |
| C1.6 — Préconisations client | Roadmap, décisions argumentées, budget |

**Call to action final :**
> "Ce cadrage démontre qu'un développeur fullstack seul peut concevoir, développer et déployer un SaaS vertical complet, en maîtrisant l'ensemble de la chaîne — de l'analyse du besoin à l'architecture en production."

---

## DIRECTIVES DE DESIGN

### Style général
- **Fond :** Sombre (#0F0F0F ou #111827), jamais blanc
- **Accent primaire :** Doré/Amber (#F59E0B) pour les titres et éléments clés
- **Texte :** Blanc (#FFFFFF) pour le principal, gris clair (#9CA3AF) pour le secondaire
- **Tableaux :** Fond légèrement plus clair que le fond principal, bordures subtiles
- **Icons :** Lucide Icons ou Heroicons (style outline, doré)
- **Typographie titre :** Bold, taille 32-40px
- **Typographie corps :** Regular, taille 14-16px
- **Espacement :** Généreux, slide aérée, jamais surchargée

### Éléments visuels par slide
- Chaque slide doit avoir **un élément visuel fort** : schéma, tableau coloré, matrice, ou citation stylisée
- Les tableaux doivent avoir **des lignes alternées** pour la lisibilité
- Les matrices (SWOT, risques) doivent être **colorées par quadrant** (vert, orange, rouge, bleu)
- Les schémas d'architecture doivent utiliser des **boîtes avec couleurs distinctes** par couche
- Les personas doivent être **des cartes avec titre, frustration, besoin et device**

### Numérotation
- Numéro de slide en bas à droite (discret, gris)
- Nom "Yallo" en bas à gauche (en petit, doré)

### Transitions
- Transition simple et sobre (fade ou slide horizontal)
- Pas d'effets distrayants

---

## FORMAT DE SORTIE ATTENDU

Génère le diaporama complet au format **HTML single-file reveal.js** (ou équivalent) avec :
- Toutes les 23 slides
- Le design sombre et l'identité visuelle Yallo appliqués
- Tous les tableaux, schémas et visuels inclus
- Une slide numérotée et navigable
- Compatible export PDF

Si tu préfères générer un autre format (Markdown avec instructions de mise en forme, code React/JSX pour un outil de slides, ou tout autre format), précise-le et fournis l'intégralité du code.

**Priorité absolue : le contenu doit être COMPLET. Chaque slide doit contenir tout ce qui est listé ci-dessus.**
