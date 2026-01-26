// =========================================================================
//         TERMOS LT: HYBRID EDITION (MATRIX + GLASS)
// =========================================================================

// --- 1. CONFIGURATION ---
// REPLACE WITH YOUR ACTUAL KEY OR LOAD FROM ENV
const GROQ_API_KEY = "gsk_YOUR_GROQ_API_KEY_HERE"; 
const REPO_OWNER = "ingrptr-lt";
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// --- 2. STATE ---
let username = 'Anon_' + Math.floor(Math.random() * 1000);
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };

const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];
const AVATARS = {
    'default': 'ME', // Shown in UI
    'hacker': 'HK',
    'wizard': 'WZ'
};

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    initSafeCatch();
});

function initSafeCatch() {
    try {
        console.log('%c TERMOS LT v2.0 INITIATED ', 'background: #000; color: #00ff41; font-size: 20px');
        
        // Check Login
        const savedUser = localStorage.getItem('termos_user');
        if(savedUser) username = savedUser;

        // Update UI Header
        updateRoomHeader(currentRoom);
        updateStatsUI();

        // Setup Listeners
        setupInputListener();
        
        // Connect Systems
        connectMQTT();

        // Start Matrix Rain (If canvas exists)
        // Note: Logic is handled in the HTML script tag, but we ensure sizing here
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('matrix-canvas');
            if(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        });

    } catch (e) {
        alert('CRITICAL INIT ERROR: ' + e.message);
    }
}

// --- 4. UI CONTROLLER ---
function updateRoomHeader(room) {
    const title = document.getElementById('current-room-title');
    if(title) title.innerText = room.toUpperCase().replace('_', ' ');
}

function updateStatsUI() {
    const titleEl = document.querySelector('.text-green-400.retro-text'); // Selects the LVL text
    const xpEl = document.querySelector('.text-gray-400.font-mono'); // Selects the XP text
    const barEl = document.querySelector('.h-full.bg-gradient-to-r'); // Progress bar

    if(titleEl) titleEl.innerText = `LVL. ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    
    // Calculate simple width (Level up every 1000xp for demo)
    const progress = (userStats.xp % 1000) / 10; 
    if(barEl) barEl.style.width = `${progress}%`;
}

function switchRoom(roomId) {
    currentRoom = roomId;
    updateRoomHeader(roomId);
    // In a full app, you would unsubscribe from old topic and subscribe to new here
    addSystemMessage(`System: Switched frequency to sector [${roomId.toUpperCase()}]`);
}

// --- 5. INPUT & COMMANDS ---
function setupInputListener() {
    const input = document.getElementById('chatInput');
    if(!input) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if(!txt) return;
            
            processCommand(txt);
            input.value = '';
            input.style.height = 'auto'; // Reset height
        }
    });
}

function processCommand(txt) {
    // AI CLONE COMMAND
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }

    // VOICE COMMAND
    if (txt.startsWith('/voice')) {
        startVoiceRecognition();
        return;
    }

    // AGENTIC ACTIONS (SIMULATED)
    const lower = txt.toLowerCase();
    if (lower.includes('play music') || lower.includes('play jazz')) {
        addUserMessage(txt);
        addAIMessage("Playing Smooth Jazz stream... 🎵", true);
        // Here you would actually trigger an audio player
        return;
    }

    if (lower.includes('open panel')) {
        addUserMessage(txt);
        addAIMessage("Opening Workshop Control Panel... 🛠️", true);
        setTimeout(() => switchRoom('workshop'), 1000);
        return;
    }

    // STANDARD CHAT
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 6. MESSAGE RENDERING (HYBRID UI) ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `
        <div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div>
            <div class="msg-user p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%]">
                <div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400">
                    <span>@${username.toUpperCase()}</span>
                    <span>${time}</span>
                </div>
                <p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction = false) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // If it's an action, style it differently
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10';

    const html = `
        <div class="flex flex-row items-start gap-3 animate-fade-in-up">
            <div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[10px]">AI</div>
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-cyan-400">
                    <span>TERMAI</span>
                    <span>${time}</span>
                </div>
                <div class="p-4 rounded-r-xl rounded-bl-xl bg-black/40 ${cssClass} text-sm text-gray-200 backdrop-blur-sm">
                    <p class="leading-relaxed">${text}</p>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-container');
    
    const html = `
        <div class="msg-system p-4 rounded-r-xl rounded-bl-xl text-sm text-cyan-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-fade-in-up">
            <div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-cyan-400">
                <span>⚠ SYSTEM</span>
            </div>
            <p class="leading-relaxed">${text}</p>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('chat-container');
    if(container) container.scrollTop = container.scrollHeight;
}

// --- 7. THE CLONE (GROQ AI) ---
async function talkToClone(prompt) {
    try {
        addAIMessage('...', false); // Loading state

        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system", 
                    content: "You are TERMAI, a helpful AI assistant in a Cyberpunk Multiverse. Keep answers short and tech-savvy."
                }, {
                    role: "user", 
                    content: prompt
                }]
            })
        });

        const json = await req.json();
        // Remove loading dots (optional: just append new message)
        const reply = json.choices[0].message.content;
        addAIMessage(reply, false);
        
    } catch (err) {
        addAIMessage(`Connection Error: ${err.message}`, true);
    }
}

// --- 8. MQTT (REAL-TIME) ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        console.log("MQTT Library not loaded");
        return;
    }

    const clientId = "termos-hybrid-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId, keepalive: 60 });

    mqttClient.on('connect', () => {
        console.log("MQTT Connected to Matrix");
        addSystemMessage("Uplink established. Connected to Neural Net.");
        mqttClient.subscribe('termchat/messages');
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.user !== username) {
                // Render incoming message from another user
                // We reuse addUserMessage but modify it slightly for remote users
                // For simplicity in this script, we just add it as a generic message
                addRemoteUserMessage(data.user, data.text);
            }
        } catch (e) {
            console.error("MQTT Parse Error", e);
        }
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        const msg = { user: username, text: text, room: currentRoom, timestamp: Date.now() };
        mqttClient.publish('termchat/messages', JSON.stringify(msg));
    }
}

function addRemoteUserMessage(user, text) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `
        <div class="flex flex-row items-end gap-3 animate-fade-in-up opacity-80">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${user.substring(0,2).toUpperCase()}</div>
            <div class="p-4 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5">
                <div class="flex items-center gap-2 mb-1 opacity-70 text-xs font-mono text-gray-400">
                    <span>@${user.toUpperCase()}</span>
                    <span>${time}</span>
                </div>
                <p class="leading-relaxed">${escapeHtml(text)}</p>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

// --- 9. VOICE INTERFACE (WEB SPEECH API) ---
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice module not installed in this browser.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        addSystemMessage("Listening... (Speak now)");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        // Optionally auto-send
        // processCommand(transcript); 
    };

    recognition.onerror = (event) => {
        addSystemMessage("Voice Error: " + event.error);
    };

    recognition.start();
}

// --- 10. UTILS ---
function addXP(amount) {
    userStats.xp += amount;
    if(userStats.xp > (userStats.level * 1000)) {
        userStats.level++;
        userStats.title = LEVELS[userStats.level] || 'GOD MODE';
        addSystemMessage(`LEVEL UP! You are now a ${userStats.title}`);
    }
    updateStatsUI();
    localStorage.setItem('termos_stats', JSON.stringify(userStats));
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

// Global function for HTML buttons
window.switchRoom = switchRoom;
