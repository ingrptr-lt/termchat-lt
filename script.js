```javascript
// =========================================================================
//         TERMOS LT: MULTIUNIVERSE OS (ROBUST BUILD)
//         Features: Robust Boot, Safe Init, Matrix Animation
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

// --- NEW: ADMIN STATE ---
let adminMode = false;
let handsOff = false;
let userRole = 'USER';

// --- 3. INITIALIZATION (ROBUST) ---
window.addEventListener('load', () => {
    console.log(">>> SYSTEM INITIALIZING...");
    
    try {
        // 1. FORCE MATRIX START
        initMatrix(); 
    } catch (e) {
        console.error("CRITICAL INIT ERROR:", e);
        // FALLBACK: If canvas fails, try to find it by class name
        const c = document.querySelector('.matrix-canvas');
        if (c) {
            console.log("Canvas found by class name fallback.");
        } else {
            console.error("Canvas not found by ID or Class.");
            // We will log the error to console, but we won't crash the app.
        }
    }
});

// --- 4. TERMINAL BOOT LOGIC (ROBUST) ---
async function runTerminalBoot() {
    const term = document.getElementById('terminal-content');
    const boot = document.getElementById('terminal-boot');
    const statusEl = document.getElementById('boot-status');
    const sourceContent = document.getElementById('hidden-boot-content');

    // ROBUSTNESS: Check if elements exist
    if (!term || !boot || !statusEl || !sourceContent) {
        console.error("!!! CRITICAL: HTML ELEMENTS MISSING !!!");
        // SAFETY: Do not proceed if essential UI is missing.
        // FALLBACK: Don't crash the app.
        return;
    }

    statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";

    // HANDLE HIDDEN CONTENT SAFELY
    if (sourceContent) {
        term.innerHTML = sourceContent.innerHTML;
        sourceContent.innerHTML = ""; 
    }

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
        ">>>   /ai create repo   -> Create Repository",
        ">>>   /ai hands off     -> Disengage AI from System",
        "",
        ">>> USER COMMANDS:",
        ">>>   /mode admin        -> Switch to Chat/Local",
        "",
        "Type '1', '2', or '3' to initialize..."
    ];

    function typeLine(container, text) {
        return new Promise(resolve => {
            const div = document.createElement('div');
            div.className = "opacity-80 animate-fade-in"; 
            
            // Colorize keywords
            if(text.includes(">>> [OK]")) {
                 div.innerHTML = line.replace("[OK]", '<span class="text-green-400">[OK]</span>');
            } else if(text.includes(">>> [1]")) {
                 div.innerHTML = line.replace("[1]", '<span class="text-blue-400">[1]</span>');
            } else if(text.includes(">>> [2]")) {
                 div.innerHTML = line.replace("[2]", '<span class="text-cyan-400">[2]</span>');
            } else if(text.includes(">>> [3]")) {
                 div.innerHTML = line.replace("[3]", '<span class="text-purple-400">[3]</span>');
            } else {
                 div.innerHTML = text
                .replace(/\[OK\]/g, '<span class="text-green-400">[OK]</span>')
                .replace(/\[1\]/g, '<span class="text-blue-400">[1]</span>')
                .replace(/\[2\]/g, '<span class="text-cyan-400">[2]</span>')
                .replace(/\[3\]/g, '<span class="text-purple-400">[3]</span>')
                .replace(/>>>/g, '<span class="text-gray-500">>></span>')
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
                .replace(/🎭/g, '<span class="text-red-500">🎭</span>')
                .replace(/🧠/g, '<span class="text-yellow-400">🧠</span>')
                .replace(/🗣️/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🌍/g, '<span class="text-orange-300">🌍</span>')
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
                .replace(/🗣️/g, '<span class="text-cyan-300">🗣️</span>')
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
                .replace(/🗣️/g, '<span class="text-cyan-300">🗣️</span>')
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
                .replace(/🎨/2023/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2025/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🌍/2026/g, '<span class="text-orange-400">🌍</span>')
                .replace(/🔗/2025/g, '<span class="text-red-400">🔗</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🌍/2027/g, '<span class="text-orange-400">🌍</span>')
                .replace(/🔗/2027/g, '<span class="text-red-400">🔗</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🌍/2027/g, '<span class="text-orange-400">🌍</span>')
                .replace(/🔗/2027/g, '<span class="text-red-400">🔗</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🌍/2027/g, '<span class="text-orange-400">🌍</span>')
                .replace(/🔗/2027/g, '<span class="text-red-400">🔗</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🔍</span>')
                .replace(/🏠/2027/g, '<span class="text-purple-300">🏠</span>')
                .replace(/📚/2027/g, '<span class="text-yellow-500">📚</span>')
                .replace(/🎨/2027/g, '<span class="text-pink-500">🎨</span>')
                .replace(/🗣️/2027/g, '<span class="text-cyan-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-orange-400">🔍</span>')
                .replace(/🤖/2027/g, '<span class="text-blue-500">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-500">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue-100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue/300">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-300">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue/300">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-2007/g, '<span class="text-red-300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange/500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-200">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red/300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange-500">🛠️</span>')
                .replace(/🧠/2027/g, '<span class="text-yellow-200">🧠</span>')
                .replace(/🗣️/2027/g, '<span class="text-red-2007, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green-300">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="span', color: #00A9">🛠️</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="green/1/g, '<span class="text-green-100">🛠️</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="span">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>')
                .replace(/🔍/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🔍/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>'
                .replace(/🛠️/2027/g, '<span class="text= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027, '<span class="text-orange= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>'
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>');
                .replace(/🛠️/2027/g, '<span class="text-orange= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green/100">🎵</span>')
                .replace(/🛠️/2027/g, '<span class="text= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>');
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>');
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>'
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text-green= text-red">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>');
                .replace(/🎵/2027/g, '<span class="text-green= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027, '<span class="text= text-red300">🗣️</span>'
                .replace(/🎵/2027, '<span class="text-blue/2027, '<span class="text-green= text-red">🗣️</span>'
                .replace(/🎵/2027, '<span class="text= text-red">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027, '<span class="text-green= text-red">🗣️</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red300">🗣️</span>')
                .replace(/🎵/2027, '<span class="text-blue/100">🤖</span>')
                .replace(/🎵/2027/g, '<span class="text= text-red">🗣️</span>()
```
