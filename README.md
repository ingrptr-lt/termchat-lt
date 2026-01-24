# TermOS LT 🌌

A revolutionary multiverse operating system with AI assistant, gamification, and extensible plugin architecture. Built with MQTT for real-time collaboration.

## 🚀 Features

✨ **Multiverse Chat** - Navigate between themed rooms with specialized AI personalities  
🤖 **Agentic AI Assistant** - TERMAI performs real actions, not just text responses  
🎮 **Gamification System** - Level up, unlock avatars, earn XP for activities  
🔌 **Plugin Ecosystem** - Extend the platform with custom Python scripts  
📱 **Progressive Web App** - Install as native app with offline support  
🎨 **Retro Terminal UI** - Green phosphor CRT aesthetics with ASCII avatars  
🗣️ **Voice Interface** - Full duplex voice conversation with AI  
🌍 **Multilingual Support** - Auto-detects and responds in user's language  
🔗 **Viral Sharing** - Create and share custom rooms with friends

## 🤖 TERMAI - Agentic AI Assistant

**TERMAI** is an intelligent agent that:
- 🎵 **Plays Music** - "Play some jazz" → Actually plays music
- 🛠️ **Opens Panels** - "Open the game console" → Launches game interface
- 🧠 **Remembers Everything** - Stores preferences in vector database
- 🗣️ **Speaks Aloud** - Voice synthesis in detected language
- 🔍 **Function Calls** - Executes real system functions, not just text
- 🌍 **Multilingual** - Auto-detects and responds in English, Lithuanian, etc.
- 🏠 **Room Personalities** - Different AI behavior per room

## 🎮 Gamification & Progression

**Level System**: Newbie → Apprentice → Coder → Hacker → Architect → Wizard → Master → Guru → Legend → Arch-Mage

**Earn XP for**:
- 💬 Sending messages (+1 XP)
- 🛠️ Creating apps (+50 XP)
- 🎮 Starting games (+30 XP)
- 🔗 Sharing rooms (+25 XP)
- 🔌 Creating plugins (+100 XP)

**Unlock ASCII Avatars**:
```
Level 3: Hacker    Level 5: Wizard    Level 8: Ninja
  /\_/\              /\                 ◢◤
 ( o.o )            /  \                o_o
 =^.^=             \__/                /|\
                   o_o                 / \
                   /|\
```

## 🌌 Live Multiverse

🚀 **Enter the Multiverse**: [https://termchat-lt.onrender.com](https://termchat-lt.onrender.com)

### 🏠 Explore Themed Rooms
- 📚 **Library** - Learn with AI Librarian
- 🎨 **Studio** - Create art, music, apps with AI Artist
- 🛠️ **Workshop** - Code and build with AI Engineer
- 🎭 **Lounge** - Play games with AI Entertainment Host
- 🧠 **Think Tank** - Solve problems with AI Strategist

### 🔌 Try These Commands
```
/share          - Create shareable room
/stats          - View your level and XP
/avatar         - Browse unlocked avatars
/voice          - Start voice conversation
/admin          - Upload custom plugins
"Play music"    - AI plays actual music
"Create app"    - AI builds working app
"Start game"    - AI launches interactive game
```

## 🔌 Plugin Ecosystem

**Create Custom Extensions** - Upload Python scripts to extend functionality

### Example Plugin: Auto Greeter
```python
def handle_trigger(trigger_type, data):
    if trigger_type == 'user_join':
        return {
            'action': 'send_message',
            'message': f'Welcome {data["user_id"]}! 🎉',
            'target': 'all'
        }
```

### Security Features
- 🔒 **RestrictedPython** - Compile-time security
- 🐳 **Docker Sandboxing** - Runtime isolation
- 🚫 **No Network Access** - Plugins run offline
- ⏱️ **Resource Limits** - 128MB RAM, 10s timeout

### Plugin Triggers
- `user_join` - New user connects
- `message` - User sends message
- `room_change` - User switches rooms
- `app_created` - User creates app
- `game_started` - User starts game

## 🎨 Technical Architecture

### Frontend (Progressive Web App)
- 📱 **PWA** - Installable with offline support
- 🌐 **Pure Web** - HTML5/CSS3/JavaScript
- 🔊 **Voice Interface** - Web Speech API integration
- 🎮 **Gamification** - XP system with localStorage persistence
- 🔗 **Room Sharing** - URL-based room joining
- 🎨 **ASCII Avatars** - Retro terminal aesthetics

### Backend (Agentic AI Service)
- 🤖 **Function Calling** - AI performs real actions
- 🧠 **Vector Memory** - ChromaDB for user preferences
- 🔌 **Plugin System** - Docker-sandboxed Python execution
- 🌍 **Multilingual** - Zhipu GLM-4 with language detection
- 💾 **Database** - MongoDB for message persistence
- 🔒 **Security** - Rate limiting, XSS protection, restricted execution

### Deployment
- Frontend: Static hosting (GitHub Pages, Netlify)
- Backend: Cloud service (Render, Heroku)
- MQTT: Public broker (broker.emqx.io)

### Environment Variables (.env)
```bash
ZHIPU_API_KEY=your-zhipu-api-key
MONGODB_URI=mongodb://localhost:27017/
PORT=10000
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Start multiverse backend
python mqtt_service.py

# Serve frontend (optional)
python -m http.server 8000
```

### Production Deployment
1. **Frontend**: Deploy to GitHub Pages/Netlify (static PWA)
2. **Backend**: Deploy to Render/Heroku (Python service)
3. **Database**: MongoDB Atlas for persistence
4. **Docker**: Required for plugin system security

## 📊 System Status

- ✅ **TIER 1**: Production-grade PWA with persistence
- ✅ **TIER 2**: Agentic AI with function calling
- ✅ **TIER 3**: Viral growth with gamification
- ✅ **TIER 4**: Plugin ecosystem with Docker security

**TermOS LT is now a complete multiverse operating system ready for viral growth!** 🎆
