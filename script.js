// =========================================================================
//         MULTIVERSE OS: WORKING LINK (FINAL)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    // 1. CREATE TERMINAL
    const term = document.createElement('div');
    term.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:300px; background:black; border-top:5px solid lime; color:white; font-family:monospace; padding:20px; font-size:20px;';
    
    // 2. CREATE INPUT
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; background:black; color:white; border:none; outline:none; margin-top:20px; font-size:25px;';
    input.placeholder = "Talk to AI...";
    
    // 3. LISTEN FOR ENTER
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = e.target.value;
            e.target.value = "";
            
            term.innerHTML += `> YOU: ${txt}<br>`;
            
            try {
                // 4. CALL AI WITH THE CORRECT MODEL
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant", // THE CORRECT MODEL!
                        messages: [{ role: "user", content: txt }]
                    })
                });
                
                const json = await req.json();
                const ans = json.choices[0].message.content;
                
                term.innerHTML += `<span style="color:cyan">> AI: ${ans}</span><br><br>`;
                
            } catch (err) {
                term.innerHTML += `<span style="color:red">> ERROR: ${err.message}</span><br>`;
            }
        }
    });

    term.appendChild(input);
    document.body.appendChild(term);
});
