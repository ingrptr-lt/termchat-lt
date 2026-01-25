// =========================================================================
//         MULTIVERSE OS: SYSTEM CANVAS (COMPLETE)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    if (document.getElementById('mv-master-root')) document.getElementById('mv-master-root').remove();
    buildMasterSystem();
});

function buildMasterSystem() {
    
    // 1. ROOT CONTAINER
    const root = document.createElement('div');
    root.id = 'mv-master-root';
    root.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#050505; font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column; z-index:2147483647;';
    
    // 2. HEADER
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace; flex-shrink:0;';
    header.innerText = "MULTIVERSE OS // SYSTEM CANVAS // ACTIVE";
    root.appendChild(header);
    
    // 3. WORKSPACE (THE AI ZONE)
    const workspace = document.createElement('div');
    workspace.id = 'ai-zone'; // AI TARGETS THIS ID
    workspace.style.cssText = 'flex-grow:1; background:#0a0a0a; position:relative; overflow:hidden; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center;';
    workspace.innerHTML = '<h1 style="color:#fff;">SYSTEM READY</h1><p style="color:#666;">Type "Change background to blue" or "Add a red button" below.</p>';
    root.appendChild(workspace);
    
    // 4. TERMINAL
    const terminal = document.createElement('div');
    terminal.style.cssText = 'height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:16px; overflow-y:auto; flex-shrink:0; display:flex; flex-direction:column;';
    
    const log = document.createElement('div');
    log.style.cssText = 'flex-grow:1; overflow-y:auto;';
    log.innerHTML = '<div style="color:#fff;">> System Canvas Active.</div>';
    terminal.appendChild(log);
    
    const input = document.createElement('input');
    input.placeholder = "System Command...";
    input.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:18px; border-top:1px solid #333; padding-top:10px;';
    
    // 5. EVENT LOOP (CANVAS LOGIC)
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if (!txt) return;
            input.value = "";
            
            addToLog(log, `> ROOT: ${txt}`, '#fff');
            
            try {
                addToLog(log, "> NEURAL NET: Processing...", '#00ff41');
                
                // SYSTEM PROMPT: TELL AI IT CAN EDIT THE ZONE
                const sysPrompt = `
                You are a Front-end Engineer. 
                You control the element with id="ai-zone".
                If the user asks to "change color", "add button", or "modify text", 
                generate ONLY the innerHTML code for that element.
                Do not output backticks or explanations.
                `;
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { role: "system", content: sysPrompt },
                            { role: "user", content: txt }
                        ]
                    })
                });
                
                if (!req.ok) throw new Error("API Fail");
                
                const json = await req.json();
                const code = json.choices[0].message.content;
                
                // INJECT CODE INTO ZONE
                // We clean markdown ticks if present
                const cleanCode = code.replace(/```html/g, "").replace(/```/g, "");
                document.getElementById('ai-zone').innerHTML = cleanCode;
                
                addToLog(log, `> SYSTEM: Interface Updated.`, '#00ffff');
                
            } catch (err) {
                addToLog(log, `> FAILURE: ${err.message}`, '#ff3333');
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
