// =========================================================================
//         TERMOS LT: MULTIUNIVERSE OS (GOD MODE ARCHITECTURE)
//         Features: Robust Boot, Virtual Desktop, LAN Scan, File System
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

// --- NEW: VIRTUAL DESKTOP STATE ---
let openApps = [];

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    console.log(">> SYSTEM INITIALIZING MULTIUNIVERSE OS...");
    
    // 1. TRY MATRIX RAIN (ROBUST BOOT)
    try {
        initMatrix();
    } catch (e) {
        console.error("CRITICAL MATRIX RAIN FAILED:", e);
        // FALLBACK: If canvas fails, just set a cool CSS background
        document.body.style.background = "linear-gradient(135deg, #0f0c1 1 0%, #000000 100%)";
    }

    // 2. FORCE TERMINAL START (Even if Matrix is invisible)
    // We use a small timeout to ensure DOM is ready
    setTimeout(() => {
        const term = document.getElementById('terminal-content');
        const boot = document.getElementById('terminal-boot');
        const main = document.getElementById('main-layout');
        
        // SAFETY: If elements exist, proceed. If not, wait.
        if (term && boot && main) {
            runTerminalBoot();
        } else {
            console.error("!!! CRITICAL: TERMINAL ELEMENTS MISSING !!!");
            forceBootMainApp(); // Force open app if terminal fails
        }
    }, 100);
});

// --- 4. TERMINAL BOOT LOGIC (ROBUST & SAFE) ---
async function runTerminalBoot() {
    console.log(">>> SCANNING SYSTEM RESOURCES...");
    
    const term = document.getElementById('terminal-content');
    const boot = document.getElementById('terminal-boot');
    const statusEl = document.getElementById('boot-status');
    
    // ROBUST: Check if content container exists
    if (!term || !boot) {
        console.error("Missing terminal DOM elements.");
        throw new Error("DOM Elements not found");
    }

    statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";

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
        ">>> Type '1' for Chat/Music Only (FAST)",
        ">>> Type '2' for AI Mode (Groq API Key)",
        ">>> Type '3' for Local AI Mode (WebGPU - No Key Needed)",
        "",
        ">>> ADMIN COMMANDS (Requires Root Access):",
        ">>>   /ai enable root   -> Activate System Architect Mode",
        ">>>   /ai desktop       -> Open Virtual Desktop Interface",
        ">>>   /ai lan scan      -> Scan Local Network",
        ">>>   /ai files        -> Open File Manager",
        "",
        ">>> USER COMMANDS:",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        "Type '1', '2', or '3' to initialize..."
    ];

    function typeLine(container, text) {
        return new Promise(resolve => {
            const div = document.createElement('div');
            div.innerHTML = text
                .replace(/\[OK\]/g, '<span class="text-green-400">[OK]</span>')
                .replace(/\[1\]/g, '<span class="text-blue-400">[1]</span>')
                .replace(/\[2\]/g, '<span class="text-cyan-400">[2]</span>')
                .replace(/\[3\]/g, '<span class="text-purple-400">[3]</span>')
                .replace(/>>>/g, '<span class="text-gray-500">>>></span>')
                .replace(/✨/g, '<span class="text-yellow-400">✨</span>')
                .replace(/🚀/g, '<span class="text-blue-400">🚀</span>')
                .replace(/🤖/g, '<span class="text-white">🤖</span>')
                .replace(/🎮/g, '<span class="text-green-400">🎮</span>')
                .replace(/🔌/g, '<span class="text-purple-400">🔌</span>')
                .replace(/📱/g, '<span class="text-gray-300">📱</span>')
                .replace(/🎨/g, '<span class="text-pink-400">🎨</span>')
                .replace(/🗣️/g, '<span class="text-cyan-400">🗣️</span>')
                .replace(/🌍/g, '<span class="text-orange-400">🌍</span>')
                .replace(/🔗/g, '<span class="text-red-400">🔗</span>')
                .replace(/🤖/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🛠️/g, '<span class="text-orange-400">🛠️</span>')
                .replace(/🎭/g, '<span class="text-red-500">🎭</span>')
                .replace(/🧠/g, '<span class="text-yellow-400">🧠</span>')
                .replace(/🔌/g, '<span class="text-purple-500">🔌</span>')
                .replace(/🔒/g, '<span class="text-green-600">🔒</span>')
                .replace(/🐳/g, '<span class="text-blue-400">🐳</span>')
                .replace(/🚫/g, '<span class="text-red-400">🚫</span>')
                .replace(/⏱️/g, '<span class="text-cyan-300">⏱️</span>')
                .replace(/📊/g, '<span class="text-green-500">📊</span>')
                .replace(/✅/g, '<span class="text-green-400">✅</span>')
                .replace(/🎆/g, '<span class="text-purple-400">🎆</span>');

            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            setTimeout(resolve, 20); // Typing speed
        });
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function typeNextLine(lines, index) {
        if (index < lines.length) {
            const line = lines[index];
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
            } else if(line.includes(">>>")) {
                 div.innerHTML = line.replace(/>>>/g, '<span class="text-gray-500">>></span>');
            } else {
                 div.innerText = line;
            }

            term.appendChild(div);
            term.scrollTop = term.scrollHeight;
            await sleep(20); 
        } else {
            statusEl.innerText = "SCAN COMPLETE. SELECT MODE.";
            statusEl.className = "text-green-500 font-bold animate-pulse";
        }
    }

    for (let i = 0; i < presentationText.length; i++) {
        await typeLine(term, presentationText[i]);
    }
}

// --- 5. BOOT HANDLERS ---
async function enterApp(mode) {
    // MODE 4: ADMIN MODE
    if (mode === 'admin') {
        adminMode = true;
        userRole = 'ADMIN';
        
        if(window.matrixColorInterval) {
            clearInterval(window.matrixColorInterval);
        }
        initMatrix('#ff0000'); // Red
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

    // MODE 5: VIRTUAL DESKTOP (GOD MODE FEATURE)
    if (mode === 'desktop') {
        addSystemMessage("Launching Virtual Desktop Environment...");
        renderVirtualDesktop();
        return;
    }

    // MODE 6: LAN SCAN (GOD MODE FEATURE)
    if (mode === 'lan') {
        addSystemMessage("Scanning for Local Nodes...");
        simulateLanScan();
        return;
    }

    // MODE 7: FILE MANAGER (GOD MODE FEATURE)
    if (mode === 'files') {
        addSystemMessage("Opening File Manager...");
        renderFileManager();
        return;
    }

// --- 6. START MAIN APP ---
function startMainApp(message) {
    console.log(">> STARTING MAIN APP...");
    
    const boot = document.getElementById('terminal-boot');
    boot.style.display = 'none';
    
    const main = document.getElementById('main-layout');
    if (!main) {
        console.error("CRITICAL: MAIN LAYOUT MISSING");
        alert("System Error: Interface elements missing. Please refresh page.");
        return;
    }
    
    main.classList.remove('hidden');
    main.classList.add('flex');
    
    if (!username || username === 'Guest') {
        username = "Operator_" + Math.floor(Math.random() * 9999);
    }
    document.getElementById('user-display').innerText = `@${username.toUpperCase()}`;
    
    loadStats();
    updateStatsUI();
    connectMQTT();
    
    const modeMsg = USE_LOCAL_AI 
        ? "System Started: LOCAL AI Mode." 
        : "GROQ_API_KEY ? "System Started: REMOTE AI Mode." : "System Started: Chat Mode.";
    
    addSystemMessage(modeMsg);
}

// --- 7. AI LOGIC (SYSTEM ARCHITECT) ---
async function talkToClone(prompt) {
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

// --- 8. GOD MODE FEATURES (VIRTUAL DESKTOP & LAN SCAN) ---
function renderVirtualDesktop() {
    // We replace the terminal content with a Grid of "App Windows"
    const term = document.getElementById('terminal-content');
    term.innerHTML = ""; // Clear terminal
    
    const desktopHTML = `
        <div class="grid grid-cols-4 gap-4 p-4">
            <div class="border border-green-500/30 bg-black/80 p-4 cursor-pointer hover:bg-green-900/20 transition-colors">
                <div class="text-center">🖥</div>
                <div class="text-xs text-center text-green-400">TERMINAL</div>
            </div>
            <div class="border border-cyan-500/30 bg-black/80 p-4 cursor-pointer hover:bg-cyan-900/20 transition-colors">
                <div class="text-center">📂</div>
                <div class="text-xs text-center text-cyan-400">FILES</div>
            </div>
            <div class="border border-purple-500/30 bg-black/80 p-4 cursor-pointer hover:bg-purple-900/20 transition-colors">
                <div class="text-center">🌐</div>
                <div class="text-xs text-center text-purple-400">BROWSER</div>
            </div>
            <div class="border border-yellow-500/30 bg-black/80 p-4 cursor-pointer hover:bg-yellow-900/20 transition-colors">
                <div class="text-center">🎵</div>
                <div class="text-xs text-center text-yellow-400">MEDIA</div>
            </div>
            <div class="border border-red-500/30 bg-black/80 p-4 cursor-pointer hover:bg-red-900/20 transition-colors">
                <div class="text-center">⚙️</div>
                <div class="text-xs text-center text-red-400">SYSTEM</div>
            </div>
             <button onclick="closeVirtualDesktop()" class="col-span-4 border-t border-green-800 bg-green-900/50 p-2 mt-4 text-xs hover:bg-green-800 uppercase">CLOSE DESKTOP</button>
        </div>
    `;
    term.insertAdjacentHTML('beforeend', desktopHTML);
}

function simulateLanScan() {
    const term = document.getElementById('terminal-content');
    
    const scanHTML = `
        <div class="border-l-2 border-green-500/50 pl-4 py-2 mb-4">
            <div class="text-green-500 font-bold mb-2">🌐 NETWORK DISCOVERY</div>
            <div id="lan-results" class="space-y-2 mt-4"></div>
        </div>
    `;
    term.insertAdjacentHTML('beforeend', scanHTML);

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
    term.innerHTML = "";
    
    const files = [
        { name: "root_system.ko", size: "1024KB", type: "System" },
        { name: "user_data.json", size: "15KB", type: "Data" },
        { name: "app_logs.txt", size: "50MB", type: "Log" },
        { name: "secret_keys.pem", size: "2KB", type: "Secure" }
    ];

    let html = `<div class="text-green-500 font-bold mb-2">📁 FILE MANAGER</div><div class="text-xs text-gray-500 border-b border-green-900/20 pb-2">ROOT@ARCHITECT: /home</div>`;
    
    files.forEach(f => {
        html += `
            <div class="flex items-center justify-between border border-green-800/20 p-2 hover:bg-green-900/10 cursor-pointer">
                <div class="flex items-center gap-2">
                    <div class="text-xl font-mono text-cyan-300">[${f.type}]</div>
                    <div class="text-xs text-gray-400">${f.size}</div>
                </div>
                <div class="text-xs text-gray-500">${f.name}</div>
            </div>
        `;
    });
    
    term.insertAdjacentHTML('beforeend', html);
}

function closeVirtualDesktop() {
    addSystemMessage("Virtual Desktop Closed.");
    runTerminalBoot(); // Revert boot screen
}

function forceBootMainApp() {
    console.log("!!! FORCE BOOT TRIGGERED !!!");
    const boot = document.getElementById('terminal-boot');
    const main = document.getElementById('main-layout');
    
    if(boot) boot.style.display = 'none';
    if(main) {
        main.classList.remove('hidden');
        main.classList.add('flex');
        
        // Setup user
        if (!username || username === 'Guest') {
            username = "Operator_" + Math.floor(Math.random() * 9999);
        }
        document.getElementById('user-display').innerText = `@${username.toUpperCase()}`;
        
        // Init Systems
        loadStats();
        updateStatsUI();
        connectMQTT();
        
        addSystemMessage("SYSTEM: RECOVERY MODE INITIATED.");
}
