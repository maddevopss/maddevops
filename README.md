# MAD DevOps

Site vitrine statique de MAD DevOps.

## Rôle

Ce dépôt contient la page publique de MAD DevOps : services Web, applications, automatisations, outils internes et point d’entrée vers les projets associés.

## Structure

```text
index.html       Page d’accueil
contact.html     Page de contact
assets/
  css/           Feuilles de style (base, composants, mise en page, pages)
  js/            Scripts (tracking, formulaire)
img/             Logos et images
README.md        Documentation du dépôt
```

## Déploiement

Le site est conçu comme un site statique simple. Il peut être servi par GitHub Pages, Vercel, Netlify ou tout hébergement statique équivalent.

## Vérifications minimales

Avant de pousser une modification :

```text
- index.html existe
- contact.html existe
- img/logo.png existe
- les pages déclarent lang="fr-CA"
- les pages contiennent une balise viewport
- les pages principales ont un titre et une meta description
```

## Référencement (SEO) et Indexation

Le référencement technique de base est configuré via `robots.txt` et `sitemap.xml`.

- **Domaine canonique :** `https://www.maddevops.com`
- **Emplacement des fichiers :** À la racine du dépôt (servis à la racine du site).
- **Pages incluses :**
  - `https://www.maddevops.com/` (Accueil)
  - `https://www.maddevops.com/contact.html` (Contact)
- **Routes exclues :** Aucune (tout le contenu public est indexable).
- **Environnements :** La configuration actuelle est uniquement pour la production. Il n'y a pas d'environnement de préproduction configuré avec `noindex`.
- **Validation :** Un script PowerShell (`scripts/validate-seo.ps1`) permet de valider le format XML, le domaine et l'absence de doublons.
- **Règles SYSTEME_MAD respectées :** Traçabilité, séparation du contenu public, pas de secrets (le sitemap ne pointe que vers des pages publiques sans données sensibles).
- **Dernier audit SEO :** 2026-08-01

## Source de vérité MADSuite / MADPROOF

Pour les décisions liées à MADSuite, MADPROOF ou la gouvernance multi-repo, utiliser :

```text
bleeband/SYSTEME_MAD
```

## Auteur

Réalisé par Marc-André Dufour.

© 2026 — MAD DevOps.
