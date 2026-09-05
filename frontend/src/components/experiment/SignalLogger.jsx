import React from 'react';
import { Zap, Target, BatteryLow } from 'lucide-react';

/**
 * =============================================================================
 * SIGNAL LOGGER (One-Tap Experience Rating)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Lets the student log how they actually felt during the task with ONE TAP:
 *   1. ⚡ "In the Zone" &rarr; Felt effortless and fun (Flow state).
 *   2. 🎯 "Challenging & Rewarding" &rarr; Hard work, but satisfying.
 *   3. 🥱 "Bored or Drained" &rarr; Clock-watching, felt like a chore.
 * - This provides the real evidence for Step 6 (Final Decision).
 * =============================================================================
 */

const SIGNALS = [
  {
    id: 'flow',
    emoji: '⚡',
    title: 'In The Zone',
    desc: 'Felt effortless and fun. Didn’t check the clock.',
    badge: 'High Flow'
  },
  {
    id: 'engaged',
    emoji: '🎯',
    title: 'Challenging & Fun',
    desc: 'Required effort, but felt satisfying and rewarding.',
    badge: 'Good Effort'
  },
  {
    id: 'drained',
    emoji: '🥱',
    title: 'Bored or Drained',
    desc: 'Felt forced, frustrating, or clock-watching.',
    badge: 'High Friction'
  }
];

export default function SignalLogger({ selectedSignal, onSelectSignal }) {
  return (
    <div className="clean-card p-6">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          How did today's task feel to you?
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Tap one card below. This helps the engine determine if you should stick with this skill or pivot.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SIGNALS.map((sig) => {
          const isSelected = selectedSignal === sig.id;

          return (
            <button
              key={sig.id}
              type="button"
              onClick={() => onSelectSignal && onSelectSignal(sig.id)}
              className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{sig.emoji}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {sig.badge}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1">{sig.title}</div>
              <p className="text-xs text-slate-600 leading-tight">{sig.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
