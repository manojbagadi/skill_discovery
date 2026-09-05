import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { checkBackendHealth } from '../../services/api';

/**
 * =============================================================================
 * NAVBAR COMPONENT
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Displays the top navigation bar with the project name ("SkillCraft").
 * - Shows a real-time status light indicating if the backend server is running.
 * - Gives a "Start Over" button so students can reset their test at any time.
 * 
 * HOW IT LOOKS ON SCREEN:
 * - A clean white top header with a blue logo on the left, an "API Connected"
 *   green badge in the center, and a "Start Over" button on the right.
 * =============================================================================
 */
export default function Navbar({ onResetSession }) {
  // State: Tracks whether our backend FastAPI server on port 8000 is online
  const [backendOnline, setBackendOnline] = useState(false);

  // Automatically check the backend server health when the page loads
  useEffect(() => {
    // 1. Initial check
    checkBackendHealth().then(setBackendOnline);

    // 2. Repeat check every 15 seconds so the user always knows server status
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full max-w-6xl mx-auto px-4 pt-4 pb-2">
      {/* Container: Clean white card with subtle gray border */}
      <div className="clean-card px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        
        {/* SECTION 1: Team & Project Logo */}
        <div className="flex items-center gap-3">
          {/* Blue Logo Box with Sparkle Icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              {/* Project Name */}
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                SkillCraft
              </h1>
              {/* Simple badge indicating hackathon edition */}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                SIH 2026
              </span>
            </div>
            {/* Plain English Subtitle */}
            <p className="text-xs text-slate-500 font-medium">
              Find the practical tech skill you will actually enjoy learning
            </p>
          </div>
        </div>

        {/* SECTION 2: Server Status Light & Reset Button */}
        <div className="flex items-center gap-3">
          
          {/* Live Status Badge: Shows green dot if backend is running, yellow if waiting */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{backendOnline ? 'Backend Online' : 'Backend Standby (:8000)'}</span>
          </div>

          {/* Reset Button: Lets the student start their test from the beginning */}
          {onResetSession && (
            <button
              onClick={onResetSession}
              title="Start over from Step 1"
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Start Over</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
