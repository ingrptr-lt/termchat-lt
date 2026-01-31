# server.py
import os
import json
import time
import threading
import random
import string
import requests
import sys

# --- 1. CONFIGURATION ---
# Try to load environment variables safely
try:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)))
except Exception as e:
    print(f"[CONFIG ERROR] Failed to load env vars: {e}")
    print("[INFO] Using fallback configuration...")
    GROQ_API_KEY = ""  # Fallback to empty to prevent None errors
    ADMIN_TOKEN = "ADMIN123" # Fallback token

# Database setup (Disabled by default for stability)
USE_DATABASE = False
MONGO_URI = None

# --- 2. LOGGING ---
def log_message(msg):
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}")

# --- 3. AI LOGIC (Using Stable Model) ---
def get_ai_response(prompt):
    if not GROQ_API_KEY:
        return "❌ AI API Key Missing."
    
    try:
        system_prompt = "You are TermOS AI. Respond in the same language as the user."
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                # USING STABLE MODEL TO FIX DECOMMISSIONED ERROR
                "model": "llama3-8b-8192",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            },
            timeout=15
        )
        
        if response.status_code != 200:
            log_message(f"AI Request Failed: {response.status_code}")
            return "I'm sorry, I'm having trouble connecting to my brain right now."
            
        data = response.json()
        
        # Check for API errors explicitly
        if 'error' in data:
            log_message(f"API Error: {data['error'].get('message', 'Unknown error')}")
            return f"API Error: {data['error'].get('message', 'Unknown error')}"
        
        if 'choices' not in data or len(data['choices']) == 0:
            log_message("API returned no choices")
            return "My neural pathways are empty."
            
        return data['choices'][0]['message']['content']

    except requests.exceptions.Timeout:
        log_message("AI Connection Timed Out")
        return "The signal is weak. Try again."
    except Exception as e:
        log_message(f"AI Critical Error: {e}")
        return f"System Failure: {str(e)}"

# --- 4. SIMPLE MQTT CLIENT (Robust Version) ---
# Only imports MQTT if available, otherwise runs in "Offline Mode"
mqtt_client = None
MQTT_ENABLED = False

try:
    import paho.mqtt.client as mqtt
    MQTT_ENABLED = True
    log_message("MQTT Library found. Neural Link initialized.")
except ImportError:
    log_message("MQTT Library not found. Running in Offline Mode.")

def on_connect(client, userdata, flags, rc):
    log_message(f"MQTT Connected: {rc}")
    client.subscribe("termchat/input")
    client.subscribe("termchat/messages")

def on_disconnect(client, userdata, rc):
    log_message(f"MQTT Disconnected: {rc}")
    # Simple reconnect logic could go here, but kept minimal for stability

def on_message(client, userdata, msg):
    topic = msg.topic
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        user_id = data.get("id", "system")
        message_text = data.get("msg", payload)
    except:
        user_id = "system"
        message_text = payload

    # Log message
    print(f"[MQTT] {topic}: {user_id} -> {message_text[:30]}...")

    # 1. Handle AI Triggers
    text_lower = message_text.lower()
    ai_triggers = ["ai", "termai", "?", "labas", "hello", "kas tu"]
    
    if any(trigger in text_lower for trigger in ai_triggers):
        reply = get_ai_response(message_text)
        
        # Publish AI Response
        if MQTT_ENABLED and mqtt_client:
            try:
                mqtt_client.publish("termchat/output", json.dumps({
                    "type": "chat",
                    "id": "TERMAI",
                    "msg": reply
                }))
            except Exception as e:
                log_message(f"MQTT Send Error: {e}")

# --- 5. MAIN SERVER LOOP ---
def run_server():
    # We simulate a server here. In a real deployment with Render, 
    # you would just run this script. 
    # For now, it keeps the MQTT connection alive.
    
    print(">> SERVER STARTING...")
    print(f"[CONFIG] API Key Present: {bool(GROQ_API_KEY)}")
    print(f"[INFO] Mode: {'Online' if MQTT_ENABLED else 'Offline'}")

    if MQTT_ENABLED:
        try:
            # Initialize Client
            # Note: Render might require port 10000
            port = int(os.environ.get("PORT", 10000))
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
            client.on_connect = on_connect
            client.on_message = on_message
            client.on_disconnect = on_disconnect
            
            print(f"[MQTT] Connecting to broker.emqx.io:{port}...")
            client.connect("broker.emqx.io", port, 60)
            
            # Blocking loop to keep script running
            client.loop_forever()
            
        except Exception as e:
            log_message(f"MQTT Critical Error: {e}")
    else:
        print("[INFO] Waiting for messages via stdin (Offline Mode)...")
        # Simple stdin loop for testing without MQTT
        try:
            while True:
                msg = input()
                if msg.lower() in ["exit", "quit"]:
                    print("Shutting down...")
                    break
                print(f"You: {msg}")
                # Simulate processing
                if "ai" in msg.lower() or "?" in msg.lower():
                    reply = get_ai_response(msg)
                    print(f"AI: {reply}")
        except KeyboardInterrupt:
            print("\nShutdown received.")

if __name__ == '__main__':
    run_server()
