// =========================================================================
//         MULTIVERSE OS: BASE MODEL TEST
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
                    // USING THE SHORT MODEL NAME
                    model: "llama3-8b",
                    messages: [{ role: "user", content: "Say hello" }]
                })
            });
            
            const json = await req.json();
            
            let reply = "Error";
            if (json.choices && json.choices[0]) {
                reply = json.choices[0].message.content;
            } else if (json.error) {
                reply = "API Error: " + json.error.message;
            }
            
            alert("AI SAYS: " + reply);
            
        } catch (err) {
            alert("FAILED: " + err.message);
        }
    };
    
    document.body.appendChild(btn);
});
