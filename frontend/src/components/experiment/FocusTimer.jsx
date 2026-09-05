import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * =============================================================================
 * FOCUS COUNTDOWN TIMER
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Gives the student a clean, focused stopwatch for completing their day's task.
 * - Displays remaining time in big, clear MM:SS format.
 * - Has Play, Pause, and Reset controls + a quick "+5 mins" button.
 * - When the timer hits 0:00, it plays celebratory confetti to celebrate focus!
 * =============================================================================
 */
export default function FocusTimer({
  initialMinutes = 45,
  taskTitle = "Practice Task",
  onComplete,
  onClose
}) {
  const totalSeconds = initialMinutes * 60;
  // State: Countdown seconds remaining
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  // State: Is the timer actively ticking?
  const [isActive, setIsActive] = useState(false);

  // Sync if initialMinutes changes
  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
    setIsActive(false);
  }, [initialMinutes]);

  // Countdown tick effect
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Fire celebration confetti
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
      if (onComplete) onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onComplete]);

  // Convert seconds to MM:SS
  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="clean-card p-6 border-2 border-blue-500 bg-white shadow-xl relative"
    >
      {/* 1. Header with Task Title */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Active Focus Timer
            </h4>
            <p className="text-sm font-bold text-slate-800 truncate max-w-sm">
              {taskTitle}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close timer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Big MM:SS Display */}
      <div className="text-center py-2">
        <div className="text-5xl sm:text-6xl font-black font-mono-tech text-slate-900 tracking-wider">
          {formatTime()}
        </div>

        {/* Smooth Blue Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Timer Controls (Play / Pause / Reset / +5m) */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{secondsLeft < totalSeconds ? "Resume" : "Start Focus"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsActive(false);
            setSecondsLeft(totalSeconds);
          }}
          className="btn-secondary text-xs p-2.5"
          title="Reset back to start"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
        </button>

        <button
          type="button"
          onClick={() => setSecondsLeft((prev) => prev + 300)}
          className="btn-secondary text-xs px-3 py-2 font-bold"
          title="Add 5 more minutes"
        >
          +5 mins
        </button>
      </div>

    </motion.div>
  );
}
