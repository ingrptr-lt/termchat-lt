// =========================================================================
//         MULTIVERSE OS: SIMPLE LINK
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', () => {
    createTerminal();
});

function createTerminal() {
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:200px; background:black; border-top:2px solid lime; color:lime; font-family:monospace; padding:10px; overflow-y:auto; z-index:9999;';
    ui.id = 'term';
    
    const input = document.createElement('input');
    input.style.cssText = 'width:100%; background:black; color:white; border:none; outline:none; margin-top:10px;';
    input.placeholder = "Type here...";
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const txt = e.target.value;
            e.target.value = '';
            await askAI(txt, ui);
        }
    });

    ui.appendChild(input);
    document.body.appendChild(ui);
}

async function askAI(message, ui) {
    ui.innerHTML += `<div>> YOU: ${message}</div>`;
    
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}` 
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                messages: [{ role: "user", content: message }]
            })
        });
        
        const data = await res.json();
        const reply = data.choices[0].message.content;
        
        ui.innerHTML += `<div style="color:cyan;">> AI: ${reply}</div>`;
        
    } catch (err) {
        ui.innerHTML += `<div style="color:red;">> ERROR: ${err.message}</div>`;
    }
}
