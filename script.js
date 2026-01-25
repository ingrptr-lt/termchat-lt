// =========================================================================
//         MULTIVERSE OS: PREPARED SCRIPT (SYSTEM MODE)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    buildCompleteSystem();
});

function buildCompleteSystem() {
    
    // 1. FORCE STYLES
    document.body.style.margin = "0";
    document.body.style.background = "#050505";
    document.body.style.fontFamily = "sans-serif";
    document.body.style.overflow = "hidden";

    // 2. DASHBOARD (TOP)
    const dash = document.createElement('div');
    dash.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:calc(100% - 300px); background:#050505; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1;';
    
    const grid = document.createElement('div');
    grid.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background-image:radial-gradient(#111 1px, transparent 1px); background-size:30px 30px; opacity:0.2; pointer-events:none;';
    
    const h1 = document.createElement('h1');
    h1.innerText = "MULTIVERSE OS";
    h1.style.cssText = 'color:#00ff41; text-transform:uppercase; letter-spacing:5px; margin:0; z-index:2; text-align:center;';
    
    const p = document.createElement('p');
    p.innerText = "TermChat LT // Neural Link Active // System Mode";
    p.style.cssText = 'color:#666; z-index:2; text-align:center;';

    const panelCont = document.createElement('div');
    panelCont.style.cssText = 'display:flex; gap:20px; margin-top:20px; z-index:2;';
    
    const makePanel = (title, val, sub) => {
        const d = document.createElement('div');
        d.style.cssText = 'background:#0a0a0a; border:1px solid #333; padding:20px; width:200px; border-radius:5px; text-align:center;';
        d.innerHTML = `<div style="color:#00ff41; font-size:12px;">${title}</div><div style="font-size:24px; font-weight:bold; color:#fff;">${val}</div><div style="font-size:12px; color:#666;">${sub}</div>`;
        return d;
    };
    
    panelCont.appendChild(makePanel("NETWORK", "ONLINE", "Secure"));
    panelCont.appendChild(makePanel("AI CORE", "SYS ADMIN", "Active"));
    panelCont.appendChild(makePanel("STATUS", "OPTIMAL", "v2.0"));

    dash.appendChild(grid);
    dash.appendChild(h1);
    dash.appendChild(p);
    dash.appendChild(panelCont);
    document.body.appendChild(dash);

    // 3. TERMINAL (BOTTOM)
    const term = document.createElement('div');
    term.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:18px; z-index:9999; box-shadow:0 -5px 30px rgba(0,255,65,0.2); display:flex; flex-direction:column;';
    
    const th = document.createElement('div');
    th.innerHTML = '<span style="color:#fff; font-weight:bold;">MULTIVERSE TERMINAL</span> <span style="font-size:12px; color:#888;">// SYSTEM MODE ENABLED</span>';
    th.style.marginBottom = '10px';
    term.appendChild(th);
    
    const log = document.createElement('div');
    log.id = 'mv-log';
    log.style.cssText = 'flex-grow:1; overflow-y:auto; margin-bottom:10px;';
    log.innerHTML = '<div style="color:#fff;">> System Administrator Online.</div>';
    term.appendChild(log);
    
    const inp = document.createElement('input');
    inp.placeholder = "Enter command...";
    inp.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:20px; border-top:1px solid #333; padding-top:10px;';
    
    // 4. SYSTEM LOGIC (ADMIN PERSONALITY)
    inp.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = inp.value.trim();
            if (!txt) return;
            inp.value = "";
            
            const msgDiv = document.createElement('div');
            msgDiv.style.color = '#fff';
            msgDiv.innerText = `> ROOT: ${txt}`;
            log.appendChild(msgDiv);
            
            try {
                const loadDiv = document.createElement('div');
                loadDiv.style.color = '#00ff41';
                loadDiv.innerText = `> ADMIN: Processing...`;
                log.appendChild(loadDiv);
                log.scrollTop = log.scrollHeight;

                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { 
                                role: "system", 
                                content: "You are the Multiverse OS Administrator. You are technical, concise, and powerful. You control the interface. Respond briefly. If asked to change UI, reply with valid CSS/HTML code." 
                            },
                            { role: "user", content: txt }
                        ]
                    })
                });
                
                const json = await req.json();
                const ans = json.choices[0].message.content;
                
                loadDiv.remove();
                const resDiv = document.createElement('div');
                resDiv.style.color = '#00ffff';
                resDiv.innerText = `> ADMIN: ${ans}`;
                log.appendChild(resDiv);
                
            } catch (err) {
                log.innerHTML += `<div style="color:#ff3333;">> SYS ERR: ${err.message}</div>`;
            }
            
            log.scrollTop = log.scrollHeight;
        }
    });
    
    term.appendChild(inp);
    document.body.appendChild(term);
}
