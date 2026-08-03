# CLAUDE.md — Site web maddevops

Site statique (HTML/CSS/JS, pas de framework, pas de package.json) — pas de suite de tests automatisée.

## ⚡ Règles strictes — Économie de tokens & Workflow mobile

Ces règles priment sur tout comportement par défaut de Claude Code sur ce repo.

### 1. Économie de tokens
- Réponses concises. Pas de blabla, pas de formules de politesse.
- Pas de suite de tests ici: ne jamais scanner tout le site pour valider un changement — vérifier uniquement les fichiers HTML/CSS/JS modifiés.
- Pour toute vérification (liens, HTML, accessibilité), cibler uniquement les fichiers touchés.

### 2. Pas de polling
- Ne JAMAIS boucler en attente d'un résultat CI/CD (ex: déploiement Vercel) après un `git push`.
- S'arrêter dès que le push est effectué. Ne pas surveiller le déploiement.

### 3. Gestion des erreurs
- Si un script/build échoue: lire uniquement les 30 dernières lignes du log.
- Ne jamais lire un log complet, même en cas d'échec répété.

### 4. Format mobile
- Résumés courts, étapes numérotées ou puces.
- Pas de longs paragraphes ni de gros blocs de code non essentiels.
