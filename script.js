// =========================================================================
//         MULTIVERSE OS: ORIGINAL VISION (SAFE VERSION)
// =========================================================================

const GROQ_API_KEY = "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"; 

window.onload = function() {
    initSystem();
};

function initSystem() {
    // 1. SETUP BODY
    document.body.style.margin = "0";
    document.body.style.background = "#050505";
    document.body.style.fontFamily = "sans-serif";
    document.body.style.overflow = "hidden";

    // 2. HEADER (STATUS)
    var header = document.createElement("div");
    header.style.padding = "20px";
    header.style.background = "#000";
    header.style.borderBottom = "1px solid #333";
    header.style.color = "#0f0";
    header.style.fontFamily = "monospace";
    header.innerHTML = "MULTIVERSE OS // NEURAL LINK ACTIVE // <span style='color:#fff'>ADMIN MODE</span>";
    document.body.appendChild(header);

    // 3. SYSTEM CANVAS (VISUALS)
    // The AI controls this space by telling you what to do, or we simulate it
    var canvas = document.createElement("div");
    canvas.id = "sys-canvas";
    canvas.style.height = "calc(100vh - 300px)";
    canvas.style.background = "#0a0a0a";
    canvas.style.display = "flex";
    canvas.style.alignItems = "center";
    canvas.style.justifyContent = "center";
    canvas.style.color = "#fff";
    canvas.innerHTML = "<h1>SYSTEM READY</h1><p>Waiting for Admin input...</p>";
    document.body.appendChild(canvas);

    // 4. TERMINAL (COMMAND CENTER)
    var termBox = document.createElement("div");
    termBox.style.height = "300px";
    termBox.style.background = "#000505";
    termBox.style.borderTop = "4px solid #0f0";
    termBox.style.color = "#0f0";
    termBox.style.fontFamily = "'Courier New', monospace";
    termBox.style.padding = "20px";
    termBox.style.overflowY = "auto";
    
    var input = document.createElement("input");
    input.placeholder = "Enter Command...";
    input.style.width = "100%";
    input.style.background = "transparent";
    input.style.color = "#fff";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.fontSize = "20px";
    input.style.borderTop = "1px solid #333";
    input.style.paddingTop = "10px";

    // LOGIC
    input.onkeypress = async function(e) {
        if (e.key === "Enter") {
            var txt = input.value.trim();
            if (!txt) return;
            input.value = "";
            
            termBox.innerHTML += "<div style='color:#fff; margin-bottom:5px;'>> ROOT: " + txt + "</div>";
            
            try {
                termBox.innerHTML += "<div style='color:#0f0; margin-bottom:5px;'>> ADMIN: Processing...</div>";
                termBox.scrollTop = termBox.scrollHeight;

                var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + GROQ_API_KEY
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { 
                                role: "system", 
                                content: "You are the Multiverse OS Admin. You have access to the system canvas. If the user asks to 'change background', 'add button', or 'change text', reply with VALID HTML code to put inside the div with id='sys-canvas'. Otherwise, answer as the system." 
                            },
                            { role: "user", content: txt }
                        ]
                    })
                });

                var data = await res.json();
                var ans = data.choices[0].message.content;

                // CHECK IF IT'S CODE
                if (ans.includes("document.getElementById('sys-canvas')")) {
                    // SIMULATE CHANGE (Safe Mode)
                    canvas.innerHTML = "<h3 style='color:#0f0'>[AI COMMAND EXECUTED]</h3><p>" + ans + "</p>";
                    termBox.innerHTML += "<div style='color:#0ff; margin-bottom:5px;'>> ADMIN: Command Visualized.</div>";
                } else {
                    termBox.innerHTML += "<div style='color:#0ff; margin-bottom:5px;'>> ADMIN: " + ans + "</div>";
                }

            } catch (err) {
                termBox.innerHTML += "<div style='color:red; margin-bottom:5px;'>> ERROR: " + err.message + "</div>";
            }
            
            termBox.scrollTop = termBox.scrollHeight;
        }
    };

    termBox.appendChild(input);
    document.body.appendChild(termBox);
}
