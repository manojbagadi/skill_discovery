# Skill Discovery Engine (SIH 2026)

A conversational AI agent designed for Indian engineering students to discover their natural technical strengths. 

This repository relies on **Open WebUI** as its frontend agent interface and uses a deterministic Python scoring engine as an LLM Tool.

---

## 🏗️ Architecture

1. **Frontend / Agent Interface**: [Open WebUI](https://github.com/open-webui/open-webui) (A massive, open-source ChatGPT clone with premium UI and tool support).
2. **Backend Logic**: `backend/open_webui_tool.py` (Our deterministic scoring formula and taxonomy, running as an isolated Python Tool inside Open WebUI).

---

## 🚀 Setup Instructions

Follow these exact steps to run the SIH prototype on your machine.

### 1. Start Open WebUI (via Docker)
Ensure you have Docker installed, then run the Open WebUI container. This sets up the entire premium chat interface locally:
```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```
*Once started, open `http://localhost:3000` in your browser and create your local admin account.*

### 2. Configure Your LLM API Key
Inside Open WebUI:
1. Go to **Settings > Connections**.
2. Enter your API key for Groq (recommended for speed and cost) or OpenAI/Gemini.

### 3. Upload the Custom Scoring Engine Tool
We must give the LLM the ability to run our math.
1. In Open WebUI, navigate to **Workspace > Tools**.
2. Click **`+`** to create a new Tool.
3. Open `backend/open_webui_tool.py` from this repository, copy all of the code, and paste it into the editor.
4. Name the tool `Skill_Discovery_Engine` and save it.

### 4. Create the Skill Discovery Agent
Now we create the specific agent character.
1. Navigate to **Workspace > Models**.
2. Click **`+`** to create a new Agent.
3. **Name**: Skill Discovery Mentor
4. **Base Model**: Select your preferred model (e.g. `llama3-70b-8192` via Groq).
5. **System Prompt**: Copy and paste the contents of `backend/system_prompt.md` into this box.
6. **Tools**: Scroll down and toggle the switch for your new `Skill_Discovery_Engine` tool.
7. Click **Save & Update**.

### 5. Run the Demo
Go to your main chat screen in Open WebUI, select your **Skill Discovery Mentor** model from the top dropdown, and say "Hi". 

The agent will interview you, extract your behavioral signals, and automatically call the Python tool to generate your deterministic Skill Hypotheses!
