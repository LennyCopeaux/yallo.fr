# Trame Présentation Bloc 1 - Cadrer un Projet de Développement

**Projet :** Yallo - Vertical SaaS pour Fast Food Restaurants  
**Durée :** 20 min présentation + 10 min échanges  
**Format :** Diaporama (PowerPoint, Google Slides, Keynote)

---

## Structure Globale (20 minutes)

| Section | Durée | Slides |
|---------|-------|--------|
| 1. Introduction | 1 min | 1-2 |
| 2. Parties prenantes | 2 min | 3-4 |
| 3. Analyse de la demande | 2 min | 5-6 |
| 4. SWOT (Opportunités/Menaces) | 2 min | 7-8 |
| 5. Audit technique | 2 min | 9-10 |
| 6. Risques | 2 min | 11-12 |
| 7. Veille technologique | 2 min | 13-14 |
| 8. Étude comparative | 2 min | 15-16 |
| 9. Fonctionnalités | 2 min | 17-18 |
| 10. Budget | 1 min | 19 |
| 11. Architecture | 2 min | 20-21 |
| 12. Préconisations | 1 min | 22 |
| 13. Conclusion | 1 min | 23 |

**Total : ~22 slides**

---

## SLIDE 1 : Page de Titre

### Contenu visuel
- **Titre :** "Yallo - Vertical SaaS pour Fast Food"
- **Sous-titre :** "Cadrage du Projet de Développement"
- **Logo Yallo** (si disponible)
- **Nom, Prénom**
- **Date**
- **Image de fond :** Photo stylisée d'un restaurant fast-food ou d'un téléphone

### Design
- Fond sombre avec dégradé (cohérent avec l'identité Yallo)
- Police moderne, épurée
- Logo centré ou en haut à gauche

---

## SLIDE 2 : Agenda / Plan

### Contenu visuel
- **Titre :** "Plan de la Présentation"
- **Liste numérotée :**
  1. Contexte et Problématique
  2. Parties Prenantes
  3. Analyse SWOT
  4. Audit Technique
  5. Gestion des Risques
  6. Veille Technologique
  7. Architecture Proposée
  8. Budget et Planning
  9. Préconisations

### Design
- Icônes à côté de chaque point
- Timeline verticale ou horizontale

---

## SLIDE 3 : Cartographie des Parties Prenantes

### Contenu visuel
**Schéma en cercles concentriques (ou mindmap)**

```
                    [YALLO]
                       |
    ┌──────────────────┼──────────────────┐
    |                  |                  |
[INTERNES]        [EXTERNES]         [UTILISATEURS]
    |                  |                  |
- Développeur     - Vapi (Voice AI)   - Staff cuisine
- Architecte      - HubRise (Caisse)  - Restaurateur
- Chef de projet  - Vercel (Hosting)  - Client final
- Designer UX     - Neon (Database)     (téléphone)
                  - Twilio (Téléphonie)
```

### Tableau à inclure (petit)

| Acteur | Rôle | Niveau d'implication |
|--------|------|---------------------|
| Commanditaire | Définir besoins, valider | Fort |
| Développeur | Développer, tester | Fort |
| Staff cuisine | Utiliser dashboard | Fort |
| Client final | Passer commande par téléphone | Moyen |
| Partenaires API | Fournir services | Faible |

### Ce que tu dis à l'oral
- "Le projet implique 3 cercles d'acteurs..."
- "Le commanditaire est le restaurateur qui veut automatiser ses prises de commande téléphoniques"
- "Les utilisateurs finaux sont de 2 types : le staff cuisine qui gère les commandes, et le client qui appelle"

---

## SLIDE 4 : Profils Utilisateurs (Personas)

### Contenu visuel
**2-3 cartes personas côte à côte**

**Persona 1 : Mohamed, Gérant Kebab**
- Photo : Homme 35-45 ans
- Frustrations : "Je perds 30% des appels aux heures de pointe"
- Besoins : Zéro latence, simplicité
- Device : Tablette en cuisine

**Persona 2 : Sarah, Employée Cuisine**
- Photo : Femme 20-30 ans
- Frustrations : "L'interface doit être visible même avec les mains sales"
- Besoins : Gros boutons, contraste élevé
- Device : Tablette partagée

**Persona 3 : Client téléphonique**
- Frustrations : "Attente trop longue, serveur occupé"
- Besoins : Commande rapide, naturelle
- Interface : Voix (IA Yallo)

### Ce que tu dis à l'oral
- "J'ai identifié 3 profils utilisateurs clés..."
- "Le staff cuisine a des contraintes spécifiques : environnement lumineux, mains occupées"
- "L'expérience utilisateur a guidé toutes mes décisions techniques"

---

## SLIDE 5 : Analyse de la Demande

### Contenu visuel
**Titre :** "Problématique Client"

**Encadré central (citation stylisée) :**
> "Je perds 30% de mon chiffre d'affaires car personne ne répond au téléphone pendant le rush."

**3 colonnes :**

| Constat | Impact | Besoin identifié |
|---------|--------|------------------|
| Téléphone sonne sans réponse | Perte de CA (-30%) | Réponse automatique 24/7 |
| Staff débordé | Stress, erreurs | Déléguer prise commande |
| Pas de traçabilité | Commandes perdues | Dashboard temps réel |

### Ce que tu dis à l'oral
- "Le problème central est simple : les restaurants fast-food perdent des clients car ils ne répondent pas au téléphone"
- "J'ai mené des entretiens d'explicitation pour comprendre les besoins réels"
- "3 besoins majeurs ont émergé..."

---

## SLIDE 6 : Objectifs et Enjeux par Partie Prenante

### Contenu visuel
**Tableau structuré**

| Partie Prenante | Objectifs | Enjeux |
|-----------------|-----------|--------|
| **Restaurateur** | Augmenter CA, réduire stress | ROI rapide, adoption facile |
| **Staff cuisine** | Interface simple, rapide | Pas de formation longue |
| **Client final** | Commander vite, naturellement | Expérience vocale fluide |
| **Développeur** | Code maintenable | Stack moderne, évolutive |

**Indicateurs de succès (KPIs) :**
- Taux de réponse téléphonique : 95%+
- Temps moyen de commande : < 2 min
- Satisfaction staff : > 4/5

### Ce que tu dis à l'oral
- "Chaque partie prenante a ses propres enjeux..."
- "Pour le restaurateur, l'enjeu est financier : ROI en moins de 3 mois"
- "Pour le staff, l'enjeu est l'adoption : si c'est compliqué, ils ne l'utiliseront pas"

---

## SLIDE 7 : Analyse SWOT

### Contenu visuel
**Matrice SWOT classique (4 quadrants colorés)**

```
┌─────────────────────────┬─────────────────────────┐
│      FORCES (S)         │    FAIBLESSES (W)       │
│  (Vert)                 │    (Orange)             │
├─────────────────────────┼─────────────────────────┤
│ - Stack moderne Next.js │ - Dépendance APIs       │
│ - IA vocale innovante   │   tierces (Vapi)        │
│ - Vertical SaaS ciblé   │ - Marché niche          │
│ - PWA tablet-first      │ - Pas d'app mobile      │
│ - Architecture scalable │   native                │
└─────────────────────────┴─────────────────────────┘
┌─────────────────────────┬─────────────────────────┐
│   OPPORTUNITÉS (O)      │     MENACES (T)         │
│  (Bleu)                 │    (Rouge)              │
├─────────────────────────┼─────────────────────────┤
│ - Marché fast-food en   │ - Concurrence (Otter,   │
│   croissance (+5%/an)   │   Toast, Deliverect)    │
│ - Adoption IA vocale    │ - Évolution tarifs APIs │
│ - Intégration HubRise   │ - RGPD / données vocales│
│ - Expansion Europe      │ - Réticence techno      │
└─────────────────────────┴─────────────────────────┘
```

### Ce que tu dis à l'oral
- "L'analyse SWOT m'a permis d'identifier les leviers et les points de vigilance"
- "Notre force principale : une solution verticale spécialisée, pas un outil généraliste"
- "La menace principale : la dépendance aux APIs tierces et leurs évolutions tarifaires"

---

## SLIDE 8 : Impact Environnemental et Sécurité

### Contenu visuel
**2 colonnes**

**Impact Environnemental :**
- Hébergement Vercel : Serveurs green energy
- Edge functions : Exécution proche utilisateur (moins de latence = moins d'énergie)
- PWA vs App Native : Pas de téléchargement, moins de stockage
- Base de données serverless (Neon) : Scale to zero

**Sécurité :**
- HTTPS obligatoire (Vercel SSL)
- Authentification NextAuth (JWT)
- Données vocales non stockées (streaming)
- Conformité RGPD prévue

**Icône :** Feuille verte + Cadenas

### Ce que tu dis à l'oral
- "J'ai intégré les préoccupations environnementales dès la conception"
- "Le choix d'une architecture serverless réduit l'empreinte carbone"
- "Côté sécurité, les données vocales sont traitées en streaming, jamais stockées"

---

## SLIDE 9 : Audit de l'Existant

### Contenu visuel
**Titre :** "Diagnostic des Infrastructures Existantes"

**Avant Yallo (état des lieux) :**
```
┌─────────────────┐
│   Restaurant    │
├─────────────────┤
│ - Téléphone fixe│ ──> Personne ne répond
│ - Caisse (POS)  │ ──> Non connectée
│ - Pas de site   │ ──> Pas de présence online
│ - Pas de data   │ ──> Aucune traçabilité
└─────────────────┘
```

**Contraintes identifiées :**
| Contrainte | Type | Impact |
|------------|------|--------|
| Budget limité | Financier | SaaS mensuel, pas de setup |
| Pas de DSI | Humain | Installation clé en main |
| Matériel existant | Technique | Doit fonctionner sur tablette |
| Multi-caisses (HubRise) | Intégration | API standardisée |

### Ce que tu dis à l'oral
- "La plupart des restaurants n'ont aucune infrastructure numérique"
- "Contrainte majeure : pas de DSI, donc solution clé en main obligatoire"
- "J'ai audité les solutions de caisse existantes et identifié HubRise comme middleware standard"

---

## SLIDE 10 : Faisabilité Technique

### Contenu visuel
**Tableau de faisabilité**

| Critère | Évaluation | Justification |
|---------|------------|---------------|
| Technique | ✅ Faisable | Stack mature (Next.js, React) |
| Intégrations | ✅ Faisable | APIs documentées (Vapi, HubRise) |
| Budget | ✅ Faisable | Coûts maîtrisés (serverless) |
| Délais | ⚠️ Serré | MVP 3 mois, full 6 mois |
| Équipe | ✅ Faisable | 1 dev fullstack suffit pour MVP |

**Verdict :** 
```
┌────────────────────────────────────┐
│  PROJET TECHNIQUEMENT FAISABLE    │
│  Risques maîtrisables             │
│  Lancement recommandé             │
└────────────────────────────────────┘
```

### Ce que tu dis à l'oral
- "J'ai évalué la faisabilité sur 5 critères"
- "Le point de vigilance : les délais serrés pour un MVP fonctionnel"
- "Ma conclusion : le projet est techniquement faisable avec les moyens identifiés"

---

## SLIDE 11 : Cartographie des Risques

### Contenu visuel
**Matrice de risques (Probabilité x Impact)**

```
Impact ▲
  Élevé │    [R3]         [R1]
        │     ●            ●
        │
 Moyen  │         [R4]    [R2]
        │          ●       ●
        │
 Faible │    [R5]
        │     ●
        └──────────────────────▶ Probabilité
          Faible    Moyen   Élevé
```

**Légende :**
- R1 : Indisponibilité API Vapi (Critique)
- R2 : Erreurs de transcription vocale (Majeur)
- R3 : Dépassement budget (Majeur)
- R4 : Adoption lente par le staff (Modéré)
- R5 : Problèmes de latence (Modéré)

### Ce que tu dis à l'oral
- "J'ai identifié 5 risques majeurs, classés par criticité"
- "Le risque R1 (indisponibilité Vapi) est le plus critique car il bloque tout le service"
- "J'ai mis en place des indicateurs de contrôle pour chaque risque"

---

## SLIDE 12 : Référentiel des Risques et Indicateurs

### Contenu visuel
**Tableau référentiel**

| ID | Risque | Probabilité | Impact | Mitigation | Indicateur |
|----|--------|-------------|--------|------------|------------|
| R1 | API Vapi down | Faible | Critique | Fallback téléphone | Uptime API > 99.9% |
| R2 | Transcription erronée | Moyen | Majeur | Confirmation vocale | Taux erreur < 5% |
| R3 | Dépassement budget | Moyen | Majeur | Suivi hebdo, alertes | Écart < 10% |
| R4 | Non-adoption staff | Moyen | Modéré | Formation, UX simple | NPS > 40 |
| R5 | Latence élevée | Faible | Modéré | Edge computing | P95 < 200ms |

**Processus de suivi :**
```
Détection → Qualification → Traitement → Clôture
```

### Ce que tu dis à l'oral
- "J'ai élaboré un référentiel avec des indicateurs mesurables"
- "Chaque risque a une stratégie de mitigation définie"
- "Le suivi se fait via des dashboards automatisés"

---

## SLIDE 13 : Veille Technologique

### Contenu visuel
**Titre :** "Méthodologie de Veille"

**Schéma du processus :**
```
Sources → Collecte → Analyse → Action
   │         │          │         │
   ▼         ▼          ▼         ▼
[Liste]  [Outils]   [Synthèse]  [Roadmap]
```

**Sources consultées :**
| Type | Sources | Fréquence |
|------|---------|-----------|
| Technologique | GitHub, HackerNews, Dev.to | Quotidien |
| Réglementaire | CNIL, RGPD updates | Mensuel |
| Marché | TechCrunch, Restaurant Tech | Hebdo |
| Concurrence | Otter, Toast, Deliverect | Mensuel |

**Outils utilisés :**
- Feedly (agrégation RSS)
- Google Alerts (mots-clés)
- LinkedIn (réseau pro)
- Newsletters tech (TLDR, Bytes)

### Ce que tu dis à l'oral
- "J'ai mis en place une stratégie de veille structurée"
- "L'objectif : anticiper les évolutions technologiques et réglementaires"
- "Exemple concret : j'ai identifié Vapi comme meilleur orchestrateur IA vocale grâce à cette veille"

---

## SLIDE 14 : Résultats de la Veille

### Contenu visuel
**Évolutions identifiées et impact**

| Évolution | Source | Impact Métier | Impact Environnemental |
|-----------|--------|---------------|------------------------|
| Next.js 15 App Router | GitHub | Perf +30% | Moins de JS client |
| Vapi v2 | Docs Vapi | Latence -50ms | Moins d'appels API |
| Groq LLM | HackerNews | Coût -70% | Inference optimisée |
| RGPD IA Act | CNIL | Conformité | N/A |

**Bénéfices attendus :**
- Choix technologiques validés par la veille
- Anticipation des évolutions réglementaires
- Avantage concurrentiel (early adopter)

### Ce que tu dis à l'oral
- "La veille m'a permis de valider mes choix techniques"
- "Exemple : Groq offre des performances supérieures à un coût 70% inférieur"
- "J'ai aussi anticipé les implications du AI Act européen"

---

## SLIDE 15 : Étude Comparative des Solutions

### Contenu visuel
**Tableau comparatif (Framework Frontend)**

| Critère | Next.js | Nuxt.js | Remix | SvelteKit |
|---------|---------|---------|-------|-----------|
| SSR/SSG | ✅✅ | ✅✅ | ✅ | ✅ |
| Écosystème | ✅✅ | ✅ | ⚠️ | ⚠️ |
| Performance | ✅✅ | ✅ | ✅✅ | ✅✅ |
| Courbe apprentissage | ✅ | ✅ | ✅✅ | ✅ |
| Communauté | ✅✅ | ✅ | ⚠️ | ⚠️ |
| **Choix** | **✅** | | | |

**Justification du choix :**
- Écosystème React le plus mature
- Server Components = sécurité accrue
- Vercel = déploiement natif
- Expérience équipe

### Ce que tu dis à l'oral
- "J'ai comparé 4 frameworks selon des critères objectifs"
- "Next.js s'impose par son écosystème et son intégration Vercel"
- "Les Server Components offrent une sécurité renforcée côté serveur"

---

## SLIDE 16 : Comparatif Solutions IA Vocale

### Contenu visuel
**Tableau comparatif (Voice AI)**

| Critère | Vapi | Retell AI | Bland AI | Custom |
|---------|------|-----------|----------|--------|
| Latence | 500ms | 800ms | 600ms | Variable |
| Coût/min | 0.05€ | 0.07€ | 0.06€ | 0.15€ |
| Intégrations | ✅✅ | ✅ | ✅ | ⚠️ |
| Transcription | Deepgram | Whisper | Deepgram | Custom |
| Maintenance | ✅✅ | ✅ | ✅ | ❌ |
| **Choix** | **✅** | | | |

**Ressources matérielles nécessaires :**
- Serveur : Vercel (serverless, pas de serveur dédié)
- Base de données : Neon (PostgreSQL serverless)
- CDN : Vercel Edge Network
- Téléphonie : Twilio (numéros locaux)

### Ce que tu dis à l'oral
- "Pour l'IA vocale, j'ai comparé les 3 leaders du marché"
- "Vapi offre la meilleure latence à un coût maîtrisé"
- "L'architecture serverless élimine le besoin de serveurs dédiés"

---

## SLIDE 17 : Cahier des Charges Fonctionnel

### Contenu visuel
**Diagramme de fonctionnalités (Mind Map ou Arbre)**

```
                        YALLO
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   [MARKETING]       [DASHBOARD]      [VOICE AI]
        │                 │                 │
   - Landing page    - Gestion menu    - Prise commande
   - Contact         - Gestion horaires - Confirmation
   - Démo            - Vue commandes   - Questions/réponses
   - Pricing         - Mise à jour IA  - Transfert humain
```

**Hiérarchisation :**
| Priorité | Fonction | Type |
|----------|----------|------|
| P0 | Prise commande vocale | Principale |
| P0 | Dashboard commandes | Principale |
| P1 | Gestion menu | Secondaire |
| P1 | Intégration HubRise | Secondaire |
| P2 | Analytics | Complémentaire |
| P2 | Multi-restaurant | Complémentaire |

### Ce que tu dis à l'oral
- "J'ai structuré les fonctionnalités en 3 modules"
- "Priorité P0 : les fonctions sans lesquelles le produit n'a pas de valeur"
- "L'UX a été pensée tablet-first pour le staff cuisine"

---

## SLIDE 18 : Estimation Charge de Travail

### Contenu visuel
**Tableau en jours/homme**

| Module | Fonctionnalité | Complexité | Charge (j/h) |
|--------|----------------|------------|--------------|
| **Core** | Setup projet, auth | Moyenne | 5 |
| | Base de données | Moyenne | 3 |
| | API routes | Faible | 2 |
| **Dashboard** | Gestion menu | Élevée | 8 |
| | Gestion commandes | Élevée | 10 |
| | Horaires | Faible | 2 |
| **Voice AI** | Intégration Vapi | Élevée | 8 |
| | Génération prompt | Moyenne | 5 |
| | Tests vocaux | Moyenne | 5 |
| **Marketing** | Landing page | Moyenne | 5 |
| | Formulaire contact | Faible | 2 |
| **Intégrations** | HubRise | Élevée | 8 |
| | CI/CD | Moyenne | 5 |
| **TOTAL** | | | **68 j/h** |

**Outil utilisé :** Estimation par analogie + Planning Poker (expérience)

### Ce que tu dis à l'oral
- "J'ai estimé la charge totale à 68 jours/homme"
- "La méthode utilisée : estimation par analogie basée sur des projets similaires"
- "Les modules les plus complexes : dashboard commandes et intégration Vapi"

---

## SLIDE 19 : Budget Prévisionnel

### Contenu visuel
**Tableau des coûts**

| Poste | Coût Unitaire | Quantité | Total |
|-------|---------------|----------|-------|
| **Développement** | 350€/jour | 68 jours | 23 800€ |
| **Hébergement Vercel** | 20€/mois | 12 mois | 240€ |
| **Base de données Neon** | 19€/mois | 12 mois | 228€ |
| **Vapi (Voice AI)** | 0.05€/min | 10 000 min/mois | 6 000€/an |
| **Twilio (Téléphonie)** | 15€/mois | 12 mois | 180€ |
| **Domaine + SSL** | 15€/an | 1 | 15€ |
| **Divers (outils, tests)** | Forfait | - | 500€ |
| **TOTAL ANNÉE 1** | | | **~31 000€** |

**Graphique camembert :**
- Développement : 77%
- APIs (Vapi) : 19%
- Infrastructure : 4%

### Ce que tu dis à l'oral
- "Le budget prévisionnel s'élève à environ 31 000€ pour la première année"
- "77% du budget est consacré au développement"
- "Les coûts récurrents (Vapi) sont variables selon l'usage"

---

## SLIDE 20 : Architecture Logicielle (Schéma Global)

### Contenu visuel
**Schéma d'architecture complet**

```
┌─────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                          │
├─────────────────┬───────────────────┬───────────────────────┤
│   Client        │   Staff Cuisine   │   Admin               │
│   (Téléphone)   │   (Tablette PWA)  │   (Desktop)           │
└────────┬────────┴─────────┬─────────┴──────────┬────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  Marketing   │ │  Dashboard   │ │   Admin Dashboard    │ │
│  │  (yallo.fr)  │ │(app.yallo.fr)│ │   (/admin/*)         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Server Actions │ │   API Routes    │ │   Middleware    │
│  (Mutations)    │ │   (/api/*)      │ │   (Auth/Route)  │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
              ┌──────────────────────────────┐
              │        SERVICES              │
              │  ┌─────────┐ ┌─────────────┐ │
              │  │NextAuth │ │ Drizzle ORM │ │
              │  └─────────┘ └──────┬──────┘ │
              └─────────────────────┼────────┘
                                    ▼
              ┌──────────────────────────────┐
              │   PostgreSQL (Neon)          │
              │   - Users, Restaurants       │
              │   - Menu, Orders             │
              └──────────────────────────────┘
                              
         ┌────────────────────────────────────────┐
         │            INTÉGRATIONS EXTERNES        │
         ├──────────────┬──────────────┬──────────┤
         │    VAPI      │   HUBRISE    │  TWILIO  │
         │  (Voice AI)  │   (Caisse)   │(Téléph.) │
         └──────────────┴──────────────┴──────────┘
```

**Légende :**
- 🟢 Frontend (React/Next.js)
- 🔵 Backend (Server Actions/API)
- 🟣 Base de données
- 🟠 Services externes

### Ce que tu dis à l'oral
- "Voici l'architecture globale de Yallo"
- "3 interfaces utilisateur connectées à un backend Next.js unifié"
- "L'architecture est maintenable grâce au pattern Vertical Slices"

---

## SLIDE 21 : Architecture Détaillée (Pattern)

### Contenu visuel
**Pattern Vertical Slices**

```
src/
├── features/           # Slices métier
│   ├── orders/        # Domaine Commandes
│   │   ├── actions.ts # Mutations
│   │   ├── queries.ts # Lectures
│   │   └── types.ts   # Types
│   ├── menu/          # Domaine Menu
│   └── voice-agent/   # Domaine IA
├── app/               # Routes Next.js
│   ├── (marketing)/   # Site public
│   ├── (app)/         # Dashboard
│   └── (admin)/       # Admin
└── components/        # UI réutilisable
```

**Avantages du pattern :**
- ✅ Maintenabilité : Modifications localisées
- ✅ Sécurité : Isolation par domaine
- ✅ Extensibilité : Ajout de features facile
- ✅ Éco-conception : Code minimal chargé

### Ce que tu dis à l'oral
- "J'ai choisi le pattern Vertical Slices plutôt qu'une architecture en couches"
- "Chaque domaine métier est isolé et indépendant"
- "Cette architecture facilite la maintenance et réduit les risques de régression"

---

## SLIDE 22 : Préconisations et Axes de Solution

### Contenu visuel
**3 colonnes de recommandations**

| Court terme (MVP) | Moyen terme | Long terme |
|-------------------|-------------|------------|
| Next.js + Vercel | Multi-langue | App mobile native |
| Vapi Voice AI | Analytics avancés | IA prédictive |
| PostgreSQL Neon | Multi-restaurant | Franchise mode |
| Dashboard tablet | Intégration livreurs | API publique |

**Décisions clés :**
1. ✅ **PWA vs App Native** → PWA (déploiement instantané)
2. ✅ **Serverless vs VM** → Serverless (coûts maîtrisés)
3. ✅ **Vapi vs Custom** → Vapi (time-to-market)
4. ✅ **HubRise vs Direct POS** → HubRise (standard marché)

### Ce que tu dis à l'oral
- "Je préconise une approche progressive : MVP d'abord, extensions ensuite"
- "Le choix PWA permet un déploiement instantané sans friction"
- "L'architecture serverless garantit des coûts proportionnels à l'usage"

---

## SLIDE 23 : Conclusion et Argumentaire Final

### Contenu visuel
**Résumé en 3 points clés**

```
┌─────────────────────────────────────────────────────────────┐
│                    POURQUOI YALLO ?                          │
├─────────────────────────────────────────────────────────────┤
│  1. PROBLÈME RÉEL : 30% de CA perdu (téléphone ignoré)      │
│                                                              │
│  2. SOLUTION INNOVANTE : IA vocale + Dashboard tablet-first │
│                                                              │
│  3. FAISABILITÉ PROUVÉE : Budget maîtrisé, stack mature     │
└─────────────────────────────────────────────────────────────┘
```

**Call to Action :**
> "Ce projet répond à un besoin concret du marché avec une solution technique faisable et un budget maîtrisé. Je recommande son lancement."

**Questions ?**

### Ce que tu dis à l'oral
- "En résumé, Yallo répond à un problème réel avec une solution innovante"
- "La faisabilité technique et financière a été validée"
- "Je suis convaincu que ce projet mérite d'être lancé"
- "Je suis maintenant disponible pour vos questions"

---

## CONSEILS POUR LA PRÉSENTATION

### Design des slides
- **Palette de couleurs :** Utiliser les couleurs Yallo (sombre avec accents)
- **Police :** Sans-serif moderne (Inter, Poppins)
- **Images :** Photos de restaurants, mockups du dashboard
- **Icônes :** Utiliser des icônes cohérentes (Lucide, Heroicons)
- **Animations :** Subtiles, pas de transitions excessives

### Timing par section
- Ne pas dépasser 2 min par slide
- Garder 2-3 min de marge pour les imprévus
- Prévoir des slides de backup pour les questions

### Vocabulaire à utiliser
- Parler de "commanditaire" et "parties prenantes"
- Utiliser "jours/homme" pour les estimations
- Mentionner "criticité", "mitigation", "indicateurs"
- Vulgariser les termes techniques pour le jury

### Questions fréquentes à anticiper
1. "Pourquoi Next.js plutôt que X ?"
2. "Comment gérez-vous si Vapi tombe en panne ?"
3. "Quel est le ROI pour le restaurateur ?"
4. "Comment assurez-vous la conformité RGPD ?"
5. "Quels sont les risques principaux ?"

### Documents de support
- Imprimer la cartographie des parties prenantes (A4)
- Préparer un schéma d'architecture sur papier
- Avoir le tableau des risques en backup

---

## ANNEXES (Slides de backup)

### SLIDE BACKUP 1 : User Stories
- US-001 : En tant que client, je veux commander par téléphone naturellement
- US-002 : En tant que staff, je veux voir les commandes en temps réel
- US-003 : En tant que gérant, je veux modifier le menu facilement

### SLIDE BACKUP 2 : Planning Macro
- Mois 1-2 : Core + Auth + Dashboard base
- Mois 3-4 : Voice AI + Menu
- Mois 5-6 : Intégrations + Tests + Production

### SLIDE BACKUP 3 : Conformité RGPD
- Données vocales : Non stockées (streaming)
- Données clients : Hébergées en Europe (Neon Frankfurt)
- Consentement : Annonce vocale en début d'appel

---

*Document créé le : 02/02/2026*
*Pour présentation orale Bloc 1*
