// AyurCare Translations
// translations.js - Internationalization support

const translations = {
    en: {
        // Navigation
        nav_dashboard: "Dashboard",
        nav_analysis: "New Analysis",
        nav_patients: "Patients",
        nav_settings: "Settings",

        // Dashboard
        stat_total_patients: "Total Patients",
        stat_trend_positive: "+12% this month",
        recent_consultations: "Recent Consultations",
        th_patient: "Patient Name",
        th_date: "Date",
        th_status: "Status",
        th_dosha: "Dosha",
        th_action: "Action",

        // Dosha names
        dosha_vata: "Vata Dominant",
        dosha_pitta: "Pitta Dominant",
        dosha_kapha: "Kapha Dominant",

        // Analysis form
        title_diagnostics: "Patient Diagnostics",
        label_fullname: "Full Name",
        label_age: "Age",
        label_gender: "Gender",
        label_weight: "Weight (kg)",
        label_height: "Height (cm)",
        label_history: "Medical History / Symptoms",
        label_lifestyle: "Lifestyle & Habits",
        btn_manual: "Manual Text",
        btn_upload: "Upload Report",
        btn_analyze: "Run Analysis & Generate Plan",

        // Gender options
        gender_male: "Male",
        gender_female: "Female",
        gender_other: "Other",

        // Lifestyle checkboxes
        chk_smoking: "Smoking",
        chk_alcohol: "Alcohol",
        chk_sedentary: "Sedentary",
        chk_vegetarian: "Vegetarian",

        // Results
        title_health_profile: "Health Profile",
        title_constitution: "Ayurvedic Constitution",
        title_nutrients: "Essential Nutrient Analysis",
        title_medicines: "Herbal Recommendations",
        title_diet: "Personalized 7-Day Diet Plan",
        btn_download_report: "Download Report",

        // Settings
        page_title_settings: "Settings",
        settings_language: "Language & localization",
        lbl_select_lang: "Interface Language",
        lbl_sanskrit_mode: "Show Sanskrit Terms",
        desc_sanskrit: "Display medicine names in Devanagari script",
        settings_backup: "Data & Backup",

        // Placeholders
        ph_history: "e.g. Acid reflux, joint pain, insomnia, diabetes..."
    },

    hi: {
        // Navigation
        nav_dashboard: "डैशबोर्ड",
        nav_analysis: "नई विश्लेषण",
        nav_patients: "मरीज़",
        nav_settings: "सेटिंग्स",

        // Dashboard
        stat_total_patients: "कुल मरीज़",
        stat_trend_positive: "इस महीने +12%",
        recent_consultations: "हाल की परामर्श",
        th_patient: "मरीज़ का नाम",
        th_date: "तारीख",
        th_status: "स्थिति",
        th_dosha: "दोष",
        th_action: "कार्रवाई",

        // Dosha names
        dosha_vata: "वात प्रमुख",
        dosha_pitta: "पित्त प्रमुख",
        dosha_kapha: "कफ प्रमुख",

        // Analysis form
        title_diagnostics: "मरीज़ निदान",
        label_fullname: "पूरा नाम",
        label_age: "आयु",
        label_gender: "लिंग",
        label_weight: "वजन (किग्रा)",
        label_height: "ऊंचाई (सेमी)",
        label_history: "मेडिकल इतिहास / लक्षण",
        label_lifestyle: "जीवनशैली और आदतें",
        btn_manual: "मैनुअल टेक्स्ट",
        btn_upload: "रिपोर्ट अपलोड करें",
        btn_analyze: "विश्लेषण चलाएं और योजना बनाएं",

        // Gender options
        gender_male: "पुरुष",
        gender_female: "महिला",
        gender_other: "अन्य",

        // Lifestyle checkboxes
        chk_smoking: "धूम्रपान",
        chk_alcohol: "शराब",
        chk_sedentary: "स्थिर जीवनशैली",
        chk_vegetarian: "शाकाहारी",

        // Results
        title_health_profile: "स्वास्थ्य प्रोफ़ाइल",
        title_constitution: "आयुर्वेदिक संविधान",
        title_nutrients: "आवश्यक पोषक तत्व विश्लेषण",
        title_medicines: "हर्बल सिफारिशें",
        title_diet: "व्यक्तिगत 7-दिन आहार योजना",
        btn_download_report: "रिपोर्ट डाउनलोड करें",

        // Settings
        page_title_settings: "सेटिंग्स",
        settings_language: "भाषा और स्थानीयकरण",
        lbl_select_lang: "इंटरफेस भाषा",
        lbl_sanskrit_mode: "संस्कृत शब्द दिखाएं",
        desc_sanskrit: "दवा के नाम देवनागरी लिपि में दिखाएं",
        settings_backup: "डेटा और बैकअप",

        // Placeholders
        ph_history: "उदाहरण: एसिड रिफ्लक्स, जोड़ दर्द, अनिद्रा, मधुमेह..."
    },

    ur: {
        // Navigation
        nav_dashboard: "ڈیش بورڈ",
        nav_analysis: "نیا تجزیہ",
        nav_patients: "مریض",
        nav_settings: "ترتیبات",

        // Dashboard
        stat_total_patients: "کل مریض",
        stat_trend_positive: "اس مہینے +12%",
        recent_consultations: "حالیہ مشاورت",
        th_patient: "مریض کا نام",
        th_date: "تاریخ",
        th_status: "حالت",
        th_dosha: "دوشا",
        th_action: "عمل",

        // Dosha names
        dosha_vata: "واتا غالب",
        dosha_pitta: "پتا غالب",
        dosha_kapha: "کپھا غالب",

        // Analysis form
        title_diagnostics: "مریض کی تشخیص",
        label_fullname: "پورا نام",
        label_age: "عمر",
        label_gender: "جنس",
        label_weight: "وزن (کلو)",
        label_height: "قد (سینٹی میٹر)",
        label_history: "میڈیکل تاریخ / علامات",
        label_lifestyle: "لائف اسٹائل اور عادات",
        btn_manual: "دستی تحریر",
        btn_upload: "رپورٹ اپ لوڈ کریں",
        btn_analyze: "تجزیہ چلائیں اور پلان بنائیں",

        // Gender options
        gender_male: "مرد",
        gender_female: "عورت",
        gender_other: "دیگر",

        // Lifestyle checkboxes
        chk_smoking: "تمباکو نوشی",
        chk_alcohol: "شراب",
        chk_sedentary: "بیٹھے رہنے والی زندگی",
        chk_vegetarian: "سبزی خور",

        // Results
        title_health_profile: "صحت پروفائل",
        title_constitution: "ایورویدک آئین",
        title_nutrients: "ضروری غذائی تجزیہ",
        title_medicines: "ہربل سفارشات",
        title_diet: "ذاتی 7 دن کا خوراک پلان",
        btn_download_report: "رپورٹ ڈاؤن لوڈ کریں",

        // Settings
        page_title_settings: "ترتیبات",
        settings_language: "زبان اور لوکلائزیشن",
        lbl_select_lang: "انٹرفیس زبان",
        lbl_sanskrit_mode: "سنسکرت الفاظ دکھائیں",
        desc_sanskrit: "دوا کے نام دیوناگری رسم الخط میں دکھائیں",
        settings_backup: "ڈیٹا اور بیک اپ",

        // Placeholders
        ph_history: "مثال: ایسڈ ریفلکس، جوڑوں کا درد، نیند نہ آنا، ذیابیطس..."
    }
};

class LanguageManager {
    static currentLang = 'en';
    static translations = translations;

    static init() {
        this.currentLang = localStorage.getItem('ayurcare_lang') || 'en';
        this.applyTranslations();
    }

    static setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language '${lang}' not available, falling back to English`);
            lang = 'en';
        }

        this.currentLang = lang;
        localStorage.setItem('ayurcare_lang', lang);
        this.applyTranslations();
    }

    static applyTranslations() {
        const lang = this.translations[this.currentLang];
        if (!lang) return;

        // Update all elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (lang[key]) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = lang[key];
                } else {
                    element.textContent = lang[key];
                }
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-ph]').forEach(element => {
            const key = element.getAttribute('data-i18n-ph');
            if (lang[key]) {
                element.placeholder = lang[key];
            }
        });
    }

    static getText(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    static toggleSanskrit(enabled) {
        // This would implement Sanskrit transliteration
        // For now, just store the preference
        localStorage.setItem('ayurcare_sanskrit', enabled);
        console.log('Sanskrit mode:', enabled ? 'enabled' : 'disabled');
    }
}

// Initialize translations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.init();
});
