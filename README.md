# 🔐 Express Auth API

API REST d'authentification complète avec Node.js, Express, Prisma et SQLite.

## ✨ Fonctionnalités

### 🔑 Authentification de base
- ✅ Inscription avec validation email
- ✅ Connexion (email/password)
- ✅ Déconnexion
- ✅ Refresh tokens (JWT)
- ✅ Mot de passe oublié
- ✅ Réinitialisation du mot de passe
- ✅ Changement de mot de passe

### 📧 Vérification Email
- ✅ Vérification du compte par email
- ✅ Renvoi de l'email de vérification

### 🌐 OAuth
- ✅ Connexion via Google

### 🔢 Authentification à deux facteurs (2FA)
- ✅ Activation du 2FA (QR Code)
- ✅ Désactivation du 2FA
- ✅ Vérification du code à la connexion

### 📱 Gestion des sessions
- ✅ Lister les sessions actives
- ✅ Révoquer une session spécifique
- ✅ Révoquer toutes les autres sessions

### 👤 Gestion du profil
- ✅ Consulter son profil
- ✅ Modifier son profil
- ✅ Supprimer son compte (soft delete)
- ✅ Historique des connexions

### 🛡️ Sécurité
- ✅ Rate limiting (protection brute-force)
- ✅ Tokens JWT (Access + Refresh)
- ✅ Blacklist des access tokens
- ✅ Whitelist des refresh tokens
- ✅ Historique des connexions (IP, User-Agent)
- ✅ Hachage des mots de passe (Argon2)

---

## 🛠️ Technologies

- **Runtime** : Node.js v22+
- **Framework** : Express.js
- **Base de données** : SQLite + Prisma ORM
- **Validation** : Zod
- **JWT** : jose
- **Hachage** : argon2
- **Email** : nodemailer (Mailtrap pour dev)
- **2FA** : otplib + qrcode
- **OAuth** : Passport.js
- **Logging** : Pino
- **Rate Limiting** : express-rate-limit

---

## 📦 Installation

### Prérequis

- Node.js v22 ou supérieur
- npm ou pnpm
- Git

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/Fayad241/express-auth-api.git
cd express-auth-api
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer les variables d'environnement

```bash
# Copier le fichier .env.example
cp .env.example .env
```

Modifier `.env` avec vos valeurs :

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"

# JWT Secrets
JWT_ACCESS_SECRET=GÉNÉRER_256_CARACTÈRES
JWT_REFRESH_SECRET=GÉNÉRER_256_CARACTÈRES

# Email (Mailtrap pour dev)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=votre_username_mailtrap
EMAIL_PASSWORD=votre_password_mailtrap
EMAIL_FROM=noreply@express-auth.com

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID=votre-client-id-google
GOOGLE_CLIENT_SECRET=votre-client-secret-google
GOOGLE_CALLBACK_URL=http://localhost:3000/api/oauth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4️⃣ Générer Prisma et créer la base de données

```bash
npx prisma generate
npx prisma db push
```

### 5️⃣ Lancer le serveur

```bash
# Mode développement (hot reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📚 Documentation API

### Base URL

```
http://localhost:3000/api
```

### Routes disponibles

#### 🔑 Authentification (`/auth`)

✅ = Authentification REQUISE
Route protégée, nécessite un token JWT dans le header Authorization: Bearer TOKEN

❌ = Authentification NON REQUISE
Route publique, accessible sans token

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | ❌ |
| POST | `/auth/login` | Connexion | ❌ |
| POST | `/auth/logout` | Déconnexion | ✅ |
| POST | `/auth/refresh` | Rafraîchir les tokens | ❌ |

#### 📧 Email (`/email`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/email/verify?token=xxx` | Vérifier l'email | ❌ |
| POST | `/email/resend` | Renvoyer l'email de vérification | ✅ |

#### 🔑 Mot de passe (`/password`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/password/forgot` | Mot de passe oublié | ❌ |
| POST | `/password/reset` | Réinitialiser avec token | ❌ |
| POST | `/password/change` | Changer le mot de passe | ✅ |

#### 🌐 OAuth (`/oauth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/oauth/google` | Connexion Google | ❌ |
| GET | `/oauth/google/callback` | Callback Google | ❌ |

#### 🔢 2FA (`/2fa`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/2fa/enable` | Activer le 2FA | ✅ |
| POST | `/2fa/verify` | Vérifier et confirmer | ✅ |
| POST | `/2fa/disable` | Désactiver le 2FA | ✅ |
| POST | `/2fa/validate` | Valider code à la connexion | ❌ |

#### 📱 Sessions (`/sessions`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/sessions` | Lister les sessions | ✅ |
| DELETE | `/sessions/:id` | Révoquer une session | ✅ |
| DELETE | `/sessions/other` | Révoquer les autres | ✅ |

#### 👤 Profil (`/profile`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/profile` | Consulter le profil | ✅ |
| PATCH | `/profile` | Modifier le profil | ✅ |
| DELETE | `/profile` | Supprimer le compte | ✅ |
| GET | `/profile/login-history` | Historique connexions | ✅ |

---

## 🧪 Tests

### Option 1 : Postman (Recommandé)

#### Importer la collection

1. Ouvrir **Postman**
2. Cliquer sur **Import**
3. **Upload Files** → Sélectionner `postman_collection.json` à la racine du projet
4. Cliquer sur **Import**

✅ **Toutes les requêtes sont pré-configurées !**

#### Variables automatiques

Les tokens sont auto-sauvegardés après login/register grâce aux scripts de test intégrés.

#### Ordre des tests recommandé

1. **Auth/Register** → Créer un compte
2. **Auth/Login** → Se connecter (tokens auto-sauvegardés)
3. **Profile/Get Profile** → Voir son profil
4. **2FA/Enable 2FA** → Activer le 2FA
5. **2FA/Verify 2FA** → Confirmer avec le code
6. **Sessions/Get Sessions** → Voir les sessions actives
7. **Password/Change Password** → Changer le mot de passe
8. **Auth/Logout** → Se déconnecter

---

### Option 2 : cURL (Ligne de commande)

#### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234","firstName":"Test","lastName":"User"}'
```

#### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234"}'
```

#### Consulter son profil (authentifié)
```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

#### Changer le mot de passe (authentifié)
```bash
curl -X POST http://localhost:3000/api/password/change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{"currentPassword":"Test1234","newPassword":"NewPass123"}'
```

#### Vérifier l'email
```bash
curl "http://localhost:3000/api/email/verify?token=VOTRE_TOKEN"
```

#### Lister les sessions (authentifié)
```bash
curl -X GET http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" \
  -d '{"refreshToken":"VOTRE_REFRESH_TOKEN"}'
```

**💡 Astuce Windows :** Remplacez `\` par `^` et utilisez des guillemets doubles avec échappement `\"`

---

### Option 3 : Documentation API détaillée

Consultez **`API_DOCUMENTATION.md`** pour la documentation complète de toutes les routes avec exemples de requêtes et réponses.

---

## 🗄️ Structure du projet

```
express-auth-api/
├── prisma/
│   ├── schema.prisma          # Modèle de la base de données
│   └── dev.db                 # Fichier SQLite
├── src/
│   ├── controllers/           # Contrôleurs (gestion des requêtes)
│   ├── dto/                   # Data Transfer Objects (filtres)
│   ├── lib/                   # Utilitaires (JWT, email, 2FA, etc.)
│   ├── middlewares/           # Middlewares (auth, errors)
│   ├── routes/                # Définition des routes
│   ├── schemas/               # Schémas de validation (Zod)
│   ├── services/              # Logique métier
│   └── index.js               # Point d'entrée du serveur
├── .env                       # Variables d'environnement (local)
├── .env.example               # Exemple de configuration
├── .gitignore                 # Fichiers à ignorer par Git
├── API_DOCUMENTATION.md       # documentation complète sur l'API
├── prisma.config.js           # Configuration Prisma
├── package.json               # Dépendances et scripts
├── postman_collection.json    # Postman collection
└── README.md                  # Ce fichier
```

---

## 🔐 Sécurité

### Tokens JWT

- **Access Token** : 15 minutes (1024+ caractères)
- **Refresh Token** : 7 jours (1024+ caractères)
- Secrets différents (256+ caractères)

### Protection

- Rate limiting : 5 tentatives / 15 minutes (auth)
- Rate limiting : 100 requêtes / 15 minutes (global)
- Blacklist des access tokens révoqués
- Whitelist des refresh tokens actifs
- Hachage Argon2 pour les mots de passe

### Historique

- Toutes les connexions sont enregistrées
- IP + User-Agent conservés
- Success/Fail tracké

---

## 🚀 Scripts disponibles

```bash
# Développement (hot reload)
npm run dev

# Production
npm start

# Prisma
npm run db:generate    # Générer le client Prisma
npm run db:push        # Synchroniser le schéma
npm run db:migrate     # Créer une migration
npm run db:studio      # Interface Prisma Studio
```

---

## 🌐 Configuration OAuth (Google)

### 1. Créer un projet Google Cloud

1. Aller sur https://console.cloud.google.com/
2. **Créer un projet** → "Express Auth API"
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. **Application type** : Web application
6. **Authorized redirect URIs** :
   ```
   http://localhost:3000/api/oauth/google/callback
   ```
7. Copier **Client ID** + **Client Secret**

### 2. Mettre à jour `.env`

```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
```

### 3. Tester

Ouvrir dans le navigateur :
```
http://localhost:3000/api/oauth/google
```

---

## 📧 Configuration Email (Mailtrap)

### Pour le développement

1. Créer un compte sur https://mailtrap.io (gratuit)
2. **Email Testing** → **Inboxes** → Copier les credentials SMTP
3. Mettre à jour `.env` :

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=votre_username
EMAIL_PASSWORD=votre_password
```

### Pour la production

Remplacer par Gmail, SendGrid, ou autre service SMTP.

---

## 📱 Configuration 2FA

### Applications compatibles

- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- Microsoft Authenticator
- 1Password

### Processus

1. **Enable 2FA** → Reçoit QR code
2. Scanner avec l'app
3. **Verify 2FA** → Entrer le code à 6 chiffres
4. 2FA activé ✅

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Fork le projet

# 2. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 3. Coder + commiter régulièrement
git add .
git commit -m "feat: description"

# 4. Pousser
git push origin feature/ma-fonctionnalite

# 5. Créer une Pull Request sur GitHub
```

### Format des commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
refactor: refactorisation
docs: documentation
test: ajout de tests
```

---

## 📝 Licence

Projet universitaire - Usage éducatif

---

## 👨‍💻 Auteurs

Projet réalisé dans le cadre du cours de Node.js - [ESGIS BENIN]

---

## 🆘 Support

Pour toute question :
- Ouvrir une issue sur GitHub
- Contacter le responsable par email fayadroufai241@gmail.com

---

## 📖 Ressources

- [Documentation Express](https://expressjs.com/)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Zod](https://zod.dev/)
- [Documentation Passport](http://www.passportjs.org/)
- [JWT Best Practices](https://www.rfc-editor.org/rfc/rfc8725.html)