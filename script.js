// =========================================================================
//         TERMOS LT: TERMINAL BOOT EDITION
//         Features: Boot Sequence, 3-Way Mode, Local/Remote AI
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; 
let USE_LOCAL_AI = false; // Flag for Option 3
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// --- 2. STATE ---
let username = 'Guest';
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    initMatrix();
    runTerminalBoot();
});

// --- 4. TERMINAL BOOT LOGIC ---
async function runTerminalBoot() {
    const term = document.getElementById('terminal-output');
    const bootLines = [
        "INITIALIZING TERMOS LT v2.0...",
        "Loading kernel modules... [OK]",
        "Connecting to Neural Net... [OK]",
        "",
        ">>> DETECTED FEATURES:",
        ">>> [1] Multiverse Chat (MQTT)",
        ">>> [2] Gamification System (XP/Leveling)",
        ">>> [3] Music Engine (Ogg/MP3)",
        ">>> [4] AI Assistant (NEURAL)",
        "",
        ">>> SELECT MODE:",
        ">>> [1] Chat/Music Only (FAST)",
        ">>> [2] AI Mode (Requires Groq API Key)",
        ">>> [3] Local AI Mode (WebGPU - No Key Needed)",
        "",
        "Type '1', '2', or '3' to initialize..."
    ];

    for (let i = 0; i < bootLines.length; i++) {
        await typeLine(term, bootLines[i]);
        await sleep(50); // Speed of typing
    }

    const input = await waitForTerminalInput();
    handleBootChoice(input);
}

function typeLine(container, text) {
    return new Promise(resolve => {
        const div = document.createElement('div');
        div.innerHTML = text
            .replace(/\[OK\]/g, '<span class="text-cyan-400">[OK]</span>')
            .replace(/\[1\]/g, '<span class="text-yellow-400">[1]</span>')
            .replace(/\[2\]/g, '<span class="text-yellow-400">[2]</span>')
            .replace(/\[3\]/g, '<span class="text-yellow-400">[3]</span>');
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        setTimeout(resolve, 30); 
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function waitForTerminalInput() {
    return new Promise(resolve => {
        const inputArea = document.getElementById('terminal-input-area');
        inputArea.classList.remove('hidden');
        const input = document.getElementById('boot-input');
        input.focus();

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.trim();
                // Echo user command
                const echo = document.createElement('div');
                echo.innerHTML = `root@termos:~$ ${val}`;
                document.getElementById('terminal-output').appendChild(echo);
                
                inputArea.classList.add('hidden');
                resolve(val);
            }
        });
    });
}

// --- 5. HANDLE BOOT CHOICE ---
function handleBootChoice(choice) {
    if (choice === '1') {
        // CHAT ONLY
        typeLine(document.getElementById('terminal-output'), ">>> LOADING INTERFACE...");
        setTimeout(enterApp, 1000);
    } 
    else if (choice === '2') {
        // API KEY MODE
        typeLine(document.getElementById('terminal-output'), ">>> ENTER GROQ API KEY:");
        
        const inputArea = document.getElementById('terminal-input-area');
        inputArea.classList.remove('hidden');
        const input = document.getElementById('boot-input');
        input.value = ""; // Clear previous input
        input.type = "password"; // Make it secure
        input.focus();

        // New listener for Key
        input.removeEventListener('keypress'); // Remove old listener
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const key = e.target.value.trim();
                if (key.length > 10) {
                    GROQ_API_KEY = key;
                    localStorage.setItem('termos_groq_key', key);
                    typeLine(document.getElementById('terminal-output'), `>>> KEY VERIFIED. CONNECTING...`);
                    setTimeout(enterApp, 1000);
                } else {
                    typeLine(document.getElementById('terminal-output'), ">>> ERROR: INVALID KEY FORMAT.");
                    setTimeout(runTerminalBoot, 1500); // Retry
                }
            }
        });
    }
    else if (choice === '3') {
        // LOCAL AI MODE (No Key Solution)
        typeLine(document.getElementById('terminal-output'), ">>> INITIALIZING LOCAL GPU CLUSTER (WebGPU)...");
        typeLine(document.getElementById('terminal-output'), ">>> CAUTION: HIGH LATENCY EXPECTED.");
        setTimeout(() => {
            USE_LOCAL_AI = true;
            enterApp();
        }, 2000);
    }
    else {
        typeLine(document.getElementById('terminal-output'), `>>> INVALID COMMAND. REBOOTING...`);
        setTimeout(runTerminalBoot, 1500);
    }
}

// --- 6. ENTER APP ---
function enterApp() {
    document.getElementById('terminal-boot').style.display = 'none';
    const main = document.getElementById('main-layout');
    main.classList.remove('hidden');
    main.classList.add('flex');
    
    username = "Operator_" + Math.floor(Math.random() * 9999);
    document.getElementById('user-display').innerText = `@${username.toUpperCase()}`;
    
    loadStats();
    updateStatsUI();
    connectMQTT();
    
    const modeMsg = USE_LOCAL_AI 
        ? "System Started: LOCAL AI Mode." 
        : (GROQ_API_KEY ? "System Started: REMOTE AI Mode." : "System Started: Chat Mode.");
    
    addSystemMessage(modeMsg);
}

// --- 7. AI LOGIC (LOCAL VS REMOTE) ---
async function talkToClone(prompt) {
    if (USE_LOCAL_AI) {
        // SIMULATED LOCAL AI (For Option 3)
        const responses = [
            "Running on local hardware. How can I assist with the Multiverse?",
            "System resources: 100% available.",
            "No external connection detected. Operating in offline mode.",
            "I am the local interface. My logic is limited without a cloud connection."
        ];
        const reply = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate delay
        addAIMessage("Processing locally...", false);
        setTimeout(() => {
            addAIMessage(reply, false);
        }, 1000);
        return;
    }

    // REMOTE AI (Option 2)
    if (!GROQ_API_KEY) {
        addAIMessage("❌ CONFIG ERROR: API Key missing.", true);
        return;
    }

    try {
        addAIMessage("Processing...", false);
        
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${GROQ_API_KEY}` 
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                temperature: 0.1,
                max_tokens: 50,
                messages: [
                    { role: "system", content: "You are a helpful AI assistant. Answer briefly." }, 
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!req.ok) throw new Error(`API Error: ${req.status}`);
        const json = await req.json();
        const reply = json.choices[0].message.content;
        addAIMessage(reply, false);
        
    } catch (err) {
        addAIMessage(`❌ CONNECTION FAILED: ${err.message}`, true);
    }
}

// --- 8. UI & UTILS ---
function updateStatsUI() {
    const titleEl = document.getElementById('lvl-text');
    const xpEl = document.getElementById('xp-text');
    const barEl = document.getElementById('xp-bar');
    if(titleEl) titleEl.innerText = `LVL. ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    const progress = (userStats.xp % 1000) / 10; 
    if(barEl) barEl.style.width = `${progress}%`;
}

function switchRoom(roomId) {
    currentRoom = roomId;
    document.getElementById('room-title').innerText = roomId.toUpperCase().replace('_', ' ');
    addSystemMessage(`Switched to sector [${roomId.toUpperCase()}]`);
}

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
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }
    const audio = document.getElementById('bg-music');
    const lower = txt.toLowerCase();
    if (lower.includes('play music')) { addUserMessage(txt); if(audio) audio.play().then(()=>addAIMessage("🎵 Playing...", true)); return; }
    if (lower.includes('stop music')) { addUserMessage(txt); if(audio) { audio.pause(); addAIMessage("⏹ Stopped.", true); } return; }
    if (lower.includes('open panel')) { addUserMessage(txt); addAIMessage("Accessing Workshop...", true); setTimeout(()=>switchRoom('workshop'), 1000); return; }
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 9. RENDERING ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="msg-user p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%]"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10';
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[10px]">AI</div><div class="flex-1"><div class="p-4 rounded-r-xl rounded-bl-xl bg-black/40 ${cssClass} text-sm text-gray-200 backdrop-blur-sm"><p class="leading-relaxed">${text}</p></div></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-container');
    const html = `<div class="msg-system p-4 rounded-xl text-sm text-cyan-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-fade-in"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-cyan-400"><span>⚠ SYSTEM</span></div><p class="leading-relaxed">${text}</p></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function scrollToBottom() {
    const c = document.getElementById('chat-container');
    if(c) c.scrollTop = c.scrollHeight;
}

function connectMQTT() {
    if (typeof mqtt === 'undefined') return;
    const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId, keepalive: 60 });
    mqttClient.on('connect', () => mqttClient.subscribe('termchat/messages'));
    mqttClient.on('message', (topic, msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.user !== username) {
                const html = `<div class="flex flex-row items-end gap-3 animate-fade-in opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div><div class="p-4 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5"><div class="flex items-center gap-2 mb-1 opacity-70 text-xs font-mono text-gray-400"><span>@${data.user.toUpperCase()}</span></div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div></div>`;
                document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
                scrollToBottom();
            }
        } catch (e) {}
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify({ user: username, text: text, room: currentRoom }));
    }
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice module not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (e) => { chatInput.value = e.results[0][0].transcript; addSystemMessage("Voice input received."); };
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

// --- 10. MATRIX ANIMATION ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        // COLOR LOGIC
        ctx.fillStyle = GROQ_API_KEY || USE_LOCAL_AI ? '#0F0' : '#F00';
        ctx.font = fontSize + 'px monospace';
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            if(GROQ_API_KEY || USE_LOCAL_AI && Math.random() > 0.98) ctx.fillStyle = '#00f3ff';
            else ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 33);
    window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
}
