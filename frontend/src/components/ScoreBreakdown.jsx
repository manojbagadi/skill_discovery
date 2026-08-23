export default function ScoreBreakdown({ data, onSelect, onBack }) {
  const { topHypotheses } = data;

  return (
    <div className="animate-fade-in-up w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Skill Hypotheses</h2>
          <p className="text-textSecondary text-sm">
            Based on your evidence vector, here are the top deterministic matches.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors"
        >
          ← Edit Answers
        </button>
      </div>

      <div className="space-y-6">
        {topHypotheses.map((hypo, idx) => (
          <div 
            key={hypo.skill_id}
            className={`bg-surface border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
              idx === 0 ? 'border-primary/50 shadow-[0_4px_20px_rgba(59,130,246,0.15)]' : 'border-surfaceHighlight hover:border-textSecondary/30'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  {idx === 0 && <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">Top Match</span>}
                  <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">{hypo.family}</span>
                </div>
                <h3 className="text-xl font-bold text-textPrimary">{hypo.skill_name}</h3>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-white flex items-baseline">
                  {hypo.overall_score} <span className="text-sm text-textSecondary ml-1 font-normal">/100</span>
                </div>
                <span className="text-xs text-textSecondary mt-1">Overall Fit</span>
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 mb-5 text-sm text-textSecondary border border-surfaceHighlight">
              <span className="font-mono text-primary/80 mr-2">&gt;</span>
              {hypo.explanation}
            </div>

            {/* Score Bars */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ScoreBar label="Interest Fit (40%)" score={hypo.interest_score} />
              <ScoreBar label="Time Fit (30%)" score={hypo.time_score} />
              <ScoreBar label="Hardware Fit (30%)" score={hypo.hardware_score} />
            </div>

            <div className="pt-4 border-t border-surfaceHighlight flex justify-between items-center">
              <div className="text-sm">
                <span className="text-textSecondary block mb-1">Starter Task:</span>
                <span className="text-textPrimary font-medium">{hypo.starter_task}</span>
              </div>
              <button
                onClick={() => onSelect(hypo)}
                className="ml-4 flex-shrink-0 bg-primary/10 hover:bg-primary text-primary hover:text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 border border-primary/30 hover:border-primary"
              >
                Test this Hypothesis →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-medium text-textSecondary">{label}</span>
        <span className="text-xs font-bold text-textPrimary">{score}</span>
      </div>
      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-secondary h-1.5 rounded-full" 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}
