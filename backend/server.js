// backend/server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Exemple d’API (à adapter pour ta boutique)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bienvenue sur Yessay Dans Le Temps 🚀" });
});

// Catch-all pour React/Vue/JS frontend SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
