# Yallo

SaaS vertical pour la restauration rapide : site marketing, **dashboard cuisine (PWA)** et **agent vocal** (Vapi) pour les commandes par téléphone.

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (gestionnaire de paquets du projet)

## Installation

```bash
pnpm install
```

Créer un fichier `.env.local` avec les variables requises (Neon, NextAuth, Vapi, Twilio, etc.).

### Webhook Vapi (commandes vocales)

Si Vapi affiche « server rejected tool-calls webhook », voir **`docs/VAPI_WEBHOOK.md`** (secret, URL, 401).

### SMS de confirmation de commande (Twilio)

Après une commande vocale réussie, un SMS récap peut être envoyé au numéro de l’appelant (ou `customer_phone` dans `submit_order`).

- `TWILIO_ORDER_CONFIRMATION_SMS` : mettre `false` pour **désactiver** l’envoi (par défaut : activé si expéditeur + destinataire sont disponibles).
- `TWILIO_SMS_FROM` : numéro E.164 expéditeur (sinon : numéro Twilio du restaurant `twilio_phone_number` en base).

### Monitoring Sentry

Sentry est branché côté client + serveur + edge (App Router).

Variables minimales :

- `NEXT_PUBLIC_SENTRY_DSN` (obligatoire pour recevoir les erreurs front)
- `SENTRY_DSN` (optionnel, sinon fallback sur `NEXT_PUBLIC_SENTRY_DSN` côté serveur)
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (upload sourcemaps en build)

Variables recommandées :

- `SENTRY_ENVIRONMENT` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` (ex: `production`, `staging`)
- `SENTRY_TRACES_SAMPLE_RATE` / `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (ex: `0.1`)

## Développement

```bash
pnpm dev
```

- Marketing : [http://localhost:3000](http://localhost:3000)
- App dashboard : selon vos hosts (ex. `app.localhost:3000` si configuré)

## Qualité

```bash
pnpm run lint
pnpm run test:run
pnpm run build
```

## Base de données

```bash
pnpm drizzle-kit generate   # migrations
pnpm drizzle-kit push       # appliquer (attention aux warnings data-loss)
```

## Conventions & assistant IA

- Règles Cursor du dépôt : `.cursor/rules/yallo-project.mdc` et `.cursor/rules/nextjs.mdc`.
- Ancienne copie longue des règles : voir `DEPRACATEDCURSORRULES.md` (référence historique).
