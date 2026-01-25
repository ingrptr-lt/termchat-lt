// =========================================================================
//         MULTIVERSE OS: OMNI-SCRIPT (THE FINAL VERSION)
// =========================================================================

// --- 1. CONFIGURATION ---
const GROQ_API_KEY = "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"; 
const REPO_OWNER = "ingrptr-lt";

// Load GitHub Token if available (Optional)
let GITHUB_TOKEN = (typeof GITHUB_TOKEN !== 'undefined') ? GITHUB_TOKEN : "NOT_SET";

// --- 2. STATE ---
let username = '';
let mqttClient = null;
let currentRoom = 'living_room';
let userStats = { level: 1, xp: 0, avatar: 'default' };
const AVATARS = {
    'default': '\n  o_o\n  /|\\\n',
    'hacker': '\n ♔♔♔\n  o_o\n  /|\\\n',
    'wizard': '\n   /\\\\\\\\\n  /  \\\\\\\\\\n  o_o\n',
    'admin':  '\n [===]\n  o_o\n  /|\\\n'
};

const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];
const THEMES = {
    'living_room': 'theme-living',
    'library': 'theme-library',
    'studio': 'theme-studio',
    'workshop': 'theme-workshop',
    'think_tank': 'theme-think',
    'lounge': 'theme-lounge'
};

// --- 3. INITIALIZATION ---
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('room')) currentRoom = urlParams.get('room');

    const userInput = document.getElementById('usernameInput');
    if (userInput) {
        userInput.focus();
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
});

function login() {
    const input = document.getElementById('usernameInput');
    if (input.value.length < 2) {
        alert("Username required");
        return;
    }
    username = input.value;
    
    // UI Switch
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('main-layout').style.display = 'grid';
    
    // Systems Start
    loadStats();
    connectMQTT();
    populateRoomSelector();
    populateFileBrowser();
    
    // Initial Room
    switchRoom(currentRoom);
    
    // Chat Input Listener
    const chatInput = document.getElementById('chatInput');
    if(chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processCommand(chatInput.value);
    });
    
    const sendBtn = document.getElementById('sendButton');
    if(sendBtn) sendBtn.addEventListener('click', () => processCommand(document.getElementById('chatInput').value));
}

// --- 4. MQTT CORE ---
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        addMessage('SYSTEM', 'MQTT Library missing. Running in Local Mode.', 'orange');
        return;
    }

    const clientId = "termos-" + username + "-" + Math.floor(Math.random() * 10000);
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: clientId,
        keepalive: 60,
        clean: true
    });

    mqttClient.on('connect', () => {
        addMessage('SYSTEM', `Connected to Multiverse as ${username}.`, '#00ff00');
        
        const topics = ['termchat/messages', 'termchat/admin'];
        if (currentRoom) topics.push(`termchat/room/${currentRoom}`);
        
        topics.forEach(t => mqttClient.subscribe(t));
        
        // Announce
        mqttClient.publish('termchat/messages', JSON.stringify({
            user: 'SYSTEM',
            text: `${username} joined ${currentRoom}`,
            room: currentRoom,
            timestamp: new Date().toISOString()
        }));
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            
            // Handle App/Game creation
            if (data.type === 'creation') {
                if (data.creation && data.creation.type === 'app') openAppBuilder(data.creation);
                if (data.creation && data.creation.type === 'game') openGameConsole(data.creation);
                return;
            }
            
            // Regular Chat
            if (data.user && data.text) addMessage(data.user, data.text, AVATARS['default']);
            
            // Navigation
            if (data.type === 'navigation') switchRoom(data.room);
            
            // Admin
            if (data.type === 'admin') addMessage('ADMIN', data.msg, '#ff00ff');
            
        } catch (e) {
            // Plain text fallback
            addMessage('MSG', message.toString());
        }
    });

    mqttClient.on('error', (err) => addMessage('ERROR', err.message, 'red'));
}

// --- 5. COMMAND PROCESSOR (THE BRAIN) ---
function processCommand(txt) {
    const input = document.getElementById('chatInput');
    input.value = '';
    
    if (!txt) return;

    // SYSTEM COMMANDS
    if (txt.startsWith('/')) {
        handleSystemCommand(txt);
        return;
    }

    // AI COMMANDS (Visuals, GitHub)
    if (txt.toLowerCase().includes('red') || txt.toLowerCase().includes('blue') || txt.toLowerCase().includes('create') || txt.toLowerCase().includes('add button')) {
        executeAICommand(txt);
        return;
    }

    // REGULAR CHAT
    const msg = {
        user: username,
        text: txt,
        room: currentRoom,
        timestamp: new Date().toISOString()
    };
    
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify(msg));
        addMessage(username, txt, AVATARS['default']);
        addXP(1, 'Chatting');
    } else {
        addMessage('LOCAL', txt); // Fallback
    }
}

function handleSystemCommand(cmd) {
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (main === '/clear') {
        document.getElementById('terminal-body').innerHTML = '';
    }
    else if (main === '/room' || main === '/go') {
        const target = arg.toLowerCase();
        const roomMap = {
            'living': 'living_room', 'library': 'library', 'studio': 'studio', 'workshop': 'workshop', 'think': 'think_tank', 'lounge': 'lounge'
        };
        if (roomMap[target]) switchRoom(roomMap[target]);
        else addMessage('SYSTEM', 'Unknown room', 'orange');
    }
    else if (main === '/stats') {
        addMessage('STATS', `Lvl ${userStats.level} | XP: ${userStats.xp}`, '#ffff00');
    }
    else if (main === '/desktop') {
        openVirtualDesktop();
    }
    else if (main === '/admin') {
        switchMode('admin');
    }
    else if (main === '/chat') {
        switchMode('chat');
    }
    else if (main === '/say') {
        speakText(arg);
    }
}

// --- 6. AI ENGINE (GROQ) ---
async function executeAICommand(txt) {
    addMessage('AI', 'Processing...', '#00ffff');

    try {
        const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{
                    role: "system", 
                    content: "You are a System Controller. Tasks: SET_COLOR_RED, SET_COLOR_BLUE, SET_COLOR_GREEN, ADD_BUTTON, ADD_TEXT. For GitHub use: CREATE_REPO [name]. Respond with ONLY the task name."
                }, {
                    role: "user", 
                    content: txt
                }]
            })
        });

        const json = await req.json();
        const reply = json.choices[0].message.content.toUpperCase().trim();

        const term = document.getElementById('terminal-body');

        // EXECUTE
        if (reply.includes('RED')) { 
            document.body.style.setProperty('--term-color', '#ff0000'); 
            addMessage('SYS', 'Color set to Red');
        }
        else if (reply.includes('BLUE')) { 
            document.body.style.setProperty('--term-color', '#0000ff'); 
            addMessage('SYS', 'Color set to Blue');
        }
        else if (reply.includes('GREEN')) { 
            document.body.style.setProperty('--term-color', '#00ff00'); 
            addMessage('SYS', 'Color set to Green');
        }
        else if (reply.includes('BUTTON')) { 
            const b = document.createElement('button');
            b.innerText = "AI GENERATED";
            b.style.cssText = "margin:5px; padding:5px; background:#333; color:#fff; border:none;";
            term.appendChild(b); 
            addMessage('SYS', 'Added Button');
        }
        else if (reply.includes('TEXT')) { 
            const t = document.createElement('h3');
            t.innerText = "AI TEXT";
            t.style.color = "#fff";
            term.appendChild(t);
            addMessage('SYS', 'Added Text');
        }
        else if (reply.includes('CREATE_REPO')) {
            const parts = reply.split(" ");
            const name = parts[parts.length - 1];
            createGithubRepo(name);
        }
        else {
            addMessage('AI', reply);
        }

    } catch (err) {
        addMessage('ERROR', `AI Failure: ${err.message}`, 'red');
    }
}

// --- 7. GITHUB ARCHITECT ---
async function createGithubRepo(repoName) {
    if (GITHUB_TOKEN === "NOT_SET") {
        addMessage('GITHUB', 'Error: Add token to config.js', 'red');
        return;
    }

    try {
        addMessage('GITHUB', `Creating ${repoName}...`);
        
        const res = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name: repoName,
                description: "Created by Multiverse OS",
                private: false
            })
        });
        
        if (!res.ok) throw new Error("API Fail");
        
        addMessage('SUCCESS', `https://github.com/${REPO_OWNER}/${repoName}`, '#00ff00');
        addXP(50, 'Repo Creation');
        
    } catch (err) {
        addMessage('GITHUB', err.message, 'red');
    }
}

// --- 8. GAMIFICATION ---
function addXP(amount, reason) {
    userStats.xp += amount;
    if (userStats.xp >= (userStats.level * 100)) {
        userStats.level++;
        addMessage('ACHIEVEMENT', `Level Up! You are now ${LEVELS[userStats.level-1]}`, '#ffff00');
        saveStats();
    }
}

function loadStats() {
    const saved = localStorage.getItem('termos_stats');
    if (saved) userStats = JSON.parse(saved);
}

function saveStats() {
    localStorage.setItem('termos_stats', JSON.stringify(userStats));
}

// --- 9. PANEL MANAGER ---
function switchMode(mode) {
    const panel = document.getElementById('multiverse-panel');
    panel.innerHTML = '';
    
    if (mode === 'admin') {
        panel.style.display = 'block';
        panel.innerHTML = `
            <h3 style="color:#fff; border-bottom:1px solid var(--term-color);">ADMIN PANEL</h3>
            <p>Create a repo: <input id="repo-name" placeholder="Name" style="background:#000; color:#fff; border:1px solid #fff;"> <button onclick="createGithubRepo(document.getElementById('repo-name').value)">Create</button></p>
        `;
    } else {
        panel.style.display = 'none';
    }
}

// --- 10. VIRTUAL DESKTOP ---
function openVirtualDesktop() {
    const panel = document.getElementById('multiverse-panel');
    panel.style.display = 'block';
    panel.innerHTML = `
        <div style="background:#333; width:100%; height:300px; position:relative; border:1px solid #fff;">
            <div style="position:absolute; top:10px; left:10px; width:100px; height:100px; background:#000; color:#fff;">Icon</div>
            <div style="position:absolute; top:120px; left:10px; width:100px; height:100px; background:#000; color:#fff;">Icon</div>
        </div>
    `;
}

// --- 11. ROOMS ---
function switchRoom(roomId) {
    currentRoom = roomId;
    document.body.className = THEMES[roomId] || 'theme-living';
    
    const names = {
        'living_room': 'LIVING ROOM',
        'library': 'LIBRARY',
        'studio': 'STUDIO',
        'workshop': 'WORKSHOP',
        'think_tank': 'THINK TANK',
        'lounge': 'LOUNGE'
    };
    
    document.getElementById('room-header').innerHTML = `TERMCHAT LT - ${names[roomId] || 'UNKNOWN'}<span class="cursor"></span>`;
}

function populateRoomSelector() {
    const panel = document.getElementById('multiverse-panel');
    
    const rooms = [
        { id: 'living_room', name: 'Living Room' },
        { id: 'library', name: 'Library' },
        { id: 'studio', name: 'Studio' },
        { id: 'workshop', name: 'Workshop' },
        { id: 'think_tank', name: 'Think Tank' },
        { id: 'lounge', name: 'Lounge' }
    ];
    
    let html = '<div style="padding:10px; border-bottom:1px solid var(--term-color);"><strong>ROOMS</strong></div>';
    
    rooms.forEach(r => {
        html += `<button onclick="switchRoom('${r.id}')" style="width:100%; padding:5px; margin:2px 0; background:${currentRoom === r.id ? 'var(--term-color)' : '#222'}; color:#fff; border:1px solid #444; text-align:left;">${r.name}</button>`;
    });
    
    panel.innerHTML = html;
    panel.style.display = 'block';
}

// --- 12. FILE SYSTEM (MOCK) ---
function populateFileBrowser() {
    // Mock file system in localStorage
    const files = JSON.parse(localStorage.getItem('termos_files') || '{}');
    
    const panel = document.getElementById('multiverse-panel');
    // Append file list to existing content
    // (Simplified: just appending to innerHTML)
    panel.innerHTML += `
        <div style="margin-top:20px; padding:10px; border-top:1px solid var(--term-color);">
            <strong>FILES</strong>
            <button onclick="alert('Not implemented in V1')">Upload</button>
        </div>
    `;
}

// --- 13. VOICE (TEXT TO SPEECH) ---
function speakText(txt) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(txt);
        window.speechSynthesis.speak(utter);
    }
}

// --- UTILS ---
function addMessage(user, text, avatar, color) {
    const term = document.getElementById('terminal-body');
    if (!term) return;
    const div = document.createElement('div');
    div.style.marginBottom = '5px';
    div.style.fontSize = '14px';
    div.style.lineHeight = '1.4';
    
    if (user === 'SYSTEM') div.style.color = '#ffff00';
    else if (user === 'ERROR') div.style.color = '#ff0000';
    else if (user === 'AI') div.style.color = '#00ffff';
    else if (user === 'GITHUB') div.style.color = '#ff00ff';
    else div.style.color = 'var(--term-color)';
    
    // Avatar support
    const avStr = avatar ? `<span style="margin-right:5px; font-size:10px;">${avatar}</span>` : '';
    div.innerHTML = `${avStr}[${user}] ${text}`;
    
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}
