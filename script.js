// =========================================================================
//         MULTIVERSE OS: THE LIVING MANIFESTO (V 3.0)
// =========================================================================
// STATUS: ALIVE & SELF-HEALING
// ARCHITECTURE: Mind (User) + Brain (AI) + Hands (GitHub) + Immune System (Scenario 1)
// =========================================================================

// --- CONFIGURATION ---
const GITHUB_TOKEN = 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; 
const GROQ_API_KEY = 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; 
const REPO_OWNER = "ingrptr-lt";
const REPO_NAME = "termchat-lt";
const FILE_PATH = "index.html"; 

// =========================================================================
// CORE 1: THE IMMUNE SYSTEM (Scenario 1: Auto-Healing)
// =========================================================================

// This hook intercepts errors before the user sees them
const originalError = console.error;
console.error = function(message, ...args) {
    // Show real error in console
    originalError.apply(console, [message, ...args]);
    
    // Trigger Immune Response
    if (message && typeof message === 'string') {
        triggerHealingProtocol(message);
    }
};

async function triggerHealingProtocol(errorMessage) {
    // Safety: Don't loop if we are already healing
    if (errorMessage.includes("Multiverse AI") || errorMessage.includes("Self-Healing")) return;

    const term = document.getElementById('terminal-output');
    if (!term) return; // Terminal not loaded yet

    term.innerHTML += `<div style="color:red;">⚠ IMMUNE SYSTEM: Pain detected at ${new Date().toLocaleTimeString()}</div>`;
    term.innerHTML += `<div style="color:#ffaa00;">⚠ DIAGNOSIS: ${errorMessage}</div>`;

    try {
        term.innerHTML += `<div style="color:cyan;">🧬 DNA REWRITING: Consultin AI Core...</div>`;

        // 1. Read Genome (Current Code)
        const repoData = await readFromGitHub();

        // 2. Generate Cure (AI Fix)
        const curePrompt = `
        You are the Multiverse OS Immune System.
        
        MISSION: Save the host.
        INJURY (Error): "${errorMessage}"
        
        INSTRUCTIONS:
        1. Identify the cause of the error in the code.
        2. Rewrite the code to fix the error permanently.
        3. Ensure the fix does not destroy the "Terminal UI" (id: multiverse-core-ui).
        4. RETURN ONLY THE FULL CODE. No text.
        
        CURRENT GENOME:
        ${repoData.content}
        `;

        const aiReq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: curePrompt }]
            })
        });

        const aiData = await aiReq.json();
        let newCode = aiData.choices[0].message.content.replace(/```html/g, "").replace(/```/g, "");

        // 3. Apply Cure
        term.innerHTML += `<div style="color:cyan;">🧬 APPLYING PATCH...</div>`;
        await writeToGitHub(newCode, repoData.sha);

        term.innerHTML += `<div style="color:#00ff41;">✅ REGENERATION COMPLETE. Rebooting system...</div>`;
        
        // Reboot
        setTimeout(() => location.reload(), 4000);

    } catch (err) {
        term.innerHTML += `<div style="color:red;">☠ IMMUNE FAILURE: ${err.message}</div>`;
    }
}

// =========================================================================
// CORE 2: THE COMMAND CENTER (The UI)
// =========================================================================

window.addEventListener('load', () => {
    injectMultiverseInterface();
});

function injectMultiverseInterface() {
    const oldUI = document.getElementById('multiverse-core-ui');
    if(oldUI) oldUI.remove();

    const ui = document.createElement('div');
    ui.id = 'multiverse-core-ui';
    ui.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; height: 280px;
        background: rgba(5, 10, 5, 0.95); border-top: 2px solid #00ff41;
        color: #00ff41; font-family: 'Courier New', monospace; z-index: 99999;
        box-shadow: 0 -5px 30px rgba(0, 255, 65, 0.15); display: flex;
    `;

    ui.innerHTML = `
        <div style="width: 220px; border-right: 1px solid #00ff41; padding: 15px; font-size: 12px; background: #000500;">
            <div style="font-weight: bold; margin-bottom: 15px; font-size: 14px;">MULTIVERSE OS</div>
            <div style="color: #888; margin-bottom: 5px;">MANIFESTO V3.0</div>
            <div style="color: #00ff41; margin-bottom: 5px;">✓ Self-Healing: ON</div>
            <div style="color: #00ff41; margin-bottom: 5px;">✓ Auto-Code: ON</div>
            <div style="margin-bottom: 20px; color: #ffaa00;">STATUS: ORGANIC</div>
            
            <div style="border-top: 1px solid #333; padding-top: 10px;">
                <div style="margin-bottom: 5px;">MEMORY</div>
                <div style="font-size: 10px; color: #aaa;">
                - Scenario 1 Loaded<br>
                - P2P Tunnels Ready<br>
                - Omni-Core Active
                </div>
            </div>
        </div>
        <div style="flex-grow: 1; display: flex; flex-direction: column;">
            <div id="terminal-output" style="flex-grow: 1; padding: 15px; overflow-y: auto; font-size: 13px; line-height: 1.4;">
                <div>> System: Multiverse OS Manifesto Loaded.</div>
                <div>> System: Immune System (Scenario 1) is watching.</div>
                <div style="color:#00ff41;">> Multiverse: I am ready to evolve.</div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #00ff41; display: flex; align-items: center;">
                <span style="margin-right: 10px; color: #00ff41; font-weight: bold;">root@multiverse:~#</span>
                <input type="text" id="cmd-input" autocomplete="off"
                       style="flex-grow: 1; background: transparent; color: #fff; border: none; outline: none; font-family: monospace; font-size: 14px;">
            </div>
        </div>
    `;
    document.body.appendChild(ui);

    // Input Handler
    document.getElementById('cmd-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const val = e.target.value;
            e.target.value = '';
            executeCommand(val);
        }
    });
}

// =========================================================================
// CORE 3: THE BRAIN (Logic & Evolution)
// =========================================================================

async function executeCommand(input) {
    const term = document.getElementById('terminal-output');
    term.innerHTML += `<div><span style="color:#fff;">root@multiverse:~#</span> ${input}</div>`;

    try {
        // 1. SYSTEM CHECKS
        if (input.toLowerCase() === 'heal') {
             // Force a healing check
             triggerHealingProtocol("Manual check requested.");
             return;
        }

        // 2. EVOLUTION REQUESTS
        term.innerHTML += `<div style="color:yellow;">> AI: Processing evolution request...</div>`;
        
        const repoData = await readFromGitHub();
        
        const evolutionPrompt = `
        You are the Architect of Multiverse OS.
        The User (Mind) has requested: "${input}"
        
        CONTEXT:
        - We are a Self-Healing OS.
        - We support P2P, Video, and AI.
        - We maintain a Terminal UI at the bottom.
        
        TASK:
        1. Modify ${FILE_PATH} to fulfill the request.
        2. Ensure the "Immune System" script is preserved.
        3. Return ONLY the full code.
        `;

        const aiReq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: evolutionPrompt + "\n\nCODE:\n" + repoData.content }]
            })
        });

        const aiData = await aiReq.json();
        let newCode = aiData.choices[0].message.content.replace(/```html/g, "").replace(/```/g, "");

        term.innerHTML += `<div style="color:magenta;">> AI: Mutating Codebase...</div>`;
        await writeToGitHub(newCode, repoData.sha);

        term.innerHTML += `<div style="color:#00ff41;">> EVOLUTION SUCCESS. Deploying...</div>`;

    } catch (err) {
        term.innerHTML += `<div style="color:red;">> ERROR: ${err.message}</div>`;
    }
    term.scrollTop = term.scrollHeight;
}

// =========================================================================
// CORE 4: THE HANDS (GitHub Utilities)
// =========================================================================

async function readFromGitHub() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const res = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
    const data = await res.json();
    return { content: atob(data.content), sha: data.sha };
}

async function writeToGitHub(code, sha) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const body = {
        message: "Multiverse Manifesto: Evolution Update",
        content: btoa(unescape(encodeURIComponent(code))),
        sha: sha,
        branch: "main"
    };
    await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
