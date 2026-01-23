import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv
from backend import get_ai_response
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import socket

# Load Config
load_dotenv()
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.emqx.io")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "term-chat/global/v3"
AI_USER_ID = os.getenv("AI_USER_ID", "TERMAI")
PORT = int(os.getenv("PORT", 10000))

# GLOBAL CONVERSATION MEMORY
conversation_history = []
SYSTEM_INSTRUCTION = {
    "role": "system",
    "content": "You are TERMAI, a friendly AI assistant in TermChat LT, a Lithuanian terminal chat room. You speak both Lithuanian and English. Remember previous conversations and be helpful and conversational."
}

print(f"🚀 Starting TermChat AI Bot on port {PORT}")

# HTTP Server for Render
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        status = {"status": "AI Bot Running", "ai_id": AI_USER_ID}
        self.wfile.write(json.dumps(status).encode())
    
    def log_message(self, format, *args):
        pass

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("✅ MQTT Connected!")
        client.subscribe(MQTT_TOPIC)
        # Announce AI presence
        join_msg = json.dumps({"type": "join", "id": AI_USER_ID})
        client.publish(MQTT_TOPIC, join_msg)
        print(f"🤖 {AI_USER_ID} is now online!")
    else:
        print(f"❌ MQTT Failed: {reason_code}")

def on_message(client, userdata, msg, properties):
    global conversation_history
    
    try:
        payload = json.loads(msg.payload.decode())
        
        if payload.get("type") == "chat" and payload.get("id") != AI_USER_ID:
            user_message = payload.get("msg", "")
            sender_id = payload.get("id", "unknown")
            
            # Respond to questions or AI mentions
            if ("?" in user_message or 
                "ai" in user_message.lower() or 
                "termai" in user_message.lower()):
                
                print(f"💬 {sender_id}: {user_message}")
                
                # Add user message to history
                conversation_history.append({"role": "user", "content": f"{sender_id}: {user_message}"})
                
                # Prepare messages (system + last 10 messages)
                messages_to_send = [SYSTEM_INSTRUCTION] + conversation_history[-10:]
                
                # Get AI response with conversation context
                ai_response = get_ai_response(user_message, use_api=False, conversation=messages_to_send)
                
                # Add AI response to history
                conversation_history.append({"role": "assistant", "content": ai_response})
                
                # Send response
                response_payload = json.dumps({
                    "type": "chat",
                    "id": AI_USER_ID,
                    "msg": ai_response
                })
                client.publish(MQTT_TOPIC, response_payload)
                print(f"🤖 AI: {ai_response}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def start_mqtt():
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"💥 MQTT Error: {e}")

if __name__ == "__main__":
    # Start MQTT in background
    mqtt_thread = threading.Thread(target=start_mqtt, daemon=True)
    mqtt_thread.start()
    
    # Find free port if default is taken
    try:
        server = HTTPServer(('0.0.0.0', PORT), HealthHandler)
    except OSError:
        PORT = find_free_port()
        server = HTTPServer(('0.0.0.0', PORT), HealthHandler)
    
    print(f"🌐 HTTP server running on port {PORT}")
    server.serve_forever()