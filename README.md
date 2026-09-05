# 🚀 Skillcraft — Skill Discovery Engine
> **Smart India Hackathon 2026 Submission**  
> *Turning daily habits and hobbies into high-demand computer skills through small experiments, transparent scoring, and zero-guilt learning paths.*

---

## 📌 SIH Problem Statement Details
* **Problem Statement ID:** `SIH26202`
* **Problem Statement Title:** AI-Driven Skill Discovery & Personalized Career Path Navigation Engine
* **Organization:** Ministry of Education / AICTE
* **Category:** Software
* **Domain Bucket:** Smart Education & Skilling / NEP 2020 Vocational Guidance
* **Team Name:** **Skillcraft**

---

## 🎯 The Problem & Our Solution

### ❓ The Problem:
Most first-year college students have never coded before. When asked what computer skill they want to learn, they don't know what to answer. When asked what they do in their free time, they say:
* *"I scroll Instagram reels and watch YouTube videos"*
* *"I play mobile games like BGMI"*
* *"I watch movies and web series"*

Traditional career websites give them a 6-month, 100-hour coding syllabus full of scary jargon. Students get overwhelmed, give up after 3 days, and feel like they are not smart enough for computers.

### 💡 Our Solution:
Instead of asking hard computer questions, **Skillcraft** asks simple questions about **daily habits, free time, and laptop specs**. 

Our engine translates these real-world habits into computer careers:
* **Loves Instagram reels / visuals:** Learns **UI/UX Design & Frontend Layouts**.
* **Plays mobile games / strategizes:** Learns **Game Logic & Python Programming**.
* **Enjoys movie stories / video editing:** Learns **Digital Media & Creative Tech**.
* **Tracks sports / cricket statistics:** Learns **Data Analytics & Insights**.

```
[ Daily Habits & Free Time ] ──► [ Skillcraft Match Engine ] ──► [ 3-Tier Action Cards ]
(e.g., Gaming, Social Media)     (5-Factor Transparent Score)     (3-Min / 3-Hour / 3-Day Steps)
```

---

## 🔄 The 6-Step Journey (How It Works)

| Step | What We Call It | What Happens in Simple Words |
| :---: | :--- | :--- |
| **1** | **Habit Discovery** | We ask 3 simple questions: What do you open when wasting time? What can you do for 3 hours without getting bored? What do friends ask you to help with? |
| **2** | **Reality Check** | We check your real constraints: How many minutes can you spare daily? Do you have a slow college laptop, a gaming PC, or only a phone? |
| **3** | **Skill Match** | Our engine scores 37 computer skills honestly using our 5-Factor formula and ranks the top 3 best fits for you. |
| **4** | **3-Tier Action Cards** | You get 3 bite-sized steps (3-minute taste, 3-hour build, 3-day project) so you can try the skill right away without reading boring books. |
| **5** | **The Rhythm Contract** | You choose your mode based on your week: **Beast Mode** (vacation), **Standard Mode** (normal college), or **Recovery Mode** (exams/sick - no penalties!). |
| **6** | **Review & Pivot** | After 2 weeks, you decide: **Deepen** (you loved it, do more), **Adjust** (keep the design, drop the hard coding), or **Pivot** (switch to skill #2 with zero guilt). |

---

## 🎯 The 5-Factor Scoring Formula

The system never guesses or hallucinates. It calculates a transparent match score (0 to 100) using 5 clear factors:

$$\text{Final Score} = (0.40 \times \text{Interest}) + (0.20 \times \text{Time}) + (0.15 \times \text{Hardware}) + (0.10 \times \text{Beginner Ease}) + (0.15 \times \text{Brain Fit})$$

* **1. Interest Fit (40%):** Does this match what you naturally enjoy doing in your free time?
* **2. Time Feasibility (20%):** Can you make real progress in your 30 or 45 daily minutes?
* **3. Hardware Fit (15%):** Will this software run smoothly on your current laptop without lagging?
* **4. Beginner Ease (10%):** Can a total beginner get their first win today?
* **5. Brain Fit (15%):** Does this match your thinking style (visual creator, logical problem solver, or numbers person)?

---

## ⚡ The 3-Tier Action Cards

Instead of intimidating 50-hour video courses, every recommendation comes with 3 actionable cards:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌟 TIER 1: The 3-Minute Taste                                               │
│ Zero setup. Change one color on a pre-made Figma button or run 1 line.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🛠️ TIER 2: The 3-Hour Project                                               │
│ Build one real screen or a mini script you can click and interact with.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🏆 TIER 3: The 3-Day Sprint                                                 │
│ Complete a 3-part weekend project to share with friends and put on resume.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Pivot & Rhythm Contract (Why Students Don't Quit)

### 1. The Pivot:
If a student tries a skill for 2 weeks and dislikes it, **they didn't fail**. They learned what they don't like! The system executes a **Pivot**, celebrated as a win, and immediately loads their second-best skill match.

### 2. The Rhythm Contract Modes:
* 🦁 **Beast Mode (60–90 mins/day):** For weekends or semester breaks.
* 🚶 **Standard Mode (30 mins/day):** For regular college days.
* 🛡️ **Maintenance Mode (10 mins/day):** When lab exams or assignments are heavy.
* 🛌 **Recovery Mode (0 mins/day - PAUSED):** When you have final exams or are sick. **Zero guilt, zero streak penalty.**

---

## 🏆 Why Skillcraft Wins

| Normal Career Websites / Quizzes | Skillcraft Engine |
| :--- | :--- |
| Asks 30 long, boring multiple-choice questions | Asks simple, conversational questions about real daily habits |
| Dumps an overwhelming 6-month roadmap | Gives 3-minute, 3-hour, and 3-day bite-sized action cards |
| Rigid streak counters (miss 1 day = feel like a failure) | Rhythm Contract with exam-aware Recovery Mode (no penalties) |
| Forces you to finish even if you hate the subject | 2-week trial followed by Deepen, Adjust, or Pivot |
| Assumes everyone owns a high-end laptop | Hardware-aware matching (checks if your device can run it) |

---

## 🛠️ Tech Stack

| Component | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS Design System | Clean, high-contrast, beginner-friendly UI with zero clutter |
| **Backend API** | Python 3.11, FastAPI, Uvicorn | High-speed REST API for profile parsing and habit translation |
| **Database** | SQLite, SQLAlchemy | Lightweight, zero-config relational store for progress and scores |
| **Scoring & AI Engine** | Python Heuristic Scorer + Google Gemini API | Deterministic 5-factor scoring paired with natural language understanding |
| **Tooling** | Git, npm, GitHub | Version control and collaborative team workflow |

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                        Frontend (React 19 Client)                       |
|           Beginner UI • Habit Questionnaire • 3-Tier Action Cards        |
+------------------------------------+------------------------------------+
                                     |
                                     v REST API
+-------------------------------------------------------------------------+
|                       Backend API (FastAPI Python)                      |
|                  Request Validation & Session Tracking                  |
+------------------------------------+------------------------------------+
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
+---------------------------+                   +-------------------------+
| AI & Scoring Engine       |                   | Database & Audit Log    |
| • Habit-to-Skill Matrix   |                   | • SQLite Store          |
| • 5-Factor Scorer (0-100) |                   | • User Profiles         |
| • Gemini Text Clarifier   |                   | • Action Card Progress  |
+---------------------------+                   +-------------------------+
```

---

## 🚀 Getting Started (Run Locally)

### **Prerequisites**
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)
* **Git**

### **1. Clone the repository:**
```bash
git clone https://github.com/manojbagadi/skill_discovery.git
cd skill_discovery
```

### **2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```
👉 *Open your browser at `http://localhost:5173`.*

### **3. Start the Backend API (Optional):**
```bash
cd ../backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
👉 *API will run at `http://localhost:8000` with docs at `http://localhost:8000/docs`.*

---

## 👥 Team Details — Team Skillcraft

* **Team Name:** **Skillcraft** (Smart India Hackathon 2026)
* **Team Leader:** **B. Manoj** 
* **Member 2:** **P. Raghuram** 
* **Member 3:** **B. Sailaxmi** 
* **Member 4:** **P. Dharani** 
* **Member 5:** **CH. Lokteja** 
* **Member 6:** **B. Harshavardhan** 
