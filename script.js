// =========================================================================
//         TERMOS LT: SYSTEM ARCHITECT EDITION (VIRTUAL DESKTOP)
//         Features: Agentic AI, Virtual Desktop, Remote Shell
//         Fix: Added Robust Error Handling, Debug Logs, Force-Boot Fallback
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; 
let USE_LOCAL_AI = false;
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// --- 2. STATE ---
let username = 'Guest';
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };
const LEVELS = ['Newbie', 'Apprentice', 'Create Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    console.log(">>> SYSTEM INITIALIZING...");
    
    // 1. FORCE MATRIX START (Safe Boot)
    try {
        initMatrix(); 
    } catch (e) {
        console.error("CRITICAL INIT ERROR:", e);
        alert("System Crash: Failed to load Matrix. Please refresh.");
    }

    // 2. SAFE TERMINAL START
    // We use a timeout to ensure DOM is ready before looking for elements.
    setTimeout(() => {
        const term = document.getElementById('terminal-content');
        const boot = document.getElementById('terminal-boot');
        
        // CRITICAL CHECK
        if (!term || !boot || !statusEl) {
            console.error("!!! CRITICAL: Terminal HTML elements missing.");
            // FORCE APP TO LOAD ANYWAY IF TERMINAL IS BROKEN
            forceBootMainApp(); 
            return;
        } 
    }

    // MOVE CONTENT SAFELY
    if (sourceContent) {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
    }

    // BOOT TEXT
    const presentationText = [
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
        ">>> [2] AI Mode (Groq API Key)",
        ">>> [3] Local AI Mode (WebGPU - No Key Needed)",
        "",
        ">>> ADMIN COMMANDS (Requires Root Access):",
        ">>>   /ai enable root   -> Activate System Architect Mode",
        ">>>   /ai create repo   -> Create Repository",
        ">>>   /ai hands off     -> Disengage AI from System",
        "",
        ">>> USER COMMANDS:",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        ">>> USER COMMANDS:",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        "Type '1', '2', or '3' to initialize..."
    ];

    function typeLine(container, text) {
        return new Promise(resolve => {
            const div = document.createElement('div');
            
            div.className = "opacity-80 animate-fade-in"; 
            
            if(line.includes(">>> [OK]")) {
                 div.innerHTML = line.replace("[OK]", '<span class="text-green-400">[OK]</span>');
            } else if(line.includes(">>> [1]")) {
                 div.innerHTML = line.replace("[1]", '<span class="text-blue-400">[1]</span>');
            } else if(line.includes(">>> [2]")) {
                 div.innerHTML = line.replace("[2]", '<span class="text-cyan-400">[2]</span>');
            } else if(line.includes(">>> [3]")) {
                 div.innerHTML = line.replace("[3]", '<span class="text-purple-400">[3]</span>');
            } else {
                 div.innerText = line;
            }

            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            setTimeout(resolve, 20); 
        });
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function typeNextLine(lines, index) {
        if (index < lines.length) {
            const line = lines[index];
            
            const div = document.createElement('div');
            div.className = "opacity-80 animate-fade-in"; 
            
            // Colorize keywords
            if(line.includes(">>> [OK]")) {
                 div.innerHTML = line.replace("[OK]", '<span class="text-green-400">[OK]</span>');
            } else if(line.includes(">>> [1]")) {
                 div.innerHTML = line.replace("[1]", '<span class="text-blue-400">[1]</span>');
            } else if(line.includes(">>> [2]")) {
                 div.innerHTML = line.replace("[2]", '<span class="text-cyan-400">[2]</span>');
            } else if(line.includes(">>> [3]")) {
                 div.innerHTML = line.replace("[3]", '<span class="text-purple-400">[3]</span>');
            } else {
                 div.innerText = line;
            }

            term.appendChild(div);
            term.scrollTop = term.scrollHeight; // Auto scroll
            await sleep(20); 
        } else {
            statusEl.innerText = "SCAN COMPLETE. SELECT MODE.";
            statusEl.className = "text-green-500 font-bold animate-pulse";
        }
    }

    for (let i = 0; i < presentationText.length; i++) {
        await typeLine(term, presentationText[i]);
    }

// --- 5. BOOT HANDLERS ---
async function enterApp(mode) {
    
    // MODE 4: ADMIN MODE
    if (mode === 'admin') {
        adminMode = true;
        userRole = 'ADMIN';
        
        // Force Matrix Update (Red)
        if(window.matrixColorInterval) {
            clearInterval(window.matrixColorInterval);
        }
        initMatrix('#ff0000'); // Pass red color
        startMainApp("SYSTEM ARCHITECT MODE: ROOT ACCESS GRANTED.");
        return;
    }

    // MODE 1: CHAT ONLY
    if (mode === 'chat') {
        adminMode = false;
        userRole = 'USER';
        USE_LOCAL_AI = false;
        startMainApp("Chat & Music Mode Initialized.");
        return;
    }

    // MODE 2: API KEY
    if (mode === 'api') {
        adminMode = false;
        userRole = 'USER';
        const existingKey = localStorage.getItem('termos_groq_key');
        if (existingKey) {
            GROQ_API_KEY = existingKey;
            USE_LOCAL_AI = false;
            startMainApp("Remote AI Mode Activated.");
            return;
        }

        const key = prompt(">>> ENTER GROQ API KEY:");
        if (key && key.length > 10) {
            GROQ_API_KEY = key;
            localStorage.setItem('termos_groq_key', key);
            USE_LOCAL_AI = false;
            startMainApp("Remote AI Mode Activated.");
        } else {
            alert(">>> ERROR: KEY INVALID OR CANCELLED.");
        }
        return;
    }

    // MODE 3: LOCAL AI
    if (mode === 'local') {
        adminMode = false;
        userRole = 'USER';
        USE_LOCAL_AI = true;
        GROQ_API_KEY = "";
        startMainApp("Local AI Mode (Simulated).");
        return;
    }
}

// --- 6. START MAIN APP ---
function startMainApp(message) {
    console.log(">>> STARTING MAIN APP...");
    
    // Hide Boot Screen
    const boot = document.getElementById('terminal-boot');
    boot.style.display = 'none';
    
    // Show Main Layout
    const main = document.getElementById('main-layout');
    
    // Ensure User
    if (!username || username === 'Guest') {
        username = "Operator_" + Math.floor(Math.random() * 9999);
    }
    document.getElementById('user-display').innerText = `@${username.toUpperCase()}`;
    
    // Init Systems
    loadStats();
    updateStatsUI();
    connectMQTT();
    
    const modeMsg = USE_LOCAL_AI 
        ? "System Started: LOCAL AI Mode." 
        : (GROQ_API_KEY ? "System Started: REMOTE AI Mode." : "System Started: Chat Mode.";

    addSystemMessage(modeMsg);
}

// --- 7. AI LOGIC (SYSTEM ARCHITECT) ---
async function talkToClone(prompt) {
    // SECURITY: Hierarchy Check
    if (adminMode && userRole === 'ADMIN') {
        // Admin Mode Persona
        addAIMessage("Processing Root Command...", false);
        setTimeout(() => {
            addAIMessage("[SYSTEM ARCHITECT]: Command processed.", false);
        }, 1000);
        return;
    }

    // SECURITY: Hands Off Check
    if (handsOff) {
        addAIMessage("❌ ERROR: AI Hands are disengaged. Permission denied.", true);
        return;
    }

    // LOCAL AI
    if (USE_LOCAL_AI) {
        // SIMULATED LOCAL AI
        const responses = [
            "Running on local hardware. How can I assist with Multiverse?",
            "System resources: 100% available.",
            "No external connection detected. Operating in offline mode.",
            "I am => Local Interface. Accessing offline modules...",
            "Local neural cluster connected. No cloud latency.",
            "Processing request on device."
        ];
        const reply = responses[Math.floor(Math.random() * responses.length)];
        
        addAIMessage("Processing locally...", false);
        setTimeout(() => {
            addAIMessage(reply, false);
        }, 800);
        return;
    }

    // REMOTE AI
    if (!GROQ_API_KEY) {
        addAIMessage("❌ CONFIG ERROR: API Key missing. Click 'LOGOUT' and select Mode 2.", true);
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
                model: "llama-3.1-8b-versatile", 
                temperature: 0.1,
                max_tokens: 50,
                messages: [
                    { role: "system", content: "You are a helpful AI assistant. Answer briefly." }, 
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!req.ok) {
            throw new Error(`API Error: ${req.status}`);
        const json = await req.json();
        const reply = json.choices[0].message.content;
        addAIMessage(reply, false);
        
    } catch (err) {
        console.error(err);
        addAIMessage(`❌ CONNECTION FAILED: ${err.message}`, true);
    }
}

// --- 8. UI & UTILITIES ---
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
    // AI CHAT
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }

    // AGENTIC COMMANDS (Normal Mode)
    const audio = document.getElementById('bg-music');
    const lower = txt.toLowerCase();

    // ADMIN ROOT COMMANDS
    const lower = txt.toLowerCase();
    if (adminMode) {
        if (lower.includes('create') || lower.includes('repo') || lower.includes('deploy')) {
            addUserMessage(txt);
            executeAdminCommand(txt);
            return;
        }

    // STANDARD CHAT
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 9. RENDERING ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="msg-user p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0, 0, 0, 0.3)] max-w-[80%]"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0, 0.2)]' : 'border border-white/10';
    
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[10px]">AI</div><div class="flex-1">
            <div class="p-4 rounded-r-xl rounded-bl-xl bg-black/40 ${cssClass} text-sm text-gray-200 backdrop-blur-sm"><p class="leading-relaxed">${text}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-container');
    const html = `<div class="msg-system p-4 rounded-xl text-sm text-cyan-100 shadow-[0_4px_20px_rgba(0, 0, 0.3)] animate-fade-in"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-cyan-400"><span>⚠ SYSTEM</span></div><p class="leading-relaxed">${text}</p></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function scrollToBottom() {
    const c = document.getElementById('chat-container');
    if(c) c.scrollTop = c.scrollHeight;
}

function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        console.warn("MQTT Library not loaded");
        return;
    }
    const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId: clientId, keepalive: 60 });

    mqttClient.on('connect', () => mqttClient.subscribe('termchat/messages'));
    mqttClient.on('message', (topic, msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.user !== username) {
                const html = `<div class="flex flex-row items-end gap-3 animate-fade-in opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border-white/20 font-mono text-white text-xs">${data.user.substring(0, 2).toUpperCase()}</div><div class="p-4 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border-white/5"><div class="flex items-center gap-2 mb-1 opacity-70 text-xs font-mono text-gray-400"><span>@${data.user.toUpperCase()}</span></div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div>`;
                document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
                scrollToBottom();
            }
        } catch (e) {
            console.error(e);
    });
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify({ user: username, text: text, room: currentRoom }));
    }
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice module not supported by browser");
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (e) => { 
        chatInput.value = e.results[0][0].transcript; 
        addSystemMessage("Voice input received."); 
    };
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

// --- 10. MATRIX ANIMATION (COLOR SUPPORT) ---
function initMatrix(overrideColor = '#0F0') {
    const c = document.getElementById('matrix-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; 
    c.height = window.innerHeight;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, 0, 0, 0.3) c.width = c.height;
        
        // READ CSS VARIABLE FOR COLOR
        const neonColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-green').trim();
        
        ctx.fillStyle = neonColor === '#ff0000' ? '#ff0000' : '#0F0'; // Red if Admin, else Green
        
        ctx.font = fontSize + 'px monospace';
        
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            if(GROQ_API_KEY || USE_LOCAL_AI && Math.random() > 0.98) ctx.fillStyle = '#00f3ff';
            else ctx.fillStyle = '#0F0';
            }
            
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);

            if(drops[i]*fontSize > c.height && Math.random() > 0.975) {
                drops[i] = 0;
            drops[i]++;
        }
    }
    
    // Store interval so we can clear it later
    window.matrixColorInterval = setInterval(draw, 33);
    window.addEventListener('resize', () => { 
        c.width = window.innerWidth; 
        c.height = window.innerHeight; 
    });
}
