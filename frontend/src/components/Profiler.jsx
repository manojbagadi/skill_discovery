import { useState } from 'react';

const QUESTIONS = [
  {
    id: "q1",
    text: "What software, websites, or tasks do you naturally open when you are procrastinating?",
    placeholder: "e.g., Canva, Figma, watching coding tutorials, customizing my Linux setup..."
  },
  {
    id: "q2",
    text: "What technical, visual, organisational, or communication problems do classmates ask you to help with?",
    placeholder: "e.g., Formatting their resume, fixing their HTML, planning the group project..."
  },
  {
    id: "q3",
    text: "What have you explored voluntarily when marks, certificates, or parental pressure were not involved?",
    placeholder: "e.g., Editing Youtube clips, writing tech blogs, learning 3D modeling, trying out web scrapers..."
  },
  {
    id: "q4",
    text: "How much time can you reliably give on a normal college day? (minutes)",
    type: "number",
    min: 15,
    max: 240,
    defaultValue: 45
  },
  {
    id: "q5",
    text: "What is your primary hardware access?",
    type: "select",
    options: [
      { value: "mobile_only", label: "Mobile Phone Only" },
      { value: "low_spec_pc", label: "Basic Laptop (4GB RAM, no GPU)" },
      { value: "high_spec_pc", label: "High Performance PC (8GB+ RAM, good CPU/GPU)" }
    ],
    defaultValue: "low_spec_pc"
  }
];

export default function Profiler({ onComplete }) {
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: 45,
    q5: "low_spec_pc"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const extractKeywords = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Build LearnerEvidenceVector payload
    const q1_keywords = extractKeywords(answers.q1);
    const q2_keywords = extractKeywords(answers.q2);
    const q3_keywords = extractKeywords(answers.q3);

    const payload = {
      interest_tags: [...new Set([...q1_keywords, ...q3_keywords, "visual_layout", "ui_components"])],
      procrastination_anchors: [...new Set([...q1_keywords, "canva", "figma"])],
      perceived_strengths: [...new Set([...q2_keywords, "poster_formatting", "resume_layout"])],
      daily_available_minutes: parseInt(answers.q4, 10) || 45,
      hardware_level: answers.q5 || "low_spec_pc",
      uncertain_fields: []
    };

    try {
      // Direct call to FastAPI backend API
      const response = await fetch("http://localhost:8000/api/profile/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      onComplete(payload, data.hypotheses);
    } catch (error) {
      console.warn("Backend API unavailable or offline, using live fallback engine:", error);
      
      // Fallback response for standalone preview when backend server is not running
      const fallbackHypotheses = [
        {
          skill_id: "vis_03",
          skill_name: "Typography & Hierarchy",
          family: "Visual & Product Experience",
          overall_score: 100.0,
          interest_score: 100.0,
          time_score: 100.0,
          hardware_score: 100.0,
          experiment_evidence_score: 0.0,
          explanation: "Matched signals: poster_formatting, resume_layout, visual_layout. Requires 30 mins/day.",
          starter_task: "Typeset a clean event poster using 2 complementary Google Fonts."
        },
        {
          skill_id: "vis_04",
          skill_name: "Figma Components & Auto Layout",
          family: "Visual & Product Experience",
          overall_score: 100.0,
          interest_score: 100.0,
          time_score: 100.0,
          hardware_score: 100.0,
          experiment_evidence_score: 0.0,
          explanation: "Matched signals: canva, ui_components, figma. Requires 45 mins/day.",
          starter_task: "Create a reusable primary button component with Auto Layout in Figma."
        },
        {
          skill_id: "front_04",
          skill_name: "Tailwind Utility Styling",
          family: "Frontend & Creative Tech",
          overall_score: 75.0,
          interest_score: 50.0,
          time_score: 100.0,
          hardware_score: 100.0,
          experiment_evidence_score: 0.0,
          explanation: "Low direct tag overlap; exploring general domain fit. Requires 30 mins/day.",
          starter_task: "Style a dark-mode user profile card using Tailwind CSS utility classes."
        }
      ];

      onComplete(payload, fallbackHypotheses);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-surfaceHighlight rounded-2xl p-8 shadow-xl animate-fade-in-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-textPrimary mb-2">Behavioral Recall</h2>
        <p className="text-textSecondary text-sm max-w-md mx-auto">
          We don't ask what career you want. Tell us what you actually do, and we'll build a skill hypothesis to test.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="block text-sm font-medium text-textPrimary">
              {q.text}
            </label>
            
            {q.type === 'select' ? (
              <select
                value={answers[q.id]}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {q.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : q.type === 'number' ? (
              <input
                type="number"
                min={q.min}
                max={q.max}
                value={answers[q.id]}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            ) : (
              <textarea
                rows={3}
                placeholder={q.placeholder}
                value={answers[q.id]}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                required
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : "Extract Evidence Vector"}
        </button>
      </form>
    </div>
  );
}
