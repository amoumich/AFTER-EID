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
    res.render('index', { 
        title: 'After Eid - Événement Premium',
        eventDate: EVENT_DATE,
        paymentDeadline: PAYMENT_DEADLINE
    });
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
        const { name, email } = req.body;
        
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
        const invitationUrl = `${process.env.FRONTEND_URL}/invitation/${participant.uniqueId}`;
        
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

app.post('/inscription', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        // Vérifier si le participant existe déjà
        const existingParticipant = await Participant.findOne({ email });
        if (existingParticipant) {
            return res.status(400).json({ error: 'Cet email est déjà inscrit' });
        }
        
        // Générer un identifiant unique et numéro de ticket
        const uniqueId = crypto.randomBytes(16).toString('hex').toUpperCase();
        const ticketNumber = 'AE' + Date.now().toString().slice(-8);
        
        // Créer le participant
        const participant = new Participant({
            name,
            email,
            phone,
            uniqueId,
            ticketNumber
        });
        
        await participant.save();
        
        res.json({ 
            success: true, 
            participantId: participant._id,
            message: 'Inscription réussie'
        });
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// API pour les paiements
app.post('/api/payment/initiate', async (req, res) => {
    try {
        const { participantId, type, phoneNumber } = req.body;
        
        const participant = await Participant.findById(participantId);
        if (!participant) {
            return res.status(404).json({ error: 'Participant non trouvé' });
        }
        
        const amount = type === 'pagne' ? 7000 : 15000;
        const transactionId = 'TXN' + Date.now().toString();
        
        // Créer l'enregistrement de paiement
        const payment = new Payment({
            participantId: participant._id,
            type,
            amount,
            transactionId,
            status: 'pending'
        });
        
        await payment.save();
        
        // Simuler l'initiation Airtel Money (à remplacer avec l'API réelle)
        const airtelResponse = {
            transactionId,
            phoneNumber,
            amount,
            message: 'Veuillez confirmer le paiement sur votre téléphone Airtel Money'
        };
        
        res.json({
            success: true,
            payment: airtelResponse
        });
        
    } catch (error) {
        console.error('Erreur paiement:', error);
        res.status(500).json({ error: 'Erreur lors de l\'initiation du paiement' });
    }
});

app.post('/api/payment/confirm', async (req, res) => {
    try {
        const { transactionId, airtelMoneyRef } = req.body;
        
        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({ error: 'Transaction non trouvée' });
        }
        
        // Simuler la confirmation (à remplacer avec la vérification Airtel Money réelle)
        payment.status = 'completed';
        payment.airtelMoneyRef = airtelMoneyRef;
        payment.completedAt = new Date();
        await payment.save();
        
        // Mettre à jour le statut du participant
        const participant = await Participant.findById(payment.participantId);
        if (payment.type === 'pagne') {
            participant.pagnePaid = true;
            participant.pagnePaidAt = new Date();
        } else {
            participant.participationPaid = true;
            participant.participationPaidAt = new Date();
        }
        
        // Vérifier si les deux paiements sont validés
        if (participant.pagnePaid && participant.participationPaid) {
            participant.fullyValidated = true;
            participant.validatedAt = new Date();
            
            // Générer le QR code
            const qrData = {
                name: participant.name,
                ticketNumber: participant.ticketNumber,
                uniqueId: participant.uniqueId,
                status: 'VALIDÉ',
                eventDate: EVENT_DATE.toISOString()
            };
            
            participant.qrCodeData = JSON.stringify(qrData);
            participant.qrCodeGenerated = true;
            
            // Envoyer la notification finale
            await sendFinalNotification(participant);
        }
        
        await participant.save();
        
        res.json({
            success: true,
            paymentStatus: payment.status,
            participantStatus: {
                pagnePaid: participant.pagnePaid,
                participationPaid: participant.participationPaid,
                fullyValidated: participant.fullyValidated
            }
        });
        
    } catch (error) {
        console.error('Erreur confirmation:', error);
        res.status(500).json({ error: 'Erreur lors de la confirmation' });
    }
});

// Page de statut du participant
app.get('/mon-statut/:uniqueId', async (req, res) => {
    try {
        const participant = await Participant.findOne({ uniqueId: req.params.uniqueId });
        
        if (!participant) {
            return res.status(404).render('404', { title: 'Non trouvé' });
        }
        
        let qrCodeImage = null;
        if (participant.qrCodeGenerated) {
            qrCodeImage = await QRCode.toDataURL(participant.qrCodeData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFD700'
                }
            });
        }
        
        res.render('statut', {
            title: 'Mon Statut - After Eid',
            participant,
            qrCodeImage,
            pagnePrice: 7000,
            participationPrice: 15000,
            totalPrice: 22000
        });
        
    } catch (error) {
        console.error('Erreur statut:', error);
        res.status(500).render('error', { title: 'Erreur' });
    }
});

// Interface admin
app.get('/admin', (req, res) => {
    res.render('admin/login', { title: 'Admin - After Eid' });
});

app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/admin');
    }
});

app.get('/admin/dashboard', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin');
    }
    
    try {
        const participants = await Participant.find().sort({ createdAt: -1 });
        const payments = await Payment.find().sort({ createdAt: -1 });
        
        const stats = {
            totalParticipants: participants.length,
            fullyValidated: participants.filter(p => p.fullyValidated).length,
            pagnePaidOnly: participants.filter(p => p.pagnePaid && !p.participationPaid).length,
            participationPaidOnly: participants.filter(p => p.participationPaid && !p.pagnePaid).length,
            totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
        };
        
        res.render('admin/dashboard', {
            title: 'Dashboard Admin - After Eid',
            participants,
            payments,
            stats
        });
        
    } catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).render('error', { title: 'Erreur' });
    }
});

// API pour scanner les QR codes
app.post('/admin/scan-qr', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    try {
        const { qrData } = req.body;
        const data = JSON.parse(qrData);
        
        const participant = await Participant.findOne({ 
            uniqueId: data.uniqueId,
            fullyValidated: true 
        });
        
        if (!participant) {
            return res.json({
                valid: false,
                message: 'Invitation non valide ou paiement incomplet'
            });
        }
        
        // Marquer comme utilisé (optionnel)
        participant.qrScanned = true;
        participant.qrScannedAt = new Date();
        await participant.save();
        
        res.json({
            valid: true,
            participant: {
                name: participant.name,
                ticketNumber: participant.ticketNumber,
                status: 'VALIDÉ'
            }
        });
        
    } catch (error) {
        console.error('Erreur scan QR:', error);
        res.status(500).json({ error: 'Erreur lors du scan' });
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

// Fonctions utilitaires
async function sendFinalNotification(participant) {
    // Implémenter l'envoi d'email/SMS avec les détails de l'invitation
    console.log(`Notification envoyée à ${participant.name} - Invitation validée!`);
}

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur After Eid démarré sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📅 Date de l'événement: ${EVENT_DATE.toLocaleDateString('fr-FR')}`);
});
