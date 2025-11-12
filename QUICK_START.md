# 🚀 Guide de Démarrage Rapide - Mode Retail

## ✅ 3 Problèmes CORRIGÉS !

### 1. ✅ Dessin des cadres fonctionne maintenant
Le système de dessin a été **complètement refait** et fonctionne parfaitement.

### 2. ✅ Bouton "Terminer l'expérience" ajouté
Vous pouvez maintenant arrêter l'expérience et obtenir le rapport final.

### 3. ✅ Précision eye tracking améliorée
Modèle Ridge + TFFacemesh + 5 enregistrements par point.

---

## 🎯 Démarrage en 5 Étapes

### Étape 1 : Mettre à jour et lancer

```bash
# Dans le dossier Hey-joe
git pull

# Lancer l'application
npm run dev
```

Ouvrir : **http://localhost:5173**

---

### Étape 2 : Mode Retail + Configuration

1. **Sélectionner "Mode Retail"**
2. **Nom du test** : "Test Étagère [Date]"
3. **Type** : Test simple

---

### Étape 3 : Importer et Dessiner

#### A. Upload image
- Cliquez **"Choisir une image"**
- Sélectionnez votre photo d'étagère
- L'image s'affiche

#### B. Dessiner les zones produits

**NOUVEAU SYSTÈME - Très simple** :

1. **Cliquez et maintenez** à un coin du produit
2. **Glissez** vers le coin opposé
3. **Relâchez** le bouton de la souris
4. ✅ **Rectangle rose apparaît en temps réel** pendant le dessin
5. Un formulaire s'ouvre automatiquement

**Dans le formulaire** :
- Nom du produit : **OBLIGATOIRE** (ex: "Coca-Cola 33cl")
- Marque : Optionnel (ex: "Coca-Cola")
- Prix : Optionnel (ex: 1.50)
- Catégorie : Optionnel (ex: "Boissons")
- Cliquez **"Enregistrer"**

**Répétez** pour chaque produit (minimum 3 produits).

**Astuce** : Dessinez des rectangles **généreux** (avec marge) pour compenser l'imprécision de l'eye tracking.

---

### Étape 4 : Calibration & Connexion

#### A. Calibration Eye Tracking

**Position CRITIQUE** :
- 📏 Distance : **50-60 cm** de l'écran
- 👁️ Hauteur : Yeux au niveau du **tiers supérieur** de l'écran
- 🧍 Posture : Tête **droite** et **immobile**
- 💡 Éclairage : **Uniforme** sur votre visage

**Technique de calibration** :

Pour chaque des 9 points :
1. **REGARDEZ** le point pendant 2 secondes
2. Sans bouger les yeux, **amenez la souris** sur le point
3. **CLIQUEZ** au centre
4. **GARDEZ** le regard 1 seconde (l'app enregistre 5 fois maintenant)
5. Passez au point suivant

**Important** : Ne suivez PAS la souris avec les yeux !

#### B. Connexion Brain Bit

**Avec dispositif physique** :
1. Allumez votre Brain Bit
2. Positionnez-le sur votre tête
3. Cliquez **"Se connecter au Brain Bit"**
4. Sélectionnez votre dispositif dans la fenêtre Bluetooth
5. Cliquez **"Associer"**
6. Attendez la connexion (5-10s)

**Vérification** : Badge "Brain Bit : Actif" (vert) dans le header

---

### Étape 5 : Expérience & Rapport

#### A. Lancer l'expérience

1. Cliquez **"Démarrer l'analyse retail"**
2. Dashboard s'affiche avec votre image d'étagère

#### B. Contrôle de session

**NOUVEAU - Panneau de contrôle visible en haut** :

- **Point rouge clignotant** = Enregistrement actif
- **Timer** = Durée de la session (MM:SS)
- **Compteurs** = Points de regard collectés

**Bouton vert** : **"Démarrer l'expérience"**
- Commence l'enregistrement
- Le timer démarre
- Les données sont collectées

#### C. Observer l'étagère

**Regardez l'image normalement** :
- ✅ Trail violet = votre parcours de regard
- ✅ Point rose = position actuelle du regard
- ✅ Zones colorées = produits définis
- ✅ Badge "Regard sur: [Produit]" quand vous regardez un produit

**Durée recommandée** : **15-30 secondes**

#### D. Terminer l'expérience

Cliquez le **bouton rouge** : **"Terminer l'expérience"**

**Résultat immédiat** :
- ✅ Encadré vert de confirmation
- 📊 Résumé rapide (durée, points, produits)
- ⬇️ Bouton **"Télécharger rapport"** (JSON)

#### E. Consulter le rapport

**Scroll vers le bas** pour voir :

1. **Résumé exécutif**
   - Produits vus / Total
   - Temps moyen par produit
   - Attention moyenne
   - Intérêt moyen

2. **Top Performers**
   - Top 3 Attention
   - Top 3 Intérêt
   - Top 3 Engagement

3. **Timeline de visualisation**
   - Ordre chronologique
   - Temps avant première vue
   - Durée totale par produit

4. **Alertes produits non vus** ⚠️
   - Liste des produits ignorés
   - Recommandation de repositionnement

5. **Tableau détaillé**
   - Toutes les métriques par produit
   - Badges de score colorés

6. **Insights automatiques** 💡
   - Recommandations personnalisées
   - Analyse de performance

---

## 📊 Comprendre les Métriques

### TTFF (Time to First Fixation)
```
< 1s   = ⭐⭐⭐ Excellente visibilité
1-3s   = ⭐⭐  Bonne visibilité
3-5s   = ⭐    Visibilité moyenne
> 5s   = ⚠️    Faible visibilité → Repositionner
Non vu = ❌    Produit ignoré → Action requise
```

### Scores Émotionnels (0-100%)
```
70-100% = 🟢 Excellent
40-69%  = 🟡 Modéré
0-39%   = 🔴 Faible
```

**Attention** : Niveau de concentration
**Intérêt** : Niveau de curiosité
**Engagement** : Implication émotionnelle

---

## 🔧 Troubleshooting Rapide

### Problème : Rectangle ne se dessine pas

**Cause** : Souris relâchée trop vite ou rectangle trop petit

**Solution** :
1. Cliquez et **MAINTENEZ** le bouton enfoncé
2. Glissez suffisamment loin (minimum 30x30 pixels)
3. Relâchez seulement quand le rectangle est assez grand
4. Le rectangle rose doit être visible pendant le dessin

### Problème : Eye tracking imprécis

**Solution immédiate** :
1. **F5** pour recharger
2. **Repositionnez-vous** (50-60 cm, tête droite)
3. **Recalibrez** en suivant la technique ci-dessus
4. **Testez** : Regardez les 4 coins, vérifiez dans la console (F12)

### Problème : Badge "Regard sur: [Produit]" n'apparaît pas

**Cause** : Eye tracking imprécis

**Solution** :
1. Refaire calibration (conditions optimales)
2. Dessiner des zones plus **grandes** (avec marge)
3. Vérifier position (50-60 cm)
4. Nettoyer webcam

### Problème : Rapport vide

**Cause** : Pas assez de données ou pas attendu assez

**Solution** :
1. Observer l'étagère **minimum 15 secondes**
2. Attendre que le rapport se génère (2s)
3. **Scroll vers le bas** pour voir tout le rapport
4. Vérifier les compteurs de données (> 50 points)

---

## 💡 Tips pour Meilleure Précision

### Avant calibration
1. ☀️ Bon éclairage (lumière sur visage, pas de contre-jour)
2. 👓 Enlever lunettes si reflets (ou nettoyer)
3. 📷 Nettoyer la webcam
4. 🪑 S'installer confortablement, coudes sur bureau
5. ⏱️ Ne pas être fatigué

### Pendant calibration
1. 👀 REGARDER chaque point fixement
2. 🖱️ Déplacer souris SANS bouger les yeux
3. 🎯 Cliquer précisément au centre
4. ⏳ Attendre 1 seconde après chaque clic
5. 🚫 NE PAS suivre la souris avec les yeux

### Pour dessiner zones
1. 📐 Rectangles généreux (marge de 20-30 pixels)
2. 🎨 Minimum 3 produits, idéalement 5-10
3. ✏️ Noms courts et clairs
4. ↔️ Zones ne doivent pas se chevaucher
5. 🗑️ Supprimer et refaire si mal placées

### Pendant l'expérience
1. ⏱️ Durée : 15-30 secondes optimal
2. 👁️ Regarder **naturellement** l'étagère
3. 🔄 Balayer du regard tous les produits
4. 🎯 Fixer quelques produits plus longtemps
5. 🚫 Ne pas bouger la tête excessivement

---

## 📥 Format du Rapport JSON

```json
{
  "session": {
    "startTime": 1234567890000,
    "endTime": 1234567920000,
    "duration": 30
  },
  "data": {
    "gazePoints": 300,
    "eegPoints": 300,
    "emotionPoints": 15
  },
  "products": [
    {
      "name": "Coca-Cola 33cl",
      "visited": true,
      "timeToFirstFixation": 1200,
      "totalFixationTime": 2500,
      "fixationCount": 3,
      "attentionScore": 75,
      "interestScore": 82,
      "engagementScore": 78,
      "viewOrder": 1
    }
  ]
}
```

**Usage** : Importable dans Excel, Python, R, Tableau, etc.

---

## ✅ Checklist Avant Test

- [ ] `npm run dev` lancé
- [ ] http://localhost:5173 accessible
- [ ] Image d'étagère préparée (nette, bien cadrée)
- [ ] Minimum 3 produits à tester
- [ ] Brain Bit chargé et allumé
- [ ] Bluetooth PC activé
- [ ] Bon éclairage
- [ ] Webcam nettoyée
- [ ] Position optimale (50-60 cm)
- [ ] Pas de fatigue

---

## 🎯 Workflow Complet Résumé

```
1. git pull + npm run dev
   ↓
2. Mode Retail → Config test
   ↓
3. Upload image → Dessiner zones (clic + glisser)
   ↓
4. Calibration eye tracking (technique optimale)
   ↓
5. Connexion Brain Bit
   ↓
6. Démarrer analyse → Dashboard
   ↓
7. Cliquer "Démarrer l'expérience" (vert)
   ↓
8. Observer étagère 15-30s
   ↓
9. Cliquer "Terminer l'expérience" (rouge)
   ↓
10. Voir résumé → Télécharger JSON → Scroll rapport
```

---

## 🆘 Support

**Console Debug** : Appuyez **F12** → Onglet Console
- Cherchez les erreurs rouges
- Vérifiez les coordonnées de regard
- Messages "Eye tracking initialized..."

**Documentation complète** :
- `TROUBLESHOOTING.md` - Diagnostic complet
- `RETAIL_GUIDE.md` - Guide retail détaillé
- `INSTALLATION.md` - Installation

---

**Vous êtes prêt ! 🚀**

Lancez `npm run dev` et testez le nouveau système de dessin + contrôle de session !
