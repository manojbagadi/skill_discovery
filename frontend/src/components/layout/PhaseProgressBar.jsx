import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Clock, Award, FlaskConical, CheckCircle2, Check } from 'lucide-react';

/**
 * =============================================================================
 * 6-PHASE PROGRESS STEPPER COMPONENT
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Shows the student exactly where they are in their 6-step journey.
 * - Fills a blue progress bar as the student moves forward.
 * - Uses simple, friendly, everyday titles so anyone understands the steps.
 * 
 * HOW IT LOOKS ON SCREEN:
 * - A clean horizontal stepper across the top with 6 circles (Step 1 to Step 6).
 * - Completed steps show a green checkmark.
 * - The active step is highlighted in blue.
 * - On mobile phones, it neatly displays a compact progress counter (e.g. "Step 1 of 6").
 * =============================================================================
 */

// Define the 6 simple steps with plain-English titles
const STEPS = [
  {
    id: 1,
    title: "Step 1: Your Natural Habits",
    shortTitle: "1. Habits",
    description: "What you do when bored",
    icon: Sparkles
  },
  {
    id: 2,
    title: "Step 2: Creation Style",
    shortTitle: "2. Style",
    description: "Visual, logic, or content",
    icon: Layers
  },
  {
    id: 3,
    title: "Step 3: Time & Device",
    shortTitle: "3. Capacity",
    description: "Your realistic schedule",
    icon: Clock
  },
  {
    id: 4,
    title: "Step 4: Matched Skill",
    shortTitle: "4. Match",
    description: "Calculated fit score",
    icon: Award
  },
  {
    id: 5,
    title: "Step 5: 5-Day Mini Project",
    shortTitle: "5. Practice",
    description: "Hands-on daily tasks",
    icon: FlaskConical
  },
  {
    id: 6,
    title: "Step 6: Final Decision",
    shortTitle: "6. Decision",
    description: "Deepen, adjust, or pivot",
    icon: CheckCircle2
  }
];

export default function PhaseProgressBar({ currentPhase = 1, onSelectPhase }) {
  // Calculate percentage of completion (0% to 100%)
  const progressPercent = Math.max(0, Math.min(100, ((currentPhase - 1) / (STEPS.length - 1)) * 100));

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-3">
      {/* Container: Clean white card */}
      <div className="clean-card px-6 py-4">
        
        {/* DESKTOP VIEW: Full Horizontal Stepper */}
        <div className="hidden md:flex items-center justify-between relative">
          
          {/* Gray Background Connecting Line */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0" />
          
          {/* Blue Active Progress Line (Animates smoothly from left to right) */}
          <motion.div 
            className="absolute top-5 left-6 h-1 bg-blue-600 -z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {/* Render all 6 step circles */}
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentPhase > step.id; // Already finished
            const isCurrent = currentPhase === step.id;   // Currently active
            const isUpcoming = currentPhase < step.id;  // Next steps

            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center relative z-10 cursor-pointer"
                onClick={() => onSelectPhase && onSelectPhase(step.id)}
                title={`Jump to ${step.title}`}
              >
                {/* Step Circle: Green if done, Blue if current, Gray if upcoming */}
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Label below circle */}
                <div className="text-center mt-2">
                  <div className={`text-xs font-bold ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {step.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 max-w-[90px] truncate">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE VIEW: Compact Progress Summary */}
        <div className="flex md:hidden items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {currentPhase}
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">
                Step {currentPhase} of {STEPS.length}
              </div>
              <div className="text-sm font-bold text-slate-800">
                {STEPS[currentPhase - 1]?.title}
              </div>
            </div>
          </div>

          {/* Simple progress bar dots on mobile */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div 
                key={s.id}
                className={`h-2 rounded-full transition-all ${
                  currentPhase === s.id 
                    ? 'w-6 bg-blue-600' 
                    : currentPhase > s.id 
                    ? 'w-2 bg-emerald-500' 
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
