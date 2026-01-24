import paho.mqtt.client as mqtt
import json
import os
from dotenv import load_dotenv
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
# from zhipuai import ZhipuAI

# Load Config
load_dotenv()
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY")
AI_PROVIDER = os.getenv("AI_PROVIDER", "zhipu")
PORT = int(os.getenv("PORT", 10000))

# Debug environment variables (masked for security)
print(f"ZHIPU_API_KEY Found: {bool(ZHIPU_API_KEY)}")
print(f"AI_PROVIDER: {AI_PROVIDER}")

# AI Configuration
MODEL_NAME = "glm-4"
SYSTEM_PROMPT = """Tu esi TermAi, draugiškas AI asistentas TermChat LT kambaryje. Atsakyk trumpai ir aiškiai lietuvių kalba."""
# zhipu_client = ZhipuAI(api_key=ZHIPU_API_KEY) if ZHIPU_API_KEY else None

# Global conversation history with size limit
conversation_history = []
MAX_CONVERSATION_HISTORY = 50

def on_connect(client, userdata, flags, reason_code):
    if reason_code == 0:
        print("✅ MQTT Connected!")
        client.subscribe("term-chat/global/v3")
    else:
        print(f"❌ MQTT Failed: {reason_code}")

import re

def calculate_math(text):
    """Simple calculator for basic math operations"""
    # Look for simple math expressions like "45628+63524" or "45628 + 63524"
    math_pattern = r'(\d+)\s*([+\-*/])\s*(\d+)'
    match = re.search(math_pattern, text)
    
    if match:
        num1, operator, num2 = match.groups()
        num1, num2 = int(num1), int(num2)
        
        if operator == '+':
            return f"{num1} + {num2} = {num1 + num2}"
        elif operator == '-':
            return f"{num1} - {num2} = {num1 - num2}"
        elif operator == '*':
            return f"{num1} * {num2} = {num1 * num2}"
        elif operator == '/':
            if num2 != 0:
                return f"{num1} / {num2} = {num1 / num2}"
            else:
                return "Negalima dalinti iš nulio / Cannot divide by zero"
    return None

def on_message(mqtt_client, userdata, message):
    global conversation_history
    
    try:
        payload = json.loads(message.payload.decode())
        if payload.get("type") != "chat" or payload.get("id") == "TERMAI":
            return
            
        user_text = payload.get("msg", "")
        sender_id = payload.get("id", "unknown")
        print(f"[MQTT] Received from {sender_id}: {user_text}")

        # Check for simple math first (only if it's clearly a math expression)
        math_result = calculate_math(user_text)
        if math_result and re.search(r'\d+\s*[+\-*/]\s*\d+', user_text):
            response_payload = json.dumps({
                "type": "chat",
                "id": "TERMAI",
                "msg": math_result
            })
            mqtt_client.publish("term-chat/global/v3", response_payload)
            return

        # Check if user is asking AI
        triggers = ['ai', 'termai', '?']
        is_trigger = any(t in user_text.lower() for t in triggers)

        if not is_trigger:
            return

        # Add User to History with sender ID
        conversation_history.append({"role": "user", "content": f"{sender_id}: {user_text}"})
        
        # Limit conversation history to prevent memory leak
        if len(conversation_history) > MAX_CONVERSATION_HISTORY:
            conversation_history = conversation_history[-MAX_CONVERSATION_HISTORY:]

        # Keep last 20 messages for better context
        messages_to_send = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + conversation_history[-20:]

        try:
            # Simple AI responses without API
            user_lower = user_text.lower()
            
            if "labas" in user_lower or "hello" in user_lower or "hi" in user_lower:
                ai_reply = "Labas! Kaip sekasi? Galiu padėti su skaičiavimais ir atsakyti į klausimus."
            elif "kaip" in user_lower and "sekasi" in user_lower:
                ai_reply = "Ačiū, kad klausi! Aš esu TermAi ir viskas gerai. O kaip tau?"
            elif "kas" in user_lower and ("esi" in user_lower or "tu" in user_lower):
                ai_reply = "Aš esu TermAi - AI asistentas šiame chat kambaryje. Galiu padėti su skaičiavimais!"
            elif "ačiū" in user_lower or "thanks" in user_lower:
                ai_reply = "Prašom! Visada maloniai padėsiu."
            elif "viso" in user_lower or "bye" in user_lower:
                ai_reply = "Viso gero! Iki pasimatymo!"
            elif "?" in user_text:
                ai_reply = "Įdomus klausimas! Deja, dar mokausi atsakyti į sudėtingesnius klausimus."
            else:
                ai_reply = "Labas! Aš esu TermAi. Galiu padėti su skaičiavimais (pvz: 5+3) ir paprastais klausimais."

            print(f"[AI] Simple Response: {ai_reply}")

            # Add AI to History
            conversation_history.append({"role": "assistant", "content": ai_reply})

            # Send Reply
            response_payload = json.dumps({
                "type": "chat",
                "id": "TERMAI",
                "msg": ai_reply
            })
            mqtt_client.publish("term-chat/global/v3", response_payload)

        except Exception as e:
            print(f"[ERROR] AI Call Failed: {e}")
            # Simple fallback responses
            fallback_responses = {
                "labas": "Labas! Kaip sekasi?",
                "hello": "Hello! How are you?",
                "hi": "Hi there!",
                "ačiū": "Prašom!",
                "thanks": "You're welcome!"
            }
            
            # Check for simple greetings
            simple_response = None
            for word, response in fallback_responses.items():
                if word in user_text.lower():
                    simple_response = response
                    break
            
            if not simple_response:
                simple_response = "Labas! Aš esu TermAi. Galiu padėti su skaičiavimais ir atsakyti į klausimus."
            
            error_payload = json.dumps({
                "type": "chat",
                "id": "TERMAI",
                "msg": simple_response
            })
            mqtt_client.publish("term-chat/global/v3", error_payload)
            
    except Exception as e:
        print(f"❌ Error: {e}")

# HTTP Server for Render
class HealthCheckHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"TermChat-LT AI Service is Running")

def run_http_server():
    server = HTTPServer(('0.0.0.0', PORT), HealthCheckHandler)
    print(f"[HTTP] Health check running on port {PORT}")
    server.serve_forever()

if __name__ == '__main__':
    # Start HTTP in background thread
    http_thread = threading.Thread(target=run_http_server)
    http_thread.daemon = True
    http_thread.start()

    # Initialize MQTT Client
    mqtt_client = mqtt.Client()
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    # Connect to MQTT
    try:
        mqtt_client.connect("broker.emqx.io", 1883, 60)
        mqtt_client.loop_forever()
    except KeyboardInterrupt:
        mqtt_client.disconnect()