// ============================================
// AFTER EID - JAVASCRIPT PREMIUM
// Mobile First - Animations & Interactions
// ============================================

// Variables globales
let isMenuOpen = false;
let scrollPosition = 0;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.querySelector('.header-premium');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollEffects();
    initCountdowns();
    initAnimations();
    initFormValidation();
    initPaymentSystem();
    initQRCodeScanner();
});

// Menu Mobile
function initMobileMenu() {
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

function openMobileMenu() {
    mobileMenu.classList.add('active');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    scrollPosition = window.pageYOffset;
    
    // Animation du menu
    mobileMenu.style.left = '0';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosition);
    
    // Animation du menu
    mobileMenu.style.left = '-100%';
    isMenuOpen = false;
}

// Effets de scroll
function initScrollEffects() {
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Header scroll effect
        if (header) {
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Parallax effect for hero
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && currentScroll < window.innerHeight) {
            const speed = 0.5;
            heroContent.style.transform = `translateY(${currentScroll * speed}px)`;
        }
        
        lastScroll = currentScroll;
    });
}

// Compte à rebours
function initCountdowns() {
    // Compte à rebours événement
    updateEventCountdown();
    setInterval(updateEventCountdown, 1000);
    
    // Compte à rebours paiement
    updatePaymentCountdown();
    setInterval(updatePaymentCountdown, 1000);
}

function updateEventCountdown() {
    const eventDate = new Date('2024-03-31T18:00:00');
    const now = new Date();
    const diff = eventDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        updateCountdownDisplay('event', days, hours, minutes, seconds);
    } else {
        // L'événement est terminé
        showEventEnded();
    }
}

function updatePaymentCountdown() {
    const paymentDate = new Date('2024-03-25T23:59:59');
    const now = new Date();
    const diff = paymentDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        updateCountdownDisplay('payment', days, hours, minutes, seconds);
    } else {
        // La date limite est passée
        showPaymentDeadlinePassed();
    }
}

function updateCountdownDisplay(type, days, hours, minutes, seconds) {
    const prefix = type === 'event' ? 'event' : 'payment';
    
    const elements = {
        days: document.getElementById(`${prefix}Days`),
        hours: document.getElementById(`${prefix}Hours`),
        minutes: document.getElementById(`${prefix}Minutes`),
        seconds: document.getElementById(`${prefix}Seconds`)
    };
    
    if (elements.days) elements.days.textContent = String(days).padStart(2, '0');
    if (elements.hours) elements.hours.textContent = String(hours).padStart(2, '0');
    if (elements.minutes) elements.minutes.textContent = String(minutes).padStart(2, '0');
    if (elements.seconds) elements.seconds.textContent = String(seconds).padStart(2, '0');
    
    // Animation de changement
    Object.values(elements).forEach(el => {
        if (el) {
            el.style.transform = 'scale(1.1)';
            setTimeout(() => {
                el.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

function showEventEnded() {
    const countdownElement = document.getElementById('eventCountdown');
    if (countdownElement) {
        countdownElement.innerHTML = `
            <div class="event-ended">
                <h3>L'événement est terminé!</h3>
                <p>Merci d'avoir participé à cette soirée mémorable.</p>
            </div>
        `;
    }
}

function showPaymentDeadlinePassed() {
    const paymentSection = document.querySelector('.payment-countdown-section');
    if (paymentSection) {
        paymentSection.innerHTML = `
            <div class="deadline-passed">
                <div class="urgent-badge">⚠️ Date Limite Dépassée</div>
                <h3>Les inscriptions sont closes</h3>
                <p>La date limite de paiement est dépassée. Contactez-nous pour plus d'informations.</p>
            </div>
        `;
    }
}

// Animations AOS (Animate On Scroll)
function initAnimations() {
    // Observer pour les animations au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observer les éléments avec data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
    
    // Animation des particules
    initParticles();
}

// Particules animées
function initParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Créer des particules
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(255, 215, 0, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 20 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Validation de formulaire
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                submitForm(form);
            }
        });
        
        // Validation en temps réel
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Validation selon le type
    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Email invalide';
            }
            break;
        case 'tel':
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            if (!phoneRegex.test(value) || value.length < 8) {
                isValid = false;
                errorMessage = 'Numéro de téléphone invalide';
            }
            break;
        case 'text':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Ce champ doit contenir au moins 2 caractères';
            }
            break;
        default:
            if (!value) {
                isValid = false;
                errorMessage = 'Ce champ est requis';
            }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Créer ou mettre à jour le message d'erreur
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Soumission de formulaire
async function submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Afficher le chargement
    submitButton.innerHTML = '<span class="loading"></span> Envoi en cours...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch(form.action, {
            method: form.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessMessage(form, result.message);
            form.reset();
            
            // Rediriger si nécessaire
            if (result.redirect) {
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 2000);
            }
        } else {
            showErrorMessage(form, result.error);
        }
    } catch (error) {
        console.error('Erreur soumission:', error);
        showErrorMessage(form, 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
        // Restaurer le bouton
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Messages de succès/erreur
function showSuccessMessage(form, message) {
    showMessage(form, message, 'success');
}

function showErrorMessage(form, message) {
    showMessage(form, message, 'error');
}

function showMessage(form, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        padding: 15px;
        margin: 20px 0;
        border-radius: 10px;
        text-align: center;
        font-weight: 600;
        ${type === 'success' 
            ? 'background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; color: #28a745;'
            : 'background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #dc3545;'
        }
    `;
    
    form.parentNode.insertBefore(messageDiv, form);
    
    // Animation d'apparition
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-suppression
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 5000);
}

// Système de paiement
function initPaymentSystem() {
    const paymentButtons = document.querySelectorAll('[data-payment]');
    
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.payment;
            const participantId = this.dataset.participantId;
            
            initiatePayment(type, participantId);
        });
    });
}

async function initiatePayment(type, participantId) {
    try {
        const response = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                participantId,
                type,
                phoneNumber: document.querySelector('[name="phone"]').value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showPaymentModal(result.payment);
        } else {
            showErrorMessage(null, result.error);
        }
    } catch (error) {
        console.error('Erreur paiement:', error);
        showErrorMessage(null, 'Erreur lors de l\'initiation du paiement');
    }
}

function showPaymentModal(paymentData) {
    // Créer une modale pour le paiement
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="payment-header">
                <h3>Paiement Airtel Money</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="payment-body">
                <div class="payment-info">
                    <p><strong>Montant:</strong> ${paymentData.amount} FCFA</p>
                    <p><strong>Téléphone:</strong> ${paymentData.phoneNumber}</p>
                    <p><strong>Transaction:</strong> ${paymentData.transactionId}</p>
                </div>
                <div class="payment-instructions">
                    <h4>Instructions:</h4>
                    <ol>
                        <li>Ouvrez votre application Airtel Money</li>
                        <li>Choisissez "Payer" ou "Payment"</li>
                        <li>Entrez le montant: ${paymentData.amount} FCFA</li>
                        <li>Confirmez la transaction</li>
                        <li>Attendez la confirmation</li>
                    </ol>
                </div>
                <div class="payment-status" id="paymentStatus">
                    <div class="loading"></div>
                    <p>En attente de confirmation...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'apparition
    setTimeout(() => {
        modal.classList.add('active');
    }, 100);
    
    // Gestion de la fermeture
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => closePaymentModal(modal));
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePaymentModal(modal);
        }
    });
    
    // Vérifier le statut du paiement
    checkPaymentStatus(paymentData.transactionId, modal);
}

async function checkPaymentStatus(transactionId, modal) {
    const maxAttempts = 30; // 30 tentatives max (5 minutes)
    let attempts = 0;
    
    const checkStatus = async () => {
        attempts++;
        
        try {
            const response = await fetch('/api/payment/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId })
            });
            
            const result = await response.json();
            
            if (result.status === 'completed') {
                showPaymentSuccess(modal);
            } else if (result.status === 'failed') {
                showPaymentError(modal, result.error);
            } else if (attempts < maxAttempts) {
                // Continuer à vérifier
                setTimeout(checkStatus, 10000); // Vérifier toutes les 10 secondes
            } else {
                showPaymentTimeout(modal);
            }
        } catch (error) {
            console.error('Erreur vérification paiement:', error);
            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 10000);
            } else {
                showPaymentTimeout(modal);
            }
        }
    };
    
    // Première vérification après 5 secondes
    setTimeout(checkStatus, 5000);
}

function showPaymentSuccess(modal) {
    const statusDiv = modal.querySelector('#paymentStatus');
    statusDiv.innerHTML = `
        <div class="success-icon">✅</div>
        <h4>Paiement réussi!</h4>
        <p>Votre paiement a été validé avec succès.</p>
        <button class="btn-premium btn-gold" onclick="closePaymentModal(this.closest('.payment-modal'))">
            Continuer
        </button>
    `;
}

function showPaymentError(modal, error) {
    const statusDiv = modal.querySelector('#paymentStatus');
    statusDiv.innerHTML = `
        <div class="error-icon">❌</div>
        <h4>Échec du paiement</h4>
        <p>${error || 'Une erreur est survenue lors du paiement.'}</p>
        <button class="btn-premium btn-dark" onclick="closePaymentModal(this.closest('.payment-modal'))">
            Fermer
        </button>
    `;
}

function showPaymentTimeout(modal) {
    const statusDiv = modal.querySelector('#paymentStatus');
    statusDiv.innerHTML = `
        <div class="timeout-icon">⏰</div>
        <h4>Délai d'attente dépassé</h4>
        <p>Le paiement n'a pas pu être confirmé. Veuillez vérifier votre statut plus tard.</p>
        <button class="btn-premium btn-dark" onclick="closePaymentModal(this.closest('.payment-modal'))">
            Fermer
        </button>
    `;
}

function closePaymentModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Scanner QR Code
function initQRCodeScanner() {
    const scanButton = document.querySelector('[data-action="scan-qr"]');
    
    if (scanButton) {
        scanButton.addEventListener('click', startQRScanner);
    }
}

function startQRScanner() {
    // Créer une modale pour le scanner
    const modal = document.createElement('div');
    modal.className = 'qr-scanner-modal';
    modal.innerHTML = `
        <div class="qr-scanner-content">
            <div class="scanner-header">
                <h3>Scanner QR Code</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="scanner-body">
                <div id="qr-reader"></div>
                <div class="scanner-result" id="scannerResult"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'apparition
    setTimeout(() => {
        modal.classList.add('active');
        initHTML5QRCodeScanner();
    }, 100);
    
    // Gestion de la fermeture
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => closeQRScanner(modal));
}

function initHTML5QRCodeScanner() {
    // Utiliser la bibliothèque html5-qrcode
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
    };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            // QR Code scanné avec succès
            handleQRCodeScan(decodedText);
        },
        (errorMessage) => {
            // Erreur de scan (ignorer)
        }
    ).catch((err) => {
        console.error('Erreur démarrage scanner:', err);
        showScannerError('Impossible d\'accéder à la caméra');
    });
}

function handleQRCodeScan(qrData) {
    try {
        const data = JSON.parse(qrData);
        
        // Envoyer les données au serveur pour validation
        fetch('/admin/scan-qr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qrData })
        })
        .then(response => response.json())
        .then(result => {
            showScannerResult(result);
        })
        .catch(error => {
            console.error('Erreur validation QR:', error);
            showScannerError('Erreur lors de la validation');
        });
    } catch (error) {
        showScannerError('QR Code invalide');
    }
}

function showScannerResult(result) {
    const resultDiv = document.getElementById('scannerResult');
    
    if (result.valid) {
        resultDiv.innerHTML = `
            <div class="scan-result valid">
                <div class="result-icon">✅</div>
                <h4>Valide - Accès Autorisé</h4>
                <p><strong>Nom:</strong> ${result.participant.name}</p>
                <p><strong>Ticket:</strong> ${result.participant.ticketNumber}</p>
                <p><strong>Statut:</strong> ${result.participant.status}</p>
            </div>
        `;
        resultDiv.className = 'scanner-result success';
    } else {
        resultDiv.innerHTML = `
            <div class="scan-result invalid">
                <div class="result-icon">❌</div>
                <h4>Non Valide - Accès Refusé</h4>
                <p>${result.message}</p>
            </div>
        `;
        resultDiv.className = 'scanner-result error';
    }
}

function showScannerError(message) {
    const resultDiv = document.getElementById('scannerResult');
    resultDiv.innerHTML = `
        <div class="scan-result error">
            <div class="result-icon">⚠️</div>
            <h4>Erreur</h4>
            <p>${message}</p>
        </div>
    `;
    resultDiv.className = 'scanner-result error';
}

function closeQRScanner(modal) {
    // Arrêter le scanner si actif
    if (window.html5QrCode) {
        window.html5QrCode.stop().then(() => {
            modal.remove();
        }).catch(() => {
            modal.remove();
        });
    } else {
        modal.remove();
    }
}

// Utilitaires
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export pour utilisation globale
window.AfterEid = {
    toggleMobileMenu,
    initiatePayment,
    formatCurrency,
    formatDate
};
