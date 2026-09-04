# 🚀 Skill Discovery Engine
> **Smart India Hackathon 2026 Submission**  
> *Transforming non-technical daily habits and curiosity into high-demand computer skills through cognitive scaffolding and micro-action cards.*

---

## 📌 SIH Problem Statement Details
* **Problem Statement ID:** `sih26202`
* **Problem Statement Title:** AI-Driven Skill Discovery & Personalized Career Path Navigation Engine
* **Organization:** Ministry of Education / AICTE
* **Category:** Software
* **Domain Bucket:** Smart Education & Skilling / NEP 2020 Vocational Guidance

---

## 🎯 Problem Statement & Background

### **The Challenge**
Over 72% of students entering higher education or vocational streams in tier-2/3 regions lack prior programming or technical exposure. When asked what skills they want to build, beginners typically name non-technical pastimes like scrolling social media, binge-watching shows, video games, or sports. Traditional ed-tech platforms overwhelm beginners with generic roadmaps and high barrier-to-entry jargon, causing high dropout rates before learners even write their first line of code.

### **Our Solution**
The **Skill Discovery Engine** is a cognitive translation platform that bridges daily casual habits directly into viable computer careers. Instead of demanding that beginners already know what tech stack they want, our system analyzes their real-world cognitive strengths (e.g., visual attention from Instagram reels, strategic coordination from mobile gaming, storytelling from binge-watching) and maps them to high-growth tech domains. It outputs personalized, zero-jargon **3-Tier Action Cards** (3-minute taste, 3-hour micro-build, 3-day portfolio sprint) with transparent fit-scores.

```
[ Daily Habits & Interests ] ──► [ Cognitive Translation & Scoring Engine ] ──► [ 3-Tier Actionable Pathway ]
(e.g., Social Media, Gaming)     (Habit-to-Skill Matrix + Fit Evaluation)        (3-Min / 3-Hour / 3-Day Steps)
```

---

## ✨ Key Features

* **🧠 Non-Technical Habit-to-Skill Bridge:** Seamlessly maps routine hobbies (social media scrolling, mobile gaming, watching movies, sports) to specialized tech roles (UI/UX, Game Dev, Data Analytics, Frontend Engineering).
* **🎯 Explainable 5-Factor Scoring System:** Computes transparent match scores based on Passion, Energy, Market Demand, Time Commitment, and Entry Barrier—no black-box confusion.
* **⚡ 3-Tier Micro-Experiment Action Cards:** Every recommendation includes an immediate low-friction step (3-minute taste), a practical project (3-hour build), and a structured sprint (3-day milestone).
* **♿ Accessible, Clear UI with Code Explanations:** Clean, high-contrast interface designed for complete beginners, accompanied by detailed inline documentation explaining every UI component.
* **📈 Real-Time Assessment & Pathway Generator:** Live interactive questionnaire that dynamically evaluates learner confidence and recommends tailored foundational tech tracks.

---

## 🛠️ Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide-React Icons, Vanilla CSS Design System |
| **Backend** | Python 3.11, FastAPI, Uvicorn, REST APIs |
| **Database** | SQLite / SQLAlchemy (Lightweight, zero-config relational store) |
| **AI / NLP Engine** | Google Gemini API / Cognitive Scaffolding Prompt Architecture |
| **Tooling & Version Control**| Git, npm, Vite Dev Server |

---

## 🏗️ System Architecture & Workflow

```
+-------------------------------------------------------------+
|                     Frontend (Client)                       |
|           React 19 + Interactive Questionnaire UI           |
+------------------------------+------------------------------+
                               |
                               v REST API / State Dispatch
+-------------------------------------------------------------+
|                   Backend API / Core Engine                 |
|                   FastAPI + Python Services                 |
+------------------------------+------------------------------+
                               |
         +---------------------+---------------------+
         |                                           |
         v                                           v
+-----------------------------+             +-----------------+
| AI & Cognitive Translation  |             | Relational DB   |
| - Habit-to-Skill Mapping    |             | - SQLite Store  |
| - 5-Factor Fit Scorer       |             | - User Profiles |
| - Gemini API Clarifier      |             | - Action Cards  |
+-----------------------------+             +-----------------+
```

---

## 🚀 Getting Started (Local Setup)

### **Prerequisites**
* **Node.js** (v18.0.0 or higher)
* **Python** (v3.10 or higher)
* **Git**

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/skill_discovery.git
   cd skill_discovery
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

3. **Backend Setup (Optional API Server):**
   ```bash
   cd ../backend
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

---

## 📈 Innovation & Impact

* **Feasibility:** Built using lightweight, standard web and API technologies that run smoothly on basic college laptops and mobile browsers with minimal bandwidth.
* **Scalability:** The modular decoupled architecture separates the deterministic habit translation rules from LLM calls, enabling high-throughput handling of thousands of concurrent students at negligible compute cost.
* **Uniqueness:** Unlike conventional aptitude tests that demand existing technical knowledge or pose intimidating mathematical questions, our engine meets beginners where they are—turning passive consumer habits into active creator careers.

---

## 👥 Team Details

* **Team Name:** Tech Innovators (SIH 2026)
* **Team Leader:** **B. Manoj** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
* **Member 2:** **P. Raghuram** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
* **Member 3:** **B. Sailaxmi** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
* **Member 4:** **P. Dharani** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
* **Member 5:** **ch. Lokteja** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
* **Member 6:** **B. Harshavardhan** ([GitHub](https://github.com/) | [LinkedIn](https://linkedin.com/))
