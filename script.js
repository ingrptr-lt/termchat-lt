// =========================================================================
//         MULTIVERSE OS: MASTER ARCHITECT (ALL SYSTEMS)
// =========================================================================

// CONFIGURATION
const GROQ_API_KEY = "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"; 
const GITHUB_TOKEN = "ghp_YOUR_GITHUB_PAT_HERE"; 
const REPO_OWNER = "ingrptr-lt";

window.addEventListener('load', () => {
    if (document.getElementById('mv-master-root')) document.getElementById('mv-master-root').remove();
    buildMasterSystem();
});

function buildMasterSystem() {
    
    // 1. ROOT
    const root = document.createElement('div');
    root.id = 'mv-master-root';
    root.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#050505; font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column; z-index:2147483647;';
    
    // 2. HEADER
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace;';
    header.innerText = "MULTIVERSE OS // MASTER ARCHITECT // FULLY OPERATIONAL";
    root.appendChild(header);
    
    // 3. WORKSPACE
    const workspace = document.createElement('div');
    workspace.id = 'ai-zone';
    workspace.style.cssText = 'flex-grow:1; background:#0a0a0a; position:relative; overflow:hidden; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center;';
    workspace.innerHTML = '<h1 style="color:#fff;">SYSTEM ONLINE</h1><p style="color:#666;">Visuals: Red/Blue/Green/Button.  Architect: "Create site X"</p>';
    root.appendChild(workspace);
    
    // 4. TERMINAL
    const terminal = document.createElement('div');
    terminal.style.cssText = 'height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:16px; overflow-y:auto; flex-shrink:0; display:flex; flex-direction:column;';
    
    const log = document.createElement('div');
    log.style.cssText = 'flex-grow:1; overflow-y:auto;';
    log.innerHTML = '<div style="color:#fff;">> Master System Online.</div>';
    terminal.appendChild(log);
    
    const input = document.createElement('input');
    input.placeholder = "Command...";
    input.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:18px; border-top:1px solid #333; padding-top:10px;';
    
    // 5. MASTER LOGIC
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = input.value.trim();
            if (!txt) return;
            input.value = "";
            
            addToLog(log, `> USER: ${txt}`, '#fff');
            
            try {
                // PROMPT FOR AI
                const prompt = `
                You are a System Controller. 
                Tools Available:
                - "SET_COLOR_RED", "SET_COLOR_BLUE", "SET_COLOR_GREEN"
                - "ADD_BUTTON", "ADD_TEXT"
                - "USE_GITHUB_TOOL [name]": Creates a GitHub repo named [name].
                
                User Request: "${txt}"
                Respond with ONLY the tool name.
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
                const aiReply = json.choices[0].message.content.toUpperCase().trim();
                
                addToLog(log, `> AI DECISION: ${aiReply}`, '#00ffff');
                
                // --- EXECUTE VISUALS ---
                if (aiReply.includes("RED")) document.getElementById('ai-zone').style.background = "red";
                if (aiReply.includes("BLUE")) document.getElementById('ai-zone').style.background = "blue";
                if (aiReply.includes("GREEN")) document.getElementById('ai-zone').style.background = "green";
                if (aiReply.includes("BUTTON")) {
                    const b = document.createElement('button'); b.innerText="AI BTN"; b.style.cssText="padding:10px; font-size:16px;";
                    document.getElementById('ai-zone').appendChild(b);
                }
                if (aiReply.includes("TEXT")) {
                    const t = document.createElement('h2'); t.innerText="Hello"; t.style.color="white";
                    document.getElementById('ai-zone').appendChild(t);
                }
                
                // --- EXECUTE GITHUB ---
                if (aiReply.includes("USE_GITHUB_TOOL")) {
                    const parts = aiReply.split(" ");
                    const repoName = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, "");
                    
                    if (repoName) await createGithubRepo(repoName, log);
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

// --- GITHUB FUNCTION ---
async function createGithubRepo(repoName, log) {
    // 1. CHECK TOKEN
    if (GITHUB_TOKEN === "ghp_YOUR_GITHUB_PAT_HERE") {
        addToLog(log, "> ERROR: GitHub Token Missing.", 'red');
        addToLog(log, "> ACTION: Please generate a token in GitHub Settings (Developer Settings > Tokens) and update script.js.", 'yellow');
        return;
    }

    try {
        addToLog(log, `> GITHUB: Creating Repo: ${repoName}...`, '#00ff00');
        
        const res = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name: repoName,
                description: "Auto-generated by Multiverse OS",
                private: false,
                auto_init: true
            })
        });
        
        if (!res.ok) throw new Error("API Failure");
        
        addToLog(log, `> SUCCESS: https://github.com/${REPO_OWNER}/${repoName}`, '#00ffff');
        
    } catch (err) {
        addToLog(log, `> GITHUB ERROR: ${err.message}`, '#ff3333');
    }
}

function addToLog(container, msg, color) {
    const d = document.createElement('div');
    d.style.color = color || '#00ff41';
    d.style.marginBottom = '5px';
    d.innerText = msg;
    container.appendChild(d);
}
