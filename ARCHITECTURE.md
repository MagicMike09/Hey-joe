# Architecture Hey Joe - Emotion Tracker

## Vue d'ensemble

L'application combine deux technologies de tracking pour analyser les émotions :
- **Eye Tracking** : Suivi du regard via webcam (WebGazer.js)
- **EEG (Brain Bit)** : Capture des ondes cérébrales via dispositif Bluetooth

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Eye Tracking │  │  Brain Bit   │  │   Emotion    │      │
│  │   Service    │  │   Service    │  │   Analysis   │      │
│  │ (WebGazer)   │  │ (Bluetooth)  │  │   Service    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────┬───────┴──────────────────┘              │
│                    │                                          │
│         ┌──────────▼───────────┐                             │
│         │   Zustand Store      │                             │
│         │  (State Management)  │                             │
│         └──────────┬───────────┘                             │
│                    │                                          │
│         ┌──────────▼───────────┐                             │
│         │  WebSocket Service   │                             │
│         └──────────┬───────────┘                             │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     │ Socket.io
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                         BACKEND                              │
│                    (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │  Socket.io   │  │   Database   │      │
│  │   Routes     │  │   Handlers   │  │   (SQLite)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Composants Frontend

### Services

#### 1. Eye Tracking Service (`eyeTrackingService.ts`)
- Initialise WebGazer.js
- Gère la calibration (9 points)
- Capture les données de regard en temps réel
- **Données captées** : position X, Y du regard

#### 2. Brain Bit Service (`brainBitService.ts`)
- Connexion Bluetooth au dispositif Brain Bit
- Capture des signaux EEG
- Mode démo avec données simulées
- **Données captées** :
  - Alpha (8-13 Hz) : Relaxation, repos
  - Beta (13-30 Hz) : Attention, concentration
  - Theta (4-8 Hz) : Créativité, rêverie
  - Delta (0.5-4 Hz) : Sommeil profond
  - Gamma (30-100 Hz) : Traitement cognitif élevé

#### 3. Emotion Analysis Service (`emotionAnalysisService.ts`)
Analyse 4 dimensions émotionnelles en combinant eye tracking et EEG :

**Attention** = Beta / Alpha ratio
- Beta élevé + Alpha modéré = Haute attention

**Engagement** = Stabilité du regard × Beta
- Regard stable + Beta élevé = Fort engagement

**Stress** = Beta / Theta ratio + Variance du regard
- Beta élevé + Theta faible + Regard erratique = Stress élevé

**Intérêt** = Durée de fixation × Gamma
- Fixations longues + Gamma élevé = Fort intérêt

#### 4. WebSocket Service (`websocketService.ts`)
- Connexion au backend via Socket.io
- Envoi des données en temps réel
- Gestion des sessions

### Composants UI

#### 1. `EyeTrackingCalibration.tsx`
- Interface de calibration
- 9 points de calibration
- Prévisualisation webcam
- Statut de tracking

#### 2. `BrainBitConnection.tsx`
- Connexion Bluetooth
- Mode démo (données simulées)
- Statut de connexion

#### 3. `Dashboard.tsx`
- Visualisation eye tracking (trail du regard)
- Graphiques EEG en temps réel
- Métriques instantanées

#### 4. `EmotionAnalysis.tsx`
- Affichage des 4 émotions
- Timeline des émotions
- Insights et recommandations

### State Management (Zustand)

Store centralisé avec :
- Données de regard (gazeData)
- Données EEG (eegData)
- Données d'émotions (emotionData)
- États de connexion
- Session courante

## Backend

### Base de données (SQLite)

4 tables principales :

#### `sessions`
- id (PRIMARY KEY)
- start_time
- end_time
- metadata (JSON)

#### `gaze_data`
- session_id (FOREIGN KEY)
- timestamp
- x, y (position)

#### `eeg_data`
- session_id (FOREIGN KEY)
- timestamp
- alpha, beta, theta, delta, gamma

#### `emotion_data`
- session_id (FOREIGN KEY)
- timestamp
- attention, engagement, stress, interest

### API REST

- `GET /api/sessions` - Liste des sessions
- `GET /api/sessions/:id` - Détails d'une session
- `GET /api/sessions/:id/data` - Données complètes
- `GET /api/sessions/:id/stats` - Statistiques
- `GET /api/sessions/:id/export` - Export JSON
- `POST /api/sessions` - Créer session
- `POST /api/sessions/:id/end` - Terminer session
- `GET /api/analytics` - Analytics globales

### WebSocket Events

**Client → Server :**
- `session:start` - Démarrer session
- `session:end` - Terminer session
- `data:gaze` - Envoyer données regard
- `data:eeg` - Envoyer données EEG
- `data:emotion` - Envoyer données émotions

**Server → Client :**
- `session:started` - Session démarrée
- `session:ended` - Session terminée
- `session:error` - Erreur session
- `data:gaze` - Diffusion données (monitoring)
- `data:eeg` - Diffusion données
- `data:emotion` - Diffusion données

## Flux de données

1. **Initialisation**
   - Utilisateur calibre eye tracking
   - Utilisateur connecte Brain Bit

2. **Capture temps réel** (boucle continue)
   - Eye Tracking : ~10 Hz (10 points/sec)
   - EEG : ~10 Hz (10 samples/sec)
   - Données stockées dans Zustand Store

3. **Analyse émotions** (toutes les 2 secondes)
   - Récupère dernières 50 données (5 secondes)
   - Calcule les 4 dimensions émotionnelles
   - Ajoute au store

4. **Synchronisation backend** (temps réel)
   - Envoi par lots via WebSocket
   - Stockage en base de données
   - Disponible pour analytics

5. **Visualisation**
   - Dashboard : graphiques temps réel
   - Emotion Analysis : métriques et insights
   - Mise à jour automatique

## Technologies utilisées

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **WebGazer.js** - Eye tracking
- **Web Bluetooth API** - Brain Bit
- **Socket.io Client** - WebSocket
- **Chart.js** - Graphiques
- **Lucide React** - Icônes

### Backend
- **Node.js** - Runtime
- **Express** - API REST
- **Socket.io** - WebSocket
- **TypeScript** - Type safety
- **Better-sqlite3** - Database
- **tsx** - Dev runner

## Performances

- **Latence eye tracking** : ~100ms
- **Latence EEG** : ~100ms
- **Analyse émotions** : ~50ms
- **WebSocket latency** : ~20ms
- **Storage batch** : Par lots de 10 points

## Sécurité & Privacy

- Données stockées localement (SQLite)
- Pas d'envoi vers serveurs externes
- WebRTC pour webcam (local)
- Bluetooth pour Brain Bit (local)
- Export JSON pour portabilité

## Extensions possibles

1. **Machine Learning**
   - Entraîner modèle sur données collectées
   - Prédiction émotions améliorée
   - Personnalisation par utilisateur

2. **Heatmaps avancées**
   - Agrégation multi-sessions
   - Zones d'intérêt automatiques
   - Export image/vidéo

3. **Multi-utilisateurs**
   - Tracking simultané
   - Comparaison en temps réel
   - Analytics de groupe

4. **Intégrations**
   - Export vers outils analytics
   - API webhook
   - Streaming vidéo

5. **Détection d'objets**
   - Computer vision pour identifier ce qui est regardé
   - Corrélation objet ↔ émotion
   - Rapports enrichis
