// ==========================================
// 🤖 AyurBot AI Assistant (Gemini-Powered)
// ==========================================

/**
 * Gemini API Configuration
 * API Version: v1beta
 * Models: Gemini 1.5 Flash, Gemini Pro
 */
const GEMINI_CONFIG = {
    apiKey: localStorage.getItem('ayurcare_gemini_api_key') || 'AIzaSyCs24PijnL7CZRihbszqTgaGwyLf0Aw6p0',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    models: [
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-pro',
        'gemini-1.0-pro-latest'
    ],
    maxRetries: 3,
    timeout: 15000
};

/**
 * Toggle Chat Widget Visibility
 */
function toggleChat() {
    const widget = document.getElementById('ayurbot-widget');
    widget.classList.toggle('hidden');

    if (!widget.classList.contains('hidden')) {
        document.getElementById('chat-input').focus();

        // Initialize quick chips on first open
        const container = document.getElementById('chat-messages');
        if (!container.querySelector('.quick-chips-container')) {
            addQuickChips();
        }
    }
}

/**
 * Add Quick Reply Chips
 */
function addQuickChips() {
    const container = document.getElementById('chat-messages');
    if (container.querySelector('.quick-chips-container')) return;

    const chipsDiv = document.createElement('div');
    chipsDiv.className = 'quick-chips-container';

    const topics = [
        "Analyze Dosha",
        "Diet Substitutes",
        "Herbal Advice",
        "Stress Relief"
    ];

    topics.forEach(topic => {
        const chip = document.createElement('span');
        chip.className = 'quick-chip';
        chip.textContent = topic;
        chip.onclick = () => sendQuickReply(topic);
        chipsDiv.appendChild(chip);
    });

    container.appendChild(chipsDiv);
    container.scrollTop = container.scrollHeight;
}

/**
 * Send Quick Reply
 */
function sendQuickReply(text) {
    const input = document.getElementById('chat-input');
    input.value = text;
    sendMessage();
}

/**
 * Handle Enter Key in Chat Input
 */
function handleChatInput(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

/**
 * Main Message Sending Logic
 */
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // Display user message
    addMessage(userMessage, 'user');
    input.value = '';

    // Remove previous quick chips
    const oldChips = document.querySelector('.quick-chips-container');
    if (oldChips) oldChips.remove();

    // Show typing indicator
    const typingID = showTypingIndicator();

    try {
        // Get patient context
        const context = buildPatientContext(userMessage);

        // Get AI response
        let botResponse;
        if (isAPIKeyValid()) {
            botResponse = await getGeminiResponse(context);
        } else {
            // Fallback to heuristic responses
            await simulateThinking(1500);
            botResponse = generateFallbackResponse(
                userMessage,
                context.patientName,
                context.patientDosha
            );
        }

        // Remove typing indicator
        removeTypingIndicator(typingID);

        // Display bot response
        addMessage(botResponse, 'bot');

        // Re-add quick chips after delay
        setTimeout(addQuickChips, 500);

    } catch (error) {
        console.error('AyurBot Error:', error);
        removeTypingIndicator(typingID);

        let errorMessage = "I'm having trouble connecting to my knowledge base. Please try again.";

        // Provide more specific error messages
        if (error.message.includes('API key') || error.message.includes('400')) {
            errorMessage = "API key issue detected. Please check your Gemini API key in Settings.";
            // Clear invalid API key
            localStorage.removeItem('ayurcare_gemini_api_key');
            GEMINI_CONFIG.apiKey = '';
        } else if (error.message.includes('quota') || error.message.includes('429')) {
            errorMessage = "API quota exceeded. Please try again later or upgrade your plan.";
        } else if (error.message.includes('404')) {
            errorMessage = "API model not found. The requested AI model may be unavailable.";
        } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
            errorMessage = "Request timed out. Please check your internet connection and try again.";
        } else if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
            errorMessage = "Network error. Please check your internet connection.";
        }

        addMessage(errorMessage, 'bot');

        // If API failed, suggest using fallback
        if (!isAPIKeyValid()) {
            setTimeout(() => {
                addMessage("💡 Tip: Configure a Gemini API key in Settings for AI-powered responses, or I can provide general Ayurvedic guidance!", 'bot');
            }, 1000);
        }
    }
}

/**
 * Build Patient Context Object
 */
function buildPatientContext(userMessage) {
    const patientName = document.getElementById('p-name')?.value || "the patient";
    const doshaElement = document.getElementById('res-dosha-text');
    const patientDosha = doshaElement?.innerText.split(': ')[1] || "Unknown Constitution";

    return {
        patientName,
        patientDosha,
        userMessage,
        systemPrompt: `You are AyurBot, an expert Ayurvedic medical AI assistant.

Current Patient Context:
- Name: ${patientName}
- Dosha Constitution: ${patientDosha}

Instructions:
- Provide accurate, evidence-based Ayurvedic advice
- Include relevant herbs, diet recommendations, and lifestyle tips
- Add medical disclaimers when appropriate
- Keep responses concise but comprehensive
- Use a warm, professional tone

User Question: ${userMessage}`
    };
}

/**
 * Check if API Key is Valid
 */
function isAPIKeyValid() {
    return GEMINI_CONFIG.apiKey &&
        GEMINI_CONFIG.apiKey !== 'YOUR_API_KEY_HERE' &&
        GEMINI_CONFIG.apiKey.length > 20;
}

/**
 * Get Response from Gemini API (with fallback models)
 */
async function getGeminiResponse(context) {
    const { systemPrompt } = context;

    for (let i = 0; i < GEMINI_CONFIG.models.length; i++) {
        const model = GEMINI_CONFIG.models[i];

        try {
            console.log(`🔄 Attempting Gemini model: ${model}`);

            const response = await callGeminiAPI(model, systemPrompt);

            if (response && response.trim().length > 0) {
                console.log(`✅ Success with model: ${model}`);
                return response;
            }

        } catch (error) {
            console.warn(`⚠️ Model ${model} failed:`, error.message);

            // If it's the last model, throw the error
            if (i === GEMINI_CONFIG.models.length - 1) {
                throw error;
            }

            // If it's a 404, try next model immediately
            if (error.message.includes('404')) {
                continue;
            }

            // For other errors, wait before retry
            await simulateThinking(1000);
        }
    }

    throw new Error('All Gemini models failed to respond');
}

/**
 * Call Gemini API with Specific Model
 */
async function callGeminiAPI(model, prompt) {
    const url = `${GEMINI_CONFIG.baseURL}/models/${model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.timeout);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    topP: 0.8,
                    topK: 40
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error?.message ||
                `HTTP ${response.status}: ${response.statusText}`
            );
        }

        // Parse response
        const data = await response.json();

        // Validate response structure
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response candidates returned from Gemini');
        }

        const candidate = data.candidates[0];

        // Check for blocked content
        if (candidate.finishReason === 'SAFETY') {
            throw new Error('Response blocked due to safety filters');
        }

        // Extract text
        const text = candidate.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        return text.trim();

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Gemini API took too long to respond');
        }

        throw error;
    }
}

/**
 * Simulate Thinking Delay
 */
function simulateThinking(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Show Typing Indicator
 */
function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.id = id;
    div.className = 'typing-indicator';
    div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

/**
 * Remove Typing Indicator
 */
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Add Message to Chat
 */
function addMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    // Format bolding and lists roughly for HTML
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    div.innerHTML = `<p>${formatted}</p>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

/**
 * Fallback Heuristic Brain (If no API Key)
 */
function generateFallbackResponse(query, name, dosha) {
    const q = query.toLowerCase();

    // Expanded Knowledge Base
    if (q.includes('headache')) return "For headaches, Ayurveda suggests **Ginger tea** (Kapha/Vata) or **Cool milk applied to temples** (Pitta). Gentle massage with stimulating oils can also help.";
    if (q.includes('cold') || q.includes('cough')) return "A potent remedy is **Sitopaladi Churna** with honey. Steam inhalation with Eucalyptus oil is excellent for congestion.";
    if (q.includes('insomnia') || q.includes('sleep')) return "Warm **Nutmeg milk** before bed is a classic sedative. Massaging the feet with warm sesame oil (Padabhyanga) induces deep sleep.";
    if (q.includes('weight loss')) return "Focus on a **Kapha-pacifying diet**: warm, light, dry foods. Avoid dairy, sweets, and cold drinks. Triphala and Guggul are supportive herbs.";
    if (q.includes('skin') || q.includes('acne')) return "Acne is often a Pitta imbalance. Use **Neem** and **Turmeric** internally and externally. Avoid spicy and fried foods.";
    if (q.includes('hair')) return "**Bhringraj oil** is the king of herbs for hair growth. Amla is also essential for preventing graying and hair fall.";

    // Existing Logic
    if (q.includes('analyze') || q.includes('dosha')) {
        return "To analyze a Dosha, please go to the <strong>'New Analysis'</strong> tab and enter the patient's details. I will handle the math!";
    }

    // Stress
    if (q.includes('stress') || q.includes('anxiety')) {
        return "For stress relief, I recommend <strong>Ashwagandha</strong> supplements and practicing <em>Pranayama</em> (breath control). Avoiding caffeine is also crucial for Vata types.";
    }

    // Substitutes
    if (q.includes('substitute') || q.includes('alternative') || q.includes('replace')) {
        if (q.includes('rice') || q.includes('kitchari')) return "For Kitchari/Rice, you can substitute with Quinoa or Millet. They are lighter and have a lower glycemic index, good for Kapha types.";
        if (q.includes('milk') || q.includes('dairy')) return "Coconut milk or Almond milk are great Ayurvedic alternatives. Use warm almond milk for Vata and coconut milk for Pitta.";
        if (q.includes('sugar') || q.includes('sweet')) return "Jaggery (Gur) or Honey (Kapha only) are better than refined sugar. Stevia is good for diabetics.";
        return "I can suggest specific substitutes if you tell me which ingredient you want to replace (e.g., 'substitute for rice').";
    }

    // Herbs
    if (q.includes('ashwagandha')) return "<strong>Ashwagandha</strong> is an adaptogen that reduces stress and Vata imbalance. It builds strength/immunity (Ojas) but can be heavy for high-Kapha individuals.";
    if (q.includes('triphala')) return "<strong>Triphala</strong> is a tridoshic digestive tonic. It gently cleanses the colon, improves eye health, and balances all three doshas. Best taken before bed.";
    if (q.includes('brahmi')) return "<strong>Brahmi</strong> is excellent for the mind. It improves memory, reduces anxiety, and is cooling (good for Pitta).";
    if (q.includes('turmeric') || q.includes('haldi')) return "<strong>Turmeric</strong> is anti-inflammatory and blood purifying. Always combine with a pinch of black pepper for absorption.";

    // Dosha Explanations
    if (q.includes('what is vata')) return "<strong>Vata</strong> is the energy of movement (Air + Ether). When balanced: creative, energetic. Unbalanced: anxiety, dry skin, constipation.";
    if (q.includes('what is pitta')) return "<strong>Pitta</strong> is the energy of transformation (Fire + Water). When balanced: intelligent, sharp. Unbalanced: anger, acid reflux, inflammation.";
    if (q.includes('what is kapha')) return "<strong>Kapha</strong> is the energy of structure (Earth + Water). When balanced: calm, strong. Unbalanced: weight gain, lethargy, congestion.";

    // Contextual Help
    if (q.includes('this patient') || q.includes('current patient')) {
        if (name && dosha !== 'Unknown Constitution') {
            return `For <strong>${name}</strong> (likely ${dosha}), focus on ${getDoshaTip(dosha)}.`;
        } else {
            return "Please run an analysis first so I can give specific advice for this patient.";
        }
    }

    // Greetings / General
    if (q.includes('hello') || q.includes('hi')) return "Namaste! How can I assist with your practice today?";
    if (q.includes('thank')) return "You are welcome! Let healing prevail. 🙏";

    // Catch-all with encouragement to add key
    return `I see you are asking about "${query}". To unlock my full AI medical capabilities to answer ANY question, please configure a Gemini API key in the Settings menu. For now, I can provide general Ayurvedic guidance based on traditional knowledge. Try asking about common ailments like headache, cold, or insomnia!`;
}

/**
 * Test API Key Functionality
 */
async function testApiKey() {
    console.log('🔍 Testing Gemini API key...');

    try {
        const response = await callGeminiAPI('gemini-1.5-flash', 'Hello, respond with just "API working" if you can read this.');
        console.log('✅ API Test Successful:', response);
        return true;
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        return false;
    }
}

// Auto-test API key on load
document.addEventListener('DOMContentLoaded', () => {
    // Test API key after a short delay
    setTimeout(testApiKey, 2000);
});