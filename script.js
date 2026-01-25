// =========================================================================
//         MULTIVERSE OS: SMART PARSER (FINDS TOKENS IN TEXT)
// =========================================================================

const GROQ_API_KEY = "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"; 
// We don't need the variable here anymore, we look for it dynamically.
const REPO_OWNER = "ingrptr-lt";

window.addEventListener('load', () => {
    if (document.getElementById('mv-parse-root')) document.getElementById('mv-parse-root').remove();
    buildParseSystem();
});

function buildParseSystem() {
    
    const root = document.createElement('div');
    root.id = 'mv-parse-root';
    root.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#050505; font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column; z-index:2147483647;';
    
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace;';
    header.innerText = "MULTIVERSE OS // SMART PARSER // PATTERN MATCHING";
    root.appendChild(header);
    
    const workspace = document.createElement('div');
    workspace.id = 'ai-zone';
    workspace.style.cssText = 'flex-grow:1; background:#0a0a0a; position:relative; overflow:hidden; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center;';
    workspace.innerHTML = '<h1 style="color:#fff;">SYSTEM ONLINE</h1><p style="color:#666;">Type: "Red", "Button", or "Create repo named Test"</p>';
    root.appendChild(workspace);
    
    const terminal = document.createElement('div');
    terminal.style.cssText = 'height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:16px; overflow-y:auto; flex-shrink:0; display:flex; flex-direction:column;';
    
    const log = document.createElement('div');
    log.style.cssText = 'flex-grow:1; overflow-y:auto;';
    log.innerHTML = '<div style="color:#fff;">> Parser Online.</div>';
    terminal.appendChild(log);
    
    const input = document.createElement('input');
    input.placeholder = "Command...";
    input.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:18px; border-top:1px solid #333; padding-top:10px;';
    
    // 5. SMART LOGIC
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if (!txt) return;
            input.value = "";
            
            addToLog(log, `> USER: ${txt}`, '#fff');
            
            try {
                const prompt = `
                You are a System Controller.
                User Request: "${txt}"
                
                Tasks:
                1. Change background colors (Red, Blue, Green).
                2. Add UI elements (Button, Text).
                3. Create GitHub Repos. 
                
                IMPORTANT: If creating a repo, respond with "GITHUB_TOKEN_IS [your_token_here]".
                Otherwise, just describe the action normally.
                `;
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: prompt }]
                    })
                });
                
                const json = await req.json();
                const reply = json.choices[0].message.content;
                
                addToLog(log, `> AI REPLY: ${reply}`, '#00ffff');
                
                // --- PATTERN MATCHER ---
                const replyLower = reply.toLowerCase();
                
                // 1. VISUALS
                if (replyLower.includes("red")) document.getElementById('ai-zone').style.background = "red";
                if (replyLower.includes("blue")) document.getElementById('ai-zone').style.background = "blue";
                if (replyLower.includes("green")) document.getElementById('ai-zone').style.background = "green";
                if (replyLower.includes("button")) {
                    const b = document.createElement('button'); b.innerText="AI BTN"; b.style.cssText="padding:10px; margin:5px;";
                    document.getElementById('ai-zone').appendChild(b);
                }
                if (replyLower.includes("text")) {
                    const t = document.createElement('h2'); t.innerText="Hello"; t.style.color="white";
                    document.getElementById('ai-zone').appendChild(t);
                }
                
                // 2. GITHUB TOKEN EXTRACTION
                // We look for the pattern "GITHUB_TOKEN_IS ..."
                const tokenMatch = reply.match(/GITHUB_TOKEN_IS\s+([a-zA-Z0-9_]+)/);
                if (tokenMatch) {
                    const token = tokenMatch[1];
                    addToLog(log, `> TOKEN FOUND: ${token}`, '#ffff00');
                    addToLog(log, `> UPDATING SCRIPT...`, '#00ff00');
                    
                    // UPDATE THE SCRIPT IN REAL-TIME
                    const currentScript = document.querySelector('script[src="script.js"]') || document.currentScript;
                    const newScriptContent = currentScript.textContent.replace(/const GITHUB_TOKEN = "[^"]*";/, `const GITHUB_TOKEN = "${token}";`);
                    
                    // We use a dirty eval here to update the memory variable for this session
                    // Note: It doesn't save to GitHub, but it works for now.
                    try {
                        eval(newScriptContent); 
                        addToLog(log, `> TOKEN UPDATED IN MEMORY.`, '#00ffff');
                    } catch(e) {
                        addToLog(log, `> UPDATE FAILED: ${e.message}`, 'red');
                    }
                }
                
            } catch (err) {
                addToLog(log, `> ERROR: ${err.message}`, '#ff3333');
            }
            
            log.scrollTop = log.scrollHeight;
        }
    });
    
    terminal.appendChild(input);
    root.appendChild(terminal);
    document.body.appendChild(root);
}

function addToLog(container, msg, color) {
    const d = document.createElement('div');
    d.style.color = color || '#00ff41';
    d.style.marginBottom = '5px';
    d.innerText = msg;
    container.appendChild(d);
}
