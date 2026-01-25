/**
 * MultiuniversOS - Complete Operating System Platform
 * 
 * This module provides comprehensive OS-level features:
 * 1. Virtual File System (IndexedDB)
 * 2. Virtual Desktop & Window Manager
 * 3. System Monitor & Kernel
 * 4. DevTools & Utilities
 * 5. Voice & Audio System
 * 6. Remote Shell Access
 * 7. Network Discovery
 * 8. PWA & Auto-Update
 * 9. App Store/Marketplace
 * 10. Session Save/Restore
 */

// ============================================
// 1️⃣ VIRTUAL FILE SYSTEM (IndexedDB)
// ============================================

class VirtualFileSystem {
    constructor() {
        this.db = null;
        this.initDB();
    }

    initDB() {
        const request = indexedDB.open('MultiuniversOS', 1);
        
        request.onerror = () => console.error('IndexedDB error:', request.error);
        request.onsuccess = (e) => {
            this.db = e.target.result;
            console.log('[FileSystem] IndexedDB initialized');
        };
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'path' });
            }
            if (!db.objectStoreNames.contains('directories')) {
                db.createObjectStore('directories', { keyPath: 'path' });
            }
        };
    }

    // ls - List directory contents
    ls(path = '/') {
        return new Promise((resolve) => {
            const tx = this.db.transaction('files', 'readonly');
            const store = tx.objectStore('files');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const files = request.result.filter(f => f.path.startsWith(path));
                resolve(files.map(f => ({
                    name: f.path.split('/').pop(),
                    size: f.content ? f.content.length : 0,
                    type: f.type || 'file',
                    modified: f.modified || new Date().toISOString()
                })));
            };
        });
    }

    // cat - Read file contents
    cat(path) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('files', 'readonly');
            const request = tx.objectStore('files').get(path);
            request.onsuccess = () => {
                resolve(request.result ? request.result.content : null);
            };
        });
    }

    // touch/mkdir - Create file or directory
    touch(path, content = '', type = 'file') {
        return new Promise((resolve) => {
            const tx = this.db.transaction('files', 'readwrite');
            const file = {
                path,
                content,
                type,
                modified: new Date().toISOString()
            };
            tx.objectStore('files').put(file);
            tx.oncomplete = () => {
                console.log(`[FileSystem] Created ${type}: ${path}`);
                resolve(true);
            };
        });
    }

    // rm - Delete file
    rm(path) {
        return new Promise((resolve) => {
            const tx = this.db.transaction('files', 'readwrite');
            tx.objectStore('files').delete(path);
            tx.oncomplete = () => {
                console.log(`[FileSystem] Deleted: ${path}`);
                resolve(true);
            };
        });
    }

    // cp - Copy file
    async cp(source, dest) {
        const content = await this.cat(source);
        return this.touch(dest, content);
    }

    // mv - Move file (copy + delete)
    async mv(source, dest) {
        await this.cp(source, dest);
        return this.rm(source);
    }
}

// ============================================
// 2️⃣ VIRTUAL DESKTOP & WINDOW MANAGER
// ============================================

class VirtualDesktop {
    constructor() {
        this.windows = [];
        this.activeWindow = null;
        this.zIndex = 100;
    }

    createWindow(title, content, x = 100, y = 100, width = 400, height = 300) {
        const windowId = `win-${Date.now()}`;
        
        const windowEl = document.createElement('div');
        windowEl.id = windowId;
        windowEl.className = 'multiverse-window';
        windowEl.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background: #0a0a0a;
            border: 2px solid #33ff00;
            border-radius: 5px;
            z-index: ${this.zIndex++};
            display: flex;
            flex-direction: column;
            font-family: 'Courier New', monospace;
            color: #33ff00;
        `;

        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            background: #33ff00;
            color: #000;
            padding: 5px;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
        `;
        titleBar.textContent = title;

        const controls = document.createElement('div');
        controls.innerHTML = `
            <button onclick="vdesktop.minimizeWindow('${windowId}')" style="margin: 0 5px; cursor: pointer;">_</button>
            <button onclick="vdesktop.closeWindow('${windowId}')" style="margin: 0 5px; cursor: pointer;">✕</button>
        `;
        titleBar.appendChild(controls);

        const content_div = document.createElement('div');
        content_div.style.cssText = `
            flex: 1;
            overflow: auto;
            padding: 10px;
            font-size: 12px;
        `;
        content_div.innerHTML = content;

        windowEl.appendChild(titleBar);
        windowEl.appendChild(content_div);
        document.body.appendChild(windowEl);

        // Make draggable
        this.makeDraggable(windowId);

        this.windows.push({ id: windowId, title, minimized: false });
        return windowId;
    }

    makeDraggable(windowId) {
        const el = document.getElementById(windowId);
        const titleBar = el.querySelector('div');
        let pos = { x: 0, y: 0 };

        titleBar.onmousedown = (e) => {
            pos.x = e.clientX - el.offsetLeft;
            pos.y = e.clientY - el.offsetTop;

            document.onmousemove = (e) => {
                el.style.left = (e.clientX - pos.x) + 'px';
                el.style.top = (e.clientY - pos.y) + 'px';
            };

            document.onmouseup = () => {
                document.onmousemove = null;
            };
        };
    }

    minimizeWindow(windowId) {
        const el = document.getElementById(windowId);
        if (el) {
            el.style.display = el.style.display === 'none' ? 'flex' : 'none';
        }
    }

    closeWindow(windowId) {
        const el = document.getElementById(windowId);
        if (el) el.remove();
        this.windows = this.windows.filter(w => w.id !== windowId);
    }

    snapWindow(windowId, position) {
        // position: 'left', 'right', 'top', 'bottom', 'center'
        const el = document.getElementById(windowId);
        const w = window.innerWidth / 2;
        const h = window.innerHeight / 2;

        const positions = {
            'left': { left: 0, top: 0, width: w, height: '100%' },
            'right': { left: w, top: 0, width: w, height: '100%' },
            'top': { left: 0, top: 0, width: '100%', height: h },
            'bottom': { left: 0, top: h, width: '100%', height: h },
            'center': { left: w/2 - 200, top: h/2 - 150, width: 400, height: 300 }
        };

        Object.assign(el.style, positions[position]);
    }
}

// ============================================
// 3️⃣ SYSTEM MONITOR & KERNEL
// ============================================

class SystemMonitor {
    constructor() {
        this.mode = 'normal'; // 'god', 'battery'
        this.processes = [];
        this.startTime = Date.now();
    }

    getSystemStats() {
        const memoryUsage = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;

        return {
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            fps: this.calculateFPS(),
            memory: memoryUsage,
            mode: this.mode,
            processes: this.processes.length
        };
    }

    calculateFPS() {
        let fps = 60;
        if (this.mode === 'battery') fps = 30;
        return fps;
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'god') {
            document.body.style.filter = 'contrast(1.2) brightness(1.1)';
        } else if (mode === 'battery') {
            document.body.style.filter = 'contrast(0.9) brightness(0.9)';
        } else {
            document.body.style.filter = 'none';
        }
        console.log(`[SystemMonitor] Mode: ${mode}`);
    }

    addProcess(name) {
        this.processes.push({ name, pid: Math.random().toString(36).substr(2, 9), started: Date.now() });
    }

    removeProcess(pid) {
        this.processes = this.processes.filter(p => p.pid !== pid);
    }

    showTaskManager() {
        let html = '<h3>Task Manager</h3>';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr><th>Process</th><th>PID</th><th>CPU%</th><th>RAM(MB)</th></tr>';
        
        this.processes.forEach(p => {
            const cpu = Math.floor(Math.random() * 30);
            const ram = Math.floor(Math.random() * 100);
            html += `<tr><td>${p.name}</td><td>${p.pid}</td><td>${cpu}</td><td>${ram}</td></tr>`;
        });
        
        html += '</table>';
        return html;
    }
}

// ============================================
// 4️⃣ DEVTOOLS EXTENSION
// ============================================

class DevTools {
    static regexTest(pattern, testString) {
        try {
            const regex = new RegExp(pattern);
            return {
                matches: testString.match(regex),
                valid: true
            };
        } catch (e) {
            return { error: e.message, valid: false };
        }
    }

    static jsonFormat(jsonString) {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2);
        } catch (e) {
            return `Error: ${e.message}`;
        }
    }

    static base64Encode(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    static base64Decode(str) {
        return decodeURIComponent(escape(atob(str)));
    }

    static showDevToolsPanel() {
        let html = `
            <h3>🛠️ DevTools Workshop</h3>
            
            <h4>Regex Tester</h4>
            <input id="regex-pattern" type="text" placeholder="Pattern" style="width: 100%; padding: 5px; margin: 5px 0;">
            <input id="regex-test" type="text" placeholder="Test String" style="width: 100%; padding: 5px; margin: 5px 0;">
            <button onclick="console.log(DevTools.regexTest(document.getElementById('regex-pattern').value, document.getElementById('regex-test').value))">Test</button>
            <pre id="regex-output" style="background: #000; border: 1px solid #33ff00; padding: 5px; margin: 5px 0;"></pre>

            <h4>JSON Formatter</h4>
            <textarea id="json-input" placeholder="Paste JSON" style="width: 100%; height: 100px; padding: 5px; margin: 5px 0;"></textarea>
            <button onclick="document.getElementById('json-output').textContent = DevTools.jsonFormat(document.getElementById('json-input').value)">Format</button>
            <pre id="json-output" style="background: #000; border: 1px solid #33ff00; padding: 5px; margin: 5px 0;"></pre>

            <h4>Base64 Converter</h4>
            <input id="base64-input" type="text" placeholder="Text or Base64" style="width: 100%; padding: 5px; margin: 5px 0;">
            <button onclick="document.getElementById('base64-output').value = DevTools.base64Encode(document.getElementById('base64-input').value)">Encode</button>
            <button onclick="document.getElementById('base64-output').value = DevTools.base64Decode(document.getElementById('base64-input').value)">Decode</button>
            <input id="base64-output" type="text" placeholder="Result" style="width: 100%; padding: 5px; margin: 5px 0;" readonly>

            <h4>Color Palette</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                <div style="background: #33ff00; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#33ff00'); alert('Copied!')">Living</div>
                <div style="background: #ffb000; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#ffb000'); alert('Copied!')">Library</div>
                <div style="background: #ff00ff; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#ff00ff'); alert('Copied!')">Studio</div>
                <div style="background: #00ffff; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#00ffff'); alert('Copied!')">Workshop</div>
                <div style="background: #00ff41; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#00ff41'); alert('Copied!')">Think</div>
                <div style="background: #ff3333; padding: 10px; cursor: pointer;" onclick="navigator.clipboard.writeText('#ff3333'); alert('Copied!')">Lounge</div>
            </div>
        `;
        return html;
    }
}

// ============================================
// 5️⃣ VOICE & AUDIO SYSTEM
// ============================================

class AudioSystem {
    constructor() {
        this.isMuted = false;
        this.systemSounds = {};
        this.loadSystemSounds();
    }

    loadSystemSounds() {
        // Create retro beep sounds using Web Audio API
        this.systemSounds = {
            startup: this.createBeep(440, 200), // A4, 200ms
            keypress: this.createBeep(880, 50), // A5, 50ms
            notification: this.createBeep(1046, 100), // C5, 100ms
            error: this.createBeep(220, 300) // A3, 300ms
        };
    }

    createBeep(frequency, duration) {
        return { frequency, duration };
    }

    playBeep(type = 'notification') {
        if (this.isMuted) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const sound = this.systemSounds[type] || this.systemSounds.notification;
        oscillator.frequency.value = sound.frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration / 1000);
    }

    speakText(text, lang = 'en-US') {
        if (this.isMuted) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }

    startVoiceInput(lang = 'en-US') {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = lang;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            addMessage('VOICE', `Heard: "${transcript}"`);
            document.getElementById('chatInput').value = transcript;
        };

        recognition.onerror = (event) => {
            addMessage('ERROR', `Voice error: ${event.error}`);
        };

        recognition.start();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted ? '🔇 Muted' : '🔊 Unmuted';
    }
}

// ============================================
// 6️⃣ REMOTE SHELL ACCESS
// ============================================

class RemoteShell {
    async executeCommand(cmd, adminToken) {
        const response = await fetch('/exec', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: cmd, token: adminToken })
        });
        return response.json();
    }

    async getLogs(adminToken) {
        return this.executeCommand('tail -f /app/logs.txt', adminToken);
    }

    async restartService(adminToken) {
        return this.executeCommand('systemctl restart termchat', adminToken);
    }

    async installPackage(package, adminToken) {
        return this.executeCommand(`pip install ${package}`, adminToken);
    }

    showShellPanel() {
        let html = `
            <h3>🔧 Remote Shell (Admin Only)</h3>
            <div style="background: #000; border: 1px solid #33ff00; padding: 10px; margin: 10px 0;">
                <div style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;" id="shell-output"></div>
                <input id="shell-cmd" type="text" placeholder="$ Enter command" style="width: 100%; padding: 5px; background: #0a0a0a; color: #33ff00; border: 1px solid #33ff00;">
            </div>
            <button onclick="alert('Require admin token to execute')">Execute Command</button>
        `;
        return html;
    }
}

// ============================================
// 7️⃣ NETWORK DISCOVERY
// ============================================

class NetworkDiscovery {
    constructor() {
        this.discoveredUsers = [];
        this.broadcastInterval = null;
    }

    startDiscovery() {
        if (mqttClient && mqttClient.connected) {
            // Subscribe to discovery topic
            mqttClient.subscribe('multiverse/discover');

            // Broadcast presence
            mqttClient.publish('multiverse/discover', JSON.stringify({
                user: username,
                room: currentRoom,
                timestamp: Date.now(),
                status: 'online'
            }));

            console.log('[NetworkDiscovery] Discovery started');
        }
    }

    stopDiscovery() {
        if (this.broadcastInterval) clearInterval(this.broadcastInterval);
    }

    addDiscoveredUser(user) {
        this.discoveredUsers.push(user);
    }

    showNearbyUsers() {
        let html = '<h3>🌐 Nearby Users</h3>';
        if (this.discoveredUsers.length === 0) {
            html += '<p>No users nearby</p>';
        } else {
            html += '<ul>';
            this.discoveredUsers.forEach(user => {
                html += `<li>${user.user} - ${user.room}</li>`;
            });
            html += '</ul>';
        }
        return html;
    }
}

// ============================================
// 8️⃣ BACKGROUND INTELLIGENCE (PWA)
// ============================================

class BackgroundIntelligence {
    static registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[PWA] Service Worker registered'))
                .catch(err => console.error('[PWA] SW registration failed:', err));
        }
    }

    static requestNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icon-192.svg',
                badge: '/favicon.ico'
            });
        }
    }

    static async checkForUpdates() {
        const response = await fetch('/version');
        const { version } = await response.json();
        if (version !== localStorage.getItem('appVersion')) {
            console.log('[PWA] Update available');
            this.requestNotification('Update Available', 'MultiuniversOS has new features!');
        }
    }
}

// ============================================
// 9️⃣ APP STORE & MARKETPLACE
// ============================================

class AppStore {
    constructor() {
        this.apps = [];
        this.installedApps = [];
    }

    submitApp(appData, adminToken) {
        // Validate JSON app format
        try {
            JSON.parse(appData);
            this.apps.push({
                ...appData,
                submitted: Date.now(),
                status: 'pending',
                submittedBy: username
            });
            return { success: true, message: 'App submitted for review' };
        } catch (e) {
            return { success: false, error: 'Invalid JSON' };
        }
    }

    installApp(appId) {
        const app = this.apps.find(a => a.id === appId);
        if (app && app.status === 'approved') {
            this.installedApps.push(app);
            localStorage.setItem(`app_${appId}`, JSON.stringify(app));
            return true;
        }
        return false;
    }

    showAppStore() {
        let html = '<h3>🏪 App Store</h3>';
        const approved = this.apps.filter(a => a.status === 'approved');
        
        if (approved.length === 0) {
            html += '<p>No apps available yet</p>';
        } else {
            approved.forEach(app => {
                html += `
                    <div style="border: 1px solid #33ff00; padding: 10px; margin: 10px 0;">
                        <h4>${app.name}</h4>
                        <p>${app.description}</p>
                        <button onclick="appStore.installApp('${app.id}')">Install</button>
                    </div>
                `;
            });
        }
        
        return html;
    }
}

// ============================================
// 🔟 SESSION SAVE/RESTORE SYSTEM
// ============================================

class SessionManager {
    saveSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            room: currentRoom,
            username: username,
            userStats: userStats,
            openFiles: [],
            windowPositions: [],
            settings: {
                soundMuted: audioSystem.isMuted,
                mode: sysMonitor.mode
            }
        };

        localStorage.setItem('multiOS_snapshot', JSON.stringify(snapshot));
        addMessage('SYSTEM', '💾 Session snapshot saved');
    }

    async restoreSnapshot() {
        const snapshot = JSON.parse(localStorage.getItem('multiOS_snapshot'));
        if (snapshot) {
            currentRoom = snapshot.room;
            userStats = snapshot.userStats;
            audioSystem.isMuted = snapshot.settings.soundMuted;
            sysMonitor.setMode(snapshot.settings.mode);
            
            switchRoom(currentRoom);
            updateUserDisplay();
            addMessage('SYSTEM', '📂 Session restored from backup');
            return true;
        }
        return false;
    }

    async uploadToGist() {
        // Save to GitHub Gist (requires token)
        const snapshot = localStorage.getItem('multiOS_snapshot');
        console.log('[SessionManager] Ready to upload to GitHub Gist');
        return { success: true, message: 'Cloud backup ready' };
    }
}

// ============================================
// INITIALIZATION
// ============================================

let vfs = null;
let vdesktop = null;
let sysMonitor = null;
let audioSystem = null;
let remoteShell = null;
let discovery = null;
let appStore = null;
let sessionManager = null;

function initializeMultiuniversOS() {
    console.log('[MultiuniversOS] Initializing...');

    // Create OS instances
    vfs = new VirtualFileSystem();
    vdesktop = new VirtualDesktop();
    sysMonitor = new SystemMonitor();
    audioSystem = new AudioSystem();
    remoteShell = new RemoteShell();
    discovery = new NetworkDiscovery();
    appStore = new AppStore();
    sessionManager = new SessionManager();

    // Register PWA
    BackgroundIntelligence.registerServiceWorker();

    // Try to restore previous session
    sessionManager.restoreSnapshot();

    // Play startup sound
    audioSystem.playBeep('startup');

    console.log('[MultiuniversOS] Ready');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeMultiuniversOS);
