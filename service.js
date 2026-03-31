const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/after_eid', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connecté à MongoDB');
}).catch((err) => {
    console.error('❌ Erreur de connexion MongoDB:', err);
});

// Modèles de données
const Participant = mongoose.model('Participant', new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    uniqueId: { type: String, unique: true, required: true },
    ticketNumber: { type: String, unique: true, required: true },
    
    // Statuts de paiement
    pagnePaid: { type: Boolean, default: false },
    participationPaid: { type: Boolean, default: false },
    fullyValidated: { type: Boolean, default: false },
    
    // QR Code
    qrCodeData: { type: String },
    qrGeneratedAt: { type: Date },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));

const Payment = mongoose.model('Payment', new mongoose.Schema({
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    type: { type: String, enum: ['pagne', 'participation', 'complet'], required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    proofType: { type: String, enum: ['code', 'screenshot'] },
    proofData: { type: String }, // URL de la capture d'écran ou code transaction
    submittedAt: { type: Date, default: Date.now },
    validatedAt: { type: Date },
    notes: { type: String }
}));

// Configuration Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'after-eid-premium-secret-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24h
    }
}));

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Variables globales pour les comptes à rebours
const EVENT_DATE = new Date('2026-05-31T15:00:00'); // Dimanche 31 mai 2026 15h
const PAYMENT_DEADLINE = new Date('2026-05-25T23:59:59'); // Lundi 25 mai 2026 23h59

// Routes principales
app.get('/', (req, res) => {
    try {
        console.log('Route / appelée - Tentative de render index.ejs');
        res.render('index', { 
            title: 'After Eid - Événement Premium',
            eventDate: EVENT_DATE,
            paymentDeadline: PAYMENT_DEADLINE
        });
    } catch (error) {
        console.error('Erreur render index:', error);
        res.status(500).send(`
            <h1>Erreur de rendu</h1>
            <p>Le template index.ejs ne peut pas être rendu</p>
            <p>Erreur: ${error.message}</p>
            <a href="/api/status">Voir le statut API</a>
        `);
    }
});

app.get('/inscription', (req, res) => {
    res.render('inscription', { 
        title: 'Inscription - After Eid',
        pagnePrice: 7000,
        participationPrice: 15000
    });
});

// Route pour soumettre l'inscription
app.post('/inscription', async (req, res) => {
    try {
        const { name, phone, whatsapp, selectedPack, paymentOption } = req.body;
        
        // Vérifier si le participant existe déjà
        const existingParticipant = await Participant.findOne({ 
            $or: [{ phone }, { whatsapp }] 
        });
        
        if (existingParticipant) {
            return res.json({ 
                success: false, 
                error: 'Un participant avec ce numéro de téléphone existe déjà' 
            });
        }
        
        // Créer le participant
        const participant = new Participant({
            name,
            phone,
            whatsapp,
            uniqueId: `AE${Date.now()}`,
            ticketNumber: `TK${Date.now().toString().slice(-6)}`,
            pagnePaid: false,
            participationPaid: false,
            fullyValidated: false
        });
        
        await participant.save();
        
        res.json({ 
            success: true, 
            participant: {
                id: participant._id,
                name: participant.name,
                uniqueId: participant.uniqueId
            }
        });
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de l\'inscription' 
        });
    }
});

// Route pour soumettre la preuve de paiement
app.post('/submit-payment', async (req, res) => {
    try {
        const { name, phone, whatsapp, amount, type, proofType, transactionCode } = req.body;
        
        // Trouver ou créer le participant
        let participant = await Participant.findOne({ phone });
        
        if (!participant) {
            // Créer le participant s'il n'existe pas
            participant = new Participant({
                name,
                phone,
                whatsapp,
                uniqueId: `AE${Date.now()}`,
                ticketNumber: `TK${Date.now().toString().slice(-6)}`,
                pagnePaid: false,
                participationPaid: false,
                fullyValidated: false
            });
        }
        
        // Créer l'enregistrement de paiement
        const payment = new Payment({
            participantId: participant._id,
            type,
            amount,
            transactionId: transactionCode || `TX${Date.now()}`,
            status: 'pending',
            proofType,
            submittedAt: new Date()
        });
        
        await payment.save();
        await participant.save();
        
        res.json({
            success: true,
            message: 'Paiement soumis avec succès',
            paymentId: payment._id
        });
        
    } catch (error) {
        console.error('Erreur soumission paiement:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la soumission du paiement' 
        });
    }
});

// Route pour générer le QR code
app.post('/api/generate-qr', async (req, res) => {
    try {
        const { name } = req.body;
        
        const participant = await Participant.findOne({ name });
        if (!participant) {
            return res.status(404).json({ 
                success: false, 
                error: 'Participant non trouvé' 
            });
        }
        
        // Vérifier que les deux paiements sont validés
        if (!participant.pagnePaid || !participant.participationPaid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tous les paiements doivent être validés pour générer le QR code' 
            });
        }
        
        // Générer le QR code
        const qrData = {
            uniqueId: participant.uniqueId,
            ticketNumber: participant.ticketNumber,
            name: participant.name,
            phone: participant.phone,
            event: 'After Eid 2026',
            status: 'VALIDÉ'
        };
        
        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
        const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invitation/${participant.uniqueId}`;
        
        participant.qrCodeData = JSON.stringify(qrData);
        participant.fullyValidated = true;
        await participant.save();
        
        res.json({
            success: true,
            qrCode,
            invitationUrl
        });
        
    } catch (error) {
        console.error('Erreur génération QR:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de la génération du QR code' 
        });
    }
});

// API pour les comptes à rebours
app.get('/api/countdowns', (req, res) => {
    const now = new Date();
    
    const eventCountdown = {
        days: Math.max(0, Math.floor((EVENT_DATE - now) / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor(((EVENT_DATE - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor(((EVENT_DATE - now) % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor(((EVENT_DATE - now) % (1000 * 60)) / 1000))
    };
    
    const paymentCountdown = {
        days: Math.max(0, Math.floor((PAYMENT_DEADLINE - now) / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor(((PAYMENT_DEADLINE - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor(((PAYMENT_DEADLINE - now) % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: Math.max(0, Math.floor(((PAYMENT_DEADLINE - now) % (1000 * 60)) / 1000))
    };
    
    res.json({
        event: eventCountdown,
        payment: paymentCountdown
    });
});

// Route API pour tester
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date(),
        eventDate: EVENT_DATE,
        paymentDeadline: PAYMENT_DEADLINE
    });
});

// Route de fallback pour les erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).send('Erreur serveur - Veuillez contacter l\'administrateur');
});

// Route 404
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur After Eid démarré sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📅 Date de l'événement: ${EVENT_DATE.toLocaleDateString('fr-FR')}`);
});
