# TermChat LT 🌍

A terminal-style real-time chat application with multilingual AI assistant built with MQTT, featuring retro aesthetics and global language support.

## Features

✨ **Real-time Chat** - Connect with users worldwide via MQTT protocol  
🤖 **Multilingual AI Assistant** - TERMAI responds in English, Lithuanian, and more  
🎨 **Retro Terminal UI** - Green phosphor CRT-style interface with typewriter effects  
📻 **Radio Streaming** - Listen to online radio while chatting  
📱 **Progressive Web App** - Install as native app on mobile and desktop  
🌐 **No Installation Required** - Works in any modern web browser  
🌍 **Multilingual Support** - AI responds in user's language automatically

## AI Assistant

**TERMAI** is the built-in multilingual AI assistant that:
- Responds to messages containing "ai" or "termai"
- Answers questions ending with "?"
- **Auto-detects language** and responds in English, Lithuanian, etc.
- Uses Zhipu GLM-4 model with intelligent fallbacks
- Maintains conversation context
- Specialized personalities for different rooms

## Live Demo

🚀 **Try it now**: [https://dauptr.github.io/termchat-lt/](https://dauptr.github.io/termchat-lt/)

- Enter any username (3+ characters)
- Chat with users worldwide
- Ask TERMAI questions in English or Lithuanian
- Experience retro terminal aesthetics

## Quick Start

1. Visit [https://dauptr.github.io/termchat-lt/](https://dauptr.github.io/termchat-lt/)
2. Enter username
3. Start chatting!
4. Try: "Hello TERMAI" or "Labas TERMAI"

## Technical Architecture

### Frontend (index.html)
- Pure HTML5/CSS3/JavaScript
- MQTT WebSocket client (Paho)
- No external AI dependencies
- Sends messages, displays responses

### Backend (mqtt_service.py)
- Python MQTT service
- Zhipu GLM-4 AI integration
- Conversation memory
- Lithuanian language prompts

### Deployment
- Frontend: Static hosting (GitHub Pages, Netlify)
- Backend: Cloud service (Render, Heroku)
- MQTT: Public broker (broker.emqx.io)

## Setup & Configuration

### Environment Variables (.env)
```bash
ZHIPU_API_KEY=your-zhipu-api-key
AI_PROVIDER=zhipu
PORT=10000
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Start MQTT service
python mqtt_service.py

# Start web server
python -m http.server 8000
```

### Cloud Deployment
1. **Backend**: Deploy mqtt_service.py to Render/Heroku
2. **Frontend**: Deploy index.html to GitHub Pages/Netlify
3. **Environment**: Set ZHIPU_API_KEY in cloud service

## MQTT Configuration

- **Broker**: broker.emqx.io:1883 (Python) / :8084 (WebSocket)
- **Topic**: term-chat/global/v3
- **Protocol**: MQTT v5 (Python) / WebSocket (Browser)

## AI Integration

**Zhipu GLM-4 Model** with multilingual capabilities:
- **Auto-language detection** - responds in user's language
- **English & Lithuanian** optimized responses
- Conversation context awareness
- Trigger-based responses ("ai", "termai", "?")
- Intelligent fallback system
- Room-specific personalities

**Example Interactions**:
```
User: "Hello TERMAI, who are you?"
TERMAI: "Hello! I'm TERMAI, your AI assistant. How can I help you?"

User: "Labas TERMAI, kas tu esi?"
TERMAI: "Labas! Aš esu TERMAI - dirbtinio intelekto asistentas."
```
