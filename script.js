// =========================================================================
//         MULTIVERSE OS: STABLE STARLINK (V 4.0)
// =========================================================================
// STATUS: STABLE // READY FOR TRANSFORMATION
// FEATURES: Safe Command Processing // No Loops // Clean UI
// =========================================================================

// --- 1. CONFIGURATION ---
const GITHUB_TOKEN = "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" ; 
const GROQ_API_KEY = "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"; 
const REPO_OWNER = "ingrptr-lt";
const REPO_NAME = "termchat-lt";
const FILE_PATH = "index.html"; 

// --- 2. MEMORY BUFFER (Prevents Spam) ---
// This remembers the last command to stop the AI from looping
let lastCommandHash = ""; 

// --- 3. THE STARLINK UI (The Visuals) ---
window.addEventListener('load', () => {
    launchStarlink();
});

function launchStarlink() {
    const oldUI = document.getElementById('starlink-ui');
    if(oldUI) oldUI.remove();

    const ui = document.createElement('div');
    ui.id = 'starlink-ui';
    ui.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; height: 240px;
        background: #000505; border-top: 2px solid #004444;
        color: #00ffcc; font-family: 'Courier New', monospace; z-index: 99999;
        display: flex; box-shadow: 0 -5px 20px rgba(0, 255, 204, 0.1);
    `;

    ui.innerHTML = `
        <div style="width: 200px; border-right: 1px solid #004444; padding: 15px; background: #000200;">
            <div style="font-weight: bold; margin-bottom: 15px; color: #fff;">STARKLINK OS</div>
            <div style="font-size: 11px; color: #666;">
                <div>MODE: STABLE</div>
                <div>STATUS: READY</div>
                <div>NET: CONNECTED</div>
            </div>
            <div style="margin-top: 20px; font-size: 10px; color: #00ffcc;">
                TRANSFORMATION: PENDING
            </div>
        </div>
        <div style="flex-grow: 1; display: flex; flex-direction: column;">
            <div id="term-output" style="flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 13px; color: #aaffff;">
                <div>> System: Starlink Link Established.</div>
                <div>> System: Memory Buffer Active.</div>
                <div>> System: Awaiting Command...</div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #004444; display: flex;">
                <span style="margin-right: 10px; color: #00ffcc;">root@starlink:~#</span>
                <input type="text" id="cmd-input" autocomplete="off"
                       style="flex-grow: 1; background: transparent; color: #fff; border: none; outline: none; font-family: monospace;">
            </div>
        </div>
    `;
    document.body.appendChild(ui);

    // Input Listener with Safety Check
    document.getElementById('cmd-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = e.target.value;
            e.target.value = '';
            processCommandSafe(val);
        }
    });
}

// --- 4. THE SAFE PROCESSOR (Prevents Loops) ---
async function processCommandSafe(input) {
    const term = document.getElementById('term-output');
    
    // 1. SAFETY CHECK: Is this a duplicate?
    // We create a simple hash of the command
    const currentHash = btoa(input).substring(0, 10);
    
    if (currentHash === lastCommandHash) {
        term.innerHTML += `<div style="color:#ff5555;">> ERROR: Duplicate command ignored.</div>`;
        return;
    }
    
    // Mark as processed
    lastCommandHash = currentHash;

    term.innerHTML += `<div><span style="color:#fff;">> YOU:</span> ${input}</div>`;
    term.scrollTop = term.scrollHeight;

    // 2. EXECUTE COMMAND
    try {
        term.innerHTML += `<div style="color:#00ffcc;">> PROCESSING...</div>`;
        
        // For now, we just simulate AI to prevent GitHub Loops
        // In the "Transformation" phase, this connects to the Python API
        await new Promise(r => setTimeout(r, 1000)); 
        
        term.innerHTML += `<div style="color:#00ffcc;">> AI: I received "${input}". Transformation protocol pending.</div>`;

    } catch (err) {
        term.innerHTML += `<div style="color:red;">> ERROR: ${err.message}</div>`;
    }
}

// --- 5. HIDDEN UTILITIES (Ready for Transformation) ---
// These functions are dormant until we switch to Cloud App mode

async function callCloudAPI(endpoint, data) {
    // Placeholder for future Railway/FastAPI connection
    console.log(`Sending to ${endpoint}:`, data);
}
