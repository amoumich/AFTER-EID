const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB (optionnelle, ne bloque pas le serveur)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    }).then(() => {
        console.log('✅ Connecté à MongoDB');
    }).catch((err) => {
        console.error('⚠️ Erreur MongoDB (serveur continue):', err.message);
    });
} else {
    console.warn('⚠️ MONGODB_URI non défini - mode sans base de données');
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configuration du moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AFTER EID</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #333; }
                .status { padding: 20px; background: #f0f0f0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>🎉 AFTER EID</h1>
            <div class="status">
                <p>✅ Serveur est EN LIGNE!</p>
                <p>Heure: ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
    `);
});

// Route API pour tester
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date(),
        mongodb: process.env.MONGODB_URI ? '✅ Connecté' : '⚠️ Non connecté'
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});
