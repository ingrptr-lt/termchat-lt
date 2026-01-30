/**
 * TERMOS: NEURAL LINK - CORE SYSTEM
 * Features: Failsafe DOM, Matrix Rain, PWA Install, AI, MQTT
 */

// --- 1. CONFIGURATION & STATE ---
const CONFIG = {
    mqttBroker: "broker.emqx.io",
    mqttPort: 8084,
    mqttTopic: "termos/v3/chat",
    groqKey: localStorage.getItem('termos_groq_key') || "", 
    username: "Anon_" + Math.floor(Math.random() * 1000)
};

const STATE = {
    level: 1,
    xp: 0,
    room: "lobby",
    deferredPrompt: null // For PWA install
};

// --- 2. FAILSAFE DOM GENERATOR ---
// Ensures the app works even if HTML structure is broken or missing
function ensureElement(id, tag, className, parent = document.body) {
    let el = document.getElementById(id);
    if (!el) {
        console.warn(`[FAILSAFE] Recreating missing element: #${id}`);
        el = document.createElement(tag);
        el.id = id;
        if (className) el.className = className;
        parent.appendChild(el);
    }
    return el;
}

// --- 3. MATRIX RAIN EFFECT ---
function initMatrix() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '5'; // Behind UI, above background
    canvas.style.opacity = '0.15';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    function matrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#0f0';
        ctx.font = '15pt monospace';

        ypos.forEach((y, index) => {
            const text = String.fromCharCode(Math.random() * 128);
            const x = index * 20;
            ctx.fillText(text, x, y);
            if (y > 100 + Math.random() * 10000) ypos[index] = 0;
            else ypos[index] = y + 20;
        });
    }
    setInterval(matrix, 50);
}

// --- 4. BOOT SEQUENCE ---
async function runBootSequence() {
    const bootScreen = ensureElement('boot-screen', 'div');
    const bootBar = ensureElement('boot-bar', 'div');
    const bootText = ensureElement('boot-text', 'div');
    const mainInterface = ensureElement('main-interface', 'div');
    
    bootScreen.classList.remove('hidden');
    mainInterface.classList.add('opacity-0');

    const steps = [
        "LOADING BIOS...",
        "CHECKING MEMORY MODULES...",
        "CONNECTING TO NEURAL NET...",
        "MOUNTING VIRTUAL FILESYSTEM...",
        "ACCESS GRANTED."
    ];

    for (let i = 0; i <= 100; i += 2) {
        bootBar.style.width = `${i}%`;
        if (i % 20 === 0) {
            const stepIndex = i / 20;
            if (steps[stepIndex]) bootText.innerText = steps[stepIndex];
        }
        await new Promise(r => setTimeout(r, 30)); // Speed of boot
    }

    bootScreen.classList.add('hidden');
    mainInterface.classList.remove('opacity-0');
    addSystemMessage(`WELCOME BACK, ${CONFIG.username}.`);
    initMQTT();
}

// --- 5. PWA INSTALL LOGIC ---
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    STATE.deferredPrompt = e;
    
    // Show our custom install button in UI
    const installBtn = ensureElement('install-btn', 'button');
    const modal = ensureElement('custom-install-modal', 'div');
    
    installBtn.classList.remove('hidden');
    
    // Show modal automatically after 5 seconds if not installed
    setTimeout(() => {
        if (!localStorage.getItem('termos_installed')) {
            modal.classList.remove('hidden');
        }
    }, 5000);
});

// Handle Install Clicks
document.getElementById('modal-install-confirm').addEventListener('click', async () => {
    const modal = document.getElementById('custom-install-modal');
    modal.classList.add('hidden');
    if (STATE.deferredPrompt) {
        STATE.deferredPrompt.prompt();
        const { outcome } = await STATE.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            localStorage.setItem('termos_installed', 'true');
        }
        STATE.deferredPrompt = null;
    }
});

document.getElementById('modal-install-cancel').addEventListener('click', () => {
    document.getElementById('custom-install-modal').classList.add('hidden');
});

document.getElementById('install-btn').addEventListener('click', async () => {
    if (STATE.deferredPrompt) {
        STATE.deferredPrompt.prompt();
        STATE.deferredPrompt = null;
    }
});

// --- 6. CHAT & UI LOGIC ---
function addMessage(text, type = 'user', sender = 'SYS') {
    const container = ensureElement('chat-container', 'main');
    const div = document.createElement('div');
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (type === 'system') {
        div.className = "text-center text-xs text-gray-500 my-2 border-t border-b border-gray-800 py-1 uppercase tracking-widest";
        div.innerText = text;
    } else if (type === 'ai') {
        div.className = "flex items-start gap-2 animate-[fadeIn_0.3s_ease-out]";
        div.innerHTML = `
            <div class="w-8 h-8 rounded bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 shrink-0">AI</div>
            <div class="msg-bubble ai-bubble bg-black/50 p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg text-sm">
                <div class="text-[10px] text-cyan-600 mb-1">AI CORE // ${time}</div>
                ${text}
            </div>
        `;
    } else {
        div.className = "flex items-start gap-2 flex-row-reverse animate-[fadeIn_0.3s_ease-out]";
        div.innerHTML = `
            <div class="w-8 h-8 rounded bg-green-900 border border-green-500 flex items-center justify-center text-green-100 shrink-0">ME</div>
            <div class="msg-bubble bg-green-900/20 p-3 rounded-tl-lg rounded-bl-lg rounded-br-lg text-sm text-right">
                <div class="text-[10px] text-green-600 mb-1">${time} // ${sender}</div>
                <div class="text-left">${text}</div>
            </div>
        `;
    }
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addSystemMessage(text) {
    addMessage(text, 'system');
}

function updateXP(amount) {
    STATE.xp += amount;
    if (STATE.xp >= STATE.level * 100) {
        STATE.level++;
        STATE.xp = 0;
        addSystemMessage(`LEVEL UP! YOU ARE NOW LEVEL ${STATE.level}`);
        // Trigger animation
        const lvlDisp = document.getElementById('lvl-disp');
        lvlDisp.classList.add('text-cyan-400', 'scale-150', 'transition-transform');
        setTimeout(() => lvlDisp.classList.remove('text-cyan-400', 'scale-150'), 1000);
    }
    document.getElementById('lvl-disp').innerText = STATE.level;
}

// --- 7. AI LOGIC (GROQ) ---
async function handleAI(prompt) {
    addMessage("Processing request...", "ai", "THINKING");
    
    if (!CONFIG.groqKey) {
        addMessage("ERROR: Missing API Key. Type /setkey [your_key]", "ai", "ERR");
        return;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CONFIG.groqKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are TermOS AI. Short, cyberpunk, helpful." },
                    { role: "user", content: prompt }
                ],
                model: "llama3-8b-8192"
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        addMessage(reply, "ai", "AI_CORE");
    } catch (e) {
        addMessage("CONNECTION FAILED.", "ai", "ERR");
    }
}

// --- 8. MQTT LOGIC ---
function initMQTT() {
    try {
        const clientId = "termos_" + Math.random().toString(16).substr(2, 8);
        const client = new Paho.MQTT.Client(CONFIG.mqttBroker, CONFIG.mqttPort, clientId);

        client.onConnectionLost = () => {
            addSystemMessage("CONNECTION LOST. RETRYING...");
            setTimeout(initMQTT, 5000);
        };

        client.onMessageArrived = (message) => {
            const data = JSON.parse(message.payloadString);
            if (data.sender !== CONFIG.username) {
                addMessage(data.text, 'user', data.sender);
            }
        };

        client.connect({
            onSuccess: () => {
                addSystemMessage("LINK ESTABLISHED.");
                client.subscribe(CONFIG.mqttTopic);
            },
            useSSL: true
        });

        // Expose client globally to send messages
        window.mqttClient = client;

    } catch (e) {
        addSystemMessage("MQTT MODULE ERROR.");
    }
}

// --- 9. INPUT HANDLER ---
function handleSend() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    // Commands
    if (text.startsWith('/ai ')) {
        handleAI(text.substring(4));
    } else if (text.startsWith('/setkey ')) {
        CONFIG.groqKey = text.substring(8);
        localStorage.setItem('termos_groq_key', CONFIG.groqKey);
        addSystemMessage("KEY ENCRYPTED & SAVED.");
    } else if (text === '/clear') {
        document.getElementById('chat-container').innerHTML = '';
    } else {
        // Normal Chat
        addMessage(text, 'user', CONFIG.username);
        updateXP(1);
        
        if (window.mqttClient && window.mqttClient.isConnected()) {
            const msg = new Paho.MQTT.Message(JSON.stringify({ sender: CONFIG.username, text: text }));
            msg.destinationName = CONFIG.mqttTopic;
            window.mqttClient.send(msg);
        }
    }
    
    input.value = '';
}

// --- 10. INITIALIZATION ---
window.onload = () => {
    initMatrix();
    runBootSequence();
    
    document.getElementById('send-btn').addEventListener('click', handleSend);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Voice Input
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        document.getElementById('voice-btn').addEventListener('click', () => {
            recognition.start();
            document.getElementById('voice-btn').classList.add('text-red-500', 'animate-pulse');
        });

        recognition.onresult = (event) => {
            document.getElementById('user-input').value = event.results[0][0].transcript;
            document.getElementById('voice-btn').classList.remove('text-red-500', 'animate-pulse');
        };
        
        recognition.onerror = () => document.getElementById('voice-btn').classList.remove('text-red-500', 'animate-pulse');
        recognition.onend = () => document.getElementById('voice-btn').classList.remove('text-red-500', 'animate-pulse');
    } else {
        document.getElementById('voice-btn').style.display = 'none';
    }
};
