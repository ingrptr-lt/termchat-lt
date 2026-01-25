// =========================================================================
//         NETWORK MONITOR (TELLS US EXACTLY WHAT HAPPENS)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    
    // 1. CREATE STATUS BOX
    const status = document.createElement('div');
    status.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:200px; background:#333; color:white; font-family:monospace; padding:20px; z-index:99999; overflow-y:auto;';
    status.innerHTML = "NETWORK MONITOR: IDLE...";
    
    // 2. CREATE BUTTON
    const btn = document.createElement('button');
    btn.innerText = "TEST CONNECTION";
    btn.style.cssText = 'margin-top:20px; padding:20px; font-size:20px;';
    
    btn.onclick = async () => {
        status.innerHTML += "<br>>> SENDING REQUEST TO GROQ...";
        
        try {
            const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: "Hi" }]
                })
            });
            
            status.innerHTML += "<br>>> SERVER REPLIED! STATUS CODE: " + req.status;
            
            if (req.ok) {
                const json = await req.json();
                status.innerHTML += "<br>>> SUCCESS! AI SAYS: " + json.choices[0].message.content;
            } else {
                status.innerHTML += "<br>>> SERVER ERROR: " + await req.text();
            }
            
        } catch (err) {
            status.innerHTML += "<br>>> CRASH: " + err.message;
        }
    };
    
    status.appendChild(btn);
    document.body.appendChild(status);
});
