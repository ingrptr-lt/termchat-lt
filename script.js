// =========================================================================
//         TERMOS LT: MASTERPIECE EDITION (FINAL)
//         Features: Robust Boot, Matrix Rain, AI, Virtual Desktop
//         Fix: Handles missing IDs gracefully. No Install Required.
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; 
let USE_LOCAL_AI = false;
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
let adminMode = false; // God Mode State
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend', 'GOD MODE'];

// --- 2. STATE ---
let username = 'Anon_' + Math.floor(Math.random() * 1000);
let mqttClient = null;
let currentRoom = 'lobby';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    console.log(">> SYSTEM INITIALIZING MASTERPIECE OS...");
    
    // 1. START VISUALS (Matrix Rain)
    try {
        initMatrix();
    } catch (e) {
        console.error("Matrix Init Failed:", e);
        // FALLBACK: Set Dark Background if Canvas missing
        document.body.style.background = "#000";
    }

    // 2. FORCE TERMINAL START (With Safety)
    setTimeout(() => {
        const term = document.getElementById('terminal-content');
        const boot = document.getElementById('terminal-boot');
        const main = document.getElementById('main-layout');
        
        // SAFETY: If elements exist, proceed. If not, wait.
        if (term && boot && main) {
            try {
                runTerminalBoot();
            } catch (e) {
                console.error("Boot Sequence Failed:", e);
                // If terminal logic fails, force start app
                forceBootMainApp();
            }
        } else {
            console.error("!!! CRITICAL: BOOT ELEMENTS MISSING !!!");
            // FORCE START APP IF BOOT ELEMENTS ARE MISSING
            forceBootMainApp();
        }
    }, 500); // Small delay for stability
});

// --- 4. ROBUST MATRIX RAIN ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    if (!c) {
        console.warn("Matrix Canvas not found. Matrix rain disabled.");
        return;
    }
    
    const ctx = c.getContext('2d');
    if(!ctx) return; 

    // Setup
    function resize() {
        c.width = window.innerWidth; 
        c.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize(); // Initial call

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function drawMatrixRain() {
        if(!c || !ctx) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        
        // Color Logic: Admin (Red) vs Connected (Green/Cyan)
        let color = '#0F0';
        if (adminMode) {
            color = '#ff0000'; // Admin Red
        } else if (!GROQ_API_KEY) {
            color = '#F00'; // Disconnected Red
        } else {
            color = '#0F0'; // Connected Green
        }

        ctx.fillStyle = color;
        ctx.font = fontSize + 'px monospace';
        
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            
            if (!adminMode && (GROQ_API_KEY) && Math.random() > 0.98) {
                ctx.fillStyle = '#00f3ff';
            } else {
                ctx.fillStyle = color;
            }
            
            ctx.fillText(text, i*fontSize, drops[i]*fontSize);
            if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    
    setInterval(drawMatrixRain, 33); 
}

// --- 5. TERMINAL BOOT LOGIC ---
function runTerminalBoot() {
    const term = document.getElementById('terminal-content');
    const statusEl = document.getElementById('boot-status');
    
    // SAFETY: Check if elements exist
    if (!term || !statusEl) {
        throw new Error("Terminal DOM elements not found.");
    }

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
            "Loading Kernel Modules...",
            "Checking Neural Net...",
            ">>> [1] Multiverse Chat (MQTT)",
            ">>> [2] Gamification System (XP/Leveling)",
            ">>> [3] Music Engine (Ogg/MP3)",
            ">>> [4] AI Assistant (NEURAL)",
            "",
            ">>> SELECT MODE:",
            ">>> Type '1' for Chat/Music Only (FAST)",
            ">>> Type '2' for AI Mode (Groq API Key)",
            ">>> Type '3' for Local AI Mode (WebGPU)",
            "",
            ">>> ADMIN COMMANDS (Requires Root Access):",
            ">>>   /ai enable root   -> Activate Admin Mode",
            ">>>   /ai desktop       -> Open Virtual Desktop",
            ">>>   /ai lan scan      -> Scan Network",
            ">>>   /ai files        -> Open File Manager",
            "",
            "Type '1', '2', or '3' to initialize..."
        ];
    }

    let index = 0;
    if(statusEl) statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";
    
    function typeNextLine() {
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
                statusEl.innerText = "SCAN COMPLETE. SELECT MODE.";
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
    
    // Setup User
    if (!username || username === 'Guest') username = "Operator_" + Math.floor(Math.random() * 9999);
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
    
    // Init Systems
    loadStats();
    updateStatsUI();
    connectMQTT();
    addSystemMessage("System Initialized (Recovery Mode).");
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

// --- 7. AI LOGIC ---
async function talkToClone(prompt) {
    // ADMIN MODE CHECK
    if (adminMode) {
        addAIMessage("Processing Root Command...", false);
        setTimeout(() => {
            addAIMessage("[SYSTEM ARCHITECT]: Command processed.", false);
        }, 1000);
        return;
    }

    // LOCAL AI
    if (USE_LOCAL_AI) {
        addAIMessage("Processing locally...", false);
        setTimeout(() => {
            const responses = ["Running on local hardware.", "System resources: 100% available.", "No external connection detected.", "I am TermAI. Offline mode active."];
            const reply = responses[Math.floor(Math.random() * responses.length)];
            addAIMessage(reply, false);
        }, 800);
        return;
    }

    // REMOTE AI
    if (!GROQ_API_KEY) {
        addAIMessage("❌ ERROR: API Key missing. Select Mode 2.", true);
        return;
    }

    try {
        addAIMessage("Connecting...", false);
        
        const models = ["llama-3.1-70b-versatile", "llama-3.3-70b-versatile", "gemma2-9b-it", "mixtral-8x7b-32768"];
        let lastError = null;
        let success = false;

        for (const model of models) {
            try {
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${GROQ_API_KEY}` 
                    },
                    body: JSON.stringify({
                        model: model, 
                        temperature: 0.7,
                        max_tokens: 300,
                        messages: [
                            { 
                                role: "system", 
                                content: "You are TermAI, a helpful AI assistant in a Cyberpunk Multiverse. Keep answers short and tech-savvy." 
                            }, 
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!req.ok) throw new Error(`Status ${req.status}`);
                const json = await req.json();
                
                const typingEl = document.getElementById('typing-indicator');
                if(typingEl) typingEl.remove();
                
                const reply = json.choices[0].message.content;
                addAIMessage(reply, false);
                success = true;
                break; 

            } catch (e) {
                lastError = e;
                if (e.message.includes("401") || e.message.includes("Invalid")) break; 
                continue; 
            }
        }

        if (!success) {
            const typingEl = document.getElementById('typing-indicator');
            if(typingEl) typingEl.remove();
            addAIMessage(`❌ FAILED: ${lastError ? lastError.message : 'Unknown'}`, true);
        }
    } catch (err) {
        addAIMessage(`❌ CRITICAL: ${err.message}`, true);
    }
}

// --- 8. GOD MODE FEATURES ---

// VIRTUAL DESKTOP
function renderVirtualDesktop() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `
        <div class="grid grid-cols-4 gap-4 p-4 text-xs font-mono text-cyan-300">
            <div class="border border-green-500/30 bg-black/80 p-4 cursor-pointer hover:bg-green-900/20 transition-colors flex flex-col items-center">
                <div class="text-2xl">🖥</div>
                <div class="text-green-400 font-bold">TERMINAL</div>
            </div>
            <div class="border border-cyan-500/30 bg-black/80 p-4 cursor-pointer hover:bg-cyan-900/20 transition-colors flex flex-col items-center">
                <div class="text-2xl">📂</div>
                <div class="text-cyan-400 font-bold">FILES</div>
            </div>
            <div class="border border-purple-500/30 bg-black/80 p-4 cursor-pointer hover:bg-purple-900/20 transition-colors flex flex-col items-center">
                <div class="text-2xl">🌐</div>
                <div class="text-purple-400 font-bold">NETWORK</div>
            </div>
            <div class="border border-yellow-500/30 bg-black/80 p-4 cursor-pointer hover:bg-yellow-900/20 transition-colors flex flex-col items-center">
                <div class="text-2xl">🎵</div>
                <div class="text-yellow-400 font-bold">MEDIA</div>
            </div>
             <button onclick="closeVirtualDesktop()" class="col-span-4 border-t-2 border-green-800 bg-green-900/50 p-2 mt-4 text-xs hover:bg-green-800 uppercase tracking-widest text-green-500">CLOSE DESKTOP</button>
        </div>
    `);
}

function closeVirtualDesktop() {
    addSystemMessage("Virtual Desktop Closed.");
    runTerminalBoot(); // Revert boot screen
}

// LAN SCAN
function simulateLanScan() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `
        <div class="border-l-2 border-green-500/50 pl-4 py-2">
            <div class="text-green-500 font-bold mb-2">🌐 NETWORK DISCOVERY</div>
            <div id="lan-results" class="space-y-2 mt-4"></div>
        </div>
    `);

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

// --- 9. UI UPDATES ---
function updateStatsUI() {
    const titleEl = document.getElementById('lvl-text');
    const xpEl = document.getElementById('xp-text');
    const barEl = document.getElementById('xp-bar');
    
    if(titleEl) titleEl.innerText = `LVL ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    
    const progress = (userStats.xp % 1000) / 10; 
    if(barEl) barEl.style.width = `${progress}%`;
}

function loadStats() {
    const saved = localStorage.getItem('termos_stats');
    if(saved) try { userStats = JSON.parse(saved); } catch(e){}
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

// --- 10. CHAT RENDERING ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%] bg-gray-900/50 border border-green-900/30"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10 bg-black/60';
    
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold">AI</div><div class="flex-1"><div class="px-2 py-1 text-[10px] text-cyan-600 font-mono">TERM_AI_SYSTEM</div><div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm border-t-0"><p class="leading-relaxed">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    container.insertAdjacentHTML('beforeend', `<div class="p-2 rounded text-xs text-center text-cyan-500 border border-cyan-900/30 bg-black/40 my-1 font-mono">[ SYSTEM: ${text} ]</div>`);
    scrollToBottom();
}

function scrollToBottom() {
    const c = document.getElementById('chat-container');
    if(c) c.scrollTop = c.scrollHeight;
}

// --- 11. MQTT ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        console.warn("MQTT Library missing.");
        return;
    }
    
    const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
    mqttClient = mqtt.connect(MQTT_BROKER_URL, { clientId: clientId, keepalive: 60 });

    mqttClient.on('connect', () => {
        mqttClient.subscribe(`termchat/messages/${currentRoom}`);
        addSystemMessage("Uplink Established.");
    });

    mqttClient.on('message', (topic, msg) => {
        try {
            const expectedTopic = `termchat/messages/${currentRoom}`;
            if (topic !== expectedTopic) return;

            const data = JSON.parse(msg.toString());
            if (data.user !== username) {
                const container = document.getElementById('chat-container');
                if(container) {
                    container.insertAdjacentHTML('beforeend', `<div class="flex flex-row items-end gap-3 animate-fade-in-up opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div><div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5"><div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${data.user.toUpperCase()}</div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div></div>`);
                    scrollToBottom();
                }
            }
        } catch (e) {}
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(`termchat/messages/${currentRoom}`, JSON.stringify({ user: username, text: text }));
    }
}

// --- 12. INPUT & COMMANDS ---
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
    // ADMIN COMMANDS
    if (txt === '/ai enable root') {
        enterApp('admin');
        return;
    }

    // GOD MODE COMMANDS
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        if(!prompt) return;
        
        // Check for specific sub-commands
        if (prompt === 'desktop') {
            renderVirtualDesktop();
            return;
        }
        if (prompt === 'lan scan') {
            simulateLanScan();
            return;
        }
        if (prompt === 'files') {
            renderFileManager();
            return;
        }
        
        // Standard AI Prompt
        addUserMessage(prompt);
        talkToClone(prompt);
        return;
    }

    // USER COMMANDS
    if (txt.startsWith('/join')) {
        const room = txt.replace('/join', '').trim();
        if(room) switchRoom(room);
        return;
    }

    if (txt.startsWith('/help')) {
        addSystemMessage("CMD: /ai [prompt], /ai enable root, /join [room], /clear");
        return;
    }
    
    if (txt.startsWith('/clear')) {
        const container = document.getElementById('chat-container');
        if(container) container.innerHTML = '';
        return;
    }

    // STANDARD CHAT
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 13. UTILS ---
function downloadCodeFile(filename, content) {
    const element = document.createElement('a');
    let mimeType = 'text/plain';
    if(filename.endsWith('.js')) mimeType = 'text/javascript';
    if(filename.endsWith('.html')) mimeType = 'text/html';
    
    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    addSystemMessage(`File saved: ${filename}`);
}

function injectAndRun(code) {
    try {
        const script = document.createElement('script');
        script.textContent = code;
        document.body.appendChild(script);
    } catch(e) {
        const style = document.createElement('style');
        style.textContent = code;
        document.head.appendChild(style);
    }
}

function switchRoom(roomName) {
    if(!roomName) return;
    
    if (mqttClient && mqttClient.connected) {
        mqttClient.unsubscribe(`termchat/messages/${currentRoom}`);
    }
    
    currentRoom = roomName;
    const roomTitle = document.getElementById('room-title');
    if(roomTitle) roomTitle.innerText = roomName.toUpperCase().replace('_', ' ');
    
    if (mqttClient && mqttClient.connected) {
        mqttClient.subscribe(`termchat/messages/${currentRoom}`);
    }
    
    addSystemMessage(`Joined Room: [${roomName.toUpperCase()}]`);
}

function escapeHtml(text) {
    if(!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
