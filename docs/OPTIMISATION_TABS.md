# Optimisation des Changements d'Onglets dans la Même Page

## Problème

Lorsqu'on utilise directement `router.replace()` ou `router.push()` pour changer d'onglet dans la même page, cela déclenche une navigation complète côté serveur, ce qui crée un délai perceptible (~0.5s) et une expérience utilisateur moins fluide.

## Solution : État Local + Transition Non-Bloquante

### Concept

1. **État local immédiat** : Utiliser `useState` pour changer l'onglet actif instantanément dans l'UI
2. **Synchronisation asynchrone** : Utiliser `startTransition` de React pour mettre à jour l'URL en arrière-plan sans bloquer l'interface
3. **Synchronisation bidirectionnelle** : Utiliser `useEffect` pour garder l'état local aligné avec l'URL (utile pour les rafraîchissements ou navigation directe)

**Note** : Cette optimisation s'applique uniquement aux changements au sein de la même page (onglets, filtres). Pour la navigation entre pages différentes, on utilise la navigation standard de Next.js.

### Code Pattern

```tsx
import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function MyTabs({ defaultTab = "tab1" }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // État local pour changement immédiat
  const urlTab = searchParams.get("tab") || defaultTab;
  const [activeTab, setActiveTab] = useState(urlTab);

  // Synchroniser avec l'URL si elle change (rafraîchissement, navigation directe)
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (value: string) => {
    // 1. Changement immédiat dans l'UI
    setActiveTab(value);
    
    // 2. Mise à jour URL en arrière-plan (non-bloquant)
    startTransition(() => {
      router.replace(`/page?tab=${value}`);
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      {/* Contenu des onglets */}
    </Tabs>
  );
}
```

## Avantages

- ✅ **Changement instantané** : L'utilisateur voit le changement d'onglet immédiatement
- ✅ **Pas de délai perceptible** : La navigation URL se fait en arrière-plan
- ✅ **Meilleure UX** : Expérience fluide et réactive
- ✅ **Compatible avec le routing Next.js** : L'URL reste synchronisée pour le partage et l'historique

## Cas d'usage

Cette optimisation s'applique uniquement aux changements **au sein de la même page** :

- ✅ Changements d'onglets dans les dashboards (ex: Restaurants ↔ Utilisateurs)
- ✅ Navigation entre sections d'une même page (ex: Général ↔ IA & Menu ↔ Téléphonie)
- ✅ Filtres et vues qui nécessitent une mise à jour d'URL (ex: filtres de recherche, statut)

**Ne pas utiliser pour** :
- ❌ Navigation entre pages différentes (ex: `/admin` → `/admin/restaurants/[id]`)
- ❌ Redirections après actions (ex: après login, après sauvegarde)

## Références

- [React useTransition](https://react.dev/reference/react/useTransition)
- [Next.js useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
