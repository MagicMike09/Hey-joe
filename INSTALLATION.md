# Guide d'installation - Hey Joe Emotion Tracker

## Prérequis

- **Node.js** : Version 18 ou supérieure
- **npm** : Version 9 ou supérieure
- **Navigateur moderne** : Chrome, Edge, ou Opera (pour WebGazer et Web Bluetooth)
- **Webcam** : Pour l'eye tracking
- **Brain Bit (optionnel)** : Dispositif EEG ou utiliser le mode démo

## Installation rapide

### 1. Cloner le projet

```bash
git clone <repo-url>
cd Hey-joe
```

### 2. Installer toutes les dépendances

```bash
npm run install:all
```

Cette commande installe les dépendances pour :
- Le projet root
- Le client (frontend React)
- Le serveur (backend Node.js)

### 3. Configuration

#### Client

Créez un fichier `.env` dans le dossier `client/` :

```bash
cd client
cp .env.example .env
```

Contenu du `.env` :
```
VITE_SERVER_URL=http://localhost:3000
```

#### Serveur

Créez un fichier `.env` dans le dossier `server/` :

```bash
cd server
cp .env.example .env
```

Contenu du `.env` :
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/sessions.db
```

### 4. Lancer l'application

#### Option A : Lancer client + serveur ensemble (recommandé)

Depuis le dossier racine :

```bash
npm run dev
```

Cela lance :
- Client sur http://localhost:5173
- Serveur sur http://localhost:3000

#### Option B : Lancer séparément

Terminal 1 - Client :
```bash
cd client
npm run dev
```

Terminal 2 - Serveur :
```bash
cd server
npm run dev
```

### 5. Accéder à l'application

Ouvrez votre navigateur et allez sur :
```
http://localhost:5173
```

## Configuration Browser

### Permissions nécessaires

L'application nécessite les permissions suivantes :

1. **Webcam** : Pour l'eye tracking
2. **Bluetooth** (optionnel) : Pour Brain Bit

### Navigateurs recommandés

| Navigateur | Eye Tracking | Bluetooth | Recommandé |
|------------|--------------|-----------|------------|
| Chrome     | ✅           | ✅        | ✅         |
| Edge       | ✅           | ✅        | ✅         |
| Opera      | ✅           | ✅        | ✅         |
| Firefox    | ✅           | ❌        | ⚠️         |
| Safari     | ⚠️           | ❌        | ❌         |

> **Note** : Firefox et Safari ont un support limité. Utilisez Chrome ou Edge pour une expérience optimale.

## Configuration Brain Bit

### Avec dispositif physique

1. Allumez votre Brain Bit
2. Assurez-vous qu'il est en mode pairing
3. Dans l'application, cliquez sur "Se connecter au Brain Bit"
4. Sélectionnez votre dispositif dans la fenêtre Bluetooth
5. Attendez la confirmation de connexion

### Mode démo (sans dispositif)

Si vous n'avez pas de Brain Bit :

1. Cliquez sur "Mode démo (données simulées)"
2. L'application génère des données EEG réalistes
3. Parfait pour tester l'application !

## Calibration Eye Tracking

### Étapes

1. Cliquez sur "Commencer la calibration"
2. Autorisez l'accès à la webcam
3. Cliquez sur chacun des 9 points qui apparaissent
4. Attendez la fin de la calibration
5. L'eye tracking est maintenant actif !

### Conseils pour une bonne calibration

- **Éclairage** : Assurez-vous d'être dans un endroit bien éclairé
- **Position** : Restez face à l'écran, à environ 50-70 cm
- **Stabilité** : Gardez la tête relativement stable
- **Lunettes** : Évitez les reflets si vous portez des lunettes
- **Précision** : Cliquez précisément sur chaque point de calibration

## Vérification de l'installation

### Checklist

- [ ] Le client démarre sur http://localhost:5173
- [ ] Le serveur démarre sur http://localhost:3000
- [ ] L'interface s'affiche correctement
- [ ] La webcam est accessible (autorisation accordée)
- [ ] La calibration eye tracking fonctionne
- [ ] Brain Bit se connecte OU mode démo fonctionne
- [ ] Le dashboard affiche les données en temps réel

## Résolution de problèmes

### Le client ne démarre pas

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Le serveur ne démarre pas

```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur de permissions webcam

1. Vérifiez les paramètres de votre navigateur
2. Allez dans : Paramètres → Confidentialité → Caméra
3. Autorisez l'accès pour localhost

### Eye tracking imprécis

1. Refaites la calibration
2. Améliorez l'éclairage
3. Ajustez votre position face à l'écran
4. Nettoyez votre webcam

### Bluetooth ne fonctionne pas

1. Vérifiez que Bluetooth est activé sur votre ordinateur
2. Utilisez Chrome ou Edge (Firefox ne supporte pas Web Bluetooth)
3. Le site doit être en HTTPS ou localhost
4. Essayez le mode démo si le problème persiste

### Base de données

Si vous avez des problèmes avec la base de données :

```bash
cd server
rm -rf data/
npm run dev
```

La base de données sera recréée automatiquement.

## Build pour production

### Client

```bash
cd client
npm run build
```

Les fichiers seront dans `client/dist/`

### Serveur

```bash
cd server
npm run build
```

Les fichiers seront dans `server/dist/`

### Lancer en production

```bash
# Depuis le dossier racine
npm run build
npm start
```

## Configuration avancée

### Changer les ports

**Client** (`client/vite.config.ts`) :
```typescript
server: {
  port: 5173 // Changez ici
}
```

**Serveur** (`server/.env`) :
```
PORT=3000 # Changez ici
```

### Base de données personnalisée

Dans `server/.env` :
```
DATABASE_PATH=/chemin/vers/votre/database.db
```

### Proxy personnalisé

Si le serveur est sur un autre domaine, modifiez `client/vite.config.ts` :

```typescript
proxy: {
  '/api': {
    target: 'http://votre-serveur:3000',
    changeOrigin: true
  }
}
```

## Support

Pour toute question ou problème :

1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur
3. Consultez la documentation
4. Ouvrez une issue sur GitHub

## Prochaines étapes

Une fois l'installation terminée :

1. ✅ Calibrez l'eye tracking
2. ✅ Connectez Brain Bit (ou mode démo)
3. ✅ Démarrez une session
4. ✅ Explorez le dashboard
5. ✅ Analysez vos émotions !

Bon tracking ! 🧠👁️
