# Webhook Vapi (`/api/vapi/webhook`)

## Symptôme : « Your server rejected tool-calls webhook »

C’est une **réponse HTTP non acceptée** par Vapi (souvent **401**, **403** ou **5xx**). **HubRise n’est pas en cause** tant que la requête n’atteint pas ton code métier. **Sans HubRise**, la commande est quand même enregistrée dans **Yallo** (base + dashboard cuisine) dès que le webhook répond 200.

### Dashboard Vapi : « Tools » vs `submit_order`

- La liste où tu peux choisir **`api_request_tool`** correspond souvent aux **outils du workspace** (outils réutilisables), pas à la fonction intégrée au modèle.
- Yallo envoie **`submit_order`** dans **`model.tools`** via l’API (création / **Mettre à jour l’assistant**). Tu n’as **pas** besoin de sélectionner `api_request_tool` pour ça ; un outil workspace vide peut même **perturber** si tu l’associes à la place du bon flux.
- Après avoir ajouté `VAPI_WEBHOOK_SECRET` sur Vercel, fais **Mettre à jour l’assistant** dans l’admin Yallo pour que Vapi reçoive à nouveau l’URL du webhook **et** le même secret sur l’outil.

### Checklist (production / Vercel)

1. **`VAPI_WEBHOOK_SECRET` sur Vercel**  
   - Si la variable **n’existe pas** : en production le webhook est **refusé (401)** par design.  
   - Génère une valeur (ex. `openssl rand -hex 32`), ajoute-la sur Vercel, **redéploie** si besoin, puis **Mettre à jour l’assistant** depuis Yallo pour pousser ce secret dans la config Vapi (champ `secret` du serveur du tool).
   - Elle doit être **identique** au secret que Vapi envoie (`X-Vapi-Secret` ou `Authorization: Bearer` selon ta credential).

2. **Côté Vapi (assistant / outil)**  
   - Soit le champ **secret** inline sur le serveur du tool (aligné avec `VAPI_WEBHOOK_SECRET`),  
   - soit une **credential** « Bearer » ou **X-Vapi-Secret** dont la valeur = `VAPI_WEBHOOK_SECRET`.  
   - Si Vapi n’envoie **aucun** en-tête d’auth alors que ton app exige le secret → **401**.

3. **URL publique**  
   - `NEXT_PUBLIC_APP_URL` doit être l’URL **https** de déploiement (ex. `https://app.yallo.fr`).  
   - Après changement, cliquer **Mettre à jour l’assistant** dans l’admin pour repousser l’URL du tool vers Vapi.

4. **Logs**  
   - Vercel → Function Logs sur `/api/vapi/webhook` : chercher `Webhook Vapi rejeté` ou erreur DB.

### Dépannage temporaire (dev uniquement)

- `VAPI_WEBHOOK_DISABLE_AUTH=true` : **désactive** la vérification du secret (à ne pas laisser en prod).
