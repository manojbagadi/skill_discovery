import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Play, Check } from 'lucide-react';

/**
 * =============================================================================
 * TIERED ACTION CARD (Step 5: Daily Practice Tasks)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Displays a single day's practice task (e.g. Day 1, Day 2, Day 3...).
 * - Allows the student to switch between 3 flexible time tiers:
 *   1. Min (15 mins) &rarr; "Busy day fallback" (just 15 mins)
 *   2. Standard (45 mins) &rarr; "Recommended core task"
 *   3. Stretch (90 mins) &rarr; "Deep dive challenge if you have extra time"
 * - Displays the concrete expected deliverable (e.g. Saved Figma file, screenshot).
 * - Has buttons to "Start Timer" and "Mark Done".
 * =============================================================================
 */

const TIERS = [
  { id: 'min', label: 'Min (15m)', mins: 15, tooltip: 'Takes only 15 minutes. Best for busy or exam days.' },
  { id: 'standard', label: 'Standard (45m)', mins: 45, tooltip: 'Recommended daily baseline for real learning.' },
  { id: 'stretch', label: 'Stretch (90m)', mins: 90, tooltip: 'Extra challenge if you have free time today.' }
];

export default function TieredActionCard({
  task,
  onStartTimer,
  isCompleted = false,
  onToggleComplete
}) {
  // State: Currently selected time tier for this specific day (default: standard)
  const [activeTier, setActiveTier] = useState('standard');

  const currentMinutes = activeTier === 'min' ? 15 : activeTier === 'stretch' ? 90 : (task.minutes || 45);

  // Dynamic explanation according to the chosen tier
  const getTierDescription = () => {
    if (activeTier === 'min') {
      return `[Quick 15-Minute Mode] Open the tool, review the starting concept, and complete just the first step: ${task.description}`;
    }
    if (activeTier === 'stretch') {
      return `[Deep 90-Minute Challenge] Complete the core task: ${task.description} AND add an extra custom touch or bonus feature to test your limits.`;
    }
    return task.description;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl clean-card border transition-all ${
        isCompleted
          ? 'border-emerald-300 bg-emerald-50/40'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      {/* 1. TOP ROW: Day Badge + Task Title + 3 Tier Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        
        {/* Day Number and Title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-base shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            <span className="text-[9px] uppercase font-bold opacity-80">Day</span>
            <span>{task.day}</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {task.title}
            </h3>
            <span className="text-xs text-slate-500">
              Selected Pace: <strong>{currentMinutes} minutes</strong>
            </span>
          </div>
        </div>

        {/* 3 Tier Buttons (Min, Standard, Stretch) */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setActiveTier(tier.id)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTier === tier.id
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={tier.tooltip}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TASK DESCRIPTION */}
      <p className="text-slate-700 text-sm leading-relaxed mb-4">
        {getTierDescription()}
      </p>

      {/* 3. DELIVERABLE PROOF & ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        {/* What to produce */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>Deliverable: <strong>{task.expected_output || "Saved screenshot / project file"}</strong></span>
        </div>

        {/* Buttons: Start Countdown or Mark Done */}
        <div className="flex items-center gap-2">
          {onStartTimer && !isCompleted && (
            <button
              type="button"
              onClick={() => onStartTimer({ ...task, minutes: currentMinutes, tier: activeTier })}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              title="Open the focus countdown timer for this task"
            >
              <Play className="w-3.5 h-3.5 text-blue-600 fill-current" />
              <span>Start Focus Timer</span>
            </button>
          )}

          {onToggleComplete && (
            <button
              type="button"
              onClick={() => onToggleComplete(task.day)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Day Completed!</span>
                </>
              ) : (
                <span>Mark Done</span>
              )}
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
