const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/after_eid', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch((err) => {
    console.error('Erreur de connexion MongoDB:', err);
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // à mettre true en production avec HTTPS
}));

// Configuration du moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'AFTER EID' });
});

// Route API pour tester
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
