// =========================================================================
//         GROQ MODEL DISCOVERY TOOL
// =========================================================================

const GROQ_API_KEY = "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"; 

window.addEventListener('load', async () => {
    alert("CHECKING YOUR MODELS...");
    
    try {
        // 1. GET THE LIST OF MODELS
        const req = await fetch("https://api.groq.com/openai/v1/models", {
            method: "GET",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }
        });
        
        const json = await req.json();
        
        // 2. DISPLAY THE LIST
        let list = "AVAILABLE MODELS:\n\n";
        if (json.data && json.data.length > 0) {
            json.data.forEach(m => {
                list += m.id + "\n";
            });
        } else {
            list = "NO MODELS FOUND OR ERROR.";
        }
        
        alert(list);
        
    } catch (err) {
        alert("ERROR: " + err.message);
    }
});
