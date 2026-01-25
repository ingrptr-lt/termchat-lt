// =========================================================================
//         MULTIVERSE OS: MASTER CODE (PRODUCTION V1.0)
// =========================================================================
// STATUS: STABLE | CONNECTED | STARLINK INTERFACE
// =========================================================================

// --- 1. CONFIGURATION ---
const GROQ_API_KEY = "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"; 

// --- 2. SYSTEM INITIALIZATION ---
window.addEventListener('load', () => {
    initMultiverseOS();
});

async function initMultiverseOS() {
    
    // CREATE THE TERMINAL BODY
    const term = document.createElement('div');
    term.id = 'multiverse-term';
    term.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; height: 300px;
        background: #000505; border-top: 4px solid #00ff41;
        color: #00ff41; font-family: 'Courier New', monospace;
        padding: 20px; font-size: 18px; z-index: 99999;
        box-shadow: 0 -5px 30px rgba(0, 255, 65, 0.2);
        display: flex; flex-direction: column;
    `;
    
    // HEADER
    const header = document.createElement('div');
    header.innerHTML = `<span style="color:#fff; font-weight:bold;">MULTIVERSE OS</span> <span style="font-size:12px; color:#888;">// CONNECTED</span>`;
    header.style.marginBottom = '10px';
    term.appendChild(header);
    
    // LOG AREA
    const log = document.createElement('div');
    log.id = 'term-log';
    log.style.flexGrow = '1';
    log.style.overflowY = 'auto';
    log.style.marginBottom = '10px';
    log.innerHTML = `<div style="color:#fff;">> System Online.</div><div style="color:#fff;">> Groq Neural Link Active.</div>`;
    term.appendChild(log);
    
    // INPUT AREA
    const input = document.createElement('input');
    input.id = 'term-input';
    input.placeholder = "Enter command or message...";
    input.style.cssText = `
        width: 100%; background: transparent; color: #fff; border: none; outline: none;
        font-family: 'Courier New', monospace; font-size: 20px; border-top: 1px solid #333;
        padding-top: 10px;
    `;
    
    // INPUT LISTENER
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if (!txt) return;
            
            input.value = ""; // Clear
            addToLog(`> YOU: ${txt}`, '#fff');
            
            // PROCESS COMMAND
            await processCommand(txt, log);
        }
    });
    
    term.appendChild(input);
    document.body.appendChild(term);
}

// --- 3. CORE PROCESSOR ---
async function processCommand(text, log) {
    try {
        // DEFAULT: SEND TO AI
        await callGroqAI(text, log);
        
    } catch (err) {
        addToLog(`> SYSTEM ERROR: ${err.message}`, '#ff3333');
    }
}

// --- 4. AI ENGINE ---
async function callGroqAI(text, log) {
    addToLog(`> NEURAL NET: Processing...`, '#00ff41');
    
    const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: text }]
        })
    });
    
    if (!req.ok) {
        throw new Error(`API Error ${req.status}`);
    }
    
    const json = await req.json();
    const ans = json.choices[0].message.content;
    
    addToLog(`> AI: ${ans}`, '#00ffff');
}

// --- 5. UTILITIES ---
function addToLog(msg, color) {
    const log = document.getElementById('term-log');
    const div = document.createElement('div');
    div.style.color = color || '#00ff41';
    div.innerHTML = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}
