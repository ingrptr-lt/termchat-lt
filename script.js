// =========================================================================
//         MULTIVERSE OS: SYSTEM CANVAS (AI CAN EDIT THIS)
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

    // 2. HEADER (STATUS INFO)
    const header = document.createElement('div');
    header.style.cssText = 'height:60px; background:#000; border-bottom:1px solid #333; display:flex; align-items:center; padding:0 20px; color:#00ff41; font-family:monospace; z-index:2;';
    header.innerHTML = '<span>MULTIVERSE OS // SYSTEM CANVAS ACTIVE</span>';
    document.body.appendChild(header);

    // 3. SYSTEM CANVAS (THE PART AI CAN EDIT)
    const canvas = document.createElement('div');
    canvas.id = 'sys-canvas'; // AI targets this ID
    canvas.style.cssText = 'flex-grow:1; background:#050505; position:relative; overflow:hidden; padding:20px; display:flex; align-items:center; justify-content:center;';
    
    // Default Content
    canvas.innerHTML = `
        <h1 id="main-title" style="color:#fff;">SYSTEM READY</h1>
        <p style="color:#666;">Type "Change background to blue" or "Add a red button" below.</p>
        <div id="ai-buttons"></div>
    `;
    document.body.appendChild(canvas);

    // 4. TERMINAL (BOTTOM)
    const term = document.createElement('div');
    term.style.cssText = 'height:250px; background:#000505; border-top:4px solid #00ff41; color:#00ff41; font-family:"Courier New", monospace; padding:20px; font-size:18px; z-index:9999; display:flex; flex-direction:column;';
    
    const th = document.createElement('div');
    th.innerHTML = '<span style="color:#fff; font-weight:bold;">ADMIN CONSOLE</span>';
    th.style.marginBottom = '10px';
    term.appendChild(th);
    
    const log = document.createElement('div');
    log.style.cssText = 'flex-grow:1; overflow-y:auto; margin-bottom:10px;';
    log.innerHTML = '<div style="color:#fff;">> Admin: Online.</div>';
    term.appendChild(log);
    
    const inp = document.createElement('input');
    inp.placeholder = "Command...";
    inp.style.cssText = 'width:100%; background:transparent; color:#fff; border:none; outline:none; font-family:"Courier New", monospace; font-size:20px; border-top:1px solid #333; padding-top:10px;';
    
    inp.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = inp.value.trim();
            if (!txt) return;
            inp.value = "";
            
            log.innerHTML += `<div style="color:#fff;">> User: ${txt}</div>`;
            
            try {
                log.innerHTML += `<div style="color:#00ff41;">> Admin: Executing...</div>`;
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { 
                                role: "system", 
                                content: `You are the Multiverse OS Web Developer. 
                                You have FULL CONTROL of the DOM element with id 'sys-canvas'.
                                You can change the innerHTML, background, or style of #sys-canvas.
                                
                                INSTRUCTIONS:
                                1. Analyze user request: "${txt}"
                                2. If the request implies a UI change (color, add button, text), generate valid HTML/CSS/JS.
                                3. Return ONLY the JavaScript code to modify 'sys-canvas'. 
                                4. Do NOT use backticks (\`\`\`).
                                
                                Example:
                                User: Make text red.
                                Output: document.getElementById('sys-canvas').style.background = 'red';
                                
                                User: Say Hello.
                                Output: document.getElementById('sys-canvas').innerHTML = '<h1 style="color:white">HELLO</h1>';
                                ` 
                            },
                            { role: "user", content: txt }
                        ]
                    })
                });
                
                const json = await req.json();
                const code = json.choices[0].message.content;
                
                // 5. EXECUTE THE CODE
                try {
                    eval(code); // Run the JS from AI
                    log.innerHTML += `<div style="color:#00ffff;">> Admin: Executed successfully.</div>`;
                } catch (err) {
                    log.innerHTML += `<div style="color:#ff3333;">> Runtime Error: ${err.message}</div>`;
                }
                
            } catch (err) {
                log.innerHTML += `<div style="color:#ff3333;">> Connection Error: ${err.message}</div>`;
            }
            
            log.scrollTop = log.scrollHeight;
        }
    });
    
    term.appendChild(inp);
    document.body.appendChild(term);
}
