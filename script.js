// =========================================================================
//         MANUAL BUTTON TEST
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    // 1. CREATE A BIG BUTTON
    const btn = document.createElement('button');
    btn.innerText = "CLICK TO CALL AI";
    btn.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); font-size:30px; padding:20px; z-index:99999;';
    
    // 2. CLICK ACTION
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
            const ans = json.choices[0].message.content;
            
            alert("AI SAYS: " + ans);
            
        } catch (err) {
            alert("FAILED: " + err.message);
        }
    };
    
    document.body.appendChild(btn);
});
