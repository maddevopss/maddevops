# MAD DevOps

Site vitrine statique de MAD DevOps.

## Rôle

Ce dépôt contient la page publique de MAD DevOps : services Web, applications, automatisations, outils internes et point d’entrée vers les projets associés.

## Structure du site et rôle des dossiers

```text
/
├── index.html           # Page d'accueil principale
├── contact.html         # Page de contact et formulaire
├── robots.txt           # Règles d'indexation SEO
├── sitemap.xml          # Plan du site pour SEO
├── assets/
│   ├── css/             # Feuilles de style organisées par responsabilités
│   │   ├── variables.css      # Couleurs, espacements, typographie globale
│   │   ├── base.css           # Reset et styles de base globaux
│   │   ├── layout.css         # Structure principale (header, main, footer, grilles)
│   │   ├── components.css     # Composants réutilisables (boutons, badges, liens)
│   │   ├── components/        # Styles spécifiques à des composants isolés (ex: back-to-top)
│   │   └── pages/             # Styles spécifiques à des pages isolées (home, contact)
│   └── js/              # Scripts isolés par responsabilité
│       ├── tracking.js        # Analytique et suivi
│       ├── contact-form.js    # Gestion du formulaire de contact
│       └── back-to-top.js     # Logique d'affichage du bouton retour en haut
├── img/                 # Ressources graphiques statiques
├── scripts/             # Scripts utilitaires de validation (ex: validate-seo.ps1)
└── README.md            # Documentation du dépôt
```

## Démarrage et opérations locales

### Comment démarrer le site localement
Ce projet ne nécessite aucun framework ni outil de compilation (Vanilla HTML/CSS/JS).
Pour le démarrer en local, servez simplement le dossier racine via un serveur HTTP. Par exemple avec Python :
```bash
python -m http.server 8000
```
Puis accédez à `http://localhost:8000`.

### Comment lancer les tests
Le site étant purement statique, les tests sont principalement visuels, d'accessibilité, et structurels.
- **Validation SEO :** `.\scripts\validate-seo.ps1`
- **Vérifications :** Lint HTML/CSS avec votre éditeur (ex: Prettier, Stylelint).

### Comment construire le site
Il n'y a pas d'étape de compilation ni de bundler (pas de Webpack, Vite, etc.). Les fichiers présents à la racine constituent directement le site de production.

## Guide de développement

### Comment ajouter une page
1. Créez un nouveau fichier HTML à la racine (ex: `services.html`).
2. Copiez la structure de base (balises meta, `header`, `footer`) depuis `index.html`.
3. Ajoutez le CSS spécifique à cette page dans `assets/css/pages/services.css` et liez-le dans le `<head>`.
4. Ajoutez la nouvelle page dans `sitemap.xml`.

### Comment ajouter un composant visuel
1. Si le composant est utilisé sur plusieurs pages, ajoutez ses styles dans `assets/css/components.css`.
2. S'il est complexe et indépendant, créez `assets/css/components/mon-composant.css` et incluez-le dans les pages concernées.
3. Le HTML du composant doit utiliser des classes sémantiques.

### Comment ajouter un script
1. Créez un fichier dans `assets/js/` (ex: `assets/js/mon-script.js`).
2. Évitez les événements inline (`onclick="..."`). Utilisez `addEventListener` dans le script.
3. Chargez le script en fin de `<body>` dans les pages concernées avec l'attribut `defer` : `<script src="./assets/js/mon-script.js" defer></script>`.

### Comment modifier les variables CSS
Toutes les valeurs magiques récurrentes (couleurs, espacements de base) sont centralisées dans `assets/css/variables.css`.
- Modifiez `--primary`, `--secondary`, ou `--bg` pour ajuster globalement la charte graphique.
- Utilisez toujours `var(--nom-variable)` dans les autres fichiers CSS.

## Décisions importantes de la refactorisation (A11y & Architecture)

- **Séparation stricte (HTML/CSS/JS) :** Aucun style en ligne, aucune balise `<style>`, aucun script inline. Les responsabilités sont isolées.
- **Accessibilité (A11y) centralisée :** Les états de focus (navigation au clavier) ont été dédupliqués et placés dans `components.css` pour assurer une prévisibilité sur tout le site.
- **Sémantique :** Remplacement des attributs `aria-label` redondants par de simples textes alternatifs `alt=""` pertinents pour les lecteurs d'écran.
- **Performance :** Ajout de `loading="lazy"` aux images situées hors de la ligne de flottaison initiale.

## Référencement (SEO) et Indexation
- **Domaine canonique :** `https://www.maddevops.com`
- **Validation :** Un script PowerShell (`scripts/validate-seo.ps1`) permet de valider le format XML.
- **Règles SYSTEME_MAD respectées :** Traçabilité, séparation du contenu public, pas de secrets.
- **Dernier audit SEO :** 2026-08-01

## Référence au SYSTEME_MAD

Ce site applique les règles documentaires, architecturales et opérationnelles de `SYSTEME_MAD` :
- [STD-106 — Responsive mobile](../SYSTEME_MAD/03-STANDARDS/std-106.md) *(pas de dimensionnement absolu `width` sur mobile, flexibilité)*
- [Accessibilité Web](../SYSTEME_MAD/03-STANDARDS/std-accessibilite-web.md) *(focus visible, gestion clavier, lecteur d'écran)*

Pour toute modification, veuillez consulter le dépôt d'autorité :
`https://github.com/bleeband/SYSTEME_MAD`

---
© 2026 — MAD DevOps. Réalisé par Marc-André Dufour.
