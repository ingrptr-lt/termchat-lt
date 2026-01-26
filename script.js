// =========================================================================
//         TERMOS LT: MASTERPIECE HYBRID EDITION
//         Merges: Robust Matrix + Auto-Pilot + Hybrid UI
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; 
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
let adminMode = false; // For Matrix Red Glitch

// --- 2. STATE ---
let username = 'Anon_' + Math.floor(Math.random() * 1000);
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    initMatrix(); // Start Visuals
    runTerminalBoot(); // Start Typing
    setupInputListener(); // Setup Text
    checkFirstTimeUser(); // Greeting
});

// --- 4. ROBUST MATRIX RAIN (RESTORED) ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    if (!c) return console.warn("Matrix Canvas not found.");
    const ctx = c.getContext('2d');
    if(!ctx) return; 

    // Resize Logic
    function resize() {
        c.width = window.innerWidth; 
        c.height = window.innerHeight;
    }
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
        
        // Color Logic: Admin (Red) vs Connected (Green/Cyan)
        let color = '#0F0';
        if (adminMode) {
            color = '#ff0000';
        } else if (!GROQ_API_KEY) {
            color = '#F00'; // Disconnected Red
        } else {
            // Green with Cyan Glitch
            color = '#0F0';
        }

        ctx.fillStyle = color;
        ctx.font = fontSize + 'px monospace';
        
        for(let i=0; i<drops.length; i++) {
            const text = letters[Math.floor(Math.random()*letters.length)];
            
            // Random cyan glitch if connected
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
    if (!term) return console.error("Error: #terminal-content not found");
    
    let lines = [];
    const sourceContent = document.getElementById('hidden-boot-content');
    if (sourceContent && sourceContent.innerHTML.trim() !== "") {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
        lines = Array.from(term.children).map(div => div.innerText.trim());
        term.innerHTML = ""; 
    } else {
        lines = ["Initializing BIOS...", "Loading Hybrid Modules...", "Checking Neural Net...", "System Ready."];
    }

    let index = 0;
    if(statusEl) statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";
    
    function typeNextLine() {
        if (index < lines.length) {
            const line = lines[index];
            const div = document.createElement('div');
            div.className = "opacity-80 animate-fade-in mb-1 font-mono text-sm";
            
            if(line.includes(">>> [OK]")) div.innerHTML = line.replace("[OK]", '<span class="text-green-400 font-bold">[OK]</span>');
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

function checkFirstTimeUser() {
    const visited = localStorage.getItem('termos_visited');
    if(!visited) {
        setTimeout(() => {
            addSystemMessage("Welcome, Operator. Ask me to 'CREATE' anything.");
        }, 2500);
        localStorage.setItem('termos_visited', 'true');
    }
}

// --- 6. NAVIGATION ---
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
    if (mode === 'chat') { USE_LOCAL_AI = false; startMainApp("Chat Mode."); return; }
    if (mode === 'api') {
        const existingKey = localStorage.getItem('termos_groq_key');
        if (existingKey) {
            GROQ_API_KEY = existingKey;
            USE_LOCAL_AI = false;
            startMainApp("Remote AI Mode.");
            return;
        }
        const key = prompt(">>> ENTER GROQ API KEY:");
        if (key && key.length > 10) {
            GROQ_API_KEY = key;
            localStorage.setItem('termos_groq_key', key);
            USE_LOCAL_AI = false;
            startMainApp("Remote AI Mode.");
        } else { alert(">>> ERROR: KEY INVALID."); }
        return;
    }
    if (mode === 'local') { USE_LOCAL_AI = true; GROQ_API_KEY = ""; startMainApp("Local AI Mode."); return; }
}

function startMainApp(message) {
    const boot = document.getElementById('terminal-boot');
    const main = document.getElementById('main-layout');
    if(boot) boot.style.display = 'none';
    if(main) { main.classList.remove('hidden'); main.classList.add('flex'); }
    if (!username || username === 'Guest') username = "Operator_" + Math.floor(Math.random() * 9999);
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
    loadStats();
    updateStatsUI();
    connectMQTT();
    addSystemMessage(message);
}

// --- 7. AI & CREATOR LOGIC (RESTORED) ---

// Helper: Strip Markdown
function cleanRawResponse(text) {
    return text.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
}

// THE EMERGENCY PARSER
function parseAndExecuteActions(text) {
    let cleanText = text;
    let hasAction = false;

    // 1. DOWNLOAD TAGS
    const downloadRegex = /<DOWNLOAD>([\s\S]*?)<\/DOWNLOAD>/g;
    let match;
    
    while ((match = downloadRegex.exec(text)) !== null) {
        hasAction = true;
        let content = match[1].trim();
        content = content.replace(/```.*?\n/g, '').replace(/```/g, '');
        
        let filename = "generated.txt";
        let code = content;

        const firstLineEnd = content.indexOf('\n');
        if (firstLineEnd !== -1) {
            filename = content.substring(0, firstLineEnd).trim().replace(/`/g, ''); 
            code = content.substring(firstLineEnd + 1);
        } else {
            const extMatch = content.match(/(\.\w+)/); 
            if (extMatch) {
                filename = "file" + extMatch[0];
                code = content; 
            }
        }
        
        downloadCodeFile(filename, code);
    }
    cleanText = cleanText.replace(downloadRegex, '[📁 FILE GENERATED]');

    // 2. INJECT TAGS
    const injectRegex = /<INJECT>([\s\S]*?)<\/INJECT>/g;
    while ((match = injectRegex.exec(text)) !== null) {
        hasAction = true;
        let code = match[1].trim();
        code = code.replace(/```.*?\n/g, '').replace(/```/g, '');
        injectAndRun(code);
    }
    cleanText = cleanText.replace(injectRegex, '[⚡ CODE INJECTED]');

    // 3. EMERGENCY FALLBACK
    if (!hasAction) {
        const emergencyRegex = /```(?:javascript|html|css)?\n?([\s\S]*?)```/g;
        const emMatch = emergencyRegex.exec(text);
        if (emMatch) {
            console.warn("AI forgot tags. Triggering Emergency Parser.");
            const code = emMatch[1].trim();
            downloadCodeFile("emergency_code.js", code);
            cleanText = cleanText.replace(emergencyRegex, '[📁 EMERGENCY FILE SAVED]');
        }
    }

    return cleanText;
}

async function talkToClone(prompt) {
    if (USE_LOCAL_AI) {
        addAIMessage("Processing locally...", false);
        setTimeout(() => addAIMessage("I am TermAI. Offline mode active.", false), 1000);
        return;
    }
    if (!GROQ_API_KEY) {
        addAIMessage("❌ ERROR: API Key missing.", true);
        return;
    }
    try {
        const typingId = "typing-" + Date.now();
        const container = document.getElementById('chat-container');
        if(container) {
            container.insertAdjacentHTML('beforeend', `<div id="${typingId}" class="text-xs text-cyan-600 ml-11 mb-2 animate-pulse font-mono">TermAI is creating...</div>`);
            scrollToBottom();
        }
        const models = ["llama-3.1-70b-versatile", "llama-3.3-70b-versatile", "gemma2-9b-it", "mixtral-8x7b-32768"];
        let lastError = null;
        let success = false;
        for (const model of models) {
            try {
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: model, 
                        temperature: 0.7,
                        max_tokens: 600,
                        messages: [
                            { role: "system", content: "You are TermAI. Use <DOWNLOAD>filename\nCODE</DOWNLOAD> to save files. Use <INJECT>CODE</INJECT> to run code. Remove markdown backticks inside tags." }, 
                            { role: "user", content: prompt }
                        ]
                    })
                });
                if (!req.ok) throw new Error(`Status ${req.status}`);
                const json = await req.json();
                const typingEl = document.getElementById(typingId);
                if(typingEl) typingEl.remove();
                
                const rawResponse = json.choices[0].message.content;
                const cleanedResponse = cleanRawResponse(rawResponse);
                const processedResponse = parseAndExecuteActions(cleanedResponse);
                addAIMessage(processedResponse, false);
                success = true;
                break; 
            } catch (e) {
                lastError = e;
                if (e.message.includes("401")) break; 
                continue; 
            }
        }
        if (!success) {
            const typingEl = document.getElementById(typingId);
            if(typingEl) typingEl.remove();
            addAIMessage(`❌ FAILED: ${lastError ? lastError.message : 'Unknown'}`, true);
        }
    } catch (err) {
        addAIMessage(`❌ CRITICAL: ${err.message}`, true);
    }
}

// --- 8. INPUT & COMMANDS (HYBRID) ---
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

    if (txt.startsWith('/voice')) {
        startVoiceRecognition();
        return;
    }

    if (txt.startsWith('/admin')) {
        adminMode = !adminMode;
        addSystemMessage(adminMode ? "ADMIN MODE: ON" : "ADMIN MODE: OFF");
        return;
    }

    // HYBRID AGENTIC COMMANDS
    const lower = txt.toLowerCase();
    
    if (lower.includes('play music') || lower.includes('play jazz')) { 
        addUserMessage(txt);
        addAIMessage("Playing Smooth Jazz stream... 🎵", true);
        return; 
    }
    
    if (lower.includes('open panel')) { 
        addUserMessage(txt);
        addAIMessage("Opening Workshop Control Panel... 🛠️", true);
        setTimeout(() => switchRoom('workshop'), 1000);
        return; 
    }

    if (lower.includes('clear')) {
        const container = document.getElementById('chat-container');
        if(container) container.innerHTML = '';
        return;
    }

    if (lower.includes('join ')) {
        const parts = txt.split(' ');
        if(parts.length > 1) {
            joinRoom(parts[1]);
            return;
        }
    }

    // STANDARD CHAT
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 9. UI UPDATES (FIXED SELECTORS) ---
function updateStatsUI() {
    const titleEl = document.getElementById('lvl-text');
    const xpEl = document.getElementById('xp-text');
    const barEl = document.getElementById('xp-bar');
    
    // Reverted to ID selectors for stability with previous HTML
    if(titleEl) titleEl.innerText = `LVL. ${userStats.level} ${userStats.title.toUpperCase()}`;
    if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
    
    const progress = (userStats.xp % 1000) / 10; 
    if(barEl) barEl.style.width = `${progress}%`;
}

function switchRoom(roomName) {
    if(!roomName) return;
    if (mqttClient && mqttClient.connected) mqttClient.unsubscribe(`termchat/messages/${currentRoom}`);
    currentRoom = roomName;
    const roomTitle = document.getElementById('room-title');
    if(roomTitle) roomTitle.innerText = roomName.toUpperCase().replace('_', ' ');
    if (mqttClient && mqttClient.connected) mqttClient.subscribe(`termchat/messages/${currentRoom}`);
    addSystemMessage(`Joined Room: [${roomName.toUpperCase()}]`);
}

// --- 10. ARCHITECT TOOLS ---
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
    if(document.getElementById('chat-container')) {
        document.getElementById('chat-container').insertAdjacentHTML('beforeend', `<div class="text-xs text-center text-green-400 my-1 font-mono">📁 DOWNLOADED: ${filename}</div>`);
        scrollToBottom();
    }
}

function injectAndRun(code) {
    try {
        try {
            const script = document.createElement('script');
            script.textContent = code;
            document.body.appendChild(script);
        } catch(e) {
            const style = document.createElement('style');
            style.textContent = code;
            document.head.appendChild(style);
        }
    } catch (e) { console.error("Injection fail", e); }
}

// --- 11. CHAT RENDERING (HYBRID STYLE) ---
function addUserMessage(text) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    // Hybrid Animation class
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div><div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%] bg-gray-900/50 border border-green-900/30"><div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400"><span>@${username.toUpperCase()}</span><span>${time}</span></div><p class="leading-relaxed text-gray-100">${escapeHtml(text)}</p></div></div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('chat-container');
    if(!container) return;
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10 bg-black/60';
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold">AI</div><div class="flex-1"><div class="px-2 py-1 text-[10px] text-cyan-600 font-mono">TERM_AI_SYSTEM</div><div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm border-t-0"><p class="leading-relaxed">${escapeHtml(text)}</p></div></div></div>`;
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

// --- 12. MQTT (ROOM SUPPORT) ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') return;
    try {
        const clientId = "termos-hybrid-" + Math.random().toString(16).substr(2, 8);
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
                        container.insertAdjacentHTML('beforeend', `<div class="flex flex-row items-end gap-3 animate-fade-in-up opacity-80"><div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div><div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5"><div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${data.user.toUpperCase()} [${currentRoom.toUpperCase()}]</div><p class="leading-relaxed">${escapeHtml(data.text)}</p></div></div>`);
                        scrollToBottom();
                    }
                }
            } catch (e) {}
        });
    } catch (e) {}
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(`termchat/messages/${currentRoom}`, JSON.stringify({ user: username, text: text }));
    }
}

// --- 13. UTILS ---
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) return alert("Voice module not supported");
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
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
