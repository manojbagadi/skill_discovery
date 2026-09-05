import React from 'react';

/**
 * =============================================================================
 * QUICK RESPONSE CHIPS COMPONENT
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Gives everyday non-technical answers that real students actually do in their free time.
 * - Bridges normal hobbies (gaming, reels, movies, cricket) into computer skills!
 * =============================================================================
 */

const EVERYDAY_STUDENT_HABITS = [
  "📱 Scrolling Instagram Reels & YouTube Shorts",
  "🎮 Playing BGMI / Free Fire / PC Games",
  "🍿 Watching Anime, Movies & Netflix series",
  "🏏 Playing Cricket & Tracking Match Scores",
  "📸 Taking Photos, Selfies & Editing Filters",
  "💻 Browsing Websites, Apps & Tech Gadgets"
];

export default function QuickResponseChips({ 
  suggestions = EVERYDAY_STUDENT_HABITS, 
  onSelect, 
  disabled 
}) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="w-full py-2">
      <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
        <span>💡 Tap what you usually do in your free time:</span>
      </div>
      
      {/* Clickable habit buttons */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            title={`Click to answer: "${item}"`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
