# WiFi Zone API

Backend API pour la plateforme WiFi Zone - Système de gestion de zones WiFi avec génération et vente de tickets.

## Architecture

Ce projet suit une architecture MVC (Model-View-Controller) avec Node.js, Express et MongoDB.

```
wifizone-api/
├── src/
│   ├── config/          # Fichiers de configuration
│   ├── models/          # Modèles Mongoose
│   ├── controllers/     # Contrôleurs (logique métier)
│   ├── routes/          # Routes API
│   ├── middlewares/     # Middlewares personnalisés
│   ├── services/        # Services (email, JWT, upload)
│   ├── validators/      # Schémas de validation
│   ├── utils/           # Fonctions utilitaires
│   └── app.js           # Configuration Express
├── uploads/             # Dossier temporaire pour uploads
├── logs/                # Fichiers de logs
├── server.js            # Point d'entrée
├── .env.example         # Variables d'environnement exemple
└── package.json
```

## Fonctionnalités

- Authentification JWT (Access & Refresh tokens)
- Gestion des utilisateurs avec KYC
- Gestion des zones WiFi
- Gestion des tarifs/plans
- Génération et gestion des tickets WiFi
- Système de transactions et retraits
- Système de parrainage
- Notifications par email
- Upload de fichiers vers Cloudflare R2
- Rate limiting
- Validation des données avec Joi
- Gestion d'erreurs centralisée
- Logging avec Winston

## Prérequis

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Compte Mailtrap (pour les emails en développement)
- Compte Cloudflare R2 (pour le stockage)

## Installation

1. Cloner le projet

```bash
git clone <repo-url>
cd wifizone-api
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos propres valeurs :

```env
# Application
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/wifizone

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM=WiFi Zone <noreply@wifi-zone.com>

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=wifizone-documents
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

4. Démarrer MongoDB

```bash
# Si vous utilisez Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou démarrer votre instance MongoDB locale
mongod
```

5. Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur `http://localhost:5000`

## Database Seeding

Pour peupler la base de données avec des données de test :

```bash
# Voir l'avertissement (ne fait rien)
npm run seed

# Exécuter le seed (efface toutes les données existantes!)
npm run seed:force
```

Le script créera :
- **1 admin** : `admin@wifizone.com` / `Admin@123`
- **4 utilisateurs** :
  - `kouadio.jean@example.com` / `User@123` (KYC vérifié, 2 zones)
  - `yao.marie@example.com` / `User@123` (KYC vérifié, 2 zones)
  - `kone.ibrahim@example.com` / `User@123` (KYC en attente, 1 zone)
  - `traore.fatou@example.com` / `User@123` (Nouveau compte)
- **5 zones WiFi** (Plateau, Cocody, Yopougon, Marcory, Abobo)
- **12 plans tarifaires** (3 plans par zone active)
- **~500 tickets** (disponibles, vendus, utilisés)
- **Transactions**, **Retraits** et **Notifications** de test

## Endpoints API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/forgot-password` - Demande de réinitialisation
- `POST /api/auth/reset-password` - Réinitialiser le mot de passe
- `POST /api/auth/verify-email` - Vérifier l'email

### Utilisateurs

- `GET /api/users/me` - Obtenir le profil (auth requise)
- `PUT /api/users/me` - Modifier le profil (auth requise)
- `PUT /api/users/change-password` - Changer le mot de passe (auth requise)
- `DELETE /api/users/me` - Supprimer le compte (auth requise)

### Health Check

- `GET /api/health` - Vérifier l'état de l'API

## Modèles de données

### User
- Informations personnelles (email, phone, nom, prénom)
- Authentification (password hashé avec bcrypt)
- Statut KYC
- Balance (total, disponible, en attente, réservé)
- Code de parrainage
- Préférences de notifications

### Zone
- Propriétaire (référence User)
- Informations de localisation (adresse, coordonnées GPS)
- Configuration du routeur (IP, username, password crypté)
- Statistiques (tickets, revenus)

### Plan
- Zone associée
- Durée (en secondes)
- Prix (en FCFA)
- Limites de bande passante (upload/download)
- Statistiques

### Ticket
- Zone et Plan associés
- Identifiants de connexion (username, password)
- QR Code
- Statut (available, sold, used, expired, invalidated)
- Données de session

### Transaction
- Type (sale, withdrawal, referral, commission)
- Montant, commission, net
- Statut (pending, completed, failed)
- Métadonnées

### Withdrawal
- Montant et frais
- Fournisseur (MTN, Orange, Moov, Wave)
- Numéro de téléphone
- Statut

### KYC
- Documents (ID front, ID back, selfie)
- Statut de vérification
- Raison de rejet (si applicable)

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- JWT pour l'authentification
- Rate limiting sur les endpoints sensibles
- Validation stricte des données avec Joi
- Helmet.js pour les headers de sécurité
- CORS configuré
- Sanitization des inputs
- Chiffrement des données sensibles

## Structure des réponses

### Succès
```json
{
  "success": true,
  "data": { ... },
  "message": "Message optionnel"
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Message d'erreur",
    "details": [] // Optionnel
  }
}
```

## Codes d'erreur

- `VALIDATION_ERROR` - Erreur de validation
- `UNAUTHORIZED` - Non authentifié
- `FORBIDDEN` - Non autorisé
- `NOT_FOUND` - Ressource non trouvée
- `CONFLICT` - Conflit (ex: email existant)
- `INSUFFICIENT_BALANCE` - Solde insuffisant
- `KYC_REQUIRED` - KYC requis
- `INTERNAL_ERROR` - Erreur serveur

## Développement

### Ajouter un nouveau module

1. Créer le modèle dans `src/models/`
2. Créer le contrôleur dans `src/controllers/`
3. Créer les routes dans `src/routes/`
4. Importer les routes dans `src/routes/index.js`

### Tests

```bash
npm test
```

## Déploiement

1. Configurer les variables d'environnement de production
2. Configurer MongoDB Atlas ou une instance MongoDB
3. Configurer Cloudflare R2 pour le stockage
4. Déployer sur votre plateforme (Heroku, AWS, DigitalOcean, etc.)

## Prochaines étapes

Les modules suivants sont à implémenter selon le fichier backend-requirements.md :

- [ ] Endpoints pour les zones WiFi (CRUD, stats)
- [ ] Endpoints pour les plans/tarifs (CRUD)
- [ ] Endpoints pour les tickets (génération, import, export)
- [ ] Endpoints KYC (soumission, approbation)
- [ ] Endpoints de transactions et balance
- [ ] Endpoints de retraits (demande, traitement)
- [ ] Endpoints de parrainage (stats, leaderboard)
- [ ] Endpoints de dashboard et statistiques
- [ ] Endpoints de notifications
- [ ] Webhooks Mikrotik (user-login, user-logout)
- [ ] Intégration Mobile Money (MTN, Orange, Moov, Wave)
- [ ] Validations Joi pour tous les endpoints
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI

## Support

Pour toute question ou problème, consultez le fichier backend-requirements.md pour les spécifications complètes.

## Licence

MIT
