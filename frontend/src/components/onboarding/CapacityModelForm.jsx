import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Laptop, Monitor, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * =============================================================================
 * CAPACITY MODEL FORM (Step 3: Time & Device Settings)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Collects the student's real-world constraints so the AI doesn't recommend
 *   something impossible.
 * - Captures:
 *   1. Daily Available Minutes (via a clean slider from 15m to 120m).
 *   2. Primary Device: Mobile Phone, Standard Laptop, or High-Spec PC.
 * 
 * HOW IT LOOKS ON SCREEN:
 * - A clean white card with:
 *   - A time slider showing minutes per day and estimated hours per week.
 *   - 3 clickable cards for choosing your device.
 *   - A big blue button: "Find My Best Matched Skill".
 * =============================================================================
 */

const HARDWARE_OPTIONS = [
  {
    id: "mobile_only",
    title: "Mobile Phone Only",
    subtitle: "Smartphone or Tablet (Android / iPhone)",
    desc: "Best for: Content writing, UI wireframing on Canva, AI prompting",
    icon: Smartphone
  },
  {
    id: "low_spec_pc",
    title: "Standard Laptop / PC",
    subtitle: "Normal laptop with integrated graphics (8GB RAM)",
    desc: "Best for: Web development, Python coding, Figma design, Git",
    icon: Laptop
  },
  {
    id: "high_spec_pc",
    title: "High-Spec PC",
    subtitle: "Dedicated GPU / Gaming PC (16GB+ RAM)",
    desc: "Best for: Local AI models, 3D Blender, Game development",
    icon: Monitor
  }
];

export default function CapacityModelForm({
  initialMinutes = 45,
  initialHardware = "low_spec_pc",
  onSubmit,
  loading = false
}) {
  // State: Selected daily practice minutes (default 45 mins)
  const [dailyMinutes, setDailyMinutes] = useState(initialMinutes);
  
  // State: Selected hardware device
  const [hardware, setHardware] = useState(initialHardware);

  // Helper: Calculates estimated weekly hours (e.g. 45m * 7 = 5.2 hrs/week)
  const weeklyHours = ((dailyMinutes * 7) / 60).toFixed(1);

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        daily_available_minutes: Number(dailyMinutes),
        hardware_level: hardware
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto clean-card p-6 sm:p-8"
    >
      {/* 1. HEADER: Step explanation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Step 3 of 6</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Your Daily Time & Device
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          We match you with skills that fit your actual daily schedule and laptop specs so you don't face burnout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 2. SECTION 1: Daily Time Slider */}
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>How much time can you spend per day?</span>
            </div>
            
            {/* Live calculated numbers */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-600">
                {dailyMinutes} mins/day
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                (~{weeklyHours} hrs/week)
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <input
            type="range"
            min="15"
            max="120"
            step="15"
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          {/* Preset Buttons for Quick Clicking */}
          <div className="flex justify-between items-center mt-4 text-xs">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyMinutes(mins)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  dailyMinutes === mins
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
                title={`Set daily time to ${mins} minutes`}
              >
                {mins} mins
              </button>
            ))}
          </div>
        </div>

        {/* 3. SECTION 2: Primary Device Selection */}
        <div>
          <label className="block text-slate-900 font-bold text-base mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Which device do you use?</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HARDWARE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = hardware === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setHardware(opt.id)}
                  className={`p-5 rounded-xl cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{opt.title}</h4>
                      <p className="text-[11px] text-slate-500">{opt.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 mt-2">
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SUBMIT BUTTON: Clearly explains what clicking it will do */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <p className="text-xs text-slate-500 italic text-center sm:text-right">
            Clicking below will calculate your 5-factor fit score against 37 real skills
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>Find My Best Matched Skill</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </form>
    </motion.div>
  );
}
