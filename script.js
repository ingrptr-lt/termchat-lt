// =========================================================================
//         MULTIVERSE OS: PART 1 - THE FOUNDATION
// =========================================================================

// --- CONFIGURATION ---
const GITHUB_TOKEN = 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 
const GROQ_API_KEY = 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
const REPO_OWNER = "ingrptr-lt";
const REPO_NAME = "termchat-lt";
const FILE_PATH = "index.html"; 

// --- 1. THE UI (Body) ---
window.addEventListener('load', () => {
    injectUI();
});

function injectUI() {
    const old = document.getElementById('multi-core');
    if(old) old.remove();

    const ui = document.createElement('div');
    ui.id = 'multi-core';
    ui.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:250px; background:rgba(0,0,0,0.95); border-top:2px solid #00ff41; color:#00ff41; font-family:monospace; z-index:99999; display:flex;';
    
    ui.innerHTML = `
        <div style="width:200px; border-right:1px solid #00ff41; padding:10px;">
            <div style="font-weight:bold;">MULTIVERSE OS</div>
            <div style="margin-top:10px; font-size:12px; color:#888;">
                STATUS: ALIVE<br>
                BRAIN: CONNECTING...
            </div>
        </div>
        <div style="flex-grow:1; display:flex; flex-direction:column;">
            <div id="term-out" style="flex-grow:1; padding:10px; overflow-y:auto;"></div>
            <div style="padding:10px; border-top:1px solid #00ff41;">
                <input id="cmd-in" type="text" placeholder="Command..." style="width:100%; background:transparent; color:#fff; border:none; outline:none;">
            </div>
        </div>
    `;
    document.body.appendChild(ui);

    // Listen for commands
    document.getElementById('cmd-in').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            processCommand(this.value);
            this.value = '';
        }
    });
}

// --- 2. THE HANDS (GitHub Connection) ---
async function readFromGitHub() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const res = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
    const data = await res.json();
    return { content: atob(data.content), sha: data.sha };
}

async function writeToGitHub(code, sha) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const body = {
        message: "Multiverse Update",
        content: btoa(unescape(encodeURIComponent(code))),
        sha: sha,
        branch: "main"
    };
    await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}
