// =========================================================================
//         MULTIVERSE OS: MASTER SCRIPT (FULL STACK)
// =========================================================================

// 1. IMPORTS CONFIG
// Note: GITHUB_TOKEN is loaded from config.js

const GROQ_API_KEY = "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"; 
const REPO_OWNER = "ingrptr-lt";

// 2. GLOBAL STATE
let username = '';
let mqttClient = null;
let currentRoom = 'living_room';
let currentState = "chat"; // chat, app, game, video, admin
let userStats = {
    level: 1,
    xp: 0,
    avatar: 'default'
};

const AVATARS = {
    'default': '\n  o_o\n  /|\\\n  / \\\\n',
    'hacker': '\n ♔♔♔\n  o_o\n  /|\\\n  / \\\\n',
    'wizard': '\n   /\\\\\\\\\n  /  \\\\\\\\\\n  \\\\\\\\\__/\n  o_o\n  /|\\\n',
    'ninja': '\n   ◢◤\n  o_o\n  /|\\\n  / \\\\\\\\n'
};

const LEVEL_TITLES = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'Guru', 'Legend'];

// 3. SYSTEM INITIALIZATION
window.addEventListener('load', () => {
    // Check URL for room sharing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('room')) {
        currentRoom = urlParams.get('room');
    }

    // Setup Login
    const userInput = document.getElementById('usernameInput');
    if(userInput) {
        userInput.focus();
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
});

// 4. LOGIN LOGIC
function login() {
    const input = document.getElementById('usernameInput');
    if (input.value.length < 3) {
        alert("Username must be at least 3 characters");
        return;
    }
    username = input.value;
    
    // UI Switch
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('main-layout').style.display = 'grid';
    
    // Start Systems
    loadUserStats();
    connectMQTT();
    populateRoomSelector();
    
    // Set default room
    switchRoom(currentRoom);
}

// 5. MQTT CONNECTION
function connectMQTT() {
    if (typeof mqtt === 'undefined') {
        addMessage('SYSTEM', 'Error: MQTT library not loaded.');
        return;
    }

    const clientId = "termos-" + Math.random().toString(16).substring(2, 10);
    
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: clientId,
        keepalive: 60,
        clean: true
    });

    mqttClient.on('connect', () => {
        addMessage('SYSTEM', 'Connected to Multiverse MQTT Broker.');
        
        // Subscribe to channels
        mqttClient.subscribe('termchat/messages');
        mqttClient.subscribe('termchat/input');
        
        // Announce join
        const msg = {
            user: 'SYSTEM',
            text: `${username} joined ${currentRoom}`,
            room: currentRoom,
            timestamp: new Date().toISOString()
        };
        mqttClient.publish('termchat/messages', JSON.stringify(msg));
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            
            // Handle different message types
            if (data.type === 'creation') {
                // Open App or Game Panel
                if (data.creation && data.creation.type === 'app') switchMode('app', data.creation);
                if (data.creation && data.creation.type === 'game') switchMode('game', data.creation);
            } else {
                // Regular Chat
                if (data.user && data.text) {
                    // Display Avatar
                    const avatar = AVATARS['default']; // Default avatar
                    addMessage(data.user, data.text, avatar);
                }
            }
        } catch (e) {
            // Fallback for plain text
            addMessage('MQTT', message.toString());
        }
    });
    
    mqttClient.on('error', (err) => {
        console.error("MQTT Error:", err);
        addMessage('ERROR', 'Connection error: ' + err.message);
    });
}

// 6. MESSAGE HANDLING
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Check for local commands
    if (handleCommand(text)) return;

    // Publish to MQTT
    const msg = {
        user: username,
        text: text,
        room: currentRoom,
        timestamp: new Date().toISOString()
    };

    if (mqttClient && mqttClient.connected) {
        mqttClient.publish('termchat/messages', JSON.stringify(msg));
        mqttClient.publish('termchat/input', JSON.stringify(msg));
        addMessage(username, text, AVATARS['default']); // Show locally immediately
        addXP(1, 'Sending message');
    } else {
        addMessage('ERROR', 'Not connected to broker.');
    }
    
    input.value = '';
}

// 7. COMMAND PROCESSOR (AI & SYSTEM)
function handleCommand(text) {
    const lower = text.toLowerCase();

    if (lower === '/clear') {
        document.getElementById('terminal-body').innerHTML = '';
        return true;
    }
    
    if (lower === '/stats') {
        showStats();
        return true;
    }
    
    if (lower === '/avatar') {
        const avatar = AVATARS['h
