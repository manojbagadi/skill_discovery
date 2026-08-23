import { useState } from 'react';

export default function ExperimentTracker({ hypothesis, onReset }) {
  const [activeDay, setActiveDay] = useState(1);
  const [logs, setLogs] = useState([]);
  const [currentLog, setCurrentLog] = useState({
    minutes_spent: 0,
    experience_rating: "neutral", // positive, neutral, high-friction
    artifact_produced: false,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = activeDay > 5;

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock backend delay
    await new Promise(r => setTimeout(r, 800));
    
    setLogs([...logs, { day: activeDay, ...currentLog }]);
    setActiveDay(activeDay + 1);
    setCurrentLog({
      minutes_spent: 0,
      experience_rating: "neutral",
      artifact_produced: false,
      notes: ""
    });
    setIsSubmitting(false);
  };

  if (isComplete) {
    return (
      <div className="bg-surface border border-surfaceHighlight rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Experiment Complete</h2>
        <p className="text-textSecondary mb-6">
          You have completed the 5-day slice of the experiment for <strong>{hypothesis.skill_name}</strong>.
        </p>
        
        <div className="bg-background rounded-xl p-4 mb-8 text-left space-y-2 border border-surfaceHighlight">
          <p className="text-sm font-medium text-textPrimary border-b border-surfaceHighlight pb-2 mb-2">Review Loop Result:</p>
          <p className="text-sm text-textSecondary"><span className="text-secondary font-bold mr-2">Deepen</span> → You produced artifacts and reported low friction. Continue building your portfolio here.</p>
          <p className="text-sm text-textSecondary"><span className="text-primary font-bold mr-2">Pivot</span> → If friction was high, go back and test another hypothesis.</p>
        </div>

        <button
          onClick={onReset}
          className="bg-primary/10 hover:bg-primary text-primary hover:text-white font-medium py-3 px-8 rounded-lg transition-colors border border-primary/30 hover:border-primary"
        >
          Start New Exploration
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Experiment Tracker</h2>
          <p className="text-textSecondary text-sm">
            Testing hypothesis: <span className="font-semibold text-primary">{hypothesis.skill_name}</span>
          </p>
        </div>
        <button 
          onClick={onReset}
          className="text-textSecondary hover:text-textPrimary text-sm font-medium transition-colors"
        >
          Abort Experiment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Task Context */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-5">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Goal</h3>
            <p className="text-sm text-textPrimary font-medium">
              {hypothesis.starter_task}
            </p>
          </div>
          
          <div className="bg-surface border border-surfaceHighlight rounded-xl p-5">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Progress</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-textPrimary">Day {activeDay} of 5</span>
              <span className="text-xs text-textSecondary">{Math.round((activeDay-1)/5 * 100)}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${((activeDay-1)/5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Col: Daily Log Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleLogSubmit} className="bg-surface border border-surfaceHighlight rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-textPrimary mb-6 flex items-center">
              <span className="bg-primary/20 text-primary w-6 h-6 rounded flex items-center justify-center mr-2 text-sm">D{activeDay}</span>
              Log Daily Signal
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">Minutes Spent</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  required
                  value={currentLog.minutes_spent}
                  onChange={(e) => setCurrentLog({...currentLog, minutes_spent: e.target.value})}
                  className="w-full bg-background border border-surfaceHighlight rounded-lg px-4 py-2 text-textPrimary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-2">Experience Friction</label>
                <div className="grid grid-cols-3 gap-3">
                  {['positive', 'neutral', 'high-friction'].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCurrentLog({...currentLog, experience_rating: rating})}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        currentLog.experience_rating === rating 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-background border-surfaceHighlight text-textSecondary hover:border-textSecondary/50'
                      }`}
                    >
                      {rating === 'positive' ? 'Flow' : rating === 'neutral' ? 'Okay' : 'High Friction'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="artifact"
                  checked={currentLog.artifact_produced}
                  onChange={(e) => setCurrentLog({...currentLog, artifact_produced: e.target.checked})}
                  className="w-5 h-5 rounded border-surfaceHighlight bg-background text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="artifact" className="text-sm font-medium text-textPrimary">
                  I produced a tangible artifact today (e.g. screenshot, code, sketch)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
              >
                {isSubmitting ? 'Saving...' : `Complete Day ${activeDay}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
