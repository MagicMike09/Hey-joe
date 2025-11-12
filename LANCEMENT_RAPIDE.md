# 🚀 Lancement Rapide - Hey Joe

## ✅ Méthode la plus simple : Double-clic

**Fichier à utiliser : `START_APPLICATION.bat`**

### Instructions :

1. **Double-cliquez** sur le fichier `START_APPLICATION.bat` à la racine du projet
2. Une fenêtre noire (terminal) va s'ouvrir
3. Attendez 5-10 secondes
4. Votre navigateur s'ouvrira automatiquement sur http://localhost:5173
5. 🎉 **L'application est lancée !**

### Pour arrêter l'application :
- Fermez simplement la fenêtre noire (terminal)
- OU appuyez sur `Ctrl+C` dans le terminal

---

## 📋 Prérequis

Avant la première utilisation, assurez-vous d'avoir :

### ✅ Node.js installé

**Vérification :**
```bash
node --version
```

Si Node.js n'est pas installé :
1. Téléchargez depuis : https://nodejs.org/
2. Choisissez la version **LTS** (Long Term Support)
3. Version recommandée : **Node.js 20.x** (pas 24.x qui cause des problèmes)
4. Installez avec les options par défaut

---

## 🔧 Méthode alternative : Ligne de commande

Si le fichier .bat ne fonctionne pas, vous pouvez lancer manuellement :

```bash
# 1. Ouvrir un terminal dans le projet
cd C:\Users\mickael.decoppet\Hey-joe

# 2. Aller dans le dossier client
cd client

# 3. Installer les dépendances (première fois seulement)
npm install

# 4. Lancer l'application
npm run dev
```

---

## 📱 Utilisation de l'application

Une fois l'application lancée :

### Mode Retail (Analyse d'étagère) :

1. **Sélectionnez "Mode Retail"**
2. **Importez votre image d'étagère**
3. **Dessinez plusieurs zones produits** :
   - Cliquez et maintenez le bouton gauche
   - Glissez pour dessiner un rectangle
   - Relâchez et remplissez le formulaire
   - Répétez pour chaque produit
4. **Cliquez "Continuer vers la calibration"**
5. **Calibrez l'eye tracking** (suivez les points rouges)
6. **Connectez votre Brain Bit**
7. **Cliquez le bouton vert "DÉMARRER"**
8. **Observez l'étagère pendant 15-30 secondes**
9. **Cliquez le bouton rouge "TERMINER"**
10. **Scrollez vers le bas** pour voir le rapport complet
11. **Cliquez "TÉLÉCHARGER EXCEL"** pour obtenir :
    - Le rapport Excel avec 5 feuilles détaillées
    - L'image PNG de l'étagère avec toutes les zones

---

## ⚠️ Problèmes connus et solutions

### Problème : "Node.js n'est pas installé"
**Solution :** Installez Node.js 20.x depuis https://nodejs.org/

### Problème : "npm : commande introuvable"
**Solution :** Redémarrez votre ordinateur après avoir installé Node.js

### Problème : Erreur "better-sqlite3"
**Solution :** Ce n'est pas grave ! Cette erreur concerne le serveur backend qui n'est PAS nécessaire. L'application fonctionne 100% côté client.

### Problème : Le navigateur ne s'ouvre pas automatiquement
**Solution :** Ouvrez manuellement votre navigateur et allez sur http://localhost:5173

### Problème : "Port 5173 déjà utilisé"
**Solution :** Fermez toutes les autres instances de l'application et réessayez

---

## 📊 Fonctionnalités principales

✅ **Dessin de zones multiples** : Dessinez autant de zones produits que vous voulez
✅ **Eye tracking amélioré** : Précision accrue avec Ridge regression
✅ **Rapport de merchandising visible** : Titre vert bien visible
✅ **Export Excel professionnel** : 5 feuilles avec toutes les métriques
✅ **Image complète de l'étagère** : PNG haute résolution avec zones dessinées

---

## 🆘 Support

En cas de problème :
1. Vérifiez que Node.js 20.x est installé
2. Vérifiez que vous êtes dans le bon dossier
3. Essayez de supprimer le dossier `client/node_modules` et relancez `START_APPLICATION.bat`
4. Redémarrez votre ordinateur

---

## 📝 Notes importantes

- **NE PAS UTILISER** le dossier `server` (il n'est pas nécessaire)
- Tout fonctionne dans le dossier `client`
- L'application est 100% locale (pas de connexion internet requise sauf pour l'installation)
- Les données ne sont jamais envoyées à un serveur externe
