// =========================================================================
//         TERMOS LT: MULTIUNIVERSE OS (FIXED STARTUP)
//         Fix: Added Bridge for "1" "2" "3" input + Safety Timeout
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; 
let USE_LOCAL_AI = false;
let adminMode = false;
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';

// --- 2. STATE ---
let username = 'Guest';
let mqttClient = null;
let currentRoom = 'lobby';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };
let handsOff = false; 
let userRole = 'GUEST'; 
let matrixInterval = null; 

const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend', 'GOD MODE'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    console.log(">> SYSTEM INITIALIZING...");
    
    try { initMatrix(); } catch (e) { console.error(e); }

    // Force Start after 5 seconds if user doesn't do anything (Safety Net)
    setTimeout(() => {
        const boot = document.getElementById('terminal-boot');
        if (boot && boot.style.display !== 'none') {
            console.log("!!! TIMEOUT: FORCING APP START !!!");
            forceBootMainApp();
        }
    }, 5000);

    // Start Boot Sequence
    setTimeout(() => {
        const term = document.getElementById('terminal-content');
        const boot = document.getElementById('terminal-boot');
        const main = document.getElementById('main-layout');
        
        if (term && boot && main) {
            runTerminalBoot();
        } else {
            console.error("!!! CRITICAL: DOM MISSING !!!");
            forceBootMainApp();
        }
    }, 100);
});

// --- 4. ROBUST MATRIX RAIN ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    if(!ctx) return; 
    function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    function drawMatrixRain() {
        if(!c || !ctx) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        let color = '#0F0';
        if (adminMode) color = '#ff0000';
        else if (!GROQ_API_KEY) color = '#F00';
        else color = '#0F0';
        ctx.fillStyle = color;
        ctx.font = fontSize + 'px monospace';
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            if (!adminMode && (GROQ_API_KEY) && Math.random() > 0.98) ctx.fillStyle = '#00f3ff';
            else ctx.fillStyle = color;
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    matrixInterval = setInterval(drawMatrixRain, 33); 
}

// --- 5. TERMINAL BOOT LOGIC ---
function runTerminalBoot() {
    const term = document.getElementById('terminal-content');
    const statusEl = document.getElementById('boot-status');
    let lines = [];
    const sourceContent = document.getElementById('hidden-boot-content');
    if (sourceContent && sourceContent.innerHTML.trim() !== "") {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
        lines = Array.from(term.children).map(div => div.innerText.trim());
        term.innerHTML = ""; 
    } else {
        lines = [
            "Initializing BIOS...",
            "Loading kernel modules...",
            "Checking Neural Net...",
            ">>> [1] Multiverse Chat (MQTT)",
            ">>> [2] Gamification System (XP/Leveling)",
            ">>> [3] Music Engine (Ogg/MP3)",
            "",
            ">>> SELECT MODE:",
            ">>> Type '1', '2', or '3' to initialize..."
        ];
    }
    let index = 0;
    if(statusEl) statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";
    async function typeNextLine() {
        if (index < lines.length) {
            const line = lines[index];
            const div = document.createElement('div');
            div.className = "opacity-80 animate-fade-in mb-1 font-mono text-sm";
            if(line.includes(">>> [OK]")) div.innerHTML = line.replace("[OK]", '<span class="text-green-400 font-bold">[OK]</span>');
            else if(line.includes(">>> [1]")) div.innerHTML = line.replace("[1]", '<span class="text-blue-400">[1]</span>');
            else if(line.includes(">>> [2]")) div.innerHTML = line.replace("[2]", '<span class="text-cyan-400">[2]</span>');
            else if(line.includes(">>> [3]")) div.innerHTML = line.replace("[3]", '<span class="text-purple-400">[3]</span>');
            else if(line.includes(">>>"))) div.innerHTML = line.replace(/>>>/g, '<span class="text-gray-500">>></span>');
            else div.innerText = line;
            term.appendChild(div);
            term.scrollTop = term.scrollHeight;
            index++;
            setTimeout(typeNextLine, 30);
        } else {
            if(statusEl) {
                statusEl.innerText = "SCAN COMPLETE. TYPE '1', '2', or '3'.";
                statusEl.className = "text-green-500 font-bold animate-pulse";
            }
        }
    }
    typeNextLine();
}

// --- 6. NAVIGATION ---
function forceBootMainApp() {
    console.log("!!! FORCE BOOT TRIGGERED !!!");
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
    addSystemMessage("SYSTEM: RECOVERY MODE INITIATED.");
}

async function enterApp(mode) {
    // Handle Admin Toggle
    if (mode === 'admin') {
        adminMode = !adminMode;
        userRole = adminMode ? 'ADMIN' : 'USER';
        initMatrix(); // Restart matrix to apply color change
        addSystemMessage(adminMode ? "ADMIN MODE: ON" : "ADMIN MODE: OFF");
        return;
    }

    // Map Input Strings to Logic
    let modeType = '';
    
    // Map '1', 'chat', 'g' to Chat Mode
    if (['1', 'chat', 'g'].includes(mode)) {
        USE_LOCAL_AI = false;
        startMainApp("Chat & Music Mode Initialized.");
        return;
    }

    // Map '2', 'api', 'a' to API Mode
    if (['2', 'api', 'a'].includes(mode)) {
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

    // Map '3', 'local', 'l' to Local Mode
    if (['3', 'local', 'l'].includes(mode)) {
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

// --- 7. AI LOGIC ---
async function talkToClone(prompt) {
    if (adminMode && userRole === 'ADMIN') {
        addAIMessage("Processing Root Command...", false);
        setTimeout(() => { addAIMessage("[SYSTEM ARCHITECT]: Done.", false); }, 1000);
        return;
    }
    if (handsOff) { addAIMessage("❌ ERROR: AI Hands are disengaged.", true); return; }
    if (USE_LOCAL_AI) {
        addAIMessage("Processing locally...", false);
        setTimeout(() => { addAIMessage("I am TermAI. Offline.", false); }, 800);
        return;
    }
    if (!GROQ_API_KEY) {
        addAIMessage("❌ ERROR: API Key missing. Select Mode 2.", true);
        return;
    }
    try {
        addAIMessage("...", false);
        const models = ["llama-3.1-70b-versatile", "llama-3.3-70b-versatile", "gemma2-9b-it", "mixtral-8x7b-32768"];
        let lastError = null;
        let success = false;
        for (const model of models) {
            try {
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: model, temperature: 0.7, max_tokens: 300,
                        messages: [{ role: "system", content: "You are TermAI. Short and cool." }, { role: "user", content: prompt }]
                    })
                });
                if (!req.ok) throw new Error(`Status ${req.status}`);
                const json = await req.json();
                addAIMessage(json.choices[0].message.content, false);
                success = true;
                break; 
            } catch (e) { lastError = e; if (e.message.includes("401")) break; continue; }
        }
        if (!success) addAIMessage(`❌ FAILED: ${lastError ? lastError.message : 'Unknown'}`, true);
    } catch (err) { addAIMessage(`❌ CRITICAL: ${err.message}`, true); }
}

// --- 8. GOD MODE FEATURES ---
function renderVirtualDesktop() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `
        <div class="grid grid-cols-4 gap-4 p-4">
            <div class="border border-green-500/30 bg-black/80 p-4 cursor-pointer hover:bg-green-900/20 flex flex-col items-center"><div class="text-2xl">🖥</div><div class="text-green-400 font-bold">TERMINAL</div></div>
            <div class="border border-cyan-500/30 bg-black/80 p-4 cursor-pointer hover:bg-cyan-900/20 flex flex-col items-center"><div class="text-2xl">📂</div><div class="text-cyan-400 font-bold">FILES</div></div>
            <div class="border border-purple-500/30 bg-black/80 p-4 cursor-pointer hover:bg-purple-900/20 flex flex-col items-center"><div class="text-2xl">🌐</div><div class="text-purple-400 font-bold">NETWORK</div></div>
            <div class="border border-yellow-500/30 bg-black/80 p-4 cursor-pointer hover:bg-yellow-900/20 flex flex-col items-center"><div class="text-2xl">🎵</div><div class="text-yellow-400 font-bold">MEDIA</div></div>
             <button onclick="closeVirtualDesktop()" class="col-span-4 border-t-2 border-green-800 bg-green-900/50 p-2 mt-4 text-xs hover:bg-green-800 uppercase tracking-widest text-green-500">CLOSE DESKTOP</button>
        </div>`);
}

function closeVirtualDesktop() {
    addSystemMessage("Virtual Desktop Closed.");
    runTerminalBoot();
}

function simulateLanScan() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `<div class="border-l-2 border-green-500/50 pl-4 py-2"><div class="text-green-500 font-bold mb-2">🌐 NETWORK DISCOVERY</div><div id="lan-results" class="space-y-2 mt-4"></div></div>`);
    setTimeout(() => {
        const resultsDiv = document.getElementById('lan-results');
        let count = 0;
        const interval = setInterval(() => {
            count++;
            const node = document.createElement('div');
            node.className = "text-xs text-cyan-400 font-mono";
            node.innerText = `> PING 192.168.1.${count}: Request timed out`;
            resultsDiv.appendChild(node);
            if(count > 3) {
                clearInterval(interval);
                const done = document.createElement('div');
                done.className = "text-green-400 font-bold mt-4";
                done.innerText = "SCAN COMPLETE. 1 NODE FOUND.";
                resultsDiv.appendChild(done);
            }
        }, 200);
    }, 1000);
}

function renderFileManager() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    const files = [{ name: "root_system.ko", size: "1024KB", type: "System" }, { name: "secret_keys.pem", size: "2KB", type: "Secure" }];
    let html = `<div class="text-green-500 font-bold mb-2">📁 FILE MANAGER</div><div class="text-xs text-gray-500 border-b border-green-900/20 pb-2">ROOT@ARCHITECT</div>`;
    files.forEach(f => { html += `<div class="flex items-center justify-between border border-green-800/20 p-2 hover:bg-green-900/10 cursor-pointer mb-1"><div class="text-xl font-mono text-cyan-300">[${f.type}]</div><div class="text-gray-400">${f.size}</div><div class="text-gray-300">${escapeHtml(f.name)}</div></div>`; });
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', html);
}

// --- 9. INPUT & COMMANDS (FIXED BOOT BRIDGE) ---
function setupInput() {
    const chatInput = document.getElementById('chatInput');
    if(chatInput) { chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); }); }); }
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
    const bootScreen = document.getElementById('terminal-boot');
    
    // >>> FIX: BOOT MODE BRIDGE <<<
    // If Boot Screen is visible, look for numbers 1, 2, 3
    if (bootScreen && bootScreen.style.display !== 'none') {
        if (txt === '1' || txt === 'chat') {
            enterApp('chat');
            return;
        }
        if (txt === '2' || txt === 'api') {
            enterApp('api');
            return;
        }
        if (txt === '3' || txt === 'local') {
            enterApp('local');
            return;
        }
    }

    // ADMIN / GOD MODE
    if (txt === '/ai enable root') { enterApp('admin'); return; }
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        if (prompt === 'desktop') { renderVirtualDesktop(); return; }
        if (prompt === 'lan scan') { simulateLanScan(); return; }
        if (prompt === 'files') { renderFileManager(); return; }
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }

    // STANDARD
    if (txt.startsWith('/join')) { switchRoom(txt.replace('/join', '').trim()); return; }
    if (txt.startsWith('/help')) { addSystemMessage("CMD: Type '1', '2', '3' or /ai, /admin."); return; }
    if (txt.startsWith('/clear')) { const c = document.getElementById('chat-container'); if(c) c.innerHTML = ''; return; }

    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 10. UI UPDATES ---
function updateRoomHeader() {
    const title = document.getElementById('room-title');
    const userDisplay = document.getElementById('user-display');
    if(title) title.innerText = currentRoom.toUpperCase().replace('_', ' ');
    if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()} [${userRole}]`;
}
function loadStats() { const s = localStorage.getItem('termos_stats'); if(s) try { userStats = JSON.parse(s); } catch(e){} }
function updateStatsUI() {
    const t = document.getElementById('lvl-text');
    const xp = document.getElementById('xp-text');
    const b = document.getElementById('xp-bar');
    if(t) t.innerText = `LVL ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xp) xp.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    if(b) b.style.width = `${(userStats.xp % 1000) / 10}%`;
}
function addXP(amount) {
    userStats.xp += amount;
    if(userStats.xp > (userStats.level * 1000)) {
        userStats.level++; userStats.title = LEVELS[userStats.level] || 'GOD MODE'; addSystemMessage(`LEVEL UP! RANK: ${userStats.title}`);
    }
    updateStatsUI();
    localStorage.setItem('termos_stats', JSON.stringify(userStats));
}

// --- 11. RENDERING ---
function addUserMessage(text) {
    const c = document.getElementById('chat-container');
    if(!c) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    c.insertAdjacentHTML('beforeend', `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%] bg-gray-900/50 border border-green-900/30"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`);
    c.scrollTop = c.scrollHeight;
}
function addAIMessage(text, isAction) {
    const c = document.getElementById('chat-container');
    if(!c) return;
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10 bg-black/60';
    c.insertAdjacentHTML('beforeend', `<div class="flex flex-row items-start gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold">AI</div><div class="flex-1"><div class="px-2 py-1 text-[10px] text-cyan-600 font-mono">TERM_AI_SYSTEM</div><div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm border-t-0"><p class="leading-relaxed">${escapeHtml(text)}</p></div></div>`);
    c.scrollTop = c.scrollHeight;
}
function addSystemMessage(text) {
    const c = document.getElementById('chat-container');
    if(!c) return;
    c.insertAdjacentHTML('beforeend', `<div class="p-2 rounded text-xs text-center text-cyan-500 border border-cyan-900/30 bg-black/40 my-1 font-mono">[ SYSTEM: ${text} ]</div>`);
    c.scrollTop = c.scrollHeight;
}
function scrollToBottom() { const c = document.getElementById('chat-container'); if(c) c.scrollTop = c.scrollHeight; }

// --- 12. MQTT ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') { console.warn("MQTT missing."); return; }
    const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId, keepalive: 60 });
    mqttClient.on('connect', () => { mqttClient.subscribe(`termchat/messages/${currentRoom}`); addSystemMessage("Uplink Established."); });
    mqttClient.on('message', (topic, msg) => {
        try {
            const expectedTopic = `termchat/messages/${currentRoom}`;
            if (topic !== expectedTopic) return;
            const data = JSON.parse(msg.toString());
            if (data.user !== username) {
                const c = document.getElementById('chat-container');
                if(c) {
                    c.insertAdjacentHTML('beforeend', `<div class="flex flex-row items-end gap-3 animate-fade-in-up opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div><div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5"><div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${data.user.toUpperCase()}</div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div></div>`);
                    c.scrollTop = c.scrollHeight;
                }
            }
        } catch (e) {}
    });
}
function publishMessage(text) { if (mqttClient && mqttClient.connected) { mqttClient.publish(`termchat/messages/${currentRoom}`, JSON.stringify({ user: username, text: text })); } }

// --- 13. UTILS ---
function switchRoom(roomName) {
    if(!roomName) return;
    if (mqttClient && mqttClient.connected) mqttClient.unsubscribe(`termchat/messages/${currentRoom}`);
    currentRoom = roomName;
    updateRoomHeader();
    if (mqttClient && mqttClient.connected) mqttClient.subscribe(`termchat/messages/${currentRoom}`);
    addSystemMessage(`Joined: [${roomName.toUpperCase()}]`);
}
function escapeHtml(text) { if(!text) return ""; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
