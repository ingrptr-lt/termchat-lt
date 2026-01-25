// =========================================================================
//         MULTIVERSE OS: WORKING AI LINK
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    alert("MULTIVERSE OS LOADED"); // Just to confirm
    
    // 1. Create Terminal
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:250px; background:black; border-top:2px solid lime; color:lime; font-family:monospace; z-index:9999; padding:10px;';
    ui.innerHTML = `SYSTEM ONLINE<br>`;
    
    // 2. Create Input
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; background:black; color:white; border:none; outline:none; margin-top:10px; font-size:20px;';
    input.placeholder = "Type here...";
    
    // 3. Listen for Enter
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const msg = e.target.value;
            ui.innerHTML += `<br>> YOU: ${msg}`;
            e.target.value = "";
            
            // 4. Call AI (Safe Mode)
            ui.innerHTML += `<br>> AI: Thinking...`;
            
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GROQ_API_KEY}` 
                    },
                    body: JSON.stringify({
                        model: "llama3-70b-8192",
                        messages: [{ role: "user", content: msg }]
                    })
                });
                
                const data = await res.json();
                const reply = data.choices[0].message.content;
                
                ui.innerHTML += `<br>> AI: ${reply}`;
                
            } catch (err) {
                ui.innerHTML += `<br>> ERROR: ${err.message}`;
            }
        }
    });

    ui.appendChild(input);
    document.body.appendChild(ui);
});
