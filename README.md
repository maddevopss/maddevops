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

## Source de vérité MADSuite / MADPROOF

Pour les décisions liées à MADSuite, MADPROOF ou la gouvernance multi-repo, utiliser :

```text
bleeband/SYSTEME_MAD
```

## Auteur

Réalisé par Marc-André Dufour.

© 2026 — MAD DevOps.
