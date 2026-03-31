# After Eid - Événement Premium

Site web premium pour l'événement exclusif "After Eid" avec système de paiement, QR codes et interface admin.

## 🌟 Fonctionnalités

### 🎨 Design Premium
- **Mobile-first** responsive design
- **Thème noir & doré** élégant
- **Animations fluides** et professionnelles
- **Typographie raffinée** (Playfair Display + Montserrat)
- **Interface moderne** et intuitive

### 💰 Système de Paiement
- **Intégration Airtel Money** pour les paiements
- **Paiement en deux fois** autorisé (7.000 FCFA + 15.000 FCFA)
- **Validation automatique** des transactions
- **Suivi en temps réel** du statut de paiement

### 📱 QR Codes Sécurisés
- **Génération automatique** après validation complète
- **QR codes uniques** et infalsifiables
- **Design stylisé** intégré aux invitations
- **Téléchargement** de l'invitation digitale

### ⏰ Compte à Rebours
- **Double compte à rebours** (événement + date limite paiement)
- **Mise à jour en temps réel**
- **Design attractif** et responsive
- **Notifications automatiques** d'urgence

### 📊 Interface Admin
- **Dashboard complet** avec statistiques
- **Scanner QR codes** intégré (caméra mobile)
- **Gestion des participants** et paiements
- **Export de données** et rapports

### 🔔 Notifications
- **Emails automatiques** de confirmation
- **Rappels intelligents** avant date limite
- **Notifications admin** instantanées
- **SMS optionnels** (Twilio intégré)

## 🚀 Technologies

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **EJS** pour les templates
- **Sessions sécurisées** Express-session

### Frontend
- **CSS3** moderne avec variables
- **JavaScript ES6+** vanilla
- **HTML5** sémantique
- **Responsive design** mobile-first

### Services Externes
- **Airtel Money API** pour paiements
- **Nodemailer** pour emails
- **Twilio** pour SMS (optionnel)
- **QRCode** génération

## 📋 Prérequis

- Node.js 16+ 
- MongoDB 4.4+
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone https://github.com/amoumich/AFTER-EID.git
cd AFTER_EID
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Démarrer MongoDB**
```bash
# Sur macOS/Linux
sudo systemctl start mongod

# Sur Windows
net start MongoDB
```

5. **Lancer l'application**
```bash
# Développement
npm run dev

# Production
npm start
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Base de données
MONGODB_URI=mongodb://localhost:27017/after_eid

# Sécurité
SESSION_SECRET=votre_secret_tres_securise
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Airtel Money
AIRTEL_MONEY_API_KEY=votre_api_key
AIRTEL_MONEY_SECRET=votre_secret_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app

# SMS (optionnel)
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
```

### Configuration Vercel

Le projet est optimisé pour Vercel avec `vercel.json` préconfiguré.

## 📱 Pages

### Publiques
- **Accueil** (`/`) - Landing page premium
- **Inscription** (`/inscription`) - Formulaire d'inscription
- **Statut** (`/mon-statut/:uniqueId`) - Page personnel du participant

### Admin
- **Login** (`/admin`) - Connexion admin
- **Dashboard** (`/admin/dashboard`) - Tableau de bord principal
- **Participants** (`/admin/participants`) - Gestion participants
- **QR Scanner** - Scanner intégré dans dashboard

## 🔄 Flux Utilisateur

1. **Inscription** → Formulaire avec informations de base
2. **Paiement** → Initiation Airtel Money (7.000 FCFA)
3. **Validation** → Confirmation automatique du paiement
4. **Paiement 2** → Participation (15.000 FCFA)
5. **QR Code** → Génération automatique si tout payé
6. **Invitation** → Téléchargement invitation digitale

## 🎯 Points Clés

### Sécurité
- **Sessions sécurisées** HTTP-only
- **Validation des inputs** côté serveur
- **QR codes cryptés** et uniques
- **Protection CSRF** sur formulaires

### Performance
- **Lazy loading** des images
- **Optimisation CSS** mobile-first
- **Compression** des assets
- **Cache intelligent** navigateur

### UX/UI
- **Animations subtiles** et professionnelles
- **Feedback immédiat** sur actions
- **Design responsive** parfait
- **Accessibilité** WCAG 2.1

## 📊 Statistiques en temps réel

Le dashboard admin affiche :
- Total participants inscrits
- Invitations validées
- Revenus générés
- Statuts de paiement
- Transactions récentes

## 🔧 Dépannage

### Problèmes communs

**MongoDB ne démarre pas**
```bash
# Vérifier le statut
sudo systemctl status mongod

# Redémarrer
sudo systemctl restart mongod
```

**Erreur de port 3000**
```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)
```

**Paiements Airtel Money**
- Vérifier les clés API dans `.env`
- Confirmer l'environnement (sandbox/production)
- Tester avec petits montants

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter votre repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Manuel
```bash
# Build
npm run build

# Production
npm start
```

## 📞 Support

Pour toute question ou support technique :
- Email: info@after-eid.com
- Téléphone: +226 XX XX XX XX

## 📄 Licence

© 2024 After Eid. Tous droits réservés.

---

**Développé avec ❤️ pour l'événement After Eid**
