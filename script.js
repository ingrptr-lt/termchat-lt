// =========================================================================
//         MULTIVERSE OS: HYBRID CLONE (ROBUST BUILDER)
// =========================================================================

// --- 1. CONFIG ---
let GROQ_API_KEY = ""; // Load this from Config
let USE_LOCAL_AI = false; // Or set to true via command

// --- 2. STATE ---
let username = 'Operator';
let userStats = { level: 1, xp: 0, avatar: '>_<' };
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard'];

// --- 3. UTILS ---
function safeExec(code) {
    try {
        // Create a function from the string and run it
        // Note: "new Function" creates a function in the global scope
        const func = new Function(code);
        func();
        addSystemMessage("EXECUTION SUCCESS", '#00ff00');
    } catch (err) {
        addSystemMessage("EXECUTION ERROR: " + err.message, '#ff0000');
        console.error(err);
    }
}

// --- 4. UI ---
window.addEventListener('load', () => {
    addSystemMessage("SYSTEM ONLINE", '#00ff00');
});

function addSystemMessage(msg, color) {
    const container = document.getElementById('terminal-content');
    if(container) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.color = color || '#00ff00';
        div.style.fontFamily = 'monospace';
        div.innerText = `[SYSTEM]: ${msg}`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

function addUserMessage(msg) {
    const container = document.getElementById('terminal-content');
    if(container) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.color = '#fff';
        div.innerHTML = `<span style="opacity:0.5">[${new Date().toLocaleTimeString()}]</span> <strong>@${username}:</strong> ${msg}`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

// --- 5. THE CLONE (BACK TO WRITERS MODE) ---
async function askClone(prompt) {
    if(USE_LOCAL_AI) {
        addUserMessage("AI: (Local Mode) Processing locally...");
        setTimeout(() => {
            const reply = "[LOCAL] I am a simulated clone. I wrote: " + prompt;
            addSystemMessage(reply, '#00ffff');
        }, 500);
        return;
    }

    if(!GROQ_API_KEY) {
        addSystemMessage("ERROR: API Key missing.", '#ff0000');
        return;
    }

    try {
        addSystemMessage("CLONE: Writing code...", '#ffff00');
        
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a Senior Developer. User asks: " + prompt + ". Write a Javascript function to solve this. Return ONLY the code. NO markdown, NO backticks." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const json = await req.json();
        const reply = json.choices[0].message.content;

        // CLEAN UP
        const cleanCode = reply.replace(/```javascript/g, "").replace(/```/g, "").replace(/`/g, "").trim();
        
        addSystemMessage("CLONE: Code generated.", '#00ff00');
        
        // PUT IT IN A "WRITER BOX" (User must click Compile)
        // For now, we simulate the compile step directly
        safeExec(cleanCode);

    } catch (err) {
        addSystemMessage("ERROR: " + err.message, '#ff0000');
    }
}

// --- 6. COMMAND PROCESSOR ---
window.handleCommand = function(txt) {
    if(!txt) return;
    
    // COMMANDS
    if(txt === '1') {
        addUserMessage("Entering Chat Mode...");
    } else if (txt === '2') {
        addUserMessage("Entering AI Architect Mode (Robust)...");
    } else if (txt === '3') {
        USE_LOCAL_AI = !USE_LOCAL_AI;
        addSystemMessage("Toggled Local AI: " + USE_LOCAL_AI, '#ffff00');
    } else if(txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai ', '');
        askClone(prompt);
    } else if (txt.startsWith('/compile')) {
        // In the real UI, this would read from the Writer Box.
        // For now, we just try to exec the last AI reply.
        addSystemMessage("Compiling last code...", '#ffff00');
    } else {
        addUserMessage(txt);
    }
}
