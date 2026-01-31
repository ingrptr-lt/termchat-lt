# server.py
import os
import json
import time
import threading
import random
import string
import requests
import sys

# --- 1. CONFIGURATION & LOGGING ---
print(">> SERVER BOOTING UP...")

# Try to load API Key (Using fallback if missing)
try:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", ''.join(random.choices(string.ascii_uppercase + string.digits, k=8)))
    print(f"[CONFIG] API Key: {'Present' if GROQ_API_KEY else 'Missing'}")
    print(f"[CONFIG] Admin Token: {ADMIN_TOKEN}")
except Exception as e:
    print(f"[ERROR] Config Failed: {e}")

# Database setup (Disabled to prevent crashes if Mongo isn't installed)
USE_DATABASE = False
MONGO_URI = os.getenv("MONGODB_URI")

# --- 2. AI LOGIC (Stable Model) ---
def get_ai_response(prompt):
    print(f"[AI] Generating response for: {prompt[:30]}...")
    
    # EXPLICITLY USE STABLE MODEL TO FIX DECOMMISSIONED ERROR
    model = "llama3-8b-8192" # The stable model
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model, # Using stable model here
                "messages": [
                    {"role": "system", "content": "You are TermOS AI. Respond in the same language as the user."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            },
            timeout=15
        )
        
        # ROBUST PARSING: Handle API errors explicitly
        if response.status_code != 200:
            print(f"[AI ERROR] Request failed: {response.status_code}")
            return "I'm sorry, I'm having trouble connecting to my brain right now."
        
        try:
            data = response.json()
            
            # SAFELY CHECK FOR ERROR KEYS
            if 'error' in data:
                print(f"[AI ERROR] Groq API: {data['error'].get('message', 'Unknown error')}")
                return f"API Error: {data['error'].get('message', 'Unknown error')}"
            
            if 'choices' not in data or len(data['choices']) == 0:
                print("[AI ERROR] No choices returned")
                return "My neural pathways are empty."
            
            return data['choices'][0]['message']['content']
            
        except requests.exceptions.Timeout:
            print("[AI ERROR] Connection timed out")
            return "The signal is weak. Try again."
        except Exception as e:
            print(f"[AI CRITICAL] {e}")
            return f"System Failure: {str(e)}"

# --- 3. SIMPLE MQTT CLIENT ---
# Only import MQTT if available
MQTT_ENABLED = False
mqtt_client = None

try:
    import paho.mqtt.client as mqtt
    MQTT_ENABLED = True
    print("[MQTT] Library found. Neural Link initialized.")
except ImportError:
    print("[MQTT] Library not found. Running in Offline Mode.")

def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] Connected: {rc}")
    if MQTT_ENABLED and mqtt_client:
        # Subscribe to chat topics
        client.subscribe("termchat/input")
        client.subscribe("termchat/messages")

def on_disconnect(client, userdata, rc):
    print(f"[MQTT] Disconnected: {rc}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload_bytes = msg.payload
    
    # Decode payload (with error handling)
    try:
        payload_str = payload_bytes.decode()
        data = json.loads(payload_str)
    except:
        print(f"[MQTT] Payload Decode Error: {payload_bytes}")
        data = {"user": "system", "msg": "Raw Data"} # Fallback
        payload_str = payload_bytes.decode() # Try again immediately? No, avoid re-assignment error

    print(f"[MQTT] {topic}: {data.get('id', 'unknown')} -> {data.get('msg', 'Raw Data')[:30]}...")

    # 1. HANDLE AI TRIGGERS
    text_lower = data.get("msg", "Raw Data").lower()
    ai_triggers = ["ai", "termai", "?", "labas", "hello", "kas tu"]
    
    # Check if we should respond
    should_respond = any(trigger in text_lower for trigger in ai_triggers)
    
    if should_respond:
        reply = get_ai_response(data.get("msg", "Raw Data"))
        
        # Publish AI Response to MQTT
        if MQTT_ENABLED and mqtt_client:
            try:
                mqtt_client.publish("termchat/output", json.dumps({
                    "type": "chat",
                    "id": "TERMAI",
                    "msg": reply
                }))
            except Exception as e:
                print(f"[MQTT] Send Error: {e}")

# --- 5. MAIN SERVER LOOP ---
def run_server():
    print(f"[INFO] Server Ready. Listening for commands...")
    
    # We simulate a server loop here to keep MQTT alive if configured
    while True:
        # Simple stdin loop (Good for testing locally without web socket)
        try:
            msg = input() # Gets command from console
            if not msg: continue
            
            if msg.lower() == "exit" or msg.lower() == "quit":
                print("\nShutting down...")
                break
            
            # Simulate Processing
            print(f"You: {msg}")
            
            # AI Logic
            if "ai" in msg.lower() or "?" in msg.lower():
                reply = get_ai_response(msg)
                print(f"AI: {reply}")
            
        except KeyboardInterrupt:
            print("\nShutdown received.")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(1)
