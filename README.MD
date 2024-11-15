# Exportation de Publications LinkedIn

Ce script utilise Puppeteer pour extraire des publications LinkedIn et les exporter dans un fichier CSV. Suivez ce guide pour configurer et exécuter le script.

## Prérequis

- **Node.js** : Assurez-vous que Node.js est installé sur votre machine. Vous pouvez le télécharger depuis [nodejs.org](https://nodejs.org/).
- **NPM** : NPM est généralement installé avec Node.js. Vérifiez son installation avec `npm -v` dans votre terminal.
- **TypeScript** : Installez TypeScript globalement si ce n'est pas déjà fait :
  ```bash
  npm install -g typescript
  ```

## Installation

1. **Clonez le dépôt** ou téléchargez le fichier `export_posts.ts`.

2. **Installez les dépendances** :
   Ouvrez un terminal dans le répertoire du script et exécutez la commande suivante pour installer Puppeteer et les autres dépendances via le package.json :
   ```bash
   npm install
   ```

## Configuration

1. **Modifiez le script** :
   - Ouvrez `export_posts.ts` dans un éditeur de texte.
   - Remplacez `YOUR_EMAIL` et `YOUR_PASSWORD` par vos identifiants LinkedIn.

2. **Choisissez la page LinkedIn** :
   - Remplacez l'URL dans `await page.goto('https://www.linkedin.com/in/eric-djavid-2154b991/recent-activity/all/', { waitUntil: 'domcontentloaded' });` par l'URL de la page LinkedIn que vous souhaitez cibler.

## Exécution du Script

1. **Lancez le script** :
   Dans le terminal, exécutez la commande suivante :
   ```bash
   ts-node export_posts.ts
   ```

2. **Vérification manuelle** :
   Si une vérification manuelle est requise, entrez le code de vérification dans le terminal lorsque vous y êtes invité.

3. **Extraction des publications** :
   Le script extraira les publications et les enregistrera dans un fichier `linkedin_posts.csv`.

## Résultats

- **Fichier CSV** : Les publications extraites seront enregistrées dans `linkedin_posts.csv` dans le même répertoire que le script.
- **Filtrage** : Seules les publications avec du contenu et au moins un "J'aime" seront incluses.

## Remarques

- **Confidentialité** : Assurez-vous de ne pas partager vos identifiants LinkedIn.
- **Limites** : LinkedIn peut limiter l'accès automatisé à ses pages. Utilisez ce script de manière responsable.

## Aide

Pour toute question ou problème, n'hésitez pas à ouvrir une issue ou à me contacter.

## Contributions

Si vous rencontrez des problèmes d'utilisation ou identifiez des bugs, veuillez me contacter. Ce script est ouvert aux contributions, et les Pull Requests (PR) sont les bienvenues pour améliorer le projet.

---

**Note** : Ce script est à des fins éducatives. Utilisez-le conformément aux conditions d'utilisation de LinkedIn.
