// =========================================================================
//         MULTIVERSE OS: FINAL WORKING TERMINAL
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    
    // 1. CREATE TERMINAL BOX
    const term = document.createElement('div');
    term.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:300px; background:black; border-top:5px solid lime; color:white; font-family:monospace; padding:20px; font-size:20px; z-index:99999;';
    
    // 2. CREATE INPUT BOX
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; background:black; color:white; border:none; outline:none; margin-top:20px; font-size:25px;';
    input.placeholder = "Talk to Multiverse AI...";
    
    // 3. THE "SUCCESS" LOGIC (From the Button)
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = e.target.value;
            e.target.value = ""; // Clear input
            
            term.innerHTML += `> YOU: ${txt}<br>`;
            
            try {
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
                
                term.innerHTML += `<span style="color:cyan">> AI: ${ans}</span><br><br>`;
                
            } catch (err) {
                term.innerHTML += `<span style="color:red">> ERROR: ${err.message}</span><br>`;
            }
            
            // Auto scroll to bottom
            term.scrollTop = term.scrollHeight;
        }
    });

    term.appendChild(input);
    document.body.appendChild(term);
});
