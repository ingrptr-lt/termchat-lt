<script>
    /**
     * =========================================================================
     *  TERMOS LT: HYBRID FAILSAFE (FIXED EDITION)
     *  Fixes: Syntax Errors, Missing Functions, Duplicate Logic, Self-Healing
     * =========================================================================
     */

    // --- 0. CONFIGURATION ---
    let GROQ_API_KEY = localStorage.getItem('termos_groq_key') || ""; // Fixed key retrieval
    let USE_LOCAL_AI = false;
    const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
    let adminMode = false;

    // --- 1. STATE ---
    let username = 'Anon_' + Math.floor(Math.random() * 1000);
    let mqttClient = null;
    let currentRoom = 'main';
    let userStats = { level: 1, xp: 0, avatar: '>_<', title: 'Newbie' };
    const LEVELS = ['Newbie', 'Apprentice', 'Coder', 'Hacker', 'Architect', 'Wizard', 'Master', 'GOD MODE'];

    // --- 2. UTILITY: LOG FUNCTION (Fixed Missing Function) ---
    function log(text, type) {
        console.log(`[${type || 'INFO'}] ${text}`);
        if (type === 'sys-msg' || type === 'system') {
            addSystemMessage(text);
        }
    }

    // --- 3. UTILITY: SAFE GET ELEMENT (Self-Healing) ---
    function getElem(id) {
        let el = document.getElementById(id);
        if (!el) {
            console.warn(`[FAILSAFE] Creating missing element: #${id}`);
            el = document.createElement('div');
            el.id = id;
            // Default styling for auto-created elements
            if(id === 'main-app') el.className = "flex flex-col h-full w-full p-4 overflow-y-auto";
            else if(id === 'terminal-content') el.className = "font-mono text-sm text-green-300 p-4";
            document.body.appendChild(el);
        }
        return el;
    }

    // --- 4. SYSTEM REBUILDER KERNEL ---
    const SystemRebuilder = {
        installedModules: [],

        install: function(featureName) {
            if (this.installedModules.includes(featureName)) {
                log(`Module [${featureName}] already active.`, 'sys-msg');
                return;
            }
            console.log(`[KERNEL] Installing module: ${featureName}`);
            log(`INITIATING INSTALLATION: ${featureName.toUpperCase()}...`, 'sys-msg');

            switch(featureName) {
                case 'matrix': this.installMatrix(); break;
                case 'crt': this.installCRT(); break;
                case 'sound': this.installSound(); break;
                case 'neon-theme': this.installNeonTheme(); break;
                case 'god-mode': this.installGodMode(); break;
                default:
                    log(`ERROR: Unknown module '${featureName}'`, 'sys-msg');
                    return;
            }
            this.installedModules.push(featureName);
            log(`INSTALLATION COMPLETE: ${featureName.toUpperCase()}`, 'sys-msg');
        },

        installMatrix: function() {
            if (document.getElementById('matrix-canvas')) return;
            const canvas = document.createElement('canvas');
            canvas.id = 'matrix-canvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.2;pointer-events:none;';
            document.body.prepend(canvas);
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;
            const cols = Math.floor(width / 20);
            const ypos = Array(cols).fill(0);

            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            function draw() {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = '#0f0';
                ctx.font = '15pt monospace';
                ypos.forEach((y, ind) => {
                    const text = String.fromCharCode(Math.random() * 128);
                    ctx.fillText(text, ind * 20, y);
                    if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                    else ypos[ind] = y + 20;
                });
            }
            setInterval(draw, 50);
        },

        installCRT: function() {
            if (document.getElementById('crt-overlay')) return;
            const overlay = document.createElement('div');
            overlay.id = 'crt-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06));background-size:100% 2px, 3px 100%;pointer-events:none;z-index:999;animation:flicker 0.15s infinite;';
            document.body.appendChild(overlay);
            if (!document.getElementById('crt-styles')) {
                const style = document.createElement('style');
                style.id = 'crt-styles';
                style.innerHTML = `@keyframes flicker { 0% { opacity: 0.95; } 50% { opacity: 1; } 100% { opacity: 0.98; } }`;
                document.head.appendChild(style);
            }
        },

        installSound: function() {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const originalLog = window.log;
            if (typeof originalLog === 'function') {
                window.log = function(text, type) {
                    if (type !== 'system' && type !== 'sys-msg') {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain); gain.connect(audioCtx.destination);
                        osc.type = 'sine'; osc.frequency.value = 800;
                        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
                    }
                    originalLog(text, type);
                };
            }
        },

        installNeonTheme: function() {
            if (document.getElementById('neon-styles')) return;
            const style = document.createElement('style');
            style.id = 'neon-styles';
            style.innerHTML = `body { text-shadow: 0 0 5px #0f0, 0 0 10px #0f0; } #main-app { border: 1px solid #0f0; box-shadow: 0 0 15px #0f0; } .user-msg { color: #e0ffe0; font-weight: bold; }`;
            document.head.appendChild(style);
        },

        installGodMode: function() {
            if (document.getElementById('god-btn')) return;
            const btn = document.createElement('button');
            btn.id = 'god-btn';
            btn.innerText = "SYS_ADMIN";
            btn.style.cssText = "position:fixed;top:10px;right:10px;z-index:1000;background:red;color:white;border:none;padding:5px 10px;font-family:monospace;cursor:pointer;";
            btn.onclick = () => {
                const cmd = prompt("ENTER SYSTEM COMMAND:");
                if(cmd) handleInput(cmd);
            };
            document.body.appendChild(btn);
        }
    };

    // --- 5. INITIALIZATION ---
    window.addEventListener('load', () => {
        console.log(">> SYSTEM INITIALIZING HYBRID OS...");
        setTimeout(() => { checkAndRun(); }, 500);
    });

    function checkAndRun() {
        try {
            initMatrix();
        } catch (e) {
            document.body.style.background = "#000";
            console.error("Matrix Init Failed:", e);
        }
        try {
            runTerminalBoot();
        } catch (e) {
            console.error("Boot Sequence Failed:", e);
            setTimeout(forceBootMainApp, 1000);
        }
    }

    // --- 6. ROBUST MATRIX ---
    function initMatrix() {
        const c = document.getElementById('matrix-canvas');
        if (!c) {
            const canvas = document.createElement('canvas');
            canvas.id = 'matrix-canvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;opacity:0.1;pointer-events:none;';
            document.body.prepend(canvas);
        }
        
        const ctx = c.getContext('2d');
        if(!ctx) return; 

        function resize() {
            c.width = window.innerWidth; 
            c.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
        const fontSize = 14;
        const columns = c.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrixRain() {
            if(!c || !ctx) return;
            ctx.fillStyle = 'rgba(0, 0,0, 0.05)';
            ctx.fillRect(0, 0, c.width, c.height);
            
            let color = '#0F0';
            if (adminMode) color = '#ff0000'; 
            else if (!GROQ_API_KEY) color = '#F00';
            else color = '#0F0';

            ctx.fillStyle = color;
            ctx.font = fontSize + 'px monospace';
            
            for(let i=0; i<drops.length; i++) {
                const text = letters[Math.floor(Math.random()*letters.length)];
                if (!adminMode && (GROQ_API_KEY) && Math.random() > 0.98) {
                    ctx.fillStyle = '#00f3ff';
                } else {
                    ctx.fillStyle = color;
                }
                ctx.fillText(text, i*fontSize, drops[i]*fontSize);
                if(drops[i]*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(drawMatrixRain, 33); 
    }

    // --- 7. BOOT SEQUENCE ---
    function runTerminalBoot() {
        const term = getElem('terminal-content');
        const statusEl = getElem('boot-status');
        
        let lines = [
            "Initializing BIOS...", "Loading Kernel Modules...", "Checking Neural Net...",
            ">>> [1] Multiverse Chat", ">>> [2] Gamification", ">>> [3] AI Assistant",
            ">>> SELECT MODE: Type '1' (Chat) or '2' (AI)"
        ];

        let index = 0;
        if(statusEl) statusEl.innerText = "AUTO-SEQUENCE ACTIVE...";
        
        function typeNextLine() {
            if (index < lines.length) {
                const line = lines[index];
                const div = document.createElement('div');
                div.className = "opacity-80 mb-1 font-mono text-sm text-green-300";
                div.innerText = line;
                term.appendChild(div); 
                term.scrollTop = term.scrollHeight;
                index++;
                setTimeout(typeNextLine, 50);
            } else {
                if(statusEl) {
                    statusEl.innerText = "SCAN COMPLETE. SELECT MODE.";
                    statusEl.className = "text-green-500 font-bold animate-pulse";
                }
                
                // Auto-boot after delay if no input
                setTimeout(() => {
                    forceBootMainApp();
                }, 3000);
            }
        }
        typeNextLine();
    }

    // --- 8. MAIN APP BOOT (Merged Duplicate) ---
    function forceBootMainApp() {
        console.log("!!! FORCE BOOT TRIGGERED !!!");
        
        let main = getElem('main-app');
        
        const boot = document.getElementById('terminal-boot');
        const mainLayout = document.getElementById('main-layout');
        
        if(boot) boot.style.display = 'none';
        if(mainLayout) {
            mainLayout.classList.remove('hidden');
            mainLayout.classList.add('flex');
        }
        
        // Show main-app
        main.classList.remove('hidden');
        main.classList.add('flex');

        if (!username || username === 'Guest') username = "Operator_" + Math.floor(Math.random() * 9999);
        const userDisplay = getElem('user-display');
        if(userDisplay) userDisplay.innerText = `@${username.toUpperCase()}`;
        
        loadStats();
        updateStatsUI();
        connectMQTT();
        addSystemMessage("System Initialized (Recovery Mode).");
    }

    // --- 9. UI UPDATES ---
    function updateStatsUI() {
        const titleEl = getElem('lvl-text');
        const xpEl = getElem('xp-disp'); // Fixed ID
        const barEl = getElem('xp-bar');
        
        if(titleEl) titleEl.innerText = `LVL ${userStats.level} ${userStats.title.toUpperCase()}`;
        if(xpEl) xpEl.innerText = `XP: ${userStats.xp.toLocaleString()}`;
        
        const progress = (userStats.xp % 1000) / 10; 
        if(barEl) barEl.style.width = `${progress}%`;
    }

    function loadStats() {
        const saved = localStorage.getItem('termos_stats');
        if(saved) try { userStats = JSON.parse(saved); } catch(e){}
    }

    function addXP(amount) {
        userStats.xp += amount;
        if(userStats.xp > (userStats.level * 1000)) {
            userStats.level++;
            userStats.title = LEVELS[userStats.level] || 'GOD MODE';
            addSystemMessage(`LEVEL UP! RANK: ${userStats.title}`);
        }
        updateStatsUI();
        localStorage.setItem('termos_stats', JSON.stringify(userStats));
    }

    // --- 10. CHAT RENDERING ---
    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function addUserMessage(text) {
        const container = getElem('main-app');
        if(!container) return;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const html = `<div class="flex flex-row-reverse items-end gap-3 animate-fade-in-up"><div class="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center border border-green-500 font-mono text-white text-xs">ME</div>
        <div class="p-4 rounded-l-xl rounded-br-xl text-sm text-green-100 bg-gray-900/50 border border-green-900/30 max-w-[80%]">
            <div class="flex items-center gap-2 mb-1 opacity-80 text-xs font-mono text-green-400">
                <span>@${escapeHtml(username.toUpperCase())}</span>
                <span>${time}</span>
            </div>
            <div class="text-left">${escapeHtml(text)}</div>
        </div></div>`;
        container.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function addAIMessage(text, isAction) {
        const container = getElem('main-app');
        if(!container) return;
        const cssClass = isAction ? 'border border-cyan-500' : 'border border-white/10 bg-black/60';
        
        const html = `<div class="flex flex-row items-start gap-3 animate-fade-in-up">
            <div class="w-8 h-8 rounded-full bg-black border border-cyan-500 flex items-center justify-center text-cyan-400 font-mono text-[8px] font-bold">AI</div>
            <div class="flex-1">
                <div class="px-2 py-1 text-[10px] text-cyan-600 font-mono">TERM_AI_SYSTEM</div>
                <div class="p-4 rounded-r-xl rounded-bl-xl ${cssClass} text-sm text-gray-200 backdrop-blur-sm">
                    <p class="leading-relaxed">${escapeHtml(text)}</p>
                </div>
            </div>
        </div>`;
        container.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function addSystemMessage(text) {
        const container = getElem('main-app');
        if(!container) return;
        container.insertAdjacentHTML('beforeend', `<div class="p-2 rounded text-xs text-center text-cyan-500 border border-cyan-900/30 bg-black/40 my-1 font-mono">[ SYSTEM: ${escapeHtml(text)} ]</div>`);
        scrollToBottom();
    }

    function scrollToBottom() {
        const c = getElem('main-app');
        if(c) c.scrollTop = c.scrollHeight;
    }

    // --- 11. INPUT HANDLING ---
    function handleInput() {
        const input = document.getElementById('cmd-input') || document.getElementById('user-input');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;

        // System Commands
        if (text.startsWith('/sys install ')) {
            const module = text.split(' ')[2];
            SystemRebuilder.install(module);
        } else if (text.startsWith('/setkey ')) {
            GROQ_API_KEY = text.substring(8);
            localStorage.setItem('termos_groq_key', GROQ_API_KEY);
            addSystemMessage("KEY SAVED.");
        } else if (text.startsWith('/ai ')) {
            talkToClone(text.substring(4));
        } else if (text === '/clear') {
            getElem('main-app').innerHTML = '';
        } else {
            // Chat
            addUserMessage(text);
            addXP(1);
            publishMessage(text);
        }
        
        input.value = '';
    }

    // --- 12. AI LOGIC ---
    async function talkToClone(prompt) {
        if (!GROQ_API_KEY) {
            addAIMessage("❌ ERROR: API Key missing.", true);
            return;
        }
        addAIMessage("Thinking...", false);
        try {
            const req = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [
                        { role: "system", content: "You are TermOS AI. You are a creator. Use SystemRebuilder.install('name') to install features." },
                        { role: "user", content: prompt }
                    ]
                })
            });
            const json = await req.json();
            const reply = json.choices[0].message.content;
            
            // AI Module Installation Parser
            const installRegex = /SystemRebuilder\.install\(['"](.*?)['"]\)/g;
            let match;
            let actionsTaken = false;
            while ((match = installRegex.exec(reply)) !== null) {
                SystemRebuilder.install(match[1]);
                actionsTaken = true;
            }

            if (!actionsTaken) addAIMessage(reply, false);
            else addAIMessage("Modules updated by AI.", false);

        } catch (err) {
            addAIMessage(`❌ CRITICAL: ${err.message}`, true);
        }
    }

    // --- 13. MQTT ---
    function connectMQTT() {
        if (typeof Paho === 'undefined') {
            console.warn("MQTT Library missing.");
            return;
        }
        const clientId = "termos-" + Math.random().toString(16).substr(2, 8);
        mqttClient = new Paho.MQTT.Client(MQTT_BROKER_URL, clientId);

        mqttClient.onConnectionLost = () => addSystemMessage("Connection Lost. Retrying...");
        setTimeout(() => { if(!mqttClient.isConnected()) connectMQTT(); }, 5000);

        mqttClient.onMessageArrived = (msg) => {
            try {
                const data = JSON.parse(msg.payloadString); // FIXED: Removed 'const' before JSON.parse
                if(data.user !== username) {
                    // Render received message
                    const container = getElem('main-app');
                    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    container.insertAdjacentHTML('beforeend', `
                        <div class="flex flex-row items-end gap-3 opacity-80">
                            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-mono text-white text-xs">${escapeHtml(data.user.substring(0,2).toUpperCase())}</div>
                            <div class="p-3 rounded-xl bg-slate-800/50 text-sm text-gray-300 max-w-[80%]">
                                <div class="opacity-70 text-[10px] font-mono text-gray-500 mb-1">@${escapeHtml(data.user.toUpperCase())}</div>
                                <p class="leading-relaxed">${escapeHtml(data.text)}</p>
                            </div>
                        </div>
                    `);
                    scrollToBottom();
                }
            } catch (e) { console.error(e); }
        };

        mqttClient.connect({
            onSuccess: () => {
                mqttClient.subscribe(`termchat/messages/${currentRoom}`);
                addSystemMessage("Uplink Established.");
            },
            onFailure: () => { addSystemMessage("MQTT Connection Failed."); },
            useSSL: true
        });
    }

    function publishMessage(text) {
        if (mqttClient && mqttClient.isConnected()) {
            mqttClient.publish(`termchat/messages/${currentRoom}`, JSON.stringify({ user: username, text: text }));
        }
    }

    // --- 14. UTILS ---
    function downloadCodeFile(filename, content) {
        // FIXED: Separated variable declarations
        let mimeType = 'text/plain';
        if(filename.endsWith('.js')) mimeType = 'text/javascript';
        
        const element = document.createElement('a');
        element.setAttribute('href', `data:${mimeType};charset=utf-8,` + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        addSystemMessage(`File saved: ${filename}`);
    }

    // --- 15. EVENT LISTENERS ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = document.getElementById('cmd-input') || document.getElementById('user-input');
            if (input && document.activeElement === input) {
                handleInput();
            }
        }
    });

    // God Mode Features Implementation
    window.renderVirtualDesktop = function() {
        const term = getElem('terminal-content');
        if(!term) return;
        term.innerHTML = `<div class="p-4 text-cyan-400 font-mono">VIRTUAL DESKTOP MODE ACTIVE...</div>`;
    };

</script>
