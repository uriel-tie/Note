require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const session = require('express-session');


// Configuration PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

app.use(session({
    secret: 'votre_clé_secrète',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre `true` si vous utilisez HTTPS
}));


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Ajout pour gérer les formulaires HTML
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Pour les formulaires
app.use(express.static(path.join(__dirname, 'Site')));

// Route pour afficher le formulaire de connexion
app.get('/acceuil', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'Acceuil.html'));
});

app.post('/log-ad', (req, res) => {
    const { email, password } = req.body;

    // Vérifier l'admin avec l'email dans la base de données
    pool.query('SELECT * FROM administrateur WHERE email = $1 AND mot_de_passe = $2', [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur interne');
        }

        if (result.rows.length === 0) {
            return res.status(401).send('Admin non trouvé ou mot de passe incorrect');
        }

        // Authentification réussie : stocker l'information dans la session
        req.session.isAdmin = true; // L'utilisateur est authentifié

        // Rediriger vers la page d'administration
        res.redirect('/admin');
    });
});


app.get('/admin', (req, res) => {
    if (!req.session.isAdmin) {
        // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion
        return res.redirect('/login_admin');
    }

    // Si l'utilisateur est authentifié, afficher la page d'administration
    res.sendFile(path.join(__dirname, 'Site', 'admin.html'));
});

app.get('/login_admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'login_admin.html'));
});


// Route pour afficher la gestion des utilisateurs
app.get('/gestion-utilisateurs', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'utilisateur.html'));
});
// Route pour afficher la gestion des professeurs
app.get('/gestion_prof', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'gestion-prof.html'));
});
// Route pour afficher la gestion des etudiants
app.get('/gestion_etud', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'gestion-etud.html'));
});

// Route pour récupérer les filières
app.get('/api/filieres', (req, res) => {
    pool.query('SELECT id_filiere, nom FROM Filiere', (err, result) => {
        if (err) throw err;
        res.json(result.rows); // Envoi des données sous forme de JSON
    });
});

app.get('/afficher_Etud', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT etudiant.nom AS etudiant_nom, etudiant.mot_de_passe, classe.nom AS classe_nom
        FROM etudiant
        JOIN classe ON etudiant.id_classe = classe.id_classe
      `);
      const etudiants = result.rows;
      res.json(etudiants);
    } catch (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
app.get('/afficher_prof', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM professeur');
        const prof = result.rows;
        res.json(prof);
    } catch (err) {
      console.error('Erreur lors de la récupération des Professeur:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  app.get('/afficher_prof_classe/:id', async (req, res) => {
    const profId = parseInt(req.params.id);

    try {
        const result = await pool.query(
            `SELECT c.nom AS nom_classe, u.nom AS nom_ue, pcu.id_professeur
            FROM classe c
            JOIN prof_classe_ue pcu ON c.id_classe = pcu.id_classe
            JOIN ue u ON u.id_ue = pcu.id_ue
            WHERE pcu.id_professeur = $1`, 
            [profId]
        );

        if (result.rowCount > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: "Aucune classe ou UE trouvée pour ce professeur" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post('/ajout_prof', (req, res)=>{
    const{nom, email, mot_de_passe} = req.body;
  pool.query(
    `INSERT INTO professeur (nom, email, mot_de_passe) VALUES ($1, $2, $3)`,
    [nom, email, mot_de_passe],
    (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout du professeur:', err);
            return res.status(500).send("Erreur interne");
        }
        res.redirect('/gestion-utilisateurs'); 
    }
);
  
});


// Route POST pour traiter l'ajout de l'étudiant
app.post('/ajout_Etud', (req, res) => {
    const { nom, mot_de_passe, id_filiere, annee_licence } = req.body;

    // Étape 1 : Récupérer le nom de la filière
    pool.query(
        `SELECT nom FROM Filiere WHERE id_filiere = $1`,
        [id_filiere],
        (err, filiereResult) => {
            if (err) {
                console.error('Erreur lors de la récupération de la filière:', err);
                return res.status(500).send("Erreur interne");
            }

            if (filiereResult.rows.length === 0) {
                return res.status(400).send("Filière non trouvée");
            }

            const nomFiliere = filiereResult.rows[0].nom; // Récupération du nom de la filière

            // Étape 2 : Récupérer la classe correspondante à la filière et à l'année de licence
            pool.query(
                `SELECT id_classe FROM Classe WHERE id_filiere = $1 AND annee = $2 ORDER BY id_classe DESC`,
                [id_filiere, annee_licence],
                (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la récupération de la classe:', err);
                        return res.status(500).send("Erreur interne");
                    }

                    let id_classe = null;
                    let classesExistantes = result.rows;

                    if (classesExistantes.length > 0) {
                        // Si une classe existe déjà, vérifier l'effectif
                        const derniereClasse = classesExistantes[0];
                        pool.query(
                            `SELECT COUNT(*) FROM etudiant WHERE id_classe = $1`,
                            [derniereClasse.id_classe],
                            (err, countResult) => {
                                if (err) {
                                    console.error('Erreur lors de la récupération de l\'effectif:', err);
                                    return res.status(500).send("Erreur interne");
                                }

                                const effectif = parseInt(countResult.rows[0].count);
                                if (effectif < 40) {
                                    // Si l'effectif est inférieur à 40, on ajoute l'étudiant à cette classe
                                    id_classe = derniereClasse.id_classe;
                                    ajouterEtudiant(id_classe);
                                } else {
                                    // Si l'effectif atteint 40, on crée une nouvelle classe
                                    pool.query(
                                        `INSERT INTO Classe (id_filiere, annee, nom) VALUES ($1, $2, $3) RETURNING id_classe`,
                                        [id_filiere, annee_licence, `${nomFiliere}${annee_licence}_${String.fromCharCode(65 + classesExistantes.length)}`], // Lettre pour différencier les classes
                                        (err, newClassResult) => {
                                            if (err) {
                                                console.error('Erreur lors de la création de la classe:', err);
                                                return res.status(500).send("Erreur interne");
                                            }
                                            id_classe = newClassResult.rows[0].id_classe;
                                            ajouterEtudiant(id_classe);
                                        }
                                    );
                                }
                            }
                        );
                    } else {
                        // Si aucune classe n'existe, créer une nouvelle classe
                        pool.query(
                            `INSERT INTO Classe (id_filiere, annee, nom) VALUES ($1, $2, $3) RETURNING id_classe`,
                            [id_filiere, annee_licence, `${nomFiliere}${annee_licence}_A`], // Première classe pour l'année donnée
                            (err, newClassResult) => {
                                if (err) {
                                    console.error('Erreur lors de la création de la classe:', err);
                                    return res.status(500).send("Erreur interne");
                                }
                                id_classe = newClassResult.rows[0].id_classe;
                                ajouterEtudiant(id_classe);
                            }
                        );
                    }

                    // Fonction pour ajouter l'étudiant à la classe
                    function ajouterEtudiant(id_classe) {
                        pool.query(
                            `INSERT INTO Etudiant (nom, mot_de_passe, id_classe, id_filiere) VALUES ($1, $2, $3, $4)`,
                            [nom, mot_de_passe, id_classe, id_filiere],
                            (err) => {
                                if (err) {
                                    console.error('Erreur lors de l\'ajout de l\'étudiant:', err);
                                    return res.status(500).send("Erreur interne");
                                }
                                res.redirect('/gestion-utilisateurs'); 
                            }
                        );
                    }
                }
            );
        }
    );
});

// Route pour afficher la gestion des ue
app.get('/gestion-ue', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'matiere.html'));
});

// 1. Route pour créer une UE
app.post('/api/createUE', (req, res) => {
    const { nom } = req.body;
    // Vérification que le nom de l'UE est fourni
    if (!nom) {
        return res.status(400).json({ error: 'Le nom de l\'UE est requis' });
    }

    // Insertion dans la table UE
    pool.query(
        'INSERT INTO UE (nom) VALUES ($1) RETURNING id_ue, nom',
        [nom],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de la création de l\'UE' });
            }

            // Une fois l'UE ajoutée, on récupère la liste complète des UE
            pool.query('SELECT * FROM UE', (err, ueResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Erreur lors de la récupération des UE' });
                }

                // On renvoie la liste des UE mises à jour au client
                res.json({ success: true, ueList: ueResult.rows });
            });
        }
    );
});
 

// 2. Route pour assigner des UE à une filière et une année
app.post('/api/assignUE', (req, res) => {
    const { ue_ids, id_filiere, annee } = req.body;

    // Vérification des données
    if (!ue_ids || !id_filiere || !annee) {
        return res.status(400).json({ error: 'UEs, Filière et Année sont requis' });
    }

    // Vérifier si l'UE est déjà associée à cette filière pour cette année
    const checkUEQuery = `
        SELECT 1 FROM filiere_annee_ue
        WHERE id_filiere = $1 AND annee = $2 AND id_ue = ANY($3::int[])
    `;

    pool.query(checkUEQuery, [id_filiere, annee, ue_ids], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la vérification des associations' });
        }

        if (result.rows.length > 0) {
            return res.status(400).json({ error: 'Certaines UE sont déjà associées à cette filière et cette année' });
        }

        // Si aucune association existante, insérer les associations
        const insertQuery = `
            INSERT INTO filiere_annee_ue (id_filiere, annee, id_ue)
            SELECT $1, $2, unnest($3::int[])
        `;
        
        pool.query(insertQuery, [id_filiere, annee, ue_ids], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erreur lors de l\'association des UE' });
            }

            res.status(200).json({ message: 'Les UE ont été associées avec succès à la filière et l\'année' });
        });
    });
});

app.get('/api/classes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classe');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les informations d'un professeur
app.get('/api/professeur/:id', async (req, res) => {
    const profId = parseInt(req.params.id);
    try {
        const result = await pool.query('SELECT * FROM professeur WHERE id_professeur = $1', [profId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Professeur non trouvé' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour attribuer une UE à un professeur
app.post('/api/attribuer_ue/:id', async (req, res) => {
    const profId = parseInt(req.params.id);
    const  ueId  = parseInt(req.body.ueId);
    try {
        const result = await pool.query('INSERT INTO professeur_ue (id_professeur, id_ue) VALUES ($1, $2)', [profId, ueId]);
        res.status(201).json({ message: `L'UE a été attribuée au professeur ${profId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour assigner une UE à une classe
app.post('/api/assigner_ue_classe/:id', async (req, res) => {
    const profId = parseInt(req.params.id);
    const classeId = parseInt(req.body.classeId)
    const ueId = parseInt(req.body.ueId);
    try {
        const result = await pool.query('INSERT INTO prof_classe_ue (id_classe, id_ue, id_professeur) VALUES ($1, $2, $3)', [classeId, ueId, profId]);
        res.status(201).json({ message: `L'UE a été assignée à la classe ${classeId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour modifier les informations d'un professeur
app.put('/api/modifier_prof/:id', async (req, res) => {
    const profId = parseInt(req.params.id);
    const { nom, email } = req.body;
    try {
        const result = await pool.query(
            'UPDATE professeur SET nom = $1, email = $2 WHERE id_professeur = $3',
            [nom, email, profId]
        );
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Professeur mis à jour avec succès' });
        } else {
            res.status(404).json({ message: 'Professeur non trouvé' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour supprimer un professeur
app.delete('/api/supprimer_prof/:id', async (req, res) => {
    const profId = parseInt(req.params.id);

    try {
        // Supprimer d'abord les références dans prof_classe_ue
        await pool.query('DELETE FROM prof_classe_ue WHERE id_professeur = $1', [profId]);

        // Ensuite, supprimer le professeur
        const result = await pool.query('DELETE FROM professeur WHERE id_professeur = $1', [profId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Professeur supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Professeur non trouvé' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


// 3. Route pour récupérer la liste des UE existantes
app.get('/api/ues', (req, res) => {
    pool.query('SELECT * FROM UE', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des UE' });
        }

        res.status(200).json(result.rows);
    });
});
app.get('/api/ues/prof/:id', async (req, res) => {
    const profId = parseInt(req.params.id)
    try{
    const result = await pool.query('SELECT * FROM ue JOIN professeur_ue on ue.id_ue = professeur_ue.id_ue WHERE professeur_ue.id_professeur = $1', [profId])
    if (result.rowCount > 0) {
        res.status(200).json(result.rows);
    } else {
        res.status(404).json({ message: 'ue du Professeur non trouvé' });
    }
} catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
}
});
app.delete('/api/deleteUE/:id', async (req, res) => {
    const idUE = req.params.id;

    try {
        const result = await pool.query("DELETE FROM ue WHERE id_ue = $1", [idUE]);

        if (result.rowCount > 0) {
            res.json({ message: "UE supprimée avec succès" });
        } else {
            res.status(404).json({ message: "UE introuvable" });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


//Professeur

app.post('/log-prof', (req, res) => {
    const { email, password } = req.body;

    // Vérifier le professeur dans la base de données
    pool.query('SELECT id_professeur FROM professeur WHERE email = $1 AND mot_de_passe = $2', [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur interne');
        }

        if (result.rows.length === 0) {
            return res.status(401).send('Professeur non trouvé ou mot de passe incorrect');
        }

        const idProf = result.rows[0].id_professeur;

        req.session.id_prof = idProf; // Stocker l'ID dans la session aussi si nécessaire

        // Rediriger vers la page du professeur avec son ID dans l'URL
        res.redirect(`/prof?id=${idProf}`);
    });
});

app.get('/prof', (req, res) => {
    const idProfesseur = req.query.id;
    res.sendFile(path.join(__dirname, 'Site', 'prof.html'));
});

app.get('/afficher_classe', (req, res) => {
    const idProfesseur = req.query.id; // Récupérer l'ID du professeur depuis la requête
  
    if (!idProfesseur) {
        return res.status(400).json({ error: 'ID du professeur manquant' });
    }
  
    const sql = `
      SELECT 
        p.id_professeur, 
        c.id_classe, 
        c.nom AS nom_classe, 
        ue.id_ue,
        ue.nom AS nom_ue
      FROM prof_classe_ue pcu
      JOIN professeur p ON pcu.id_professeur = p.id_professeur
      JOIN classe c ON pcu.id_classe = c.id_classe
      JOIN ue ue ON pcu.id_ue = ue.id_ue
      WHERE p.id_professeur = $1`; // Utilisation de $1 pour éviter les injections SQL
  
    // Utiliser le pool pour exécuter la requête SQL
    pool.query(sql, [idProfesseur], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
        res.json(results.rows); // Retourner les résultats au frontend (assurez-vous d'utiliser results.rows avec pg)
    });
});

app.get('/tab_note', (req, res) => {
    res.sendFile(path.join(__dirname,'Site', 'tab_note.html'));
});
app.get('/note', (req, res) => {
    res.sendFile(path.join(__dirname,'Site', 'saisie_note.html'));
});

app.get("/etudiants/:id_classe", async (req, res) => {
    try {
        const id_classe = parseInt(req.params.id_classe, 10); // Récupération et conversion en entier
        if (isNaN(id_classe)) {
            return res.status(400).json({ error: "id_classe invalide" });
        }
  
        const result = await pool.query("SELECT id_etudiant, nom FROM etudiant WHERE id_classe = $1", [id_classe]);
        res.json(result.rows);
    } catch (err) {
        console.error("Erreur SQL :", err);
        res.status(500).json({ error: err.message });
    }
  });
  app.get("/notes/:idclasse/:idue", async (req, res) => {
    const idclasse = req.params.idclasse;
    const idUE = req.params.idue;
    try {
        const result = await pool.query(
            `SELECT n.id_etudiant, n.ordre, n.valeur, n.coefficient 
            FROM note n
            INNER JOIN etudiant e ON n.id_etudiant = e.id_etudiant
            WHERE e.id_classe = $1 AND n.id_ue = $2
            ORDER BY n.ordre ASC`,
            [idclasse, idUE] // Passer les deux paramètres pour sécuriser la requête
        );
        res.json(result.rows); // Renvoie uniquement les notes de la classe et de l'UE spécifiée
    } catch (error) {
        console.error("Erreur lors de la récupération des notes :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

  app.post('/notes/:idclasse/:idue', async (req, res) => {
    const { numeroNote, coefficient, notes } = req.body;
    const idclasse = req.params.idclasse;
    const idUE = req.params.idue;

    if (!numeroNote || !coefficient || !Array.isArray(notes) || notes.length === 0) {
        return res.status(400).json({ error: 'Données manquantes ou incorrectes' });
    }

    try {
        const client = await pool.connect();

        // Vérifier si l'ordre de la note existe déjà pour la classe et l'UE
        const checkQuery = `
            SELECT 1 FROM note 
            WHERE id_ue = $1 
            AND ordre = $2 
            AND id_etudiant IN (SELECT id_etudiant FROM etudiant WHERE id_classe = $3)
            LIMIT 1;
        `;
        const checkResult = await client.query(checkQuery, [idUE, numeroNote, idclasse]);

        if (checkResult.rowCount > 0) {
            client.release();
            return res.status(400).json({ error: 'Un ordre de note similaire existe déjà pour cette classe et cette UE' });
        }

        // Insérer les nouvelles notes si l'ordre n'existe pas
        for (const note of notes) {
            const { id_etudiant, noteValue } = note;
            await client.query(
                'INSERT INTO note (id_etudiant, id_ue, valeur, coefficient, ordre) VALUES ($1, $2, $3, $4, $5)',
                [id_etudiant, idUE, noteValue, coefficient, numeroNote]
            );
        }

        client.release();
        res.status(200).json({ message: 'Notes ajoutées avec succès' });
    } catch (err) {
        console.error('Erreur lors de l\'ajout des notes', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/log-etud', (req, res) => {
    const { matricule, password } = req.body;

    // Vérifier l'admin avec l'email dans la base de données
    pool.query('SELECT * FROM etudiant WHERE id_etudiant = $1 AND mot_de_passe = $2', [matricule, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur interne');
        }

        if (result.rows.length === 0) {
            return res.status(401).send('etudiant non trouvé ou mot de passe incorrect');
        }

     
        // Rediriger vers la page d'administration
        res.redirect(`/etudiant/${matricule}`);
    });
});

app.get('/etudiant/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'Site', 'etudiant.html'));
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