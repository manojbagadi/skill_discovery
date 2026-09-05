import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sliders, RefreshCw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * =============================================================================
 * REVIEW DECISION SCREEN (Step 6: The Evidence-Based Choice)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Shows up after the student completes their 5-day mini project.
 * - Presents 3 crystal-clear decision pathways based on their real experience:
 *   1. 🟢 DEEPEN &rarr; "I loved this! Commit to 30-day mastery."
 *   2. 🟡 ADJUST &rarr; "I like the idea, but need a different pace (15m tier) or sub-tool."
 *   3. 🔴 PIVOT &rarr; "I didn't enjoy this. Discard it with ZERO GUILT and test skill #2."
 * =============================================================================
 */
export default function ReviewDecisionModal({
  skillName = "UI/UX Fundamentals",
  completedDays = 5,
  onDeepen,
  onAdjust,
  onPivot
}) {
  React.useEffect(() => {
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    } catch (e) {}
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto clean-card p-6 sm:p-10 text-center"
    >
      {/* 1. Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3 border border-emerald-200">
          <Award className="w-4 h-4" />
          <span>Step 6: Final Evidence Decision</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          Mini-Project Complete!
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          You tested <strong className="text-blue-600">{skillName}</strong> for {completedDays} days.
          Based on your honest daily ratings, choose your next step:
        </p>
      </div>

      {/* 2. The 3 Clear Decision Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 text-left">
        
        {/* OPTION 1: DEEPEN */}
        <div
          onClick={onDeepen}
          className="p-6 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-0.5">Deepen</h3>
            <span className="text-xs font-bold text-emerald-700 block mb-2">
              "I Loved It &rarr; Keep Learning"
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              You felt natural flow state and enjoyed making the artifacts. Continue to the full 30-day curriculum.
            </p>
          </div>
          <button className="mt-5 w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors">
            Choose Deepen
          </button>
        </div>

        {/* OPTION 2: ADJUST */}
        <div
          onClick={onAdjust}
          className="p-6 rounded-xl border-2 border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-0.5">Adjust</h3>
            <span className="text-xs font-bold text-indigo-700 block mb-2">
              "Liked It, But Change Pace"
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              You enjoyed the skill, but 45 mins was too long, or the tool was hard. Switch to the 15m Min tier.
            </p>
          </div>
          <button className="mt-5 w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors">
            Choose Adjust
          </button>
        </div>

        {/* OPTION 3: PIVOT */}
        <div
          onClick={onPivot}
          className="p-6 rounded-xl border-2 border-rose-200 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-0.5">Pivot</h3>
            <span className="text-xs font-bold text-rose-700 block mb-2">
              "Didn't Enjoy &rarr; Try Next Skill"
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Felt like a chore or bored. That is a success! You learned what NOT to learn. Test your #2 ranked skill with zero guilt.
            </p>
          </div>
          <button className="mt-5 w-full py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors">
            Choose Pivot
          </button>
        </div>

      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 italic">
          "The goal is not to finish every course; the goal is to confess what you genuinely love doing."
        </p>
      </div>

    </motion.div>
  );
}
