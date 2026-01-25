// =========================================================================
//         MULTIVERSE OS: MASTER BUILD (SELF-HEALING)
// =========================================================================

// CONFIGURATION
const GROQ_API_KEY = "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"; 

// 1. FORCE UNLOAD
// We ensure no old listeners or styles remain by clearing specific IDs if they exist
window.addEventListener('load', () => {
    if (document.getElementById('mv-master-root')) document.getElementById('mv-master-root').remove();
    buildMasterSystem();
});

function buildMasterSystem() {
    
    // 2. ROOT CONTAINER
    const root = document.createElement('div');
    root.id = 'mv-master-root';
    root.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#050505; font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column; z-index:2147483647;';
    
    // 3. HEADER
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace; flex-shrink:0;';
    header.innerText = "MULTIVERSE OS // MASTER BUILD // GROQ LINK: PENDING";
    root.appendChild(header);
    
    // 4. WORKSPACE (CANVAS)
    const workspace = document.createElement('div');
    workspace.style.cssText = 'flex-grow:1; background:#0a0a0a; position:relative; overflow:hidden;';
    workspace.innerHTML = '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;"><h2 style="color:#fff;">SYSTEM INITIALIZING...</h2><p style="color:#666;">Establishing Neural Handshake.</p></div>';
    root.appendChild(workspace);
    
    // 5. TERMINAL
    const terminal = document.createElement('div');
    terminal.style.cssText = 'height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:16px; overflow-y:auto; flex-shrink:0; display:flex; flex-direction:column;';
    
    const log = document.createElement('div');
    log.style.cssText = 'flex-grow:1; overflow-y:auto;';
    log.innerHTML = '<div style="color:#fff;">> Master Build Loaded.</div>';
    terminal.appendChild(log);
    
    const input = document.createElement('input');
    input.placeholder = "System Command...";
    input.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:18px; border-top:1px solid #333; padding-top:10px;';
    
    // 6. EVENT LOOP
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if (!txt) return;
            input.value = "";
            
            // Log Command
            addToLog(log, `> ROOT: ${txt}`, '#fff');
            
            // Process
            try {
                addToLog(log, "> PROCESSING...", '#00ff41');
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: txt }]
                    })
                });
                
                if (!req.ok) {
                    throw new Error(`HTTP ${req.status}: ${req.statusText}`);
                }
                
                const json = await req.json();
                const reply = json.choices[0].message.content;
                
                // Update Workspace Visual
                workspace.innerHTML = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color:#fff;"><h2>SYSTEM ONLINE</h2><p>${reply}</p></div>`;
                
                // Update Terminal
                addToLog(log, `> AI: ${reply}`, '#00ffff');
                header.innerText = "MULTIVERSE OS // MASTER BUILD // GROQ LINK: ACTIVE";
                
            } catch (err) {
                addToLog(log, `> FAILURE: ${err.message}`, '#ff3333');
                header.innerText = "MULTIVERSE OS // MASTER BUILD // GROQ LINK: FAILED";
            }
            
            log.scrollTop = log.scrollHeight;
        }
    });
    
    terminal.appendChild(input);
    root.appendChild(terminal);
    document.body.appendChild(root);
}

// UTILITY
function addToLog(container, msg, color) {
    const d = document.createElement('div');
    d.style.color = color || '#00ff41';
    d.style.marginBottom = '5px';
    d.innerText = msg;
    container.appendChild(d);
}
