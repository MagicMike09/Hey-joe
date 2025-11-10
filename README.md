# Hey Joe - Emotion Tracker 🧠👁️

Application web innovante qui combine **eye tracking** et **EEG (Brain Bit)** pour comprendre les émotions des visiteurs selon où se portent leurs regards.

## 🎯 Fonctionnalités

- **Eye Tracking** : Suivi du regard en temps réel via webcam (WebGazer.js)
- **EEG Brain Bit** : Capture des signaux cérébraux via dispositif Brain Bit
- **Analyse d'émotions** : Corrélation entre zones regardées et état émotionnel
- **Visualisation temps réel** : Dashboard avec heatmaps et graphiques
- **Enregistrement de sessions** : Sauvegarde et analyse des sessions visiteurs
- **Rapports analytiques** : Statistiques et insights sur les émotions

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Interface utilisateur moderne et responsive
- WebGazer.js pour l'eye tracking
- Web Bluetooth API pour Brain Bit
- Visualisations interactives (heatmaps, graphiques EEG)

### Backend (Node.js + Express)
- API REST pour la gestion des données
- WebSocket pour le streaming temps réel
- Algorithmes d'analyse émotionnelle
- Stockage des sessions et analytics

### Modules principaux
- **Eye Tracking Module** : Capture et traitement du regard
- **EEG Module** : Interface avec Brain Bit et traitement des signaux
- **Emotion Detection** : Algorithme de fusion de données
- **Analytics** : Génération de rapports et insights

## 🚀 Installation

```bash
# Cloner le projet
git clone <repo-url>
cd Hey-joe

# Installer toutes les dépendances (root, client, server)
npm run install:all
```

## 💻 Développement

```bash
# Lancer en mode développement (client + server)
npm run dev

# Client seul (http://localhost:5173)
npm run dev:client

# Server seul (http://localhost:3000)
npm run dev:server
```

## 📦 Build & Production

```bash
# Build complet
npm run build

# Lancer en production
npm start
```

## 🧪 Configuration Brain Bit

1. Allumez votre dispositif Brain Bit
2. Assurez-vous que Bluetooth est activé sur votre navigateur
3. L'application demandera l'autorisation de se connecter au dispositif
4. Suivez les instructions de calibration

## 📊 Utilisation

1. **Calibration** : Calibrez l'eye tracking en suivant les points à l'écran
2. **Connexion EEG** : Connectez votre dispositif Brain Bit via Bluetooth
3. **Session** : Lancez une session de tracking
4. **Analyse** : Visualisez en temps réel les émotions détectées
5. **Résultats** : Consultez les heatmaps et rapports d'analyse

## 🔬 Détection des émotions

L'application analyse plusieurs dimensions :
- **Attention** : Basée sur les ondes alpha/beta de l'EEG
- **Engagement** : Corrélation entre fixations visuelles et activation cérébrale
- **Stress** : Analyse des patterns EEG et mouvement oculaire
- **Intérêt** : Temps de fixation + activité cérébrale associée

## 🛠️ Technologies

- **Frontend** : React 18, TypeScript, Vite, TailwindCSS
- **Eye Tracking** : WebGazer.js
- **EEG** : Brain Bit SDK, Web Bluetooth API
- **Backend** : Node.js, Express, Socket.io
- **Visualisation** : Chart.js, Heatmap.js
- **Base de données** : SQLite/MongoDB

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.
