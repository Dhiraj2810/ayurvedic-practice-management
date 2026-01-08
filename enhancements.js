// AyurCare - Enhanced Features
// enhancements.js - Advanced functionality including AI chat, dark mode, exports, etc.

class DarkMode {
    static init() {
        const saved = localStorage.getItem('ayurcare_dark_mode') === 'true';
        if (saved) {
            document.body.classList.add('dark-mode');
        }
        this.updateToggleIcon();
    }

    static toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('ayurcare_dark_mode', isDark);
        this.updateToggleIcon();
        Toast.info(isDark ? 'Dark mode enabled' : 'Light mode enabled');
    }

    static updateToggleIcon() {
        const toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        const isDark = document.body.classList.contains('dark-mode');
        toggle.innerHTML = isDark ?
            '<i class="fa-solid fa-sun"></i>' :
            '<i class="fa-solid fa-moon"></i>';
    }
}

class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            // Check if already exists in DOM
            const existing = document.querySelector('.toast-container');
            if (existing) {
                this.container = existing;
            } else {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => toast.remove());
    }

    static getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static success(message) { this.show(message, 'success'); }
    static error(message) { this.show(message, 'error'); }
    static warning(message) { this.show(message, 'warning'); }
    static info(message) { this.show(message, 'info'); }
}

class VoiceInput {
    static recognition = null;
    static isListening = false;

    static init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('chat-input');
                if (input) {
                    input.value = transcript;
                    Toast.success('Voice input captured');
                }
                this.stop();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                Toast.error('Voice recognition failed');
                this.stop();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateUI();
            };
        }
    }

    static toggle() {
        if (!this.recognition) {
            Toast.error('Voice input not supported in this browser');
            return;
        }

        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }

    static start() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateUI();
            Toast.info('Listening... Speak now');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            Toast.error('Could not start voice recognition');
        }
    }

    static stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    static updateUI() {
        const btn = document.querySelector('.voice-btn i');
        if (btn) {
            btn.className = this.isListening ?
                'fa-solid fa-stop' :
                'fa-solid fa-microphone';
        }
    }
}

class DataExport {
    static toggleMenu() {
        const menu = document.querySelector('.export-dropdown');
        if (menu) menu.classList.toggle('show');
    }

    static exportToCSV() {
        if (!window.ayurcare || !window.ayurcare.patients) {
            Toast.error('System not ready');
            return;
        }
        
        const patients = window.ayurcare.patients;
        if (patients.length === 0) {
            Toast.warning('No patient data to export');
            return;
        }

        const headers = ['Name', 'Age', 'Gender', 'BMI', 'Dosha', 'Date'];
        const rows = patients.map(p => [
            p.name,
            p.age,
            p.gender,
            p.bmi?.value || 'N/A',
            p.doshaProfile?.dominant || 'N/A',
            new Date(p.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        this.downloadFile(csvContent, 'ayurcare_patients.csv', 'text/csv');
        Toast.success('CSV exported successfully');
    }

    static exportToJSON() {
        if (!window.ayurcare || !window.ayurcare.patients) return;
        
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            patients: window.ayurcare.patients
        };

        this.downloadFile(JSON.stringify(data, null, 2), 'ayurcare_backup.json', 'application/json');
        Toast.success('JSON backup created');
    }

    static importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.patients && Array.isArray(data.patients)) {
                        // Merge with existing patients
                        const existingIds = new Set(window.ayurcare.patients.map(p => p.id));
                        const newPatients = data.patients.filter(p => !existingIds.has(p.id));

                        window.ayurcare.patients.push(...newPatients);
                        window.ayurcare.savePatients();
                        window.ayurcare.updateStats();
                        window.ayurcare.loadPatientList();

                        Toast.success(`Imported ${newPatients.length} patients`);
                    } else {
                        Toast.error('Invalid backup file format');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    Toast.error('Failed to import data');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

class PDFGenerator {
    static async generatePrescription() {
        if (!window.ayurcare.currentPatient) {
            Toast.error('No patient selected');
            return;
        }

        const patient = window.ayurcare.currentPatient;

        try {
            // Check if jsPDF is available
            if (!window.jspdf) {
                Toast.error('PDF library not loaded');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('AyurCare Prescription', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text('Traditional Ayurvedic Medicine', 105, 30, { align: 'center' });

            // Patient details
            doc.setFontSize(14);
            doc.text('Patient Information', 20, 50);
            doc.setFontSize(10);
            doc.text(`Name: ${patient.name}`, 20, 60);
            doc.text(`Age: ${patient.age} years`, 20, 70);
            doc.text(`Gender: ${patient.gender}`, 20, 80);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);

            // Dosha analysis
            if (patient.doshaProfile) {
                doc.setFontSize(14);
                doc.text('Ayurvedic Constitution', 20, 110);
                doc.setFontSize(10);
                doc.text(`Dominant Dosha: ${patient.doshaProfile.dominant.charAt(0).toUpperCase() + patient.doshaProfile.dominant.slice(1)}`, 20, 120);
                doc.text(`Vata: ${patient.doshaProfile.percentages.vata}%`, 20, 130);
                doc.text(`Pitta: ${patient.doshaProfile.percentages.pitta}%`, 20, 135);
                doc.text(`Kapha: ${patient.doshaProfile.percentages.kapha}%`, 20, 140);
            }

            // Recommendations
            if (patient.recommendations) {
                doc.setFontSize(14);
                doc.text('Recommendations', 20, 160);
                doc.setFontSize(10);

                let yPos = 170;
                if (patient.recommendations.herbs && patient.recommendations.herbs.length > 0) {
                    doc.text('Herbal Medicines:', 20, yPos);
                    yPos += 10;
                    patient.recommendations.herbs.forEach(herb => {
                        doc.text(`• ${herb}`, 30, yPos);
                        yPos += 8;
                    });
                }

                yPos += 10;
                if (patient.recommendations.diet && patient.recommendations.diet.length > 0) {
                    doc.text('Dietary Guidelines:', 20, yPos);
                    yPos += 10;
                    patient.recommendations.diet.forEach(diet => {
                        doc.text(`• ${diet}`, 30, yPos);
                        yPos += 8;
                    });
                }
            }

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.text('Generated by AyurCare - Intelligent Practice Management', 105, pageHeight - 20, { align: 'center' });

            // Download
            const filename = `${patient.name.replace(/\s+/g, '_')}_Prescription_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            Toast.success('Prescription PDF generated');

        } catch (error) {
            console.error('PDF generation error:', error);
            Toast.error('Failed to generate PDF');
        }
    }
}

class MobileMenu {
    static toggle() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');
    }

    static init() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const menuBtn = document.querySelector('.mobile-menu-btn');

            if (sidebar && menuBtn && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

class KeyboardShortcuts {
    static init() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '/':
                        e.preventDefault();
                        DarkMode.toggle();
                        break;
                }
            }

            // Enter to send chat message
            if (e.key === 'Enter' && !e.shiftKey) {
                const chatInput = document.getElementById('chat-input');
                if (document.activeElement === chatInput && chatInput.value.trim()) {
                    e.preventDefault();
                    sendMessage();
                }
            }
        });
    }
}

class PWAHandler {
    static init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }

        // Install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt(deferredPrompt);
        });
    }

    static showInstallPrompt(deferredPrompt) {
        // Create install button or notification
        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn';
        installBtn.innerHTML = '<i class="fa-solid fa-download"></i> Install AyurCare';
        installBtn.onclick = () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    Toast.success('AyurCare installed successfully!');
                }
                deferredPrompt = null;
            });
        };

        // Add to header temporarily
        const header = document.querySelector('.header-actions');
        if (header) {
            header.insertBefore(installBtn, header.firstChild);

            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installBtn.parentElement) {
                    installBtn.remove();
                }
            }, 10000);
        }
    }
}

class LanguageManager {
    static currentLang = 'en';
    static sanskritMode = false;

    static init() {
        this.currentLang = localStorage.getItem('ayurcare_lang') || 'en';
        this.sanskritMode = localStorage.getItem('ayurcare_sanskrit') === 'true';
        this.setLanguage(this.currentLang);
    }

    static setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('ayurcare_lang', lang);
        // Toast.info(`Language changed to ${lang.toUpperCase()}`);
    }

    static toggleSanskrit(enabled) {
        this.sanskritMode = enabled;
        localStorage.setItem('ayurcare_sanskrit', enabled);
        Toast.info(enabled ? 'Sanskrit terms enabled' : 'Sanskrit terms disabled');
    }
}

class Settings {
    static toggle() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.toggle('hidden');

            if (!modal.classList.contains('hidden')) {
                this.loadSettings();
            }
        }
    }

    static loadSettings() {
        // Load API key (masked for security)
        const apiKey = localStorage.getItem('ayurcare_gemini_api_key') || '';
        const maskedKey = apiKey ? '*'.repeat(Math.min(apiKey.length, 20)) + apiKey.slice(-4) : '';
        
        const input = document.getElementById('api-key-input');
        if (input) input.value = maskedKey;

        // Show API key status
        const statusElement = document.getElementById('api-key-status');
        if (statusElement) {
            statusElement.textContent = apiKey ? '✓ Configured' : '✗ Not configured';
            statusElement.className = apiKey ? 'status-success' : 'status-error';
        }

        // Load language settings
        const language = localStorage.getItem('ayurcare_lang') || 'en';
        const langSelect = document.getElementById('language-select');
        if (langSelect) langSelect.value = language;

        const sanskritMode = localStorage.getItem('ayurcare_sanskrit') === 'true';
        const sanskritToggle = document.getElementById('sanskrit-toggle');
        if (sanskritToggle) sanskritToggle.checked = sanskritMode;

        // Add event listeners for auto-save
        this.attachEventListeners();
    }

    static attachEventListeners() {
        const languageSelect = document.getElementById('language-select');
        const sanskritToggle = document.getElementById('sanskrit-toggle');

        if (languageSelect) {
            languageSelect.addEventListener('change', () => this.saveLanguageSettings());
        }

        if (sanskritToggle) {
            sanskritToggle.addEventListener('change', () => this.saveLanguageSettings());
        }
    }

    static saveApiKey() {
        const input = document.getElementById('api-key-input');
        if (!input) return;
        
        const apiKey = input.value.trim();

        if (!apiKey || apiKey.includes('*')) {
            Toast.error('Please enter a valid API key');
            return;
        }

        // Basic validation - Gemini API keys start with 'AIza'
        if (!apiKey.startsWith('AIza')) {
            Toast.warning('This doesn\'t look like a valid Gemini API key. Please check and try again.');
            return;
        }

        localStorage.setItem('ayurcare_gemini_api_key', apiKey);
        AyurBot.GEMINI_CONFIG.apiKey = apiKey;

        // Test the API key
        this.testApiKey(apiKey);

        input.value = '*'.repeat(Math.min(apiKey.length, 20)) + apiKey.slice(-4);
        Toast.success('API key saved successfully');

        // Update status indicator
        const statusElement = document.getElementById('api-key-status');
        if (statusElement) {
            statusElement.textContent = '✓ Configured';
            statusElement.className = 'status-success';
        }
    }

    static async testApiKey(apiKey) {
        try {
            const response = await fetch(`${AyurBot.GEMINI_CONFIG.baseURL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Hello' }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 50 }
                })
            });

            if (response.ok) {
                Toast.success('API key is working correctly!');
            } else {
                Toast.error('API key test failed. Please check your key.');
            }
        } catch (error) {
            Toast.error('Failed to test API key. Please check your internet connection.');
        }
    }

    static saveLanguageSettings() {
        const langSelect = document.getElementById('language-select');
        const sansToggle = document.getElementById('sanskrit-toggle');
        
        const language = langSelect ? langSelect.value : 'en';
        const sanskritMode = sansToggle ? sansToggle.checked : false;

        LanguageManager.setLanguage(language);
        LanguageManager.toggleSanskrit(sanskritMode);

        Toast.success('Language settings saved');
    }

    static togglePasswordVisibility() {
        const input = document.getElementById('api-key-input');
        const toggleBtn = document.querySelector('.password-toggle i');

        if (input && toggleBtn) {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.className = 'fa-solid fa-eye-slash';
            } else {
                input.type = 'password';
                toggleBtn.className = 'fa-solid fa-eye';
            }
        }
    }
}

// Global functions for HTML onclick handlers
// Fixed: Ensure elements exist before accessing classes
function toggleChat() {
    const widget = document.getElementById('ayurbot-widget');
    if (widget) {
        widget.classList.toggle('hidden');
        if (!widget.classList.contains('hidden')) {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }
    } else {
        console.error("Chat widget not found");
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    if (input) {
        const message = input.value.trim();
        if (message) {
            AyurBot.sendMessage(message);
            input.value = '';
        }
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function generatePrescription() {
    PDFGenerator.generatePrescription();
}

function regenerateDiet() {
     if (typeof Toast !== 'undefined') Toast.info('Regenerating diet plan...');
}

function downloadPDF() {
     // Trigger PDF generator
     PDFGenerator.generatePrescription();
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
    Toast.init();
    VoiceInput.init();
    MobileMenu.init();
    KeyboardShortcuts.init();
    PWAHandler.init();
    LanguageManager.init();

    // Make classes globally accessible for onclick handlers
    window.DarkMode = DarkMode;
    window.Toast = Toast;
    window.Settings = Settings;
    window.DataExport = DataExport;
    window.VoiceInput = VoiceInput;
    window.MobileMenu = MobileMenu;
    window.KeyboardShortcuts = KeyboardShortcuts;
    window.PWAHandler = PWAHandler;
    window.LanguageManager = LanguageManager;

    // Make global functions accessible
    window.toggleChat = toggleChat;
    window.sendMessage = sendMessage;
    window.handleChatInput = handleChatInput;

    // Initialize patient filter SAFELY
    // Only if PatientFilter is defined (which it is now in script.js)
    if (typeof PatientFilter !== 'undefined') {
        PatientFilter.apply();
    }
});