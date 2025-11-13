# Backend Requirements - WiFi Zone Platform

Ce document décrit les API et fonctionnalités attendues du backend pour la plateforme WiFi Zone.

## Architecture Générale

- **Framework recommandé**: Node.js (Express)
- **Base de données**: MongoDb
- **Authentication**: JWT (Access Token)
- **Storage**: Cloudflare R2 pour les documents KYC
- **Paiements**: Intégration avec API Mobile Money (MTN, Orange, Moov, Wave) [Pas encore besoin de l'implémenter]
- **Email**: Service SMTP pour notifications

---

## 1. AUTHENTIFICATION & UTILISATEURS

### 1.1 - Endpoints d'authentification

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur
```json
Request:
{
  "email": "user@example.com",
  "phone": "+225XXXXXXXXX",
  "password": "securePassword123",
  "firstname": "Jean",
  "lastname": "Kouadio",
  "country": "CI",
  "referralCode": "WIFI2024ABC" // Optionnel
}

Response (201):
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": { "id": "uuid", "email": "...", "phone": "..." },
    "tokens": {
      "accessToken": "jwt...",
    }
  }
}
```

#### POST `/api/auth/login`
Connexion utilisateur
```json
Request:
{
  "identifier": "user@example.com", // email ou téléphone
  "password": "securePassword123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "kycStatus": "verified" },
    "tokens": {
      "accessToken": "jwt...",
    }
  }
}
```


#### POST `/api/auth/forgot-password`
Demande de réinitialisation de mot de passe
```json
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "Email de réinitialisation envoyé"
}
```

#### POST `/api/auth/reset-password`
Réinitialisation du mot de passe
```json
Request:
{
  "token": "resetToken",
  "newPassword": "newSecurePassword123"
}

Response (200):
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

#### POST `/api/auth/verify-email`
Vérification de l'email
```json
Request:
{
  "token": "emailVerificationToken"
}

Response (200):
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

### 1.2 - Gestion de compte

#### GET `/api/users/me`
Obtenir le profil de l'utilisateur connecté
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+225XXXXXXXXX",
    "firstname": "Jean",
    "lastname": "Kouadio",
    "country": "CI",
    "kycStatus": "verified",
    "balance": {
      "total": 1245000,
      "available": 1195000,
      "pending": 0,
      "reserved": 50000
    },
    "referralCode": "WIFI2024ABC",
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

#### PUT `/api/users/me`
Modifier le profil utilisateur
```json
Request:
{
  "firstname": "Jean",
  "lastname": "Baptiste",
  "phone": "+225XXXXXXXXX",
  "country": "CI"
}

Response (200):
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": { ... }
}
```

#### PUT `/api/users/change-password`
Changer le mot de passe
```json
Request:
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}

Response (200):
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

#### DELETE `/api/users/me`
Supprimer le compte utilisateur
```json
Response (200):
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

---

## 2. VÉRIFICATION KYC

### 2.1 - Gestion KYC

#### POST `/api/kyc/submit`
Soumettre les documents KYC
```json
Request (multipart/form-data):
- idFront: File (CNI recto)
- idBack: File (CNI verso)
- selfie: File (Selfie avec pièce)

Response (201):
{
  "success": true,
  "message": "Documents soumis avec succès",
  "data": {
    "kycId": "uuid",
    "status": "pending",
    "submittedAt": "2024-01-15T10:00:00Z"
  }
}
```

#### GET `/api/kyc/status`
Obtenir le statut KYC
```json
Response (200):
{
  "success": true,
  "data": {
    "status": "verified", // not_verified, pending, verified, rejected
    "submittedAt": "2024-01-15T10:00:00Z",
    "verifiedAt": "2024-01-16T14:30:00Z",
    "rejectionReason": null,
    "documents": [
      {
        "type": "id_front",
        "url": "https://...",
        "status": "verified",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### GET `/api/admin/kyc/pending` (Admin only)
Liste des demandes KYC en attente
```json
Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "kycId": "uuid",
        "userId": "uuid",
        "userEmail": "user@example.com",
        "status": "pending",
        "submittedAt": "2024-01-15T10:00:00Z",
        "documents": [...]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "perPage": 20
    }
  }
}
```

#### POST `/api/admin/kyc/:kycId/approve` (Admin only)
Approuver la vérification KYC
```json
Response (200):
{
  "success": true,
  "message": "KYC approuvé avec succès"
}
```

#### POST `/api/admin/kyc/:kycId/reject` (Admin only)
Rejeter la vérification KYC
```json
Request:
{
  "reason": "Documents illisibles"
}

Response (200):
{
  "success": true,
  "message": "KYC rejeté"
}
```

---

## 3. GESTION DES ZONES WIFI

### 3.1 - CRUD Zones

#### POST `/api/zones`
Créer une zone WiFi
```json
Request:
{
  "name": "Zone Plateau",
  "description": "Zone WiFi au Plateau",
  "address": "Boulevard de la République",
  "city": "Abidjan",
  "country": "CI",
  "latitude": 5.316667,
  "longitude": -4.033333,
  "routerIp": "192.168.1.1",
  "routerUsername": "admin",
  "routerPassword": "encrypted",
  "mikrotikApiPort": 8728
}

Response (201):
{
  "success": true,
  "message": "Zone créée avec succès",
  "data": {
    "id": "uuid",
    "name": "Zone Plateau",
    "status": "active",
    ...
  }
}
```

#### GET `/api/zones`
Lister toutes les zones de l'utilisateur
```json
Query Parameters:
- status: "active" | "inactive"
- search: "Plateau"
- page: 1
- perPage: 20

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Zone Plateau",
        "address": "...",
        "status": "active",
        "tickets": {
          "total": 500,
          "available": 12,
          "sold": 488
        },
        "revenue": 2440000,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "perPage": 20
    }
  }
}
```

#### GET `/api/zones/:zoneId`
Détails d'une zone
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Zone Plateau",
    "description": "...",
    "address": "...",
    "latitude": 5.316667,
    "longitude": -4.033333,
    "routerIp": "192.168.1.1",
    "status": "active",
    "tickets": { ... },
    "revenue": 2440000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/zones/:zoneId`
Modifier une zone
```json
Request:
{
  "name": "Zone Plateau Nouvelle",
  "description": "...",
  ...
}

Response (200):
{
  "success": true,
  "message": "Zone mise à jour",
  "data": { ... }
}
```

#### PATCH `/api/zones/:zoneId/toggle-status`
Activer/Désactiver une zone
```json
Response (200):
{
  "success": true,
  "message": "Statut mis à jour",
  "data": {
    "id": "uuid",
    "status": "inactive"
  }
}
```

#### DELETE `/api/zones/:zoneId`
Supprimer une zone (soft delete)
```json
Response (200):
{
  "success": true,
  "message": "Zone supprimée avec succès"
}
```

### 3.2 - Statistiques par zone

#### GET `/api/zones/:zoneId/stats`
Statistiques d'une zone
```json
Query Parameters:
- period: "7d" | "30d" | "90d" | "custom"
- startDate: "2024-01-01"
- endDate: "2024-01-31"

Response (200):
{
  "success": true,
  "data": {
    "ticketsSold": 488,
    "revenue": 2440000,
    "utilizationRate": 97.6,
    "salesByDate": [
      { "date": "2024-01-15", "tickets": 15, "revenue": 75000 }
    ],
    "salesByPlan": [
      { "planName": "2h - 1000 FCFA", "count": 220, "revenue": 220000 }
    ]
  }
}
```

---

## 4. GESTION DES TARIFS

### 4.1 - CRUD Tarifs

#### POST `/api/zones/:zoneId/plans`
Créer un tarif
```json
Request:
{
  "name": "2 heures",
  "duration": 7200, // en secondes
  "price": 1000, // en FCFA
  "downloadLimit": null, // null = illimité, sinon en KB
  "uploadLimit": null,
  "description": "Forfait 2 heures"
}

Response (201):
{
  "success": true,
  "message": "Tarif créé avec succès",
  "data": { ... }
}
```

#### GET `/api/zones/:zoneId/plans`
Lister les tarifs d'une zone
```json
Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "2 heures",
        "duration": 7200,
        "price": 1000,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### PUT `/api/plans/:planId`
Modifier un tarif
```json
Request:
{
  "name": "2h Premium",
  "price": 1200
}

Response (200):
{
  "success": true,
  "message": "Tarif mis à jour",
  "data": { ... }
}
```

#### PATCH `/api/plans/:planId/toggle-status`
Activer/Désactiver un tarif
```json
Response (200):
{
  "success": true,
  "message": "Statut mis à jour"
}
```

#### DELETE `/api/plans/:planId`
Supprimer un tarif
```json
Response (200):
{
  "success": true,
  "message": "Tarif supprimé avec succès"
}
```

---

## 5. GESTION DES TICKETS

### 5.1 - Génération de tickets

#### POST `/api/tickets/generate`
Générer des tickets
```json
Request:
{
  "zoneId": "uuid",
  "planId": "uuid",
  "quantity": 100
}

Response (201):
{
  "success": true,
  "message": "100 tickets générés avec succès",
  "data": {
    "generated": 100,
    "zoneId": "uuid",
    "planId": "uuid"
  }
}
```

#### POST `/api/tickets/import`
Importer des tickets depuis CSV
```json
Request (multipart/form-data):
- file: File (CSV)
- zoneId: "uuid"
- planId: "uuid"

Response (201):
{
  "success": true,
  "message": "Tickets importés avec succès",
  "data": {
    "imported": 250,
    "failed": 5,
    "errors": [
      { "line": 10, "error": "Format invalide" }
    ]
  }
}
```

### 5.2 - Liste et recherche

#### GET `/api/tickets`
Lister les tickets
```json
Query Parameters:
- zoneId: "uuid"
- planId: "uuid"
- status: "available" | "sold" | "used" | "expired"
- search: "username or ticket ID"
- page: 1
- perPage: 50

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "ticketId": "TKT001",
        "username": "user_plateau_001",
        "password": "encrypted",
        "zone": { "id": "uuid", "name": "Zone Plateau" },
        "plan": { "id": "uuid", "name": "2h - 1000 FCFA", "price": 1000 },
        "status": "available",
        "createdAt": "2024-01-10T00:00:00Z",
        "expiresAt": "2024-02-10T00:00:00Z",
        "soldAt": null,
        "usedAt": null
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "perPage": 50
    },
    "summary": {
      "total": 500,
      "available": 12,
      "sold": 488,
      "used": 400,
      "expired": 0
    }
  }
}
```

#### GET `/api/tickets/:ticketId`
Détails d'un ticket
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticketId": "TKT001",
    "username": "user_plateau_001",
    "password": "decryptedPassword",
    "qrCode": "data:image/png;base64,...",
    "zone": { ... },
    "plan": { ... },
    "status": "available",
    "createdAt": "2024-01-10T00:00:00Z",
    "expiresAt": "2024-02-10T00:00:00Z"
  }
}
```

### 5.3 - Actions sur les tickets

#### PATCH `/api/tickets/:ticketId/invalidate`
Invalider un ticket manuellement
```json
Response (200):
{
  "success": true,
  "message": "Ticket invalidé avec succès"
}
```

#### DELETE `/api/tickets/:ticketId`
Supprimer un ticket (si disponible uniquement)
```json
Response (200):
{
  "success": true,
  "message": "Ticket supprimé avec succès"
}
```

#### GET `/api/tickets/export`
Exporter les tickets en CSV/Excel
```json
Query Parameters:
- format: "csv" | "xlsx"
- zoneId: "uuid"
- status: "available"

Response (200):
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="tickets_export.csv"
```

---

## 6. COMPTABILITÉ & RETRAITS

### 6.1 - Solde et transactions

#### GET `/api/balance`
Obtenir le solde
```json
Response (200):
{
  "success": true,
  "data": {
    "total": 1245000,
    "available": 1195000,
    "pending": 0,
    "reserved": 50000,
    "currency": "XOF"
  }
}
```

#### GET `/api/transactions`
Historique des transactions
```json
Query Parameters:
- type: "sale" | "withdrawal" | "referral" | "commission"
- status: "completed" | "pending" | "failed"
- startDate: "2024-01-01"
- endDate: "2024-01-31"
- page: 1
- perPage: 50

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "transactionId": "TRX001",
        "type": "sale",
        "description": "Vente ticket 2h",
        "amount": 5000,
        "commission": 250,
        "net": 4750,
        "status": "completed",
        "metadata": {
          "ticketId": "uuid",
          "zoneId": "uuid"
        },
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "perPage": 50
    }
  }
}
```

### 6.2 - Retraits

#### POST `/api/withdrawals`
Demander un retrait
```json
Request:
{
  "amount": 50000,
  "provider": "mtn" | "orange" | "moov" | "wave",
  "phoneNumber": "+225XXXXXXXXX"
}

Response (201):
{
  "success": true,
  "message": "Demande de retrait créée",
  "data": {
    "id": "uuid",
    "amount": 50000,
    "fees": 1000,
    "netAmount": 51000,
    "status": "pending",
    "estimatedProcessingTime": "24-48h",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### GET `/api/withdrawals`
Historique des retraits
```json
Query Parameters:
- status: "pending" | "completed" | "failed"
- page: 1
- perPage: 20

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "withdrawalId": "WDR001",
        "amount": 50000,
        "fees": 1000,
        "netAmount": 51000,
        "provider": "mtn",
        "phoneNumber": "+225XXXXXXXXX",
        "status": "completed",
        "createdAt": "2024-01-15T10:00:00Z",
        "processedAt": "2024-01-15T16:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "perPage": 20
    }
  }
}
```

#### POST `/api/admin/withdrawals/:withdrawalId/process` (Admin only)
Traiter un retrait
```json
Request:
{
  "action": "approve" | "reject",
  "transactionId": "MTN_TXN_12345", // Si approve
  "reason": "Insufficient funds" // Si reject
}

Response (200):
{
  "success": true,
  "message": "Retrait traité avec succès"
}
```

---

## 7. SYSTÈME DE PARRAINAGE

### 7.1 - Code de parrainage

#### GET `/api/referral/code`
Obtenir son code de parrainage
```json
Response (200):
{
  "success": true,
  "data": {
    "code": "WIFI2024ABC",
    "link": "https://wifi-zone.com/register?ref=WIFI2024ABC",
    "totalReferrals": 4,
    "activeReferrals": 4,
    "totalCommissions": 27500
  }
}
```

### 7.2 - Liste des filleuls

#### GET `/api/referral/referrals`
Liste de ses filleuls
```json
Query Parameters:
- status: "active" | "pending"
- page: 1
- perPage: 20

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Kouassi Jean",
        "email": "kouassi@example.com",
        "status": "active",
        "joinedAt": "2024-01-10T00:00:00Z",
        "totalSales": 25,
        "totalRevenue": 125000,
        "commissionEarned": 12500
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "perPage": 20
    }
  }
}
```

### 7.3 - Statistiques parrainage

#### GET `/api/referral/stats`
Statistiques de parrainage
```json
Response (200):
{
  "success": true,
  "data": {
    "totalReferrals": 4,
    "activeReferrals": 4,
    "totalCommissions": 27500,
    "monthlyCommissions": 15000,
    "topReferral": {
      "name": "Kouassi Jean",
      "commission": 12500
    },
    "ranking": {
      "position": 1,
      "totalReferrers": 150
    }
  }
}
```

#### GET `/api/referral/leaderboard`
Classement des parrains
```json
Query Parameters:
- period: "all" | "month" | "week"
- limit: 10

Response (200):
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "name": "Public Name",
        "referralsCount": 8,
        "totalCommissions": 45000
      }
    ]
  }
}
```

---

## 8. DASHBOARD & STATISTIQUES

### 8.1 - Dashboard global

#### GET `/api/dashboard/stats`
Statistiques du dashboard
```json
Query Parameters:
- period: "today" | "7d" | "30d" | "90d" | "custom"
- startDate: "2024-01-01"
- endDate: "2024-01-31"

Response (200):
{
  "success": true,
  "data": {
    "balance": {
      "total": 1245000,
      "available": 1195000,
      "pending": 0,
      "reserved": 50000
    },
    "tickets": {
      "sold": 342,
      "available": 158,
      "total": 500
    },
    "zones": {
      "total": 12,
      "active": 12,
      "inactive": 0
    },
    "revenue": {
      "current": 3450000,
      "previous": 2750000,
      "change": 25.8
    },
    "topZones": [
      {
        "zoneId": "uuid",
        "name": "Zone Plateau",
        "ticketsSold": 125,
        "revenue": 625000
      }
    ],
    "recentTransactions": [...]
  }
}
```

### 8.2 - Rapports avancés

#### GET `/api/reports/sales`
Rapport des ventes
```json
Query Parameters:
- period: "7d" | "30d" | "90d" | "custom"
- startDate: "2024-01-01"
- endDate: "2024-01-31"
- zoneId: "uuid"
- groupBy: "day" | "week" | "month" | "zone" | "plan"

Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 1664,
      "totalRevenue": 8320000,
      "averageTicketPrice": 5000,
      "conversionRate": 83.2
    },
    "chartData": [
      {
        "date": "2024-01-15",
        "sales": 45,
        "revenue": 225000
      }
    ],
    "byPlan": [
      {
        "planName": "2h - 1000 FCFA",
        "count": 892,
        "revenue": 892000,
        "percentage": 45
      }
    ],
    "byHour": [
      {
        "hour": 12,
        "sales": 32,
        "revenue": 160000
      }
    ]
  }
}
```

#### GET `/api/reports/export`
Exporter un rapport
```json
Query Parameters:
- type: "sales" | "transactions" | "zones" | "tickets"
- format: "csv" | "pdf" | "xlsx"
- period: "7d" | "30d" | "90d" | "custom"
- startDate: "2024-01-01"
- endDate: "2024-01-31"

Response (200):
Content-Type: application/pdf | application/octet-stream
Content-Disposition: attachment; filename="report.pdf"
```

---

## 9. NOTIFICATIONS

### 9.1 - Préférences de notifications

#### GET `/api/notifications/preferences`
Obtenir les préférences
```json
Response (200):
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "saleAlerts": true,
    "stockAlerts": true,
    "weeklyReports": false,
    "kycUpdates": true
  }
}
```

#### PUT `/api/notifications/preferences`
Modifier les préférences
```json
Request:
{
  "emailNotifications": true,
  "saleAlerts": true,
  "stockAlerts": true,
  "weeklyReports": true
}

Response (200):
{
  "success": true,
  "message": "Préférences mises à jour"
}
```

### 9.2 - Liste des notifications

#### GET `/api/notifications`
Liste des notifications
```json
Query Parameters:
- unreadOnly: true
- page: 1
- perPage: 20

Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "type": "sale" | "stock_alert" | "kyc_update" | "withdrawal",
        "title": "Nouvelle vente",
        "message": "Ticket vendu sur Zone Plateau",
        "read": false,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "total": 50,
      "page": 1,
      "perPage": 20
    }
  }
}
```

#### PATCH `/api/notifications/:notificationId/read`
Marquer comme lue
```json
Response (200):
{
  "success": true,
  "message": "Notification marquée comme lue"
}
```

---

## 10. WEBHOOKS & INTÉGRATIONS

### 10.1 - Webhooks Mikrotik

Le backend doit exposer des endpoints pour recevoir les événements des routeurs Mikrotik:

#### POST `/api/webhooks/mikrotik/user-login`
Notification de connexion utilisateur
```json
Request:
{
  "username": "user_plateau_001",
  "routerIp": "192.168.1.1",
  "mac": "AA:BB:CC:DD:EE:FF",
  "ip": "192.168.1.100",
  "timestamp": "2024-01-15T10:00:00Z"
}

Response (200):
{
  "success": true
}
```

#### POST `/api/webhooks/mikrotik/user-logout`
Notification de déconnexion utilisateur
```json
Request:
{
  "username": "user_plateau_001",
  "routerIp": "192.168.1.1",
  "sessionDuration": 7200, // en secondes
  "bytesDownloaded": 104857600, // en bytes
  "bytesUploaded": 10485760,
  "timestamp": "2024-01-15T12:00:00Z"
}

Response (200):
{
  "success": true
}
```

### 10.2 - Intégration Mobile Money

Le backend doit intégrer avec les API Mobile Money pour:
- Traiter les paiements
- Effectuer les retraits

Endpoints internes (non exposés au frontend):
- Traitement des paiements entrants
- Gestion des callbacks de paiement
- Traitement des retraits
- Réconciliation des transactions

---

## 11. SÉCURITÉ & BONNES PRATIQUES

### Authentification
- JWT avec expiration courte (15 min) pour access token
- Refresh token avec expiration longue (7 jours)
- HTTPS obligatoire en production
- Rate limiting sur les endpoints sensibles (login, register)

### Autorisation
- Middleware pour vérifier les permissions
- Un utilisateur ne peut accéder qu'à ses propres ressources
- Admin role pour les endpoints d'administration

### Validation
- Validation stricte de tous les inputs
- Sanitization des données
- Validation des fichiers uploadés (type, taille)

### Stockage
- Mot de passe hashés avec bcrypt (cost 10+)
- Chiffrement des données sensibles (passwords routeurs, credentials)
- Stockage sécurisé des documents KYC

### Logging & Monitoring
- Logs des actions critiques
- Monitoring des performances
- Alertes en cas d'erreurs critiques

---

## 12. CODES D'ERREUR STANDARDS

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": [
      {
        "field": "email",
        "message": "Format d'email invalide"
      }
    ]
  }
}
```

### Codes d'erreur courants:
- `VALIDATION_ERROR`: Erreur de validation
- `UNAUTHORIZED`: Non authentifié
- `FORBIDDEN`: Non autorisé
- `NOT_FOUND`: Ressource non trouvée
- `CONFLICT`: Conflit (ex: email déjà utilisé)
- `INSUFFICIENT_BALANCE`: Solde insuffisant
- `KYC_REQUIRED`: Vérification KYC requise
- `ZONE_LIMIT_REACHED`: Limite de zones atteinte
- `TICKET_NOT_AVAILABLE`: Ticket non disponible
- `WITHDRAWAL_MIN_AMOUNT`: Montant minimum non atteint
- `INTERNAL_ERROR`: Erreur serveur

---

## 13. PAGINATION & FILTRES STANDARDS

Tous les endpoints de liste doivent supporter:
- `page`: Numéro de page (défaut: 1)
- `perPage`: Éléments par page (défaut: 20, max: 100)
- `sortBy`: Champ de tri
- `sortOrder`: "asc" | "desc"
- `search`: Recherche textuelle

Réponse standard:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "perPage": 20,
      "totalPages": 8
    }
  }
}
```

---

## 14. ENVIRONNEMENT & CONFIGURATION

Variables d'environnement nécessaires:
```env
# App
NODE_ENV=production
APP_URL=https://wifi-zone.com
API_URL=https://api.wifi-zone.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wifizone

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@wifi-zone.com
SMTP_PASSWORD=password
SMTP_FROM=WiFi Zone <noreply@wifi-zone.com>

# Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET=wifizone-documents
AWS_REGION=eu-west-1

# Mobile Money
MTN_API_KEY=your-key
MTN_API_SECRET=your-secret
ORANGE_API_KEY=your-key
ORANGE_API_SECRET=your-secret

# Google Maps
GOOGLE_MAPS_API_KEY=your-key

# Commission
PLATFORM_COMMISSION=0.05 # 5%
REFERRAL_COMMISSION=0.10 # 10%
WITHDRAWAL_FEE=0.02 # 2%
MIN_WITHDRAWAL_AMOUNT=5000 # FCFA
```

---

## 15. DÉPLOIEMENT & INFRASTRUCTURE

### Recommandations:
- **Serveur**: VPS ou Cloud (AWS, DigitalOcean, etc.)
- **Base de données**: PostgreSQL avec backups automatiques
- **Cache**: Redis pour sessions et cache
- **Queue**: Redis ou RabbitMQ pour jobs asynchrones
- **CDN**: CloudFlare ou AWS CloudFront
- **Monitoring**: Sentry, DataDog, ou New Relic
- **CI/CD**: GitHub Actions, GitLab CI

### Jobs asynchrones à prévoir:
- Envoi d'emails
- Traitement des retraits
- Génération de rapports
- Synchronisation avec Mikrotik
- Calcul des commissions

---

## NOTES IMPORTANTES

1. **KYC obligatoire**: Les retraits nécessitent une vérification KYC complète
2. **Commission plateforme**: 5% sur chaque vente
3. **Commission parrainage**: 10% sur les ventes des filleuls
4. **Frais de retrait**: 2% du montant
5. **Montant minimum retrait**: 5,000 FCFA
6. **Expiration tickets**: Configurable par tarif
7. **Soft delete**: Toutes les suppressions doivent être des soft deletes
8. **Audit trail**: Logger toutes les actions importantes

---

Pour toute question ou clarification, merci de contacter l'équipe de développement.
