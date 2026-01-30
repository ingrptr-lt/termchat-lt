import sys
import os
import subprocess

# --- SMART BOOTSTRAPPER: CHECK FOR CRITICAL DEPENDENCIES ---
try:
    import streamlit as st
# ... imports ...

# --- TESTING: SIMULATE ERROR MODE ---
# If you add "?simulate_error=1" to the URL, the app will pretend OpenAI is missing
if "simulate_error" in st.query_params:
    print("⚠️ TEST MODE: Simulating Missing Dependency")
    # We manually delete it from loaded modules to force the error
    if 'openai' in sys.modules:
        del sys.modules['openai']
    # Raise the error that the sidebar is designed to catch
    raise ImportError("SIMULATED: Neural Link (OpenAI) Module Missing")

# --- SMART BOOTSTRAPPER ---
# ... rest of your code ...
    except ImportError:
    print("\n" + "="*50)
    print(" CRITICAL SYSTEM ERROR: STREAMLIT NOT FOUND")
    print("="*50)
    print("The application requires libraries to run.")
    print("\nPlease run the auto-installer:")
    print("  Windows: Double-click 'install.bat'")
    print("  Mac/Linux: Run './install.sh' in terminal")
    print("\nOr install manually:")
    print("  pip install -r requirements.txt")
    print("="*50 + "\n")
    sys.exit(1)

# --- HELPER: AUTO-INSTALL FUNCTION ---
def auto_repair_system():
    """Installs requirements.txt directly from inside the app"""
    st.info("🛠️ INITIATING SYSTEM REPAIR...")
    st.code("pip install -r requirements.txt", language="bash")
    
    # Create a placeholder for the output
    output_placeholder = st.empty()
    
    try:
        # Run pip install
        process = subprocess.Popen(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Stream output to the UI
        with output_placeholder.container():
            with st.spinner("Downloading and Installing Modules..."):
                for line in process.stdout:
                    st.text(line)
        
        process.wait()
        
        if process.returncode == 0:
            st.success("✅ REPAIR COMPLETE. RESTARTING SYSTEM...")
            st.balloons()
            time.sleep(2)
            st.rerun()
        else:
            st.error("❌ REPAIR FAILED. Check console logs.")
            
    except Exception as e:
        st.error(f"CRITICAL ERROR DURING REPAIR: {e}")
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
import time # Ensure this is imported at the top

# ... existing imports ...

with st.sidebar:
    st.title("🟢 TERMOS PY")
    st.caption("System Status: ONLINE")
    
    # --- SYSTEM DIAGNOSTICS ---
    with st.expander("🔧 SYSTEM DIAGNOSTICS", expanded=False):
        # Check for OpenAI
        try:
            import openai
            st.success("✅ Neural Link (OpenAI) Active")
        except ImportError:
            st.error("❌ Neural Link (Openai) MISSING")
            st.warning("Click 'SYSTEM REPAIR' below to fix.")
        
        # Check for Dotenv
        try:
            from dotenv import load_dotenv
            st.success("✅ Env Loader Active")
        except ImportError:
            st.error("❌ Env Loader MISSING")
            
    # --- AUTO REPAIR BUTTON ---
    # If dependencies are missing, show a big red button
    try:
        import openai
        from dotenv import load_dotenv
    except ImportError:
        st.markdown("---")
        st.error("SYSTEM CORRUPTION DETECTED")
        if st.button("🚀 SYSTEM REPAIR (AUTO-INSTALL)", type="primary"):
            auto_repair_system()

    st.markdown("---")
    
    # --- SETTINGS (Your existing settings) ---
    # API Key Logic
    api_key = st.secrets.get("OPENAI_API_KEY") or os.environ.get("OPENAI_API_KEY")
    
    if api_key and api_key.startswith("sk-"):
        st.success("✅ API Key Connected")
        use_api = st.checkbox("Smart Mode (API)", value=True)
    else:
        st.error("❌ No API Key - Check .env file")
        use_api = False
    
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()
    
    st.caption(f"Messages: {len(st.session_state.messages)}")
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
