# Titre : Expert en développement logiciel | RNCP 39583
# Bloc 2 : Concevoir et Développer des applications logicielles

**Projet support :** Yallo  
**Auteur :** Lenny Copeaux  
**Formation :** Ynov Campus  
**Date :** Mai 2026

---

## Liste des compétences du référentiel couvertes par le projet

### A2.1 - Préparation des environnements de développement et de test

**C2.1.1 Mettre en œuvre des environnements de déploiement et de test en y intégrant les outils de suivi de performance et de qualité afin de permettre le bon déroulement de la phase de développement du logiciel**

Mise en place de trois environnements distincts (local, staging, production) gérés via GitHub Actions et Vercel. Intégration de SonarCloud pour la qualité, Sentry pour le monitoring en production et Codecov pour la couverture de tests.

**C2.1.2 Configurer le système d'intégration continue dans le cycle de développement du logiciel en fusionnant les codes sources et en testant régulièrement les blocs de code afin d'assurer un développement efficient qui réduit les risques de régression**

Mise en place de deux pipelines GitHub Actions : `ci.yml` (6 jobs sur `main`) incluant lint, tests unitaires, analyse SonarCloud, build, audit sécurité, déploiement production. `staging.yml` (3 jobs sur `develop`) couvrant validation, SonarCloud, déploiement staging. Tout échec bloque le merge.

### A2.2 - Développement des fonctionnalités

**C2.2.1 Concevoir un prototype de l'application logicielle en tenant compte des spécificités ergonomiques et des équipements ciblés (ex : web, mobile…) afin de répondre aux fonctionnalités attendues et aux exigences en termes de sécurité**

Réalisation d'un MVP web responsive sur quatre surfaces fonctionnelles (marketing, dashboard, admin, agent vocal) respectant les exigences de sécurité (séparation public/privé avec contrôle d'accès basé sur les rôles ADMIN/OWNER).

**C2.2.2 Développer un harnais de test unitaire en tenant compte des fonctionnalités demandées afin de prévenir les régressions et de s'assurer du bon fonctionnement du logiciel**

Mise en place de 190 tests répartis sur 24 fichiers permettant d'assurer une couverture de 72,55 % des instructions, 67,54 % des branches, 75 % des fonctions.

**C2.2.3 Développer le logiciel en veillant à l'évolutivité et à la sécurisation du code source, aux exigences d'accessibilité et aux spécifications techniques et fonctionnelles définies, pour garantir une exécution conforme aux exigences du client**

Architecture par domaines fonctionnels (features) respectant le principe de responsabilité unique. Sécurisation sur la base du TOP 10 OWASP. En-têtes HTTP de sécurité configurés. Accessibilité via composants Radix UI conformes WCAG 2.1.

**C2.2.4 Déployer le logiciel à chaque modification de code et de façon progressive en vérifiant la performance fonctionnelle et technique auprès des utilisateurs afin de présenter une solution stable et conforme à l'attendu**

Mise en place d'une stratégie de branches develop → staging → main. 25 migrations Drizzle versionnées. Déploiement automatique sur Vercel après validation du pipeline.

### A2.3 - Recettes des fonctionnalités

**C2.3.1 Élaborer le cahier de recettes en rédigeant les scénarios de tests et les résultats attendus afin de détecter les anomalies de fonctionnement et les régressions éventuelles**

Rédaction d'un cahier de recette fonctionnel, technique et sécurité couvrant les modules Dashboard, Commandes, Menu, Facturation et Administration.

**C2.3.2 Élaborer un plan de correction des bogues à partir de l'analyse des anomalies et des régressions détectées au cours de la recette afin de garantir le fonctionnement du logiciel conformément à l'attendu**

Rédaction d'un plan de correction basé sur 7 anomalies réelles tracées dans l'historique Git, notamment la série de correctifs du webhook ElevenLabs.

### A2.4 - Rédaction de la documentation technique

**C2.4.1 Rédiger la documentation technique d'exploitation du logiciel détaillant son fonctionnement afin d'assurer une traçabilité pour le suivi des équipes et des futures évolutions du logiciel**

Rédaction d'un README principal décrivant l'installation, la configuration, les migrations et les procédures de déploiement. Documentation des intégrations ElevenLabs, Stripe, Twilio, HubRise et OpenAI.

---

## Table des matières

1. Le projet
2. Environnements de développement et de tests
   - A. Résumé des compétences
   - B. Stack technique
   - C. Infrastructure applicative
   - D. Pipeline d'intégration continue (ci.yml — branche main)
   - E. Pipeline staging (staging.yml — branche develop)
   - F. Variables d'environnement
   - G. Critères de qualité et de performance
3. Développement des fonctionnalités
   - A. Résumé des compétences
   - B. Architecture logicielle
   - C. Schéma relationnel
   - D. Next.js App Router et Server Actions
   - E. User Stories — synthèse par module
   - F. Présentation des prototypes
   - G. Flux critiques et intégrations externes
   - H. Tests unitaires
   - I. Sécurité
   - J. Accessibilité
   - K. Versioning
4. Recettes de fonctionnalités
   - A. Cahier de recettes
   - B. Plan de correction des bugs
5. Documentation technique
6. Conclusion
7. Annexes

---

## I. Le projet

### 1.1 Contexte et problématique

Yallo est un SaaS vertical conçu spécifiquement pour la restauration rapide. La problématique centrale est simple mais peu adressée par les solutions existantes : des milliers de restaurants indépendants reçoivent encore quotidiennement des commandes par téléphone sans aucun outil numérique pour les gérer. Ces appels arrivent pendant les périodes les plus chargées, mobilisent un employé pour prendre des notes à la main, et génèrent des erreurs qui ont un impact direct sur la satisfaction client.

L'objectif de Yallo est de résoudre ce problème de bout en bout : permettre à un restaurant de recevoir des commandes téléphoniques via un agent vocal IA formé à sa carte et à ses horaires, de les voir apparaître instantanément dans un dashboard en cuisine, et de les synchroniser optionnellement avec son logiciel de caisse (POS) grâce à l'intégration HubRise.

Ce projet répond à trois constats observés dans la restauration indépendante :

Premièrement, les restaurants reçoivent encore une part significative de leurs commandes par téléphone. Un restaurateur parisien peut recevoir 30 à 50 appels de commande lors d'un service du soir. Chaque appel prend entre deux et cinq minutes à traiter, mobilise un employé, et est source d'erreurs (mauvaise compréhension du nom, oubli d'un article, confusion sur les modifications demandées).

Deuxièmement, le personnel en cuisine ne dispose d'aucun outil en temps réel pour visualiser les commandes vocales. La chaîne traditionnelle est entièrement manuelle : l'employé en salle note la commande sur un ticket papier, le passe au cuisiner, qui doit l'interpréter et mémoriser les priorités. Toute friction dans cette chaîne allonge le temps de préparation.

Troisièmement, les solutions qui existent pour connecter la téléphonie à un logiciel de caisse sont coûteuses, nécessitent une intégration sur mesure, et sont inaccessibles aux restaurants indépendants dont le budget technologique est limité.

### 1.2 Solution mise en œuvre

La réponse de Yallo s'articule autour de quatre surfaces applicatives complémentaires, chacune adressant un profil utilisateur distinct et un besoin spécifique dans le parcours global.

Le **site marketing** (yallo.fr) est la première surface rencontrée par un restaurateur potentiel. Il se compose de six pages : la page d'accueil présentant la proposition de valeur, une page de démonstration interactive, un guide d'utilisation illustré, une page de contact, et les pages légales obligatoires. L'objectif de cette surface est uniquement la conversion — transformer un visiteur intéressé en prospect qualifié qui prend contact avec l'équipe Yallo.

Le **dashboard restaurant** (app.yallo.fr/dashboard) est l'interface opérationnelle utilisée quotidiennement par le personnel en cuisine. Il permet de visualiser en temps réel les commandes reçues depuis l'agent vocal, de les faire progresser dans le workflow de préparation (Nouvelle → En préparation → Prête → Livrée), de signaler le statut de la cuisine (Calme, Normal, Rush, Stop), et de gérer la carte du restaurant ainsi que ses horaires d'ouverture. Cette interface est pensée pour une utilisation sur tablette en cuisine — grands éléments, contrastes élevés, interactions tactiles.

Le **panel d'administration** (app.yallo.fr/admin) est le back-office interne réservé à l'équipe Yallo. Il permet de créer et gérer les comptes restaurants et utilisateurs, de configurer les agents vocaux ElevenLabs pour chaque restaurant, et de suivre l'état des intégrations. C'est le point d'entrée pour l'onboarding de chaque nouveau client.

L'**agent vocal ElevenLabs** est la pièce centrale du produit. Pour chaque restaurant activé, un agent est configuré avec le menu, les horaires d'ouverture et le nom de l'enseigne. Lorsqu'un client appelle le numéro Twilio dédié au restaurant, il est accueilli par l'agent vocal, qui prend sa commande naturellement en dialogue, puis déclenche automatiquement la création de la commande dans le dashboard de la cuisine.

### 1.3 Périmètre de la V1

Dans le cadre de la V1 disponible en production sur app.yallo.fr, le développement s'est concentré sur la mise en place d'un socle technique solide et industrialisable. Les fonctionnalités livrées couvrent l'ensemble du parcours client de bout en bout : de la création d'un compte restaurant par l'admin, à la configuration de l'agent vocal, jusqu'à la réception d'une commande en cuisine et l'envoi du SMS de confirmation au client. L'intégration Stripe assure la facturation par abonnement. L'intégration HubRise, disponible en option, permet aux restaurants disposant d'un logiciel de caisse compatible de synchroniser automatiquement les commandes vocales.

Le choix de développer une V1 mono-technologie (Next.js full-stack) plutôt qu'une architecture micro-services a été délibéré. À ce stade du projet, la priorité est la rapidité d'exécution et la capacité à itérer vite. Une équipe d'une ou deux personnes peut maintenir et faire évoluer l'ensemble du produit sans friction organisationnelle. Les patterns d'architecture choisis — feature-first, Server Actions, validation Zod — permettront de refactorer ou de découper l'application en services indépendants si le volume de trafic l'exige à l'avenir.

---

## II. Environnements de développement et de tests

La mise en place d'environnements de développement bien structurés est un prérequis fondamental pour le travail professionnel. Un projet sans distinction claire entre développement, staging et production finit inévitablement par exposer des erreurs aux utilisateurs finaux, par perdre des données de test, ou par rendre les déploiements imprévisibles. Dans Yallo, les trois environnements (local, staging, production) sont strictement séparés par des variables d'environnement différentes, des bases de données différentes, et des pipelines de déploiement différents.

La **culture du "pipeline bloquant"** est l'une des décisions les plus importantes de la configuration CI/CD. Un pipeline bloquant signifie que si un test échoue, une erreur ESLint est détectée, ou une erreur TypeScript est levée, le déploiement s'arrête automatiquement. Le code ne peut pas atteindre la production sans passer par tous les filtres de qualité. Cette contrainte, qui peut sembler restrictive, produit en réalité deux effets vertueux : elle force les développeurs à maintenir les tests à jour (car un test en échec bloque tout le monde), et elle donne confiance dans le code en production (car chaque déploiement a été validé par une chaîne de contrôles formels).

### A. Résumé des compétences

> **C2.1.1 — Environnements de développement et de test avec outils de suivi de qualité et de performance**
>
> J'ai mis en place trois environnements distincts (développement local, staging, production) partageant la même configuration via des variables d'environnement structurées. Pour suivre la qualité du code, j'ai intégré SonarCloud qui calcule la dette technique, repère les duplications et affiche le taux de couverture des tests. Sentry surveille les erreurs côté serveur et edge en production avec `sendDefaultPii: false` pour ne jamais capturer de données personnelles. Codecov centralise l'historique de couverture à chaque push.

> **C2.1.2 — Configurer le système d'intégration continue dans le cycle de développement du logiciel**
>
> J'ai configuré deux pipelines GitHub Actions qui se déclenchent automatiquement à chaque modification de code. Sur `main`, le pipeline enchaîne 6 étapes séquentielles : lint et typage, tests avec couverture, analyse SonarCloud, build, audit de sécurité des dépendances, déploiement production. Sur `develop`, le pipeline exécute une validation complète (lint + tests + build), SonarCloud, puis déploiement staging. Si une étape échoue, tout s'arrête et le déploiement est bloqué.

---

### B. Stack technique

La construction de la stack technique de Yallo a suivi une philosophie simple : choisir les outils les plus adaptés au profil de l'équipe et à la nature du problème, en évitant les technologies qui apportent une complexité accidentelle sans bénéfice démontrable. L'objectif était de pouvoir livrer une V1 fonctionnelle, testée et déployée en production en quelques mois, avec un seul développeur fullstack.

L'ensemble du projet est développé en **TypeScript strict**. Ce choix unique côté client et côté serveur élimine la duplication des modèles de données et garantit que le contrat entre les différentes couches de l'application est vérifié à la compilation plutôt qu'en production. La configuration `strict: true` dans `tsconfig.json` active les vérifications les plus sévères : `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`. Tout le pipeline CI bloque sur une erreur de type — TypeScript est utilisé non comme un simple linter, mais comme un véritable système de vérification formelle du code.

**Next.js** a été choisi comme framework principal car il permet de couvrir l'ensemble des besoins applicatifs dans un seul dépôt : les pages statiques du site marketing (rendu côté serveur pour le SEO), le dashboard restaurant (rendu hybride côté serveur + composants interactifs), les API routes pour les webhooks externes, et les Server Actions pour toutes les mutations. Avant l'App Router introduit en Next.js 13 et stabilisé en Next.js 15, une architecture similaire aurait nécessité soit un backend séparé, soit des patterns complexes de gestion d'état. L'App Router permet d'écrire la logique serveur directement dans les composants React, ce qui simplifie radicalement la base de code.

**Drizzle ORM** a été préféré à Prisma, la solution la plus répandue dans l'écosystème Next.js. Drizzle a deux avantages décisifs pour ce projet : il ne nécessite pas de processus de génération de code séparé (le schéma TypeScript *est* le schéma de la base), et il génère du SQL strictement paramétré, ce qui élimine par construction les risques d'injection SQL (OWASP A03). Le fait que Drizzle soit serverless-first est également important : sur Vercel, chaque exécution de fonction est indépendante et de courte durée — Drizzle gère cela nativement sans pool de connexions complexe.

**Supabase Auth** a été retenu pour l'authentification plutôt qu'une implémentation maison. Cette décision est motivée principalement par des raisons de sécurité (OWASP A02) : la gestion correcte des mots de passe (hashage bcrypt, protection brute force, tokens de reset à usage unique, renouvellement des sessions) est un problème difficile et source de vulnérabilités critiques si mal implémenté. En déléguant entièrement cette responsabilité à Supabase, l'application n'a jamais à stocker un mot de passe — la migration 0023 documente dans l'historique Git le moment précis où la colonne `password` a été supprimée de la table `users`.

Le choix des **services cloud tiers** (Stripe, ElevenLabs, Twilio, HubRise, OpenAI, Resend) suit la même logique : chaque service résout un problème complexe (paiement, synthèse vocale, téléphonie, POS, vision IA, emails transactionnels) que la chaîne de valeur de Yallo ne serait pas capable de construire en interne en V1. Ces intégrations sont toutes encapsulées dans des services dédiés (`src/lib/services/`) qui constituent l'unique point de contact avec chaque API externe. Si un fournisseur doit être remplacé, seul le fichier de service correspondant doit être modifié — aucun autre module de l'application n'est impacté.

L'outillage qualité (**Vitest**, **ESLint**, **SonarCloud**, **Sentry**) a été configuré dès le début du projet, non en fin de cycle. Cette décision permet d'intégrer les tests et la qualité dans le flux de développement quotidien plutôt que de les traiter comme des tâches séparées. Le seuil de couverture de 70 % est un objectif raisonnable pour une V1 qui doit aussi livrer des fonctionnalités — il couvre les chemins critiques sans ralentir le développement.

L'ensemble de la stack est hébergée sur **Vercel**, qui supporte Next.js nativement. Ce choix élimine la gestion d'infrastructure (pas de serveur, pas de Docker, pas de certificat SSL, pas de configuration nginx). Le modèle serverless de Vercel est aligné avec l'architecture Next.js : chaque Server Action et chaque route API est automatiquement déployée comme une Vercel Function indépendante, scalant à zéro quand il n'y a pas de trafic.

L'ensemble du projet repose sur une seule base de données **PostgreSQL** hébergée sur **Neon**, un fournisseur PostgreSQL serverless qui gère automatiquement les connexions en mode branching (chaque environnement staging peut avoir sa propre branche de base de données). L'utilisation de JSONB pour les colonnes semi-structurées (`menuData`, `statusSettings`) permet de stocker des données dont la structure peut évoluer sans nécessiter une migration de schéma à chaque changement.

| Technologie | Version | Rôle | Justification |
|---|---|---|---|
| Next.js | 16 | Framework full-stack — SSR, Server Components, App Router | Rendu hybride SSR/CSR, routing natif, Server Actions pour les mutations sans API REST exposée |
| TypeScript | 5.9 | Typage statique — `strict: true` | Le build échoue sur toute erreur de type ; contrats de données sûrs entre client, serveur et tests |
| React | 19 | Interface utilisateur | Composants serveurs natifs, meilleure gestion de la concurrence |
| Tailwind CSS | 4 | Framework CSS utilitaire | Cohérence visuelle, classes utilitaires, dark mode natif |
| Radix UI / shadcn | latest | Composants d'interface accessibles | ARIA natif, navigation clavier, conformité WCAG 2.1 sans surcharge manuelle |
| PostgreSQL (Neon) | 16 | Base de données relationnelle | Intégrité référentielle, JSON natif pour `menuData`, hébergement serverless |
| Drizzle ORM | 0.43 | ORM typé | Requêtes paramétrées, schéma TypeScript, migrations versionnées |
| Supabase Auth | 2 | Authentification externalisée | Gestion des sessions JWT, refresh tokens, réduction du code sensible lié aux mots de passe |
| Stripe | latest | Paiement et souscription | Webhooks signés cryptographiquement, gestion des abonnements, tableau de bord facturation |
| ElevenLabs | latest | Agent vocal IA | Conversion texte/voix, déclenchement de tools (submit_order), gestion des numéros Twilio |
| Twilio | latest | Téléphonie | Numéros SDA, bridge voix vers ElevenLabs, SMS de confirmation commande |
| HubRise | latest | Intégration caisse POS | Import du catalogue, push des commandes vocales vers le logiciel de caisse |
| OpenAI GPT-4o | latest | Parsing de menu par images | Extraction de la structure du menu depuis des photos, avec catégories et options |
| Resend | latest | Emails transactionnels | Bienvenue, reset de mot de passe, formulaire de contact |
| Sentry | 9 | Monitoring des erreurs | 3 configurations (server, edge, client), capture des erreurs sans PII |
| Vitest + Testing Library | 3 | Tests unitaires | Isolation complète via mocks, intégration native TypeScript |
| SonarCloud | cloud | Analyse qualité | Dette technique, duplications, couverture de code |

---

### C. Infrastructure applicative

L'application Yallo est hébergée intégralement sur **Vercel**, qui build et sert directement le projet Next.js. Ce choix simplifie considérablement l'infrastructure : aucun Docker à maintenir, aucun serveur à patcher, aucun certificat SSL à renouveler, aucune configuration nginx ou reverse proxy. Vercel gère automatiquement le CDN, la mise en cache des assets statiques, le déploiement des Vercel Functions pour le code serveur, et le réseau Edge pour le middleware.

Du point de vue de l'infrastructure réseau, Yallo s'appuie sur trois couches distinctes qui s'exécutent dans des environnements différents :

La couche **Edge** est la plus proche de l'utilisateur dans le réseau de Vercel. C'est là que s'exécute le middleware Next.js (`middleware.ts`). Le middleware fonctionne sur le runtime Edge de Vercel — un environnement léger basé sur les Web Standards (pas de Node.js complet), déployé dans les PoP (Points of Presence) Vercel les plus proches de l'utilisateur. Cette couche vérifie la session et effectue les redirections avant même que la requête n'atteigne les fonctions serveur. Comme elle s'exécute dans le réseau de distribution de Vercel, la latence de vérification d'authentification est minimale.

La couche **Serverless** est celle des Server Actions et des Routes API. Chaque Server Action et chaque handler de route API est déployé comme une Vercel Function Node.js 20 distincte. Ces fonctions sont stateless (sans état persistent en mémoire entre deux requêtes) et scalent indépendamment selon la charge. C'est dans cette couche que s'exécutent les accès à la base de données, les appels aux services externes, et toute la logique métier.

La couche **CDN** sert tous les assets statiques générés par Next.js lors du build : pages HTML pré-rendues, fichiers CSS, bundles JavaScript, images optimisées. Cette couche n'a aucun coût de compute — les fichiers sont simplement servis depuis le cache Vercel.

**Routage multi-domaine**

L'application exploite deux domaines distincts gérés dans le middleware `middleware.ts` :

- `yallo.fr` → site marketing (pages publiques, crawlable par les moteurs de recherche)
- `app.yallo.fr` → application protégée (dashboard, admin)

Ce routage est géré au niveau Next.js Middleware, sans configuration Vercel supplémentaire. Le middleware inspecte le header `Host` de chaque requête pour déterminer sur quel domaine elle arrive, puis applique la logique de redirection appropriée. Les pages marketing sont servies sans aucune vérification de session — ce qui garantit qu'elles restent accessibles et indexables même lorsque les services d'authentification Supabase connaissent une perturbation.

**Variables d'environnement**

Un fichier `.env.local` est requis en développement. Les secrets de production sont injectés via les secrets Vercel. Aucune variable sensible n'est committée.

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | Oui | URL de connexion PostgreSQL (Neon) |
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé publique Supabase (côté client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | Clé de service Supabase (côté serveur uniquement) |
| `STRIPE_SECRET_KEY` | Oui | Clé secrète Stripe (côté serveur) |
| `STRIPE_WEBHOOK_SECRET` | Oui | Secret de vérification des webhooks Stripe |
| `ELEVENLABS_API_KEY` | Oui | Clé API ElevenLabs pour la gestion des agents |
| `ELEVENLABS_WEBHOOK_SECRET` | Oui | Secret de vérification des webhooks ElevenLabs |
| `TWILIO_ACCOUNT_SID` | Oui | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | Oui | Token d'authentification Twilio |
| `OPENAI_API_KEY` | Oui | Clé API OpenAI pour le parsing de menus |
| `RESEND_API_KEY` | Oui | Clé API Resend pour les emails transactionnels |
| `HUBRISE_CLIENT_ID` | Conditionnel | Identifiant client HubRise (si intégration caisse) |
| `HUBRISE_CLIENT_SECRET` | Conditionnel | Secret client HubRise |
| `SENTRY_DSN` | Recommandé | DSN Sentry pour le monitoring des erreurs |
| `NEXT_PUBLIC_APP_URL` | Oui | URL canonique de l'application |
| `VERCEL_ENV` | Auto (Vercel) | `production` / `preview` — contrôle le mode strict des webhooks |

---

### D. Pipeline d'intégration continue (ci.yml — branche main)

Le pipeline d'intégration continue est la pièce centrale de l'industrialisation du projet. Il garantit que chaque modification de code, avant d'atteindre la production, a été vérifiée de façon automatique et reproductible selon des critères objectifs et non négociables. Ce pipeline a été conçu avec un principe simple : si le code ne passe pas, il ne part pas en production.

Le pipeline est déclenché dans deux cas : à chaque push direct sur la branche `main`, et à chaque Pull Request ouverte vers `main`. Dans le cas d'une Pull Request, le statut du pipeline est affiché directement dans l'interface GitHub et bloque le merge si l'un des jobs échoue. Cette configuration rend les vérifications obligatoires pour tout contributeur, y compris le mainteneur principal.

Les 6 jobs s'enchaînent selon un graphe de dépendances : `lint` et `test` sont indépendants et peuvent s'exécuter en parallèle. `build` attend que `lint` ET `test` soient validés. `sonarcloud` attend que `test` soit validé pour disposer du rapport de couverture. `security` et `deploy-production` s'exécutent après `build`.

Le job **lint** est le premier rempart. ESLint analyse l'ensemble des fichiers TypeScript avec les règles `next/core-web-vitals` et `next/typescript`. Ces règles spécifiques à Next.js détectent des patterns problématiques particuliers au framework : utilisation incorrecte des directives `"use client"` / `"use server"`, imports non optimisés de composants Next.js, problèmes de performance liés au rendu serveur. En parallèle, TypeScript est exécuté en mode `--noEmit` : il vérifie l'intégralité du projet sans produire de fichiers de sortie. Cette vérification est bloquante — une seule erreur de type empêche le déploiement. C'est l'un des garde-fous les plus importants de la base de code.

Le job **test** exécute les 190 tests unitaires avec Vitest. Une première passe en mode `--run` (sans watch) exécute l'intégralité de la suite en une seule fois et retourne un code d'exit 0 si tous les tests passent, 1 sinon. Une seconde passe génère les rapports de couverture dans deux formats : `lcov.info` pour SonarCloud, et `coverage-final.json` pour Codecov. Les résultats de couverture sont ensuite uploadés sur Codecov pour conserver un historique des tendances sur chaque branche.

Le job **sonarcloud** effectue une analyse statique approfondie du code source. SonarCloud ne se contente pas de vérifier la couverture — il analyse également la complexité cyclomatique des fonctions, détecte les duplications de code, identifie les "code smells" (structures de code difficiles à maintenir), et calcule la dette technique. Une règle particulièrement importante est la détection des secrets hardcodés dans le code source : SonarCloud signale immédiatement toute chaîne ressemblant à une clé API, token ou mot de passe qui serait commis par erreur.

Le job **build** est une vérification finale avant déploiement. Il exécute `pnpm run build`, qui compile l'intégralité du projet Next.js. Pour ce job, des variables d'environnement fictives sont injectées (`DATABASE_URL: postgresql://fake:fake@localhost:5432/fake`) car Next.js a besoin d'une URL de base de données valide syntaxiquement au moment du build, même si aucune connexion réelle n'est établie. Ce job détecte les erreurs qui n'apparaissent pas lors des tests unitaires mais qui empêchent le build de s'effectuer — typiquement des imports incorrects ou des erreurs TypeScript dans des fichiers non testés.

Le job **security** exécute `pnpm audit --audit-level=high`. Cette commande interroge la base de données de vulnérabilités connues de npm pour chaque dépendance déclarée dans `pnpm-lock.yaml`. Si une vulnérabilité de niveau "high" ou "critical" est détectée sur une dépendance directe ou transitive, le job échoue et bloque le déploiement. Cette vérification automatique est essentielle car les vulnérabilités peuvent apparaître dans des bibliothèques tierces à n'importe quel moment, indépendamment des modifications de code apportées.

Le job **deploy-production** est conditionné par la réussite de tous les jobs précédents. Il n'est exécuté que sur un push direct sur `main` (pas sur les Pull Requests). Il invoque la CLI Vercel avec le flag `--prod` pour déclencher un déploiement de production. Vercel rebuild le projet depuis le code source du commit en cours, effectue toutes les optimisations de production (minification, compression, génération des pages statiques), et remplace atomiquement la version précédente par la nouvelle — sans downtime perceptible.

| Étape | Job | Ce qui se passe | Bloquant |
|---|---|---|---|
| 1 | **lint** | ESLint vérifie les règles `next/core-web-vitals` et `next/typescript`. TypeScript valide l'ensemble du projet avec `tsc --noEmit`. L'environnement utilise pnpm 9 avec cache des dépendances via hash de `pnpm-lock.yaml`. | Oui (tsc strict) |
| 2 | **test** | Vitest exécute les 190 tests en mode `--run`. Une seconde passe génère le rapport de couverture (`lcov.info`, `coverage-final.json`). Les résultats sont uploadés sur Codecov. | Oui |
| 3 | **sonarcloud** | SonarCloud analyse le projet complet avec les sources `src/`, les tests `src/__tests__/`, la couverture `lcov.info`. Calcule la dette technique, les duplications et le Quality Gate. | Non bloquant (analyse) |
| 4 | **build** | `pnpm run build` compile le projet complet. Variables d'environnement fictives injectées pour le build (`DATABASE_URL: postgresql://fake:fake@...`). Valide que aucune erreur TypeScript ne subsiste après les types générés. | Oui |
| 5 | **security** | `pnpm audit --audit-level=high` scanne toutes les dépendances à la recherche de vulnérabilités connues de niveau high ou critical. Bloque le pipeline si détectée. | Oui |
| 6 | **deploy-production** | Vercel CLI déploie le code sur l'environnement de production via `vercel --prod`. Déclenché uniquement sur push direct sur `main` (pas sur les PRs). | Oui (prod uniquement) |

```
lint → test → sonarcloud
                   ↓
lint + test → build → security → deploy-production
```

---

### E. Pipeline staging (staging.yml — branche develop)

Le pipeline staging est le pendant du pipeline de production sur la branche `develop`. Sa philosophie est légèrement différente : alors que le pipeline de production est configuré pour la stabilité maximale (bloquant sur chaque anomalie), le pipeline staging est configuré pour la vélocité de développement tout en maintenant un niveau de qualité acceptable.

Le job **validate** du pipeline staging regroupe en une seule étape le lint, les tests et le build. Ce regroupement est intentionnel : en staging, l'objectif est de valider rapidement qu'un feature branch peut être intégré dans `develop` sans casser l'application. ESLint est exécuté en `continue-on-error: true`, ce qui signifie que les warnings ESLint ne bloquent pas le déploiement staging — seules les erreurs critiques le font. Les tests, en revanche, bloquent toujours : un test qui échoue signifie une régression fonctionnelle qui doit être corrigée avant le merge.

Le build est effectué avec l'URL de staging (`NEXT_PUBLIC_APP_URL: https://staging.yallo.fr`) plutôt que l'URL de production, ce qui garantit que les appels côté client (redirections, appels API) pointent vers le bon environnement.

Le job **sonarcloud** effectue la même analyse que sur la branche principale, permettant de détecter les problèmes de qualité avant qu'ils n'atteignent `main`. SonarCloud affiche les résultats de l'analyse directement dans la Pull Request GitHub, permettant une revue de code enrichie avec les métriques de qualité.

Le job **deploy-staging** génère une URL de preview Vercel unique pour ce déploiement. Cette URL est automatiquement commentée dans la Pull Request par le bot Vercel, permettant à n'importe quel reviewer de tester les changements en condition réelle avant d'approuver le merge.

| Étape | Job | Ce qui se passe |
|---|---|---|
| 1 | **validate** | ESLint, tests Vitest complets, build avec URL de staging (`NEXT_PUBLIC_APP_URL: https://staging.yallo.fr`). Un échec bloque le déploiement staging. |
| 2 | **sonarcloud** | Analyse SonarCloud avec couverture, même configuration que le pipeline principal. |
| 3 | **deploy-staging** | Vercel CLI déploie le code en preview. L'URL de staging est retournée par Vercel pour validation fonctionnelle avant merge sur `main`. |

---

### G. Critères de qualité et de performance

| Critère | Cible | Outil de mesure |
|---|---|---|
| Couverture des instructions | ≥ 70 % | Vitest + `lcov.info` |
| Couverture des branches | ≥ 65 % | Vitest coverage |
| 0 erreur TypeScript strict | Build sans erreur | `tsc --noEmit` — bloquant en CI |
| 0 vulnérabilité high/critical | Aucune dépendance non patchée | `pnpm audit --audit-level=high` — bloquant en CI |
| ESLint 0 erreur next/typescript | Aucune violation règle Next.js | ESLint — continue-on-error sur warnings |
| Quality Gate SonarCloud | Passed | SonarCloud dashboard |
| Taux d'erreur de production | < 1 % | Sentry — alertes configurées |
| Score Lighthouse Performance | > 80 | Lighthouse CI (outil local) |
| Score Lighthouse Accessibilité | > 90 | Lighthouse + extension Wave |

---

### H. Analyse de la qualité — Rapport SonarCloud

SonarCloud est configuré pour analyser l'ensemble des sources `src/` à chaque push sur `main` ou `develop`. L'outil calcule en continu :

- la **dette technique** (temps estimé pour corriger les code smells)
- les **duplications** (pourcentage de code dupliqué)
- la **couverture** (synchronisée avec le `lcov.info` généré par Vitest)
- le **Quality Gate** : ensemble de seuils qui décide si le code est "prêt pour la production"

L'intégration de SonarCloud dans le pipeline CI répond à une problématique réelle du développement solo : sans revue de code par un pair, il est facile d'accumuler progressivement de la dette technique sans s'en apercevoir. Les code smells signalés par SonarCloud (fonctions trop longues, complexité cyclomatique élevée, variables jamais utilisées) sont autant d'alertes précoces qui permettent d'intervenir avant que la dette ne devienne un frein au développement.

La métrique de **couverture de code** dans SonarCloud est particulièrement utile car elle se décompose par dossier. Il est ainsi possible d'identifier les zones sous-testées : si `lib/services/` a une couverture de 60 %, cela signifie que les appels aux APIs externes (ElevenLabs, Stripe) ne sont pas tous couverts par des tests avec mocks. Cette information guide les priorités de la session de tests suivante.

La détection de **secrets hardcodés** est une fonctionnalité de sécurité critique. SonarCloud scanne chaque commit pour détecter les patterns ressemblant à des clés API, tokens, mots de passe, ou chaînes de connexion. Un développeur qui, par inadvertance, commence à coller une clé API directement dans le code pendant une session de debug est protégé par cette alerte automatique — avant que le commit ne soit poussé vers GitHub.

La configuration SonarCloud est injectée dans les workflows via les arguments du scanner :

```
-Dsonar.projectKey=LennyCopeaux_yallo.fr
-Dsonar.organization=lennycopeaux
-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
-Dsonar.sources=src
-Dsonar.tests=src/__tests__
-Dsonar.test.inclusions=src/__tests__/**/*.test.ts
-Dsonar.exclusions=**/node_modules/**,**/.next/**,**/drizzle/**
```

Les dossiers `drizzle/` (migrations SQL) et `.next/` (build Next.js) sont explicitement exclus pour ne pas polluer les métriques de qualité avec du code généré.

**Suivi de la couverture par domaine fonctionnel**

| Domaine fonctionnel | Fichiers testés | Couverture estimée |
|---|---|---|
| `features/menu/` | `actions.test.ts` | ~80 % |
| `features/kitchen-status/` | `actions.test.ts` | ~85 % |
| `features/hours/` | `actions.test.ts` | ~75 % |
| `features/orders/` | `actions.test.ts` | ~70 % |
| `app/(admin)/admin/` | `actions.test.ts` | ~65 % |
| `lib/auth.ts` | `auth.test.ts` | ~90 % |
| `lib/rate-limit.ts` | `rate-limit.test.ts` | ~95 % |
| `app/api/elevenlabs/` | `webhook.test.ts` | ~75 % |
| `app/api/stripe/` | `webhook.test.ts` | ~70 % |
| `lib/services/` | Tests de services | ~60 % |

### I. Pipeline de staging (staging.yml — branche develop)

Le pipeline de staging est la version allégée du pipeline principal. Il s'exécute à chaque push sur la branche `develop` et à chaque Pull Request ouverte vers `develop`. Son rôle est de valider le code en cours de développement avant qu'il ne soit proposé pour merger sur `main`.

La différence fondamentale avec le pipeline de production est l'absence des étapes `security` et `deploy-production`. Ces étapes sont réservées à la branche `main` car elles concernent des opérations coûteuses (audit de sécurité complet) ou irréversibles (déploiement production). Sur `develop`, l'objectif est la rapidité de feedback : un développeur doit savoir en moins de 5 minutes si son code passe les vérifications de base.

La présence de SonarCloud dans le pipeline de staging est intentionnelle. SonarCloud compare la branche `develop` avec la branche de référence (`main`) et génère un rapport différentiel : "ces nouvelles lignes de code introduisent X nouveaux code smells". Ce rapport différentiel est plus actionnable qu'un rapport absolu — il permet d'identifier précisément les régressions de qualité introduites par la feature en cours de développement.

Le déploiement sur staging se fait via `vercel --env` sans le flag `--prod`, ce qui crée un "Preview Deployment" Vercel lié au commit précis. Cette URL de preview est unique par commit, ce qui permet de valider visuellement chaque feature avant le merge — une personne peut tester une fonctionnalité sur l'URL de preview pendant qu'une autre développe une autre fonctionnalité sur une autre branche.

| Étape | Job | Ce qui se passe |
|---|---|---|
| 1 | **validate** | ESLint + TypeScript `tsc --noEmit` + `pnpm run build` + Vitest |
| 2 | **sonarcloud** | Analyse différentielle vs `main` — rapport des nouvelles issues et couverture |
| 3 | **deploy-staging** | Vercel Preview Deployment — URL unique par commit, accessible immédiatement |

---

## III. Développement des fonctionnalités

La section III constitue le cœur de ce dossier. Elle documente les compétences de développement effectivement mises en œuvre au cours du projet Yallo : conception de l'architecture logicielle, modélisation du schéma de base de données, implémentation des Server Actions, développement des six prototypes fonctionnels, écriture des tests unitaires, mise en place des contrôles de sécurité OWASP, et intégration des services externes. Chaque sous-section est articulée autour d'une compétence RNCP précise, dont elle fournit les preuves techniques concrètes.

L'approche adoptée dans le développement de Yallo est celle d'un développeur fullstack soucieux de livrer un code maintenable et sécurisé. Les décisions d'architecture ne sont pas prises pour leur sophistication mais pour leur adéquation au problème : simplicité là où c'est possible, rigueur là où c'est nécessaire. Cette section permet au jury d'évaluer non seulement les compétences techniques, mais aussi la capacité à justifier les choix faits et à identifier leurs limites.

### A. Résumé des compétences

> **C2.2.1 — Conception du prototype : fonctionnalités, ergonomie et sécurité des accès**
>
> Nous avons conçu un prototype fonctionnel qui couvre quatre surfaces applicatives à partir du cahier des charges. L'application fonctionne sur ordinateur, tablette et mobile grâce au design adaptatif Tailwind CSS. Les pages publiques (marketing, guide, démo) sont accessibles sans connexion. Les espaces privés (dashboard, admin) sont automatiquement protégés par le middleware et les Server Actions : toute tentative d'accès sans session valide est rejetée, et un `OWNER` ne peut pas accéder aux routes `admin/`.

> **C2.2.2 — Développer un harnais de test unitaire**
>
> 190 vérifications automatiques sont réparties sur 24 fichiers de tests. Les tests vérifient chaque Server Action en isolation complète : toutes les dépendances (db, auth, services tiers) sont remplacées par des mocks Vitest. Les cas nominaux et les cas d'erreur sont couverts systématiquement (authentification manquante, restaurant introuvable, données invalides, limites métier).

> **C2.2.3 — Développer le logiciel en veillant à l'évolutivité et à la sécurisation du code source, aux exigences d'accessibilité**
>
> L'architecture est organisée par domaines fonctionnels (`features/`), chaque domaine étant autonome. Aucun domaine n'importe directement depuis un autre domaine. Pour la sécurité, les fonctions `requireAuth()` et `requireAdmin()` sont présentes dans chaque Server Action sensible, les entrées sont validées avec Zod avant toute écriture en base, et les webhooks externes sont vérifiés par signature cryptographique. Les composants Radix UI génèrent les attributs ARIA automatiquement.

> **C2.2.4 — Déployer le logiciel à chaque modification de code et de façon progressive**
>
> Stratégie de branches develop → staging → main. Chaque merge sur `develop` déclenche un déploiement staging automatique. Chaque merge sur `main` déclenche le déploiement production. Les 25 migrations Drizzle versionnées garantissent la traçabilité des évolutions du schéma de base de données.

---

### B. Architecture logicielle

Yallo adopte une architecture **feature-first** dans le cadre du Next.js App Router. Cette décision d'organisation du code place la logique par domaine métier plutôt que par couche technique. Contrairement à l'organisation classique en couches (`controllers/`, `services/`, `models/`), qui oblige à naviguer entre de nombreux dossiers pour comprendre une fonctionnalité, l'architecture feature-first regroupe dans un seul dossier tout ce qui concerne un domaine : ses actions, ses composants, ses types, ses tests.

Ce choix a plusieurs conséquences pratiques. Premièrement, l'isolation : chaque feature peut être développée, testée et modifiée sans risquer d'impacter les autres. Deuxièmement, la lisibilité : un développeur qui veut comprendre comment fonctionne la gestion du menu trouvera tout dans `src/features/menu/` sans avoir à assembler des pièces dispersées dans toute l'application. Troisièmement, la scalabilité organisationnelle : si l'équipe grandit, deux développeurs peuvent travailler sur deux features différentes sans se marcher dessus dans la structure de fichiers.

Les utilitaires véritablement transversaux (authentification, rate limiting, services externes) sont placés dans `src/lib/`. Ces modules sont des feuilles dans le graphe de dépendances : ils n'importent pas de code des features. Les features importent depuis `lib/`, mais `lib/` n'importe jamais depuis les features. Cette règle, maintenue par discipline et visible dans le code, prévient les dépendances circulaires.

Les composants d'interface sont séparés en deux niveaux : les composants du design system (`src/components/ui/`) — boutons, inputs, dialogues, badges, tabs — qui ne contiennent aucune logique métier, et les composants spécifiques à chaque surface (`src/components/landing/`, composants dans les pages `app/`) qui composent les composants du design system avec la logique propre à chaque écran.

L'application Next.js App Router utilise le système de **Route Groups** (dossiers entre parenthèses) pour séparer les différentes surfaces sans impacter les URLs. Le dossier `(admin)` regroupe toutes les routes admin sous `/admin/*` sans créer un segment `/admin/` supplémentaire dans l'URL. De même, `(app)` regroupe le dashboard et `(marketing)` le site public. Cette organisation reflète la séparation des accès : chaque Route Group peut avoir son propre layout, ses propres composants partagés, et ses propres guards d'authentification.

**Structure du projet**

```
src/
├── app/                    # Routes Next.js App Router
│   ├── (admin)/            # Routes du panel admin (protégées ADMIN)
│   │   └── admin/
│   ├── (app)/              # Routes du dashboard (protégées OWNER)
│   │   └── dashboard/
│   ├── api/                # Routes API (webhooks)
│   │   ├── elevenlabs/webhook/
│   │   └── stripe/webhook/
│   └── (marketing)/        # Pages publiques du site marketing
├── components/             # Composants partagés
│   ├── landing/            # Composants du site marketing
│   └── ui/                 # Design system partagé
├── db/                     # Schéma Drizzle et configuration
│   └── schema.ts
├── features/               # Domaines fonctionnels
│   ├── hours/              # Gestion des horaires
│   ├── kitchen-status/     # Statut de la cuisine
│   ├── menu/               # Gestion du menu
│   └── orders/             # Gestion des commandes
└── lib/                    # Utilitaires transversaux
    ├── auth.ts             # Fonctions d'authentification
    ├── rate-limit.ts       # Rate limiting
    └── services/           # Services externes
        ├── elevenlabs-agent.ts
        ├── menu-parser.ts
        └── sms.ts
```

**Comptage des composants par couche**

| Couche | Éléments | Description |
|---|---|---|
| Routes App Router (pages) | 17 pages | Site marketing (7), Dashboard (4), Admin (4), Routes API (2) |
| Server Actions | ~40 actions | Réparties dans les domaines features/ et app/(admin)/admin/ |
| Composants React | ~60 composants | Landing (15), UI partagé (20), Dashboard (15), Admin (10) |
| Services externes | 6 services | ElevenLabs, Stripe, Twilio, HubRise, OpenAI, Resend |
| Schémas Zod | ~20 schémas | Validation des entrées dans chaque Server Action |
| Migrations Drizzle | 25 migrations | 0000 à 0024, versionnées et irréversibles |
| Fichiers de tests | 24 fichiers | 190 tests au total |

---

### C. Schéma relationnel

La modélisation de la base de données est l'une des décisions architecturales les plus structurantes du projet. Elle détermine comment les entités métier sont représentées, comment elles se lient entre elles, et comment les contraintes métier sont enforçées au niveau de la base plutôt que uniquement dans le code applicatif.

Le schéma de Yallo a été conçu avec deux principes directeurs : la **minimalité** et l'**évolutivité**. Minimalité : ne stocker que ce qui est strictement nécessaire, avec des colonnes nullable pour les données optionnelles, plutôt que de créer des tables satellites complexes. Évolutivité : utiliser JSONB pour les structures de données qui pourraient évoluer (menu, paramètres de statut, horaires) plutôt que de créer des colonnes rigides.

La table **`restaurants`** est la table centrale du modèle. Elle agrège non seulement les informations de base du restaurant (nom, téléphone, adresse) mais aussi tous les identifiants d'intégration externe (ElevenLabs, Stripe, Twilio, HubRise). Ce choix de dénormalisation est intentionnel : pour un restaurant, ces identifiants sont des attributs directs — il n'y a pas de relation multiple (un restaurant a un seul agent ElevenLabs, un seul abonnement Stripe). Créer des tables séparées `restaurant_elevenlabs_config` ou `restaurant_stripe_subscription` n'apporterait que de la complexité sans bénéfice.

Le choix de stocker `menuData` en **JSONB** (JSON Binaire de PostgreSQL) plutôt que de créer des tables `categories`, `products`, `option_lists` mérite une explication. La structure du menu d'un restaurant peut être très variable : certains restaurants ont des catégories, d'autres non ; certains ont des options complexes (taille + sauce + accompagnement), d'autres n'ont que des variations simples. Modéliser cette flexibilité en SQL relationnel classique aurait requis une dizaine de tables avec des relations complexes, pour une donnée qui est toujours lue et écrite en bloc — jamais requêtée partiellement. Le JSONB de PostgreSQL offre le meilleur des deux mondes : la flexibilité du JSON avec les performances du binaire et la possibilité d'indexer certains champs si nécessaire.

La décision d'utiliser des **énumérations PostgreSQL** pour les statuts (`orderStatus`, `kitchenStatus`, `userRole`) plutôt que des contraintes CHECK ou des colonnes varchar libres renforce l'intégrité des données au niveau de la base. Si le code applicatif tente d'insérer une valeur hors de l'enum, la base de données rejette l'insertion avec une erreur de contrainte — même si la validation Zod dans le code a été contournée.

La relation entre **`users`** et **`restaurants`** est une relation one-to-one fonctionnellement (un owner ne peut être propriétaire que d'un seul restaurant en V1), mais implémentée comme une foreign key `ownerId → users.id` sans contrainte unique, permettant l'évolution future vers un owner multi-restaurants sans migration de schéma complexe.

Le schéma Drizzle définit 4 tables principales avec des énumérations strictes pour tous les états métier.

**Table `users`**

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `authUserId` | text (unique) | Référence vers le compte Supabase Auth |
| `email` | text (unique) | Email de l'utilisateur |
| `firstName` | text nullable | Prénom |
| `lastName` | text nullable | Nom de famille |
| `role` | enum (`ADMIN`, `OWNER`) | Rôle dans l'application |
| `createdAt` | timestamp | Date de création |

**Table `restaurants`**

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `ownerId` | uuid (FK → users) | Propriétaire du restaurant |
| `name` | text | Nom du restaurant |
| `phoneNumber` | text | Numéro de téléphone du restaurant |
| `address` | text nullable | Adresse physique |
| `status` | enum (`onboarding`, `active`, `inactive`, `suspended`) | Statut du compte |
| `isActive` | boolean | Statut d'activation (synchronisé avec Stripe) |
| `currentStatus` | enum (`CALM`, `NORMAL`, `RUSH`, `STOP`) | Statut de la cuisine en temps réel |
| `statusSettings` | jsonb | Configuration des temps d'attente par statut cuisine |
| `menuData` | jsonb | Structure complète du menu (catégories, produits, options) |
| `businessHours` | text (JSON) | Horaires d'ouverture par jour |
| `elevenLabsAgentId` | text nullable | ID de l'agent ElevenLabs configuré |
| `elevenLabsPhoneNumberId` | text nullable | ID du numéro Twilio importé dans ElevenLabs |
| `twilioPhoneNumber` | text nullable | Numéro Twilio E.164 |
| `hubRiseAccountId` | text nullable | Compte HubRise pour la synchronisation caisse |
| `stripeCustomerId` | text nullable | Identifiant client Stripe |
| `stripeSubscriptionId` | text nullable | Identifiant abonnement Stripe actif |
| `billingStartDate` | timestamp nullable | Date de début de facturation |
| `updatedAt` | timestamp | Date de dernière modification |

**Table `orders`**

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `restaurantId` | uuid (FK → restaurants) | Restaurant concerné |
| `status` | enum (`NEW`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`) | Statut de la commande |
| `customerName` | text | Nom du client ayant passé la commande |
| `customerPhone` | text nullable | Numéro de téléphone du client |
| `notes` | text nullable | Notes libres de la commande |
| `createdAt` | timestamp | Date de création |
| `updatedAt` | timestamp | Date de dernière modification |

**Table `orderItems`**

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Identifiant unique |
| `orderId` | uuid (FK → orders) | Commande parente |
| `name` | text | Nom du produit commandé |
| `quantity` | integer | Quantité commandée |
| `price` | numeric nullable | Prix unitaire au moment de la commande |
| `notes` | text nullable | Spécifications particulières (sans oignon, etc.) |

**Énumérations**

| Enum | Valeurs | Utilisation |
|---|---|---|
| `userRole` | `ADMIN`, `OWNER` | Rôle utilisateur — contrôle d'accès middleware et Server Actions |
| `orderStatus` | `NEW`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED` | Cycle de vie d'une commande en cuisine |
| `restaurantStatus` | `onboarding`, `active`, `inactive`, `suspended` | Statut du compte restaurant |
| `kitchenStatus` | `CALM`, `NORMAL`, `RUSH`, `STOP` | Indicateur de charge en temps réel |

---

### D. Next.js App Router et Server Actions

L'une des décisions d'architecture les plus impactantes de Yallo est l'adoption complète du paradigme **Server-first** de Next.js 16 App Router, et en particulier l'utilisation exclusive des **Server Actions** pour toutes les mutations de données.

Pour bien comprendre ce choix, il faut rappeler le modèle traditionnel d'une application Next.js avant l'App Router. Dans les versions précédentes (Pages Router), les mutations se faisaient via des routes API (`/api/users`, `/api/orders`) que le code client appelait avec `fetch()`. Ce modèle implique : une route API à définir et sécuriser, un contrat de requête/réponse à maintenir, une gestion des erreurs HTTP côté client, et souvent un système de tokens CSRF pour protéger les formulaires. Les Server Actions éliminent entièrement cette couche intermédiaire.

Un **Server Action** est une fonction TypeScript marquée avec la directive `"use server"`, qui s'exécute exclusivement côté serveur mais peut être appelée directement depuis un composant React (client ou serveur). Next.js gère automatiquement le transport de l'appel — un POST chiffré avec un identifiant cryptographique de l'action, qui ne peut pas être deviné ou forgé par un attaquant. Cette propriété est fondamentale pour la sécurité : les Server Actions ne sont pas des endpoints HTTP exposés, contrairement à des routes API classiques.

La sécurisation des Server Actions dans Yallo suit un pattern rigoureusement uniforme appelé le **guard pattern**. Chaque action commence systématiquement par la même séquence de vérifications, dans le même ordre : vérification de l'authentification, puis vérification du rôle si nécessaire, puis vérification de l'ownership de la ressource ciblée. Ce pattern est implémenté dans `src/lib/auth.ts` et appliqué sans exception.

La fonction `requireAuth()` enchaîne deux vérifications : elle interroge d'abord Supabase Auth pour valider la session JWT, puis consulte la table `users` en base pour récupérer le profil applicatif de l'utilisateur. Si l'une ou l'autre de ces étapes échoue (session expirée, utilisateur supprimé de la base, account ban), une exception est levée immédiatement avec le message "Non autorisé". Cette exception remonte jusqu'à la couche d'appel dans le composant React, qui peut l'afficher ou déclencher une redirection.

La validation des données d'entrée avec **Zod** est le second pilier de la sécurité des Server Actions. Avant toute interaction avec la base de données, chaque entrée utilisateur est passée à travers un schéma Zod qui définit précisément la structure attendue, les types autorisés, et les contraintes de valeur (minimum, maximum, format). Si la validation échoue, une `ZodError` est levée — qui peut être interceptée et retournée comme erreur métier explicite. Cette approche garantit qu'aucune donnée malformée ou malveillante ne peut atteindre la couche de persistance.

Le type de retour uniforme `ActionResult<T>` permet aux composants clients de gérer les résultats de Server Actions de façon cohérente. Toutes les Server Actions retournent soit `{ success: true, data?: T }` pour les opérations réussies, soit `{ success: false, error: string }` pour les erreurs. Les composants n'ont donc pas besoin de try/catch — ils inspectent simplement `result.success` et agissent en conséquence.

**Pattern d'authentification systématique**

Chaque Server Action sensible commence par la même séquence d'authentification :

```typescript
// src/lib/auth.ts
export async function requireAuth(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user) throw new Error("Non autorisé");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getAppUser();
  if (!user || user.role !== "ADMIN") throw new Error("Non autorisé");
  return user;
}
```

`getAppUser()` interroge d'abord Supabase Auth pour récupérer la session JWT, puis consulte la table `users` en base par `authUserId`. Si la session est expirée ou invalide, Supabase retourne `null` et la Server Action lève immédiatement une erreur.

**Pattern de validation Zod avant écriture**

Toutes les entrées utilisateur sont validées via Zod avant toute interaction avec la base de données :

```typescript
// Exemple dans features/kitchen-status/actions.ts
const statusSettingsSchema = z.object({
  CALM: z.union([
    z.object({ fixed: z.number().int().min(0) }),
    z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  ]).optional(),
  // ...
});

export async function updateStatusSettings(settings: StatusSettings) {
  const user = await requireAuth();
  const validatedSettings = statusSettingsSchema.parse(settings); // Lève ZodError si invalide
  // ... puis écriture en base
}
```

**Pattern de retour uniforme**

Toutes les Server Actions retournent un type `ActionResult` cohérent :

```typescript
type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};
```

Ce pattern permet aux composants clients de gérer les erreurs de façon uniforme sans try/catch dispersés dans l'interface.

---

### E. User Stories — synthèse par module

L'ensemble des user stories a été formalisé selon le standard « En tant que [acteur], je veux [action] afin de [bénéfice] ». Cette formalisation est essentielle pour plusieurs raisons. D'abord, elle force à penser depuis la perspective de l'utilisateur plutôt que depuis la perspective technique — une fonctionnalité qui n'a pas d'utilisateur bénéficiaire n'a pas de raison d'être développée. Ensuite, elle facilite la communication entre les parties prenantes non techniques (client, investisseur, jury) et l'équipe de développement. Enfin, elle constitue la base du cahier de recettes : chaque user story doit correspondre à au moins une recette fonctionnelle.

Dans Yallo, quatre acteurs ont été identifiés : le **Visiteur** (non authentifié, accès au site marketing uniquement), l'**OWNER** (propriétaire d'un restaurant, accès au dashboard), l'**ADMIN** (équipe Yallo interne, accès au panel d'administration), et l'**Agent ElevenLabs** (système automatisé, accès uniquement via webhook signé). La distinction entre OWNER et ADMIN est implémentée par l'enum `userRole` en base de données et enforced dans chaque Server Action par `requireAuth()` ou `requireAdmin()`.

| Module | US V1 | Acteur principal | Server Actions / Routes principales |
|---|---|---|---|
| Authentification | 4 | OWNER, ADMIN | `/login`, `/update-password`, middleware |
| Site marketing | 5 | Visiteur | Pages `/`, `/contact`, `/demo`, `/guide`, `/legal` |
| Dashboard — Vue d'ensemble | 3 | OWNER | `getKitchenStatus`, `updateKitchenStatus` |
| Commandes en cuisine | 4 | OWNER | `getOrders`, `updateOrderStatus`, `simulateSubmitOrder` |
| Statut de la cuisine | 3 | OWNER | `updateKitchenStatus`, `updateStatusSettings` |
| Gestion du menu | 4 | OWNER | `getMenuData`, `saveMenuData`, `generateMenuFromImages`, `clearMenuData` |
| Horaires d'ouverture | 2 | OWNER | `getBusinessHours`, `updateBusinessHours` |
| Facturation | 3 | OWNER | Stripe webhook, `/dashboard/billing` |
| Administration — Restaurants | 6 | ADMIN | `getRestaurants`, `createRestaurant`, `updateRestaurantGeneral` |
| Administration — Utilisateurs | 4 | ADMIN | `getUsers`, `deleteUser`, `createUser` |
| Configuration agent IA | 3 | ADMIN / OWNER | `createElevenLabsAgent`, `updateElevenLabsAgent`, `deleteElevenLabsAgent` |
| Téléphonie | 2 | ADMIN | `importTwilioPhoneNumber` |
| Intégration HubRise | 2 | ADMIN | `fetchHubriseCatalog`, configuration |
| Prise de commande vocale | 3 | Agent ElevenLabs | `POST /api/elevenlabs/webhook` |

---

### F. Présentation des prototypes

Le développement a suivi une approche itérative. Les modules ci-dessous constituent le cœur fonctionnel de la V1.

#### 1. Authentification et contrôle d'accès

La gestion de l'authentification est le fondement de toute la sécurité applicative. Dans Yallo, ce bloc a été conçu pour être à la fois simple à comprendre et impossible à contourner.

L'authentification repose sur **Supabase Auth**, un service géré qui fournit un système complet de gestion des identités : création de comptes, validation des emails, sessions JWT avec rafraîchissement automatique, et tokens de réinitialisation de mot de passe. Ce service répond aux problèmes que rencontrerait une implémentation maison : stockage sécurisé des mots de passe (bcrypt avec coût paramétrable), protection contre les attaques par force brute, gestion des sessions multi-appareils, révocation de tokens.

Après la connexion Supabase, l'application effectue une seconde vérification dans sa propre base de données. La fonction `getAppUser()` récupère le profil complet de l'utilisateur depuis la table `users` en utilisant l'`authUserId` (identifiant Supabase) comme clé de liaison. Ce double niveau de vérification est important : Supabase garantit que la session est valide, et la base applicative garantit que l'utilisateur a un compte actif avec le bon rôle. Un compte Supabase actif pour un utilisateur supprimé de la table `users` sera donc correctement rejeté.

Le middleware Next.js est le premier point de vérification pour toutes les requêtes arrivant sur `app.yallo.fr`. Il s'exécute sur le réseau Edge de Vercel, avant même que la requête n'atteigne les Vercel Functions. Sa logique est stricte : tout visiteur sans session valide est redirigé vers la page de connexion, quel que soit l'URL demandé. Les rôles ADMIN et OWNER sont séparés dans leur espace de routing : un OWNER ne peut pas accéder aux routes `/admin/*`, et un ADMIN est redirigé vers `/admin` s'il tente d'accéder au dashboard.

Le premier point d'entrée dans l'application protégée est la connexion. L'authentification est gérée par Supabase Auth. Après connexion, le middleware récupère le rôle de l'utilisateur via la base de données et redirige vers la bonne surface (`/dashboard` pour `OWNER`, `/admin` pour `ADMIN`).

La séparation des surfaces applicatives est assurée dans `middleware.ts` :

```typescript
// Logique simplifiée du middleware
if (hostname.startsWith("app.")) {
  const user = await getAppUser();
  if (!user) return NextResponse.redirect(loginUrl);
  if (user.role === "ADMIN" && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(adminUrl);
  }
  if (user.role === "OWNER" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(dashboardUrl);
  }
}
```

| Surface | Acteur | Protection | Résultat si accès non autorisé |
|---|---|---|---|
| `/dashboard/*` | OWNER | `requireAuth()` + rôle OWNER | Redirection `/login` ou 403 |
| `/admin/*` | ADMIN | `requireAdmin()` | 403 Forbidden |
| Routes API webhooks | Service externe | Signature cryptographique | 401 Unauthorized |
| Pages marketing | Public | Aucune | Accès libre |

#### 2. Dashboard — Commandes en temps réel

Le dashboard est l'interface centrale pour le personnel en cuisine. Il s'affiche en plein écran sur la tablette posée en cuisine et présente les commandes dans leur statut courant. L'interface a été conçue pour être lisible d'un coup d'œil même dans un environnement bruyant et chargé : grandes cartes de commande, indicateurs colorés par statut, boutons d'action larges et facilement accessibles.

La gestion des commandes suit un workflow unidirectionnel strict. Une commande ne peut progresser que vers le statut suivant dans la chaîne `NEW → PREPARING → READY → DELIVERED`. Il est impossible de "reculer" une commande — une commande PREPARING ne peut pas revenir à NEW. Ce choix est volontaire : il reflète la réalité physique de la préparation en cuisine. Le statut `CANCELLED` est un état terminal atteignable depuis n'importe quel état, réservé aux cas d'annulation.

La protection contre la manipulation est implémentée à deux niveaux. Au niveau du Server Action `updateOrderStatus`, avant d'accepter la mise à jour, le système vérifie d'abord que l'`orderId` fourni correspond bien à une commande appartenant au restaurant de l'utilisateur connecté. Cette vérification d'ownership empêche un utilisateur malveillant de modifier les commandes d'un autre restaurant en forgeant un orderId valide. Au niveau de la transition d'état, le système vérifie que la transition demandée est valide dans le workflow — on ne peut pas passer directement de NEW à DELIVERED.

La page de dashboard est implémentée avec revalidation automatique. Après chaque mise à jour de statut, `revalidatePath("/dashboard")` est appelé, ce qui force Next.js à recalculer la page depuis le serveur à la prochaine navigation. Pour une experience temps réel plus fluide, le composant liste des commandes utilise `useTransition` de React pour afficher un état de chargement optimiste.

Le dashboard affiche les commandes en temps réel, permet de les faire avancer dans le workflow de préparation (NEW → PREPARING → READY → DELIVERED) et de les annuler si nécessaire.

| Server Action | Description | Auth |
|---|---|---|
| `getOrders` | Liste les commandes du restaurant de l'utilisateur connecté, triées par date | requireAuth() |
| `updateOrderStatus(orderId, status)` | Fait progresser une commande vers le statut suivant | requireAuth() |
| `simulateSubmitOrder(payload)` | Simule un webhook ElevenLabs pour les tests en développement | requireAuth() |

La mise à jour du statut est protégée contre la manipulation : avant d'écrire le nouveau statut, la Server Action vérifie que l'`orderId` appartient bien au restaurant de l'utilisateur connecté. Un utilisateur ne peut pas modifier les commandes d'un autre restaurant, même en forgeant une requête.

Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| Server Action | `getOrders()` | Récupère les commandes actives du restaurant | requireAuth() |
| Server Action | `updateOrderStatus()` | Avance une commande dans le workflow | requireAuth() + vérif ownership |
| POST | `/api/elevenlabs/webhook` | Reçoit une commande de l'agent vocal | Secret header |

#### 3. Statut de la cuisine

Le module de statut cuisine est un composant en apparence simple mais critique dans le fonctionnement de l'agent vocal. Il permet au responsable de cuisine d'indiquer en temps réel la charge de travail actuelle, information que l'agent ElevenLabs consulte à chaque nouvelle demande de commande pour décider de l'accepter ou de la refuser.

Ce module répond à un besoin métier précis : un restaurant ne peut pas toujours accepter de nouvelles commandes. Pendant certaines périodes (service complet, panne d'équipement, rush imprévu), il doit pouvoir stopper temporairement l'afflux de commandes téléphoniques sans avoir à éteindre l'agent vocal ou décrocher manuellement le téléphone. Le statut `STOP` permet cela : l'agent vocal annonce poliment au client que le restaurant ne prend plus de commandes pour le moment.

Les quatre statuts définis — `CALM`, `NORMAL`, `RUSH`, `STOP` — correspondent à des états réels de la cuisine avec des implications concrètes sur les délais communiqués au client. Chaque statut peut être configuré avec un temps d'attente fixe (ex : "15 minutes") ou une fourchette (ex : "entre 20 et 30 minutes"). Ces paramètres sont stockés en JSONB dans la colonne `statusSettings` de la table `restaurants` et gérés par le schéma Zod `statusSettingsSchema`.

La conception du schéma de validation illustre la flexibilité nécessaire pour ce module :

```typescript
const statusSettingsSchema = z.object({
  CALM: z.union([
    z.object({ fixed: z.number().int().min(0) }),
    z.object({ min: z.number().int().min(0), max: z.number().int().min(0) }),
  ]).optional(),
  NORMAL: z.union([...]).optional(),
  RUSH: z.union([...]).optional(),
  STOP: z.undefined(), // Le statut STOP n'a pas de temps d'attente
});
```

Le `z.union()` permet à chaque statut d'accepter soit un temps fixe, soit une fourchette min/max. Le schéma Zod est à la fois une validation et une documentation — il exprime exactement le contrat attendu, lisible par n'importe quel développeur.

Le module de statut cuisine permet au responsable d'indiquer en temps réel la charge de travail en cuisine. Ce statut est utilisé par l'agent vocal pour décider d'accepter ou rejeter une commande (`STOP` = refus automatique).

| Statut | Signification | Comportement agent |
|---|---|---|
| `CALM` | Cuisine calme | Commandes acceptées, délai minimal |
| `NORMAL` | Activité normale | Commandes acceptées, délai standard |
| `RUSH` | Période de rush | Commandes acceptées, délai allongé |
| `STOP` | Service arrêté | Commandes refusées automatiquement |

Les paramètres de chaque statut (temps d'attente fixe ou fourchette min/max) sont configurables par l'utilisateur et stockés en JSON dans la colonne `statusSettings` de la table `restaurants`.

| Server Action | Description | Validation |
|---|---|---|
| `getKitchenStatus()` | Récupère statut courant + settings du restaurant | Aucune (lecture seule) |
| `updateKitchenStatus(status)` | Met à jour le statut courant | Vérifie que la valeur est dans l'enum |
| `updateStatusSettings(settings)` | Met à jour les temps d'attente | Zod `statusSettingsSchema` |

#### 4. Gestion du menu

Le module menu est l'une des fonctionnalités les plus innovantes de Yallo. Il résout un problème pratique réel : la configuration d'un agent vocal pour un restaurant nécessite de lui fournir le menu complet, structuré de façon lisible par une IA. Or, un restaurateur n'est pas développeur — lui demander de saisir son menu dans un format JSON structuré est irréaliste.

Yallo propose deux approches complémentaires : la saisie manuelle via une interface visuelle, et l'import automatique par reconnaissance d'images grâce à GPT-4o Vision. L'import par images est la fonctionnalité phare : le restaurateur peut simplement photographier sa carte (menu papier, ardoise, affiche), uploader jusqu'à 5 photos, et recevoir en retour une structure `MenuData` complète, avec catégories, produits, descriptions et prix — prête à être revue et sauvegardée.

La limite de 5 images est une contrainte à la fois technique et économique. Techniquement, au-delà de 5 images, le contexte de GPT-4o est souvent dépassé, ce qui dégrade la qualité de l'extraction. Économiquement, chaque appel à l'API OpenAI est facturé au token — limiter à 5 images garantit un coût contrôlé par extraction.

La structure `MenuData` stockée en JSONB est transmise telle quelle à l'agent ElevenLabs lors de sa configuration. L'agent dispose ainsi d'une connaissance complète du menu : il peut répondre aux questions sur les ingrédients, proposer des alternatives, calculer des totaux, et créer des `orderItems` conformes lors de la soumission d'une commande.

La fonctionnalité `clearMenuData` mérite d'être mentionnée : elle permet de remettre à zéro le menu d'un restaurant d'un seul clic. Cette action est irréversible (la valeur JSONB est mise à `null`) mais protégée par une confirmation dans l'interface.

Le module menu permet au restaurateur de configurer la carte qui sera connue de l'agent vocal. Il propose deux méthodes : saisie manuelle et import par reconnaissance d'images (OpenAI GPT-4o Vision).

La structure `MenuData` est stockée en JSONB dans la table `restaurants` :

```typescript
// Type MenuData issu du schéma Drizzle
type MenuData = {
  categories: MenuCategory[];
  option_lists: MenuOptionList[];
};
type MenuCategory = {
  name: string;
  products: MenuProduct[];
};
```

| Server Action | Description | Validation / Limite |
|---|---|---|
| `getMenuData()` | Récupère la carte du restaurant | requireAuth() |
| `saveMenuData(data)` | Sauvegarde la structure complète du menu | requireAuth() + schéma MenuData |
| `generateMenuFromImages(images)` | Envoie max 5 images à GPT-4o Vision, retourne MenuData | Max 5 images, rejet si 0 ou > 5 |
| `clearMenuData()` | Efface la carte (remet à null) | requireAuth() |

**Limitation délibérée :** `generateMenuFromImages` n'impose pas d'authentification pour la génération en elle-même (la validation de l'image provient du client). La Server Action délègue entièrement à `parseMenuFromBase64Images` du service OpenAI, et retourne une erreur générique en cas d'échec du parser pour ne pas exposer les détails techniques de l'API.

#### 5. Horaires d'ouverture

Le module horaires est un composant de configuration qui impacte directement le comportement de l'agent vocal. Les horaires sont transmis à ElevenLabs lors de la création ou de la mise à jour de l'agent, qui les utilise pour deux usages : informer le client des horaires d'ouverture lorsqu'il le demande, et refuser les appels reçus en dehors des heures d'ouverture.

La conception du schéma de données pour les horaires est plus complexe qu'elle n'y paraît. Un horaire de restaurant peut prendre plusieurs formes :
- Un jour fermé (pas d'horaire)
- Un jour avec un créneau unique (9h-22h)
- Un jour avec deux créneaux (midi 11h-14h, soir 18h-22h)

Pour modéliser cette variabilité, le schéma Zod utilise un type union discriminé (`dayScheduleSchema`) qui accepte trois formes. Le format `schedule` est un objet dont les clés sont les identifiants de jours (en format ISO, ex : "monday", "tuesday") et les valeurs sont soit `undefined` (jour fermé) soit un objet de planning.

La timezone est un champ explicite du schéma, avec la valeur par défaut "Europe/Paris". Ce choix est important pour les restaurants qui pourraient être dans d'autres fuseaux horaires (DOM-TOM, partenaires internationaux futurs). L'agent vocal compare les horaires avec l'heure locale du restaurant en tenant compte du fuseau.

La persistance des horaires est faite en JSON stringifié dans une colonne `text` (plutôt qu'en JSONB) car les horaires sont toujours lus et écrits en bloc — jamais partiellement. La colonne `text` est suffisante et légèrement plus performante que JSONB pour des données de taille modeste lues intégralement.

Le module horaires permet de configurer les plages d'ouverture du restaurant. Ces informations sont transmises à l'agent vocal et permettent de refuser des appels hors horaires.

La structure supporte deux formats de journée : simple (une plage open/close) ou double (midi et soir distincts).

```typescript
const businessHoursSchema = z.object({
  timezone: z.string().default("Europe/Paris"),
  schedule: z.record(z.string(), dayScheduleSchema.optional()),
});
```

| Server Action | Description | Résultat si erreur |
|---|---|---|
| `getBusinessHours()` | Lit les horaires depuis la DB, valide avec Zod | Retourne `{schedule: {}}` par défaut |
| `updateBusinessHours(formData)` | Parse le JSON, valide avec Zod, écrit en DB | Retourne `{success: false, error: "Format invalide"}` |

#### 6. Administration

Le panel d'administration est la surface la plus puissante de l'application. Il permet à l'équipe interne Yallo de gérer l'ensemble de la plateforme depuis un seul endroit, sans avoir besoin d'intervenir directement en base de données ou via des scripts.

L'accès au panel admin est le plus strictement contrôlé de toute l'application. Deux vérifications indépendantes s'assurent qu'aucun utilisateur non admin ne peut y accéder : le middleware bloque les utilisateurs avec le rôle OWNER au niveau du routing, et chaque Server Action admin commence par `requireAdmin()` qui vérifie à nouveau le rôle depuis la base. Cette redondance est intentionnelle — elle protège contre des scénarios où le middleware serait contourné (par exemple, un appel direct à la Server Action depuis un outil comme curl).

Le flux de création d'un agent ElevenLabs est la séquence la plus complexe de toute la base de code. Elle implique trois services externes en cascade, avec une logique de compensation (rollback) si l'un des appels intermédiaires échoue. Cette complexité reflète une contrainte externe : l'agent ElevenLabs ne peut pas fonctionner sans un numéro Twilio qui lui soit associé. Tenter de créer un agent sans numéro Twilio, ou sans que l'import du numéro réussisse, laisserait le restaurant dans un état incohérent — un agent créé dans ElevenLabs mais inutilisable car sans numéro de téléphone.

La gestion des utilisateurs depuis l'admin requiert une attention particulière car elle touche à deux systèmes : la base de données Yallo (table `users`) et le service Supabase Auth. La création d'un utilisateur doit créer les deux entrées de façon cohérente. La suppression d'un utilisateur doit supprimer les deux entrées — supprimer uniquement l'entrée en base laisserait un orphelin dans Supabase, et supprimer uniquement l'entrée Supabase laisserait un utilisateur en base sans compte d'authentification associé.

Le panel admin est réservé aux utilisateurs avec le rôle `ADMIN`. Il permet de gérer l'ensemble des restaurants et des utilisateurs de la plateforme.

**Module Restaurants**

| Server Action | Description | Auth |
|---|---|---|
| `getRestaurants()` | Liste tous les restaurants avec leur statut | requireAdmin() |
| `createRestaurant(formData)` | Crée un restaurant et l'associe à un owner | requireAdmin() + Zod |
| `updateRestaurantGeneral(id, data)` | Modifie nom, adresse, owner, statut | requireAdmin() + Zod |
| `createElevenLabsAgent(id)` | Crée l'agent IA + importe le numéro Twilio | requireAdmin() ou OWNER |
| `updateElevenLabsAgent(id)` | Synchronise la configuration de l'agent | requireAdmin() ou OWNER |
| `deleteElevenLabsAgent(id)` | Supprime l'agent et libère le numéro | requireAdmin() ou OWNER |

**Module Utilisateurs**

| Server Action | Description | Auth |
|---|---|---|
| `getUsers()` | Liste tous les utilisateurs | requireAdmin() |
| `createUser(formData)` | Crée un compte utilisateur via Supabase | requireAdmin() |
| `deleteUser(id)` | Supprime un utilisateur et ses données | requireAdmin() |

---

### G. Flux critiques et intégrations externes

Les flux critiques d'une application sont les parcours qui impliquent plusieurs systèmes en cascade et dont l'échec a un impact direct sur l'expérience utilisateur ou les données. Dans Yallo, deux flux sont qualifiés de critiques : la prise de commande vocale (flux principal du produit) et la gestion des abonnements Stripe (flux financier). Ces flux sont dits critiques non seulement parce qu'ils sont importants fonctionnellement, mais parce qu'ils mettent en jeu des webhooks asynchrones — c'est-à-dire des appels initiés par des systèmes externes dont on ne contrôle pas le timing, le format exact du payload, ni les éventuelles retries en cas d'erreur.

La gestion des webhooks est une compétence spécifique qui distingue les développeurs expérimentés des développeurs débutants. Un webhook est un appel HTTP entrant depuis un service externe — il peut arriver à n'importe quel moment, plusieurs fois (en cas de retry par le service émetteur), avec des payloads qui évoluent entre les versions de l'API. La bonne gestion d'un webhook implique : la vérification de son authenticité (signature cryptographique), la validation de la structure de son payload, l'idempotence (traiter deux fois le même webhook ne doit pas créer de doublon), et une réponse rapide (certains services ont un timeout court et relancent si la réponse tarde trop).

#### 1. Flux de prise de commande vocale (ElevenLabs Webhook)

C'est le flux métier central de Yallo. Lorsqu'un client appelle le numéro Twilio configuré pour un restaurant, l'appel est redirigé vers l'agent ElevenLabs. L'agent analyse la demande, construit une commande, puis déclenche l'outil `submit_order` qui envoie un webhook vers `POST /api/elevenlabs/webhook`.

**Séquence complète :**

```
Client (téléphone) → Twilio (numéro SDA)
    → ElevenLabs (agent vocal IA)
        → [dialogue + extraction de la commande]
        → POST /api/elevenlabs/webhook?restaurantId=xxx
            → Vérification du secret webhook
            → Contrôle du statut cuisine (STOP = refus)
            → Création order + orderItems en DB
            → Push vers HubRise si configuré
            → Envoi SMS de confirmation (Twilio)
            → Réponse JSON { success: true }
```

**Vérification de sécurité du webhook :**

```typescript
// src/app/api/elevenlabs/webhook/route.ts
function verifyWebhookSecret(request: Request): boolean {
  const secret = request.headers.get("x-webhook-secret");
  if (process.env.VERCEL_ENV === "production") {
    return secret === process.env.ELEVENLABS_WEBHOOK_SECRET;
  }
  // En développement, si le secret n'est pas configuré, on laisse passer
  if (!process.env.ELEVENLABS_WEBHOOK_SECRET) return true;
  return secret === process.env.ELEVENLABS_WEBHOOK_SECRET;
}
```

Le mode strict en production (`VERCEL_ENV === "production"`) garantit qu'aucun webhook non signé ne peut créer de commandes en prod.

#### 2. Flux Stripe — Synchronisation de l'abonnement

Le webhook Stripe reçoit les événements d'abonnement et synchronise l'état de facturation dans la table `restaurants`.

```
Stripe → POST /api/stripe/webhook
    → Vérification signature (stripe.webhooks.constructEvent)
    → Extraction customerId + subscription fields
    → Lookup restaurant par stripeCustomerId
    → Mise à jour isActive, status, subscriptionId, billingStartDate
```

La vérification de la signature est effectuée avec la clé `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()`. Toute requête avec une signature invalide retourne immédiatement HTTP 400.

#### 3. Flux OpenAI — Parsing de menu par images

L'action `generateMenuFromImages` envoie jusqu'à 5 images encodées en base64 à GPT-4o Vision avec un prompt structuré demandant une extraction en format `MenuData`. Le résultat est retourné directement sans être persisté — l'utilisateur décide d'enregistrer ou non.

---

### H. Tests unitaires

La stratégie de tests de Yallo repose sur un principe fondamental : **chaque Server Action et chaque utilitaire critique doit être testé en isolation complète**, sans dépendance à la base de données, aux services externes, ou à l'état du système. Ce principe, appelé "unit testing" au sens strict, garantit que les tests sont rapides (exécution en millisecondes), déterministes (même résultat à chaque exécution), et maintenables (un test ne casse pas à cause d'un problème réseau).

L'isolation est obtenue grâce au système de mocking de Vitest. Avant l'exécution de chaque test, toutes les dépendances extérieures sont remplacées par des doubles de test contrôlés : `vi.mock("@/db", ...)` remplace l'ORM Drizzle par un objet dont les méthodes retournent des valeurs configurées par le test, `vi.mock("@/lib/auth", ...)` remplace les fonctions d'authentification, et `vi.mock("next/cache", ...)` neutralise les appels de revalidation qui nécessiteraient un contexte Next.js complet.

La philosophie des tests dans Yallo distingue trois types de scénarios à couvrir systématiquement pour chaque fonctionnalité :

Le **scénario nominal** vérifie que la fonctionnalité se comporte correctement lorsque toutes les conditions sont réunies (utilisateur authentifié, données valides, services disponibles). C'est le "happy path".

Les **scénarios d'erreur d'accès** vérifient que les guards de sécurité fonctionnent : que `requireAuth()` bloque les utilisateurs non connectés, que `requireAdmin()` bloque les non-admins, que les vérifications d'ownership bloquent les accès à des ressources d'autres utilisateurs.

Les **scénarios de données invalides** vérifient les limites métier : maximum d'images dépassé, format invalide, valeur hors enum. Ces tests protègent contre les usages imprévus de l'interface qui pourraient contourner les validations côté client.

La suite de 190 tests est organisée de façon pyramidale. La grande majorité des tests concerne les Server Actions (la logique métier), car c'est là que les risques de régression sont les plus élevés. Les composants React ne sont pas testés unitairement en V1 — un axe d'amélioration identifié pour la V2 avec Testing Library et des tests d'intégration.

#### 1. Structure et couverture

| Métrique | Résultat |
|---|---|
| Nombre de fichiers de tests | 24 |
| Nombre total de tests | 190 |
| Tests en succès | 190 (0 échec) |
| Couverture des instructions (Stmts) | 72,55 % |
| Couverture des branches (Branch) | 67,54 % |
| Couverture des fonctions (Funcs) | 75,00 % |
| Couverture des lignes (Lines) | 73,49 % |

#### 2. Exemple : test unitaire de Kitchen Status Actions

Le fichier `src/__tests__/features/kitchen-status/actions.test.ts` illustre la démarche unitaire. Toutes les dépendances sont remplacées par des mocks Vitest — la base de données, l'authentification et `revalidatePath` ne sont jamais appelés réellement.

```typescript
// Mocks complets : aucune dépendance réelle
vi.mock("@/db", () => ({
  db: {
    query: { restaurants: { findFirst: vi.fn() } },
    update: vi.fn(),
  },
}));
vi.mock("@/lib/auth", () => ({
  getAppUser: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("Kitchen Status Actions", () => {
  it("should return kitchen status for authenticated user", async () => {
    vi.mocked(getAppUser).mockResolvedValue(mockOwner);
    vi.mocked(db.query.restaurants.findFirst).mockResolvedValue({
      id: "rest-123",
      currentStatus: "NORMAL",
      statusSettings: { CALM: { fixed: 5 } },
    });

    const result = await getKitchenStatus();

    expect(result?.currentStatus).toBe("NORMAL");
  });

  it("should initialize default settings if none exist", async () => {
    vi.mocked(getAppUser).mockResolvedValue(mockOwner);
    vi.mocked(db.query.restaurants.findFirst).mockResolvedValue({
      id: "rest-123", currentStatus: "NORMAL", statusSettings: null,
    });
    // Vérifie que les settings par défaut sont appliqués
    const result = await getKitchenStatus();
    expect(result?.statusSettings).toEqual(DEFAULT_STATUS_SETTINGS);
  });
});
```

Ces deux tests vérifient le cas nominal et le cas d'initialisation des valeurs par défaut — cas critique pour les nouveaux restaurants.

#### 3. Exemple : test unitaire des Menu Actions

Le fichier `src/__tests__/features/menu/actions.test.ts` couvre `generateMenuFromImages` avec les cas limites métier :

```typescript
it("should return error when more than 5 images provided", async () => {
  const tooManyImages = Array(6).fill("base64data");
  const result = await generateMenuFromImages(tooManyImages);
  expect(result).toEqual({ success: false, error: "Maximum 5 images autorisées" });
});

it("should return generated menu data on success", async () => {
  vi.mocked(parseMenuFromBase64Images).mockResolvedValue(mockMenuData);
  const result = await generateMenuFromImages(["base64image"]);
  expect(result).toEqual({ success: true, menuData: mockMenuData });
});

it("should return error when parser fails", async () => {
  vi.mocked(parseMenuFromBase64Images).mockRejectedValue(new Error("Parser error"));
  const result = await generateMenuFromImages(["base64image"]);
  expect(result).toEqual({ success: false, error: "Parser error" });
});
```

#### 4. Couverture et prévention des régressions

Le rapport de couverture est généré à chaque run de CI et transmis à Codecov. SonarCloud consomme le fichier `lcov.info` pour afficher l'évolution de la couverture dans son tableau de bord.

L'architecture de tests garantit que toute modification d'une Server Action est immédiatement validée par les tests existants. Le CI est configuré pour **bloquer le merge** si les tests échouent — ce qui empêche toute régression d'atteindre `main`.

#### 4. Exemple : test unitaire du webhook ElevenLabs

Le test du webhook ElevenLabs est l'un des plus complets car il couvre le flux critique de création de commande depuis un agent vocal.

```typescript
// src/__tests__/app/api/elevenlabs/webhook.test.ts
describe("ElevenLabs Webhook Handler", () => {
  describe("POST /api/elevenlabs/webhook", () => {
    it("should return 401 when webhook secret is missing", async () => {
      process.env.VERCEL_ENV = "production";
      process.env.ELEVENLABS_WEBHOOK_SECRET = "secret-test";

      const request = new Request("http://localhost/api/elevenlabs/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_call: { name: "submit_order", arguments: {} } }),
      });

      const response = await POST(request, { params: { restaurantId: "rest-123" } });
      expect(response.status).toBe(401);
    });

    it("should reject order when restaurant has STOP status", async () => {
      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue({
        id: "rest-123",
        currentStatus: "STOP",
        menuData: mockMenuData,
      });

      const request = createValidWebhookRequest(validOrderPayload);
      const response = await POST(request, { params: { restaurantId: "rest-123" } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(false);
      expect(body.reason).toContain("STOP");
      expect(db.insert).not.toHaveBeenCalled(); // Aucune commande créée
    });

    it("should create order and items on valid payload", async () => {
      vi.mocked(db.query.restaurants.findFirst).mockResolvedValue({
        id: "rest-123",
        currentStatus: "NORMAL",
        hubRiseAccountId: null,
        twilioPhoneNumber: null,
      });
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: "order-new-123" }]),
      });

      const request = createValidWebhookRequest(validOrderPayload);
      const response = await POST(request, { params: { restaurantId: "rest-123" } });

      expect(response.status).toBe(200);
      expect(db.insert).toHaveBeenCalledTimes(2); // orders + orderItems
    });
  });
});
```

Ces trois tests couvrent les trois branches critiques du webhook : rejet pour absence d'auth, rejet métier (STOP), et création nominale.

#### 5. Exemple : test unitaire de l'auth

```typescript
// src/__tests__/lib/auth.test.ts
describe("auth utilities", () => {
  it("requireAuth throws when user is not authenticated", async () => {
    vi.mocked(getAppUser).mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("Non autorisé");
  });

  it("requireAuth returns user when authenticated", async () => {
    vi.mocked(getAppUser).mockResolvedValue(mockOwner);
    const result = await requireAuth();
    expect(result).toEqual(mockOwner);
  });

  it("requireAdmin throws when role is OWNER", async () => {
    vi.mocked(getAppUser).mockResolvedValue({ ...mockOwner, role: "OWNER" });
    await expect(requireAdmin()).rejects.toThrow("Non autorisé");
  });

  it("requireAdmin returns user when role is ADMIN", async () => {
    vi.mocked(getAppUser).mockResolvedValue({ ...mockOwner, role: "ADMIN" });
    const result = await requireAdmin();
    expect(result.role).toBe("ADMIN");
  });
});
```

#### 6. Exemple : test du rate limiter

```typescript
// src/__tests__/lib/rate-limit.test.ts
describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow up to MAX_REQUESTS requests", () => {
    const id = "test-ip:/api/test";
    for (let i = 0; i < 10; i++) {
      expect(rateLimit(id)).toBe(true);
    }
    // 11e requête : refusée
    expect(rateLimit(id)).toBe(false);
  });

  it("should reset after window expires", () => {
    const id = "test-ip:/api/reset";
    for (let i = 0; i < 10; i++) rateLimit(id);
    expect(rateLimit(id)).toBe(false);

    vi.advanceTimersByTime(60_001); // Avance de 60s + 1ms

    // La fenêtre a expiré, on peut à nouveau requêter
    expect(rateLimit(id)).toBe(true);
  });

  it("should track different identifiers independently", () => {
    const id1 = "ip-1:/api/test";
    const id2 = "ip-2:/api/test";
    for (let i = 0; i < 10; i++) rateLimit(id1);
    expect(rateLimit(id1)).toBe(false); // ip-1 limitée
    expect(rateLimit(id2)).toBe(true);  // ip-2 non affectée
  });
});
```

Ces tests valident les trois comportements fondamentaux du rate limiter : la limite stricte à 10 requêtes, la remise à zéro après expiration de la fenêtre, et l'isolation par identifiant.

---

### I. Sécurité

La sécurité de Yallo ne repose pas sur un seul mécanisme de protection, mais sur une défense en profondeur : plusieurs couches indépendantes, chacune protégeant contre une classe de menaces spécifique. Cette approche garantit qu'un défaut dans une couche ne compromet pas l'ensemble du système.

Le référentiel OWASP Top 10 a servi de guide pour auditer chaque décision d'architecture. Voici l'analyse détaillée de chaque point, avec les mécanismes de protection en place dans Yallo :

La sécurité est intégrée à tous les niveaux de l'architecture, en référence au référentiel OWASP Top 10 :

**A01 — Broken Access Control**

Le contrôle d'accès cassé est la vulnérabilité numéro 1 du classement OWASP 2021. Elle se manifeste typiquement lorsqu'un utilisateur peut accéder à des ressources qui ne lui appartiennent pas, en modifiant un paramètre d'URL ou en appelant une API avec l'identifiant d'un autre utilisateur.

Dans Yallo, le contrôle d'accès est assuré à deux niveaux indépendants. Au niveau du middleware, `middleware.ts` vérifie le rôle avant de servir toute page `app.yallo.fr`. Un `OWNER` qui tente d'accéder à `/admin` est redirigé vers `/dashboard` (code 307). Un utilisateur non connecté est redirigé vers `/login`. Cette protection s'applique à toutes les requêtes sans exception, y compris les assets statiques potentiellement sensibles.

Au niveau de chaque Server Action, la vérification est redondante et encore plus précise. La vérification d'ownership est explicite sur chaque ressource : avant de modifier une commande, la Server Action vérifie que le restaurantId de la commande correspond au restaurant de l'utilisateur connecté. Même si un attaquant parvenait à contourner le middleware (ce qui est théoriquement impossible avec Next.js, mais défendons-nous en profondeur), il ne pourrait pas modifier les commandes d'un autre restaurant car la vérification échouerait au niveau de l'action.

```typescript
// Ownership check systématique
const ownerRestaurant = await db.query.restaurants.findFirst({
  where: eq(restaurants.ownerId, user.id), // user.id de requireAuth()
});
if (!ownerRestaurant) throw new Error("Restaurant non trouvé");
```

**A02 — Cryptographic Failures**

Cette catégorie couvre les données sensibles exposées en clair ou avec une cryptographie insuffisante. Les risques les plus courants sont : mots de passe stockés en clair ou avec un hachage faible (MD5, SHA-1), tokens de session prévisibles, données sensibles transmises en HTTP non chiffré.

Dans Yallo, les mots de passe ne sont jamais gérés par l'application — Supabase Auth gère intégralement le hachage bcrypt et le stockage des credentials. Les tokens JWT Supabase sont validés côté serveur via le SDK Supabase (clé `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement, jamais exposée au navigateur). La clé `SUPABASE_ANON_KEY` exposée côté client ne permet que les opérations publiques. Toutes les transmissions HTTP sont chiffrées via TLS/HTTPS enforçé par l'en-tête HSTS.

Les secrets Stripe et ElevenLabs sont injectés via les variables d'environnement Vercel et ne sont jamais commités dans le code source. SonarCloud est configuré pour détecter les secrets potentiellement hardcodés dans le code, bloquant tout commit accidentel.

**A03 — Injection**

Les attaques par injection (SQL, NoSQL, commandes OS) exploitent une mauvaise séparation entre les données et les instructions dans les requêtes. La forme la plus connue est l'injection SQL : `SELECT * FROM users WHERE id = '${userId}'` où `userId` peut contenir `' OR '1'='1` pour contourner une condition WHERE.

Drizzle ORM est utilisé exclusivement avec des requêtes paramétrées. La syntaxe Drizzle — `eq(users.id, userId)`, `where(and(eq(...), ne(...)))` — ne permet pas la concaténation de chaînes dans les requêtes SQL. La valeur de chaque paramètre est envoyée séparément à PostgreSQL, qui ne l'interprète jamais comme du SQL. Cette protection est structurelle : même un développeur inattentif ne peut pas écrire une requête vulnérable en utilisant Drizzle correctement.

La validation Zod apporte une seconde couche de protection en rejetant tout input inattendu avant même que Drizzle ne soit appelé. Le schema `.parse()` de Zod est strict par défaut : les clés inconnues dans un objet sont ignorées (mode `strip`), les types incorrects lèvent une erreur.

**A04 — Insecure Design**

Cette catégorie cible les défauts de conception à haut niveau plutôt que les bugs d'implémentation. Un design non sécurisé crée des fonctionnalités qui ne peuvent pas être sécurisées simplement en ajoutant des contrôles.

Plusieurs décisions de design dans Yallo démontrent une sécurité par conception. Le webhook ElevenLabs vérifie l'existence du restaurant et son statut STOP avant de créer une commande — un appel sur un restaurant inexistant ou en mode STOP retourne une erreur métier explicite sans créer de données partielles. La création d'un agent ElevenLabs vérifie le prérequis Twilio avant de commencer, et effectue un rollback propre en cas d'échec intermédiaire. La limite à 5 images pour `generateMenuFromImages` protège contre l'usage abusif de l'API OpenAI.

**A05 — Security Misconfiguration**

Les mauvaises configurations de sécurité sont une source fréquente de vulnérabilités : en-têtes HTTP manquants, erreurs exposant des stack traces, variables d'environnement committées par erreur.

Les en-têtes HTTP de sécurité sont configurés dans `next.config.ts` pour toutes les routes :

| En-tête | Valeur | Protection |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS, empêche le downgrade |
| `X-Frame-Options` | `SAMEORIGIN` | Protection contre le clickjacking |
| `X-Content-Type-Options` | `nosniff` | Empêche le MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Contrôle des données de référent |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Désactive les API sensibles du navigateur |
| `X-DNS-Prefetch-Control` | `on` | Optimisation navigation |

Sentry est configuré avec `sendDefaultPii: false` — aucune donnée personnelle (cookies, headers, IPs) n'est transmise aux rapports d'erreurs.

**A06 — Vulnerable and Outdated Components**

Cette catégorie cible les dépendances npm obsolètes ou présentant des vulnérabilités connues. Une seule dépendance compromise peut compromettre l'ensemble d'une application Node.js.

Le pipeline CI inclut un job `security` qui exécute `pnpm audit --audit-level=high` à chaque push. Une vulnérabilité de niveau high ou critical bloque le déploiement. Le lock file `pnpm-lock.yaml` est versionné et fixe les versions exactes de chaque dépendance transitive, garantissant la reproductibilité entre les environnements.

- Le job `security` du pipeline CI exécute `pnpm audit --audit-level=high` à chaque push. Une vulnérabilité de niveau high ou critical bloque le déploiement.
- Le fichier `pnpm-lock.yaml` est versionné et fixe les versions exactes de chaque dépendance transitive.
- Les dépendances critiques (Next.js, Drizzle, Stripe SDK) suivent les versions LTS.

**A07 — Identification and Authentication Failures**

Les défaillances d'authentification couvrent les mots de passe faibles, les tokens non invalidés, le brute-force non limité, et les sessions mal gérées.

La délégation complète de l'authentification à Supabase Auth est une décision de sécurité importante. Supabase implémente des protections éprouvées : hachage bcrypt avec salt, rate-limiting natif sur les tentatives de connexion, tokens JWT à courte durée de vie, rotation de refresh tokens. La couche de rate-limiting de Yallo (`src/lib/rate-limit.ts`) est un complément pour les webhooks non couverts par Supabase.

- Le rate limiting est implémenté dans `src/lib/rate-limit.ts` : 10 requêtes par IP par fenêtre de 60 secondes par défaut, avec nettoyage automatique des entrées expirées.
- Les tokens de session sont gérés par Supabase Auth avec expiration et renouvellement automatique.
- **Limite connue et documentée :** le rate limiter utilise un `Map` en mémoire (`new Map<string, RateLimitRecord>()`), ce qui signifie qu'il n'est pas partagé entre les instances Vercel serverless. C'est un axe d'amélioration identifié pour la V2, avec remplacement par un rate limiter Redis/Upstash distribué.

**A08 — Software and Data Integrity Failures**

Cette catégorie cible les modifications non autorisées du code ou des données, dont les webhooks sans validation de signature.

Les webhooks sont le point d'entrée le plus sensible de l'application — n'importe qui peut envoyer une requête HTTP à l'URL d'un webhook. Sans validation de signature, un attaquant pourrait simuler un paiement Stripe ou une commande ElevenLabs fictive.

- Les webhooks Stripe sont vérifiés avec `stripe.webhooks.constructEvent()` et la signature `Stripe-Signature`. Toute requête avec signature invalide retourne HTTP 400 immédiatement.
- Les webhooks ElevenLabs sont vérifiés avec le secret `ELEVENLABS_WEBHOOK_SECRET` via HMAC-SHA256. La comparaison utilise `crypto.timingSafeEqual()` pour éviter les timing attacks.

**A09 — Security Logging and Monitoring Failures**

L'absence de monitoring empêche la détection d'attaques en cours et la correction de vulnérabilités exploitées.

- Sentry est configuré sur les 3 runtimes : `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`.
- Un logger applicatif est utilisé dans les Server Actions pour tracer les erreurs avec contexte (restaurantId, userId, erreur originale) sans exposer les détails en production.
- `onRequestError = Sentry.captureRequestError` dans `instrumentation.ts` capture toutes les erreurs de requête au niveau Next.js.

**Synthèse de la couverture OWASP**

| OWASP ID | Intitulé | Implémentation Yallo | Fichier(s) de référence | Couverture |
|---|---|---|---|---|
| A01 | Broken Access Control | Middleware role-check + `requireAuth()` + `requireAdmin()` + ownership check | `middleware.ts`, `src/lib/auth.ts`, toutes les Server Actions | ✅ Couverte |
| A02 | Cryptographic Failures | Pas de gestion de mot de passe maison — Supabase Auth ; secrets jamais exposés côté client | `src/lib/auth.ts`, `.env.local` | ✅ Couverte |
| A03 | Injection | Drizzle ORM paramétré + validation Zod sur toutes les entrées | `src/db/schema.ts`, schémas Zod dans les features | ✅ Couverte |
| A04 | Insecure Design | Vérification ownership, guard STOP status, rollback ElevenLabs, limite 5 images | `api/elevenlabs/webhook`, `admin/actions.ts` | ✅ Couverte |
| A05 | Security Misconfiguration | 6 en-têtes HTTP de sécurité, Sentry `sendDefaultPii: false` | `next.config.ts`, `sentry.*.config.ts` | ✅ Couverte |
| A06 | Vulnerable Components | `pnpm audit --audit-level=high` bloquant en CI | `.github/workflows/ci.yml` — job `security` | ✅ Couverte |
| A07 | Auth & Session Failures | Rate limit 10 req/60s, sessions JWT Supabase avec expiration | `src/lib/rate-limit.ts` | ⚠️ Partielle (rate limiter non distribué) |
| A08 | Software Integrity Failures | Signature Stripe + secret ElevenLabs en mode strict prod | `api/stripe/webhook`, `api/elevenlabs/webhook` | ✅ Couverte |
| A09 | Logging & Monitoring Failures | Sentry 3 runtimes + `onRequestError` + logger applicatif | `instrumentation.ts`, `sentry.*.config.ts` | ✅ Couverte |
| A10 | SSRF | Aucun URL externe provenant du user input ; les URLs sont construites côté serveur uniquement | Design de l'architecture | ✅ Non exposé |

---

### J. Accessibilité

L'accessibilité est une exigence réglementaire (RGAA en France pour les services publics, référence WCAG 2.1 niveau AA pour les services privés) et une exigence éthique : une application utilisée par des restaurateurs de tous niveaux de maîtrise technique doit être utilisable par des personnes utilisant des technologies d'assistance.

Dans Yallo, l'accessibilité est principalement assurée par le choix des composants d'interface. Radix UI — la bibliothèque de primitives sur laquelle est construite shadcn/ui — a été conçue avec l'accessibilité comme contrainte première et non comme ajout secondaire. Chaque composant Radix implémente les patterns ARIA définis par WAI-ARIA 1.1 : les dialogues gèrent le focus trap, les menus déroulants gèrent les touches fléchées, les onglets gèrent les conventions de navigation au clavier (Tab pour changer de focus, flèches pour changer d'onglet). Cette conformité est structurelle — elle ne peut pas être cassée accidentellement par un développeur qui modifie le composant.

La gestion du focus est l'aspect le plus critique de l'accessibilité dans les applications riches. Un utilisateur naviguant au clavier doit pouvoir entrer dans un dialogue, effectuer des actions, et revenir à l'élément déclencheur lorsque le dialogue se ferme — sans que le focus "disparaisse" dans le vide. Radix UI gère ce cycle de focus automatiquement, y compris pour les scénarios complexes : dialogue dans un dialogue, fermeture programmatique, fermeture par touche Escape.

L'application respecte les critères WCAG 2.1 du W3C au niveau AA.

**Composants accessibles nativement**

L'utilisation de Radix UI et shadcn/ui garantit une conformité ARIA sans effort manuel :
- Attributs `role`, `aria-label`, `aria-expanded`, `aria-selected` générés automatiquement par les primitives Radix.
- Navigation clavier Tab/Escape/flèches fonctionnelle sur les dialogues, menus déroulants, onglets et sélecteurs.
- Gestion du focus dans les dialogues modaux (focus trap) conforme WCAG 2.1 critère 2.4.3.
- Fermeture au touche Escape et click en dehors du composant.

**Contrastes et typographie**

La palette Tailwind CSS 4 utilisée respecte les ratios de contraste WCAG AA (≥ 4,5:1 pour le texte normal, ≥ 3:1 pour le texte de grande taille). Les niveaux de gris des éléments de formulaire désactivés sont ajustés pour rester lisibles.

**Images et médias**

Toutes les images informatives ont un attribut `alt` descriptif. Les images décoratives ont `alt=""` et `aria-hidden="true"`. Le logo Yallo dans le header possède un `alt` explicite.

**Formulaires**

Tous les champs de formulaire sont associés à leur label via `htmlFor` / `id`. Les messages d'erreur de validation sont liés aux champs via `aria-describedby`. Les boutons de soumission ont un texte visible descriptif.

**Audit Lighthouse**

Un audit Lighthouse régulier est effectué en développement :
- Score Accessibilité cible : > 90
- Score Performance cible : > 80
- Éléments contrôlés : contraste des textes, labels des formulaires, attributs ARIA, ordre de tabulation.

**Critères WCAG 2.1 contrôlés**

| Critère WCAG | Niveau | Implémentation | Contrôle |
|---|---|---|---|
| 1.1.1 — Non-text Content | A | `alt` sur toutes les images informatives, `alt=""` sur les décoratives | Audit Lighthouse |
| 1.3.1 — Info and Relationships | A | Balises HTML sémantiques (`<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`) | Inspection manuelle |
| 1.4.3 — Contrast Minimum | AA | Ratio ≥ 4,5:1 sur le texte normal | Extension Wave |
| 2.1.1 — Keyboard | A | Tous les composants Radix UI navigables au clavier | Test clavier |
| 2.1.2 — No Keyboard Trap | A | Dialogues Radix UI avec focus trap correct et libération Escape | Test clavier |
| 2.4.3 — Focus Order | A | Ordre logique de tabulation dans les formulaires | Test Tab |
| 2.4.7 — Focus Visible | AA | Indicateurs de focus visibles sur tous les éléments interactifs | Test clavier |
| 3.1.1 — Language of Page | A | `lang="fr"` sur tous les layouts HTML | Inspection manuelle |
| 3.3.1 — Error Identification | A | Messages d'erreur liés aux champs via `aria-describedby` | Inspection manuelle |
| 4.1.2 — Name, Role, Value | A | Attributs ARIA générés automatiquement par Radix UI | Audit Lighthouse |

---

### K. Versioning

Le projet applique une stratégie de branches stricte basée sur Git Flow simplifié. Cette stratégie garantit que la branche `main` contient toujours un code déployable en production, que les expérimentations n'impactent pas le reste de l'équipe, et que chaque déploiement est traçable jusqu'à un commit précis.

La séparation entre `develop` et `main` permet d'avoir deux états de l'application actifs simultanément : la version de staging (sur `develop`, accessible en preview Vercel) pour la validation fonctionnelle, et la version de production (sur `main`) pour les utilisateurs finaux. Cette séparation est particulièrement utile pour tester les intégrations avec les services externes (ElevenLabs, Stripe) dans un environnement isolé avant de les mettre en production.

Les conventions de nommage des branches suivent un pattern simple mais expressif : `feature/nom-descriptif` pour les nouvelles fonctionnalités, `fix/description-du-bug` pour les corrections, `chore/tâche-technique` pour les opérations de maintenance (mise à jour de dépendances, configuration CI, refactoring). Ce nommage permet d'identifier immédiatement le type et le sujet de chaque branche dans l'interface GitHub.

**Stratégie de branches**

| Branche | Déclencheur | Pipeline | Cible de déploiement |
|---|---|---|---|
| `feature/xxx` | Développement quotidien | Aucun | Local uniquement |
| `develop` | Merge de feature | `staging.yml` (validate + sonarcloud + deploy-staging) | Vercel staging |
| `main` | Merge depuis develop | `ci.yml` (lint + test + sonarcloud + build + security + deploy-prod) | Vercel production |

**Cycle de vie d'une fonctionnalité**

1. Création d'une branche `feature/nom-feature` depuis `develop`
2. Développement et tests locaux
3. Pull Request vers `develop` — revue de code
4. Merge sur `develop` → déploiement staging automatique
5. Validation fonctionnelle sur l'URL staging Vercel
6. Pull Request vers `main` — validation finale
7. Merge sur `main` → déploiement production automatique

**Versioning du schéma de base de données**

Les 25 migrations Drizzle versionnées de `0000_gifted_guardian.sql` à `0024_add_elevenlabs_agent.sql` tracent l'intégralité de l'évolution du schéma. Chaque migration est irréversible et numérotée séquentiellement. Un `drizzle.config.ts` configure la connexion et le dossier de sortie.

| Migration | Description |
|---|---|
| 0000 | Tables initiales users, restaurants |
| 0001–0003 | Ajout orders, orderItems |
| 0004 | Tables admin CRM restaurants |
| 0005 | Ajout billingStartDate |
| 0011 | Ajout kitchenStatus enum |
| 0012 | Remplacement tables menu par colonne menuData JSONB |
| 0016 | Ajout pricingPlans |
| 0022 | Ajout champs Stripe subscription |
| 0023 | Ajout authUserId, suppression password |
| 0024 | Ajout champs ElevenLabs agent |

**Rollback**

En cas d'incident post-déploiement, deux mécanismes sont disponibles :
- **Vercel** : rollback instantané vers le déploiement précédent depuis le tableau de bord Vercel (ou via `vercel rollback`).
- **Git** : revert du commit de merge sur `main` + nouveau pipeline.

---

### L. Optimisations et performance

La performance d'une application web est mesurée à deux niveaux distincts : les performances perçues par l'utilisateur (temps de chargement initial, réactivité des interactions) et les performances techniques (taille des bundles JavaScript, temps de réponse des APIs, fréquence des appels en base de données).

Dans Yallo, les optimisations de performance sont principalement structurelles — elles découlent des choix d'architecture plutôt que de micro-optimisations tardives. Le principe directeur est le suivant : exécuter le plus de calcul possible côté serveur (moins de JavaScript au client, moins de round-trips réseau) et ne mettre en cache que ce qui change rarement.

Le modèle de composants serveurs de Next.js App Router transforme fondamentalement la façon dont la performance est abordée. Dans une application React classique (SPA), le serveur ne sert qu'un fichier HTML vide et un bundle JavaScript volumineux. Le navigateur télécharge ce bundle, l'exécute, puis effectue des appels API pour récupérer les données — ce qui résulte en une page blanche pendant plusieurs secondes pour les utilisateurs lents. Avec les Server Components, le serveur envoie du HTML déjà rendu avec les données incluses — le premier rendu est immédiat, et le JavaScript envoyé au client ne contient que les parties interactives.

Next.js 16 App Router offre nativement les outils pour optimiser les performances. Voici les patterns appliqués dans Yallo.

#### 1. Composants Serveurs par défaut

Tous les composants sont des React Server Components par défaut dans App Router. Un composant n'utilise le directive `"use client"` que lorsqu'il a besoin d'une interactivité côté client (useState, useEffect, formulaires contrôlés, event handlers). Cela réduit le bundle JavaScript envoyé au navigateur.

| Type de composant | Marqueur | Exemples dans Yallo |
|---|---|---|
| Server Component | (aucun) | Pages du dashboard, layout, listes de commandes |
| Client Component | `"use client"` | Formulaires de configuration, composants avec état local, updates optimistes |
| Server Action | `"use server"` | Toutes les mutations de données (actions dans `features/`) |

#### 2. Revalidation du cache

Les Server Actions appellent `revalidatePath()` de Next.js après chaque mutation pour invalider le cache des pages affectées :

```typescript
import { revalidatePath } from "next/cache";

export async function updateKitchenStatus(status: KitchenStatus) {
  const user = await requireAuth();
  // ...écriture en DB...
  revalidatePath("/dashboard");        // Revalide le dashboard
  revalidatePath("/dashboard/orders"); // Revalide la liste des commandes
}
```

Ce mécanisme garantit que les données affichées restent fraîches sans rechargement manuel de page.

#### 3. Streaming et chargement progressif

Les pages du dashboard utilisent des composants `<Suspense>` pour afficher les données progressivement. Les éléments critiques (header, navigation) sont rendus immédiatement, tandis que les listes de données (commandes, menu) arrivent en streaming via les Server Components.

#### 4. Optimisation des images

`next/image` est utilisé pour toutes les images de l'application avec :
- Redimensionnement automatique selon le viewport
- Format WebP servi aux navigateurs compatibles
- Lazy loading automatique pour les images hors écran
- Placeholder LQIP (low quality image placeholder)

#### 5. Bundle JavaScript

L'utilisation maximale de Server Components réduit significativement le JavaScript envoyé au client. L'analyse du bundle avec `@next/bundle-analyzer` permet de visualiser la taille des chunks client et d'identifier les dépendances lourdes.

---

### M. Architecture des intégrations externes

L'architecture des intégrations externes est l'une des parties les plus complexes de Yallo. L'application dépend de cinq services tiers (ElevenLabs, Twilio, HubRise, Resend, OpenAI) dont chacun peut être indisponible, renvoyer une erreur inattendue, ou changer son API. La philosophie adoptée pour la gestion de ces intégrations est la **résilience par isolation** : chaque intégration est encapsulée dans un service dédié, avec une politique de fallback explicite. Un service externe qui échoue ne doit pas faire échouer l'opération principale si ce service n'est pas critique au chemin principal.

Cette approche se traduit par un principe qui revient dans plusieurs parties du code : "skip silencieux si non configuré". Par exemple, si un restaurant n'a pas configuré HubRise (`hubRiseAccountId` est null), l'envoi de commande vers HubRise est silencieusement ignoré. Cela permet d'ajouter progressivement les intégrations à chaque restaurant sans rendre l'application dépendante de la configuration complète de tous les services.

La gestion des erreurs des services externes est structurée selon leur criticité. ElevenLabs est critique (sans agent, le service de commande vocale ne fonctionne pas) — les erreurs ElevenLabs sont loguées avec Sentry et bloquent l'opération. HubRise est optionnel (la commande est créée dans Yallo même si HubRise échoue) — les erreurs HubRise sont loguées mais ne bloquent pas. Resend est optionnel (l'email de bienvenue est cosmétique) — les erreurs Resend sont silencieuses.

#### 1. ElevenLabs — Création et cycle de vie d'un agent

La création d'un agent ElevenLabs pour un restaurant est l'opération la plus complexe de l'application car elle implique trois services en cascade (ElevenLabs, Twilio, base de données) avec une logique de rollback si l'un d'eux échoue. Cette complexité est inhérente à la nature de l'intégration : ElevenLabs crée l'agent, mais Twilio fournit le numéro de téléphone. Ces deux systèmes doivent être liés pour que l'agent soit opérationnel. Si la liaison Twilio échoue après la création de l'agent, un agent orphelin existerait dans ElevenLabs sans jamais être utilisé — d'où la logique de rollback (delete de l'agent) en cas d'échec de l'import Twilio.

**Séquence de création :**

```
Admin demande la création de l'agent
    ↓
[1] Vérification du prérequis : restaurant.twilioPhoneNumber doit être renseigné
    → Si absent : throw new Error("Numéro Twilio manquant")
    ↓
[2] Appel createAgent(restaurant) → ElevenLabs API
    → Crée l'agent avec le menu, les horaires, le nom du restaurant
    → Retourne { agent_id: "..." }
    ↓
[3] Appel importTwilioPhoneNumber(agentId, twilioPhoneNumber) → ElevenLabs API
    → Importe le numéro Twilio dans l'agent ElevenLabs
    → En cas d'échec :
        → deleteAgent(agentId) → rollback
        → throw new Error("Import numéro Twilio échoué")
    ↓
[4] Écriture en DB : restaurants.elevenLabsAgentId + restaurants.elevenLabsPhoneNumberId
    ↓
[5] revalidatePath("/admin/restaurants/[id]")
```

Ce pattern de rollback (BUG-07) garantit que la base de données ne contient jamais un agentId orphelin (agent créé dans ElevenLabs mais sans numéro Twilio associé).

**Service `elevenlabs-agent.ts` — méthodes exposées :**

| Méthode | Description | Appel API |
|---|---|---|
| `createAgent(restaurant)` | Crée l'agent avec le contexte du restaurant | POST /v1/convai/agents/create |
| `updateAgent(agentId, restaurant)` | Synchronise le menu et les horaires | PATCH /v1/convai/agents/{agentId} |
| `deleteAgent(agentId)` | Supprime l'agent | DELETE /v1/convai/agents/{agentId} |
| `importTwilioPhoneNumber(agentId, number)` | Lie le numéro Twilio à l'agent | POST /v1/convai/twilio/import |
| `getAgent(agentId)` | Récupère la configuration actuelle | GET /v1/convai/agents/{agentId} |

#### 2. HubRise — Synchronisation avec le logiciel de caisse

HubRise est une middleware B2B permettant de connecter des applications tierces aux logiciels de caisse (Lightspeed, Zelty, Obypay, etc.). Cette couche d'abstraction est précieuse pour Yallo : plutôt qu'implémenter une intégration directe avec chaque logiciel de caisse (ce qui nécessiterait de maintenir autant d'intégrations qu'il y a de logiciels), Yallo intègre une seule fois HubRise et bénéficie de toutes les connexions de caisse que HubRise supporte.

La décision de ne pas bloquer en cas d'erreur HubRise reflète une hiérarchie des priorités : la commande du client doit toujours être enregistrée, même si le logiciel de caisse n'est pas disponible. Le restaurateur peut voir la commande dans l'interface Yallo et la traiter manuellement si HubRise est indisponible. L'inverse (commande arrivée en caisse mais pas dans Yallo) serait pire pour la traçabilité.

L'intégration Yallo/HubRise se décompose en deux fonctionnalités :

- **Import du catalogue** : récupère la carte HubRise du restaurant et la convertit en `MenuData` Yallo
- **Push des commandes** : envoie chaque commande vocale acceptée vers HubRise, qui la transmet ensuite au logiciel de caisse

```typescript
// Flux push d'une commande vers HubRise (simplifié)
export async function pushVoiceOrderToHubrise(
  restaurant: Restaurant,
  order: Order,
  items: OrderItem[]
): Promise<void> {
  if (!restaurant.hubRiseAccountId) return; // Pas configuré = skip silencieux
  const hubRiseOrder = formatOrderForHubRise(order, items);
  await fetch(`${HUBRISE_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getHubRiseToken(restaurant)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hubRiseOrder),
  });
}
```

Le `pushVoiceOrderToHubrise` est appelé dans le handler webhook ElevenLabs, après la création de la commande en base de données. Un échec HubRise ne fait pas échouer le webhook — la commande est créée dans Yallo même si HubRise est temporairement indisponible.

#### 3. Resend — Emails transactionnels

Resend est un service d'envoi d'emails transactionnels qui remplace les solutions historiques (SendGrid, Mailgun) avec une API plus moderne et une meilleure deliverability. Dans Yallo, Resend est utilisé pour les notifications automatiques liées aux événements clés du cycle de vie utilisateur et au formulaire de contact marketing.

La politique de sécurité pour Resend est stricte : la clé API `RESEND_API_KEY` est une variable d'environnement serveur uniquement. Elle n'est jamais exposée au navigateur (pas de `NEXT_PUBLIC_` prefix). Tous les envois d'emails passent par des Server Actions ou des routes API — jamais directement depuis le client.

| Événement | Template | Destinataire |
|---|---|---|
| Création de compte | Email de bienvenue avec lien de vérification | Nouvel utilisateur |
| Oubli de mot de passe | Email de réinitialisation avec lien temporaire | Utilisateur |
| Formulaire de contact | Notification à l'équipe Yallo | Équipe interne |

#### 4. OpenAI — Parsing de menu par reconnaissance d'images

L'intégration OpenAI est l'une des fonctionnalités les plus innovantes de Yallo. Plutôt que d'obliger le restaurateur à saisir manuellement son menu (ce qui peut prendre plusieurs heures pour une carte complexe), Yallo propose d'importer le menu depuis des photos. Le restaurateur photographie les pages de sa carte, les télécharge dans Yallo, et l'IA génère automatiquement la structure `MenuData`.

GPT-4o avec vision a été choisi pour sa capacité à comprendre des mises en page complexes (colonnes, tableaux, descriptions mélangées aux prix) dans les photos de menus de restaurant. La limite de 5 images par import est volontairement conservatrice — elle équilibre coût API (chaque image est facturée par token d'input) et flexibilité (une carte de restaurant tient généralement en moins de 5 pages).

La validation Zod du résultat GPT-4o est une couche de sécurité cruciale. Les modèles de langage peuvent halluciner ou générer du JSON mal formé. Sans validation, un résultat GPT-4o mal formé pourrait corrompre le `menuData` du restaurant. Avec la validation Zod, si GPT-4o retourne un JSON invalide, la fonction lève une erreur explicite plutôt que de stocker des données corrompues.

Le service `src/lib/services/menu-parser.ts` encapsule l'appel à GPT-4o Vision :

```typescript
export async function parseMenuFromBase64Images(
  images: string[]
): Promise<MenuData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: MENU_PARSING_PROMPT },
          ...images.map((img) => ({
            type: "image_url" as const,
            image_url: { url: `data:image/jpeg;base64,${img}` },
          })),
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  // Parsing et validation Zod du résultat
  return menuDataSchema.parse(JSON.parse(response.choices[0].message.content!));
}
```

Le prompt `MENU_PARSING_PROMPT` demande à GPT-4o d'extraire la structure du menu (catégories, produits, prix, options) depuis les photos, et de la retourner en JSON conforme au schéma `MenuData`. Le résultat est ensuite validé par Zod avant d'être retourné à l'utilisateur.

---

### N. Gestion des erreurs et observabilité

La gestion des erreurs dans une application en production n'est pas un détail technique — c'est une compétence opérationnelle qui détermine la capacité à diagnostiquer rapidement les incidents et à maintenir un service de qualité. Dans Yallo, la stratégie de gestion des erreurs a été conçue pour répondre à deux exigences contradictoires : ne jamais exposer d'informations techniques sensibles aux utilisateurs finaux (sécurité), tout en capturant suffisamment de contexte pour permettre le diagnostic rapide des incidents (observabilité).

Cette tension entre sécurité et observabilité se résout par le principe de **la double sortie** : les erreurs techniques complètes (stack trace, message de la base de données, identifiant de ressource) sont envoyées à Sentry pour l'équipe technique, tandis que le message retourné à l'utilisateur est un message générique non technique. Un utilisateur qui reçoit "Une erreur est survenue" ne sait rien du stack trace sous-jacent — ce qui protège à la fois la sécurité (pas d'information exploitable pour un attaquant) et l'expérience utilisateur (un message technique incompréhensible est pire qu'un message générique).

La classification des erreurs dans Yallo distingue trois catégories avec des traitements différents. Les **erreurs de validation** (ZodError, données manquantes) sont des erreurs "attendues" — elles indiquent que l'utilisateur a fourni des données incorrectes. Elles sont retournées comme `{ success: false, error: "Message explicite pour l'utilisateur" }` sans être envoyées à Sentry, car elles ne représentent pas un dysfonctionnement. Les **erreurs d'accès** (requireAuth lève une exception, ownership mismatch) sont des erreurs "de sécurité" — elles peuvent indiquer une tentative d'abus. Elles sont loguées avec contexte (userId, ressource tentée) et transmises à Sentry pour une alerte potentielle. Les **erreurs techniques** (base de données inaccessible, service externe en erreur) sont des erreurs "de système" — elles nécessitent une intervention immédiate. Elles sont envoyées à Sentry avec le contexte complet et génèrent une alerte.

#### 1. Stratégie de gestion des erreurs

La gestion des erreurs dans Yallo suit une stratégie à deux niveaux :

- **Niveau Server Action** : les erreurs sont capturées et retournées sous forme d'`ActionResult` — jamais propagées au client sous forme de stack trace.
- **Niveau Route API** : les erreurs sont loguées avec contexte et retournent des codes HTTP standardisés.

```typescript
// Pattern de gestion d'erreur dans une Server Action
export async function updateBusinessHours(formData: FormData) {
  try {
    const user = await requireAuth();
    const rawData = JSON.parse(formData.get("hours") as string);
    const validated = businessHoursSchema.parse(rawData);
    await db.update(restaurants)
      .set({ businessHours: JSON.stringify(validated) })
      .where(eq(restaurants.ownerId, user.id));
    revalidatePath("/dashboard/hours");
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "Format d'horaires invalide" };
    }
    logger.error("updateBusinessHours failed", { error, userId: user?.id });
    return { success: false, error: "Une erreur est survenue" };
  }
}
```

Règle : les erreurs techniques (stack trace, message Drizzle, clé API) ne remontent jamais dans la réponse retournée au client. Seuls des messages génériques et non-techniques sont exposés.

#### 2. Sentry — Configuration multi-runtime

Sentry est l'outil de monitoring d'erreurs central de l'application. Sa configuration sur trois runtimes simultanés est une particularité de Next.js avec Vercel : le code s'exécute dans trois environnements différents (Edge, Serverless Node.js, navigateur), et chacun nécessite sa propre initialisation Sentry avec les APIs adaptées à l'environnement.

La configuration `sendDefaultPii: false` est un paramètre critique du point de vue RGPD. "PII" signifie "Personally Identifiable Information" — données d'identification personnelle. Avec cette option activée, Sentry ne transmet jamais les cookies de session (qui pourraient permettre d'usurper une session), les adresses IP (données personnelles en Europe), ni les en-têtes HTTP (qui pourraient contenir des tokens). Les erreurs sont ainsi anonymisées par conception.

Sentry est configuré sur les trois runtimes Next.js :

| Fichier | Runtime | Rôle |
|---|---|---|
| `sentry.server.config.ts` | Node.js (Server Actions, API routes) | Capture les erreurs serveur |
| `sentry.edge.config.ts` | Vercel Edge (middleware) | Capture les erreurs middleware |
| `instrumentation-client.ts` | Browser | Capture les erreurs client React |
| `instrumentation.ts` | Next.js init | `onRequestError = Sentry.captureRequestError` |

La configuration commune à tous les runtimes :

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: false,       // Jamais de cookies, headers, IPs
  tracesSampleRate: 0.1,       // 10% des transactions tracées
  environment: process.env.VERCEL_ENV ?? "development",
});
```

`sendDefaultPii: false` est le paramètre le plus important d'une perspective RGPD : aucun cookie, aucune adresse IP, aucun header HTTP n'est envoyé à Sentry. Les erreurs sont anonymisées.

#### 3. Rate limiting — Protection des endpoints critiques

Le rate limiting est implémenté dans `src/lib/rate-limit.ts` pour protéger les endpoints qui ne bénéficient pas du rate limiting natif de Supabase. Les webhooks ElevenLabs et Stripe sont les cibles principales : ils sont accessibles publiquement et reçoivent des données externes.

```typescript
// src/lib/rate-limit.ts
const rateLimitMap = new Map<string, RateLimitRecord>();

export function rateLimit(
  ip: string,
  maxRequests = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true; // Autorisé
  }
  
  if (record.count >= maxRequests) {
    return false; // Refusé
  }
  
  record.count++;
  return true; // Autorisé
}
```

La limite de 10 requêtes par 60 secondes est calibrée pour les cas d'usage légitimes des webhooks. Un agent ElevenLabs ne fait jamais plus de 1-2 appels webhook par appel téléphonique — la limite de 10 est donc très confortable pour un usage normal, mais bloque efficacement les tentatives de flooding.

**Limitation documentée** : ce rate limiter est stocké en mémoire JavaScript et n'est pas partagé entre les instances Vercel serverless. La mitigation pour la V2 est documentée dans les axes d'amélioration.

**Contenu des 25 migrations Drizzle**

Les migrations Drizzle constituent un journal complet et immuable de l'évolution du schéma de base de données. Chaque migration est un document historique qui répond à deux questions : quelle modification de schéma a été apportée, et pourquoi. La numérotation séquentielle garantit l'ordre d'application ; les noms descriptifs (bien que générés automatiquement pour certains) donnent une indication du contexte.

L'analyse de la séquence des migrations révèle l'évolution des besoins du projet. Les premières migrations (0000-0003) posent les fondations : les tables principales et les énumérations. Les migrations 0004-0006 enrichissent les attributs métier (CRM, facturation, noms d'utilisateurs). Les migrations 0007-0015 reflètent des expérimentations et des changements de cap : tentative d'une structure menu en tables relationnelles (0009), puis abandon au profit de JSONB (0012) ; ajout d'un modèle de pricing (0016) puis suppression (0017, 0019). Les migrations finales (0022-0024) reflètent les intégrations tardives : Stripe (0022), migration vers Supabase Auth (0023), ElevenLabs (0024).

Cette évolution visible dans les migrations illustre une réalité du développement produit : les décisions d'architecture évoluent à mesure que les besoins se précisent. La capacité à effectuer des migrations backward-compatible et à maintenir la cohérence des données pendant ces évolutions est une compétence technique avancée.

| Numéro | Fichier | Contenu |
|---|---|---|
| 0000 | `gifted_guardian` | Création tables `users` et `restaurants`, enum `userRole` |
| 0001 | `worried_lockheed` | Index sur `restaurants.ownerId` |
| 0002 | `clever_pepper_potts` | Ajout `restaurants.isActive` (boolean) |
| 0003 | `orders_tables` | Création tables `orders` et `orderItems`, enums `orderStatus` |
| 0004 | `admin_crm_restaurants` | Ajout colonnes CRM (address, phoneNumber, status) |
| 0005 | `add_billing_start_date` | Ajout `restaurants.billingStartDate` |
| 0006 | `add_user_names` | Ajout `users.firstName` et `users.lastName` |
| 0007 | `add_pricing_config` | Ajout colonne `pricingConfig` JSON |
| 0008 | `dizzy_mantis` | Index supplémentaires |
| 0009 | `add_is_available_to_variations` | Colonne `isAvailable` sur les options menu |
| 0010 | `remove_image_url` | Suppression `imageUrl` des ingrédients |
| 0011 | `add_kitchen_status` | Enum `kitchenStatus` + colonne `currentStatus` + `statusSettings` JSONB |
| 0012 | `remove-menu-tables-add-menudata` | Suppression tables menu, ajout colonne `menuData` JSONB |
| 0013 | `remove-hubrise-catalog-cache` | Suppression cache catalogue HubRise |
| 0014 | `remove-forwarding-phone-number` | Nettoyage colonne forwarding |
| 0015 | `loud_molecule_man` | Refactoring index |
| 0015b | `remove-slug` | Suppression colonne `slug` des restaurants |
| 0016 | `add_pricing_plans` | Ajout table `pricingPlans` |
| 0016b | `melodic_sunset_bain` | Ajout contraintes FK |
| 0017 | `remove_pricing_config` | Suppression `pricingConfig` |
| 0018 | `add_vapi_phone_number_id` | Ajout `twilioPhoneNumber` sur restaurants |
| 0019 | `drop_pricing_plans` | Suppression table `pricingPlans` |
| 0020 | `add_vapi_structured_output_ids` | Ajout IDs de sortie structurée VAPI |
| 0021 | `add_hubrise_catalog_id` | Ajout `hubRiseAccountId` |
| 0022 | `add_stripe_subscription_fields` | Ajout `stripeCustomerId`, `stripeSubscriptionId` |
| 0023 | `add_auth_user_id_remove_password` | Ajout `authUserId`, suppression `password` (migration vers Supabase Auth) |
| 0024 | `add_elevenlabs_agent` | Ajout `elevenLabsAgentId` + `elevenLabsPhoneNumberId` |

La migration 0023 est particulièrement notable : elle documente la migration architecturale qui a déplacé la gestion des mots de passe hors de l'application vers Supabase Auth. La colonne `password` a été supprimée et remplacée par `authUserId` (référence externe). Cette migration est irréversible et constitue une amélioration majeure de la posture de sécurité.

La migration 0012 illustre la décision d'abandonner une structure relationnelle (plusieurs tables pour les catégories, produits et options du menu) au profit d'un stockage JSONB. Cette décision a été motivée par l'observation que les requêtes sur le menu étaient toujours des lectures/écritures en bloc — jamais des requêtes partielles comme "donne-moi tous les produits de la catégorie Pizzas". Lorsque les données ne sont jamais interrogées partiellement, JSONB est plus simple et plus performant qu'un modèle relationnel normalisé.

---

## IV. Recettes de fonctionnalités

La phase de recette est une étape essentielle du cycle de développement logiciel. Elle correspond à la validation formelle des fonctionnalités développées avant leur livraison en production. Dans un contexte agile, la recette s'effectue idéalement de manière continue — à chaque fonctionnalité terminée — plutôt qu'en une seule phase terminale. Pour Yallo, deux types de recettes ont été appliquées : les recettes automatisées (les 190 tests Vitest exécutés à chaque push) et les recettes manuelles (les scénarios documentés dans ce cahier de recettes, exécutés sur l'environnement staging avant chaque déploiement en production).

La distinction entre recette automatisée et recette manuelle n'est pas une question de préférence — c'est une question de ce qui peut être automatisé. Les tests unitaires vérifient la logique des Server Actions en isolation complète. Ils ne peuvent pas vérifier l'expérience utilisateur réelle (l'interface s'affiche-t-elle correctement ? Le message d'erreur est-il compréhensible ?), les comportements cross-service (ElevenLabs → webhook → DB → SMS → UI), ni les cas d'usage que le développeur n'aurait pas anticipés. La recette manuelle complète les tests automatisés sur ces dimensions.

Le format du cahier de recettes adopté dans ce dossier s'inspire des pratiques de test agile : chaque recette est définie par un identifiant unique (permettant la traçabilité), un module, un acteur, une intention utilisateur (user story), et un résultat attendu précis. Cette structure permet à n'importe quel testeur (pas seulement le développeur) d'exécuter les recettes et de vérifier les résultats de façon reproductible.

### A. Cahier de recettes

> **C2.3.1 — Élaborer le cahier de recettes**
>
> J'ai rédigé un cahier de recette couvrant les scénarios fonctionnels (parcours utilisateurs), techniques (Server Actions et réponses attendues) et de sécurité (contrôles OWASP) pour l'ensemble des modules de la V1. L'objectif est de détecter les anomalies et les régressions avant toute mise en production.

Le cahier de recettes est le document de référence pour la validation d'une version avant déploiement. Il traduit les spécifications fonctionnelles et les exigences de sécurité en scénarios de test exécutables, avec pour chacun un résultat attendu précis. Ce document est utilisé aussi bien en phase de développement (pour vérifier manuellement les fonctionnalités) qu'en phase de recette (pour valider avec un testeur externe ou un client).

La structuration en trois familles de recettes correspond à trois types de préoccupations distinctes. Les recettes fonctionnelles valident les parcours utilisateurs — elles répondent à la question "l'utilisateur peut-il faire ce qu'on lui a promis ?". Les recettes techniques valident les comportements des Server Actions — elles répondent à "le code se comporte-t-il correctement face à des inputs inhabituels ?". Les recettes de sécurité valident les contrôles OWASP — elles répondent à "est-ce que les protections en place résistent aux scénarios d'abus ?".

L'organisation selon les niveaux de criticité permet de prioriser l'exécution des recettes : les recettes bloquantes (RF-01, RT-01, RS-01) sont exécutées en premier ; les recettes de régression (RF-09, RT-07) sont exécutées après chaque modification du module concerné.

Le cahier de recettes a pour objectif de valider l'ensemble des fonctionnalités via des scénarios de test couvrant :
- les parcours utilisateurs (fonctionnel)
- les Server Actions et leurs réponses (technique)
- les contrôles de sécurité (OWASP)

**Recette Fonctionnelle**

Les recettes fonctionnelles sont organisées par module et par acteur (Visiteur, OWNER, ADMIN, Client). Chaque recette suit le format "Je veux... / Afin de..." (user story) pour maintenir la perspective utilisateur.

| Réf. | Module | Acteur | Je veux... | Afin de... | Statut attendu |
|---|---|---|---|---|---|
| RF-01 | Authentification | Visiteur | Me connecter avec mon email et mot de passe | Accéder à mon dashboard | Redirection `/dashboard` |
| RF-02 | Authentification | Visiteur | Me connecter avec un mauvais mot de passe | — | Message d'erreur, pas de redirection |
| RF-03 | Dashboard | OWNER | Voir mes commandes en cours | Gérer ma cuisine | Liste des commandes actives |
| RF-04 | Commandes | OWNER | Passer une commande de `NEW` à `PREPARING` | Informer la cuisine | Statut mis à jour, liste rechargée |
| RF-05 | Commandes | OWNER | Passer une commande de `PREPARING` à `READY` | Informer le client | Statut mis à jour |
| RF-06 | Statut cuisine | OWNER | Changer le statut cuisine en `RUSH` | Informer l'agent vocal | Statut `RUSH` enregistré |
| RF-07 | Statut cuisine | OWNER | Mettre le restaurant en `STOP` | Bloquer les nouvelles commandes | Agent vocal refuse les commandes |
| RF-08 | Menu | OWNER | Uploader une photo de ma carte | Générer le menu automatiquement | MenuData structuré retourné |
| RF-09 | Menu | OWNER | Uploader 6 photos | — | Erreur "Maximum 5 images autorisées" |
| RF-10 | Menu | OWNER | Sauvegarder mon menu | Que l'agent vocal le connaisse | Données persistées en DB |
| RF-11 | Horaires | OWNER | Configurer mes horaires du lundi | Que l'agent connaisse mes ouvertures | Horaires sauvegardés |
| RF-12 | Billing | OWNER | Accéder à la page de facturation | Gérer mon abonnement | Page billing affichée avec statut Stripe |
| RF-13 | Admin | ADMIN | Créer un nouveau restaurant | Onboarder un client | Restaurant créé, owner associé |
| RF-14 | Admin | ADMIN | Créer un agent ElevenLabs | Activer la commande vocale | Agent créé, agentId stocké en DB |
| RF-15 | Agent vocal | Client | Appeler le numéro du restaurant | Passer une commande | Commande créée, SMS de confirmation envoyé |
| RF-16 | Agent vocal | Client | Appeler pendant le statut `STOP` | — | Agent refuse, aucune commande créée |

**Recette Technique**

Les recettes techniques testent les comportements des Server Actions et des API Routes en dehors du parcours nominal — données invalides, droits insuffisants, conditions aux limites. Ce sont les tests les plus précieux pour éviter les régressions lors des refactors.

| Réf. | Module | Server Action | Scénario | Résultat attendu |
|---|---|---|---|---|
| RT-01 | Auth | `requireAuth()` | Session valide | User retourné |
| RT-02 | Auth | `requireAuth()` | Session expirée | `throw new Error("Non autorisé")` |
| RT-03 | Auth | `requireAdmin()` | User avec rôle `OWNER` | `throw new Error("Non autorisé")` |
| RT-04 | Commandes | `updateOrderStatus()` | orderId d'un autre restaurant | Erreur 403 / Restaurant non trouvé |
| RT-05 | Commandes | `updateOrderStatus()` | Statut valide | `{success: true}` + revalidation |
| RT-06 | Menu | `generateMenuFromImages()` | 0 images | `{success: false, error: "Aucune image fournie"}` |
| RT-07 | Menu | `generateMenuFromImages()` | 6 images | `{success: false, error: "Maximum 5 images autorisées"}` |
| RT-08 | Webhook | `POST /api/elevenlabs/webhook` | Secret header manquant en prod | HTTP 401 |
| RT-09 | Webhook | `POST /api/elevenlabs/webhook` | Statut STOP du restaurant | Commande rejetée, réponse explicite |
| RT-10 | Stripe | `POST /api/stripe/webhook` | Signature invalide | HTTP 400 |
| RT-11 | Kitchen Status | `updateKitchenStatus()` | Valeur hors enum | `throw new Error("Statut invalide")` |
| RT-12 | Hours | `updateBusinessHours()` | JSON malformé | `{success: false, error: "Format invalide"}` |

**Recette Sécurité (OWASP Top 10)**

Les recettes de sécurité reproduisent des scénarios d'attaque ou d'abus pour vérifier que les protections en place résistent. Elles sont exécutées à chaque nouvelle release et après tout changement du middleware ou des Server Actions critiques.

| Réf. | OWASP | Scénario de test | Résultat attendu | Périmètre |
|---|---|---|---|---|
| RS-01 | A01 — Broken Access Control | OWNER tente d'accéder à `/admin` | Redirection `/dashboard` (307) | Middleware |
| RS-02 | A01 — Broken Access Control | Appel Server Action admin sans rôle ADMIN | `throw new Error("Non autorisé")` | Server Action |
| RS-03 | A01 — Broken Access Control | OWNER tente de modifier une commande d'un autre restaurant | `throw new Error("Restaurant non trouvé")` | Server Action |
| RS-04 | A02 — Cryptographic Failures | Webhook ElevenLabs sans secret header en production | HTTP 401 Unauthorized | Route API |
| RS-05 | A02 — Cryptographic Failures | Webhook Stripe avec signature forgée | HTTP 400 Bad Request | Route API |
| RS-06 | A03 — Injection | Payload Zod avec champ supplémentaire injecté | Champ ignoré par `.parse()` | Server Action |
| RS-07 | A05 — Security Misconfiguration | Requête HTTP (non HTTPS) | Redirection HTTPS via HSTS | En-têtes HTTP |
| RS-08 | A05 — Security Misconfiguration | Tentative d'embarquement de l'app dans une iframe | Bloqué par `X-Frame-Options: SAMEORIGIN` | En-têtes HTTP |
| RS-09 | A06 — Vulnerable Components | `pnpm audit --audit-level=high` | Aucune vulnérabilité high/critical | CI |
| RS-10 | A07 — Auth Failures | 11 requêtes en 60 secondes depuis la même IP | 11e requête retourne `false` (rate limitée) | `rate-limit.ts` |

---

### B. Plan de correction des bugs

> **C2.3.2 — Élaborer un plan de correction des bogues**
>
> J'ai rédigé un fichier de suivi permettant un suivi des bugs et relatant leur cause fonctionnelle et technique et les modalités de traitement. L'analyse des 7 derniers commits révèle une série de corrections concentrées sur le webhook ElevenLabs, documentées ci-dessous.

Un plan de correction des bugs structuré est indispensable dans un projet avec des dépendances à plusieurs services externes. Lorsqu'un bug implique Stripe, ElevenLabs, Twilio et la base de données Neon, identifier la cause racine nécessite une méthodologie rigoureuse : reproduction du bug en isolation, analyse des logs Sentry, identification du composant défaillant, correction ciblée, puis validation.

La priorisation des bugs repose sur leur impact métier plutôt que sur leur complexité technique. Un bug qui bloque la création de commandes vocales (BUG-01) est traité en priorité absolue même si sa correction est simple, car il rend la fonctionnalité centrale du produit inopérante. À l'inverse, un bug cosmétique sur l'interface admin peut attendre sans impacter les utilisateurs finaux.

La documentation de la cause technique est aussi importante que la correction elle-même. Elle permet de comprendre la classe du bug (mauvaise validation, mauvaise synchronisation d'état, condition manquante) et d'identifier si d'autres fonctionnalités similaires pourraient être affectées par le même type de défaut.

La prévention systématique par tests automatisés est la clé de la non-régression. Chaque bug corrigé doit générer un test qui aurait détecté le bug si il avait existé avant — c'est le principe du "test-driven bug fixing". Cette discipline garantit que le bug corrigé ne peut pas réapparaître silencieusement lors d'un refactoring futur.

Le plan de correction des bugs a pour but de :
- prioriser les anomalies selon leur impact
- identifier leur cause racine
- appliquer des correctifs durables
- éviter les régressions via des tests automatisés

**Structure du tableau de suivi**

Chaque bug renseigné comporte : date, déclarant, sévérité (Bloquant / Majeur / Mineur), impact métier, cause technique, conditions de reproduction, correction apportée, prévention mise en place, statut.

**Bugs réels tracés (série webhook ElevenLabs)**

| ID | Date | Sévérité | Impact métier | Cause technique | Correction | Prévention | Statut |
|---|---|---|---|---|---|---|---|
| BUG-01 | 05/2026 | Bloquant | Les commandes vocales ne s'enregistrent pas | `restaurantId` non transmis dans l'URL du webhook ElevenLabs | Ajout du `restaurantId` en query param de l'URL webhook lors de la création de l'agent | Test de bout en bout vérifiant la présence de `restaurantId` dans l'URL | Résolu |
| BUG-02 | 05/2026 | Majeur | Agent vocal silencieux sur les erreurs | Absence de logs structurés dans le handler webhook | Ajout de logs diagnostics avec contexte (restaurantId, payload reçu, erreur) | Logger obligatoire sur chaque branche d'erreur | Résolu |
| BUG-03 | 05/2026 | Majeur | Format du payload non reconnu | Structure JSON envoyée par ElevenLabs différente de la structure attendue | Normalisation du parsing du payload avec extraction flexible des arguments | Test unitaire avec plusieurs formats de payload | Résolu |
| BUG-04 | 05/2026 | Mineur | Mode strict bloquait en développement | `VERCEL_ENV` non défini en local faisait passer le webhook en mode strict | Condition ajustée : mode strict uniquement si `VERCEL_ENV === "production"` | Test d'intégration en environnement développement | Résolu |
| BUG-05 | 05/2026 | Majeur | Commandes créées sans items | `orderItems` vide si `args` mal normalisé | Ajout de validation de la liste d'items avant insertion | Test vérifiant que `orderItems.length > 0` avant création | Résolu |
| BUG-06 | 04/2026 | Mineur | Menu non transmis à l'agent après modification | `updateElevenLabsAgent` non appelé après sauvegarde du menu | Ajout de l'appel `updateElevenLabsAgent` dans `saveMenuData` | Test vérifiant la synchronisation après save | Résolu |
| BUG-07 | 04/2026 | Majeur | Numéro Twilio non lié à l'agent en cas d'échec | Absence de rollback sur l'agent créé si `importTwilioPhoneNumber` échoue | Transaction logicielle : si l'import Twilio échoue, suppression immédiate de l'agent ElevenLabs | Test vérifiant la suppression de l'agent en cas d'échec Twilio | Résolu |

### B. Documentation des API Routes

L'application expose deux API Routes publiques, utilisées exclusivement par des services tiers via webhooks.

| Méthode | Route | Service émetteur | Auth | Description |
|---|---|---|---|---|
| POST | `/api/elevenlabs/webhook` | ElevenLabs agent | Secret header `x-webhook-secret` | Réception d'une commande vocale |
| POST | `/api/stripe/webhook` | Stripe | Signature `Stripe-Signature` | Synchronisation de l'abonnement |

Toutes les autres mutations passent exclusivement par des Server Actions, qui ne sont pas accessibles via des URLs HTTP directes.

### C. Documentation du Middleware

Le fichier `middleware.ts` est le composant d'entrée de toute requête vers `app.yallo.fr`. Sa logique décide de la suite du traitement :

```typescript
// Pseudocode du middleware
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";

  // Domaine marketing → accès libre
  if (!hostname.startsWith("app.")) {
    return NextResponse.next();
  }

  // Domaine app → vérification de session
  const user = await getAppUser();

  // Non connecté → redirection login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ADMIN tente d'accéder au dashboard → redirection admin
  if (user.role === "ADMIN" && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // OWNER tente d'accéder à l'admin → blocage 403
  if (user.role === "OWNER" && request.nextUrl.pathname.startsWith("/admin")) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

Le `matcher` exclut les routes API et les assets statiques Next.js, ce qui évite que chaque requête de ressource statique passe par le middleware.

### D. Documentation du Déploiement

**Infrastructure de déploiement**

```
Repository GitHub (main branch)
    → GitHub Actions (ci.yml)
        → lint + test + sonarcloud + build + security
        → deploy: vercel --prod
            → Build Next.js (Vercel infrastructure)
                → Fonctions serveur : Serverless Functions (Node.js 20)
                → Edge Functions : Vercel Edge Network (middleware)
                → Assets statiques : CDN Vercel
                → Base de données : Neon PostgreSQL (externe)
```

**URLs des environnements**

| Environnement | URL | Déclencheur |
|---|---|---|
| Production | `app.yallo.fr` | Push sur `main` (ci.yml) |
| Staging | URL preview Vercel auto | Push sur `develop` (staging.yml) |
| Local | `localhost:3000` | `pnpm dev` |

**Checklist avant déploiement production**

- [ ] Tous les tests passent en local (`pnpm run test:run`)
- [ ] Build sans erreur (`pnpm run build`)
- [ ] Revue de code PR approuvée
- [ ] Migrations Drizzle vérifiées et testées sur staging
- [ ] Variables d'environnement à jour dans Vercel si nouvelles clés ajoutées
- [ ] Webhook ElevenLabs pointant vers la nouvelle URL production si nécessaire

---

## V. Documentation technique

La documentation technique est souvent traitée comme une obligation périphérique au développement, à rédiger "quand le code est prêt". Cette approche produit invariablement une documentation incomplète, rapidement obsolète, et peu utilisée. Dans Yallo, la documentation a été intégrée au processus de développement : chaque nouvelle configuration, chaque décision d'architecture et chaque intégration de service externe a été documentée au moment de son implémentation, pendant que le contexte était encore frais.

La documentation technique d'un projet fullstack couvre plusieurs audiences distinctes avec des besoins différents. Le **développeur qui reprend le projet** a besoin d'un guide pratique d'installation et de configuration (README). Le **développeur qui ajoute une fonctionnalité** a besoin des conventions de code et des patterns attendus (Guide du développeur). L'**opérateur qui gère les déploiements** a besoin des procédures de mise en production et de rollback (Guide de déploiement). L'**utilisateur final** a besoin d'un manuel qui explique comment utiliser l'interface (Manuel d'utilisation). La Section V couvre chacune de ces audiences.

Un autre aspect de la documentation technique est la traçabilité. Un projet logiciel génère en permanence des artefacts qui constituent une documentation implicite : les commits Git (chaque modification de code avec son contexte), les migrations de base de données (chaque évolution du schéma), les déploiements Vercel (chaque version mise en production), et les erreurs Sentry (chaque incident en production). Ces artefacts ne remplacent pas la documentation explicite, mais la complètent en fournissant un journal d'audit complet.

> **C2.4.1 — Rédiger la documentation technique d'exploitation**
>
> J'ai rédigé plusieurs guides pratiques directement dans le dépôt de code, pour que n'importe quel développeur puisse reprendre le projet sans avoir à demander d'aide. De la documentation complémentaire est accessible depuis le README principal.

### A. Organisation de la documentation

La documentation est structurée en plusieurs parties complémentaires :

- **README principal** : guide d'installation, configuration, exécution locale, exécution des tests et procédures de déploiement.
- **Documentation des migrations** : liste commentée des 25 migrations Drizzle avec description de chaque évolution de schéma.
- **Documentation des intégrations** : chaque service externe (ElevenLabs, Stripe, Twilio, HubRise, OpenAI) est documenté avec les prérequis de configuration et les variables d'environnement nécessaires.
- **Ce dossier Bloc 2** : documentation de conception pour le jury RNCP, couvrant architecture, sécurité, tests et CI/CD.

Les détails techniques complets sont intentionnellement centralisés dans le README pour maintenir un point d'entrée unique et éviter la dispersion de l'information.

### B. Guide du développeur

Le guide du développeur est le document qui permet à n'importe quel développeur de reprendre le projet Yallo sans avoir à demander d'aide à qui que ce soit. Il doit répondre à toutes les questions pratiques : comment installer le projet, comment le configurer, comment exécuter les tests, comment ajouter une fonctionnalité en respectant les conventions établies, et comment déployer.

Un bon guide du développeur répond à la règle des cinq minutes : un développeur expérimenté doit pouvoir avoir un environnement fonctionnel en moins de cinq minutes en suivant les instructions. Pour Yallo, cet objectif est atteint grâce au lock file `pnpm-lock.yaml` qui garantit l'installation des mêmes versions exactes de dépendances, et au fichier `.env.local.example` qui liste toutes les variables d'environnement requises avec des exemples.

La documentation des conventions de code est une partie souvent négligée du guide du développeur, mais cruciale pour la maintenabilité à long terme. Dans Yallo, ces conventions couvrent : le nommage des Server Actions (verbe d'action + ressource, ex : `getMenuData`, `updateKitchenStatus`), l'organisation des fichiers dans les dossiers feature (un fichier `actions.ts` pour les Server Actions, un fichier `types.ts` pour les types propres au domaine), et les patterns de test (comment mocker les dépendances, comment structurer les `describe` et `it`).

Le README contient les informations nécessaires pour créer un environnement de développement identique à la production :

1. **Prérequis** : Node.js 20+, pnpm 9+, compte Neon (PostgreSQL), compte Supabase.
2. **Installation** : `pnpm install` — les dépendances exactes sont fixées par `pnpm-lock.yaml`.
3. **Configuration** : copier `.env.local.example` vers `.env.local`, renseigner les 15+ variables de configuration.
4. **Migrations** : `pnpm drizzle-kit migrate` pour appliquer les 25 migrations sur une base vierge.
5. **Démarrage** : `pnpm dev` lance Next.js en mode développement.
6. **Tests** : `pnpm run test:run` (sans coverage) ou `pnpm run test:coverage` (avec rapport lcov).

**Commandes du développeur**

| Commande | Description | Environnement |
|---|---|---|
| `pnpm dev` | Lance Next.js en mode développement avec hot reload | Local |
| `pnpm build` | Build de production (détecte les erreurs TypeScript) | CI/Local |
| `pnpm run lint` | ESLint sur tous les fichiers TypeScript | CI/Local |
| `pnpm run test:run` | Exécute les 190 tests sans watch | CI/Local |
| `pnpm run test:coverage` | Exécute les tests avec rapport de couverture | CI |
| `pnpm drizzle-kit generate` | Génère une nouvelle migration depuis les changements de schéma | Local |
| `pnpm drizzle-kit migrate` | Applique les migrations en attente | Local/CI |
| `pnpm drizzle-kit studio` | Ouvre l'interface web d'exploration de la DB | Local |

**Workflow pour ajouter une fonctionnalité**

Voici le workflow type pour ajouter une nouvelle fonctionnalité, illustré par l'exemple "ajouter un champ de description au restaurant" :

1. **Créer une migration Drizzle** : modifier `src/db/schema.ts` pour ajouter la colonne `description text`, puis exécuter `pnpm drizzle-kit generate` qui crée le fichier SQL dans `drizzle/`.
2. **Appliquer la migration** : `pnpm drizzle-kit migrate` pour appliquer la migration sur la base de données locale.
3. **Ajouter le type dans le schéma** : le type TypeScript est automatiquement mis à jour car Drizzle infère les types depuis le schéma.
4. **Implémenter le Server Action** : dans `src/features/admin/actions.ts`, ajouter `updateRestaurantDescription()` avec le guard `requireAdmin()` et la validation Zod.
5. **Ajouter les tests** : dans `src/__tests__/features/admin/actions.test.ts`, ajouter les tests du cas nominal et des cas d'erreur.
6. **Mettre à jour le composant** : ajouter le champ dans le formulaire de modification du restaurant.
7. **Tester manuellement** : vérifier le comportement dans l'interface sur `localhost:3000`.

### C. Déploiement du logiciel

Le déploiement de Yallo est entièrement automatisé via les pipelines GitHub Actions et la plateforme Vercel. L'objectif est un déploiement de type **zero-downtime** : aucun utilisateur ne doit voir une erreur ou une page indisponible pendant le déploiement d'une nouvelle version.

Vercel implémente ce zéro-downtime par une mécanique de bascule atomique. Pendant le déploiement, l'ancien build continue de servir les requêtes. Une fois le nouveau build entièrement construit et testé (dans l'environnement Vercel), Vercel bascule instantanément le trafic vers le nouveau build — à l'échelle de la milliseconde. En cas d'erreur détectée dans le nouveau build, le rollback vers l'ancien build est possible instantanément depuis le tableau de bord Vercel ou via la CLI.

La gestion des migrations de base de données dans ce contexte de zéro-downtime nécessite des migrations "backward-compatible". Une migration qui renomme une colonne casse instantanément tout le code qui utilise l'ancien nom — il faut d'abord déployer le code qui gère les deux noms, puis migrer, puis nettoyer l'ancien nom. Les 25 migrations de Yallo respectent ce principe : ajout de colonnes (toujours backward-compatible), renommage via suppression + recréation (migration 0012), ajout d'énumérations.

Le déploiement repose sur Vercel et GitHub Actions. Deux environnements principaux sont utilisés :

- **Production** : `app.yallo.fr` — déploiement automatique sur merge dans `main`.
- **Staging** : URL preview Vercel générée automatiquement sur merge dans `develop`.

La procédure de déploiement manuel est la suivante :

```bash
# Installation CLI Vercel
pnpm add -g vercel

# Déploiement staging
vercel --env NEXT_PUBLIC_APP_URL=https://staging.yallo.fr

# Déploiement production
vercel --prod
```

Les variables sensibles (secrets API, clés Stripe, etc.) sont injectées via les secrets d'environnement Vercel — jamais committées dans le dépôt Git.

### D. Manuel d'utilisation

Le manuel d'utilisation documente les parcours complets pour chaque type d'utilisateur de la plateforme Yallo. Il s'adresse aux utilisateurs finaux et non aux développeurs — le vocabulaire est celui du métier, pas celui de la technologie.

La rédaction d'un manuel d'utilisation est une compétence de communication technique distincte de la programmation. Elle nécessite de se mettre à la place d'un utilisateur qui découvre l'application pour la première fois, sans aucune connaissance de son fonctionnement interne. Les instructions doivent être séquentielles, concrètes, et accompagnées des résultats attendus à chaque étape.

Le manuel couvre trois profils d'utilisateur aux besoins et aux niveaux de compétence technique très différents. Le **restaurateur** (profil OWNER) est souvent peu à l'aise avec les outils numériques — le manuel doit être simple, avec des captures d'écran et des instructions pas-à-pas. L'**administrateur interne** (profil ADMIN) est un membre de l'équipe Yallo plus à l'aise techniquement — le manuel peut être plus concis et référencer les termes techniques. L'**exploitant technique** est un développeur ou un SRE — le manuel peut être technique et référencer directement les logs, les URLs d'API, les commandes de déploiement.

Un manuel d'utilisation est structuré autour de trois profils :

**Restaurateur (OWNER)**

La configuration initiale du restaurant est le parcours le plus important pour un nouvel utilisateur. L'administrateur Yallo crée d'abord le compte et envoie les identifiants au restaurateur. Lors de la première connexion, le restaurateur doit configurer trois éléments avant que l'agent vocal soit opérationnel : le menu, les horaires, et le statut cuisine initial. L'ordre importe : sans menu configuré, l'agent vocal ne peut pas prendre de commandes ; sans horaires configurés, l'agent ne peut pas informer les clients de ses plages d'ouverture.

1. Se connecter sur `app.yallo.fr` avec les identifiants reçus
2. Accéder à la page Menu (`/dashboard/menu`) et uploader des photos de la carte ou saisir manuellement les produits
3. Vérifier le menu généré et sauvegarder (`Enregistrer le menu`)
4. Accéder à la page Horaires (`/dashboard/hours`) et configurer les plages d'ouverture pour chaque jour
5. Sur le dashboard principal, vérifier que le statut cuisine est bien sur `NORMAL`
6. Tester une commande : appeler le numéro dédié et passer une commande test
7. Vérifier que la commande apparaît sur le dashboard avec le statut `Nouvelle`

En opérations quotidiennes, le restaurateur utilise principalement deux fonctionnalités : changer le statut cuisine (Calme / Normal / Rush / Stop) en fonction de la charge, et faire progresser les commandes dans le workflow de préparation.

**Administrateur interne (ADMIN)**

L'onboarding d'un nouveau restaurant est un processus en plusieurs étapes qui nécessite de coordonner plusieurs services. L'administrateur doit disposer du numéro Twilio dédié du restaurant avant de commencer.

1. Se connecter sur `app.yallo.fr` (redirection automatique vers `/admin`)
2. Créer le compte utilisateur du restaurateur (`/admin/users/new`) — cela envoie automatiquement un email de bienvenue
3. Créer le restaurant (`/admin/restaurants/new`) et l'associer à l'utilisateur créé
4. Renseigner le numéro Twilio E.164 dans la fiche restaurant
5. Cliquer sur "Créer l'agent ElevenLabs" — attendre la confirmation (le processus peut prendre 10-15 secondes)
6. Vérifier que `elevenLabsAgentId` et `elevenLabsPhoneNumberId` sont bien renseignés dans la fiche
7. Effectuer un appel test sur le numéro Twilio pour valider la configuration

**Exploitant technique**

1. Surveiller Sentry pour les erreurs de production
2. Vérifier les runs GitHub Actions sur le dépôt
3. Contrôler l'état des webhooks Stripe et ElevenLabs
4. Appliquer les migrations en cas d'évolution du schéma : `pnpm drizzle-kit migrate`

### E. Mise à jour et évolutions

Le processus de mise à jour de Yallo est conçu pour être sûr et reproductible. La procédure documente chaque étape dans l'ordre, avec les points de contrôle intermédiaires.

Un principe fondamental guide ce processus : **ne jamais déployer en production sans avoir validé sur staging**. Staging est un miroir de la production avec des données de test — c'est le dernier filet de sécurité avant que les utilisateurs finaux soient impactés. Même pour une modification a priori anodine (correction d'un typo, mise à jour d'une couleur), la validation sur staging est recommandée.

La gestion des migrations de base de données est le point le plus critique du processus de mise à jour. Une migration mal exécutée peut rendre l'application inaccessible ou, pire, corrompre des données. Les migrations Drizzle sont conçues pour être idempotentes : si une migration échoue à mi-chemin (perte de connexion, contrainte de clé étrangère), elle peut être rejouée sans danger. La migration est validée sur la base de staging avant d'être appliquée en production.

Le logiciel intègre un processus de mise à jour structuré :

1. Récupérer les derniers changements Git (`git pull`)
2. Installer les dépendances (`pnpm install`)
3. Consulter les nouvelles migrations dans `drizzle/`
4. Appliquer les migrations sur staging (`pnpm drizzle-kit migrate` avec la `DATABASE_URL` de staging)
5. Valider fonctionnellement sur l'URL de staging
6. Exécuter lint et tests (`pnpm run lint && pnpm run test:run`)
7. Builder (`pnpm run build`)
8. Déployer sur staging via `vercel` (sans `--prod`)
9. Valider une dernière fois sur staging
10. Merger sur `main` → déploiement production automatique via CI
11. Appliquer les migrations sur la base de production
12. Vérifier les métriques Sentry dans les 10 minutes suivant le déploiement

### F. Traçabilité

La traçabilité de Yallo est assurée à plusieurs niveaux complémentaires, couvrant aussi bien l'évolution du code que l'évolution du schéma de données et le comportement en production.

La traçabilité du code source est assurée par Git, avec des messages de commit structurés suivant la convention Conventional Commits (type: description courte). Les types utilisés sont `feat:` (nouvelle fonctionnalité), `fix:` (correction de bug), `chore:` (tâche de maintenance), `refactor:` (refactoring sans changement fonctionnel), `test:` (ajout ou modification de tests), `docs:` (documentation). Cette convention permet de générer automatiquement un changelog structuré et de filtrer rapidement l'historique par type d'opération.

La traçabilité du schéma de base de données est assurée par les 25 migrations Drizzle numérotées séquentiellement. Chaque migration est un fichier SQL immuable — elle ne peut pas être modifiée après avoir été appliquée. Si un changement de schéma est nécessaire, une nouvelle migration doit être créée. Cette immuabilité garantit que l'état exact du schéma de production à n'importe quel moment dans le passé peut être reconstitué en rejouant les migrations dans l'ordre.

La traçabilité des déploiements est assurée par Vercel, qui lie chaque déploiement à un commit SHA précis. Il est possible à tout moment depuis le tableau de bord Vercel de voir quelle version du code est déployée, de consulter les logs du build, et de revenir à n'importe quelle version précédente en un clic.

La traçabilité des erreurs est assurée par Sentry, qui horodate précisément chaque erreur avec son contexte d'exécution (type de requête, utilisateur si non PII, stack trace complète, version déployée). La corrélation entre un déploiement et l'apparition d'une nouvelle erreur est possible grâce aux "releases" Sentry — chaque déploiement crée une nouvelle release identifiée par le SHA du commit.

- **Historisation du code** : Git avec message de commit structuré, PR avec description des changements.
- **Traçabilité du schéma** : 25 migrations Drizzle numérotées séquentiellement.
- **Traçabilité des déploiements** : chaque déploiement Vercel est associé à un commit SHA et accessible depuis le tableau de bord Vercel.
- **Traçabilité des erreurs** : Sentry horodate et contextualise chaque erreur de production.
- **Traçabilité de la qualité** : SonarCloud maintient un historique de la dette technique, des duplications et de la couverture sur chaque branch analysée.

Un axe d'amélioration identifié : la mise en place d'un `CHANGELOG.md` versionné pour documenter les évolutions fonctionnelles de façon lisible par les parties prenantes non techniques.

### G. Choix techniques justifiés (C2.4.1)

Cette section documente les décisions d'architecture clés avec leur contexte et leur justification. La documentation des décisions techniques est une pratique de génie logiciel souvent négligée, mais qui s'avère précieuse à deux moments : lors de l'onboarding d'un nouveau développeur sur le projet (pourquoi ce choix a-t-il été fait ?), et lors d'une discussion sur l'évolution du projet (est-ce que les raisons qui ont justifié ce choix sont toujours valables ?). Les "Architecture Decision Records" (ADR) constituent un format reconnu pour ce type de documentation.

Pour Yallo, les décisions documentées ici concernent les choix qui ont eu un impact significatif sur l'architecture globale, la sécurité ou la maintenabilité à long terme. Pour chaque décision, le contexte, les alternatives envisagées, le choix retenu et la justification sont présentés. Les limitations connues sont également documentées explicitement — cela reflète une approche honnête de l'ingénierie, où l'on assume ses compromis plutôt que de les dissimuler.

**Décision 1 : Abandon d'une architecture REST traditionnelle au profit des Server Actions**

Le choix d'utiliser les Server Actions Next.js 16 plutôt qu'une API REST classique représente une décision architecturale structurante qui a influencé l'ensemble du développement. Dans une architecture REST classique, chaque opération de mutation (créer, modifier, supprimer) nécessite une route API dédiée, un schéma de validation du body, une gestion CORS explicite, et une logique de fetch côté client. La duplication de code est importante : le type du body de la requête doit être défini à la fois côté serveur (pour la validation) et côté client (pour le typage de fetch).

Les Server Actions Next.js éliminent cette couche d'indirection. Une Server Action est une fonction TypeScript ordinaire, marquée `"use server"`, qui peut être importée et appelée directement depuis un composant React. Le compilateur Next.js gère la sérialisation, le transport et la désérialisation automatiquement. TypeScript garantit que les types sont corrects des deux côtés sans code-gen. Cette approche réduit significativement le boilerplate tout en maintenant un typage complet.

Alternatives envisagées :
- API REST Next.js avec routes `/api/` pour toutes les mutations
- API REST tierce (Express/Fastify) avec frontend séparé

Choix retenu : Server Actions Next.js 16

Justification technique : Les Server Actions s'exécutent côté serveur et ne sont pas accessibles via une URL HTTP directe. Cela réduit la surface d'attaque (pas d'endpoint public à protéger avec CORS, pas de token JWT à gérer explicitement côté client), simplifie le code (un seul type de vérification d'auth au lieu de deux — middleware API + validation client), et réduit le boilerplate (plus de fetch/useEffect pour les mutations simples).

Justification de maintenabilité : L'ajout d'une nouvelle fonctionnalité consiste à créer une fonction `"use server"` dans le dossier correspondant et à l'appeler depuis un composant React. Aucune route API à déclarer, aucun type de body à définir séparément.

Limitation acceptée : Les Server Actions ne peuvent pas être appelées par des systèmes externes (agents IA, Stripe, ElevenLabs). Ces intégrations continuent d'utiliser des routes API classiques (`/api/stripe/webhook`, `/api/elevenlabs/webhook`).

---

**Décision 2 : PostgreSQL avec Drizzle ORM plutôt que Prisma ou un ORM alternatif**

Le choix de l'ORM est une décision technique avec des conséquences durables : il influence la façon d'écrire les requêtes, la lisibilité du code, les performances en production, et la facilité de migration. Prisma est l'ORM dominant dans l'écosystème Next.js, avec une excellente documentation et une grande communauté. Pourtant, Drizzle a été préféré pour ses caractéristiques adaptées aux contraintes de Yallo.

La principale différence entre Prisma et Drizzle est leur approche du typage. Prisma génère des types TypeScript depuis le schéma Prisma via un processus de code-génération. Drizzle génère les types directement depuis le schéma TypeScript — le schéma Drizzle *est* le code TypeScript. Cette approche élimine l'étape de code-gen et garantit que les types TypeScript et le schéma de base de données sont toujours parfaitement synchronisés sans processus intermédiaire.

Alternatives envisagées :
- Prisma ORM (solution la plus répandue dans l'écosystème Next.js)
- Requêtes SQL manuelles via `pg` ou `postgres.js`

Choix retenu : Drizzle ORM

Justification : Drizzle est plus léger (bundle plus petit), génère du SQL plus lisible, et son typage TypeScript est intrinsèquement généré depuis le schéma Drizzle (pas de code-gen séparé). La syntaxe de requête ressemble davantage à SQL pur, ce qui facilite la lecture des requêtes complexes. Drizzle est également mieux adapté aux environnements serverless (pool de connexions minimal, pas de processus de génération nécessaire en prod).

---

**Décision 3 : Supabase Auth comme service d'authentification**

L'authentification est le module le plus sensible de toute application web. Les vulnérabilités d'authentification (A07 dans le Top 10 OWASP) sont parmi les plus fréquentes et les plus graves. Implémenter l'authentification en interne (hashage des mots de passe, gestion des tokens, protection contre le brute-force, reset de mot de passe) est une tâche complexe où les erreurs sont fréquentes et les conséquences graves.

La décision d'externaliser l'authentification à Supabase Auth est une décision de sécurité délibérée. Supabase Auth est maintenu par une équipe dédiée à la sécurité, qui suit les meilleures pratiques (argon2id pour le hashage, refresh tokens rotatifs, protection native contre le brute-force). En déléguant cette responsabilité, Yallo bénéficie d'une solution éprouvée sans avoir à maintenir la complexité associée.

Alternatives envisagées :
- NextAuth v5 seul
- Authentification maison avec bcrypt + JWT

Choix retenu : Supabase Auth

Justification sécurité : L'authentification maison est une source fréquente de vulnérabilités (A02 OWASP). Externaliser la gestion des mots de passe à un service spécialisé (hashage bcrypt, brute-force protection, gestion des tokens de reset) réduit significativement la surface de risque. Supabase Auth gère également le refresh automatique des tokens JWT sans code côté application.

La migration 0023 (add_auth_user_id_remove_password) documente cette décision architecturale dans l'historique Git.

---

**Décision 4 : Rate limiting en mémoire plutôt que Redis**

Cette décision illustre un compromis classique en ingénierie : la solution idéale (rate limiting distribué avec Redis/Upstash) est plus complexe et plus coûteuse que la solution pragmatique (Map en mémoire). En V1, avec un volume de trafic faible et des contraintes de temps, la solution pragmatique est acceptable — à condition d'être documentée.

La documentation explicite de cette limitation dans le code (commentaire dans `rate-limit.ts`) et dans ce dossier remplit une fonction importante : elle assure que les futurs développeurs comprennent le compromis et le plan de migration. Une limitation non documentée devient une dette technique invisible ; une limitation documentée devient un backlog item planifiable.

Limitation documentée : Le rate limiter actuel (`src/lib/rate-limit.ts`) utilise un `Map` en mémoire JavaScript. Dans un déploiement Vercel serverless, chaque instance de fonction possède sa propre mémoire — le rate limiter n'est donc pas partagé entre les instances. Un attaquant peut contourner la limitation en distribuant ses requêtes sur plusieurs instances.

Justification du choix actuel : En V1, le volume de trafic ne justifie pas la complexité et le coût d'une infrastructure Redis/Upstash. La limitation est acceptée et documentée.

Plan d'évolution documenté : Remplacement du `Map` par Upstash Redis avec le SDK `@upstash/ratelimit` pour la V2, ce qui permettra un rate limiting distribué avec une seule ligne de changement.

---

### H. Axes d'amélioration documentés

La V1 de Yallo, bien que fonctionnelle et déployée en production, présente des axes d'amélioration connus et documentés pour la V2. La documentation explicite des limitations et des pistes d'amélioration est une pratique d'ingénierie mature. Elle distingue une équipe qui assume ses compromis d'une équipe qui les ignore. Pour chaque axe, la priorité, la description du problème et la solution technique identifiée sont documentées — ce qui permet de transformer un constat d'amélioration en un ticket actionnable.

| Axe d'amélioration | Priorité | Description | Solution technique identifiée |
|---|---|---|---|
| Rate limiting distribué | Haute | Map en mémoire non partagé entre instances serverless | Upstash Redis + `@upstash/ratelimit` |
| Tests End-to-End | Haute | Absence de tests E2E sur les flux critiques (commande vocale, checkout Stripe) | Playwright avec mocking des webhooks |
| Couverture de branches | Moyenne | 67,54 % — branches non couvertes dans les cas d'erreur des services externes | Ajouter tests avec services externes mockés en erreur |
| CHANGELOG.md | Basse | Pas de changelog lisible par les parties prenantes non techniques | Conventional Commits + release-please |
| Documentation OpenAPI | Moyenne | Les 2 routes API webhook ne sont pas documentées au format OpenAPI | Swagger/OpenAPI pour les routes `/api/*` |
| Monitoring des performances | Moyenne | Pas de tracking des Core Web Vitals en production | Vercel Analytics ou Sentry Performance |
| Tests de charge | Basse | Comportement sous charge non validé | k6 ou Artillery pour simuler plusieurs centaines d'appels webhook simultanés |

---

## VI. Conclusion

### A. Bilan technique du projet

Le projet Yallo représente une application full-stack de niveau production, conçue et développée de manière autonome en utilisant des technologies de pointe du web moderne. Ce projet m'a permis de démontrer une maîtrise complète des compétences du Bloc 2 RNCP 39583, en couvrant l'ensemble du spectre du développement d'une application SaaS : de la modélisation de la base de données jusqu'au déploiement en production, en passant par les tests automatisés et l'audit de sécurité.

La combinaison Next.js 16 / React 19 / TypeScript strict représente l'état de l'art du développement web full-stack en 2025-2026. Le choix des Server Actions comme pattern principal pour les mutations de données m'a confronté à une nouveauté technologique significative : ce paradigme — exécution côté serveur, intégration avec les composants React, gestion des erreurs et de la progression — n'existait pas dans les versions précédentes de Next.js. Sa maîtrise démontre une capacité à s'approprier rapidement des technologies émergentes.

Drizzle ORM avec PostgreSQL et les migrations versionnées représentent un autre exemple de technologie récente que j'ai choisie délibérément pour ses avantages sur les alternatives plus matures (Prisma, TypeORM). La sécurité des types bout-en-bout — du schéma de base de données jusqu'aux composants React sans une seule ligne de cast TypeScript — est un résultat concret de cette décision architecturale.

### B. Défis techniques surmontés

Le défi le plus exigeant a été l'intégration complète du flux de création d'un agent vocal ElevenLabs. Ce flux implique trois services externes en cascade (Twilio, ElevenLabs, PostgreSQL), avec des dépendances strictes entre eux. La gestion des cas d'échec intermédiaires — que faire si l'agent est créé dans ElevenLabs mais que l'import du numéro Twilio échoue ? — a nécessité la conception d'une transaction logicielle avec rollback, un concept habituellement réservé aux bases de données. Ce type de problème ne figure dans aucun tutoriel — il nécessite de comprendre les garanties offertes par chaque service et de concevoir une solution adaptée.

Le débogage du webhook ElevenLabs a représenté un second défi important. Les sept bugs documentés dans le plan de correction reflètent la complexité réelle de l'intégration d'un service tiers : incompatibilités de format de payload, gestion de l'environnement (production vs développement), conditions de course entre la création de l'agent et son premier appel. La résolution méthodique de chacun de ces bugs — avec reproduction, analyse, correction ciblée et test de non-régression — illustre une démarche de debugging professionnelle.

La gestion du menu via GPT-4o Vision est un autre défi qui dépasse largement les compétences attendues d'un développeur web classique. L'intégration d'une API de vision — construire le prompt système, formater les images en base64, extraire la structure `MenuData` du JSON retourné, gérer les cas d'hallucination du modèle — m'a exposé aux techniques de prompt engineering et à la gestion des APIs d'IA générative.

### C. Maîtrise des compétences Bloc 2

**En matière d'environnements de développement (C2.1)**, deux pipelines GitHub Actions distincts ont été conçus pour répondre aux besoins différents des branches develop et main. Le pipeline CI principal orchestre six jobs (lint → test → SonarCloud → build → security → deploy) dans un ordre choisi pour minimiser le temps d'exécution total : les jobs les plus rapides et les plus susceptibles d'échouer (lint, tests) s'exécutent en premier, évitant d'attendre un build complet avant de découvrir une erreur de style. L'intégration de SonarCloud, Codecov, Sentry et `pnpm audit` dans ces pipelines garantit que chaque commit est évalué sur quatre dimensions : qualité du code, couverture de tests, monitoring en production, et sécurité des dépendances.

**En matière de développement back-end (C2.2)**, l'architecture Server Actions avec guards d'authentification représente une approche disciplinée du contrôle d'accès. Les 40+ Server Actions suivent toutes le même pattern : `requireAuth()` ou `requireAdmin()`, vérification d'ownership sur la ressource cible, validation Zod du payload, exécution, `revalidatePath()`. Cette cohérence n'est pas accidentelle — elle est le résultat d'une décision architecturale explicite de traiter chaque action comme une API endpoint avec ses propres protections.

**En matière de tests (C2.2.3)**, la suite de 190 tests illustre une approche mature du testing : isolation par mocks, couverture des cas nominaux ET des cas d'erreur, couverture des branches conditionnelles. Le taux de 72,55% de couverture d'instructions n'est pas un objectif en soi — c'est un indicateur. Les 27,45% non couverts correspondent principalement aux composants React (testés manuellement) et aux cas d'erreur réseau extrêmes.

**En matière de sécurité (C2.2.4)**, l'audit OWASP Top 10 démontre une compréhension des vecteurs d'attaque réels, pas seulement de la liste officielle. Pour chaque point OWASP, j'ai identifié le mécanisme de protection spécifique mis en place dans Yallo, les fichiers qui l'implémentent, et les limites connues (notamment le rate limiter non distribué, candidat à une amélioration en V2).

**En matière de recette (C2.3)**, le cahier de recettes en trois niveaux (fonctionnel, technique, sécurité) et le plan de correction des bugs documentant 7 anomalies réelles avec cause racine et prévention illustrent une démarche qualité professionnelle. Ces documents ne sont pas théoriques — ils correspondent à des bugs réels identifiés dans l'historique Git du projet.

### D. Perspectives V2

Le projet Yallo en version 1 est un produit fonctionnel et déployé en production, mais plusieurs axes d'amélioration ont été identifiés lors du développement. Ces perspectives ne sont pas de simples idées — elles sont le résultat d'une évaluation systématique des limitations actuelles de l'architecture, des retours des premiers utilisateurs, et des opportunités ouvertes par les technologies disponibles. Documenter ces perspectives est une pratique de génie logiciel mature : cela permet de distinguer ce qui est un choix délibéré (compromis accepté en V1) de ce qui est une dette technique à planifier.

La roadmap V2 est organisée selon les mêmes dimensions que ce dossier : infrastructure, développement, tests, sécurité et documentation. Chaque amélioration identifiée est accompagnée de sa justification, de la solution technique envisagée, et d'une estimation de sa complexité. Cette structuration permet de prioriser les efforts V2 selon l'impact attendu sur la sécurité, la fiabilité et l'expérience utilisateur.

Le **rate limiter distribué** est l'axe le plus urgent. Le rate limiter actuel (`Map` en mémoire) n'est pas partagé entre les instances Vercel Serverless, ce qui signifie qu'un attaquant multipliant ses requêtes sur plusieurs instances pourrait le contourner. Le remplacement par un rate limiter Redis/Upstash distribué est une amélioration prioritaire pour V2.

Les **tests E2E Playwright** combleront le gap entre les tests unitaires actuels (qui testent la logique isolément) et la validation manuelle du parcours utilisateur complet. Des tests E2E sur les flux critiques — connexion, changement de statut cuisine, simulation d'appel vocal — garantiront la non-régression sur les intégrations entre composants.

L'**intégration HubRise complète** permettra aux restaurants équipés d'un logiciel de caisse compatible (Lightspeed, Zelty, Laddition) de synchroniser automatiquement leurs commandes Yallo vers leur caisse. La base de l'intégration est déjà présente dans le code (table de mapping dans le schéma, migrations), mais la synchronisation temps réel reste à implémenter.

La **multi-tenancy avancée** permettra à un groupe de restauration de gérer plusieurs établissements depuis un seul compte, avec des rapports consolidés et des configurations partagées (menu groupe, horaires par établissement). Cette fonctionnalité est nécessaire pour adresser les clients "chaîne de restaurants".

L'**optimisation des Core Web Vitals** via Vercel Analytics ou Sentry Performance permettra de mesurer objectivement les performances perçues par les utilisateurs réels (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift) et d'identifier les pages à optimiser en priorité. Ces métriques seront particulièrement importantes pour les pages publiques du site marketing, où les performances influencent directement le référencement organique.

### E. Synthèse des compétences démontrées

Cette section de synthèse met en regard chaque compétence RNCP du Bloc 2 avec les réalisations techniques concrètes qui l'illustrent dans le projet Yallo. Elle constitue la conclusion du dossier et permet au jury d'évaluer d'un seul regard la couverture des compétences attendues. L'objectif de ce dossier était de démontrer non seulement la maîtrise technique, mais aussi la capacité à justifier les choix effectués, à identifier les limites de l'architecture, et à planifier les améliorations futures avec méthode.

**En matière d'environnements**, deux pipelines GitHub Actions adaptés aux deux branches principales (main et develop), un déploiement Vercel natif pour Next.js, et les outils SonarCloud, Sentry, Codecov et `pnpm audit` assurent un suivi continu de la qualité et de la sécurité.

**En matière de développement**, l'architecture feature-first, la modélisation relationnelle en 4 tables et 4 énumérations, les 40+ Server Actions validées par Zod, les 6 intégrations de services externes et les schémas TypeScript partagés garantissent une évolutivité maîtrisée. Les principes de responsabilité unique et d'inversion de dépendances sont appliqués systématiquement.

**En matière de tests**, 190 tests unitaires avec isolation complète par mocks, une couverture de 72,55 % des instructions et un pipeline bloquant sur tout échec empêchent les régressions d'atteindre la production.

**En matière de sécurité**, les contrôles OWASP A01 à A10 sont adressés explicitement : contrôle d'accès à deux niveaux (middleware + Server Action), vérification cryptographique de tous les webhooks externes, injection impossible via Drizzle ORM et Zod, en-têtes HTTP de sécurité configurés, audit des dépendances en CI, et rate limiting sur les endpoints sensibles.

**En matière de recette**, un cahier de recettes en trois niveaux (fonctionnel, technique, sécurité) et un plan de correction des bugs documentant 7 anomalies réelles tracées dans l'historique Git permettent un suivi et une détection des problèmes potentiels.

---

## VII. Annexes

Les éléments suivants constituent les preuves complémentaires de ce dossier. Ces annexes ne sont pas de simples illustrations — elles constituent des preuves tangibles des résultats atteints sur chaque dimension évaluée. Les captures d'écran montrent l'état réel de l'application en production et des outils qualité. Les exports techniques (collection Postman, schéma ERD, rapport de couverture) permettent à un jury technique de reproduire les mesures de façon indépendante.

L'**Annexe A** (rapport de couverture Vitest) documente le résultat de l'exécution des 190 tests unitaires. Les métriques présentées (72,55% instructions, 67,54% branches, 75% fonctions, 73,49% lignes) correspondent aux chiffres mesurés dans le pipeline CI GitHub Actions. Chaque chiffre est reproductible en exécutant `pnpm test:coverage` dans le répertoire du projet.

L'**Annexe B** (capture SonarCloud) illustre le résultat de l'analyse statique du code. Le Quality Gate "Passed" atteste qu'aucun nouveau Security Hotspot, aucune nouvelle vulnérabilité et aucun nouveau bug bloquant n'ont été introduits. Cette capture correspond au run SonarCloud du dernier commit de la branche main.

L'**Annexe D** (schéma ERD) représente la structure de la base de données avec ses 4 tables principales (users, restaurants, orders, orderItems), ses 4 énumérations (userRole, orderStatus, restaurantStatus, kitchenStatus) et les clés étrangères entre tables. Ce schéma correspond à l'état après la migration 0024 (la dernière migration appliquée).

L'**Annexe E** (capture GitHub Actions ci.yml) montre l'exécution complète du pipeline CI principal avec les 6 jobs (lint, test, sonarcloud, build, security, deploy-prod) en état "success". Cette capture valide l'intégration continue décrite dans la Section II de ce dossier.

| Annexe | Description |
|---|---|
| Annexe A | Rapport de couverture Vitest complet (190 tests, 72,55 %) |
| Annexe B | Capture écran tableau de bord SonarCloud — Quality Gate Passed |
| Annexe C | Capture écran Sentry — monitoring production, `sendDefaultPii: false` |
| Annexe D | Schéma ERD des 4 tables (users, restaurants, orders, orderItems) |
| Annexe E | Capture écran GitHub Actions — run complet ci.yml (6 jobs en succès) |
| Annexe F | Capture écran GitHub Actions — run staging.yml (3 jobs en succès) |
| Annexe G | Audit Lighthouse — scores Performance et Accessibilité |
| Annexe H | Extrait du log Sentry — capture d'une erreur webhook avec contexte |
| Annexe I | Export de la collection Postman — tests des webhooks ElevenLabs et Stripe |
| Annexe J | Tableau complet des 25 migrations Drizzle commentées |
