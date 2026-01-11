# 📚 Documentation API - Express Auth API

Documentation complète de toutes les routes disponibles avec exemples de requêtes et réponses.

**Base URL :** `http://localhost:3000/api`

---

## Table des matières

- [Authentification](#authentification)
- [Email](#email)
- [Mot de passe](#mot-de-passe)
- [OAuth](#oauth)
- [2FA](#2fa)
- [Sessions](#sessions)
- [Profil](#profil)
- [Codes d'erreur](#codes-derreur)

---

## 🔑 Authentification

### POST `/auth/register`

Créer un nouveau compte utilisateur.

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "email": "user@example.com",
  "password": "Test1234",
  "firstName": "User",
  "lastName": "Test"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Inscription réussie. Veuillez vérifier votre email.",
  "user": {
    "id": "cmk123...",
    "email": "user@example.com",
    "firstName": "User",
    "lastName": "Test",
    "emailVerifiedAt": null,
    "twoFactorEnabledAt": null,
    "createdAt": "2026-01-09T12:00:00.000Z",
    "updatedAt": "2026-01-09T12:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Erreurs :**
- `409` : Email déjà utilisé
- `400` : Validation échouée

---

### POST `/auth/login`

Se connecter avec email et mot de passe.

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "email": "user@example.com",
  "password": "Test1234"
}
```

**Réponse (200) - Sans 2FA :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": { ... },
  "tokens": { ... }
}
```

**Réponse (200) - Avec 2FA activé :**
```json
{
  "success": true,
  "message": "Veuillez entrer votre code 2FA",
  "requires2FA": true,
  "userId": "cmk123..."
}
```

**Erreurs :**
- `401` : Email ou mot de passe incorrect
- `401` : Compte désactivé

---

### POST `/auth/logout`

Déconnecter l'utilisateur et révoquer les tokens.

**Authentification :** ✅ Requise (Bearer Token)

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### POST `/auth/refresh`

Rafraîchir les tokens JWT.

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Tokens rafraîchis",
  "user": { ... },
  "tokens": {
    "accessToken": "NEW_ACCESS_TOKEN",
    "refreshToken": "NEW_REFRESH_TOKEN",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Erreurs :**
- `401` : Refresh token invalide ou expiré
- `401` : Refresh token révoqué

---

## 📧 Email

### GET `/email/verify?token=xxx`

Vérifier l'adresse email avec le token reçu par email.

**Authentification :** ❌ Non requise

**Query Parameters :**
- `token` : Token de vérification (32 caractères)

**Exemple :**
```
GET /api/email/verify?token=vZq8_K5h3mP9nR2jL7wX4tY6fD1sB0cE
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

**Erreurs :**
- `400` : Token invalide ou expiré
- `400` : Email déjà vérifié

---

### POST `/email/resend`

Renvoyer l'email de vérification.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Email de vérification envoyé"
}
```

**Erreurs :**
- `400` : Email déjà vérifié

---

## 🔑 Mot de passe

### POST `/password/forgot`

Demander la réinitialisation du mot de passe (envoie un email).

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "email": "user@example.com"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

---

### POST `/password/reset`

Réinitialiser le mot de passe avec le token reçu par email.

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "token": "TOKEN_FROM_EMAIL",
  "newPassword": "NewPass123"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Erreurs :**
- `400` : Token invalide ou expiré

---

### POST `/password/change`

Changer le mot de passe (utilisateur connecté).

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "currentPassword": "Test1234",
  "newPassword": "NewPass123"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Mot de passe changé avec succès"
}
```

**Erreurs :**
- `401` : Mot de passe actuel incorrect
- `400` : Le nouveau mot de passe doit être différent

---

## 🌐 OAuth

### GET `/oauth/google`

Rediriger vers Google pour l'authentification.

**Authentification :** ❌ Non requise

**Utilisation :**
Ouvrir dans un navigateur :
```
http://localhost:3000/api/oauth/google
```

Après authentification Google, redirection vers `/oauth/google/callback`.

---

### GET `/oauth/google/callback`

Callback après authentification Google (géré automatiquement).

**Authentification :** ❌ Non requise

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Connexion Google réussie",
  "user": { ... },
  "tokens": { ... }
}
```

---

## 🔢 2FA

### POST `/2fa/enable`

Activer l'authentification à deux facteurs (génère un QR code).

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Scannez le QR code avec votre application d'authentification",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KG..."
  }
}
```

**Actions à faire :**
1. Scanner le QR code avec Google Authenticator / Authy
2. Appeler `/2fa/verify` avec le code à 6 chiffres

---

### POST `/2fa/verify`

Vérifier le code 2FA et activer définitivement.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "code": "123456"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "2FA activé avec succès"
}
```

**Erreurs :**
- `401` : Code 2FA invalide

---

### POST `/2fa/disable`

Désactiver l'authentification à deux facteurs.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "code": "123456"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "2FA désactivé avec succès"
}
```

---

### POST `/2fa/validate`

Valider le code 2FA lors de la connexion.

**Authentification :** ❌ Non requise

**Body :**
```json
{
  "userId": "cmk123...",
  "code": "123456"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": { ... },
  "tokens": { ... }
}
```

---

## 📱 Sessions

### GET `/sessions`

Lister toutes les sessions actives.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "cmk123...",
      "userAgent": "PostmanRuntime/7.43.3",
      "ipAddress": "::1",
      "createdAt": "2026-01-09T12:00:00.000Z",
      "expiresAt": "2026-01-16T12:00:00.000Z",
      "isCurrent": true
    },
    {
      "id": "cmk456...",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-01-08T10:00:00.000Z",
      "expiresAt": "2026-01-15T10:00:00.000Z",
      "isCurrent": false
    }
  ],
  "total": 2
}
```

---

### DELETE `/sessions/:id`

Révoquer une session spécifique.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Session révoquée avec succès"
}
```

**Erreurs :**
- `404` : Session introuvable
- `400` : Vous ne pouvez pas révoquer votre session actuelle

---

### DELETE `/sessions/other`

Révoquer toutes les autres sessions (garde la session actuelle).

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body :**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "2 session(s) révoquée(s)"
}
```

---

## 👤 Profil

### GET `/profile`

Consulter son profil.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Réponse (200) :**
```json
{
  "success": true,
  "user": {
    "id": "cmk123...",
    "email": "user@example.com",
    "firstName": "User",
    "lastName": "Test",
    "emailVerifiedAt": "2026-01-09T12:00:00.000Z",
    "twoFactorEnabled": false,
    "createdAt": "2026-01-09T12:00:00.000Z",
    "updatedAt": "2026-01-09T12:00:00.000Z"
  }
}
```

---

### PATCH `/profile`

Modifier son profil.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body (au moins un champ requis) :**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "user": { ... }
}
```

**Erreurs :**
- `409` : Email déjà utilisé
- `400` : Au moins un champ requis

**Note :** Si l'email est modifié, `emailVerifiedAt` est réinitialisé à `null`.

---

### DELETE `/profile`

Supprimer son compte (soft delete).

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Compte supprimé avec succès"
}
```

**Note :** Le compte est désactivé (`disabledAt` rempli), toutes les sessions sont révoquées.

---

### GET `/profile/login-history`

Consulter l'historique des connexions.

**Authentification :** ✅ Requise

**Headers :**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Query Parameters (optionnel) :**
- `limit` : Nombre de résultats (défaut: 20)

**Exemple :**
```
GET /api/profile/login-history?limit=10
```

**Réponse (200) :**
```json
{
  "success": true,
  "history": [
    {
      "id": "cmk123...",
      "userId": "cmk456...",
      "ipAddress": "::1",
      "userAgent": "PostmanRuntime/7.43.3",
      "success": true,
      "createdAt": "2026-01-09T12:00:00.000Z"
    },
    {
      "id": "cmk789...",
      "userId": "cmk456...",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": false,
      "createdAt": "2026-01-09T11:00:00.000Z"
    }
  ]
}
```

---

## ⚠️ Codes d'erreur

### Erreurs courantes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Validation échouée ou paramètres invalides |
| 401 | Unauthorized | Token manquant, invalide ou expiré |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Ressource déjà existante (ex: email) |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |

### Format des réponses d'erreur

```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": {
    "field": ["Erreur spécifique"]
  }
}
```

### Exemple - Validation échouée

```json
{
  "success": false,
  "error": "Validation Failed",
  "details": {
    "email": ["Email invalide"],
    "password": ["Minimum 8 caractères"]
  }
}
```

---

## 🔐 Sécurité

### Rate Limiting

**Routes d'authentification :**
- 5 requêtes maximum par 15 minutes

**Routes générales :**
- 100 requêtes maximum par 15 minutes

### Tokens JWT

**Access Token :**
- Durée : 15 minutes
- Taille : 1024+ caractères

**Refresh Token :**
- Durée : 7 jours
- Taille : 1024+ caractères
- Stocké en base de données (whitelist)

### Protection

- Hachage Argon2 pour les mots de passe
- Blacklist des access tokens révoqués
- Whitelist des refresh tokens actifs
- Historique des connexions (IP + User-Agent)

---

## 💡 Astuces

### Tester avec cURL

**Windows CMD :**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

**Linux/Mac :**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Utiliser les tokens

Après login/register, copiez les tokens :

```bash
# Stocker dans des variables (Linux/Mac)
ACCESS_TOKEN="eyJhbGci..."
REFRESH_TOKEN="eyJhbGci..."

# Utiliser
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 📞 Support

Pour toute question sur l'API :
- Consulter le README.md
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement