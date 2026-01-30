import streamlit as st
import sys
import os
from dotenv import load_dotenv

# Load variables from .env into the environment
load_dotenv()

# Add the current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from backend import get_ai_response
except ImportError:
    st.error("Backend import failed. Make sure termAi is installed.")
    st.stop()

# 1. Check for API Key in Environment Variables
api_key = os.environ.get("OPENAI_API_KEY")

# 2. Page Config
st.set_page_config(
    page_title="TermChat LT",
    page_icon="🟢",
    layout="wide"
)

# 3. Custom CSS for Terminal Dark Mode
st.markdown("""
    <style>
    .stApp {
        background-color: #000000;
        color: #00ff00;
        font-family: 'Courier New', monospace;
    }
    .stTextInput > div > div > input {
        background-color: #001100;
        color: #00ff00;
        border: 1px solid #00ff00;
        font-family: 'Courier New', monospace;
    }
    .stChatMessage {
        background-color: #001100;
        border-left: 3px solid #00ff00;
    }
    .stSidebar {
        background-color: #001100;
    }
    </style>
    """, unsafe_allow_html=True)

# 4. Initialize Chat History
if "messages" not in st.session_state:
    st.session_state.messages = []

# 5. Sidebar
with st.sidebar:
    st.title("🟢 TERMCHAT LT")
    st.write("AI SETTINGS")
    
    # Show API status
    if api_key and api_key != "your-key-here":
        st.success("✅ API Key Found")
        use_api = st.checkbox("Smart Mode (API)", value=True)
    else:
        st.error("❌ No API Key - Check .env file")
        use_api = False
    
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()
    
    st.markdown("---")
    st.caption("Powered by termAi")
    st.caption(f"Messages: {len(st.session_state.messages)}")

# 6. Display Chat History
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 7. Handle User Input
if prompt := st.chat_input("RAŠYKITE ŽINUTĘ..."):
    # Display user message
    st.chat_message("user").markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Generate AI Response
    with st.chat_message("assistant"):
        if not api_key or api_key == "your-key-here":
            st.error("🔴 API Key Missing. Check your .env file.")
            response = "System: No API Key provided. Using local AI."
            response = get_ai_response(prompt, use_api=False)
        else:
            with st.spinner("TERMAI GALVOJA..."):
                try:
                    response = get_ai_response(prompt, use_api=use_api)
                    if use_api:
                        st.success("✅ API Connected")
                except Exception as e:
                    st.error(f"🔴 Connection Error: {e}")
                    response = get_ai_response(prompt, use_api=False)
        
        st.markdown(response)
    
    # Add AI response to history
    st.session_state.messages.append({"role": "assistant", "content": response})
