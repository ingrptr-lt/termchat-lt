@echo off

REM Check if .env exists
if not exist .env (
    echo ⚠️ Error: .env file not found!
    echo Please copy .env.example to .env and add your API key.
    pause
    exit /b 1
)

REM Check if requirements are installed
python -c "import streamlit, openai, dotenv" 2>nul
if errorlevel 1 (
    echo 📦 Installing requirements...
    pip install -r requirements.txt
)

echo 🚀 Starting TermChat LT...
streamlit run app.py