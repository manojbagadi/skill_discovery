import React, { useState } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', text: "Welcome. I am your Skill Discovery Engine. What non-academic activity have you spent 3+ hours on recently without checking the clock?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [hypothesis, setHypothesis] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const INSTITUTION_ID = 1; // Assuming we are in a sandbox

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const newChat = [...chatHistory, { role: 'user', text: inputText }];
    setChatHistory(newChat);
    setInputText("");
    setLoading(true);

    if (step === 1) {
      
      try {
        // Collect all previous user answers to send to the LLM for context
        const allUserAnswers = newChat.filter(msg => msg.role === 'user').map(msg => msg.text);

        // 1. Parse
        const parseRes = await fetch("http://localhost:8000/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ institution_id: INSTITUTION_ID, answers: allUserAnswers })
        });
        
        if (!parseRes.ok) {
          const errData = await parseRes.json();
          throw new Error(errData.detail || "Server Error");
        }
        
        const responseData = await parseRes.json();

        if (responseData.type === "clarification") {
            // The LLM needs more info, display its question and stay on step 1
            setChatHistory(prev => [...prev, { role: 'system', text: responseData.message }]);
        } else if (responseData.type === "evidence") {
            // The LLM got enough info and returned the JSON tags
            setChatHistory(prev => [...prev, { role: 'system', text: "Analyzing your signals against our taxonomy..." }]);
            const evidence = responseData.data;

            // 2. Score
            const scoreRes = await fetch("http://localhost:8000/score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(evidence)
            });
            const scores = await scoreRes.json();
            
            if (scores && scores.length > 0) {
              setHypothesis(scores[0]);
              setStep(2); // Score Card view
            }
        }

      } catch (err) {
        console.error("API Error:", err);
        setChatHistory(prev => [...prev, { role: 'system', text: `❌ Error: ${err.message}` }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAcceptHypothesis = async () => {
    setLoading(true);
    try {
      const planRes = await fetch("http://localhost:8000/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hypothesis)
      });
      const planData = await planRes.json();
      setPlan(planData);
      setStep(3); // Plan view
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] flex flex-col items-center p-6 font-sans">
      
      <div className="w-full max-w-4xl flex flex-col items-center mt-12 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-center mb-4">
          Skill Discovery Engine
        </h1>
        <p className="text-slate-400 text-lg text-center max-w-2xl">
          Hypothesis-driven exploration operating system for students. Discover what you actually enjoy doing.
        </p>
      </div>

      {step === 1 && (
        <div className="w-full max-w-3xl glass-panel p-6 flex flex-col h-[60vh] animate-in fade-in zoom-in-95 duration-500">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700 shadow-inner'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 text-slate-400 border border-slate-700 px-5 py-3 rounded-2xl animate-pulse">
                  Processing...
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700/50">
            <input 
              type="text" 
              className="input-field flex-1" 
              placeholder="E.g., I like playing with layouts on Canva..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button className="btn-primary min-w-[100px]" onClick={handleSend} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      {step === 2 && hypothesis && (
        <div className="w-full max-w-3xl glass-panel p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Skill Hypothesis Formed</h2>
              <p className="text-pink-400 font-bold text-2xl drop-shadow-sm">{hypothesis.skill_name}</p>
              <div className="text-xs text-slate-500 mt-2 font-mono">Taxonomy v{hypothesis.taxonomy_version} | Weights v{hypothesis.weights_version}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-transform">
              <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                {Math.round(hypothesis.overall_score)}
              </div>
              <div className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-semibold">Overall Fit</div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-pink-500"></div>
            <p className="text-slate-300 leading-relaxed text-lg italic ml-2">"{hypothesis.explanation}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center hover:bg-slate-800 transition-colors">
              <div className="text-4xl font-bold text-indigo-400 mb-2">{Math.round(hypothesis.interest_score)}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Interest Score</div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center hover:bg-slate-800 transition-colors">
              <div className="text-4xl font-bold text-purple-400 mb-2">{Math.round(hypothesis.time_score)}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Time Score</div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center hover:bg-slate-800 transition-colors">
              <div className="text-4xl font-bold text-pink-400 mb-2">{Math.round(hypothesis.hardware_score)}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Hardware Score</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-4 border-t border-slate-700/50 pt-6">
            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Reject & Clarify</button>
            <button className="btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)]" onClick={handleAcceptHypothesis} disabled={loading}>
              Run 5-Day Experiment
              {loading && <span className="animate-spin text-white">◷</span>}
            </button>
          </div>
        </div>
      )}

      {step === 3 && plan && (
        <div className="w-full max-w-4xl glass-panel p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="mb-8 border-b border-slate-700/50 pb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Your 5-Day Micro-Experiment</h2>
            <p className="text-slate-400 text-lg">Skill: <span className="text-pink-400 font-semibold">{hypothesis.skill_name}</span> | Tier: <span className="text-indigo-400 font-semibold capitalize">Standard</span></p>
            <div className="text-xs text-slate-500 mt-2 font-mono">Template v{plan.template_version}</div>
          </div>
          
          <div className="space-y-5">
            {plan.tasks.map(task => (
              <div key={task.day} className="group bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 flex flex-col md:flex-row items-start gap-6 hover:-translate-y-1 hover:shadow-xl">
                <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl w-14 h-14 flex flex-col items-center justify-center font-bold text-xl shrink-0">
                  <span className="text-xs font-normal uppercase tracking-widest opacity-70">Day</span>
                  {task.day}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{task.title}</h3>
                    <span className="text-sm font-semibold bg-slate-900 text-slate-300 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">
                      {task.minutes} mins
                    </span>
                  </div>
                  <p className="text-slate-300 mb-4 text-lg leading-relaxed">{task.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm text-pink-400/90 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Expected Output: {task.expected_output}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-700/50 text-center">
            <button className="btn-primary px-10 py-4 text-lg shadow-[0_0_30px_rgba(236,72,153,0.4)]">Begin Day 1 Execution</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
