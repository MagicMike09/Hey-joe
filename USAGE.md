# Guide d'utilisation - Hey Joe Emotion Tracker

## Introduction

Hey Joe est une application qui combine **eye tracking** (suivi du regard) et **EEG** (ondes cérébrales) pour analyser les émotions des visiteurs en temps réel.

## Cas d'usage

### 1. Musées et expositions
Analysez comment les visiteurs interagissent avec les œuvres :
- Quelles œuvres captent le plus l'attention ?
- Quel est le niveau d'engagement émotionnel ?
- Les visiteurs sont-ils stressés ou relaxés ?

### 2. Tests utilisateurs (UX)
Évaluez l'expérience utilisateur de sites web ou applications :
- Où se portent les regards des utilisateurs ?
- Quels éléments génèrent de l'intérêt ?
- Détectez les points de friction (stress élevé)

### 3. Recherche académique
Études en neurosciences, psychologie, ou sciences cognitives :
- Corrélation regard ↔ activité cérébrale
- Réponses émotionnelles à des stimuli
- Données exportables pour analyse

### 4. Marketing et publicité
Testez l'impact de vos créations :
- Quelles zones d'une pub attirent l'œil ?
- Quel est l'impact émotionnel ?
- Optimisez vos designs

## Démarrage d'une session

### Étape 1 : Lancer l'application

```bash
npm run dev
```

Ouvrez http://localhost:5173

### Étape 2 : Configuration Eye Tracking

1. Cliquez sur **"Commencer la calibration"**
2. Autorisez l'accès à la webcam
3. Suivez les instructions de calibration :
   - 9 points apparaissent à l'écran
   - Cliquez précisément sur chaque point
   - Regardez le point pendant que vous cliquez

**Conseils** :
- Positionnez-vous à 50-70 cm de l'écran
- Gardez la tête stable
- Bon éclairage recommandé

### Étape 3 : Connexion Brain Bit

**Option A : Dispositif réel**
1. Allumez votre Brain Bit
2. Cliquez sur **"Se connecter au Brain Bit"**
3. Sélectionnez le dispositif dans la fenêtre Bluetooth
4. Attendez la confirmation

**Option B : Mode démo**
1. Cliquez sur **"Mode démo (données simulées)"**
2. Parfait pour tester sans dispositif physique

### Étape 4 : Démarrer l'analyse

Une fois les deux systèmes actifs :
- Cliquez sur **"Démarrer l'analyse des émotions"**
- Le dashboard s'affiche
- L'enregistrement démarre automatiquement

## Interface utilisateur

### Dashboard principal

#### Zone 1 : Eye Tracking
- **Visualisation temps réel** : Trail violet montrant le parcours du regard
- **Point actuel** : Cercle rose indiquant la position courante
- **Coordonnées** : Position X, Y en pixels

#### Zone 2 : EEG (Ondes cérébrales)
- **Graphiques temps réel** : Trois ondes principales
  - **Alpha** (bleu) : Relaxation, repos
  - **Beta** (rose) : Attention, concentration
  - **Theta** (vert) : Créativité, rêverie
- **Valeurs instantanées** : Puissance de chaque onde

### Analyse émotionnelle

#### Les 4 dimensions

1. **Attention** (0-100%)
   - Basée sur ratio Beta/Alpha
   - Élevé = Forte concentration
   - Faible = Distraction

2. **Engagement** (0-100%)
   - Combinaison stabilité du regard + Beta
   - Élevé = Fortement impliqué
   - Faible = Désintéressé

3. **Stress** (0-100%)
   - Basé sur Beta/Theta + variance regard
   - Élevé = Tension, anxiété
   - Faible = Relaxation

4. **Intérêt** (0-100%)
   - Durée de fixation × Gamma
   - Élevé = Curiosité, fascination
   - Faible = Ennui

#### Timeline des émotions
- Graphiques à barres montrant l'évolution
- Dernières 30 mesures (~1 minute)
- Mise à jour toutes les 2 secondes

#### Insights automatiques
Messages contextuels basés sur les émotions :
- Excellente concentration détectée
- Niveau de stress élevé
- Fort intérêt observé
- Suggestions d'amélioration

## Interprétation des résultats

### Scénarios typiques

#### Visiteur engagé
```
Attention: 75%
Engagement: 80%
Stress: 20%
Intérêt: 85%
```
✅ **Interprétation** : Le contenu capte parfaitement l'attention. Continuez !

#### Visiteur stressé
```
Attention: 40%
Engagement: 35%
Stress: 80%
Intérêt: 30%
```
⚠️ **Interprétation** : Le contenu est peut-être trop complexe ou intense.

#### Visiteur ennuyé
```
Attention: 25%
Engagement: 20%
Stress: 15%
Intérêt: 30%
```
❌ **Interprétation** : Le contenu ne capte pas l'attention. Rendre plus interactif.

#### Visiteur curieux
```
Attention: 60%
Engagement: 65%
Stress: 25%
Intérêt: 90%
```
✅ **Interprétation** : Fort intérêt détecté. Moment idéal pour plus d'infos.

## Gestion des sessions

### Arrêter une session
1. Cliquez sur l'icône **"Configuration"** en haut à droite
2. Vous retournez à l'écran de setup
3. Les données sont automatiquement sauvegardées

### Accéder aux sessions enregistrées

Via l'API REST :

```bash
# Liste des sessions
curl http://localhost:3000/api/sessions

# Détails d'une session
curl http://localhost:3000/api/sessions/{session_id}

# Export JSON complet
curl http://localhost:3000/api/sessions/{session_id}/export > session.json
```

### Format des données exportées

```json
{
  "session": {
    "id": "session_1234567890_abc123",
    "start_time": 1234567890000,
    "end_time": 1234567900000
  },
  "data": {
    "gaze": [
      { "timestamp": 1234567890100, "x": 500, "y": 300 }
    ],
    "eeg": [
      {
        "timestamp": 1234567890100,
        "alpha": 45.2,
        "beta": 32.1,
        "theta": 28.5,
        "delta": 12.3,
        "gamma": 18.7
      }
    ],
    "emotion": [
      {
        "timestamp": 1234567890100,
        "attention": 75,
        "engagement": 80,
        "stress": 20,
        "interest": 85
      }
    ]
  },
  "stats": {
    "gazePoints": 1500,
    "eegPoints": 1500,
    "emotionPoints": 150,
    "averageEmotions": {
      "avg_attention": 72.5,
      "avg_engagement": 78.3,
      "avg_stress": 22.1,
      "avg_interest": 81.4
    }
  }
}
```

## Analyse post-session

### Analytics globales

```bash
curl http://localhost:3000/api/analytics
```

Retourne :
- Nombre total de sessions
- Durée moyenne des sessions
- Statistiques agrégées par session

### Traitement des données

Les données JSON exportées peuvent être analysées avec :
- **Python** : pandas, matplotlib, seaborn
- **R** : ggplot2, dplyr
- **Excel/Google Sheets** : Import JSON
- **Tableau/Power BI** : Visualisation avancée

### Exemple Python

```python
import json
import pandas as pd
import matplotlib.pyplot as plt

# Charger les données
with open('session.json') as f:
    data = json.load(f)

# Créer DataFrame des émotions
emotions_df = pd.DataFrame(data['data']['emotion'])
emotions_df['timestamp'] = pd.to_datetime(emotions_df['timestamp'], unit='ms')

# Visualiser
emotions_df.set_index('timestamp')[['attention', 'engagement', 'stress', 'interest']].plot()
plt.title('Évolution des émotions')
plt.ylabel('Score (%)')
plt.show()
```

## Bonnes pratiques

### Pour des résultats optimaux

1. **Calibration**
   - Recalibrez à chaque session
   - Recalibrez si vous bougez beaucoup
   - Cliquez précisément sur les points

2. **Position**
   - Restez à distance constante de l'écran
   - Évitez de trop bouger la tête
   - Position assise confortable

3. **Éclairage**
   - Lumière naturelle ou artificielle stable
   - Évitez la lumière directe dans la webcam
   - Pas de contre-jour

4. **Sessions**
   - Durée recommandée : 5-15 minutes
   - Faites des pauses entre sessions
   - Ne forcez pas si fatigué

### Limitations connues

1. **Eye tracking**
   - Précision : ±50-100 pixels
   - Fonctionne mieux sur desktop que mobile
   - Sensible aux lunettes et reflets

2. **Brain Bit**
   - Nécessite bon contact avec la peau
   - Sensible aux mouvements
   - Peut être perturbé par l'électricité statique

3. **Analyse émotions**
   - Basée sur algorithmes simplifiés
   - Nécessite calibration personnelle pour précision maximale
   - Varie selon l'individu

## Dépannage courant

### Eye tracking imprécis
- ✅ Refaire calibration
- ✅ Améliorer éclairage
- ✅ Nettoyer webcam
- ✅ Ajuster position

### Données EEG erratiques
- ✅ Vérifier contacts Brain Bit
- ✅ Réduire mouvements
- ✅ Repositionner le dispositif

### Dashboard ne se met pas à jour
- ✅ Vérifier connexion serveur (F12 → Console)
- ✅ Rafraîchir la page
- ✅ Redémarrer serveur

## Support et ressources

### Documentation
- `README.md` - Vue d'ensemble
- `INSTALLATION.md` - Installation
- `ARCHITECTURE.md` - Architecture technique
- `USAGE.md` - Ce guide

### API
- REST API : http://localhost:3000/api
- Health check : http://localhost:3000/health

### Communauté
- Issues GitHub pour bugs
- Discussions pour questions
- Pull requests bienvenues !

## Prochaines fonctionnalités

- [ ] Heatmaps avancées avec agrégation multi-sessions
- [ ] Export PDF des rapports
- [ ] Machine learning pour prédictions émotionnelles
- [ ] Support multi-utilisateurs simultanés
- [ ] Intégration avec outils analytics externes

---

**Bon tracking ! 🧠👁️**
