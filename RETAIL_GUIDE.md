# Guide Retail - Analyse de Produits sur Étagère

## Vue d'ensemble

Le **Mode Retail** de Hey Joe est spécialement conçu pour l'analyse de produits sur étagères (shelf testing) et l'optimisation du merchandising. Il combine eye tracking et EEG pour comprendre comment les consommateurs perçoivent et réagissent aux produits.

## Cas d'usage

### 1. Merchandising et PLV (Publicité sur Lieu de Vente)
- Optimiser le positionnement des produits
- Tester l'efficacité des PLV
- Identifier les zones chaudes et froides de l'étagère

### 2. Tests A/B de dispositions
- Comparer deux configurations d'étagères
- Mesurer l'impact de changements de disposition
- Identifier la meilleure configuration

### 3. Optimisation de linéaires
- Déterminer les meilleurs emplacements
- Analyser le parcours visuel des consommateurs
- Maximiser la visibilité des produits clés

### 4. Études de packaging
- Tester l'attractivité de nouveaux packagings
- Comparer différents designs
- Mesurer l'impact émotionnel du design

## Workflow complet

### Étape 1 : Préparation

#### A. Préparer l'image de l'étagère
- Prenez une photo de face de votre étagère ou linéaire
- Assurez-vous que l'image est bien cadrée et nette
- Formats acceptés : JPG, PNG
- Résolution recommandée : 1920x1080 minimum

**Conseils photo** :
- Éclairage homogène
- Évitez les reflets
- Photo de face, perpendiculaire à l'étagère
- Incluez tous les produits à analyser

#### B. Lister vos produits
Préparez les informations pour chaque produit :
- Nom du produit
- Marque
- Prix
- Catégorie

### Étape 2 : Configuration dans l'application

#### 1. Sélectionner le Mode Retail
Au lancement de l'application :
1. Cliquez sur **"Mode Retail"**
2. Vous serez dirigé vers la configuration de l'étagère

#### 2. Configurer le test
```
Nom du test : Test Disposition Produits Janvier 2024
Type de test : Test simple ou Test A/B
```

#### 3. Importer l'image
1. Cliquez sur **"Choisir une image"**
2. Sélectionnez votre photo d'étagère
3. L'image s'affiche à l'écran

#### 4. Définir les zones produits (AOI - Areas of Interest)

**Méthode :**
1. Cliquez et glissez sur l'image pour dessiner un rectangle autour de chaque produit
2. Une fenêtre s'ouvre pour entrer les détails :
   - Nom du produit **(obligatoire)**
   - Marque
   - Prix (€)
   - Catégorie
3. Cliquez sur **"Enregistrer"**
4. Répétez pour tous les produits

**Conseils** :
- Dessinez des rectangles précis autour de chaque produit
- Nommez clairement vos produits (ex: "Coca-Cola 33cl")
- Incluez même les produits en arrière-plan si visibles

**Exemple de configuration** :
```
Produit 1 : Coca-Cola 33cl
  Marque : Coca-Cola
  Prix : 1.50€
  Catégorie : Boissons gazeuses

Produit 2 : Pepsi 33cl
  Marque : Pepsi
  Prix : 1.45€
  Catégorie : Boissons gazeuses
```

#### 5. Continuer vers la calibration
Une fois tous les produits définis :
1. Cliquez sur **"Continuer vers la calibration"**
2. Calibrez l'eye tracking (9 points)
3. Connectez Brain Bit (ou mode démo)

### Étape 3 : Réaliser le test

#### Préparation du participant
1. **Position** : Asseyez le participant à 50-70cm de l'écran
2. **Instructions** : "Regardez l'étagère comme vous le feriez en magasin. Prenez votre temps."
3. **Durée** : 30 secondes à 2 minutes selon objectif

#### Pendant le test
L'application enregistre automatiquement :
- Tous les mouvements oculaires
- Les fixations sur chaque produit
- L'activité cérébrale (EEG)
- Les émotions ressenties

#### Visualisation temps réel
Sur le dashboard retail, vous voyez :
- **Trail du regard** : Parcours visuel en temps réel
- **Produit actuel** : Quel produit est regardé maintenant
- **Zones produits** : Rectangles colorés autour de chaque produit
- **Highlight** : Le produit actuellement regardé est mis en évidence

### Étape 4 : Analyser les résultats

## Métriques Retail

### 1. Métriques de base

#### Temps jusqu'à première fixation (Time to First Fixation - TTFF)
```
Définition : Temps écoulé avant que le produit soit regardé pour la première fois
Interprétation :
  - < 1s : Très visible, excellent placement
  - 1-3s : Bonne visibilité
  - 3-5s : Visibilité moyenne
  - > 5s : Faible visibilité, repositionner
```

#### Durée totale de fixation
```
Définition : Temps total passé à regarder le produit
Interprétation :
  - > 2s : Fort intérêt
  - 1-2s : Intérêt modéré
  - < 1s : Intérêt faible
```

#### Nombre de fixations
```
Définition : Nombre de fois où le produit a été regardé
Interprétation :
  - > 3 : Produit revisité, intérêt soutenu
  - 2-3 : Intérêt standard
  - 1 : Vue unique
  - 0 : Produit ignoré (problème!)
```

### 2. Scores émotionnels (0-100%)

#### Score d'Attention
```
Comment c'est calculé :
  - Activité Beta (concentration) pendant les fixations
  - Pondéré par durée totale de fixation

Interprétation :
  - 70-100% : Très forte attention, produit captivant
  - 40-69% : Attention modérée
  - 0-39% : Faible attention
```

#### Score d'Intérêt
```
Comment c'est calculé :
  - Analyse émotionnelle pendant les fixations
  - Bonus si produit revisité (intérêt soutenu)

Interprétation :
  - 70-100% : Très fort intérêt, potentiel d'achat élevé
  - 40-69% : Intérêt modéré
  - 0-39% : Faible intérêt
```

#### Score d'Engagement
```
Comment c'est calculé :
  - Combinaison EEG + qualité des fixations
  - Nombre et durée des fixations

Interprétation :
  - 70-100% : Fort engagement émotionnel
  - 40-69% : Engagement modéré
  - 0-39% : Faible engagement
```

### 3. Ordre de visualisation

L'application indique dans quel ordre les produits ont été regardés.

**Implications** :
- **Position 1-3** : Produits vus en premier, excellente visibilité
- **Position 4-6** : Visibilité moyenne
- **Position 7+** : Visibilité faible
- **Non vu** : Problème critique, repositionner

### 4. Taux de couverture

```
Taux de couverture = (Produits vus / Total produits) × 100

Interprétation :
  - 80-100% : Excellente disposition
  - 60-79% : Bonne disposition
  - 40-59% : Disposition moyenne, optimisations possibles
  - < 40% : Mauvaise disposition, refonte nécessaire
```

## Rapport de Merchandising

Le rapport complet inclut :

### 1. Résumé exécutif
- Nombre de produits vus
- Temps moyen par produit
- Attention moyenne
- Intérêt moyen

### 2. Top Performers
- **Top 3 Attention** : Produits les plus remarqués
- **Top 3 Intérêt** : Produits suscitant le plus d'intérêt
- **Top 3 Engagement** : Produits générant le plus d'émotion

### 3. Ordre de visualisation
Liste chronologique des produits vus avec :
- Position dans le parcours
- Temps avant première vue
- Durée totale de fixation

### 4. Produits non vus (alerte)
Liste des produits ignorés avec recommandation de repositionnement

### 5. Tableau détaillé
Pour chaque produit :
- Ordre de vue
- TTFF (Time to First Fixation)
- Nombre de fixations
- Durée totale
- Scores (attention, intérêt, engagement)

### 6. Insights & Recommandations
L'IA génère des insights automatiques :
- "Excellent taux de couverture (85%)"
- "Produit X est le produit star avec 89% d'attention"
- "3 produits revisités, montrant un intérêt soutenu"
- "Faible taux de couverture, repositionner les produits non vus"

## Optimisations recommandées

### Règles d'or du Merchandising (basées sur les données)

#### 1. Zone Chaude (Hot Zone)
```
Position : Centre et hauteur des yeux
Résultats typiques :
  - TTFF < 2s
  - Attention > 70%
  - Intérêt > 65%

Action : Placer les produits stratégiques ici
```

#### 2. Zone Tiède (Warm Zone)
```
Position : Côtés et mi-hauteur
Résultats typiques :
  - TTFF 2-4s
  - Attention 50-70%
  - Intérêt 45-65%

Action : Produits complémentaires ou marges moyennes
```

#### 3. Zone Froide (Cold Zone)
```
Position : Extrémités et hauteurs basse/haute
Résultats typiques :
  - TTFF > 5s ou non vus
  - Attention < 50%
  - Intérêt < 45%

Action : Éviter, ou placer produits à forte rotation qui se vendent seuls
```

### Stratégies d'optimisation

#### Si un produit n'est pas vu :
1. **Déplacer vers zone chaude** (centre, hauteur yeux)
2. **Augmenter la taille** (facing multiple)
3. **Ajouter PLV** (stop-rayon, wobblers)
4. **Contraste couleur** (se démarquer des voisins)

#### Si un produit a faible intérêt malgré bonne visibilité :
1. **Revoir le packaging** (moins attractif que prévu)
2. **Prix visible** (ajouter étiquette prix attractive)
3. **Contexte** (associer avec produits complémentaires)

#### Pour maximiser les ventes :
1. **Produits à forte marge** → Zone chaude
2. **Produits d'appel (prix bas)** → Zone chaude pour attirer
3. **Marques nationales** → Zones tièdes (se vendent seules)
4. **Marques distributeur** → Proximité avec marques nationales

## Tests A/B

Pour comparer deux dispositions différentes :

### Configuration
1. Créez deux tests séparés :
   - Test A : Disposition actuelle
   - Test B : Disposition alternative
2. Testez avec même nombre de participants
3. Comparez les résultats

### Métriques de comparaison
- Taux de couverture (A vs B)
- Attention moyenne (A vs B)
- Intérêt moyen (A vs B)
- Top 3 produits (changements?)
- Temps total de visualisation

### Décision
Choisissez la disposition avec :
- ✅ Taux de couverture plus élevé
- ✅ Attention moyenne plus élevée
- ✅ Intérêt moyen plus élevé
- ✅ Meilleure visibilité des produits stratégiques

## Cas pratiques

### Exemple 1 : Optimisation rayon boissons

**Situation initiale** :
- 12 produits
- Taux de couverture : 58%
- Coca-Cola en bas à gauche : TTFF = 8s

**Actions** :
1. Déplacer Coca-Cola au centre
2. Ajouter PLV stop-rayon sur produits invisibles
3. Réduire nombre de facings produits peu performants

**Résultats après optimisation** :
- Taux de couverture : 83% (+25%)
- Coca-Cola : TTFF = 1.2s
- Ventes : +15% sur produits optimisés

### Exemple 2 : Lancement nouveau produit

**Objectif** : Maximiser visibilité nouveau produit

**Test 1** :
- Nouveau produit à droite : TTFF = 12s, vu par 40% participants

**Test 2** :
- Nouveau produit au centre : TTFF = 1.8s, vu par 95% participants

**Décision** : Centre choisi, lancement réussi

### Exemple 3 : Optimisation packaging

**Test** : 3 versions de packaging

**Résultats** :
- Version A : Intérêt = 45%
- Version B : Intérêt = 68%
- Version C : Intérêt = 59%

**Décision** : Version B choisie pour production

## Export et partage des données

### Export JSON
```bash
curl http://localhost:3000/api/sessions/{session_id}/export > rapport_retail.json
```

### Analyse externe
Les données peuvent être analysées avec :
- **Excel/Google Sheets** : Tableaux et graphiques
- **Python** : Analyse statistique approfondie
- **Tableau/Power BI** : Dashboards interactifs
- **R** : Analyses statistiques avancées

### Format des données exportées
```json
{
  "session": {...},
  "data": {
    "gaze": [...],
    "eeg": [...],
    "emotion": [...]
  },
  "stats": {
    "productMetrics": {
      "product_1": {
        "timeToFirstFixation": 1200,
        "totalFixationTime": 2500,
        "attentionScore": 75,
        ...
      }
    }
  }
}
```

## Bonnes pratiques

### Pour des résultats fiables

1. **Nombre de participants** : Minimum 10-15 par test
2. **Durée des sessions** : 30s à 2 min max
3. **Profil des participants** : Représentatif de la cible
4. **Conditions de test** : Identiques pour tous (éclairage, distance, etc.)
5. **Instructions claires** : "Regardez comme en magasin"

### Erreurs à éviter

❌ **Ne pas** tester avec moins de 5 participants
❌ **Ne pas** guider le regard ("regardez le produit rouge")
❌ **Ne pas** faire des sessions trop longues (fatigue)
❌ **Ne pas** négliger la calibration eye tracking
❌ **Ne pas** comparer des sessions avec conditions différentes

### Checklist pré-test

- [ ] Image d'étagère nette et bien cadrée
- [ ] Tous les produits définis avec zones AOI précises
- [ ] Calibration eye tracking effectuée
- [ ] Brain Bit connecté (ou mode démo actif)
- [ ] Participant bien positionné
- [ ] Instructions données clairement

## Support et ressources

- **Guide général** : [USAGE.md](./USAGE.md)
- **Installation** : [INSTALLATION.md](./INSTALLATION.md)
- **Architecture** : [ARCHITECTURE.md](./ARCHITECTURE.md)

## FAQ Retail

**Q : Combien de produits puis-je analyser ?**
R : Pas de limite technique, mais recommandé < 20 produits pour sessions courtes.

**Q : Puis-je tester une étagère complète de supermarché ?**
R : Oui ! Prenez une photo large et définissez toutes les zones.

**Q : Le mode démo EEG fonctionne-t-il pour le retail ?**
R : Oui, parfait pour tester l'application sans dispositif Brain Bit.

**Q : Puis-je réutiliser une configuration d'étagère ?**
R : Pas encore, mais vous pouvez exporter/importer la configuration JSON.

**Q : Comment interpréter un score d'attention de 45% ?**
R : C'est modéré. Le produit est vu mais ne capte pas fortement l'attention.

**Q : Un produit avec TTFF élevé est-il forcément mal placé ?**
R : Généralement oui, sauf si c'est un produit de destination (que les clients cherchent activement).

---

**Bon merchandising ! 🛒📊**
