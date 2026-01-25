// =========================================================================
//         MULTIVERSE OS: DEBUG MODE (LOUD ERRORS)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    alert("DEBUG MODE STARTED");
    
    const term = document.createElement('div');
    term.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:300px; background:black; border-top:5px solid lime; color:white; font-family:monospace; padding:20px; font-size:20px;';
    
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; background:black; color:white; border:none; outline:none; margin-top:20px; font-size:25px;';
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = e.target.value;
            e.target.value = ""; 
            
            term.innerHTML += `> ME: ${txt}<br>`;
            
            try {
                term.innerHTML += `> CONNECTING...<br>`;
                
                const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                    body: JSON.stringify({
                        model: "llama3-70b-8192",
                        messages: [{ role: "user", content: txt }]
                    })
                });
                
                // CHECK STATUS CODE
                if (!req.ok) {
                    throw new Error(`API ERROR: ${req.status}`);
                }
                
                const json = await req.json();
                const ans = json.choices[0].message.content;
                
                term.innerHTML += `<span style="color:cyan">> AI: ${ans}</span><br><br>`;
                
            } catch (err) {
                // MAKE THE ERROR HUGE AND RED
                const errBox = document.createElement('div');
                errBox.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:red; color:white; padding:20px; z-index:99999; border:5px solid white; font-size:30px;';
                errBox.innerHTML = `ERROR: ${err.message}`;
                document.body.appendChild(errBox);
            }
        }
    });

    term.appendChild(input);
    document.body.appendChild(term);
});
