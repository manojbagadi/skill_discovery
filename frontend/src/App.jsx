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

  // 1. EXPLICIT UI / FIGMA / WIREFRAME (STRICTLY RESERVED FOR STUDENTS WHO MENTION SCREENS/FIGMA)
  if (lower.includes("figma") || lower.includes("wireframe") || lower.includes("wireframing") || lower.includes("ui design") || lower.includes("ux design") || lower.includes("user interface") || lower.includes("prototype screen")) {
    return {
      skill_id: "vis_01",
      family: "Visual & Product Experience",
      skill_name: "UI/UX Fundamentals & Interactive Wireframing",
      habit_detected: "Designing App Screens, Wireframes & Digital Flow",
      hidden_strength: "Interface Architecture, User Flow Empathy & Usability Sense",
      overall_score: 96,
      interest_score: 98,
      time_score: 95,
      hardware_score: 100,
      explanation: "You specifically enjoy thinking about app screens and visual user flows. Figma wireframing is the global standard for prototyping apps before writing any code!",
      real_life_example: "Swiggy, CRED, and Spotify spend millions designing smooth micro-interactions in Figma so users can complete checkouts in 2 effortless taps without getting confused!",
      tasks: [
        { day: 1, title: "First Screen in Figma", description: "Open free Figma. Wireframe 1 clean mobile screen for an app solving a small student problem you face daily.", minutes: 30, tier: "standard", expected_output: "Figma mobile screen screenshot" },
        { day: 2, title: "UI Building Blocks", description: "Add 2 reusable components: a clean top header and a clickable card with clear text hierarchy.", minutes: 40, tier: "standard", expected_output: "Figma design canvas link" },
        { day: 3, title: "Color Psychology & Fonts", description: "Choose a 2-color palette (primary + soothing background) and readable font scale. Explain why you chose it.", minutes: 45, tier: "standard", expected_output: "Side-by-side color test screen" },
        { day: 4, title: "Interactive Tap Flow", description: "Connect your home screen to a detail screen using Figma clickable prototype arrows.", minutes: 45, tier: "standard", expected_output: "Clickable prototype link" },
        { day: 5, title: "Peer Usability Review", description: "Show your 2-screen flow to a friend. Note what confused them and write a 3-bullet reflection.", minutes: 30, tier: "standard", expected_output: "Peer feedback summary" }
      ]
    };
  }

  // 2. OVERTHINKING / THINKING ABOUT ME / WASTING TIME / DEEP INTROSPECTION
  if (lower.includes("think") || lower.includes("thought") || lower.includes("waste") || lower.includes("wasting") || lower.includes("myself") || lower.includes("alone") || lower.includes("mind") || lower.includes("reflect") || lower.includes("wonder") || lower.includes("overthink") || lower.includes("anxious") || lower.includes("future") || lower.includes("daydream")) {
    return {
      skill_id: "content_01",
      family: "Content & Communication",
      skill_name: "Thought Architecture & Technical Writing",
      habit_detected: "Deep Introspection, Overthinking & Processing Life",
      hidden_strength: "Analytical Reflection, Systematic Structuring & Identifying Blindspots",
      overall_score: 96,
      interest_score: 98,
      time_score: 95,
      hardware_score: 100,
      explanation: "You spend significant mental energy analyzing yourself, human decisions, and life scenarios. When you channel that active mind onto digital pages, you become an exceptional Thought Architect and Technical Writer who turns messy chaos into structured clarity!",
      real_life_example: "Companies like Notion, Stripe, and Google pay Technical Writers and Product Architects ₹15-25 LPA simply to take complex, chaotic thoughts and structure them into clear guides and specs. Your reflective mind is a superpower when you write down your reflections!",
      tasks: [
        { day: 1, title: "Brain Dump & Markdown Second Brain", description: "Open Notion or Obsidian. Write an honest 150-word brain dump of everything on your mind, then organize it into 3 clear headings.", minutes: 30, tier: "standard", expected_output: "Structured Markdown page screenshot" },
        { day: 2, title: "The '5-Whys' Root Cause Diagram", description: "Pick one recurring problem in your college life. Break down the 5 levels of why it happens using a bulleted logic tree.", minutes: 35, tier: "standard", expected_output: "Root cause analysis document" },
        { day: 3, title: "Turn Frustration into a Tech Spec", description: "Take a daily friction point you hate and write a 1-page Product Requirement Document (PRD) proposing a simple digital solution.", minutes: 45, tier: "standard", expected_output: "1-page PRD document" },
        { day: 4, title: "Interactive Decision Matrix", description: "Create a comparison table scoring 3 different career options or project ideas based on Effort vs Impact.", minutes: 40, tier: "standard", expected_output: "Decision matrix table link" },
        { day: 5, title: "Publish Your First Technical Guide", description: "Format your solution into a clean, readable step-by-step guide and share it with 1 peer for feedback.", minutes: 30, tier: "standard", expected_output: "Published guide link or PDF" }
      ]
    };
  }

  // 3. REELS / SHORTS / VIDEOS / SOCIAL MEDIA / YOUTUBE DOOMSCROLLING
  if (lower.includes("reel") || lower.includes("short") || lower.includes("instagram") || lower.includes("insta") || lower.includes("tiktok") || lower.includes("scroll") || lower.includes("scrolling") || lower.includes("video") || lower.includes("youtube") || lower.includes("clip") || lower.includes("meme")) {
    return {
      skill_id: "vis_07",
      family: "Visual & Content Creation",
      skill_name: "Motion Graphics & Short-Form Video Editing",
      habit_detected: "Scrolling Reels & Watching Video Shorts",
      hidden_strength: "Visual Pacing, 3-Second Hook Timing & Sound Sense",
      overall_score: 95,
      interest_score: 96,
      time_score: 92,
      hardware_score: 90,
      explanation: "You already consume hundreds of short-form videos and instinctively know what catches attention in the first 3 seconds and what feels boring. Video editing turns that viewer intuition into timeline cuts!",
      real_life_example: "Top creators like MrBeast, Tanmay Bhat, and Raj Shamani pay their video editors ₹50,000+ per month to turn phone recordings into viral 30-second shorts using CapCut and Premiere. You already have the audience eye—now learn the editing timeline!",
      tasks: [
        { day: 1, title: "CapCut Setup & First Cut", description: "Download CapCut (PC or Mobile). Import 3 random clips from your phone and trim them to 10 seconds total.", minutes: 45, tier: "standard", expected_output: "10-second trimmed video file" },
        { day: 2, title: "Beat Syncing & Music Audio", description: "Add a trending audio track. Split and cut video clips exactly on the drum beats.", minutes: 45, tier: "standard", expected_output: "Exported video cut to the beat" },
        { day: 3, title: "Kinetic Captions & Sound FX", description: "Add animated word-by-word captions and 2 'whoosh' sound effects for punchy pacing.", minutes: 45, tier: "standard", expected_output: "Video with captions & sound fx" },
        { day: 4, title: "Color Filter & Zoom Transitions", description: "Apply a clean aesthetic color filter and add slow zoom-in transitions to key moments.", minutes: 45, tier: "standard", expected_output: "Final 15-second portfolio short" },
        { day: 5, title: "Peer Reaction & Review", description: "Show your 15-second short to 2 friends. Ask if the pacing kept their attention the whole time.", minutes: 45, tier: "standard", expected_output: "Written feedback notes" }
      ]
    };
  }

  // 4. COMPETITIVE GAMING / BGMI / FREE FIRE / VALORANT / GTA / GAMES
  if (lower.includes("game") || lower.includes("gaming") || lower.includes("bgmi") || lower.includes("free fire") || lower.includes("freefire") || lower.includes("valorant") || lower.includes("gta") || lower.includes("pubg") || lower.includes("playstation") || lower.includes("cod") || lower.includes("clutch") || lower.includes("squad") || lower.includes("play")) {
    return {
      skill_id: "prog_04",
      family: "Game Tech & Logic",
      skill_name: "Game Mechanics & Python Scripting",
      habit_detected: "Competitive Gaming & Squad Strategy",
      hidden_strength: "Rule Systems, Collision Logic & Fast Spatial Coordination",
      overall_score: 95,
      interest_score: 96,
      time_score: 90,
      hardware_score: 88,
      explanation: "Gamers make incredible programmers because you intuitively understand game loops, cooldown timers, player health bars, and obstacle physics in your sleep.",
      real_life_example: "Game studios like Supercell (Clash of Clans) or Krafton (BGMI) code player hitboxes, recoil physics, and reward loops using Python & game engines. You are already an expert at playing the rules—now you code them!",
      tasks: [
        { day: 1, title: "Python & Pygame Setup", description: "Install Python and Pygame. Create a game window with a black background and custom title.", minutes: 45, tier: "standard", expected_output: "Working game window screenshot" },
        { day: 2, title: "Player Box & Keyboard Movement", description: "Draw a player character rectangle. Make it move up, down, left, right with arrow keys.", minutes: 45, tier: "standard", expected_output: "Moving player sprite script" },
        { day: 3, title: "Enemy Spawn & Random Motion", description: "Spawn random red obstacle blocks falling from top of screen at variable speeds.", minutes: 45, tier: "standard", expected_output: "Falling obstacles animation" },
        { day: 4, title: "Hitbox Collision & Game Over", description: "Add collision detection: if player touches falling block, trigger 'Game Over' screen.", minutes: 45, tier: "standard", expected_output: "Playable dodge mini-game" },
        { day: 5, title: "High Score Tracker & Playtest", description: "Track score based on survival seconds. Have a friend play and try to beat your record!", minutes: 45, tier: "standard", expected_output: "Playable dodge mini-game link" }
      ]
    };
  }

  // 5. CRICKET / SPORTS / STATS / IPL / NUMBERS / STOCKS / EXCEL
  if (lower.includes("cricket") || lower.includes("ipl") || lower.includes("csk") || lower.includes("rcb") || lower.includes("dream11") || lower.includes("score") || lower.includes("scores") || lower.includes("stats") || lower.includes("sport") || lower.includes("football") || lower.includes("stock") || lower.includes("stocks") || lower.includes("market") || lower.includes("trading") || lower.includes("crypto") || lower.includes("excel") || lower.includes("math") || lower.includes("number")) {
    return {
      skill_id: "ai_01",
      family: "Data & Analytics",
      skill_name: "Sports & Business Data Analytics (Python/Pandas)",
      habit_detected: "Tracking Cricket Scores, Numbers, IPL Stats & Market Graphs",
      hidden_strength: "Pattern Recognition, Metric Comparison & Quantitative Thinking",
      overall_score: 94,
      interest_score: 95,
      time_score: 90,
      hardware_score: 95,
      explanation: "If you love checking strike rates, bowling averages, points tables, or market graphs, you already think like a Data Analyst!",
      real_life_example: "IPL teams like CSK and Mumbai Indians hire data analysts to calculate bowler economy rates and winning odds under pressure. You can use Python and Pandas to turn raw match scorecards into interactive visual charts!",
      tasks: [
        { day: 1, title: "Download IPL / Player Dataset", description: "Download a free Kaggle IPL dataset. Open in Google Sheets or Python Pandas.", minutes: 45, tier: "standard", expected_output: "Cleaned spreadsheet file" },
        { day: 2, title: "Top Batsmen Average Formulas", description: "Use average formulas and sorting to calculate the top 5 highest-scoring players.", minutes: 45, tier: "standard", expected_output: "Top 5 player ranking sheet" },
        { day: 3, title: "Strike Rate vs Average Bar Chart", description: "Build an interactive bar chart comparing strike rates of top finishers.", minutes: 45, tier: "standard", expected_output: "Chart image export" },
        { day: 4, title: "Win Percentage Dashboard", description: "Create an interactive dashboard comparing toss winners vs match winners.", minutes: 45, tier: "standard", expected_output: "Interactive dashboard sheet" },
        { day: 5, title: "Match Prediction Summary Slide", description: "Write a 3-bullet match prediction using the real data you analyzed.", minutes: 45, tier: "standard", expected_output: "1-slide match insight summary" }
      ]
    };
  }

  // 6. LOW ENERGY / PROCRASTINATION / "I AM LAZY / DO NOTHING / SLEEP / IN BED"
  if (lower.includes("lazy") || lower.includes("do nothing") || lower.includes("doing nothing") || lower.includes("sleep") || lower.includes("sleeping") || lower.includes("bed") || lower.includes("lie down") || lower.includes("lying in bed") || lower.includes("bored") || lower.includes("boredom") || lower.includes("procrastinat") || lower.includes("nothing")) {
    return {
      skill_id: "content_01",
      family: "Productivity & Systems",
      skill_name: "Digital Second Brain & Notion Micro-Systems",
      habit_detected: "Low Energy State, Procrastination & Resting in Bed",
      hidden_strength: "Need for Ultra-Low Activation Energy & Clean Simplicity",
      overall_score: 95,
      interest_score: 96,
      time_score: 98,
      hardware_score: 100,
      explanation: "When you feel lazy or unmotivated, heavy coding courses cause burnout. The secret is a 15-minute 'Second Brain'—a simple digital workspace that organizes your life with almost zero effort!",
      real_life_example: "Top authors and tech founders build a 'Second Brain' in Notion to capture thoughts without feeling tired. You don't need motivation: just 15 minutes to set up one clean dashboard!",
      tasks: [
        { day: 1, title: "15-Minute Notion Dashboard", description: "Open free Notion. Create 1 clean page with a dark banner and 3 daily focus links.", minutes: 20, tier: "standard", expected_output: "Clean Notion dashboard screenshot" },
        { day: 2, title: "1-Click Useful Bookmarks Board", description: "Add a 4-card gallery saving your top 3 favorite YouTube learning channels or websites.", minutes: 25, tier: "standard", expected_output: "Bookmarks gallery link" },
        { day: 3, title: "Daily Habit Micro-Checklist", description: "Add a 3-item daily checkbox (Water, 15m Walk, 1 Lesson) with automatic reset buttons.", minutes: 25, tier: "standard", expected_output: "Working habit tracker" },
        { day: 4, title: "Quick Thoughts Inbox", description: "Create a simple inbox database to jot down ideas in 5 seconds from your phone.", minutes: 20, tier: "standard", expected_output: "Mobile thoughts inbox view" },
        { day: 5, title: "5-Minute Sunday Reset Routine", description: "Write down a 3-step checklist to organize your upcoming week in under 5 minutes.", minutes: 20, tier: "standard", expected_output: "Weekly reset card" }
      ]
    };
  }

  // 7. BINGE WATCHING / ANIME / NETFLIX / MOVIES / STORIES / MANGA
  if (lower.includes("anime") || lower.includes("netflix") || lower.includes("movie") || lower.includes("movies") || lower.includes("series") || lower.includes("kdrama") || lower.includes("k-drama") || lower.includes("manga") || lower.includes("naruto") || lower.includes("story") || lower.includes("stories") || lower.includes("binge") || lower.includes("cinema")) {
    return {
      skill_id: "content_02",
      family: "Content & Communication",
      skill_name: "Digital Storytelling & Screenplay Writing",
      habit_detected: "Binge-Watching Anime, Netflix Series & World-Building",
      hidden_strength: "Narrative Pacing, Character Dialogue & Dramatic Tension",
      overall_score: 93,
      interest_score: 95,
      time_score: 90,
      hardware_score: 98,
      explanation: "Consuming anime and film series builds narrative intuition. Learning digital screenplay formatting allows you to write scripts for games, webtoons, media companies, or YouTube creators!",
      real_life_example: "Netflix, Webtoon studios, and RPG game companies hire Narrative Designers to format 3-act storyboards and write branching dialogue. You can turn your viewing intuition into formatted scripts using WriterDuet!",
      tasks: [
        { day: 1, title: "Logline & 3-Act Outline", description: "Pick your favorite anime concept. Write a 1-sentence logline and a 3-act beginning, middle, and end.", minutes: 45, tier: "standard", expected_output: "1-page story outline" },
        { day: 2, title: "Character Profile & Conflict", description: "Design a protagonist with 1 strength, 1 fatal flaw, and a clear goal.", minutes: 45, tier: "standard", expected_output: "Character sheet document" },
        { day: 3, title: "Opening Scene Screenplay", description: "Use free tool WriterDuet. Format 2 pages of screenplay with sluglines and dialogue.", minutes: 45, tier: "standard", expected_output: "2-page formatted script PDF" },
        { day: 4, title: "Visual Storyboard Slides", description: "Create a 6-panel storyboard using Canva or hand drawings showing camera angles.", minutes: 45, tier: "standard", expected_output: "6-panel storyboard slide" },
        { day: 5, title: "Pitch Presentation & Feedback", description: "Read your 2-page scene aloud to a peer. Ask if the twist was surprising.", minutes: 45, tier: "standard", expected_output: "Written peer critique notes" }
      ]
    };
  }

  // 8. AUTOMATION / SHORTCUTS / SCRIPTS / BOTS / BACKEND LOGIC
  if (lower.includes("automate") || lower.includes("automation") || lower.includes("shortcut") || lower.includes("shortcuts") || lower.includes("script") || lower.includes("bot") || lower.includes("crawler") || lower.includes("scraping") || lower.includes("copy paste") || lower.includes("backend") || lower.includes("api") || lower.includes("python") || lower.includes("code") || lower.includes("coding")) {
    return {
      skill_id: "back_01",
      family: "Backend & Systems",
      skill_name: "Python Automation & REST API Engineering",
      habit_detected: "Curiosity for Shortcuts, Scripts & Software Automation",
      hidden_strength: "Algorithmic Thinking, Elimination of Manual Friction & Efficiency",
      overall_score: 95,
      interest_score: 96,
      time_score: 92,
      hardware_score: 95,
      explanation: "You hate repetitive tasks and love finding smart shortcuts. A few lines of Python code can automate hours of manual boring work in seconds!",
      real_life_example: "Instead of manually downloading 50 exam papers or sending individual emails, a 20-line Python script can automate it in 3 seconds. That is the exact automation tech startups pay backend engineers for!",
      tasks: [
        { day: 1, title: "Python Environment & Script", description: "Set up Python and write a script that takes user input and performs automated calculations.", minutes: 45, tier: "standard", expected_output: "Working python script file" },
        { day: 2, title: "File Automation Script", description: "Write a script that automatically organizes files in your Downloads folder into subfolders by type.", minutes: 45, tier: "standard", expected_output: "File sorter script screenshot" },
        { day: 3, title: "Web API Fetcher", description: "Connect to a free public weather or jokes API using requests. Print live data to terminal.", minutes: 45, tier: "standard", expected_output: "Working API client code" },
        { day: 4, title: "Build a Micro FastAPI Server", description: "Create your first local web server with 2 endpoints using FastAPI.", minutes: 45, tier: "standard", expected_output: "FastAPI Swagger docs screenshot" },
        { day: 5, title: "Automated Bot Demo", description: "Deploy or run your automated tool and demonstrate it completing a task in under 5 seconds.", minutes: 45, tier: "standard", expected_output: "Terminal run output screenshot" }
      ]
    };
  }

  // 9. HARDWARE / ROBOTS / ARDUINO / IOT / GADGETS / CIRCUITS / WIRES
  if (lower.includes("robot") || lower.includes("circuit") || lower.includes("circuits") || lower.includes("arduino") || lower.includes("iot") || lower.includes("hardware") || lower.includes("sensor") || lower.includes("sensors") || lower.includes("electronics") || lower.includes("remote") || lower.includes("wire") || lower.includes("wiring") || lower.includes("dismantle") || lower.includes("gadget") || lower.includes("gadgets") || lower.includes("drone")) {
    return {
      skill_id: "hw_01",
      family: "Hardware & IoT",
      skill_name: "Arduino & Embedded IoT Programming",
      habit_detected: "Tinkering with Gadgets, Electronics & Physical Hardware",
      hidden_strength: "Hands-on Spatial Engineering, Sensor Logic & Physical Computing",
      overall_score: 93,
      interest_score: 95,
      time_score: 88,
      hardware_score: 85,
      explanation: "You are curious about how physical gadgets, smart appliances, or robots work in the real world. You can program hardware sensors to react to physical surroundings!",
      real_life_example: "Automatic toll gates (Fastag) and smart home lights use simple Arduino sensors and C/Python code. You can wire up virtual breadboards in Tinkercad and program LED responses with code!",
      tasks: [
        { day: 1, title: "Arduino Simulator Setup (Tinkercad)", description: "Open free Tinkercad Circuits in browser. Wire a virtual Arduino Uno with an LED and resistor.", minutes: 45, tier: "standard", expected_output: "Tinkercad circuit screenshot" },
        { day: 2, title: "Blink Code & Timing Delays", description: "Write C++ code to make the LED blink every 1 second using digitalWrite and delay.", minutes: 45, tier: "standard", expected_output: "Working blinking simulation" },
        { day: 3, title: "Ultrasonic Distance Sensor", description: "Connect an ultrasonic distance sensor to measure distance to a virtual obstacle.", minutes: 45, tier: "standard", expected_output: "Serial monitor distance readings" },
        { day: 4, title: "Smart Buzzer Warning Alarm", description: "Program the buzzer to beep when an object gets closer than 20cm (like a car reverse sensor).", minutes: 45, tier: "standard", expected_output: "Working obstacle alert circuit" },
        { day: 5, title: "Smart Gate / Sensor Demo", description: "Combine sensor and LED/buzzer into a mini smart gate project. Share project simulation link.", minutes: 45, tier: "standard", expected_output: "Tinkercad project share link" }
      ]
    };
  }

  // 10. PHOTOGRAPHY / DOODLING / CANVA / LIGHTROOM / AESTHETICS
  if (lower.includes("photo") || lower.includes("photos") || lower.includes("photography") || lower.includes("lightroom") || lower.includes("vsco") || lower.includes("filter") || lower.includes("camera") || lower.includes("doodle") || lower.includes("sketch") || lower.includes("art") || lower.includes("paint") || lower.includes("drawing") || lower.includes("poster") || lower.includes("canva") || lower.includes("aesthetic")) {
    return {
      skill_id: "vis_02",
      family: "Visual & UI Design",
      skill_name: "Graphic Design & Brand Visual Systems (Canva/Figma)",
      habit_detected: "Taking Aesthetic Photos, Doodling & Visual Curation",
      hidden_strength: "Color Harmony, Composition & Eye for Aesthetics",
      overall_score: 94,
      interest_score: 96,
      time_score: 92,
      hardware_score: 100,
      explanation: "Having an eye for good photos, filters, and layouts is the exact skill businesses pay designers for to create brand logos, banners, and social ads!",
      real_life_example: "When you see a stunning poster for a college fest or a sleek coffee brand logo, a graphic designer combined color palettes and typography. You can design complete social branding kits using Figma and Canva!",
      tasks: [
        { day: 1, title: "Design a Modern Cafe Logo", description: "Pick a fictional coffee shop. Create a minimalist logo using basic geometric shapes in Canva or Figma.", minutes: 45, tier: "standard", expected_output: "Exported logo file" },
        { day: 2, title: "Brand Color Palette & Fonts", description: "Choose 2 complementary colors and 2 Google fonts that match the cafe's vibe.", minutes: 45, tier: "standard", expected_output: "Brand style board" },
        { day: 3, title: "Instagram Promo Story Banner", description: "Create an eye-catching 1080x1920 Instagram story announcing a weekend discount.", minutes: 45, tier: "standard", expected_output: "Finished story banner" },
        { day: 4, title: "Packaging & Cup Mockup", description: "Place your logo onto a realistic paper coffee cup mockup to visualize the real product.", minutes: 45, tier: "standard", expected_output: "Cup mockup graphic" },
        { day: 5, title: "Portfolio Presentation Card", description: "Combine logo, story banner, and cup mockup into one clean Behance/portfolio slide.", minutes: 45, tier: "standard", expected_output: "1-slide brand portfolio" }
      ]
    };
  }

  // 11. CYBERSECURITY / HACKING / LINUX / NETWORKS
  if (lower.includes("hack") || lower.includes("hacking") || lower.includes("cyber") || lower.includes("cybersecurity") || lower.includes("security") || lower.includes("kali") || lower.includes("linux") || lower.includes("terminal") || lower.includes("firewall") || lower.includes("packet")) {
    return {
      skill_id: "back_05",
      family: "Backend & Systems",
      skill_name: "Cybersecurity & Network Diagnostics",
      habit_detected: "Curiosity for Security, Hacking, Networks & System Bounds",
      hidden_strength: "Boundary Testing, Protocol Analysis & System Inquisitiveness",
      overall_score: 93,
      interest_score: 95,
      time_score: 89,
      hardware_score: 90,
      explanation: "You are fascinated by how security systems work and how digital boundaries can be defended. Cybersecurity is one of the highest-demand tech fields in the world!",
      real_life_example: "Fintech apps like PhonePe and Google Pay hire security analysts to trace network packets and find vulnerabilities before bad actors can exploit them!",
      tasks: [
        { day: 1, title: "Network Diagnostics & Terminal", description: "Open terminal. Run ping, traceroute, and nslookup to trace packets traveling to google.com.", minutes: 40, tier: "standard", expected_output: "Terminal trace screenshot" },
        { day: 2, title: "Wireshark Packet Inspection", description: "Open free Wireshark. Capture 10 seconds of browser traffic and inspect HTTP request headers.", minutes: 45, tier: "standard", expected_output: "Wireshark packet capture file" },
        { day: 3, title: "Password Hashing & Salt Simulation", description: "Write 10 lines of Python using hashlib to demonstrate SHA-256 password hashing vs plain text.", minutes: 45, tier: "standard", expected_output: "Working hashing script output" },
        { day: 4, title: "Port Scanning & Firewall Audit", description: "Run a safe local Nmap port scan on localhost (127.0.0.1) to discover open listening ports.", minutes: 45, tier: "standard", expected_output: "Local port audit log" },
        { day: 5, title: "Security Vulnerability Report", description: "Write a 1-page report outlining the top 3 OWASP web vulnerabilities and how engineers fix them.", minutes: 35, tier: "standard", expected_output: "1-page security report PDF" }
      ]
    };
  }

  // 12. CHATTING / WHATSAPP / CALLS / COMMUNITY / EVENTS
  if (lower.includes("chat") || lower.includes("chatting") || lower.includes("talk") || lower.includes("talking") || lower.includes("friends") || lower.includes("call") || lower.includes("calls") || lower.includes("whatsapp") || lower.includes("organize") || lower.includes("organizing") || lower.includes("event") || lower.includes("club") || lower.includes("speaking")) {
    return {
      skill_id: "content_05",
      family: "Content & Communication",
      skill_name: "Tech Community Management & Presentation Design",
      habit_detected: "Conversing with Friends, Group Chatting & Organizing Events",
      hidden_strength: "High Interpersonal Empathy, Charismatic Communication & Coordination",
      overall_score: 92,
      interest_score: 94,
      time_score: 90,
      hardware_score: 100,
      explanation: "You naturally connect with people, spark discussions, and coordinate groups. In tech, Developer Advocates and Community Managers are paid to host events, engage users, and present ideas!",
      real_life_example: "Tech companies like GitHub, Google, and Discord pay Developer Advocates and Community Leads to host hackathons, moderate discussions, and deliver charismatic keynote slides!",
      tasks: [
        { day: 1, title: "Canva Keynote Presentation Deck", description: "Pick an exciting tech topic (like AI or gaming). Design a 5-slide visual presentation deck in Canva.", minutes: 40, tier: "standard", expected_output: "5-slide Canva presentation" },
        { day: 2, title: "Community Guidelines & Welcome Message", description: "Draft a welcoming 3-paragraph onboarding post for a campus tech discord or WhatsApp group.", minutes: 35, tier: "standard", expected_output: "Welcome message document" },
        { day: 3, title: "Interactive Kahoot / Quiz Setup", description: "Build a 5-question interactive quiz on Kahoot or Google Forms to engage a room of 20 students.", minutes: 40, tier: "standard", expected_output: "Playable quiz link" },
        { day: 4, title: "Mini Hackathon Announcement Flyer", description: "Design a compelling promotional flyer with event dates, prizes, and registration rules.", minutes: 45, tier: "standard", expected_output: "Exported event flyer image" },
        { day: 5, title: "3-Minute Pitch to a Peer", description: "Present your 5-slide deck to a friend on video or in person. Record a 30-second reflection on their engagement.", minutes: 30, tier: "standard", expected_output: "Peer feedback & reflection notes" }
      ]
    };
  }

  // 13. WEBSITES / WEB / HTML / CSS / FRONTEND / BROWSING
  if (lower.includes("web") || lower.includes("website") || lower.includes("websites") || lower.includes("html") || lower.includes("css") || lower.includes("frontend") || lower.includes("browser")) {
    return {
      skill_id: "front_01",
      family: "Frontend & Web Tech",
      skill_name: "Frontend Web Development (HTML, CSS & JavaScript)",
      habit_detected: "Browsing Websites & Exploring Digital Layouts",
      hidden_strength: "Visual Structure, Interactive Design & Creative Assembly",
      overall_score: 94,
      interest_score: 95,
      time_score: 90,
      hardware_score: 100,
      explanation: "You use websites every day and appreciate clean layouts. Learning HTML and CSS lets you build pages anyone in the world can visit!",
      real_life_example: "Every college club, local business, or hackathon team needs a live landing page that works on phones and laptops. You can turn visual design ideas into real live clickable websites using HTML & CSS!",
      tasks: [
        { day: 1, title: "Your Very First HTML Webpage", description: "Open text editor. Write basic HTML tags (<h1>, <p>, <button>) introducing yourself.", minutes: 45, tier: "standard", expected_output: "Working index.html file" },
        { day: 2, title: "CSS Colors & Modern Styling", description: "Add CSS to style your page: dark background, rounded card, and a blue button.", minutes: 45, tier: "standard", expected_output: "Styled web page screenshot" },
        { day: 3, title: "Make It Mobile-Friendly", description: "Add responsive viewport settings so your page looks great on phones and laptops.", minutes: 45, tier: "standard", expected_output: "Mobile preview screenshot" },
        { day: 4, title: "Add an Interactive Button", description: "Write 3 lines of JavaScript to change the background color when a button is clicked.", minutes: 45, tier: "standard", expected_output: "Interactive click page" },
        { day: 5, title: "Publish Live Online for Free", description: "Deploy your webpage for free on Netlify or Vercel and send the live link to a friend!", minutes: 45, tier: "standard", expected_output: "Live website URL" }
      ]
    };
  }

  // DEFAULT FALLBACK: Frontend Web Development (The most accessible universal foundation)
  return {
    skill_id: "front_01",
    family: "Frontend & Web Tech",
    skill_name: "Frontend Web Development (HTML, CSS & JS)",
    habit_detected: "Exploring Digital Apps, Websites & Everyday Tech",
    hidden_strength: "Curiosity for How Things Work & Interactive Creation",
    overall_score: 90,
    interest_score: 91,
    time_score: 89,
    hardware_score: 100,
    explanation: "You use digital apps and the web every single day. Learning HTML, CSS, and basic JavaScript is the #1 universal, zero-friction launchpad that lets you build things anyone online can interact with!",
    real_life_example: "Every company, college fest, or hackathon team needs a live landing page that works on phones and laptops. You can turn visual ideas into real live clickable websites using HTML & CSS!",
    tasks: [
      { day: 1, title: "Your Very First HTML Webpage", description: "Open text editor. Write basic HTML tags (<h1>, <p>, <button>) introducing yourself.", minutes: 45, tier: "standard", expected_output: "Working index.html file" },
      { day: 2, title: "CSS Colors & Modern Styling", description: "Add CSS to style your page: dark background, rounded card, and a blue button.", minutes: 45, tier: "standard", expected_output: "Styled web page screenshot" },
      { day: 3, title: "Make It Mobile-Friendly", description: "Add responsive viewport settings so your page looks great on phones and laptops.", minutes: 45, tier: "standard", expected_output: "Mobile preview screenshot" },
      { day: 4, title: "Add an Interactive Button", description: "Write 3 lines of JavaScript to change the background color when a button is clicked.", minutes: 45, tier: "standard", expected_output: "Interactive click page" },
      { day: 5, title: "Publish Live Online for Free", description: "Deploy your webpage for free on Netlify or Vercel and send the live link to a friend!", minutes: 45, tier: "standard", expected_output: "Live website URL" }
    ]
  };
}

const REAL_LIFE_EXAMPLES = {
  vis_01: "Think about Swiggy, Uber, or Spotify: every smooth 2-tap ordering flow was created by a UI/UX designer analyzing human behavior in Figma!",
  vis_02: "Top brands like Airbnb and Apple use design systems so all buttons, colors, and typography look consistent across every screen.",
  vis_03: "Minimalist poster designers and Apple landing pages rely on typography hierarchy to draw your eye to the headline first.",
  vis_04: "Figma auto-layout allows buttons to automatically resize when text changes, saving thousands of hours for web and mobile design teams.",
  vis_05: "CRED's delightful button vibrations and Instagram heart bursts are micro-interactions designed to make apps feel magical and alive.",
  vis_06: "Pixar, PlayStation games, and Nike 3D product previews use Blender and Three.js to render lifelike 3D models directly in the web browser.",
  vis_07: "Top creators like MrBeast or Indian finance YouTubers turn raw footage into viral 30-second shorts using CapCut and Premiere. You already have the audience eye—now you learn the editing tools!",
  prog_04: "Game studios like Supercell (Clash of Clans) or indie creators code player physics, collision boxes, and cooldown loops using Python & Pygame!",
  front_01: "Every college fest, local business, or hackathon team needs a live landing page that works on phones and laptops. You can build responsive websites using HTML & CSS!",
  front_02: "Interactive browser apps like Wordle and Google Maps use JavaScript DOM manipulation to handle real-time button clicks and instant map movements without page refreshes.",
  front_03: "Instagram and Netflix web apps are built with React component architecture so content updates instantly without refreshing the page.",
  front_05: "Indie game creators and generative artists build interactive canvas games and visual effects using JavaScript and p5.js!",
  back_01: "Instead of manually downloading 50 exam papers or sending individual emails, a 20-line Python script can automate it in 3 seconds. That is the exact automation tech startups hire engineers for!",
  back_02: "Swiggy and Amazon query relational SQL databases in milliseconds to fetch your order history, delivery driver details, and current menu prices.",
  back_05: "Fintech giants like PhonePe and Google Pay hire security analysts to trace network packets and find vulnerabilities before bad actors can exploit them!",
  ai_01: "IPL teams like CSK and Mumbai Indians hire data analysts to calculate bowler economy rates and match probabilities. You can build your own live cricket data charts using Python!",
  ai_02: "Netflix recommendation carousels and Spotify Discover Weekly use machine learning algorithms to predict what you will enjoy next.",
  content_01: "Companies like Notion, Stripe, and Google pay Technical Writers and Product Architects ₹15-25 LPA simply to take complex, chaotic thoughts and structure them into clear guides and specs. Your reflective mind is a superpower when you write down your reflections!",
  content_02: "Anime studios, webtoon creators, and game writers format scenes using 3-act storyboards and screenplays. You can turn your viewing intuition into formatted scripts using WriterDuet!",
  content_05: "Startup founders and TEDx speakers use presentation design principles to pitch million-dollar ideas with clean visual slides.",
  hw_01: "Automatic toll gates (Fastag) and smart home lights use simple Arduino sensors and C/Python code. You can wire up your first breadboard circuit and light up LEDs with code!",
  hw_02: "Smart agriculture systems and hospital temperature monitors use IoT sensor networks to send alerts directly to mobile apps."
};

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT);
  const [loading, setLoading] = useState(false);
  const [evidenceVector, setEvidenceVector] = useState(null);

  const [selectedHypothesis, setSelectedHypothesis] = useState(null);
  const [rankedHypotheses, setRankedHypotheses] = useState([]);
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
    setRankedHypotheses([]);
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

    // Compute smart habit match immediately from authentic student psychology
    const allText = updatedChat.filter(m => m.role === 'user').map(m => m.text).join(" ");
    const matched = mapHabitToComputerSkill(allText);

    try {
      const userAnswers = updatedChat
        .filter((m) => m.role === 'user')
        .map((m) => m.text);

      const res = await parseEvidence(userAnswers);
      if (res && res.data) {
        setEvidenceVector(res.data);
      }
    } catch (err) {
      console.warn("Using local habit matcher fallback:", err.message);
    } finally {
      setSelectedHypothesis(matched);
      setEvidenceVector({
        institution_id: 1,
        interest_tags: [matched.skill_id, ...(matched.tags || [])],
        procrastination_anchors: [matched.habit_detected],
        perceived_strengths: [matched.hidden_strength],
        daily_available_minutes: 45,
        hardware_level: "low_spec_pc",
        detected_mapping: matched
      });
      setPlan({
        hypothesis_id: matched.skill_id,
        template_version: 1,
        tasks: matched.tasks
      });
      setLoading(false);
      // ALWAYS GO TO STEP 2 (Creation Style) so Step 2 is NEVER skipped!
      setCurrentPhase(2);
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

    // Gather real tags to score against
    let tagsToScore = [];
    if (evidenceVector?.interest_tags && evidenceVector.interest_tags.length > 0) {
      tagsToScore.push(...evidenceVector.interest_tags);
    }
    if (matched?.skill_id) {
      tagsToScore.push(matched.skill_id);
    }
    if (allUserText) {
      const words = allUserText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      tagsToScore.push(...words);
    }

    try {
      const scored = await scoreHypotheses({
        institution_id: 1,
        interest_tags: Array.from(new Set(tagsToScore)),
        procrastination_anchors: [matched.habit_detected || "exploring"],
        perceived_strengths: [matched.hidden_strength || "problem solving"],
        daily_available_minutes: capacityData.daily_available_minutes,
        hardware_level: capacityData.hardware_level
      });

      if (scored && scored.length > 0) {
        // Ensure the directly matched habit skill is the primary choice at rank 1
        let listToEnrich = [...scored];
        const matchIdx = listToEnrich.findIndex(s => s.skill_id === matched.skill_id);
        
        if (matchIdx > 0) {
          const [topMatch] = listToEnrich.splice(matchIdx, 1);
          listToEnrich.unshift(topMatch);
        } else if (matchIdx === -1 && matched) {
          listToEnrich.unshift({
            institution_id: 1,
            skill_id: matched.skill_id,
            skill_name: matched.skill_name,
            overall_score: matched.overall_score || 95,
            interest_score: matched.interest_score || 96,
            time_score: matched.time_score || 92,
            hardware_score: matched.hardware_score || 95,
            explanation: matched.explanation
          });
        }

        // Enrich top 3 scored skills with real-life examples, habit bridges and tasks
        const enriched = listToEnrich.slice(0, 3).map((s, idx) => {
          const isDirectMatch = s.skill_id === matched.skill_id;
          return {
            ...s,
            habit_detected: matched.habit_detected,
            hidden_strength: matched.hidden_strength,
            explanation: isDirectMatch ? matched.explanation : s.explanation,
            real_life_example: REAL_LIFE_EXAMPLES[s.skill_id] || matched.real_life_example,
            tasks: isDirectMatch ? matched.tasks : (matched.tasks || null),
            daily_available_minutes: capacityData.daily_available_minutes,
            hardware_level: capacityData.hardware_level
          };
        });

        setRankedHypotheses(enriched);
        setSelectedHypothesis(enriched[0]);
        setPlan({
          hypothesis_id: enriched[0].skill_id,
          template_version: 1,
          tasks: enriched[0].tasks || matched.tasks
        });
      } else {
        throw new Error("Fallback required");
      }
    } catch (err) {
      const fallbackItem = {
        ...matched,
        daily_available_minutes: capacityData.daily_available_minutes,
        hardware_level: capacityData.hardware_level,
        real_life_example: REAL_LIFE_EXAMPLES[matched.skill_id] || matched.real_life_example,
        fallback_tasks: matched.tasks
      };
      setRankedHypotheses([fallbackItem]);
      setSelectedHypothesis(fallbackItem);
      setPlan({
        hypothesis_id: matched.skill_id,
        template_version: 1,
        tasks: matched.tasks
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
              <span>Step 2 of 6: Match Confirmation</span>
            </div>

            {/* 1. Detected Habit Match Callout with Real-Life Example */}
            {selectedHypothesis && (
              <div className="p-5 mb-6 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-2 border-blue-300 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="max-w-2xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-0.5">
                    🎯 Recommended For Your Daily Habit:
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {selectedHypothesis.skill_name}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {selectedHypothesis.explanation}
                  </p>
                  {selectedHypothesis.real_life_example && (
                    <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-indigo-200 text-xs text-indigo-900">
                      <strong>🌟 Real-Life Example:</strong> {selectedHypothesis.real_life_example}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPhase(3)}
                  className="btn-primary text-xs px-5 py-3 shrink-0 flex items-center gap-2 shadow-sm font-bold"
                >
                  <span>Select This Skill &rarr;</span>
                </button>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
              Or Explore A Different Creation Style:
            </h2>
            <p className="text-slate-600 text-xs max-w-xl mx-auto mb-6">
              Tap any card below if you want to switch your 5-day project focus to a different tech path.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
              
              {/* Option 1: Video Editing */}
              <button
                type="button"
                onClick={() => handleSelectStyle("reels video editing capcut")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 font-bold text-sm">🎬</div>
                  <h3 className="text-sm font-bold text-slate-900">Video & Motion</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">CapCut, Premiere, short-form pacing & sound.</p>
                </div>
                <span className="text-[10px] text-blue-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 2: Game Python */}
              <button
                type="button"
                onClick={() => handleSelectStyle("gaming coding python games")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 font-bold text-sm">🎮</div>
                  <h3 className="text-sm font-bold text-slate-900">Games & Logic</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pygame mini-games, collision loops & rules.</p>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 3: Thought Architecture (For Overthinkers / Reflective Minds) */}
              <button
                type="button"
                onClick={() => handleSelectStyle("think overthink writing documentation")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 font-bold text-sm">🧠</div>
                  <h3 className="text-sm font-bold text-slate-900">Thought Architecture</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Notion second brain, specs & technical writing.</p>
                </div>
                <span className="text-[10px] text-amber-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 4: UI/UX & Wireframing (Figma) */}
              <button
                type="button"
                onClick={() => handleSelectStyle("figma wireframe ui design mockup")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 font-bold text-sm">🎨</div>
                  <h3 className="text-sm font-bold text-slate-900">UI/UX & Wireframing</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Figma app screens, clickable mobile prototypes.</p>
                </div>
                <span className="text-[10px] text-purple-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 5: Web Frontend */}
              <button
                type="button"
                onClick={() => handleSelectStyle("web website html css frontend")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-sm">🌐</div>
                  <h3 className="text-sm font-bold text-slate-900">Web Development</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">HTML, CSS flexbox, responsive live websites.</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 6: Data & Analytics */}
              <button
                type="button"
                onClick={() => handleSelectStyle("sports cricket analytics stats excel")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2 font-bold text-sm">📊</div>
                  <h3 className="text-sm font-bold text-slate-900">Data & Sports Analytics</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Cricket stats, match dashboards, Python Pandas.</p>
                </div>
                <span className="text-[10px] text-cyan-600 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 7: Automation & Python APIs */}
              <button
                type="button"
                onClick={() => handleSelectStyle("automate script python backend api")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center mb-2 font-bold text-sm">⚡</div>
                  <h3 className="text-sm font-bold text-slate-900">Automation & APIs</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automate manual work with Python scripts & APIs.</p>
                </div>
                <span className="text-[10px] text-yellow-700 font-bold mt-3 block">Choose &rarr;</span>
              </button>

              {/* Option 8: IoT & Hardware */}
              <button
                type="button"
                onClick={() => handleSelectStyle("robot hardware arduino circuit")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 bg-white transition-all cursor-pointer text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 font-bold text-sm">🤖</div>
                  <h3 className="text-sm font-bold text-slate-900">IoT & Smart Hardware</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Arduino sensors, automated gates, breadboards.</p>
                </div>
                <span className="text-[10px] text-rose-600 font-bold mt-3 block">Choose &rarr;</span>
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
          <div className="w-full space-y-4">
            {/* Top 3 Alternative Evaluated Skills Bar */}
            {rankedHypotheses && rankedHypotheses.length > 1 && (
              <div className="w-full max-w-4xl mx-auto clean-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">
                    Top {rankedHypotheses.length} Evaluated Matches For You:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {rankedHypotheses.map((hypo, idx) => {
                    const isSelected = selectedHypothesis?.skill_id === hypo.skill_id;
                    return (
                      <button
                        key={hypo.skill_id || idx}
                        type="button"
                        onClick={() => {
                          setSelectedHypothesis(hypo);
                          setPlan({
                            hypothesis_id: hypo.skill_id,
                            template_version: 1,
                            tasks: hypo.tasks || hypo.fallback_tasks
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="opacity-80">#{idx + 1}</span>
                        <span>{hypo.skill_name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {Math.round(hypo.overall_score || 90)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <HypothesisScoreCard
              hypothesis={selectedHypothesis || (rankedHypotheses[0] || mapHabitToComputerSkill("reels"))}
              onAccept={handleAcceptHypothesis}
              onReject={() => setCurrentPhase(2)}
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
