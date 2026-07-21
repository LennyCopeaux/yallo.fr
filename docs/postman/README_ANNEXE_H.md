# Annexe H — Collection Postman (webhooks Vapi & Stripe)

Fichier prêt à importer :
[`Yallo_Webhooks_Annexe_H.postman_collection.json`](./Yallo_Webhooks_Annexe_H.postman_collection.json)

## En 5 minutes

1. Ouvre [Postman](https://www.postman.com/) (app ou web)
2. **Import** → sélectionne `docs/postman/Yallo_Webhooks_Annexe_H.postman_collection.json`
3. Clique sur la collection → onglet **Variables** et renseigne :
   - `baseUrl` → `http://app.localhost:3000` (local) ou `https://app.staging.yallo.fr`
   - `restaurantId` → UUID d’un restaurant réel (Admin → fiche restaurant / table `restaurants`)
   - `vapiWebhookSecret` → même valeur que `VAPI_WEBHOOK_SECRET` dans `.env.local`
4. Lance `pnpm dev` si tu testes en local
5. Envoie les requêtes dans l’ordre et **capture écran** (requête + status + body) pour le PDF

## Ce que tu dois montrer au jury

| Requête | Attendu | Compétence / recette |
|---|---|---|
| Vapi `submit_order` | `200` | RT fonctionnel webhook |
| Vapi `end-of-call-report` | `200` | `call_logs` |
| Vapi secret incorrect | `401` | RS-07 / RT-04 |
| Stripe sans signature | `400` | A08 OWASP |
| Stripe signature invalide | `400` | RT-06 |

## Stripe « vrai » event (optionnel mais classe)

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to http://app.localhost:3000/api/stripe/webhook
# → copier le whsec_... dans STRIPE_WEBHOOK_SECRET puis redémarrer pnpm dev
stripe trigger customer.subscription.updated
```

Capture le terminal Stripe CLI (`200 OK`) + éventuellement la synchro org en base.

## Pour le PDF

- 1 capture Postman collection (arborescence Vapi / Stripe)
- 2–3 captures de réponses (idéalement `200` + `401` + `400`)
- Mentionner le fichier `.json` joint au dépôt / dossier numérique
