import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';

/**
 * =============================================================================
 * ARTIFACT PROOF UPLOAD
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Lets the student submit proof of what they created (a project link or notes).
 * - Accepts:
 *   - A link (e.g. Figma file, GitHub URL, Google Drive link)
 *   - Or a quick reflection note (e.g. "Created the first screen layout")
 * - Clicking "Save Proof" confirms the task is backed by real output.
 * =============================================================================
 */
export default function ArtifactUpload({ expectedDeliverable, onSaveArtifact }) {
  const [artifactType, setArtifactType] = useState('link'); // 'link' or 'text'
  const [inputValue, setInputValue] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (onSaveArtifact) {
      onSaveArtifact({ type: artifactType, content: inputValue });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="clean-card p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          <span>Save Proof of What You Made</span>
        </h4>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Expected: {expectedDeliverable || "Screenshot or URL"}
        </span>
      </div>

      {/* Toggle between submitting a Web Link or Typing a Note */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        <button
          type="button"
          onClick={() => setArtifactType('link')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            artifactType === 'link'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Paste Link (Figma / GitHub)</span>
        </button>

        <button
          type="button"
          onClick={() => setArtifactType('text')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            artifactType === 'text'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Write a Quick Reflection</span>
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSave} className="space-y-3">
        {artifactType === 'link' ? (
          <input
            type="url"
            className="input-field text-sm"
            placeholder="Paste your Figma, Canva, or GitHub link here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        ) : (
          <textarea
            rows={2}
            className="input-field text-sm resize-none"
            placeholder="Describe what you built and what you learned..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`btn-primary text-xs py-2 px-4 ${isSaved ? 'bg-emerald-600' : ''}`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Proof Saved!</span>
              </>
            ) : (
              <span>Save Proof</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
