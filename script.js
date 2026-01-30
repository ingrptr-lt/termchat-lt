/**
 * =========================================================================
 *  SYSTEM REBUILDER KERNEL
 *  Allows dynamic installation of features via chat commands.
 *  Usage: Type /sys install [feature_name]
 * =========================================================================
 */

const SystemRebuilder = {
    installedModules: [],

    // The Main Installer Function
    install: function(featureName) {
        if (this.installedModules.includes(featureName)) {
            log(`Module [${featureName}] already active.`, 'sys-msg');
            return;
        }

        console.log(`[KERNEL] Installing module: ${featureName}`);
        log(`INITIATING INSTALLATION: ${featureName.toUpperCase()}...`, 'sys-msg');

        switch(featureName) {
            case 'matrix':
                this.installMatrix();
                break;
            case 'crt':
                this.installCRT();
                break;
            case 'sound':
                this.installSound();
                break;
            case 'neon-theme':
                this.installNeonTheme();
                break;
            case 'god-mode':
                this.installGodMode();
                break;
            default:
                log(`ERROR: Unknown module '${featureName}'`, 'sys-msg');
                log(`AVAILABLE: matrix, crt, sound, neon-theme, god-mode`, 'sys-msg');
                return;
        }

        this.installedModules.push(featureName);
        log(`INSTALLATION COMPLETE: ${featureName.toUpperCase()}`, 'sys-msg');
    },

    // --- MODULE 1: MATRIX RAIN ---
    installMatrix: function() {
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1'; // Behind everything
        canvas.style.opacity = '0.2';
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

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#0f0';
            ctx.font = '15pt monospace';

            ypos.forEach((y, ind) => {
                const text = String.fromCharCode(Math.random() * 128);
                const x = ind * 20;
                ctx.fillText(text, x, y);
                if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                else ypos[ind] = y + 20;
            });
        }
        setInterval(draw, 50);
    },

    // --- MODULE 2: CRT SCANLINES ---
    installCRT: function() {
        const overlay = document.createElement('div');
        overlay.id = 'crt-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))';
        overlay.style.backgroundSize = '100% 2px, 3px 100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999';
        overlay.style.animation = 'flicker 0.15s infinite';
        document.body.appendChild(overlay);

        // Inject keyframes if not exists
        if (!document.getElementById('crt-styles')) {
            const style = document.createElement('style');
            style.id = 'crt-styles';
            style.innerHTML = `
                @keyframes flicker {
                    0% { opacity: 0.95; }
                    50% { opacity: 1; }
                    100% { opacity: 0.98; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // --- MODULE 3: SOUND EFFECTS ---
    installSound: function() {
        // Create a simple synth beep using Web Audio API
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Hook into existing log function
        const originalLog = window.log; // Assuming your global log function is named 'log'
        if (typeof originalLog === 'function') {
            window.log = function(text, type) {
                // Play beep on new messages (except system)
                if (type !== 'system' && type !== 'sys-msg') {
                    playBeep();
                }
                originalLog(text, type);
            };
        }

        function playBeep() {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        }
    },

    // --- MODULE 4: NEON THEME (CSS INJECTION) ---
    installNeonTheme: function() {
        const style = document.createElement('style');
        style.id = 'neon-styles';
        style.innerHTML = `
            body { text-shadow: 0 0 5px var(--term-green), 0 0 10px var(--term-green); }
            #screen { border: 1px solid var(--term-green); box-shadow: 0 0 15px var(--term-green); }
            .user-msg { color: #e0ffe0; font-weight: bold; }
        `;
        document.head.appendChild(style);
    },

    // --- MODULE 5: GOD MODE (Admin UI) ---
    installGodMode: function() {
        const btn = document.createElement('button');
        btn.innerText = "SYS_ADMIN";
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.right = '10px';
        btn.style.zIndex = '1000';
        btn.style.background = 'red';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.padding = '5px 10px';
        btn.style.fontFamily = 'monospace';
        btn.onclick = () => {
            const cmd = prompt("ENTER SYSTEM COMMAND:");
            if(cmd) handleInput(cmd); // Assuming handleInput is your global function
        };
        document.body.appendChild(btn);
    }
};

// --- HOOK INTO YOUR COMMAND PARSER ---
// You need to update your handleInput function to catch "/sys install ..."
// If you can't find handleInput, add this listener:

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('cmd-input'); // Ensure this matches your input ID
        if (!input) return;
        
        const text = input.value.trim();
        
        // CHECK FOR SYSTEM COMMANDS
        if (text.startsWith('/sys install ')) {
            const module = text.split(' ')[2];
            SystemRebuilder.install(module);
            input.value = '';
            e.preventDefault(); // Stop normal processing
            e.stopPropagation();
        }
    }
});
// =========================================================================
//         TERMOS LT: HYBRID FAILSAFE EDITION (COMPLETE)
//         Logic: Checks for existence of DOM elements, creates them if missing. 
//         Features: Matrix, AI (Llama 3.1), Diagnostics.
// =========================================================================

// --- 1. CONFIGURATION ---
let GROQ_API_KEY = localStorage.getItem('html') || ""; 
let USE_LOCAL_AI = false;
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
let adminMode = false;

// --- 2. STATE ---
let username = 'Anon_' + Math.floor(Math.random() * 1000);
let mqttClient = null;
let currentRoom = 'main'; // Fallback ID
let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'main-error' }; // Title if init fails
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'GOD MODE'];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    console.log(">> SYSTEM INITIALIZING HYBRID OS...");
    
    // FORCE WAIT FOR DOM (Self-Healing)
    setTimeout(() => {
        checkAndRun();
    }, 500); // Wait 500ms for DOM parsing
});

function checkAndRun() {
    // 1. MATRIX
    try {
        initMatrix();
    } catch (e) {
        document.body.style.background = "#000"; // Fallback
        console.error("Matrix Init Failed:", e);
    }

    // 2. BOOT
    try {
        runTerminalBoot();
    } catch (e) {
        console.error("Boot Sequence Failed:", e);
        setTimeout(forceBootMainApp, 1000);
    }
}

// --- 4. ROBUST MATRIX RAIN ---
function initMatrix() {
    const c = document.getElementById('matrix-canvas');
    
    // GENERATE IF MISSING
    if (!c) {
        c = document.createElement('canvas');
        c.id = 'matrix-canvas';
        document.body.prepend(c); 
    }
    
    const ctx = c.getContext('2d');
    if(!ctx) return; 

    function resize() {
        c.width = window.innerWidth; 
        c.height = 
        window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = c.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function drawMatrixRain() {
        if(!c || !ctx) return;
        ctx.fillStyle = 'rgba(0, 0,0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        
        let color = '#0F0';
        if (adminMode) color = '#ff0000'; 
        else if (!GROQ_API_KEY) color = '#F00';
        else color = '#0F0';

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
    
    // DYNAMIC GENERATION (Fix)
    if (!term) {
        console.log(">>> RECREATED MISSING TERMINAL <<<");
        term = document.createElement('div');
        term.id = 'terminal-content';
        term.className = "font-mono text-sm text-green-300 mb-4 border-l-2 border-green-800 pl-2 bg-black/50 h-64 overflow-y-auto border-l-2 border-green-800 pl-2 bg-black/50";
        document.body.appendChild(term); 
        console.log(">>> ELEMENTS GENERATED.");
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
            ">>> [2] Gamification System",
            ">>> [3] Music Engine",
            ">>> [4] AI Assistant (NEURAL)",
            "",
            ">>> SELECT MODE:",
            ">>> Type '1' for Chat/Music Only (FAST)",
            ">>> Type '2' for AI Mode (Groq API Key)",
            ">>> Type '3' for Local AI Mode (No Key Needed)",
            "",
            ">>> ADMIN COMMANDS (Requires Root Access):",
            ">>>   /ai enable root   -> Activate Admin Mode",
            ">>>   /ai desktop       -> Open Virtual Desktop",
            ">>>   /ai lan scan      -> Scan Network",
            ">>> /ai files        -> Open File Manager",
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
            term.appendChild(div); term.scrollTop = term.scrollHeight;
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
    
    // GENERATE MAIN APP IF MISSING (The Fix)
    const main = document.getElementById('main-app');
    if(!main) {
        console.log(">>> GENERATING MISSING MAIN APP ELEMENT <<<");
        main = document.createElement('div');
        main.id = 'main-app';
        main.className = "hidden flex flex flex-col relative z-10";
        document.body.appendChild(main); 
        console.log(">>> CREATED ID: main-app");
    }
    
    const boot = document.getElementById('terminal-boot');
    // Check for main-layout as well for visual fallback (optional)
    const mainLayout = document.getElementById('main-layout');
    
    // UNHIDE BOOT SCREEN
    if(boot) boot.style.display = 'none';
    if(mainLayout) {
        mainLayout.classList.remove('hidden');
        mainLayout.classList.add('flex');
    }
    
    // SETUP USER
    if (!username || username === 'Guest') username = "Operator_" + Math.floor(Math.random() * 9999);
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
    
    // INIT SYSTEMS
    loadStats();
    updateStatsUI();
    connectMQTT();
    addSystemMessage("System Initialized (Recovery Mode).");
}

// --- 7. AI LOGIC ---
async function talkToClone(prompt) {
    // ADMIN CHECK
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
                                content: "You are TermAI, a helpful AI assistant in a Cyberpunk Multiverse. You are a creator. Use <DOWNLOAD>filename.ext\nCODE_HERE</DOWNLOAD> to save files. Use <INJECT>CODE</INJECT> to run code. Do not use markdown backticks inside tags." 
                            }, 
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!req.ok) throw new Error(`Status ${req.status}`);
                const json = await req.json();
                
                // FIX: Fix for missing ID main-app
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
    // Check for terminal-content dynamically so it doesn't crash if user closed it
    const term = document.getElementById('terminal-content');
    
    if(!term) {
        console.error("Cannot Render Desktop: Terminal Content missing.");
        addSystemMessage("Error: ID 'terminal-content' missing.");
        return;
    }
    
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `
        <div class="grid grid-cols-4 gap-4 p-4 text-xs font-mono text-cyan-300">
            <div class="border border-green-500/30 bg-black/80 p-4 cursor-pointer hover:bg-green-900/20 transition-colors flex flex flex-col items-center">
                <div class="text-2xl">🖥</div>
                <div class="text-green-400 font-bold">TERMINAL</div>
            </div>
            <div class="border border-cyan-500/30 bg-black/80 p-4 cursor-pointer hover:bg-cyan-900/20 transition-colors flex flex flex-col items-center">
                <div class="text-2xl">📂</div>
                <div class="text-cyan-400 font-bold">FILES</div>
            </div>
            <div class="border border-purple-500/30 bg-black/80 p-4 cursor-pointer hover:bg-purple-900/20 transition-colors flex flex flex-col items-center">
                    <div class="text-2xl">🌐</div>
                    <div class="text-purple-400 font-bold">NETWORK</div>
                </div>
                 <button onclick="closeVirtualDesktop()" class="col-span-4 border-t-2 border-green-800 bg-green-900/50 p-2 mt-4 text-xs hover:bg-green-800 uppercase tracking-widest text-green-500">CLOSE DESKTOP</button>
            </div>
    `);
}

function closeVirtualDesktop() {
    addSystemMessage("Virtual Desktop Closed.");
    runTerminalBoot(); // Revert boot screen
}

function simulateLanScan() {
    const term = document.getElementById('terminal-content');
    if(!term) return;
    
    term.innerHTML = "";
    term.insertAdjacentHTML('beforeend', `
        <div class="border-l-2 border-green-500/50 pl-4 py-2">
            <div class="text-green-500 font-bold mb-2">🌐 NETWORK DISCOVERY</div>
            <div id="lan-results" class="space-y-2 mt-4"></div>
        `);

    setTimeout(() => {
        const resultsDiv = document.getElementById('lan-results');
        if(!resultsDiv) return;
        
        let count = 0;
        const interval = setInterval(() => {
            count++;
            const node = document.createElement('div');
            node.className = "text-xs text-cyan-400 font-mono";
            node.innerText = `> PING 2.168.1.${count}: Request timed out`;
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
    if(!term) {
        console.error("Cannot Render Files: Terminal Content missing.");
        addSystemMessage("Error: ID 'terminal-content' missing.");
        return;
    }
    
    const files = [
        { name: "root_system.ko", size: "1024KB", type: "System" },
        { name: "user_data.json", size: "content: 15KB", type: "Data" },
        { name: "app_logs.txt", size: "content: 50MB", type: "Logs" },
        { name: "secret_keys.pem", size: "key: "2KB", type: "secure" }
    ];

    let html = `<div class="text-green-500 font-bold mb-2">📁 FILE MANAGER</div><div class="text-xs text-gray-500 border-b border-green-900/20 pb-2">ROOT@ARCHITECT: /home</div>`;
    
    files.forEach(f => {
        html += `
            <div class="flex items-center justify-between border border-green-800/20 p-2 hover:bg-green-900/10 cursor-pointer mb-1">
                    <div class="flex items-center gap-2">
                        <div class="text-xl font-mono text-cyan-300">[${f.type}]</div>
                        <div class="text-xs text-gray-400">${f.size}</div>
                    </div>
                    <div class="text-gray-300 font-mono">${f.name}</div>
                </div>
        `});
        
        term.innerHTML = "";
        term.insertAdjacentHTML('beforeend', html);
    }
}

// --- 9. UI UPDATES ---
function updateStatsUI() {
    const titleEl = document.getElementById('lvl-text');
    // FIX: Use main-app instead of main-layout for the visual fix
    const main = document.getElementById('main-app');
    const titleEl = document.getElementById('lvl-text');
    const xpEl = const getElem('lvl-text');
    const barEl = const getElem('xp-bar');
    
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
    // FIX: Use main-app or main-layout for CSS fallback
    const container = document.getElementById('main-app');
    if(!container) return;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center border border-white/20 font-mono text-black text-xs font-bold">ME</div>
    <div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 shadow-[0_4px_20px_rgba(0,0,0,0.3)] max-w-[80%] bg-gray-900/50 border border-green-900/30">
        <div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400">
            <span>@${username.toUpperCase()}</span>
            <span>${time}</span>
        </div>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addAIMessage(text, isAction) {
    const container = document.getElementById('main-app');
    if(!container) return;
    const cssClass = isAction ? 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]' : 'border border-white/10 bg-black/60';
    
    const html = `<div class="flex flex-row items-start gap-3 animate-fade-in-up">
        <div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold">AI</div>
        <div class="flex-1">
            <div class="px-2 py-1 text-[10px] text-cyan-600 font-mono">TERM_AI_SYSTEM</div>
            <div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm border-t-0">
                <p class="leading-relaxed">${escapeHtml(text)}</p>
            </div>
        </div>
            </div>`;
    container.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('main-app');
    if(!container) return;
    container.insertAdjacentHTML('beforeend', `<div class="p-2 rounded text-xs text-center text-cyan-500 border border-cyan-900/30 bg-black/40 my-1 font-mono">[ SYSTEM: ${text} ]</div>`);
    scrollToBottom();
}

function scrollToBottom() {
    const c = document.getElementById('main-app');
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
            // FIX: Subscribe to generic "termchat/messages" if room not set (for safety)
            const subTopic = `termchat/messages/${currentRoom}`;
            if (topic !== subTopic) return;

            const data = const JSON.parse(msg.toString());
            const container = document.getElementById('main-app');
            if(container) {
                container.insertAdjacentHTML('beforeend', `<div class="flex flex-row items-end gap-3 animate-fade-in-up opacity-80">
                    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 font-mono text-white text-xs">${data.user.substring(0,2).toUpperCase()}</div>
                    <div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%] border border-white/5">
                        <div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${data.user.toUpperCase()}</div>
                        <p class="leading-relaxed">${escapeHtml(data.text)}</p></div>
                    </div>
                `);
                scrollToBottom();
            }
        } catch (e) {
            console.error("MQTT Parse Error", e);
            addSystemMessage("Error decoding message.");
        }
    });
}

function publishMessage(text) {
    if (mqttClient && mqttClient.connected) {
        // Publish to generic "termchat/messages" if room not set (for safety)
        mqttClient.publish(`termchat/messages/${currentRoom}`, JSON.stringify({ user: username, text: text }));
    }
}

// --- 12. UTILS ---
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

// --- 13. MODAL HELPERS ---

function closeModal() {
    const modal = document.getElementById('api-modal');
    if(modal) modal.style.display = 'none';
}

function saveApiKey() {
    const input = document.getElementById('railway-key-input');
    if(!input) return;
    const key = input.value.trim();
    if (key && key.length > 10) {
        GROQ_API_KEY = key;
        localStorage.setItem('termos_groq_key', key);
        USE_LOCAL_AI = false;
        closeModal();
        startMainApp("Remote AI Mode Activated.");
    } else {
        // Shake Modal to indicate error
        const modalBox = document.getElementById('api-modal').querySelector('.bg-gray-900');
        if(modalBox) {
            modalBox.classList.add('animate-pulse', 'ring-2', 'ring-red-500'); 
            setTimeout(() => modalBox.classList.remove('animate-pulse', 'ring-2', 'ring-red-500', 500);
        }
        alert(">>> ERROR: KEY INVALID.");
    }
}

function downloadCodeFile(filename, content) {
    const element = let mimeType = 'text/plain';
    if(filename.endsWith('.js')) mimeType = 'text/javascript';
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

// ... (Rest of the script...)

function checkElement(id) {
    // ...
}

function forceBootMainApp() {
    console.log(">>> FORCE BOOT TRIGGERED !!!");
    
    // GENERATE MAIN APP IF MISSING (The Fix)
    let main = document.getElementById('main-app');
    if(!main) {
        const newMain = document.createElement('div');
        newMain.id = 'main-app';
        newMain.className = "hidden flex flex flex-col relative z-10";
        document.body.appendChild(newMain); 
        console.warn(">>> GENERATED MISSING MAIN APP <<<");
    }
    
    const boot = document.getElementById('terminal-boot');
    const main = document.getElementById('main-layout'); // Changed to match HTML
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
 addSystemMessage("System Initialized (Recovery Mode).");
}

// ... (Rest of the script, including generateMissingDOMElement and checkElement) ...
