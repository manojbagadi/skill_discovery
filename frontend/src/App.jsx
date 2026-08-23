import { useState } from 'react'
import Profiler from './components/Profiler'
import ScoreBreakdown from './components/ScoreBreakdown'
import ExperimentTracker from './components/ExperimentTracker'

function App() {
  const [currentStep, setCurrentStep] = useState('profiler'); // profiler, score, tracker
  const [evidenceData, setEvidenceData] = useState(null);
  const [hypothesis, setHypothesis] = useState(null);

  const handleProfileComplete = (evidence, topHypotheses) => {
    setEvidenceData({ evidence, topHypotheses });
    setCurrentStep('score');
  };

  const handleHypothesisSelect = (selectedHypothesis) => {
    setHypothesis(selectedHypothesis);
    setCurrentStep('tracker');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Skill Discovery Engine
        </h1>
        <div className="flex space-x-2 text-sm">
          <span className={`px-3 py-1 rounded-full ${currentStep === 'profiler' ? 'bg-primary text-white' : 'text-textSecondary'}`}>Recall</span>
          <span className={`px-3 py-1 rounded-full ${currentStep === 'score' ? 'bg-primary text-white' : 'text-textSecondary'}`}>Score</span>
          <span className={`px-3 py-1 rounded-full ${currentStep === 'tracker' ? 'bg-primary text-white' : 'text-textSecondary'}`}>Experiment</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl flex-1 flex flex-col justify-center">
        {currentStep === 'profiler' && (
          <Profiler onComplete={handleProfileComplete} />
        )}
        
        {currentStep === 'score' && evidenceData && (
          <ScoreBreakdown 
            data={evidenceData} 
            onSelect={handleHypothesisSelect} 
            onBack={() => setCurrentStep('profiler')}
          />
        )}

        {currentStep === 'tracker' && hypothesis && (
          <ExperimentTracker 
            hypothesis={hypothesis} 
            onReset={() => setCurrentStep('profiler')}
          />
        )}
      </main>
    </div>
  )
}

export default App
