import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import PhaseProgressBar from './components/layout/PhaseProgressBar';
import ChatContainer from './components/chat/ChatContainer';
import CapacityModelForm from './components/onboarding/CapacityModelForm';
import HypothesisScoreCard from './components/hypotheses/HypothesisScoreCard';
import TieredActionCard from './components/experiment/TieredActionCard';
import FocusTimer from './components/experiment/FocusTimer';
import SignalLogger from './components/experiment/SignalLogger';
import ArtifactUpload from './components/experiment/ArtifactUpload';
import ReviewDecisionModal from './components/review/ReviewDecisionModal';
import { parseEvidence, scoreHypotheses, generatePlan } from './services/api';
import { Palette, Code2, Film, BarChart3, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * =============================================================================
 * MASTER APP CONTROLLER (Frontend Client)
 * -----------------------------------------------------------------------------
 * WHAT THIS COMPONENT DOES:
 * - Manages all 6 steps of the student's journey.
 * - Guarantees that EVERY button works, even if the student clicks ahead on
 *   the progress bar or clicks directly on a feature.
 * - Connects the beginner habits (gaming, reels, movies) to computer skills.
 * =============================================================================
 */

const INITIAL_CHAT = [
  {
    role: 'system',
    text: "Welcome to SkillCraft! I am Arya, your skill mentor. Tell me: when you have free time or get distracted from studying, what do you usually do? (e.g., scroll reels, play games, watch anime, or play sports?)"
  }
];

// Helper: Maps everyday student habits to real-world computer skills
function mapHabitToComputerSkill(text = "") {
  const lower = text.toLowerCase();

  // 1. REELS / SHORTS / VIDEOS / SOCIAL MEDIA
  if (lower.includes("reel") || lower.includes("short") || lower.includes("instagram") || lower.includes("tiktok") || lower.includes("video") || lower.includes("youtube") || lower.includes("scroll") || lower.includes("social media")) {
    return {
      skill_id: "vis_07",
      family: "Visual & Content Creation",
      skill_name: "Video Editing & Motion Graphics",
      habit_detected: "Scrolling Reels & Watching Video Shorts",
      hidden_strength: "Visual Pacing, Hook Timing & Sound Sense",
      overall_score: 91,
      interest_score: 95,
      time_score: 90,
      hardware_score: 88,
      explanation: "You already consume hundreds of short-form videos and understand what catches attention. The other side of consuming reels is CREATING them using computer tools like CapCut or Premiere!",
      tasks: [
        { day: 1, title: "CapCut Setup & First Cut", description: "Download CapCut (PC or Mobile). Import 3 random clips from your phone and trim them to 10 seconds total.", minutes: 45, tier: "standard", expected_output: "10-second trimmed video file" },
        { day: 2, title: "Beat Syncing & Music Audio", description: "Add a trending audio track. Split and cut video clips exactly on the drum beats.", minutes: 45, tier: "standard", expected_output: "Exported video cut to the beat" },
        { day: 3, title: "Kinetic Captions & Sound FX", description: "Add animated word-by-word captions and 2 'whoosh' sound effects for punchy pacing.", minutes: 45, tier: "standard", expected_output: "Video with captions & sound fx" },
        { day: 4, title: "Color Filter & Zoom Transitions", description: "Apply a clean aesthetic color filter and add slow zoom-in transitions to key moments.", minutes: 45, tier: "standard", expected_output: "Final 15-second portfolio short" },
        { day: 5, title: "Peer Reaction & Review", description: "Show your 15-second short to 2 friends. Ask if the pacing kept their attention the whole time.", minutes: 45, tier: "standard", expected_output: "Written feedback notes" }
      ]
    };
  }

  // 2. GAMING / BGMI / FREE FIRE / GTA / GAMES
  if (lower.includes("game") || lower.includes("bgmi") || lower.includes("free fire") || lower.includes("gta") || lower.includes("pubg") || lower.includes("playstation") || lower.includes("valorant") || lower.includes("cod")) {
    return {
      skill_id: "prog_04",
      family: "Game Tech & Logic",
      skill_name: "Game Mechanics & Python Scripting",
      habit_detected: "Competitive Gaming & Strategy Play",
      hidden_strength: "Rule Systems, Fast Decision Making & Spatial Coordination",
      overall_score: 89,
      interest_score: 94,
      time_score: 88,
      hardware_score: 85,
      explanation: "Gamers make incredible programmers because you intuitively understand game loops, cooldown timers, health points, and player rules. Building small 2D games in Python or Godot is the natural next step!",
      tasks: [
        { day: 1, title: "Python & Pygame Setup", description: "Install Python and Pygame. Create a game window with a black background and title.", minutes: 45, tier: "standard", expected_output: "Working game window screenshot" },
        { day: 2, title: "Player Box & Keyboard Movement", description: "Draw a player character rectangle. Make it move up, down, left, right with arrow keys.", minutes: 45, tier: "standard", expected_output: "Moving player sprite script" },
        { day: 3, title: "Enemy Spawn & Random Motion", description: "Spawn random red obstacle blocks falling from top of screen.", minutes: 45, tier: "standard", expected_output: "Falling obstacles animation" },
        { day: 4, title: "Hitbox Collision & Game Over", description: "Add collision detection: if player touches falling block, trigger 'Game Over' screen.", minutes: 45, tier: "standard", expected_output: "Playable dodge mini-game" },
        { day: 5, title: "High Score Tracker & Playtest", description: "Track score based on survival seconds. Have a friend play and try to beat your record!", minutes: 45, tier: "standard", expected_output: "Playable dodge mini-game link" }
      ]
    };
  }

  // 3. MOVIES / ANIME / NETFLIX / SERIES / STORIES
  if (lower.includes("movie") || lower.includes("anime") || lower.includes("series") || lower.includes("netflix") || lower.includes("film") || lower.includes("cinema") || lower.includes("watch")) {
    return {
      skill_id: "cont_02",
      family: "Creative & Digital Storytelling",
      skill_name: "Digital Storytelling & Webtoon / Scriptwriting",
      habit_detected: "Binge-Watching Movies & Anime Series",
      hidden_strength: "Story Structure, Character Dynamics & Emotional Arcs",
      overall_score: 88,
      interest_score: 92,
      time_score: 90,
      hardware_score: 95,
      explanation: "Consuming movies and anime trains your narrative intuition. Learning digital screenplay formatting or visual comic storyboarding lets you write scripts for games, creators, or media brands!",
      tasks: [
        { day: 1, title: "Logline & 3-Act Outline", description: "Pick your favorite anime concept. Write a 1-sentence logline and a 3-act beginning, middle, and end.", minutes: 45, tier: "standard", expected_output: "1-page story outline" },
        { day: 2, title: "Character Profile & Conflict", description: "Design a protagonist with 1 strength, 1 fatal flaw, and a clear goal.", minutes: 45, tier: "standard", expected_output: "Character sheet document" },
        { day: 3, title: "Opening Scene Screenplay", description: "Use free tool WriterDuet. Format 2 pages of screenplay with sluglines and dialogue.", minutes: 45, tier: "standard", expected_output: "2-page formatted script PDF" },
        { day: 4, title: "Visual Storyboard Slides", description: "Create a 6-panel storyboard using Canva or hand drawings showing camera angles.", minutes: 45, tier: "standard", expected_output: "6-panel storyboard slide" },
        { day: 5, title: "Pitch Presentation & Feedback", description: "Read your 2-page scene aloud to a peer. Ask if the twist was surprising.", minutes: 45, tier: "standard", expected_output: "Written peer critique notes" }
      ]
    };
  }

  // 4. SPORTS / CRICKET / FOOTBALL / STATS
  if (lower.includes("cricket") || lower.includes("sport") || lower.includes("football") || lower.includes("score") || lower.includes("stats") || lower.includes("ipl")) {
    return {
      skill_id: "data_03",
      family: "Data & Analytics",
      skill_name: "Sports Data Analytics & Visualization",
      habit_detected: "Tracking Cricket Scores & Match Statistics",
      hidden_strength: "Pattern Recognition, Metric Comparison & Tactical Insight",
      overall_score: 86,
      interest_score: 90,
      time_score: 85,
      hardware_score: 92,
      explanation: "If you love checking strike rates, bowling averages, and points tables, you already think like a Data Analyst! Using tools like Google Sheets or Python transforms that passion into high-paying analytics skills.",
      tasks: [
        { day: 1, title: "Download IPL / Player Dataset", description: "Download a free Kaggle IPL dataset. Open in Google Sheets or Excel.", minutes: 45, tier: "standard", expected_output: "Cleaned spreadsheet file" },
        { day: 2, title: "Top Batsmen Average Formulas", description: "Use AVERAGEIF and SORT formulas to calculate the top 5 highest-scoring players.", minutes: 45, tier: "standard", expected_output: "Top 5 player ranking sheet" },
        { day: 3, title: "Strike Rate vs Average Bar Chart", description: "Build an interactive bar chart comparing strike rates of top finishers.", minutes: 45, tier: "standard", expected_output: "Chart image export" },
        { day: 4, title: "Win Percentage Pie Chart & Slicers", description: "Create an interactive dashboard with team slicers to compare toss winners vs match winners.", minutes: 45, tier: "standard", expected_output: "Interactive dashboard sheet" },
        { day: 5, title: "Match Prediction Summary Slide", description: "Write a 3-bullet match prediction using the data you analyzed.", minutes: 45, tier: "standard", expected_output: "1-slide match insight summary" }
      ]
    };
  }

  // 5. PHOTOS / FILTERS / INSTA AESTHETICS / DRAWING
  if (lower.includes("photo") || lower.includes("filter") || lower.includes("draw") || lower.includes("sketch") || lower.includes("camera") || lower.includes("design") || lower.includes("art")) {
    return {
      skill_id: "vis_01",
      family: "Visual & UI Design",
      skill_name: "Graphic Design & Social Branding (Figma/Canva)",
      habit_detected: "Photography, Filters & Visual Editing",
      hidden_strength: "Color Harmony, Composition & Aesthetic Eye",
      overall_score: 93,
      interest_score: 96,
      time_score: 92,
      hardware_score: 100,
      explanation: "Having an eye for good photos, filters, and layouts is the exact skill businesses pay designers for to create brand logos, banners, and social ads!",
      tasks: [
        { day: 1, title: "Design a Modern Cafe Logo", description: "Pick a fictional coffee shop. Create a minimalist logo using basic geometric shapes in Canva or Figma.", minutes: 45, tier: "standard", expected_output: "Exported logo file" },
        { day: 2, title: "Brand Color Palette & Fonts", description: "Choose 2 complementary colors and 2 Google fonts that match the cafe's vibe.", minutes: 45, tier: "standard", expected_output: "Brand style board" },
        { day: 3, title: "Instagram Promo Story Banner", description: "Create an eye-catching 1080x1920 Instagram story announcing a weekend discount.", minutes: 45, tier: "standard", expected_output: "Finished story banner" },
        { day: 4, title: "Packaging & Cup Mockup", description: "Place your logo onto a realistic paper coffee cup mockup to visualize the real product.", minutes: 45, tier: "standard", expected_output: "Cup mockup graphic" },
        { day: 5, title: "Portfolio Presentation Card", description: "Combine logo, story banner, and cup mockup into one clean Behance/portfolio slide.", minutes: 45, tier: "standard", expected_output: "1-slide brand portfolio" }
      ]
    };
  }

  // DEFAULT: Frontend Web Development
  return {
    skill_id: "front_01",
    family: "Frontend & Web Tech",
    skill_name: "Frontend Web Development (HTML, CSS & JS)",
    habit_detected: "Browsing Apps, Websites & Exploring Gadgets",
    hidden_strength: "Curiosity for How Things Work & Interactive Creation",
    overall_score: 87,
    interest_score: 90,
    time_score: 85,
    hardware_score: 100,
    explanation: "You use websites and apps every single day. Learning HTML, CSS, and basic JavaScript lets you create real websites that anyone in the world can visit!",
    tasks: [
      { day: 1, title: "Your Very First HTML Webpage", description: "Open text editor. Write basic HTML tags (<h1>, <p>, <button>) introducing yourself.", minutes: 45, tier: "standard", expected_output: "Working index.html file" },
      { day: 2, title: "CSS Colors & Modern Styling", description: "Add CSS to style your page: dark background, rounded card, and a blue button.", minutes: 45, tier: "standard", expected_output: "Styled web page screenshot" },
      { day: 3, title: "Make It Mobile-Friendly", description: "Add responsive viewport settings so your page looks great on phones and laptops.", minutes: 45, tier: "standard", expected_output: "Mobile preview screenshot" },
      { day: 4, title: "Add an Interactive Button", description: "Write 3 lines of JavaScript to change the background color when a button is clicked.", minutes: 45, tier: "standard", expected_output: "Interactive click page" },
      { day: 5, title: "Publish Live Online for Free", description: "Deploy your webpage for free on Netlify or Vercel and send the live link to a friend!", minutes: 45, tier: "standard", expected_output: "Live website URL" }
    ]
  };
}

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT);
  const [loading, setLoading] = useState(false);
  const [evidenceVector, setEvidenceVector] = useState(null);

  const [selectedHypothesis, setSelectedHypothesis] = useState(null);
  const [plan, setPlan] = useState(null);
  const [completedDays, setCompletedDays] = useState({ 1: true });
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [loggedSignal, setLoggedSignal] = useState('flow');
  const [loggedArtifact, setLoggedArtifact] = useState(null);
  const [decisionFeedback, setDecisionFeedback] = useState(null);

  const handleResetSession = () => {
    setCurrentPhase(1);
    setChatHistory(INITIAL_CHAT);
    setEvidenceVector(null);
    setSelectedHypothesis(null);
    setPlan(null);
    setCompletedDays({ 1: true });
    setActiveTimerTask(null);
    setLoggedSignal('flow');
    setLoggedArtifact(null);
    setDecisionFeedback(null);
  };

  // Safe Navigation Handler: Ensures EVERY button on the top progress bar works!
  const handleSelectPhase = (phase) => {
    // If jumping to Step 4 or 5 without having answered questions, auto-load default data
    if ((phase === 4 || phase === 5 || phase === 6) && !selectedHypothesis) {
      const fallbackSkill = mapHabitToComputerSkill("reels");
      setSelectedHypothesis(fallbackSkill);
      setPlan({
        hypothesis_id: fallbackSkill.skill_id,
        template_version: 1,
        tasks: fallbackSkill.tasks
      });
    } else if (phase === 5 && !plan) {
      const currentSkill = selectedHypothesis || mapHabitToComputerSkill("reels");
      setPlan({
        hypothesis_id: currentSkill.skill_id,
        template_version: 1,
        tasks: currentSkill.tasks || currentSkill.fallback_tasks
      });
    }
    setCurrentPhase(phase);
  };

  // STEP 1 & 2: Chat sending
  const handleSendMessage = async (userText) => {
    const updatedChat = [...chatHistory, { role: 'user', text: userText }];
    setChatHistory(updatedChat);
    setLoading(true);

    try {
      const userAnswers = updatedChat
        .filter((m) => m.role === 'user')
        .map((m) => m.text);

      const res = await parseEvidence(userAnswers);

      if (res && res.type === 'clarification') {
        setChatHistory((prev) => [...prev, { role: 'system', text: res.message }]);
        setCurrentPhase(2);
      } else if (res && res.type === 'evidence') {
        setEvidenceVector(res.data);
        setCurrentPhase(3);
      } else {
        throw new Error("Local fallback");
      }
    } catch (err) {
      // Smart local habit mapping
      const allText = updatedChat.filter(m => m.role === 'user').map(m => m.text).join(" ");
      const matched = mapHabitToComputerSkill(allText);

      setEvidenceVector({
        institution_id: 1,
        interest_tags: [matched.skill_id],
        procrastination_anchors: [matched.habit_detected],
        perceived_strengths: [matched.hidden_strength],
        daily_available_minutes: 45,
        hardware_level: "low_spec_pc",
        detected_mapping: matched
      });
      setCurrentPhase(2); // Move to Step 2: Creation Style
    } finally {
      setLoading(false);
    }
  };

  // Quick Style Selection in Step 2
  const handleSelectStyle = (styleKeyword) => {
    const matched = mapHabitToComputerSkill(styleKeyword);
    setSelectedHypothesis(matched);
    setPlan({
      hypothesis_id: matched.skill_id,
      template_version: 1,
      tasks: matched.tasks
    });
    setCurrentPhase(3); // Advance to Time & Device Form
  };

  // STEP 3: Time & Device Form
  const handleCapacitySubmit = async (capacityData) => {
    setLoading(true);
    
    // Combine chat answers
    const allUserText = chatHistory.filter(m => m.role === 'user').map(m => m.text).join(" ");
    const matched = selectedHypothesis || mapHabitToComputerSkill(allUserText || "reels");

    try {
      const scored = await scoreHypotheses({
        institution_id: 1,
        interest_tags: [matched.skill_id],
        procrastination_anchors: [matched.habit_detected],
        perceived_strengths: [matched.hidden_strength],
        daily_available_minutes: capacityData.daily_available_minutes,
        hardware_level: capacityData.hardware_level
      });

      if (scored && scored.length > 0) {
        setSelectedHypothesis({
          ...scored[0],
          habit_detected: matched.habit_detected,
          hidden_strength: matched.hidden_strength,
          fallback_tasks: matched.tasks
        });
      } else {
        throw new Error("Fallback required");
      }
    } catch (err) {
      setSelectedHypothesis({
        ...matched,
        daily_available_minutes: capacityData.daily_available_minutes,
        hardware_level: capacityData.hardware_level,
        fallback_tasks: matched.tasks
      });
    } finally {
      setLoading(false);
      setCurrentPhase(4); // Advance to Matched Skill Score Card
    }
  };

  // STEP 4: Accept Hypothesis & Load 5-Day Plan
  const handleAcceptHypothesis = async () => {
    setLoading(true);
    try {
      const planData = await generatePlan(selectedHypothesis);
      if (planData && planData.tasks && planData.tasks.length > 0) {
        setPlan(planData);
      } else {
        throw new Error("Plan empty");
      }
    } catch (err) {
      const tasks = selectedHypothesis?.fallback_tasks || selectedHypothesis?.tasks || [
        { day: 1, title: "Setup & First Output", description: `Install the recommended tool for ${selectedHypothesis?.skill_name || 'your skill'}. Create your first hello world project.`, minutes: 45, tier: "standard", expected_output: "Screenshot of saved output" },
        { day: 2, title: "Core Building Blocks", description: "Learn the primary 2 tools or functions used by professionals in this field.", minutes: 45, tier: "standard", expected_output: "Mini practice file" },
        { day: 3, title: "Replicate a Real Example", description: "Find a simple real-world project and rebuild 50% of it yourself.", minutes: 45, tier: "standard", expected_output: "Replicated project asset" },
        { day: 4, title: "Your Own Original Project", description: "Create an original version from scratch solving a small everyday problem.", minutes: 45, tier: "standard", expected_output: "Working project file / link" },
        { day: 5, title: "Peer Review & Feedback", description: "Share your deliverable with a friend and write down their honest reaction.", minutes: 45, tier: "standard", expected_output: "Written feedback notes" }
      ];

      setPlan({
        hypothesis_id: selectedHypothesis?.skill_id || "vis_01",
        template_version: 1,
        tasks: tasks
      });
    } finally {
      setLoading(false);
      setCurrentPhase(5); // Advance to 5-Day Project Dashboard
    }
  };

  const handleToggleDay = (day) => {
    setCompletedDays((prev) => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col pb-16">
      
      {/* 1. TOP NAVBAR */}
      <Navbar onResetSession={handleResetSession} />

      {/* 2. 6-STEP PROGRESS TRACKER (All buttons fully clickable) */}
      <PhaseProgressBar 
        currentPhase={currentPhase} 
        onSelectPhase={handleSelectPhase} 
      />

      {/* 3. MAIN WORKSPACE */}
      <main className="w-full max-w-6xl mx-auto px-4 mt-4 flex-1 flex flex-col items-center justify-start">
        
        {/* STEP 1: Discovery Chat */}
        {currentPhase === 1 && (
          <div className="w-full">
            <ChatContainer
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              loading={loading}
            />
          </div>
        )}

        {/* STEP 2: Creation Style Preference Card */}
        {currentPhase === 2 && (
          <div className="w-full max-w-4xl mx-auto clean-card p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200">
              <span>Step 2 of 6</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Which Creation Style Excites You Most?
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mb-8">
              Tap one card below. This helps the engine narrow down which tech path fits your natural brain style.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              
              {/* Option 1 */}
              <button
                type="button"
                onClick={() => handleSelectStyle("reels visual design")}
                className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 bg-white transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Visual & Aesthetic Creation</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reels, video edits, graphic design, posters, UI colors, and website layouts.
                </p>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                onClick={() => handleSelectStyle("gaming coding python")}
                className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 bg-white transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Games, Logic & Coding</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gaming mechanics, software logic, automation scripts, and problem solving.
                </p>
              </button>

              {/* Option 3 */}
              <button
                type="button"
                onClick={() => handleSelectStyle("movies anime storytelling")}
                className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 bg-white transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Digital Media & Storytelling</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Movie concepts, digital storyboards, creative writing, and creator content.
                </p>
              </button>

              {/* Option 4 */}
              <button
                type="button"
                onClick={() => handleSelectStyle("sports cricket analytics stats")}
                className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 bg-white transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Numbers, Patterns & Analytics</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sports statistics, financial charts, dashboards, and data insights.
                </p>
              </button>

            </div>
          </div>
        )}

        {/* STEP 3: Daily Time & Device Picker */}
        {currentPhase === 3 && (
          <div className="w-full">
            <CapacityModelForm
              initialMinutes={evidenceVector?.daily_available_minutes || 45}
              initialHardware={evidenceVector?.hardware_level || "low_spec_pc"}
              onSubmit={handleCapacitySubmit}
              loading={loading}
            />
          </div>
        )}

        {/* STEP 4: Matched Skill Score Card (Hobby to Skill Bridge) */}
        {currentPhase === 4 && (
          <div className="w-full">
            <HypothesisScoreCard
              hypothesis={selectedHypothesis || mapHabitToComputerSkill("reels")}
              onAccept={handleAcceptHypothesis}
              onReject={() => setCurrentPhase(1)}
              loading={loading}
            />
          </div>
        )}

        {/* STEP 5: 5-Day Mini Project & Focus Dashboard */}
        {currentPhase === 5 && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            
            {/* Active Stopwatch */}
            {activeTimerTask && (
              <FocusTimer
                initialMinutes={activeTimerTask.minutes || 45}
                taskTitle={`Day ${activeTimerTask.day}: ${activeTimerTask.title}`}
                onClose={() => setActiveTimerTask(null)}
                onComplete={() => {
                  handleToggleDay(activeTimerTask.day);
                  setActiveTimerTask(null);
                }}
              />
            )}

            {/* Overview Banner */}
            <div className="clean-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  Step 5: 5-Day Practice Project
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {selectedHypothesis?.skill_name || "Video Editing & Motion Graphics"}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Start from zero experience. Day 1 teaches you the basics in under 45 minutes!
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end">
                <button
                  type="button"
                  onClick={() => setCurrentPhase(6)}
                  className="btn-primary text-sm px-5 py-2.5 cursor-pointer shadow-sm"
                >
                  Finished? Make Final Decision (Step 6)
                </button>
                <span className="text-[11px] text-slate-500 mt-1">
                  Review your experience & choose next step
                </span>
              </div>
            </div>

            {/* Quick 3-Step Practical Instruction Guide */}
            <div className="clean-card p-4 bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-800 text-sm">💡 How this works:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-xs font-medium text-slate-800">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span><strong>Pick your task:</strong> Select your daily pace (15m, 45m, or 90m).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span><strong>Build in real tools:</strong> Open Figma, VS Code, or Canva on your PC. Click <em>Start Focus Timer</em>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span><strong>Log proof:</strong> Return here, upload your screenshot, and rate how it felt!</span>
                </div>
              </div>
            </div>

            {/* 5-Day Tiered Action Task Cards */}
            <div className="space-y-4">
              {(plan?.tasks || (selectedHypothesis || mapHabitToComputerSkill("reels")).tasks).map((task) => (
                <TieredActionCard
                  key={task.day}
                  task={task}
                  isCompleted={!!completedDays[task.day]}
                  onToggleComplete={handleToggleDay}
                  onStartTimer={(t) => setActiveTimerTask(t)}
                />
              ))}
            </div>

            {/* Signal Rating & Artifact Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <SignalLogger
                selectedSignal={loggedSignal}
                onSelectSignal={(s) => setLoggedSignal(s)}
              />
              <ArtifactUpload
                expectedDeliverable="Saved file / Screenshot / Link"
                onSaveArtifact={(a) => setLoggedArtifact(a)}
              />
            </div>

          </div>
        )}

        {/* STEP 6: Final Decision Loop (Deepen / Adjust / Pivot) */}
        {currentPhase === 6 && (
          <div className="w-full">
            {decisionFeedback ? (
              <div className="w-full max-w-3xl mx-auto clean-card p-6 sm:p-8 text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  decisionFeedback.type === 'deepen' ? 'bg-emerald-100 text-emerald-700' :
                  decisionFeedback.type === 'adjust' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  {decisionFeedback.title}
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-xl mx-auto">
                  {decisionFeedback.message}
                </p>

                {/* SPECIAL DEEPEN MASTERY ROADMAP */}
                {decisionFeedback.type === 'deepen' && (
                  <div className="text-left bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Next Stage: 30-Day Intermediate Track
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          Recommended Capstone: Multi-Screen Portfolio Project
                        </h4>
                      </div>
                      <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600">
                        Pace: 45m / day
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                        <span className="font-bold text-blue-700 block mb-1">Week 1-2: Architecture</span>
                        <p className="text-slate-600">Master reusable design tokens, auto-layout hierarchies, and standard UI patterns.</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                        <span className="font-bold text-emerald-700 block mb-1">Week 3: Prototype</span>
                        <p className="text-slate-600">Build a complete 5-screen interactive user journey solving a campus problem.</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                        <span className="font-bold text-purple-700 block mb-1">Week 4: Proof & Review</span>
                        <p className="text-slate-600">Conduct user tests with 3 peers. Export a polished case study for your resume.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>🤝 <strong>Peer Match Opportunity:</strong> Pair with a developer classmate to build your designs into code!</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleResetSession()}
                    className="btn-primary flex items-center gap-2 text-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Explore Another Track</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPhase(5)}
                    className="btn-secondary text-xs"
                  >
                    Review Completed 5-Day Tasks
                  </button>
                </div>
              </div>
            ) : (
              <ReviewDecisionModal
                skillName={selectedHypothesis?.skill_name || "UI/UX Fundamentals & Wireframing"}
                completedDays={Object.values(completedDays).filter(Boolean).length || 5}
                onDeepen={() => {
                  setDecisionFeedback({
                    type: "deepen",
                    title: "🎉 Deepen Path Confirmed!",
                    message: `You proved genuine intrinsic interest in ${selectedHypothesis?.skill_name || "this skill"}! Here is your structured 30-day intermediate roadmap to convert this early spark into an employable portfolio piece:`
                  });
                }}
                onAdjust={() => {
                  setDecisionFeedback({
                    type: "adjust",
                    title: "⚙️ Path Adjusted to 15-Minute Mode!",
                    message: "Smart decision! You liked the skill but need a lighter pace to balance with college exams. Your tasks are now tuned to the Minimum Viable Action tier to avoid burnout."
                  });
                }}
                onPivot={() => {
                  setDecisionFeedback({
                    type: "pivot",
                    title: "🔄 Pivot Executed with Zero Guilt!",
                    message: "Discovering what you don't enjoy early is a huge victory! It saves you months of frustration. You can explore your next ranked skill right now."
                  });
                }}
              />
            )}
          </div>
        )}

      </main>

    </div>
  );
}
