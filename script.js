// =========================================================================
//         MULTIVERSE OS: FIXED DATA READER
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    const btn = document.createElement('button');
    btn.innerText = "CLICK TO CALL AI";
    btn.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); font-size:30px; padding:20px; z-index:99999;';
    
    btn.onclick = async () => {
        btn.innerText = "CALLING...";
        
        try {
            const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [{ role: "user", content: "Say hello" }]
                })
            });
            
            const json = await req.json();
            
            // --- THE FIX ---
            // Check if 'choices' exists before trying to read it
            let reply = "No choices found.";
            if (json.choices && json.choices[0]) {
                reply = json.choices[0].message.content;
            } else if (json.error) {
                reply = "API ERROR: " + json.error.message;
            } else {
                reply = "Unknown Response: " + JSON.stringify(json);
            }
            // -----------------
            
            alert("AI SAYS: " + reply);
            
        } catch (err) {
            alert("FAILED: " + err.message);
        }
    };
    
    document.body.appendChild(btn);
});
