# Skill Discovery Engine

> **We do not predict a student’s perfect career. We help an uncertain student form a skill hypothesis, test it through a feasible short experiment, and learn whether to deepen, adjust, or pivot.**

A hypothesis-driven, behavioral-recall system that helps early-year Indian engineering and diploma students explore practical skill pathways through structured micro-experiments. The system is designed for the **Smart India Hackathon 2026** and is an early-stage alignment layer—not a replacement for education, mentoring, portfolio development, or employment assessment.

---

## 1. The Problem: A Crisis of Alignment, Not Motivation

Many college students are capable of studying and passing examinations but remain uncertain about which practical skill domain to explore. Their difficulty is not necessarily a lack of ambition or learning resources. It is the absence of a low-risk way to compare possible directions before investing months in a long course or portfolio path.

This challenge is relevant to the direction of India’s National Education Policy 2020, which emphasizes identifying individual capabilities, enabling flexible learning trajectories, reducing rigid divisions between academic and vocational or creative areas, and making education more experiential and learner-centred [1]. Evidence from national engineering employability benchmarks (such as the Aspiring Minds / SHL studies) illustrates a recurring gap between theoretical knowledge and practical software application [2].

The proposal does **not** claim that one application can solve employability. It addresses an earlier bottleneck: helping a student move from uncertainty to an evidence-informed next experiment.

```text
Traditional Flow:   Choose by hype ──► Start a long course ──► Meet unexpected friction ──► Abandon ──► Remain confused

Proposed Flow:      Recall past actions ──► Form a skill hypothesis ──► Run a short experiment
                    ──► Record effort, friction, and output ──► Deepen, adjust, or pivot
```

### Target User Segment

The initial target segment is **first- and second-year engineering and diploma students in India** who have a basic academic routine but experience choice paralysis between practical, technical, and creative skill pathways. This narrow segment makes the question design, experiments, and pilot evaluation more specific and realistic.

### Existing Approaches and the Unmet Need

| Approach | What it does well | Remaining gap addressed by this proposal |
|---|---|---|
| Psychometric or career questionnaires | Provide a quick reflection framework | Often depend on abstract or aspirational answers and rarely test a choice through real work |
| Course and MOOC recommenders | Provide abundant learning resources | Usually recommend content before the learner has tested whether the type of work fits |
| College career counselling | Offers human context and support | Support may be periodic and difficult to scale into daily experiment tracking |
| Generic AI chatbots | Make advice conversational and accessible | Outputs may be difficult to audit, compare, reproduce, or connect to execution evidence |
| **Skill Discovery Engine** | Forms and tests a small skill hypothesis | Combines structured evidence, visible scoring, a feasible task plan, and a review loop |

> **The central gap:** Students are often asked what they want to become before they have had a practical opportunity to discover what type of work they can sustain.

---

## 2. The Solution: A Behavioral-Recall Exploration Loop

The system treats a first skill choice as a **hypothesis**, not a permanent identity or career diagnosis. It begins with concrete questions about past actions and constraints, converts the answers into a validated learner-evidence vector, selects a skill hypothesis using traceable rules, and tests that hypothesis through a short practical experiment.

```text
Retrospective Recall
        ↓
Validated Learner-Evidence Vector
        ↓
Traceable Skill Scoring
        ↓
Feasible Micro-Experiment with Tangible Output
        ↓
Completion, Enjoyment, Friction, and Persistence Signals
        ↓
Student-Confirmed Deepen, Adjust, or Pivot Decision
```

### Honest Scientific Boundary

The MVP does not measure ambient behaviour, innate aptitude, or permanent career suitability. It uses **retrospective behavioural recall** as a grounded starting point and then collects additional evidence from a practical experiment. The proposal’s testable hypothesis is:

> **Concrete past-experience questions followed by a short practical trial can help uncertain students make a more informed next-step decision than receiving a long list of courses or an unstructured AI recommendation.**

This hypothesis requires pilot validation. The system therefore reports **early fit signals and reduced uncertainty**, not a definitive assessment of talent.

### Design Principles

| Principle | Product implication |
|---|---|
| No permanent labels | Every output is described as a hypothesis to test, not a verdict |
| Student agency | The student can correct the profile and confirm or reject the next experiment |
| Evidence before commitment | The system recommends a small practical trial before a long learning pathway |
| Traceability | The student can see the factors contributing to the score |
| Low friction | Daily logging is designed to take only a few seconds |
| Inclusion | Time, hardware, language, and access constraints affect plan feasibility—not the student’s worth or potential |
| Privacy by default | The MVP does not use passive screen, browser, or keylogging data |

---

## 3. How It Works: The Six-Step Exploration Protocol

### Step 1: Behavioural-Recall Prompting

Instead of beginning with “What career do you want?”, the system asks for concrete experiences:

- **“What software, websites, or tasks do you naturally open when you are procrastinating?”**
- **“What non-academic activity have you continued for a long time without being assigned to do it?”**
- **“What technical, visual, organisational, or communication problems do classmates ask you to help with?”**
- **“What have you explored voluntarily when marks, certificates, or parental pressure were not involved?”**
- **“How much time can you reliably give on a normal college day?”**

The initial flow uses five questions. Follow-up questions are shown only when an answer is ambiguous or a required constraint is missing.

### Step 2: Structured Evidence Parsing

An LLM acts as a **natural-language parser**, not as the decision-maker. It converts the student’s answers into a fixed schema containing evidence tags, constraints, and uncertainty markers.

```json
{
  "interest_tags": ["visual_layout", "ui_components", "css_animations"],
  "procrastination_anchors": ["canva", "figma"],
  "perceived_strengths": ["poster_formatting", "resume_layout"],
  "daily_available_minutes": 45,
  "hardware_level": "low_spec_pc",
  "uncertain_fields": []
}
```

Every tag passes through a controlled-vocabulary validator. Unknown tags are not silently treated as facts; they are mapped to an **uncertain** category or sent back for clarification. If required information is missing, the system asks a follow-up question instead of inventing an answer.

### Step 3: Traceable Skill Scoring

The validated evidence vector is matched against a curated skill taxonomy by deterministic Python code. All component scores are normalized to a 0–100 scale, and the UI displays the inputs that contributed to the result.

#### Cold-Start Rubric

For a first-time user without experiment history:

```text
Cold-Start Score =
    0.40 × Interest Fit
  + 0.30 × Time Feasibility
  + 0.30 × Hardware/Tool Access
```

These are **expert-defined heuristic baseline weights**, not scientifically validated probabilities.

#### Post-Experiment MVP Rubric

After the student logs experiment evidence:

```text
Post-Experiment Score =
    0.30 × Interest Fit
  + 0.15 × Time Feasibility
  + 0.10 × Hardware/Tool Access
  + 0.45 × Experiment Evidence
```

For the MVP, `Experiment Evidence` is calculated from:

| Signal | Role in experiment evidence |
|---|---|
| Task completion rate | Measures whether the student completed planned work |
| Tangible artifact produced | Confirms that the experiment resulted in an observable output |
| Enjoyment signal | Captures the student’s reported experience of the work |
| Persistence or voluntary extra time | Captures willingness to continue beyond the minimum task |
| Skill-friction frequency | Reduces the score when repeated “boring” or “too hard” signals occur |

The score is a decision aid, not a diagnosis. The student sees the recommendation and may correct the profile, continue, or choose another hypothesis.

### Step 4: Micro-Experiment Generation

The selected hypothesis is mapped to a practical task template library. The system creates a two-week plan designed around realistic student constraints:

- **Approximately 45 minutes per day.**
- **Five active days per week, with two rest or catch-up days.**
- **One small, tangible output per meaningful task.**
- **A checkpoint at the end of the first week and a final review at the end of the second week.**

Examples include creating one Figma screen, editing one short clip, writing one technical explanation, building one frontend component, or implementing one small API endpoint. The MVP demonstrates a five-active-day slice of this two-week protocol to reduce hackathon demo risk.

### Step 5: Low-Friction Signal Logging

The tracker is designed to record useful evidence without demanding a daily essay.

| User action | Signal captured |
|---|---|
| One-tap experience rating | Positive, neutral, or high-friction experience |
| Start/stop timer | Actual minutes compared with planned minutes |
| Artifact confirmation or upload | Whether the expected small output was produced |
| One-tap skip reason | Skill friction versus external interruption |
| Optional short note | Context for an unusual day, if the student chooses to provide it |

External interruptions such as examinations, illness, or connectivity problems pause the experiment and do not automatically penalize the skill hypothesis. Repeated skill-specific signals such as “boring” or “too hard” are treated as evidence, but not as proof by themselves.

### Step 6: Student-Confirmed Revision

At the review checkpoint, the system explains the evidence and offers three paths:

| Observed pattern | Suggested next step |
|---|---|
| High completion, positive experience, and artifact produced | Deepen into a larger project or portfolio track |
| Positive response to one component but friction in another | Adjust the direction, such as moving from full-stack work toward frontend UI |
| Repeated skill-specific friction and low willingness to continue | Present the next-ranked hypothesis and let the student choose whether to test it |

A failed or incomplete experiment is not treated as a personal failure. It is a signal that the task, timing, support level, or hypothesis may need revision.

---

## 4. Traceable System Architecture

The architecture separates uncertain language interpretation from reproducible decision logic. This improves auditability and reduces dependence on any single model, but it does not eliminate model errors.

```text
┌──────────────────────────┐
│ Student answers          │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ LLM evidence extractor   │  Natural-language parsing only
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Schema + vocabulary      │  Type, range, enum, and unknown-tag checks
│ validation               │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Deterministic scoring    │  Fixed taxonomy and visible component scores
│ engine                   │
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Task-template selector   │  Skill- and constraint-specific plan
└────────────┬─────────────┘
             ↓
┌──────────────────────────┐
│ Tracker and review UI    │  Signals, artifact, and student-confirmed pivot
└──────────────────────────┘
```

### Consistent Validation Schema

The extraction and score objects use the same field names as the displayed JSON and formula:

```python
from pydantic import BaseModel, Field
from typing import List, Literal

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

In implementation, the lists are additionally checked against controlled taxonomy vocabularies. The plan generator uses approved task templates for the MVP; an LLM may optionally improve wording, but it does not invent the skill, scoring formula, or required output.

### Skill Taxonomy

The full taxonomy is a planned catalogue of **120 micro-skills across eight families**. The hackathon MVP implements **30 seed micro-skills across four families** to demonstrate the complete loop:

1. Visual and Product Experience — UI/UX, graphic systems, motion.
2. Frontend and Creative Technology — frontend components, React, WebGL, Tailwind.
3. Systems and Backend Infrastructure — APIs, databases, and DevOps foundations.
4. Data and Intelligent Systems — data pipelines, analytics, and applied ML foundations.

The remaining planned families are Technical Writing and Documentation, Video and Digital Media, Cyber Security and Network Auditing, and No-Code and Automation. They are roadmap areas, not claims about the 48-hour MVP.

---

## 5. Privacy, Data Ethics, and Student Consent

The MVP follows data-minimization principles:

- It collects self-reported answers, experiment logs, and optional task artifacts only.
- It does not use ambient screen recording, keylogging, browser-history monitoring, or passive surveillance.
- In the demo flow, students can review and correct their extracted evidence profile before scoring.
- Profile deletion and data export features are specified as standard privacy requirements for the production release.
- Constraints such as device access and time availability affect feasibility planning, not a person’s perceived worth or permanent potential.
- Any future use of voice, screen-time, or browser signals would require separate, explicit consent and an independent privacy review.

---

## 6. SIH Alignment and Pilot Evaluation

### Alignment with National Priorities

The project supports the learner-centred, flexible, multidisciplinary, and experiential direction described in the National Education Policy 2020 [1]. It also responds to the practical-application gap documented in engineering programming research [2] by giving students a structured opportunity to create small outputs before committing to a lengthy pathway.

The system should be positioned as an **early alignment and exploration layer**. It does not claim to replace formal education, counsellors, instructors, internships, portfolio assessment, or job-readiness testing.

### Pilot Metrics

The pilot will evaluate usefulness rather than claim population-level employability improvement.

| Metric | Measurement method |
|---|---|
| Student decisiveness | Change in self-rated clarity before and after the profiler, using a simple five-point scale |
| Recommendation transparency | Whether students can explain why the hypothesis was suggested and whether they can correct the profile |
| Experiment completion | Proportion of active tasks logged during the pilot |
| Artifact completion | Proportion of planned tangible outputs produced |
| Revision quality | Whether students can make a reasoned deepen, adjust, or pivot decision at review |
| User burden | Time required to complete the profile and daily log |

A small pilot is exploratory, not proof of causal impact. Results will be used to refine questions, task difficulty, taxonomy mappings, and heuristic weights. We will not claim that the system increases employability unless a larger, appropriately designed study supports that conclusion.

---

## 7. 48-Hour Hackathon MVP

The MVP demonstrates one reliable end-to-end journey:

```text
Five behavioural questions
        ↓
Validated evidence vector
        ↓
Visible deterministic score breakdown
        ↓
Five-active-day experiment slice
        ↓
One-tap logs and tangible artifact checks
        ↓
Student-confirmed deepen, adjust, or pivot result
```

### MVP Implementation Stack

- **Frontend:** React.js and Tailwind CSS for a responsive student-facing interface.
- **Backend API:** FastAPI with Python.
- **LLM parsing layer:** An available open-source or hosted model constrained by the schema and controlled vocabulary. The MVP should use one model, not attempt to benchmark several models during the demo.
- **Decision engine:** Deterministic Python matching over 30 seed skills across four families.
- **Plan generation:** Approved skill-specific task templates, parameterized by available time and hardware.
- **Database:** SQLite for the hackathon demo; PostgreSQL can be used later for multi-user deployment.

### Explicitly Out of MVP Scope

Peer clustering, passive browser or screen signals, multilingual voice interaction, institution dashboards, automated job matching, large-scale model training, quantization, and on-device inference are future work. They should not compete with the end-to-end demo.

---

## 8. Pre-Emptive Judge Defense

### Q1: “Watching design videos does not prove aptitude. Is this misleading?”

**Answer:** We agree. Content consumption indicates curiosity, not aptitude. The system labels its first output a **skill hypothesis**, not a career verdict. The practical experiment gathers early signals from task completion, artifact production, persistence, perceived difficulty, and enjoyment. These signals reduce uncertainty but do not diagnose permanent aptitude.

### Q2: “Are the scoring weights arbitrary?”

**Answer:** The MVP uses transparent, expert-defined heuristic baselines. They are not presented as validated probabilities. The pilot records outcomes that can later be used to calibrate the weights. Until that data exists, the system exposes the formula so users and evaluators can inspect it.

### Q3: “What if the student skips because of examinations or illness?”

**Answer:** The tracker distinguishes skill friction from external interruption. External interruptions pause the experiment and do not automatically reduce the hypothesis score. Repeated skill-specific friction is considered alongside context, not interpreted as proof of poor fit.

### Q4: “How does a two-week experiment improve employability?”

**Answer:** The product does not claim to create employability in two weeks. It helps students make a better early exploration decision before investing months in a domain. Deeper learning, portfolio creation, mentoring, and job preparation remain subsequent stages.

### Q5: “Could this be built with a basic chatbot prompt?”

**Answer:** A basic prompt can generate advice, but it usually does not provide a fixed evidence schema, controlled vocabulary validation, visible deterministic scoring, a task-output protocol, or structured revision data. These design choices make the prototype more auditable and testable. They are a foundation for future defensibility, not a claim that the idea is impossible to copy.

### Q6: “What happens if the LLM extracts the answer incorrectly?”

**Answer:** The output passes schema, range, enum, and controlled-vocabulary checks. Missing or unknown information is flagged rather than invented. The student can review and correct the evidence vector before scoring, and the system can ask a clarification question when confidence is low.

### Q7: “Why not recommend several skills instead of one?”

**Answer:** The system may display alternatives, but it asks the student to test one primary hypothesis at a time so that attention and experiment evidence are not diluted. The choice is reversible, and the review loop provides a deliberate pivot path.

### Q8: “What is your target user?”

**Answer:** First- and second-year engineering and diploma students in India who maintain a basic academic routine but are uncertain whether to explore technical, creative, or applied skill pathways.

---

## 9. Future Roadmap

The roadmap follows validation rather than premature complexity:

1. **MVP validation:** Test question clarity, scoring transparency, task completion, tangible outputs, and student-confirmed revision.
2. **Taxonomy and content expansion:** Add more skill families, task templates, accessibility options, and regional-language support.
3. **Outcome calibration:** Use anonymized experiment outcomes to evaluate and improve heuristic weights.
4. **Institutional support:** Explore counsellor and training-institution dashboards with appropriate consent and governance.
5. **On-device model research:** Benchmark smaller open-source models on the fixed extraction task. Quantization or distillation should be considered only if privacy, latency, offline operation, or device constraints justify the additional engineering.

---

## Core Proposition

> **Skill Discovery Engine does not tell students who they are or what career they must choose. It gives an uncertain student a transparent, feasible way to test one skill hypothesis, create a small output, learn from the experience, and choose the next step with more evidence than they had before.**

---

## References

[1] Ministry of Education, Government of India. [*National Education Policy 2020*](https://static.pib.gov.in/WriteReadData/userfiles/NEP_Final_English_0.pdf). Official policy document.

[2] Aspiring Minds / SHL. [*National Employability Report for Engineers*](https://www.shl.com/assets/National-Employability-Report-Engineers-2019.pdf). Benchmark report evaluating theoretical knowledge vs. functional coding capabilities across Indian engineering institutions.

*Note: This proposal intentionally avoids unverified headline statistics. Any additional employability or dropout statistic should be added only after the exact report, URL, population, year, and measurement definition have been checked.*
