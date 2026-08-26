# 🧠 Skill Discovery Engine — SaaS Architecture
> **SIH 2026 | UNESCO Young Scientist Expo 2026**
> 
> *"We don't tell students what to learn. We make them confess what they already love."*
> 
> 📄 **Master Blueprint**: [SIH_Skill_Discovery_Engine_Master_Blueprint.md](file:///home/harsha/sih/SIH_Skill_Discovery_Engine_Master_Blueprint.md)

---

## 🏛️ Architecture Overview

This is a **Cognitive Scaffolding Layer** — a constraint architecture that forces any LLM (cloud or local) to operate as a clarity engine rather than a chatbot. The model quality matters less than the structural design.

```
┌─────────────────────────────────────────────────────────────┐
│                    OPEN WEBUI (Frontend)                     │
│              Premium Chat Interface + Agent UI               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              SYSTEM PROMPT (State Machine)                   │
│   • 6-phase conversation flow                                │
│   • One-question-at-a-time constraint                        │
│   • Behavioral archaeology protocol                          │
│   • Tool-calling orchestration                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           SKILL DISCOVERY ENGINE (Python Tool)               │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│   │  SQLite DB  │  │ Skill Scorer │  │ Rhythm Generator│   │
│   │  (sessions, │  │ (5-factor    │  │ (Flexible       │   │
│   │   responses,│  │  weighted    │  │  schedule       │   │
│   │   hypotheses│  │  scoring)    │  │  contract)      │   │
│   │   experiments│  │              │  │                 │   │
│   │   rhythms)  │  │              │  │                 │   │
│   └─────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           TAXONOMY (37 Skills, 6 Families)           │   │
│   │  Visual | Frontend | Backend | AI/ML | Content | IoT │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 The 6-Phase Flow

| Phase | Name | What Happens | Tool Used |
|-------|------|--------------|-----------|
| 1 | **Onboarding** | 3 behavioral questions (procrastination, flow state, peer help) | `save_response` |
| 2 | **Domain Filter** | 2 broad questions (creation preference, class preference) | `save_response` |
| 3 | **Reality Anchor** | 6 constraint questions (time, hardware, energy, past quits) | `save_response` |
| 4 | **Skill Match** | AI runs deterministic 5-factor scoring on 37 skills | `rank_skill_hypotheses` |
| 5 | **Experiment Design** | Generate 2-week hypothesis test with scaled tasks | `generate_experiment` |
| 6 | **Rhythm Build** | Generate flexible rhythm contract with modes | `generate_rhythm` |
| 7 | **Daily Audit** | Ongoing check-ins with adaptive mode switching | `daily_audit` |

---

## 🔬 The 5-Factor Scoring Formula

```
Overall Score = 
    0.40 × Interest Fit
  + 0.20 × Time Fit
  + 0.15 × Hardware Fit
  + 0.10 × Experience Fit
  + 0.15 × Cognitive Fit
```

| Factor | What It Measures | How |
|--------|-----------------|-----|
| **Interest Fit** | Tag overlap between user signals and skill tags | Jaccard similarity × 1.5 boost. Procrastination overlap gets 1.15× bonus |
| **Time Fit** | Can they produce first output within their daily budget? | `min(100, (daily_min / req_min) × 100)` |
| **Hardware Fit** | Can their device run the skill? | Mobile=1, Low PC=2, High PC=3. Downgrade penalties applied |
| **Experience Fit** | Have they tried similar things? | Fresh = 90, Retried = 60 |
| **Cognitive Fit** | Does the skill match their inferred cognitive profile? | Inferred from behavioral signals vs skill cognitive_profile |

---

## 📁 File Structure

```
skill-discovery-engine/
├── backend/
│   ├── skill_discovery_engine.py    ← The Open WebUI Tool (8 functions)
│   ├── system_prompt.md             ← The State Machine Prompt
│   └── taxonomy.json                ← 37-skill knowledge base
├── README.md                        ← This file
└── .env                             ← API keys (not committed)
```

---

## 🚀 Setup Instructions

### Step 1: Start Open WebUI
```bash
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```
Open `http://localhost:3000` and create your admin account.

### Step 2: Configure LLM API
Go to **Settings > Connections** and add:
- **Groq** (recommended): Fast, cheap, supports tool calling
  - Model: `llama3-70b-8192` or `mixtral-8x7b-32768`
- **OpenAI**: `gpt-4o-mini` or `gpt-4o`
- **Together AI**: `meta-llama/Llama-3-70b-chat-hf`

### Step 3: Upload the Tool
1. Go to **Workspace > Tools**
2. Click **+**
3. Copy ALL of `skill_discovery_engine.py`
4. Name: `SkillDiscoveryEngine`
5. Save

### Step 4: Create the Agent
1. Go to **Workspace > Models**
2. Click **+**
3. **Name**: `Arya — Skill Discovery Mentor`
4. **Base Model**: Select your configured model
5. **System Prompt**: Paste ALL of `system_prompt.md`
6. **Tools**: Enable `SkillDiscoveryEngine`
7. **Save**

### Step 5: Test
Start a chat with `Arya`. Say "Hi". Follow the flow.

---

## 🧪 Demo Script for Judges

**Opening (10 sec):**
> "Most career apps tell students what to learn. We make them confess what they already love."

**Live Demo (60 sec):**
1. Ask a judge: "When you procrastinate, what do you open?"
2. Ask: "What's something you've spent 3 hours on without noticing?"
3. Ask: "What do people come to you for help with?"
4. Ask 2-3 more quick questions about time/hardware
5. Show the ranked skill hypotheses with scores and explanations
6. Show the 2-week experiment design
7. Show the Rhythm Contract with modes

**The Pivot (20 sec):**
> "This isn't a timetable app. This is a clarity engine. And here's the kicker — this same architecture will run my own 100M parameter model in January. Today it's Groq. Tomorrow it's NanoChat Titan."

---

## 🏆 Why This Wins

| Competitor Approach | Our Approach |
|---------------------|--------------|
| Static skill quiz (20 questions, dump result) | Progressive behavioral archaeology (one question at a time, adaptive) |
| AI picks the skill for you | AI eliminates wrong options; YOU pick |
| Rigid timetable (fail once = guilt spiral) | Rhythm Contract with 4 modes (Beast, Standard, Maintenance, Recovery) |
| One-time recommendation | 2-week experiment + daily audit loop |
| Generic "learn coding" advice | 37-skill taxonomy with hardware-aware filtering |
| Prompt engineering on raw LLM | Deterministic scoring engine + state machine |

---

## 🔮 Future Roadmap

| Milestone | Date | What |
|-----------|------|------|
| SIH 2026 | Sep 24 | API-based demo with this architecture |
| 20M Model | Sep 18 | NanoChat Titan 20M checkpoint (birthday) |
| 100M Model | Jan 10 | Full pretraining complete |
| Sankranthi | Jan 14 | Open weights release + app runs on local model |
| Phone Build | Jan-Feb | Quantized 100M model on Dimensity via llama.cpp |

---

## 📝 License

MIT — Open source the architecture, open source the model.

---

> *"The sword cuts both ways. After January 14, you lose the excuse of 'I don't know.' But you gain the right to hold the sword."*
