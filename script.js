// =========================================================================
//         MULTIVERSE OS: COMPLETE SYSTEM (NO MORE DEBUGGING)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    buildCompleteSystem();
});

function buildCompleteSystem() {
    
    // 1. FORCE STYLE (Remove existing styles to avoid conflicts)
    document.body.style.margin = "0";
    document.body.style.background = "#050505";
    document.body.style.fontFamily = "sans-serif";
    document.body.style.overflow = "hidden"; // Stop scrolling

    // 2. BUILD DASHBOARD (The Top Part)
    const dash = document.createElement('div');
    dash.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:calc(100% - 300px); background:#050505; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:1;';
    
    // Grid Effect
    const grid = document.createElement('div');
    grid.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background-image:radial-gradient(#111 1px, transparent 1px); background-size:30px 30px; opacity:0.2; pointer-events:none;';
    
    // Header
    const h1 = document.createElement('h1');
    h1.innerText = "MULTIVERSE OS";
    h1.style.cssText = 'color:#00ff41; text-transform:uppercase; letter-spacing:5px; margin:0; z-index:2; text-align:center;';
    
    const p = document.createElement('p');
    p.innerText = "TermChat LT // Neural Link Active // Stable";
    p.style.cssText = 'color:#666; z-index:2; text-align:center;';

    // Status Panels
    const panelCont = document.createElement('div');
    panelCont.style.cssText = 'display:flex; gap:20px; margin-top:20px; z-index:2;';
    
    const makePanel = (title, val, sub) => {
        const d = document.createElement('div');
        d.style.cssText = 'background:#0a0a0a; border:1px solid #333; padding:20px; width:200px; border-radius:5px; text-align:center;';
        d.innerHTML = `<div style="color:#00ff41; font-size:12px;">${title}</div><div style="font-size:24px; font-weight:bold; color:#fff;">${val}</div><div style="font-size:12px; color:#666;">${sub}</div>`;
        return d;
    };
    
    panelCont.appendChild(makePanel("NETWORK", "ONLINE", "Latency 24ms"));
    panelCont.appendChild(makePanel("AI MODEL", "LLAMA 3.1", "8B Instant"));
    panelCont.appendChild(makePanel("SYSTEM", "STABLE", "v1.0"));

    dash.appendChild(grid);
    dash.appendChild(h1);
    dash.appendChild(p);
    dash.appendChild(panelCont);
    document.body.appendChild(dash);

    // 3. BUILD TERMINAL (The Bottom Part)
    const term = document.createElement('div');
    term.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:300px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:18px; z-index:9999; box-shadow:0 -5px 30px rgba(0,255,65,0.2); display:flex; flex-direction:column;';
    
    // Term Header
    const th = document.createElement('div');
    th.innerHTML = '<span style="color:#fff; font-weight:bold;">MULTIVERSE TERMINAL</span> <span style="font-size:12px; color:#888;">// CONNECTED</span>';
    th.style.marginBottom = '10px';
    term.appendChild(th);
    
    // Term Log
    const log = document.createElement('div');
    log.id = 'mv-log';
    log.style.cssText = 'flex-grow:1; overflow-y:auto; margin-bottom:10px;';
    log.innerHTML = '<div style="color:#fff;">> System Ready.</div>';
    term.appendChild(log);
    
    // Term Input
    const inp = document.createElement('input');
    inp.placeholder = "Type command here...";
    inp.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:20px; border-top:1px solid #333; padding-top:10px;';
    
    inp.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = inp.value.trim();
            if (!txt) return;
            inp.value = "";
            
            // Log User Msg
            const msgDiv = document.createElement('div');
            msgDiv.style.color = '#fff';
            msgDiv.innerText = `> YOU: ${txt}`;
            log.appendChild(msgDiv);
            
            try {
                // AI Process
                const loadingDiv = document.createElement('div');
                loadingDiv.style.color = '#00ff41';
                loadingDiv.innerText = `> PROCESSING...`;
                log.appendChild(loadingDiv);
                log.scrollTop = log.scrollHeight;

                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: txt }]
                    })
                });
                
                const json = await req.json();
                const ans = json.choices[0].message.content;
                
                // Remove Loading, Add Response
                loadingDiv.remove();
                const resDiv = document.createElement('div');
                resDiv.style.color = '#00ffff';
                resDiv.innerText = `> AI: ${ans}`;
                log.appendChild(resDiv);
                
            } catch (err) {
                const errDiv = document.createElement('div');
                errDiv.style.color = '#ff3333';
                errDiv.innerText = `> ERROR: ${err.message}`;
                log.appendChild(errDiv);
            }
            
            log.scrollTop = log.scrollHeight;
        }
    });
    
    term.appendChild(inp);
    document.body.appendChild(term);
}
