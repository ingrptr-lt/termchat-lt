// =========================================================================
//         TERMOS LT: STABLE LLAMA FIX
//         Features: Stable Model Priority, Robust Auto-Pilot
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
    
    if (sourceContent && sourceContent.innerHTML.trim() !== "") {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
        lines = Array.from(term.children).map(div => div.innerText.trim());
        term.innerHTML = ""; 
    } else {
        lines = ["Initializing BIOS...", "Loading Kernel...", "Loading Architect Modules...", "System Ready."];
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

// --- 6. CORE AI & AUTO-PILOT LOGIC (FIXED MODEL) ---

// Helper: Parse AI response and execute commands automatically
function parseAndExecuteActions(text) {
    let cleanText = text;

    // 1. CHECK FOR DOWNLOAD TAGS: <DOWNLOAD>filename.js\ncode...</DOWNLOAD>
    const downloadRegex = /<DOWNLOAD>([\s\S]*?)<\/DOWNLOAD>/g;
    let match;
    while ((match = downloadRegex.exec(text)) !== null) {
        const content = match[1].trim();
        
        // Split first line (filename) and rest (code)
        const firstLineEnd = content.indexOf('\n');
        let filename = "generated.txt";
        let code = content;

        if (firstLineEnd !== -1) {
            filename = content.substring(0, firstLineEnd).trim();
            // Remove backticks from filename just in case
            filename = filename.replace(/`/g, ''); 
            code = content.substring(firstLineEnd + 1);
        }
        
        downloadCodeFile(filename, code);
    }
    // Remove the raw code block from chat display to keep it clean
    cleanText = cleanText.replace(downloadRegex, '[📁 FILE GENERATED]');

    // 2. CHECK FOR INJECT TAGS: <INJECT>code...</INJECT>
    const injectRegex = /<INJECT>([\s\S]*?)<\/INJECT>/g;
    while ((match = injectRegex.exec(text)) !== null) {
        const code = match[1].trim();
        injectAndRun(code);
    }
    cleanText = cleanText.replace(injectRegex, '[⚡ CODE INJECTED]');

    return cleanText;
}

async function talkToClone(prompt) {
    if (USE_LOCAL_AI) {
        addAIMessage("Processing request via local kernel...", false);
        setTimeout(() => {
            const responses = [
                "I am TermAI. Operating in offline mode. I cannot generate files offline.",
                "Local neural cluster active. No external uplink required.",
                "Please use Remote Mode to use Architect Tools."
            ];
            addAIMessage(responses[Math.floor(Math.random()*responses.length)], false);
        }, 1000);
        return;
    }

    if (!GROQ_API_KEY) {
        addAIMessage("❌ ERROR: API Key missing. TermAI Remote Module disabled.", true);
        return;
    }

    try {
        const typingId = "typing-" + Date.now();
        const container = document.getElementById('chat-container');
        if(container) {
            container.insertAdjacentHTML('beforeend', `<div id="${typingId}" class="text-xs text-cyan-600 ml-11 mb-2 animate-pulse font-mono">TermAI is thinking...</div>`);
            scrollToBottom();
        }

        // FIXED: Model Priority List
        // 1. llama-3.1-70b-versatile (Most Stable, widely available)
        // 2. llama-3.3-70b-versatile (Newest, might be restricted)
        // 3. gemma2-9b-it (Groq's own fast model)
        // 4. mixtral-8x7b-32768 (Solid fallback)
        const models = [
            "llama-3.1-70b-versatile",
            "llama-3.3-70b-versatile", 
            "gemma2-9b-it",
            "mixtral-8x7b-32768"       
        ];

        let lastError = null;
        let success = false;

        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${GROQ_API_KEY}` 
                    },
                    body: JSON.stringify({
                        model: model, 
                        temperature: 0.7,
                        max_tokens: 400,
                        messages: [
                            { 
                                role: "system", 
                                content: `You are TermAI, a cyberpunk AI Architect.
                                RULES FOR AUTO-PILOT:
                                1. If user asks to CREATE or SAVE a file: You MUST format your response like this:
                                <DOWNLOAD>
                                filename.ext
                                // YOUR CODE HERE
                                </DOWNLOAD>
                                2. If user asks to UPDATE or INJECT code: Format like this:
                                <INJECT>CSS_OR_JS_CODE</INJECT>
                                3. Do NOT add markdown (\`\`\`) inside the tags. Just raw code.
                                4. Keep the explanation short.` 
                            }, 
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!req.ok) {
                    const errData = await req.json().catch(() => ({}));
                    console.error(`Model ${model} failed:`, errData);
                    throw new Error(errData.error?.message || `HTTP ${req.status}`);
                }
                
                const json = await req.json();
                
                const typingEl = document.getElementById(typingId);
                if(typingEl) typingEl.remove();

                // EXECUTE THE AUTO-PILOT LOGIC
                const processedResponse = parseAndExecuteActions(json.choices[0].message.content);
                
                addAIMessage(processedResponse, false);
                success = true;
                break; 

            } catch (e) {
                lastError = e;
                if (e.message.includes("401") || e.message.includes("Invalid")) {
                    break; // Stop if key is bad
                }
                continue; // Try next model
            }
        }

        if (!success) {
            const typingEl = document.getElementById(typingId);
            if(typingEl) typingEl.remove();
            addAIMessage(`❌ TERM_AI FAILED: ${lastError ? lastError.message : 'All models unavailable.'}`, true);
        }
        
    } catch (err) {
        addAIMessage(`❌ SYSTEM CRITICAL: ${err.message}`, true);
    }
}

// --- 7. ARCHITECT TOOLS ---

function downloadCodeFile(filename, content) {
    const element = document.createElement('a');
    let mimeType = 'text/plain';
    if(filename.endsWith('.js')) mimeType = 'text/javascript';
    if(filename.endsWith('.html')) mimeType = 'text/html';
    if(filename.endsWith('.css')) mimeType = 'text/css';

    element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    const container = document.getElementById('chat-container');
    if(container) {
        container.insertAdjacentHTML('beforeend', `<div class="text-xs text-center text-green-400 my-1 font-mono border border-green-900 bg-green-900/10 p-1">📁 DOWNLOADED: ${filename}</div>`);
        scrollToBottom();
    }
}

function injectAndRun(code) {
    try {
        if(code.trim().startsWith('.') || code.trim().includes('{') || code.includes('background') || code.includes('color')) {
            const style = document.createElement('style');
            style.textContent = code;
            document.head.appendChild(style);
            const container = document.getElementById('chat-container');
            if(container) {
                container.insertAdjacentHTML('beforeend', `<div class="text-xs text-center text-purple-400 my-1 font-mono border border-purple-900 bg-purple-900/10 p-1">⚡ CSS INJECTED</div>`);
                scrollToBottom();
            }
        } else {
            const script = document.createElement('script');
            script.textContent = code;
            document.body.appendChild(script);
            const container = document.getElementById('chat-container');
            if(container) {
                container.insertAdjacentHTML('beforeend', `<div class="text-xs text-center text-yellow-400 my-1 font-mono border border-yellow-900 bg-yellow-900/10 p-1">⚡ JS EXECUTED</div>`);
                scrollToBottom();
            }
        }
    } catch (e) {
        addSystemMessage(`Injection Error: ${e.message}`);
    }
}

// --- 8. UI UPDATES ---
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

// --- 9. INPUT HANDLING ---
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

    const lower = txt.toLowerCase();
    
    if (lower.includes('who are you')) { 
        addUserMessage(txt);
        addAIMessage("I am TermAI, your local system intelligence.", false); 
        return; 
    }

    const audio = document.getElementById('bg-music');
    if (lower.includes('play music')) { 
        addUserMessage(txt); 
        addAIMessage("🎵 Audio Sequence Initiated.", true); 
        if(audio) audio.play().catch(e=>{});
        return; 
    }
    if (lower.includes('stop music')) { 
        addUserMessage(txt); 
        addAIMessage("⏹ Audio Sequence Halted.", true); 
        if(audio) audio.pause(); 
        return; 
    }
    
    addUserMessage(txt);
    publishMessage(txt);
    addXP(10);
}

// --- 10. CHAT RENDERING ---
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
    
    const cssClass = isAction 
        ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' 
        : 'border border-white/10 bg-black/60';

    const html = `
    <div class="flex flex-row items-start gap-3 animate-fade-in">
        <div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold shadow-[0_0_10px_rgba(0,255,255,0.3)]">TERM</div>
        <div class="flex-1">
            <div class="px-2 py-1 text-[10px] text-cyan-600 font-mono tracking-widest">TERM_AI_SYSTEM</div>
            <div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm border-t-0">
                <p class="leading-relaxed font-sans whitespace-pre-wrap">${escapeHtml(text)}</p>
            </div>
        </div>
    </div>`;
    
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

// --- 11. MQTT CHAT ---
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

// --- 12. UTILS ---
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
