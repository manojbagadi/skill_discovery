import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';

/**
 * =============================================================================
 * MESSAGE BUBBLE COMPONENT
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Renders a single chat bubble in the conversation.
 * - If it's from Arya (the AI Mentor), it appears on the left with a blue icon.
 * - If it's from the Student (You), it appears on the right with a clean dark bubble.
 * 
 * HOW IT LOOKS ON SCREEN:
 * - Left side: Light gray bubble with Arya's friendly questions.
 * - Right side: Blue bubble with your typed answers.
 * =============================================================================
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 1. Avatar Icon: User vs Mentor */}
      <div
        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-blue-700 border border-slate-300'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* 2. Message Bubble Box */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Name tag above bubble */}
        <span className="text-[11px] font-semibold text-slate-500 mb-1 px-1">
          {isUser ? 'You' : 'Arya — Your Skill Mentor'}
        </span>

        {/* Text Body */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
              : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none'
          }`}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  );
}
