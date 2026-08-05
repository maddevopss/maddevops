# Endpoint de contact SMTP2GO

Le site statique envoie le formulaire vers `/api/contact.php`. Le endpoint doit être exécuté par PHP sur le VPS, avec les variables d'environnement du fichier `.env.example`.

## Configuration

1. Créer le fichier `.env` hors du dépôt.
2. Déclarer les variables dans l'environnement PHP-FPM/Apache ou Nginx.
3. Remplacer les valeurs SMTP2GO par les identifiants du compte.
4. Utiliser une adresse expéditrice validée dans SMTP2GO.
5. Vérifier que PHP possède les extensions `mbstring`, `openssl` et `filter`.
6. Tester une demande réelle après déploiement.

Le fichier `.env` ne doit jamais être publié. Le endpoint limite les envois à une demande par adresse IP par minute et utilise un champ piège anti-robot. Le site conserve un repli `mailto:` si le endpoint n'est pas disponible.
