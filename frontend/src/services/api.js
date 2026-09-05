const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Checks if the backend FastAPI server is online.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data;
  } catch (err) {
    console.warn("Backend currently unreachable:", err.message);
    return false;
  }
}

/**
 * Sends user chat answers to LLM parser to extract evidence tags or ask clarifying questions.
 * @param {string[]} answers - List of user answers accumulated during chat.
 * @param {number} institutionId - Sandbox college/institution ID (default 1).
 */
export async function parseEvidence(answers, institutionId = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution_id: institutionId,
        answers: answers
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("Backend server is not running on port 8000. Please start the backend with: uvicorn main:app --port 8000");
    }
    throw err;
  }
}

/**
 * Evaluates the student's evidence vector against all 37 skills and returns the ranked hypotheses.
 * @param {Object} evidence - LearnerEvidenceVector from parse step.
 */
export async function scoreHypotheses(evidence) {
  try {
    const res = await fetch(`${API_BASE_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evidence)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Scoring failed with code ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("Backend server is unreachable. Ensure the backend is running on http://localhost:8000.");
    }
    throw err;
  }
}

/**
 * Fetches the 5-day action experiment plan for the chosen skill hypothesis.
 * @param {Object} hypothesis - Selected SkillHypothesisScore.
 */
export async function generatePlan(hypothesis) {
  try {
    const res = await fetch(`${API_BASE_URL}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hypothesis)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Plan compilation failed with code ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes("Failed to fetch")) {
      throw new Error("Backend server is unreachable. Ensure the backend is running on http://localhost:8000.");
    }
    throw err;
  }
}
