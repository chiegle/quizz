# 🏆 Quiz Tracker Dashboard

Une application web moderne pour suivre et comparer les scores quotidiens du quiz "La Table des Savoirs" entre amis.

## 🚀 Déploiement (Vercel + Supabase)

Pour mettre ce site en ligne 24h/24 pour tes amis, suis ces étapes :

### 1. Préparation de la Base de Données
1. Crée un compte sur [Supabase](https://supabase.com/) ou [Neon.tech](https://neon.tech/).
2. Crée un nouveau projet et récupère ton **URL de connexion PostgreSQL** (Connection String).
   - Format : `postgresql://user:password@host:port/dbname?schema=public`

### 2. Publication sur GitHub
1. Crée un nouveau dépôt (privé ou public) sur GitHub.
2. Initialise et pousse ton code :
   ```bash
   git add .
   git commit -m "Initial commit - Production ready"
   git push origin master
   ```

### 3. Mise en ligne sur Vercel
1. Crée un compte sur [Vercel](https://vercel.com/) et connecte ton compte GitHub.
2. Clique sur **"Add New Project"** et sélectionne ton dépôt `quiz-tracker`.
3. Dans la section **Environment Variables**, ajoute la variable suivante :
   - `DATABASE_URL` : (Copie ici l'URL de connexion de ton étape 1)
4. Clique sur **Deploy**.

### 4. Initialisation de la Base de Données
Une fois le site déployé (ou avant sur ton PC), lance cette commande pour créer les tables sur ta base distante :
```bash
npx prisma db push
```

## 🛠️ Développement Local

1. Installe les dépendances : `npm install`
2. Configure ton `.env` (utilise SQLite pour le local si tu veux : `file:./dev.db`)
3. Lance le serveur : `npm run dev`
4. Ouvre [http://localhost:3000](http://localhost:3000)

## ✨ Fonctionnalités
- ✅ Authentification simple par Pseudo + PIN 4 chiffres.
- ✅ Classements Solo (Journalier / Mensuel).
- ✅ Classement Couples (Somme des points du mois).
- ✅ Panel Admin pour gérer les utilisateurs et les couples.
- ✅ Mode sombre avec un design premium.
