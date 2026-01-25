// =========================================================================
//         MULTIVERSE OS: SAFE ADMIN (NO CRASHES)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    buildSystem();
});

function buildSystem() {
    
    // 1. STYLES
    document.body.style.margin = "0";
    document.body.style.background = "#050505";
    document.body.style.fontFamily = "sans-serif";
    document.body.style.overflow = "hidden";

    // 2. LAYOUT
    const container = document.createElement('div');
    container.style.cssText = 'display:flex; flex-direction:column; height:100vh;';
    
    // HEADER
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace;';
    header.innerText = "MULTIVERSE OS // SAFE MODE";
    
    // CANVAS (Center)
    const canvas = document.createElement('div');
    canvas.id = 'mv-canvas';
    canvas.style.cssText = 'flex-grow:1; background:#0a0a0a; display:flex; align-items:center; justify-content:center; color:#fff;';
    canvas.innerHTML = '<h1>SYSTEM READY</h1><p>Type commands below.</p>';
    
    // TERMINAL (Bottom)
    const term = document.createElement('div');
    term.style.cssText = 'height:250px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:16px; overflow-y:auto;';
    
    // INPUT
    const inp = document.createElement('input');
    inp.placeholder = "Command...";
    inp.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:18px; border-top:1px solid #333; padding-top:10px;';
    
    inp.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = inp.value.trim();
            if (!txt) return;
            inp.value = "";
            
            // USER MSG
            term.innerHTML += `<div style="color:#fff; margin-bottom:5px;">> YOU: ${txt}</div>`;
            
            try {
                term.innerHTML += `<div style="color:#00ff41; margin-bottom:5px;">> AI: Thinking...</div>`;
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { role: "system", content: "You are a helpful Multiverse OS Administrator. Keep answers short and professional." },
                            { role: "user", content: txt }
                        ]
                    })
                });
                
                const json = await req.json();
                const ans = json.choices[0].message.content;
                
                // AI RESPONSE
                term.innerHTML += `<div style="color:#00ffff; margin-bottom:5px;">> AI: ${ans}</div>`;
                
            } catch (err) {
                term.innerHTML += `<div style="color:#ff3333; margin-bottom:5px;">> ERROR: ${err.message}</div>`;
            }
            
            term.scrollTop = term.scrollHeight;
        }
    });
    
    term.appendChild(inp);
    
    // ASSEMBLE
    container.appendChild(header);
    container.appendChild(canvas);
    container.appendChild(term);
    document.body.appendChild(container);
}
