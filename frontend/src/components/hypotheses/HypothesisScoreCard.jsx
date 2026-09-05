import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, Zap, Clock, Cpu, CheckCircle2 } from 'lucide-react';

/**
 * =============================================================================
 * HYPOTHESIS SCORE CARD (Step 4: The Hobby -> Tech Skill Bridge)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Shows the student how their everyday hobby (e.g. scrolling reels or playing games)
 *   translates into a real, high-demand computer skill!
 * - Displays:
 *   1. The Hobby &rarr; Hidden Superpower &rarr; Tech Skill Bridge Banner
 *   2. Circular Overall Match Percentage Gauge
 *   3. 3-Pillar Breakdown (Interest, Time, Device Fit)
 *   4. Big Action Button: "Start 5-Day Mini Project"
 * =============================================================================
 */
export default function HypothesisScoreCard({
  hypothesis,
  onAccept,
  onReject,
  loading = false
}) {
  if (!hypothesis) return null;

  const overall = Math.round(hypothesis.overall_score || 0);
  const interest = Math.round(hypothesis.interest_score || 0);
  const time = Math.round(hypothesis.time_score || 0);
  const hardware = Math.round(hypothesis.hardware_score || 0);

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl mx-auto clean-card p-6 sm:p-10 relative"
    >
      {/* 1. TOP HEADER: Step indicator and Skill Name */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Step 4: Your Personalized Match!</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {hypothesis.skill_name}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Category: <strong className="text-blue-600">{hypothesis.family || "Practical Computer Skills"}</strong>
          </p>
        </div>

        {/* Circular Match Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-slate-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#2563eb"
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900">
                {overall}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-500">
                Fit Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE HOBBY -> COMPUTER SKILL BRIDGE CARD (Key Feature!) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 mb-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            How Your Everyday Hobby Translates to This Skill:
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Box 1: Habit */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Daily Habit
            </span>
            <span className="text-sm font-bold text-slate-800">
              {hypothesis.habit_detected || "What you spend hours doing"}
            </span>
          </div>

          {/* Box 2: Strength */}
          <div className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block mb-1">
              Your Natural Strength
            </span>
            <span className="text-sm font-bold text-blue-900">
              {hypothesis.hidden_strength || "High visual and spatial focus"}
            </span>
          </div>

          {/* Box 3: Career Skill */}
          <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Computer Skill To Learn
            </span>
            <span className="text-sm font-bold text-emerald-900">
              {hypothesis.skill_name}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed italic border-t border-blue-100 pt-3">
          "{hypothesis.explanation}"
        </p>
      </div>

      {/* 3. THREE METRIC PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">{interest}%</div>
          <div className="text-xs font-bold text-slate-700">Interest Fit</div>
          <p className="text-[11px] text-slate-500 mt-1">Built directly on what you already love</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">{time}%</div>
          <div className="text-xs font-bold text-slate-700">Time Fit</div>
          <p className="text-[11px] text-slate-500 mt-1">Easily doable in your daily schedule</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 mb-0.5">{hardware}%</div>
          <div className="text-xs font-bold text-slate-700">Device Fit</div>
          <p className="text-[11px] text-slate-500 mt-1">Runs perfectly on your chosen device</p>
        </div>

      </div>

      {/* 4. ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        
        <button
          onClick={onReject}
          disabled={loading}
          className="btn-secondary w-full sm:w-auto"
          title="Go back to change your habit"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Change My Answer</span>
        </button>

        <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
          <button
            onClick={onAccept}
            disabled={loading}
            className="btn-primary w-full sm:w-auto text-base px-8 py-3.5"
          >
            <span>Start 5-Day Mini Project</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] text-slate-500 mt-1">
            Zero experience required. Day 1 starts with step-by-step setup!
          </span>
        </div>

      </div>

    </motion.div>
  );
}
