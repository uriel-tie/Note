require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const session = require('express-session');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Ajout pour gérer les formulaires HTML
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


// Configuration PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


app.get('/note', (req, res) => {
    res.sendFile(path.join(__dirname, 'saisie_note.html'));
});
app.get('/tab_note', (req, res) => {
    res.sendFile(path.join(__dirname, 'tab_note.html'));
});


app.get("/etudiants", async (req, res) => {
  try {
      const result = await pool.query("SELECT id_etudiant, nom FROM etudiant WHERE id_classe = 1");
      res.json(result.rows);
  } catch (err) {
      console.error("Erreur SQL :", err);
      res.status(500).json({ error: err.message });
  }
});

app.post('/notes', async (req, res) => {
  const { numeroNote, coefficient, notes } = req.body;

  if (!numeroNote || !coefficient || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ error: 'Données manquantes ou incorrectes' });
  }

  try {
      const client = await pool.connect();

      for (const note of notes) {
          const { id_etudiant, noteValue } = note;
          const id_ue = 1; // Adapter selon le contexte

          await client.query(
              'INSERT INTO note (id_etudiant, id_ue, valeur, coefficient, ordre) VALUES ($1, $2, $3, $4, $5)',
              [id_etudiant, id_ue, noteValue, coefficient, numeroNote]
          );
      }

      client.release();
      res.status(200).json({ message: 'Notes ajoutées avec succès' });
  } catch (err) {
      console.error('Erreur lors de l\'ajout des notes', err);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get("/notes", async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT id_etudiant, ordre, valeur, coefficient 
          FROM note 
          ORDER BY ordre ASC
      `);
      res.json(result.rows); // On envoie result.rows
  } catch (error) {
      console.error("Erreur lors de la récupération des notes :", error);
      res.status(500).json({ message: "Erreur serveur" });
  }
});









// Vérifier la connexion à la base de données
pool.connect()
    .then(client => {
        console.log("Connexion réussie à la base de données !");
        client.release(); // Libère le client une fois le test terminé
    })
    .catch(err => console.error("Erreur de connexion à la base de données :", err));

    // Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});