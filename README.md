# 🌿 AyurCare - Intelligent Practice Management

A comprehensive, feature-rich Ayurvedic practice management system with AI-powered assistance, built with modern web technologies.

## 🚀 New Features (Latest Update)

### 🎨 **UI/UX Enhancements**

#### Dark Mode
- **Classical Dark Theme**: Toggle between light and parchment mode for reduced eye strain
- **Persistent Preference**: Your theme choice is saved locally
- **Quick Toggle**: Click the sun/moon icon in the header or press `Ctrl+/`

#### Mobile Responsive Design
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Touch Optimized**: All interactions are touch-friendly
- **Mobile Navigation**: Hamburger menu for easy navigation on small screens
- **Adaptive Layouts**: Grid and flex layouts adjust automatically

### 📢 **Toast Notification System**
- **Real-time Feedback**: Success, error, warning, and info notifications
- **Non-intrusive**: Auto-dismisses after 4 seconds
- **Click to Dismiss**: Tap any toast to close it immediately
- **Accessible**: ARIA live regions for screen readers

### 🔍 **Enhanced Patient Search & Filtering**
- **Real-time Search**: Filter patients as you type (`Ctrl+K` to focus)
- **Dosha Filtering**: Filter by Vata, Pitta, Kapha, or All
- **Multiple Sort Options**:
  - Sort by Name (A-Z)
  - Sort by Date (Most Recent)
  - Toggle ascending/descending order
- **Visual Indicators**: Active filters are highlighted

### 🎤 **Voice Input for Chat**
- **Speech-to-Text**: Click the microphone icon to speak your questions
- **Real-time Transcription**: See your words appear as you speak
- **Hands-free Interaction**: Perfect during consultations
- **Browser Support**: Works in Chrome, Edge, and Safari

### 📤 **Data Export & Import**
- **Export to CSV**: Patient demographics and latest assessments
- **Backup to JSON**: Complete database backup with full history
- **Import from JSON**: Restore from previous backups
- **One-click Access**: Export menu in the header

### 💊 **Enhanced Prescription Generator**
- **Professional PDF**: Beautifully formatted prescriptions
- **Complete Information**: Includes medicines, dosages, and diet plan
- **Branding**: AyurCare header with professional styling
- **Auto-filename**: Saves as `PatientName_Prescription_Date.pdf`

### 📱 **Progressive Web App (PWA)**
- **Installable**: Add AyurCare to your home screen/desktop
- **Offline Support**: Works without internet (cached data)
- **App-like Experience**: Full-screen, no browser chrome
- **Service Worker**: Background caching for faster loads

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+K` / `Cmd+K`: Focus patient search
- `Ctrl+/` / `Cmd+/`: Toggle dark mode
- `Ctrl+N` / `Cmd+N`: New patient analysis
- `Enter`: Send chat message
- `Shift+Enter`: New line in chat

### ♿ **Accessibility Improvements**
- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Tab through all controls
- **Focus Indicators**: Clear visual focus states
- **Screen Reader Support**: Semantic HTML and live regions
- **Skip Links**: Jump directly to main content
- **Color Contrast**: WCAG AA compliant

### 🤖 **AI Enhancements**
- **Robust API Integration**: Fallback model support for reliability
- **Better Context**: Patient information included in queries
- **Improved Prompting**: More accurate Ayurvedic responses
- **Error Handling**: Graceful degradation with helpful messages
- **Timeout Protection**: 15-second API timeout with retries

---

## 🛠️ Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI**: Google Gemini API (1.5 Flash, Pro, 2.0 variants)
- **Charts**: Chart.js
- **PDF Generation**: jsPDF with autoTable plugin
- **OCR**: Tesseract.js
- **Icons**: Font Awesome 6.4
- **Fonts**: Playfair Display, Georgia (Classical theme)
- **PWA**: Service Workers, Web App Manifest

---

## 📁 File Structure

```
ayurcare/
├── index.html              # Main application HTML
├── style.css               # Core classical styling
├── enhancements.css        # Dark mode, mobile, toast styles
├── script.js               # Core application logic
├── enhancements.js         # New features (toast, voice, export, etc.)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline support
└── README.md               # This file
```

---

## 🚦 Getting Started

### Local Setup
1. **Clone/Download** the files to a directory
2. **Open** `index.html` in a modern browser
3. **Allow Microphone** (for voice input feature)
4. **Install as App** (optional): Look for install prompt or use browser's install option

### Gemini API Setup
The application includes a pre-configured Gemini API key. For production use:
1. Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Open `enhancements.js`
3. Find `GEMINI_CONFIG.apiKey`
4. Replace with your key

---

## 📖 User Guide

### Dashboard
- View patient statistics by Dosha type
- See recent consultations
- Quick access to patient records

### New Analysis
1. Enter patient demographics
2. Add medical history (type or upload image/PDF for OCR)
3. Select lifestyle habits
4. Click "Run Analysis"
5. View detailed Dosha analysis, BMI, and recommendations
6. Download PDF prescription or full report

### Patient Records
- Search patients by name
- Filter by Dosha constitution
- Sort by name or date
- Click any patient to view full history
- See progress charts (Weight, BMI)
- Delete records if needed

### AyurBot Chat
- Click the floating chat button
- Type or speak your questions
- Get instant Ayurvedic advice
- Ask about herbs, diet, treatments, etc.

### Export/Import
1. Click the download icon in header
2. Choose export format (CSV/JSON)
3. Or import previous backups
4. Generate prescriptions PDF

---

## 💡 Tips & Best Practices

### Performance
- The app caches data locally for offline use
- First load might be slower (downloads service worker)
- Subsequent loads are instant

### Data Privacy
- All patient data stored in browser's localStorage
- No data sent to servers (except AI queries to Gemini)
- Regular JSON backups recommended

### Mobile Use
- Install as PWA for best experience
- Use voice input during consultations
- Dark mode recommended for extended use

### Keyboard Power Users
- Master the shortcuts for faster workflow
- Use `Tab` for navigation
- `Ctrl+K` is your best friend for quick patient lookup

---

## 🔐 Security & Privacy

- **Local-first**: Patient data never leaves your device
- **Encrypted Storage**: localStorage is browser-encrypted
- **API Security**: Gemini API key should be moved to backend for production
- **No Tracking**: Zero analytics or third-party scripts

---

## 🐛 Troubleshooting

### Voice Input Not Working
- Ensure browser supports Web Speech API (Chrome/Edge recommended)
- Grant microphone permissions
- Check browser console for errors

### PWA Not Installing
- Use HTTPS (or localhost for testing)
- Clear browser cache
- Ensure manifest.json is accessible

### Export Not Working
- Check browser allows file downloads
- Disable popup blockers
- Try different export format

### Dark Mode Not Persisting
- Clear localStorage: `localStorage.clear()`
- Check browser allows localStorage
- Try incognito mode to test

---

## 🔄 Changelog

### v2.0.0 (Latest)
- ✅ Dark mode with persistent preference
- ✅ Mobile responsive design
- ✅ Toast notification system
- ✅ Enhanced patient search/filtering
- ✅ Voice input for chat
- ✅ Data export/import (CSV, JSON)
- ✅ Enhanced PDF prescription generator
- ✅ PWA support with offline mode
- ✅ Keyboard shortcuts
- ✅ Accessibility improvements
- ✅ Robust Gemini API integration

### v1.0.0
- Basic patient management
- Dosha analysis
- PDF reports
- AyurBot chat (limited)
- Dashboard statistics

---

## 🤝 Contributing

This is a complete, production-ready application. Suggested improvements:
- Multi-language support (Hindi, Sanskrit)
- Appointment scheduling
- Email/SMS notifications
- Cloud backup integration
- Team collaboration features

---

## 📄 License

Free to use for personal and commercial Ayurvedic practices.

---

## 🙏 Acknowledgments

- **Ayurvedic Knowledge**: Ancient wisdom of Charaka and Sushruta
- **Modern AI**: Google Gemini for intelligent assistance
- **Open Source**: Chart.js, jsPDF, Tesseract.js, Font Awesome

---

## 📞 Support

For issues or feature requests:
1. Check the Troubleshooting section
2. Review browser console for errors
3. Ensure all files are in the same directory
4. Test in latest Chrome/Edge for best results

---

**Built with 💚 for Ayurvedic Practitioners**

*Classical design meets modern technology*
