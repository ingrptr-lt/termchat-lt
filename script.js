// =========================================================================
//         MULTIVERSE OS: VISIBILITY TEST
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    
    // 1. CREATE A HUGE RED BOX
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:red; color:white; z-index:99999; padding:20px; font-size:30px;';
    ui.innerHTML = "SYSTEM ONLINE. TYPE BELOW:";
    
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; height:50px; font-size:30px;';
    
    // 2. LISTEN FOR ENTER KEY
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            ui.innerHTML += `<br><br>YOU SAID: ${e.target.value}`;
            
            // 3. CALL AI
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama3-70b-8192",
                        messages: [{ role: "user", content: e.target.value }]
                    })
                });
                const data = await res.json();
                ui.innerHTML += `<br>AI SAYS: ${data.choices[0].message.content}`;
                e.target.value = "";
            } catch (err) {
                ui.innerHTML += `<br>ERROR: ${err.message}`;
            }
        }
    });

    ui.appendChild(input);
    document.body.appendChild(ui);
});
