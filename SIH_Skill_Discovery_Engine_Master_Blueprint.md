# 🧠 Skill Discovery Engine — Master Product & Technical Blueprint
> **Smart India Hackathon 2026 | UNESCO Young Scientist Expo 2026**  
> *"We do not predict a student’s perfect career. We help an uncertain student form a skill hypothesis, test it through a feasible short experiment, and learn whether to deepen, adjust, or pivot."*

---

## Executive Summary

The **Skill Discovery Engine** is a constraint-aware, hypothesis-driven exploration operating system designed for Indian engineering and diploma students. Rather than relying on generic AI chat, abstract career quizzes, or rigid course roadmaps, the engine acts as an **adaptive exploration coach**. It extracts grounded behavioral signals from a student's past habits, accounts for their real-world schedule constraints (labs, LeetCode, commuting, energy variations), deterministic scoring against a seed skill taxonomy, and constructs short, feasible micro-experiments to gather observable evidence of skill fit.

---

## 1. The Problem: A Crisis of Alignment, Not Motivation

Many college students are capable of studying and passing examinations but remain deeply uncertain about which practical skill domain to explore. Their difficulty is not a lack of ambition or learning resources—it is the absence of a low-risk, structured way to compare possible directions before committing months to a long course or portfolio track.

This challenge directly aligns with **India’s National Education Policy 2020 (NEP 2020)**, which emphasizes identifying individual capabilities, enabling flexible learning trajectories, breaking rigid divisions between academic and vocational/creative areas, and promoting experiential, learner-centered education [1]. Benchmark national studies (such as the Aspiring Minds / SHL National Employability Reports) consistently document a gap between theoretical academic knowledge and practical software application [2].

```text
Traditional Flow:   Choose by hype ──► Start a long course ──► Meet unexpected friction ──► Abandon ──► Remain confused

Proposed Flow:      Recall past actions ──► Form a skill hypothesis ──► Run a short experiment
                    ──► Record effort, friction, & output ──► Deepen, adjust, or pivot
```

### Target User Segment

The primary target segment is **first- and second-year engineering and diploma students in India** who maintain a basic academic routine but experience choice paralysis when attempting to navigate technical, visual, system, or data-driven skill pathways while balancing institutional obligations.

### Comparative Landscape

| Approach | What it does well | Remaining gap addressed by this system |
|---|---|---|
| **Psychometric / Career Questionnaires** | Provide a quick reflection framework | Rely on abstract or aspirational answers; lack real-work validation |
| **Course & MOOC Recommenders** | Provide abundant learning content | Recommend long content pathways before testing if the daily work fits |
| **College Career Counselling** | Offers human context and support | Difficult to scale into daily, adaptive experiment tracking |
| **Generic AI Chatbots** | Conversational and accessible | Outputs are unvalidated, un-auditable, rigid, or hallucinated |
| **Skill Discovery Engine** | Forms & tests small skill hypotheses | Combines behavioral recall, deterministic scoring, constraint-aware execution, & visible evidence loops |

> **The Central Gap:** Students are frequently asked what career they want to choose before they have had a practical, low-risk opportunity to discover what type of work they can sustain.

---

## 2. The Core Product Shift & Operating Model

### The Adaptive Exploration Coach

The system shifts from static career diagnostic tools to an **adaptive exploration coach**:

| Static / Weak Interpretation | Correct Operating Model |
|---|---|
| “Which career is right for me?” | “Which skill hypothesis should I test next?” |
| “Give me a 6-month roadmap.” | “Construct a feasible 5-day experiment around my actual week.” |
| “Generate a plan with pure AI.” | “Parse language with AI; govern plans with rules, schemas, & solvers.” |
| “Track whether I completed tasks.” | “Distinguish skill friction from time limits, missing tools, & exam interrupts.” |
| “Recommend one path permanently.” | “Commit temporarily, observe real evidence, & iterate deliberately.” |

### The Unit of Design: The Student-Week

A student does not experience a roadmap as an abstract list of skills—they experience it as a week filled with lab sessions, LeetCode practice, examinations, commuting, and variable energy. The system models the student's week using a **Weekly Capacity Model**:

```json
{
  "fixed_commitments": [
    {"label": "college labs", "days": ["monday", "wednesday"], "minutes": 180},
    {"label": "leetcode", "days": ["tuesday", "thursday"], "minutes": 45}
  ],
  "exploration_capacity": {
    "weekday_minutes": 30,
    "weekend_minutes": 120,
    "active_days": 4
  },
  "energy_pattern": {
    "best_days": ["saturday", "sunday"],
    "low_energy_days": ["monday", "wednesday"]
  },
  "constraints": {
    "hardware_level": "low_spec_pc",
    "internet_reliability": "intermittent",
    "preferred_language": "english",
    "exam_window": false
  }
}
```

> **Ethical Principle:** Constraints (limited hardware, low daily minutes, busy schedules) dictate **plan feasibility**, never human potential or permanent suitability.

### System Principles & Scientific Boundaries

1. **No Permanent Labels:** Every recommendation is a temporary hypothesis to test, not a career diagnosis.
2. **Student Agency:** The student retains full authority to correct extracted profiles and confirm or reject suggested experiments.
3. **Evidence Before Commitment:** Require small practical trials before asking students to invest in long learning paths.
4. **Complete Traceability:** Every score and schedule decision must be inspectable and auditable back to verified facts and rules.
5. **Honest Scientific Boundary:** The engine uses retrospective behavioral recall as a starting point and evaluates fit based on task completion, tangible outputs, persistence, and enjoyment. It reports **early fit signals and reduced uncertainty**, not innate talent or permanent career outcomes.

---

## 3. The 6-Phase Exploration Protocol

```text
Retrospective Recall (Phase 1)
        ↓
Domain Filtering & Reality Anchor (Phases 2 & 3)
        ↓
Validated Learner-Evidence Vector
        ↓
Traceable Skill Scoring (Phase 4)
        ↓
Constraint-Aware Plan Compiler (Phase 5: Min / Standard / Stretch Tiers)
        ↓
Low-Friction Signal Logging & Interruption Handling
        ↓
Student-Confirmed Review Loop (Phase 6: Deepen / Adjust / Pivot)
```

### Phase 1: Behavioral Archaeology (Onboarding)
Instead of asking aspirational career questions, the system extracts grounded signals through retrospective recall (one question per turn):
- **Procrastination Anchor:** *"When you're supposed to be studying but procrastinating, what app, software, or task do you open naturally?"*
- **Flow Activity:** *"What non-academic activity have you spent 3+ hours on without checking the clock?"*
- **Peer Help Signal:** *"What technical, visual, organizational, or communication problems do classmates ask you to help with?"*

### Phase 2: Domain Filtering
- **Creation Preference:** *"Would you rather build a physical thing, design how something looks, write logic that makes a machine obey, or analyze data patterns?"*
- **Subject Comfort:** *"Which college classes or lab sessions do you secretly find engaging or least draining?"*

### Phase 3: Reality Anchor (Constraint Capture)
- **Time Audit:** *"How many daily minutes can you realistically give to a new skill without hating your life?"*
- **Hardware Tier:** `mobile_only` | `low_spec_pc` | `high_spec_pc`.
- **Energy Curve & Past Quits:** Capture peak energy times and inspect reasons for past abandoned learning attempts.

### Phase 4: Traceable Skill Scoring Engine

Scoring is executed deterministically in Python over a curated taxonomy (all scores normalized 0–100).

#### Cold-Start Baseline Formula (First-Time User):
$$\text{Cold-Start Score} = 0.40 \times \text{Interest Fit} + 0.30 \times \text{Time Feasibility} + 0.30 \times \text{Hardware Access}$$

#### Post-Experiment Formula (After Logging Evidence):
$$\text{Post-Experiment Score} = 0.30 \times \text{Interest Fit} + 0.15 \times \text{Time Feasibility} + 0.10 \times \text{Hardware Access} + 0.45 \times \text{Experiment Evidence}$$

Where `Experiment Evidence` is computed from:
- **Task Completion Rate:** Proportion of planned tasks executed.
- **Tangible Artifact Produced:** Confirmation of concrete output (e.g., screenshot, Figma file, code snippet).
- **Enjoyment Signal:** Self-reported positive/neutral/friction experience rating.
- **Voluntary Extra Time:** Persistence beyond the minimum required task scope.
- **Skill-Friction Penalty:** Deductions applied only when repeated skill-specific friction ("too hard", "concept boring") occurs, distinct from life interruptions.

#### Expanded 5-Factor Scoring (Open WebUI SaaS Tool Implementation):
$$\text{Overall Score} = 0.40 \times \text{Interest Fit} + 0.20 \times \text{Time Fit} + 0.15 \times \text{Hardware Fit} + 0.10 \times \text{Experience Fit} + 0.15 \times \text{Cognitive Fit}$$

### Phase 5: Micro-Experiment Compilation & Action Tiers

The Plan Compiler maps the selected hypothesis and student constraints into a 2-week plan (demonstrated as a 5-active-day slice for hackathons). Each day provides three action tiers:

```text
For every planned task:
    required_minutes <= available_minutes_for_slot
    required_tools ⊆ accessible_tools
    required_skill_level <= current_supported_level
    output_size <= realistic_scope
    recovery_option exists
```

| Action Tier | Purpose | UI Example (Design Experiment) |
|---|---|---|
| **Minimum Viable Action** | Smallest action to maintain momentum on high-friction/busy days | 15 mins: Recreate 1 UI component in Figma & take screenshot |
| **Standard Action** | Intended core task for a normal day | 35 mins: Design 1 full mobile screen with typography/spacing rules |
| **Stretch Action** | Optional deeper execution when time & energy permit | 60 mins: Add interactive prototype links & write short design rationale |

### Phase 6: Signal Logging & Recovery-Aware Review Loop

Logging is frictionless (one-tap rating, timer, artifact confirmation, skip reason). Crucially, the engine distinguishes **external interruptions** (exams, illness, network outages) from **skill friction**:

```text
Task Missed / Skipped
        │
        ├─► [Exams / Illness / Infrastructure] ──► Pause experiment; ZERO score penalty; Reschedule
        │
        └─► [Skill Boring / Concept Too Hard]  ──► Log as Skill Friction Evidence ──► Adjust or Pivot
```

At the end of the experiment checkpoint, the student chooses one of three confirmed paths:
1. **Deepen:** High completion & enjoyment → Progress to advanced portfolio/project track.
2. **Adjust:** Partial fit (e.g., enjoys UI layout but dislikes CSS coding) → Shift focus from Full-Stack to Frontend UI.
3. **Pivot:** High skill friction → Present next top-ranked hypothesis from scoring engine.

---

## 4. Single-API Cognitive Scaffolding Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       OPEN WEBUI / FRONTEND UI                          │
│             Guided Decision Workspace & Interactive Chat                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    SYSTEM PROMPT (State Machine)                        │
│   • 6-Phase state tracking    • One-question-at-a-time enforcement      │
│   • Behavioral archaeology    • Controlled tool invocations             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                   SINGLE-API COGNITIVE SCAFFOLDING                      │
│                                                                         │
│   Student Input  ──►  [Request Envelope]  ──►  [Single LLM Parser]    │
│                                                          │              │
│   [Validated Schema] ◄── [Vocabulary Normalizer] ◄──────┘              │
│           │                                                             │
│           ▼                                                             │
│   [Deterministic Solver & Scorer]  ──►  [Template & Schedule Compiler]  │
│           │                                      │                      │
│           └──────────────────┬───────────────────┘                      │
│                              ▼                                          │
│                   [SQLite Audit & Database]                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### LLM Responsibility Boundary

The architecture enforces strict separation between non-deterministic language parsing and deterministic execution:

| Responsibility | System Component | Allowed / Enforced Actions |
|---|---|---|
| Natural Language Parsing | Single LLM API | Extract tags, detect ambiguity, flag parser uncertainty, format verified explanations |
| Schema & Enum Validation | Pydantic Models | Enforce line constraints, type checks, enum validation |
| Skill Ranking & Scoring | Python Scorer Engine | Deterministic 5-factor weighted scoring algorithms |
| Time & Feasibility Solving | Python Plan Compiler | Slot matching, tool checking, schedule adaptation |
| State & Audit Trail | SQLite DB | Immutable event logs, versioning, task histories |
| Student Agency & Edits | UX Interface | Override extracted tags, reject hypotheses, confirm pivots |

### Request Envelope & Evidence Parsing Schemas

#### Request Envelope Payload:
```json
{
  "mode": "extract_evidence",
  "schema_version": "1.0",
  "student_input": "I like making posters for college fests and customizing my phone setup...",
  "known_profile": {
    "daily_minutes": 45,
    "hardware_level": "low_spec_pc",
    "active_hypothesis": null
  },
  "allowed_interest_tags": ["visual_layout", "poster_formatting", "ui_components", "css_animations"],
  "rules": {
    "do_not_infer_aptitude": true,
    "unknown_tags_must_be_flagged": true,
    "missing_required_fields_require_clarification": true
  }
}
```

#### Extraction Output with Evidence Spans & Confidence:
```json
{
  "interest_tags": [
    {
      "tag": "poster_formatting",
      "evidence": "making posters for college fests",
      "confidence": 0.94
    },
    {
      "tag": "visual_layout",
      "evidence": "customizing my phone setup",
      "confidence": 0.88
    }
  ],
  "uncertain_fields": [],
  "clarification_needed": false,
  "parser_warnings": []
}
```

#### Core Pydantic Validation Models:
```python
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class LearnerEvidenceVector(BaseModel):
    interest_tags: List[str]
    procrastination_anchors: List[str]
    perceived_strengths: List[str]
    daily_available_minutes: int = Field(ge=15, le=240)
    hardware_level: Literal["mobile_only", "low_spec_pc", "high_spec_pc"]
    uncertain_fields: List[str] = []

class SkillHypothesisScore(BaseModel):
    skill_id: str
    skill_name: str
    overall_score: float = Field(ge=0, le=100)
    interest_score: float = Field(ge=0, le=100)
    time_score: float = Field(ge=0, le=100)
    hardware_score: float = Field(ge=0, le=100)
    experiment_evidence_score: float = Field(ge=0, le=100)
    explanation: str
```

### Hallucination Prevention Matrix

| Ambiguous User Input | Safe System Behavior |
|---|---|
| *“I like making things look clean.”* | Map to provisional `visual_layout` tag; prompt for 1 concrete example. |
| *“I keep watching tech breakdown videos.”* | Record content consumption/curiosity signal; do **not** record tech aptitude. |
| *“I help friends format resumes in Word.”* | Record `resume_layout` visual communication strength with exact evidence text span. |
| *“I want to try coding but have no idea where to start.”* | Offer low-cost comparison experiment rather than forcing a heavy stack. |
| Unknown tool or non-taxonomy tag | Flag tag as `uncertain_fields`; ask user to map to standard category. |

---

## 5. Data Model, Data Ethics, & Privacy

### Immutable Event-Sourced Data Hierarchy

To maintain complete auditability, the system stores immutable events rather than overwriting single profile states:

```text
Student
  ├── ProfileVersion[]
  │     ├── LearnerEvidenceVector
  │     ├── ConstraintSnapshot
  │     └── StudentConfirmationStatus
  └── Experiment[]
        ├── HypothesisSnapshot
        ├── PlanVersion[] (Minimum / Standard / Stretch)
        ├── TaskLog[] (Timer, Rating, Output check)
        ├── InterruptionRecord[] (Reason, Paused status)
        └── ReviewDecision (Deepen / Adjust / Pivot / Pause)
```

Every recommendation audit log records: `taxonomy_version`, `rubric_version`, `input_evidence_ids`, `constraint_snapshot_id`, `selected_template_ids`, and `user_confirmation_state`.

### Data Ethics & Consent Guidelines

- **Self-Reported Evidence Only:** Collects self-reported recall, task logs, and voluntary artifact links.
- **Zero Passive Surveillance:** Strictly prohibits background keylogging, browser history inspection, or screen monitoring.
- **Data Portability & Right to Erasure:** Complete profile export and one-click data deletion.
- **Non-Discriminatory Constraint Processing:** Hardware limitations, time constraints, or academic workloads govern schedule feasibility only, never student potential or intelligence.

---

## 6. System Invariants, Scenario Testing, & Pre-Emptive Judge Defense

### Property-Level Backend Invariants

1. `score` cannot be computed while required schema fields remain in `uncertain_fields`.
2. Tags outside the controlled taxonomy vocabulary cannot contribute silently to scoring.
3. Planned task time cannot exceed the student's allocated slot capacity.
4. Life interruptions (`exam`, `illness`) cannot reduce experiment evidence scores.
5. Model responses cannot directly mutate database records without validation passing.
6. Every recommendation output must link directly to its underlying score breakdown and evidence spans.

### Pre-Emptive Judge Defense (SIH Jury Q&A)

#### Q1: "Watching design videos does not prove aptitude. Is this misleading?"
> **Defense:** We completely agree. Content consumption indicates curiosity, not aptitude. That is why our output is explicitly labeled a **temporary skill hypothesis**, not a verdict. The subsequent 5-day micro-experiment evaluates real task completion, artifact production, and sustained effort to gather true behavioral evidence.

#### Q2: "Are your scoring heuristic weights arbitrary?"
> **Defense:** The MVP uses expert-defined heuristic baseline weights, fully exposed to the user. They are not presented as black-box statistics. As pilot data accumulates, anonymized experiment completion data will be used to mathematically calibrate these weights.

#### Q3: "What if a student misses tasks due to college exams or illness?"
> **Defense:** The system explicitly categorizes skips into external interruptions vs skill friction. External interruptions pause the experiment timer with zero score penalty. Skill friction ("too hard", "boring") is logged as evidence for potential path adjustment during the review checkpoint.

#### Q4: "How does a 2-week experiment create employability?"
> **Defense:** The product does not claim to make a student job-ready in 2 weeks. It solves the prior bottleneck: helping uncertain students make an evidence-based decision on *which* direction to invest their next 6 months in, avoiding months wasted on mismatched courses.

#### Q5: "Could this be built with a basic chatbot prompt?"
> **Defense:** A simple prompt lacks strict JSON schema validation, controlled vocabulary enforcement, deterministic 5-factor scoring, constraint-aware schedule solvers, tiered action recovery, and immutable audit logs. Prompt-only solutions hallucinate schedules and lack reproducible decision logic.

#### Q6: "What happens if the LLM extracts user data incorrectly?"
> **Defense:** Extracted vectors pass through validation rules and controlled taxonomy mappers. Low-confidence fields are marked uncertain. Furthermore, the UI presents the extracted profile to the student for manual verification before any scoring execution occurs.

#### Q7: "Why test only one skill hypothesis at a time?"
> **Defense:** Testing multiple skills simultaneously dilutes student time, increases cognitive load, and produces noisy friction signals. Sequential, focused 5-day trials produce clear evidence while remaining fully reversible.

#### Q8: "Who is your exact target user?"
> **Defense:** First- and second-year Indian engineering and diploma students who have a functional academic routine but face choice paralysis when choosing practical skill tracks outside their college syllabus.

---

## 7. 48-Hour Hackathon MVP Scope & Future Roadmap

### MVP Implementation Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                    OPEN WEBUI (Frontend)                    │
│            Interactive Chat + Decision Workspace            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│            SKILL DISCOVERY ENGINE (Python Backend)          │
│   ┌───────────────┐  ┌────────────────┐  ┌──────────────┐   │
│   │ SQLite Audit  │  │ Python Scorer  │  │ Plan Compiler│   │
│   │ Event Store   │  │ (5-Factor Rule)│  │ (Action Tiers│   │
│   └───────────────┘  └────────────────┘  └──────────────┘   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │           SEED TAXONOMY (37 Skills / 6 Families)    │   │
│   │  Visual | Frontend | Backend | AI/ML | Content | IoT│   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend Interface:** Open WebUI / React + Tailwind CSS.
- **Backend Core:** Python 3.11 with FastAPI & Pydantic validation.
- **LLM Scaffolding:** Single open-source/hosted LLM for bounded natural language extraction.
- **Database:** SQLite for immutable event tracking & session state.
- **Seed Taxonomy:** 37 micro-skills across 6 core families (Visual & Product, Frontend, Backend, AI/ML, Technical Content, Systems/IoT).

### Explicit Out-of-Scope (Future Phases)

- Passive screen/browser tracking, automated resume job-matching, peer video calls, institution surveillance dashboards, and multi-model benchmarking.

### Core Demo Narrative

> *"Consider Rahul—a 2nd-year CS student with mandatory lab sessions, LeetCode practice, a low-spec laptop, and a strong curiosity about visual design. The Skill Discovery Engine does not ask Rahul to drop his labs or follow a fantasy 4-hour daily roadmap. It extracts his real constraints, forms a UI Design hypothesis, compiles a 30-minute tiered daily experiment, adapts when an exam interrupts his Thursday, and helps him decide based on real artifact output whether to deepen into UI/UX or pivot."*

### Multi-Phase Future Roadmap

1. **Phase 1 (MVP Validation):** Validate extraction accuracy, scoring transparency, and 5-day completion loops across pilot student cohorts.
2. **Phase 2 (Taxonomy & Regional Expansion):** Expand taxonomy from 37 to 120 skills; add regional language parsing support.
3. **Phase 3 (Empirical Calibration):** Use anonymized experiment completion data to refine cold-start and post-experiment heuristic weights.
4. **Phase 4 (Institutional Advisory):** Provide consent-governed aggregate insights for college career guidance departments.

---

## References

[1] Ministry of Education, Government of India. [*National Education Policy 2020*](https://static.pib.gov.in/WriteReadData/userfiles/NEP_Final_English_0.pdf). Official policy framework document.  
[2] Aspiring Minds / SHL. [*National Employability Report for Engineers*](https://www.shl.com/assets/National-Employability-Report-Engineers-2019.pdf). Benchmark evaluation of practical skill application in Indian technical education.
