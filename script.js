// AyurCare - Core Application Logic
// script.js - Main functionality for patient management and analysis

// --- MISSING CLASS RESTORED ---
class PatientFilter {
    static currentFilter = 'all';
    static currentSort = 'date';
    static searchTerm = '';

    static apply(term) {
        if (term !== undefined) this.searchTerm = term.toLowerCase();
        
        // Safety check to ensure window.ayurcare exists
        if (!window.ayurcare || !window.ayurcare.patients) return;

        let patients = window.ayurcare.patients;

        // 1. Filter by Search Term
        if (this.searchTerm) {
            patients = patients.filter(p => 
                p.name.toLowerCase().includes(this.searchTerm) || 
                (p.id && p.id.includes(this.searchTerm))
            );
        }

        // 2. Filter by Dosha
        if (this.currentFilter !== 'all') {
            patients = patients.filter(p => 
                p.doshaProfile?.dominant && 
                p.doshaProfile.dominant.toLowerCase() === this.currentFilter.toLowerCase()
            );
        }

        // 3. Sort
        patients.sort((a, b) => {
            if (this.currentSort === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                // Date sort (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // 4. Render
        this.renderList(patients);
    }

    static setFilter(filter) {
        this.currentFilter = filter;
        
        // Update UI buttons
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.apply();
    }

    static setSort(sortType) {
        this.currentSort = sortType;
        this.apply();
    }

    static renderList(filteredPatients) {
         const list = document.getElementById('saved-patient-list');
         if (!list) return;

         if (filteredPatients.length === 0) {
            list.innerHTML = '<li class="empty-msg" style="padding:1rem; text-align:center; color:#888;">No matching patients found.</li>';
            return;
        }

        list.innerHTML = filteredPatients.map(patient => {
            const initial = patient.name ? patient.name.charAt(0).toUpperCase() : '?';
            const dosha = patient.doshaProfile?.dominant || 'Unknown';
            // Determine active class if this patient is currently selected
            const isActive = window.ayurcare.currentPatient && window.ayurcare.currentPatient.id === patient.id ? 'selected' : '';

            return `
            <li class="patient-list-item ${isActive}" onclick="ayurcare.viewPatient('${patient.id}')" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                <div class="patient-avatar" style="width: 35px; height: 35px; background: #B8860B; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    <span>${initial}</span>
                </div>
                <div class="patient-info">
                    <div class="patient-name" style="font-weight: 600; color: #1A2F23;">${patient.name}</div>
                    <div class="patient-meta" style="font-size: 0.85rem; color: #666;">${patient.age}y • ${patient.gender} • ${dosha}</div>
                </div>
            </li>
        `}).join('');
    }
}

class AyurCare {
    constructor() {
        this.currentView = 'dashboard';
        this.patients = this.loadPatients();
        this.currentPatient = null;
        // Defer init slightly to ensure DOM is fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('AyurCare initializing...');
        this.setupEventListeners();
        console.log('Event listeners set up');
        this.loadDashboard();
        this.updateStats();
        // Initialize patient list
        PatientFilter.apply();
        console.log('AyurCare initialization complete');
    }

    // Navigation System
    setupEventListeners() {
        // Navigation clicks
        const navItems = document.querySelectorAll('.nav-item');
        console.log('Found nav items:', navItems.length);
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('Nav item clicked:', e.currentTarget.dataset.tab);
                const tab = e.currentTarget.dataset.tab;
                this.navigateTo(tab);
            });
        });

        // Analysis form submission
        const analysisForm = document.getElementById('analysis-form');
        if (analysisForm) {
            analysisForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.runAnalysis();
            });
        }

        // Patient search
        const searchInput = document.getElementById('patient-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                PatientFilter.apply(e.target.value);
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    navigateTo(view) {
        // Update navigation UI
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === view) item.classList.add('active');
        });

        // Update view sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active'); // Hide all first
        });

        // Show specific section
        const targetSection = document.getElementById(view);
        if (targetSection) {
            targetSection.classList.add('active');
            // Force display block via style just in case CSS class isn't enough
            targetSection.style.display = 'block'; 
        }

        // Hide others explicitly to fix "icons not opening" issue
        document.querySelectorAll('.view-section:not(#' + view + ')').forEach(s => {
            s.style.display = 'none';
        });

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            analysis: 'New Analysis',
            patients: 'Patient Records',
            settings: 'Settings'
        };
        const titleEl = document.getElementById('page-title');
        if(titleEl) titleEl.textContent = titles[view] || 'AyurCare';

        this.currentView = view;

        // Load view-specific data
        if (view === 'dashboard') {
            this.loadDashboard();
        } else if (view === 'patients') {
            this.loadPatientList();
        }
    }

    // Patient Data Management
    loadPatients() {
        try {
            const patients = localStorage.getItem('ayurcare_patients');
            return patients ? JSON.parse(patients) : [];
        } catch (e) {
            console.error("Error loading patients", e);
            return [];
        }
    }

    savePatients() {
        localStorage.setItem('ayurcare_patients', JSON.stringify(this.patients));
    }

    addPatient(patientData) {
        const patient = {
            id: Date.now().toString(),
            ...patientData,
            createdAt: new Date().toISOString(),
            consultations: []
        };

        this.patients.push(patient);
        this.savePatients();
        this.updateStats();
        return patient;
    }

    updatePatient(id, updates) {
        const index = this.patients.findIndex(p => p.id === id);
        if (index !== -1) {
            this.patients[index] = { ...this.patients[index], ...updates };
            this.savePatients();
        }
    }

    deletePatient(id) {
        this.patients = this.patients.filter(p => p.id !== id);
        this.savePatients();
        this.updateStats();
        this.loadPatientList();
        this.showPatientPlaceholder();
        Toast.success('Patient deleted successfully');
    }

    // Analysis Logic
    async runAnalysis() {
        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;

        try {
            this.showAnalysisLoading();

            // Calculate BMI and basic metrics
            const bmi = this.calculateBMI(formData.weight, formData.height);
            const doshaProfile = this.analyzeDosha(formData);

            // Generate recommendations (Simulated/AI)
            const recommendations = await this.generateRecommendations(formData, doshaProfile);

            // Create patient record
            const patientData = {
                ...formData,
                bmi,
                doshaProfile,
                recommendations,
                analysisDate: new Date().toISOString()
            };

            const patient = this.addPatient(patientData);
            this.currentPatient = patient; // Set as current

            // Display results
            this.displayResults(patient);

            // Reset form
            document.getElementById('analysis-form').reset();

            Toast.success('Analysis completed successfully!');

        } catch (error) {
            console.error('Analysis error:', error);
            Toast.error('Analysis failed. Please try again.');
        }
    }

    getFormData() {
        return {
            name: document.getElementById('p-name').value.trim(),
            age: parseInt(document.getElementById('p-age').value),
            gender: document.getElementById('p-gender').value,
            weight: parseFloat(document.getElementById('p-weight').value),
            height: parseFloat(document.getElementById('p-height').value),
            history: document.getElementById('p-history').value.trim(),
            lifestyle: Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value)
        };
    }

    validateFormData(data) {
        if (!data.name || !data.age || !data.weight || !data.height) {
            Toast.error('Please fill in all required fields.');
            return false;
        }
        if (data.age < 1 || data.age > 120) {
            Toast.error('Please enter a valid age.');
            return false;
        }
        return true;
    }

    calculateBMI(weight, height) {
        const bmi = weight / ((height / 100) ** 2);
        let category = 'Normal';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi >= 25 && bmi < 30) category = 'Overweight';
        else if (bmi >= 30) category = 'Obese';
        return { value: bmi.toFixed(1), category };
    }

    analyzeDosha(formData) {
        const symptoms = formData.history.toLowerCase();
        const lifestyle = formData.lifestyle;

        let vata = 0, pitta = 0, kapha = 0;

        // Basic Keyword Matching
        if (symptoms.includes('pain') || symptoms.includes('dry') || symptoms.includes('gas') || symptoms.includes('anxiety')) vata += 3;
        if (symptoms.includes('burn') || symptoms.includes('acid') || symptoms.includes('heat') || symptoms.includes('anger')) pitta += 3;
        if (symptoms.includes('heavy') || symptoms.includes('cold') || symptoms.includes('weight') || symptoms.includes('lazy')) kapha += 3;

        // Lifestyle scoring
        if (lifestyle.includes('smoking')) { pitta += 1; vata += 1; }
        if (lifestyle.includes('alcohol')) pitta += 2;
        if (lifestyle.includes('sedentary')) kapha += 2;

        // Body Type Approximation based on BMI
        const bmi = this.calculateBMI(formData.weight, formData.height).value;
        if (bmi < 18.5) vata += 2;
        if (bmi > 25) kapha += 2;
        if (bmi >= 18.5 && bmi <= 25) pitta += 1;

        const total = vata + pitta + kapha || 1; // Avoid divide by zero
        const percentages = {
            vata: Math.round((vata / total) * 100),
            pitta: Math.round((pitta / total) * 100),
            kapha: Math.round((kapha / total) * 100)
        };

        const dominant = Object.keys(percentages).reduce((a, b) => percentages[a] > percentages[b] ? a : b);

        return { percentages, dominant, scores: { vata, pitta, kapha } };
    }

    async generateRecommendations(formData, doshaProfile) {
        // Mock Data - In real app, this connects to Gemini
        return {
            herbs: this.getHerbRecommendations(doshaProfile.dominant),
            diet: this.getDietRecommendations(doshaProfile.dominant),
            nutrients: [
                { name: 'Magnesium', reason: 'Muscle relaxation', sources: 'Spinach, Almonds' },
                { name: 'Vitamin C', reason: 'Immunity boost', sources: 'Amla, Citrus' }
            ]
        };
    }

    getHerbRecommendations(dosha) {
        const herbs = {
            vata: ['Ashwagandha', 'Brahmi', 'Dashamoola'],
            pitta: ['Amalaki', 'Shatavari', 'Guduchi'],
            kapha: ['Trikatu', 'Bibhitaki', 'Turmeric']
        };
        return herbs[dosha] || [];
    }

    getDietRecommendations(dosha) {
        const diets = {
            vata: ['Warm soups', 'Ghee', 'Cooked grains', 'Sweet fruits'],
            pitta: ['Cooling salads', 'Coconut water', 'Rice', 'Sweet vegetables'],
            kapha: ['Spicy soups', 'Honey', 'Millet', 'Bitter vegetables']
        };
        return diets[dosha] || [];
    }

    // UI Display Methods
    showAnalysisLoading() {
        const resultsPanel = document.getElementById('results-panel');
        if(resultsPanel) resultsPanel.classList.remove('hidden');
        
        const doshaText = document.getElementById('res-dosha-text');
        if(doshaText) doshaText.textContent = 'Analyzing...';
    }

    displayResults(patient) {
        const { bmi, doshaProfile, recommendations } = patient;

        // Update BMI
        const bmiEl = document.getElementById('res-bmi');
        if(bmiEl) bmiEl.textContent = `BMI: ${bmi.value} (${bmi.category})`;

        // Update Dosha
        const doshaText = document.getElementById('res-dosha-text');
        if(doshaText) {
            const dominant = doshaProfile.dominant.charAt(0).toUpperCase() + doshaProfile.dominant.slice(1);
            doshaText.textContent = `${dominant} Dominant`;
        }

        const meter = document.querySelector('.meter-bar .fill');
        if(meter) meter.style.width = `${doshaProfile.percentages[doshaProfile.dominant]}%`;

        // Update Medicines
        const medsContainer = document.getElementById('res-medicines');
        if(medsContainer) {
            medsContainer.innerHTML = recommendations.herbs.map(herb => `
                <div class="medicine-card" style="padding:10px; background:#fff; border:1px solid #ddd; border-left: 3px solid #1A2F23;">
                    <i class="fa-solid fa-leaf" style="color:#B8860B"></i> <strong>${herb}</strong>
                </div>
            `).join('');
        }

        // Update Diet Grid (Simple list for now)
        const dietContainer = document.getElementById('res-diet-grid');
        if(dietContainer) {
            dietContainer.innerHTML = recommendations.diet.map(item => `
                <div class="diet-item-card" style="padding:5px; border-bottom:1px solid #eee;">• ${item}</div>
            `).join('');
        }

        // Update Nutrients
        const nutrientTable = document.getElementById('res-nutrients-table');
        if(nutrientTable) {
            nutrientTable.innerHTML = recommendations.nutrients.map(n => `
                <tr><td>${n.name}</td><td>${n.reason}</td><td>${n.sources}</td></tr>
            `).join('');
        }
    }

    // Dashboard Methods
    loadDashboard() {
        this.updateStats();
        this.loadRecentPatients();
    }

    updateStats() {
        const totalPatients = this.patients.length;
        const doshaCounts = { vata: 0, pitta: 0, kapha: 0 };

        this.patients.forEach(patient => {
            if (patient.doshaProfile && patient.doshaProfile.dominant) {
                const dom = patient.doshaProfile.dominant.toLowerCase();
                if(doshaCounts[dom] !== undefined) doshaCounts[dom]++;
            }
        });

        // Use safe selectors
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = totalPatients;
            statValues[1].textContent = doshaCounts.vata;
            statValues[2].textContent = doshaCounts.pitta;
            statValues[3].textContent = doshaCounts.kapha;
        }
    }

    loadRecentPatients() {
        const recent = this.patients.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        const tbody = document.getElementById('recent-patients-table');
        if (!tbody) return;

        tbody.innerHTML = recent.map(patient => `
            <tr onclick="ayurcare.viewPatient('${patient.id}')" style="cursor:pointer">
                <td>${patient.name}</td>
                <td>${new Date(patient.createdAt).toLocaleDateString()}</td>
                <td><span class="status-badge" style="background:#e6f4ea; color:#1e8e3e; padding:2px 8px; border-radius:10px; font-size:0.8rem;">Completed</span></td>
                <td>${patient.doshaProfile?.dominant || '-'}</td>
                <td><i class="fa-solid fa-chevron-right"></i></td>
            </tr>
        `).join('');
    }

    // Patient Records Methods
    loadPatientList() {
        PatientFilter.apply(); // Re-use the filter logic to load the initial list
    }

    viewPatient(id) {
        const patient = this.patients.find(p => p.id === id);
        if (!patient) return;

        this.currentPatient = patient;

        // Update view
        const initials = document.getElementById('view-initials');
        if(initials) initials.textContent = patient.name.charAt(0).toUpperCase();
        
        const nameEl = document.getElementById('view-name');
        if(nameEl) nameEl.textContent = patient.name;
        
        const metaEl = document.getElementById('view-meta');
        if(metaEl) metaEl.textContent = `Age: ${patient.age} • ${patient.gender}`;

        // Show patient details
        const placeholder = document.getElementById('patient-placeholder');
        const fullView = document.getElementById('patient-full-view');
        
        if(placeholder) placeholder.classList.add('hidden');
        if(fullView) fullView.classList.remove('hidden');

        // Charts would go here
        this.loadConsultationHistory(patient);
    }

    loadConsultationHistory(patient) {
        const list = document.getElementById('consultation-history-list');
        if (!list) return;
        
        const consultations = patient.consultations || [];
        if (consultations.length === 0) {
            list.innerHTML = '<li style="color:#888;">No prior history recorded.</li>';
            return;
        }
        // Render history...
    }

    showPatientPlaceholder() {
        const placeholder = document.getElementById('patient-placeholder');
        const fullView = document.getElementById('patient-full-view');
        
        if(placeholder) placeholder.classList.remove('hidden');
        if(fullView) fullView.classList.add('hidden');
        this.currentPatient = null;
    }

    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const search = document.getElementById('patient-search');
            if(search) search.focus();
        }
    }
}

// Global functions for HTML onclick handlers
function navigateTo(view) {
    if(window.ayurcare) window.ayurcare.navigateTo(view);
}

function deletePatient() {
    if (window.ayurcare && window.ayurcare.currentPatient && confirm('Are you sure you want to delete this patient?')) {
        window.ayurcare.deletePatient(window.ayurcare.currentPatient.id);
    }
}

function toggleInputMode(mode) {
    const manual = document.getElementById('history-manual-container');
    const upload = document.getElementById('history-upload-container');

    if (!manual || !upload) return;

    if (mode === 'manual') {
        manual.classList.remove('hidden');
        upload.classList.add('hidden');
    } else {
        manual.classList.add('hidden');
        upload.classList.remove('hidden');
    }
    
    // Update active class on buttons
    document.querySelectorAll('.toggle-option').forEach(opt => opt.classList.remove('active'));
    // This is simple logic, assumes order.
}

// Initialize the application globally
window.ayurcare = new AyurCare();