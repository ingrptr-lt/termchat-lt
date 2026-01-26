// =========================================================================
//         TERMOS LT: HYBRID EDITION (MATRIX + GLASS)
// =========================================================================

// --- 1. CONFIGURATION ---
const GROQ_API_KEY = "gsk_YOUR_GROQ_API_KEY_HERE"; 
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// --- 2. STATE ---
let username = 'Guest';
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };

const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// --- 3. LOGIN & INITIALIZATION ---
window.addEventListener('load', () => {
    // Check for Matrix rain canvas
    initMatrix();
    
    // Auto-focus input
    const userInput = document.getElementById('usernameInput');
    if(userInput) {
        userInput.focus();
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
});

function login() {
    const input = document.getElementById('usernameInput');
    const name = input.value.trim();
    
    if (name.length < 2) {
        input.style.borderColor = 'red';
        input.classList.add('animate-pulse');
        return;
    }

    username = name;

    // 1. Transition UI
    document.getElementById('loginScreen').style.display = 'none';
    const main = document.getElementById('main-layout');
    main.classList.remove('hidden');
    main.classList.add('flex'); // Add flex back for layout
    
    // 2. Update User Info
    document.getElementById('user-display').innerText = `@${username.toUpperCase()}`;
    loadStats();
    updateStatsUI();

    // 3. Start Systems
    connectMQTT();
    addSystemMessage(`Welcome back, Operator ${username}. System Online.`);
}

// --- 4. UI CONTROLLER ---
function updateStatsUI() {
    const titleEl = document.getElementById('lvl-text');
    const xpEl = document.getElementById('xp-text');
    const barEl = document.getElementById('xp-bar');

    if(titleEl) titleEl.innerText = `LVL. ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    
    // Calculate width (Level up every 1000xp)
    const progress = (userStats.xp % 1000) / 10; 
    if(barEl) barEl.style.width = `${progress}%`;
}

function switchRoom(roomId) {
    currentRoom = roomId;
    document.getElementById('room-title').innerText = roomId.toUpperCase().replace('_', ' ');
    addSystemMessage(`Switched to sector [${roomId.toUpperCase()}]`);
}

// --- 5. INPUT HANDLING ---
const chatInput = document.getElementById('chatInput');
if(chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

function handleSend() {
    const txt = chatInput.value.trim();
    if(!txt) return;
    chatInput.value = '';
    processCommand(txt);
}

function processCommand(txt) {
    // AI COMMAND
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }

    // AGENTIC ACTIONS
    const lower = txt.toLowerCase();
    if (lower.includes('play music')) {
        addUserMessage(txt);
        addAIMessage("Playing Jazz stream... 🎵", true);
        return;
    }
    if (lower.includes('open panel')) {
        addUserMessage(txt);
        addAIMessage("Accessing Workshop Panel... 🛠️", true);
        setTimeout(() => switchRoom('workshop'), 1000);
        return;
    }

    // STANDARD CHAT
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 6. RENDERING ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `
        <div class="flex flex-row-reverse items-end gap-3 animate-fade-in">
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

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10';
    
    const html = `
        <div class="flex flex-row items-start gap-3 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[10px]">AI</div>
            <div class="flex-1">
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
        <div class="msg-system p-4 rounded-xl text-sm text-cyan-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-fade-in">
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
    const c = document.getElementById('chat-container');
    if(c) c.scrollTop = c.scrollHeight;
}

// --- 7. AI & MQTT ---
async function talkToClone(prompt) {
    try {
        addAIMessage('Processing...', false);
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{role: "system", content: "You are a helpful Cyberpunk AI."}, {role: "user", content: prompt}]
            })
        });
        const json = await req.json();
        addAIMessage(json.choices[0].message.content, false);
    } catch (err) {
        addAIMessage("AI Connection Failed", true);
    }
}

function connectMQTT() {
    if (typeof mqtt === 'undefined') return;
    const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId });

    mqttClient.on('connect', () => {
        mqttClient.subscribe('termchat/messages');
    });

    mqttClient.on('message', (topic, msg) => {
        const data = JSON.parse(msg.toString());
        if (data.user !== username) addRemoteMessage(data.user, data.text);
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify({ user: username, text: text, room: currentRoom }));
    }
}

function addRemoteMessage(user, text) {
    const container = document.getElementById('chat-container');
    const html = `
        <div class="flex flex-row items-end gap-3 animate-fade-in opacity-80">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${user.substring(0,2).toUpperCase()}</div>
            <div class="p-4 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5">
                <div class="flex items-center gap-2 mb-1 opacity-70 text-xs font-mono text-gray-400">
                    <span>@${user.toUpperCase()}</span>
                </div>
                <p class="leading-relaxed">${escapeHtml(text)}</p>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (e) => { chatInput.value = e.results[0][0].transcript; };
    recognition.start();
}

function addXP(amount) {
    userStats.xp += amount;
    if(userStats.xp > (userStats.level * 1000)) {
        userStats.level++;
        userStats.title = LEVELS[userStats.level] || 'GOD MODE';
        addSystemMessage(`LEVEL UP! You are now ${userStats.title}`);
    }
    updateStatsUI();
    localStorage.setItem('termos_stats', JSON.stringify(userStats));
}

function loadStats() {
    const saved = localStorage.getItem('termos_stats');
    if(saved) userStats = JSON.parse(saved);
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- 8. MATRIX ANIMATION ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const letters = 'ABCDEF0123456789';
    const fontSize = 14, columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 33);
    window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
}
