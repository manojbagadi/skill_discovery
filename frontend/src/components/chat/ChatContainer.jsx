import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import QuickResponseChips from './QuickResponseChips';

/**
 * =============================================================================
 * CHAT CONTAINER COMPONENT (Open WebUI Style Workspace)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Hosts the interactive conversation between the student and AI Mentor Arya.
 * - Displays one question at a time.
 * - Automatically scrolls to the newest question.
 * - Provides an input field with a Send button.
 * - Shows a friendly loading message when the AI is processing answers.
 * 
 * HOW IT LOOKS ON SCREEN:
 * - A clean white card with a message history in the center, suggestion pills
 *   at the bottom, and a text input box with a blue "Send Answer" button.
 * =============================================================================
 */
export default function ChatContainer({
  chatHistory = [],
  onSendMessage,
  loading = false
}) {
  // State: Holds what the student is currently typing in the input box
  const [inputText, setInputText] = useState("");
  
  // Ref: Points to the bottom of the chat to auto-scroll when new messages appear
  const messagesEndRef = useRef(null);

  // Auto-scroll effect: Fires whenever messages change or loading begins
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Submit typed message
  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText(""); // Clear input box after sending
  };

  // Submit via clicking a quick suggestion pill
  const handleChipSelect = (chipText) => {
    if (loading) return;
    onSendMessage(chipText);
  };

  // Allow pressing Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[65vh] min-h-[480px] clean-card p-6 relative">
      
      {/* 1. HEADER: Title and instructions */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Discovery Chat
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                Answers Given: {Math.max(0, chatHistory.filter(m => m.role === 'user').length)}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Answer naturally in your own words. There are no wrong answers!
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>One question at a time</span>
        </div>
      </div>

      {/* 2. MESSAGES SCROLL AREA: The list of chat bubbles */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
        </AnimatePresence>

        {/* Loading Indicator: Shown when waiting for AI to reply */}
        {loading && (
          <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Arya is analyzing your answers against 37 real-world skills...</span>
          </div>
        )}

        {/* Empty div for auto-scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTION PILLS: Shown when not loading */}
      {!loading && (
        <div className="shrink-0 pt-2 border-t border-slate-100">
          <QuickResponseChips onSelect={handleChipSelect} disabled={loading} />
        </div>
      )}

      {/* 4. INPUT FIELD & SEND BUTTON */}
      <div className="shrink-0 pt-3 border-t border-slate-200 flex items-center gap-3">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Type your answer here... (e.g., I love editing thumbnails or building small apps)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoFocus
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          className="btn-primary min-w-[130px] flex items-center gap-2"
          title="Click to submit your answer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send Answer</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
