// BULLETPROOF SCRIPT
const GROQ_API_KEY = "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";

window.onload = function() {
    document.body.style.margin = "0";
    document.body.style.background = "#050505";
    
    var header = document.createElement("div");
    header.style.padding = "20px";
    header.style.background = "#000";
    header.style.color = "#0f0";
    header.innerText = "MULTIVERSE OS - V10";
    
    var output = document.createElement("div");
    output.id = "out";
    output.style.padding = "20px";
    output.style.color = "white";
    
    var input = document.createElement("input");
    input.placeholder = "Type here";
    input.style.width = "100%";
    input.style.background = "transparent";
    input.style.color = "white";
    input.style.borderTop = "1px solid #333";
    input.style.fontSize = "20px";
    
    input.onkeypress = async function(e) {
        if (e.key === "Enter") {
            var txt = input.value;
            input.value = "";
            output.innerHTML += "YOU: " + txt + "<br>";
            
            var res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + GROQ_API_KEY
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: txt }]
                })
            });
            
            var data = await res.json();
            var ans = data.choices[0].message.content;
            
            output.innerHTML += "AI: " + ans + "<br>";
        }
    };
    
    document.body.appendChild(header);
    document.body.appendChild(output);
    document.body.appendChild(input);
};
