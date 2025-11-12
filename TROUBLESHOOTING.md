# 🔧 Guide de Troubleshooting - Hey Joe

## 🎯 Problème 1 : Eye Tracking Imprécis

### Améliorations apportées au code

✅ **Changements effectués** :
- Modèle de régression amélioré (Ridge au lieu de Linear)
- Tracker TFFacemesh activé (plus précis)
- Enregistrement de 5 points par clic de calibration
- Filtre de Kalman optimisé
- Sauvegarde des données entre sessions

### Checklist de précision

#### 1. Conditions physiques

**Position obligatoire** :
```
Distance écran : 50-60 cm (testez avec votre bras tendu)
Hauteur des yeux : Niveau du tiers supérieur de l'écran
Tête : Droite, immobile, face à l'écran
```

**Éclairage critique** :
```
✅ Lumière uniforme sur votre visage
✅ Pas de fenêtre derrière vous (contre-jour)
✅ Pas de reflets sur vos lunettes (si vous en portez)
✅ Pièce bien éclairée mais pas éblouissante
```

**Webcam** :
```
✅ Nettoyer l'objectif avec un chiffon doux
✅ Webcam stable (pas sur un support qui bouge)
✅ Qualité minimale : 720p à 30fps
✅ Webcam au centre de l'écran (pas sur le côté)
```

#### 2. Technique de calibration

**TRÈS IMPORTANT - Méthode optimale** :

1. **Préparez-vous** :
   - Installez-vous confortablement
   - Posez vos coudes sur le bureau
   - Stabilisez votre tête

2. **Pour chaque point** (9 points) :
   ```
   Étape 1 : REGARDEZ fixement le point pendant 2 secondes
   Étape 2 : Sans bouger les yeux, amenez la souris sur le point
   Étape 3 : CLIQUEZ au centre exact du point
   Étape 4 : GARDEZ le regard sur le point encore 1 seconde
   Étape 5 : Le point suivant apparaît automatiquement
   ```

3. **Erreurs à éviter** :
   ```
   ❌ NE PAS suivre la souris avec les yeux
   ❌ NE PAS bouger la tête pendant la calibration
   ❌ NE PAS cliquer rapidement sans regarder
   ❌ NE PAS faire la calibration en étant fatigué
   ```

#### 3. Test de précision après calibration

Après la calibration, testez :

1. **Ouvrez la console** du navigateur (F12)
2. **Regardez un coin de l'écran** (ex: coin supérieur gauche)
3. **Vérifiez dans la console** : les coordonnées doivent correspondre
4. **Répétez** pour les 4 coins + centre

**Si imprécis** : Recommencez la calibration

#### 4. Recalibration en cours de session

Si la précision se dégrade pendant l'utilisation :
- La précision peut diminuer après 10-15 minutes
- Solution : Refaites une calibration rapide
- En mode retail : Cliquez sur "Tracking" → Refaire calibration

### Test de diagnostic

Après calibration, vérifiez dans la console (F12) :

```javascript
// Vous devriez voir ces messages :
"Eye tracking initialized with high precision settings"
"Eye tracking is now active"

// Pendant le tracking, vous devriez voir des coordonnées :
{x: 500, y: 300, timestamp: 1234567890}
```

---

## 📊 Problème 2 : Pas de Résultats d'Analyse

### Mode Retail - Checklist

Si vous êtes en **Mode Retail** et n'avez pas de résultats :

#### ✅ Étape 1 : Vérifier la configuration

**Zones produits définies** :
```
1. Allez dans "Configuration de l'étagère"
2. Vérifiez que vous avez défini AU MOINS 1 zone produit
3. Les zones doivent être visibles (rectangles colorés)
```

**Si zones mal définies** :
- Supprimez-les et recréez-les
- Assurez-vous que les rectangles couvrent bien les produits
- Les zones ne doivent pas se chevaucher

#### ✅ Étape 2 : Vérifier la collecte de données

**Ouvrez la console** (F12) et vérifiez :

```javascript
// Vous devriez voir défiler :
"Gaze data: {x: 500, y: 300, timestamp: ...}"
"EEG data: {alpha: 45, beta: 32, ...}"

// Si vous ne voyez rien :
// → Eye tracking ou Brain Bit pas actifs
```

**Données minimales requises** :
- Eye tracking : Minimum 50 points de regard (5 secondes)
- EEG : Minimum 50 échantillons (5 secondes)
- Session : Minimum 10 secondes d'observation

#### ✅ Étape 3 : Vérifier que vous regardez l'étagère

**Dans le dashboard retail** :
- L'image de l'étagère doit être affichée
- Vous devez voir le trail violet (parcours du regard)
- Le point rose indique votre regard actuel
- Les zones produits doivent être visibles

**Test simple** :
1. Regardez un produit spécifique sur l'étagère
2. Le badge "Regard sur : [Nom produit]" doit apparaître en haut
3. Si aucun badge n'apparaît → Problème de détection

#### ✅ Étape 4 : Attendre suffisamment

**Le rapport s'affiche après** :
- Minimum 10 secondes d'observation
- L'analyse se met à jour toutes les 2 secondes
- Scroll vers le bas pour voir le rapport complet

**Sections du rapport** :
1. **Résumé** : Produits vus / Total
2. **Top Performers** : Top 3 par métrique
3. **Timeline** : Ordre de visualisation
4. **Alertes** : Produits non vus (si applicable)
5. **Tableau détaillé** : Toutes les métriques
6. **Insights** : Recommandations automatiques

### Mode Général - Checklist

Si vous êtes en **Mode Général** :

#### ✅ Vérifier les composants actifs

Le dashboard général affiche :
1. **Eye Tracking** : Trail du regard (gauche)
2. **EEG** : Graphiques des ondes cérébrales (droite)
3. **Analyse émotionnelle** : 4 dimensions (Attention, Engagement, Stress, Intérêt)

**Si sections vides** :
- Attendez 5-10 secondes pour collecte de données
- Vérifiez que Eye Tracking + Brain Bit sont bien actifs (badges verts)

### Diagnostic Avancé

#### Console de debug (F12)

Exécutez ces commandes dans la console :

```javascript
// 1. Vérifier le store
const store = window.__ZUSTAND_STORE__
console.log('Gaze data points:', store?.gazeData?.length)
console.log('EEG data points:', store?.eegData?.length)
console.log('Emotion data points:', store?.emotionData?.length)

// 2. En mode retail, vérifier les zones
console.log('Product zones:', store?.productZones?.length)
console.log('Current product:', store?.currentProductViewed)
```

**Résultats attendus** :
- gazeData : > 50 points
- eegData : > 50 points
- emotionData : > 5 points
- productZones : > 0 (en mode retail)

#### Vérifier le serveur WebSocket

Dans la console, cherchez :
```
"✅ Connected to server"
"Session started: session_xxx"
```

**Si vous voyez** :
```
"❌ Disconnected from server"
"Connection error: ..."
```

→ Le serveur backend n'est pas lancé ou a crashé

**Solution** :
```bash
# Terminal serveur
cd server
npm run dev

# Vérifiez que vous voyez :
"🚀 Server running on port 3000"
"📊 WebSocket server ready"
```

### Solutions rapides

#### Solution 1 : Recharger la page

La plus simple :
1. F5 pour recharger
2. Reconfigurer (calibration + connexion)
3. Relancer le test

#### Solution 2 : Vider le cache

```bash
# Dans la console (F12)
localStorage.clear()
sessionStorage.clear()

# Puis recharger (F5)
```

#### Solution 3 : Redémarrer l'application

```bash
# Arrêter (Ctrl+C dans les terminaux)
# Relancer
npm run dev
```

#### Solution 4 : Vérifier les logs

**Console navigateur (F12)** :
- Onglet "Console" : Erreurs JavaScript
- Onglet "Network" : Erreurs de connexion
- Filtrer par "error" ou "warn"

**Terminal serveur** :
- Chercher les erreurs rouges
- Vérifier "Session started"

### Scénarios fréquents

#### Scénario 1 : "Je vois le dashboard mais pas de métriques"

**Cause** : Pas assez de données collectées

**Solution** :
1. Attendez 10-15 secondes
2. Bougez les yeux pour générer des données
3. Vérifiez que les badges sont verts (Eye + Brain Bit actifs)

#### Scénario 2 : "Le rapport retail est vide"

**Cause** : Aucun produit détecté dans votre regard

**Solution** :
1. Vérifiez que les zones produits sont bien définies
2. Regardez DIRECTEMENT les produits sur l'image
3. Les zones doivent correspondre à ce que vous regardez
4. Recalibrez si le regard n'est pas précis

#### Scénario 3 : "Tous les produits sont 'non vus'"

**Cause** : Eye tracking trop imprécis ou zones mal placées

**Solution** :
1. Refaire calibration eye tracking (conditions optimales)
2. Vérifier que les zones produits correspondent bien aux produits
3. Ajuster la taille des zones (plus grandes si besoin)
4. Tester en plein écran (F11)

#### Scénario 4 : "Les graphiques EEG sont plats"

**Cause** : Brain Bit déconnecté ou mal positionné

**Solution** :
1. Vérifier badge "Brain Bit : Actif" (vert)
2. Repositionner le dispositif (meilleur contact)
3. Vérifier que les électrodes touchent bien la peau
4. Reconnecter le Brain Bit

### Mode Debug - Activer les logs détaillés

Ajoutez ceci dans la console (F12) :

```javascript
// Activer logs détaillés
localStorage.setItem('debug', 'true')

// Puis recharger
location.reload()
```

Vous verrez maintenant tous les détails dans la console.

---

## 🎯 Checklist Finale - Test Complet

### Avant de commencer un test retail

- [ ] Serveur lancé (`npm run dev` depuis la racine)
- [ ] http://localhost:5173 accessible
- [ ] Mode Retail sélectionné
- [ ] Image étagère uploadée
- [ ] Minimum 3 zones produits définies
- [ ] Eye tracking calibré (conditions optimales)
- [ ] Brain Bit connecté et positionné
- [ ] Badges verts (Eye + Brain Bit)
- [ ] Dashboard retail affiche l'étagère avec overlay
- [ ] Test : Regarder un produit → Badge "Regard sur: [Produit]" apparaît
- [ ] Attendre 15 secondes d'observation
- [ ] Scroll vers le bas pour voir le rapport complet

### Si tout est OK mais toujours pas de résultats

**Contactez le support avec** :
1. Capture d'écran du dashboard
2. Console (F12) → Export des logs
3. Terminal serveur → Copy des logs
4. Description précise du problème

---

## 💡 Tips Pro

### Améliorer la précision globale

1. **Faire 2 calibrations successives**
   - Première calibration
   - Arrêter eye tracking
   - Refaire immédiatement une 2ème calibration
   - = Précision doublée

2. **Ajouter des points de calibration pendant le test**
   - En mode retail, cliquez sur les coins de l'étagère
   - WebGazer apprend en continu

3. **Sessions courtes**
   - Tests de 30s à 2 min max
   - Recalibrer entre chaque test
   - Éviter fatigue oculaire

4. **Conditions idéales**
   - Matin ou après-midi (pas en soirée fatigué)
   - Bon éclairage naturel
   - Écran mat (pas brillant)
   - Silence (concentration)

### Optimiser les zones produits (retail)

1. **Zones généreuses**
   - Ajoutez 10-20px de marge autour de chaque produit
   - Compense l'imprécision de l'eye tracking

2. **Éviter les petites zones**
   - Minimum 100x100 pixels
   - Sinon difficiles à détecter

3. **Contraste visuel**
   - Produits bien distincts visuellement
   - Éviter les produits trop similaires côte à côte

---

**Besoin d'aide supplémentaire ?**
Ouvrez la console (F12) et partagez les messages d'erreur !
