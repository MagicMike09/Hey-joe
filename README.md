# Hey Joe - Emotion & Retail Analytics 🧠👁️🛒

Application web innovante qui combine **eye tracking** et **EEG (Brain Bit)** pour comprendre les émotions et comportements des utilisateurs.

## 🎯 Deux Modes d'Analyse

### Mode Général - Analyse Émotionnelle
Analyse complète des émotions pour :
- Tests utilisateurs (UX/UI)
- Études en sciences cognitives
- Analyse de contenu visuel
- Recherche académique

### Mode Retail - Merchandising & Produits
Analyse spécialisée pour le retail :
- **Shelf Testing** : Analyse de produits sur étagères
- **Merchandising** : Optimisation du positionnement produits
- **Tests A/B** : Comparaison de dispositions
- **Packaging** : Tests d'attractivité des designs

## 🎨 Fonctionnalités

### Fonctionnalités communes
- **Eye Tracking** : Suivi du regard en temps réel via webcam (WebGazer.js)
- **EEG Brain Bit** : Capture des signaux cérébraux via dispositif Brain Bit
- **Analyse d'émotions** : Corrélation entre zones regardées et état émotionnel
- **Visualisation temps réel** : Dashboard avec heatmaps et graphiques
- **Enregistrement de sessions** : Sauvegarde et analyse des sessions
- **Rapports analytiques** : Statistiques et insights

### Fonctionnalités Retail spécifiques
- **Import d'images** : Uploadez vos photos d'étagères/planogrammes
- **Zones produits (AOI)** : Définissez facilement les emplacements produits
- **Métriques retail** :
  - Temps jusqu'à première fixation (TTFF)
  - Durée totale de fixation par produit
  - Nombre de fixations
  - Ordre de visualisation
  - Scores d'attention, intérêt, engagement par produit
- **Rapport merchandising** : Insights automatiques et recommandations
- **Heatmaps par produit** : Visualisation des zones d'intérêt
- **Produits non vus** : Alertes pour repositionnement

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

## 📚 Documentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Guide d'installation complet
- **[USAGE.md](./USAGE.md)** - Guide utilisateur mode général
- **[RETAIL_GUIDE.md](./RETAIL_GUIDE.md)** - Guide complet mode retail (merchandising)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique détaillée

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
