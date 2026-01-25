// =========================================================================
//         MULTIVERSE OS: SAFE CATCH (SHOWS ERRORS ON SCREEN)
// =========================================================================

// --- 1. UPDATE DEBUG STATUS ---
function setStatus(msg, color) {
    const el = document.getElementById('debug-status');
    if (el) {
        el.innerText = msg;
        el.style.color = color;
        el.style.backgroundColor = color === 'red' ? 'black' : 'transparent';
    }
}

try {

// --- 2. CONFIGURATION ---
const GROQ_API_KEY = "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"; 
const REPO_OWNER = "ingrptr-lt";
let GITHUB_TOKEN = "NOT_SET";

setStatus('CONFIG LOADED', '#555');

// --- 3. STATE ---
let username = '';
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: 'default' };

const AVATARS = { 'default': '>_<' };
const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];
const THEMES = {
    'living_room': 'theme-living',
    'library': 'theme-library',
    'studio': 'theme-studio',
    'workshop': 'theme-workshop',
    'think_tank': 'theme-think',
    'lounge': 'theme-lounge'
};

setStatus('STATE LOADED', '#555');

// --- 4. INITIALIZATION ---
window.addEventListener('load', () => {
    try {
        setStatus('INIT STARTED', '#00ff00');
        
        const userInput = document.getElementById('usernameInput');
        if (!userInput) throw new Error("Login Input Missing");
        
        userInput.focus();
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
        
        setStatus('READY', '#00ff00');
    } catch (e) {
        setStatus('INIT ERROR: ' + e.message, 'red');
        alert(e.message);
    }
});

function login() {
    try {
        const input = document.getElementById('usernameInput');
        if (input.value.length < 2) return;
        username = input.value;
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('main-layout').style.display = 'grid';
        
        loadStats();
        connectMQTT();
        populateRoomSelector();
        switchRoom(currentRoom);
        
        const chatInput = document.getElementById('chatInput');
        if(chatInput) chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') processCommand(chatInput.value);
        });
        
        const sendBtn = document.getElementById('sendButton');
        if(sendBtn) sendBtn.addEventListener('click', () => {
            const i = document.getElementById('chatInput');
            if(i) processCommand(i.value);
        });
        
    } catch (e) {
        addMessage('ERROR', e.message, 'red');
    }
}

// --- 5. COMMANDS ---
function processCommand(txt) {
    const input = document.getElementById('chatInput');
    if(input) input.value = '';
    
    if (!txt) return;

    // AI CLONE
    if (txt.startsWith('/ai')) {
        const prompt = txt.replace('/ai', '').trim();
        talkToClone(prompt);
        return;
    }

    // AI ACTION
    if (txt.toLowerCase().includes('red') || txt.toLowerCase().includes('blue')) {
        executeAICommand(txt);
        return;
    }

    // CHAT
    const msg = { user: username, text: txt, room: currentRoom };
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify(msg));
        addMessage(username, txt, AVATARS['default']);
        addXP(1);
    } else {
        addMessage('LOCAL', txt);
    }
}

// --- 6. THE CLONE ---
async function talkToClone(prompt) {
    addMessage('CLONE', 'Thinking...', '#00ffff');
    
    try {
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system", content: "You are helpful AI Clone."
                }, {
                    role: "user", content: prompt
                }]
            })
        });

        const json = await req.json();
        const reply = json.choices[0].message.content;
        
        addMessage('CLONE', reply, '#00ff00');
        
    } catch (err) {
        addMessage('CLONE ERROR', err.message, 'red');
        setStatus('AI FAIL: ' + err.message, 'red');
    }
}

// --- 7. MQTT ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        addMessage('SYSTEM', 'MQTT Lib Missing', 'orange');
        return;
    }

    const clientId = "termos-" + Math.random().toString(16).substring(2, 10);
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: clientId,
        keepalive: 60
    });

    mqttClient.on('connect', () => {
        addMessage('SYSTEM', 'MQTT Connected', '#00ff00');
        mqttClient.subscribe('termchat/messages');
    });
}

// --- 8. UTILS ---
function addMessage(user, text, avatar, color) {
    const term = document.getElementById('terminal-body');
    if (!term) return;
    
    const div = document.createElement('div');
    div.style.marginBottom = '5px';
    
    if (user === 'CLONE') div.style.color = '#00ff00';
    else if (user === 'SYSTEM') div.style.color = '#ffff00';
    else div.style.color = 'var(--term-color)';
    
    div.innerHTML = `${avatar || ''}[${user}] ${text}`;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

function switchRoom(roomId) {
    currentRoom = roomId;
    document.body.className = THEMES[roomId] || 'theme-living';
    
    const header = document.getElementById('room-header');
    if(header) header.innerHTML = `TERMCHAT LT - ${roomId.toUpperCase()}`;
}

function populateRoomSelector() {
    const panel = document.getElementById('multiverse-panel');
    if(!panel) return;
    
    const rooms = ['living_room', 'library', 'studio', 'workshop'];
    let html = '<div style="padding:10px; border-bottom:1px solid var(--term-color);">ROOMS</div>';
    
    rooms.forEach(r => {
        html += `<button onclick="switchRoom('${r}')" style="width:100%; padding:5px; margin:2px 0; background:#333; color:#fff; border:1px solid #555;">${r.toUpperCase()}</button>`;
    });
    
    panel.innerHTML = html;
    panel.style.display = 'block';
}

function addXP(amount) { userStats.xp += amount; }
function loadStats() { const saved = localStorage.getItem('termos_stats'); if (saved) userStats = JSON.parse(saved); }

setStatus('SCRIPT LOADED', '#00ff00');

} // END TRY

catch (e) {
    document.body.innerHTML = `<h1 style="color:red; text-align:center; padding-top:50px;">CRITICAL ERROR: ${e.message}</h1>`;
}
