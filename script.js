// =========================================================================
//         TERMOS LT: LOGIC CORE
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
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    initMatrix();
    runTerminalBoot();
    setupInputListener();
});

// --- 4. TERMINAL BOOT LOGIC ---
function runTerminalBoot() {
    const term = document.getElementById('terminal-content');
    const statusEl = document.getElementById('boot-status');
    
    if (!term) return console.error("Error: #terminal-content not found");
    
    let lines = [];
    const sourceContent = document.getElementById('hidden-boot-content');
    
    // Load lines from hidden HTML or use fallback
    if (sourceContent && sourceContent.innerHTML.trim() !== "") {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
        lines = Array.from(term.children).map(div => div.innerText.trim());
        term.innerHTML = ""; 
    } else {
        lines = ["Initializing BIOS...", "Loading Kernel...", "System Ready."];
    }

    let index = 0;
    if(statusEl) statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";
    
    function typeNextLine() {
        if (index < lines.length) {
            const line = lines[index];
            const div = document.createElement('div');
            div.className = "opacity-80 animate-fade-in mb-1 font-mono text-sm";
            
            // Simple color coding
            if(line.includes(">>> [OK]")) div.innerHTML = line.replace("[OK]", '<span class="text-green-400 font-bold">[OK]</span>');
            else if(line.includes(">>> [1]")) div.innerHTML = line.replace("[1]", '<span class="text-blue-400">[1]</span>');
            else div.innerText = line;

            term.appendChild(div);
            term.scrollTop = term.scrollHeight;
            index++;
            setTimeout(typeNextLine, 30);
        } else {
            if(statusEl) {
                statusEl.innerText = "SCAN COMPLETE. SELECT MODE.";
                statusEl.className = "text-green-500 font-bold animate-pulse";
            }
        }
    }
    typeNextLine();
}

// --- 5. NAVIGATION ---
function skipPresentation() {
    const boot = document.getElementById('terminal-boot');
    const main = document.getElementById('main-layout');
    
    if(boot && main) {
        boot.style.display = 'none';
        main.classList.remove('hidden');
        main.classList.add('flex'); 
        
        if(!username || username === 'Guest') {
             username = "Operator_" + Math.floor(Math.random() * 9999);
             const userDisplay = document.getElementById('user-display');
             if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
        }
        
        loadStats();
        updateStatsUI();
        connectMQTT();
        addSystemMessage("System Initialized.");
    }
}

async function enterApp(mode) {
    if (mode === 'chat') {
        USE_LOCAL_AI = false;
        startMainApp("Chat & Music Mode Initialized.");
        return;
    }

    if (mode === 'api') {
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
            alert(">>> ERROR: KEY INVALID.");
        }
        return;
    }

    if (mode === 'local') {
        USE_LOCAL_AI = true;
        GROQ_API_KEY = "";
        startMainApp("Local AI Mode (Simulated).");
        return;
    }
}

function startMainApp(message) {
    const boot = document.getElementById('terminal-boot');
    const main = document.getElementById('main-layout');
    
    if(boot) boot.style.display = 'none';
    if(main) {
        main.classList.remove('hidden');
        main.classList.add('flex');
    }
    
    if (!username || username === 'Guest') username = "Operator_" + Math.floor(Math.random() * 9999);
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
    
    loadStats();
    updateStatsUI();
    connectMQTT();
    addSystemMessage(message);
}

// --- 6. AI LOGIC ---
async function talkToClone(prompt) {
    if (USE_LOCAL_AI) {
        const responses = ["Local hardware active.", "Offline mode enabled.", "Processing on device."];
        addAIMessage("Processing locally...", false);
        setTimeout(() => addAIMessage(responses[Math.floor(Math.random()*responses.length)], false), 800);
        return;
    }

    if (!GROQ_API_KEY) {
        addAIMessage("❌ CONFIG ERROR: API Key missing. Select Mode 2.", true);
        return;
    }

    try {
        addAIMessage("Connecting to Neural Net...", false);
        
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama3-70b-8192", 
                temperature: 0.7,
                max_tokens: 100,
                messages: [
                    { role: "system", content: "You are a cyberpunk AI. Answer briefly." }, 
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!req.ok) {
            const errData = await req.json().catch(() => ({}));
            throw new Error(errData.error?.message || `Status ${req.status}`);
        }
        
        const json = await req.json();
        addAIMessage(json.choices[0].message.content, false);
        
    } catch (err) {
        addAIMessage(`❌ ERROR: ${err.message}`, true);
    }
}

// --- 7. UI UPDATES ---
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
    const roomTitle = document.getElementById('room-title');
    if(roomTitle) roomTitle.innerText = roomId.toUpperCase().replace('_', ' ');
    addSystemMessage(`Switched to sector [${roomId.toUpperCase()}]`);
}

// --- 8. INPUT HANDLING ---
function setupInputListener() {
    const chatInput = document.getElementById('chatInput');
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
}

function handleSend() {
    const chatInput = document.getElementById('chatInput');
    if(!chatInput) return;
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
    
    const audio = document.getElementById('bg-music'); // Note: audio tag not in HTML by default, can be added
    const lower = txt.toLowerCase();
    
    if (lower.includes('play music')) { 
        addUserMessage(txt); 
        addAIMessage("🎵 Playing...", true); 
        return; 
    }
    if (lower.includes('stop music')) { 
        addUserMessage(txt); 
        addAIMessage("⏹ Stopped.", true); 
        return; 
    }
    if (lower.includes('open panel')) { 
        addUserMessage(txt); 
        addAIMessage("Accessing Workshop...", true); 
        setTimeout(()=>switchRoom('workshop'), 1000); 
        return; 
    }
    
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 9. CHAT RENDERING ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%] bg-gray-900/50 border border-green-900/30"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10';
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[10px]">AI</div><div class="flex-1"><div class="p-4 rounded-r-xl rounded-bl-xl bg-black/40 ${cssClass} text-sm text-gray-200 backdrop-blur-sm"><p class="leading-relaxed">${text}</p></div></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const html = `<div class="p-2 rounded text-xs text-center text-cyan-500 border border-cyan-900/30 bg-black/40 my-1 font-mono tracking-widest">[ SYSTEM: ${text} ]</div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function scrollToBottom() {
    const c = document.getElementById('chat-container');
    if(c) c.scrollTop = c.scrollHeight;
}

// --- 10. MQTT CHAT ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        console.warn("MQTT Library missing.");
        return;
    }
    try {
        const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
        mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId, keepalive: 60 });

        mqttClient.on('connect', () => {
            mqttClient.subscribe('termchat/messages');
            addSystemMessage("Uplink Established.");
        });

        mqttClient.on('message', (topic, msg) => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.user !== username) {
                    const container = document.getElementById('chat-container');
                    if(!container) return;
                    const html = `<div class="flex flex-row items-end gap-3 animate-fade-in opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div><div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5"><div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${data.user.toUpperCase()}</div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div></div>`;
                    container.insertAdjacentHTML('beforeend', html);
                    scrollToBottom();
                }
            } catch (e) {}
        });
    } catch (e) { console.error(e); }
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify({ user: username, text: text, room: currentRoom }));
    }
}

// --- 11. UTILS ---
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice module not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.onresult = (e) => { 
        const input = document.getElementById('chatInput');
        if(input) input.value = e.results[0][0].transcript; 
    };
    recognition.start();
}

function addXP(amount) {
    userStats.xp += amount;
    if(userStats.xp > (userStats.level * 1000)) {
        userStats.level++;
        userStats.title = LEVELS[userStats.level] || 'GOD MODE';
        addSystemMessage(`LEVEL UP! RANK: ${userStats.title}`);
    }
    updateStatsUI();
    localStorage.setItem('termos_stats', JSON.stringify(userStats));
}

function loadStats() {
    const saved = localStorage.getItem('termos_stats');
    if(saved) try { userStats = JSON.parse(saved); } catch(e){}
}

function escapeHtml(text) {
    if(!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
        ctx.fillStyle = (GROQ_API_KEY || USE_LOCAL_AI) ? '#0F0' : '#F00';
        ctx.font = fontSize + 'px monospace';
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            if((GROQ_API_KEY || USE_LOCAL_AI) && Math.random() > 0.98) ctx.fillStyle = '#00f3ff';
            else ctx.fillStyle = (GROQ_API_KEY || USE_LOCAL_AI) ? '#0F0' : '#F00';
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 33);
    window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
}
