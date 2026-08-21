# Déploiement production

Le site reste sous `/home/developpeur/app-infra/maddevops`. Les secrets SMTP
restent uniquement dans ce dossier, dans `.env`; une release Git n'en contient
jamais.

Le premier déploiement crée le lien `current -> app` avant de le remplacer par
`current -> releases/maddevops-<SHA>`. Le dossier `app` actuel demeure donc un
retour arrière possible. Les releases ne sont jamais supprimées par les scripts.

## Configuration GitHub requise

Créer l'environnement `production` et y ajouter une approbation requise. Ne pas
réutiliser la clé SSH personnelle. Utiliser une clé dédiée, limitée au compte de
déploiement du VPS, puis ajouter :

- secrets : `VPS_DEPLOY_KEY`, `VPS_KNOWN_HOSTS`;
- variables : `VPS_DEPLOY_HOST`, `VPS_DEPLOY_PORT`, `VPS_DEPLOY_USER`.

`VPS_KNOWN_HOSTS` doit contenir la clé d'hôte déjà vérifiée du VPS, pas une
valeur obtenue par `ssh-keyscan` pendant le déploiement.

Après le smoke CI d'un push sur `main`, le workflow crée une archive Git du SHA,
vérifie son SHA-256 sur le VPS, bascule `current` atomiquement, recrée seulement
`maddevops-app` et `maddevops-php`, puis vérifie PHP et la page locale. Une
erreur pendant cette séquence remet automatiquement le lien précédent.

Le workflow manuel `Rollback production` bascule vers un SHA de release déjà
présent sur le VPS; il n'accepte que des SHA Git de 40 caractères.
