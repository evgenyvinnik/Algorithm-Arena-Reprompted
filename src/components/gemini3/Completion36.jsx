import React, { useState, useEffect } from "react";
import { Check, Copy, GripVertical, Video, Download, RotateCcw, Twitter, AlignLeft, Github, Trophy, Youtube, Loader2, Send } from "lucide-react";

/**
 * Challenge Running - Admin Dashboard
 * 
 * "For this challenge, you need to implement a program that helps me publish results for a challenge... 
 * the manual pain of doing all the steps made me lose motivation."
 * 
 * This component acts as the "Mission Control" for the challenge runner.
 */

const Completion36 = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("manage"); // manage, twitter, threads, social
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock initial data simulating raw submissions from GitHub Issues
  const initialSubmissions = [
    {
      id: "sub-1",
      author: "coding_wizz",
      handle: "@coding_wizz",
      repo: "https://github.com/coding_wizz/weekly-challenge-36",
      videoUrl: "video_demo_1.mp4",
      rawTitle: "Submission - Ultimate Runner",
      blurb: "",
      boldSummary: "",
      socialBlurb: "",
      prize: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=coding_wizz"
    },
    {
      id: "sub-2",
      author: "algo_master",
      handle: "@algomaster_dev",
      repo: "https://github.com/algo/challenge-solution",
      videoUrl: "demo_final.mov",
      rawTitle: "My Solution: Fast & Furious",
      blurb: "",
      boldSummary: "",
      socialBlurb: "",
      prize: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=algo"
    },
    {
      id: "sub-3",
      author: "react_fan",
      handle: "",
      repo: "https://github.com/react-fan/submission",
      videoUrl: "screen_recording.mp4",
      rawTitle: "Submission: React Dashboard",
      blurb: "",
      boldSummary: "",
      socialBlurb: "",
      prize: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=react"
    },
    {
      id: "sub-4",
      author: "newbie_coder",
      handle: "@newbie",
      repo: "https://github.com/newbie/first-try",
      videoUrl: "recording.webm",
      rawTitle: "First time submission!",
      blurb: "",
      boldSummary: "",
      socialBlurb: "",
      prize: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=newbie"
    }
  ];

  const [submissions, setSubmissions] = useState(initialSubmissions);

  // --- Actions ---

  const moveItem = (index, direction) => {
    const newItems = [...submissions];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    setSubmissions(newItems);
  };

  const updateField = (id, field, value) => {
    setSubmissions(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  // Auto-calculate prizes based on order
  useEffect(() => {
    // Only verify prizes need update to avoid loops, though strictly functional here
    const prizes = [150, 100, 50];
    const updated = submissions.map((sub, idx) => ({
      ...sub,
      prize: prizes[idx] || 0
    }));

    // Simple deep check or just set it (React handles primitive diffs well)
    const hasChanged = updated.some((u, i) => u.prize !== submissions[i].prize);
    if (hasChanged) {
      setSubmissions(updated);
    }
  }, [submissions]); // Run when order changes

  const simulateProcessing = () => {
    setIsProcessing(true);
    const steps = [
      "Downloading videos from YouTube/Attachments...",
      "Compressing videos (ffmpeg -crf 28)...", // Technical detail for flavor
      "Resizing assets for Twitter compatibility...",
      "Generating thumbnails...",
      "Uploading to Cloudinary...",
      "Ready!"
    ];

    let currentStep = 0;
    setProcessingStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsProcessing(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setProcessingStep(steps[currentStep]);
      }
    }, 800);
  };

  // --- Render Helpers ---

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderRankingList = () => (
    <div className="space-y-3">
      {submissions.map((sub, index) => (
        <div
          key={sub.id}
          className={`bg-[#1c2128] border transition-all duration-200 rounded-xl overflow-hidden group ${expandedId === sub.id ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg' : 'border-gray-800 hover:border-gray-600'}`}
        >
          {/* Card Header (Always Visible) */}
          <div className="flex items-center gap-3 p-3 cursor-pointer select-none bg-gradient-to-r from-[#1c2128] to-[#161b22]" onClick={() => toggleExpand(sub.id)}>

            {/* Drag Handle & Rank */}
            <div className="flex flex-col items-center justify-center min-w-[2.5rem] gap-1 mr-1">
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-50 transition-opacity hover:!opacity-100" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => moveItem(index, "up")} disabled={index === 0} className="hover:text-indigo-400 disabled:opacity-0"><GripVertical className="w-3 h-3 rotate-90 md:rotate-0" /></button>
                <button onClick={() => moveItem(index, "down")} disabled={index === submissions.length - 1} className="hover:text-indigo-400 disabled:opacity-0"><GripVertical className="w-3 h-3 rotate-90 md:rotate-0" /></button>
              </div>
              <span className={`text-xl font-bold font-mono leading-none ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
            </div>

            {/* Avatar & Summary */}
            <img src={sub.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-gray-700 border border-gray-700" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-200 truncate">{sub.author}</h3>
                {sub.handle && <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 hidden sm:inline-block">{sub.handle}</span>}
              </div>
              <p className="text-xs text-gray-500 truncate pr-4">
                {sub.rawTitle}
              </p>
            </div>

            {/* Prize Badge */}
            <div className="flex items-center gap-3">
              {sub.prize > 0 && (
                <div className={`px-2 py-1 rounded-md text-xs font-bold font-mono flex items-center gap-1 ${index === 0 ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-700/50' : 'bg-green-900/20 text-green-500 border border-green-700/50'}`}>
                  ${sub.prize}
                </div>
              )}
              {/* Expand Chevron */}
              <div className={`text-gray-500 transition-transform duration-200 ${expandedId === sub.id ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Expanded Editing Area */}
          {expandedId === sub.id && (
            <div className="p-4 bg-[#161b22] border-t border-gray-800 space-y-4 animate-in slide-in-from-top-2 duration-200">

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">One-line Assessment (Repo Blurb)</label>
                    <span className="text-[10px] text-gray-600">{sub.blurb.length}/100</span>
                  </div>
                  <input
                    type="text"
                    value={sub.blurb}
                    onChange={(e) => updateField(sub.id, "blurb", e.target.value)}
                    placeholder="e.g. Stunning performance optimization using WebGL."
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-200 placeholder-gray-600 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Social Highlight (Twitter/Threads)</label>
                  <textarea
                    value={sub.boldSummary}
                    onChange={(e) => updateField(sub.id, "boldSummary", e.target.value)}
                    placeholder="What makes this submission special? This text will be featured in the social thread."
                    rows={2}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-200 placeholder-gray-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-800/50">
                <a href={sub.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
                  <Github className="w-3 h-3" /> View Repository
                </a>
                <span className="text-gray-700">|</span>
                <a href="#" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                  <Video className="w-3 h-3" /> Preview Video
                </a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTwitterPreview = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-black/80 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
        <div className="flex gap-3 mb-4">
          <img src="https://github.com/vjeux.png" className="w-10 h-10 rounded-full" alt="vjeux" />
          <div>
            <div className="font-bold text-gray-100">Vjeux <span className="text-gray-500 font-normal">@Vjeux</span></div>
            <div className="text-gray-100 mt-1">
              Weekly Challenge #36 Results are in! 🚀<br /><br />
              This week we had some insane submissions for the "Challenge Running" task.
              <br /><br />
              Here are the winners 👇
            </div>
          </div>
        </div>
      </div>

      {submissions.map((sub, idx) => (
        <div key={sub.id} className="bg-black/80 border border-gray-800 rounded-xl p-6 relative ml-8 border-l-2 border-l-gray-700">
          <div className="flex gap-3">
            <img src="https://github.com/vjeux.png" className="w-10 h-10 rounded-full" alt="vjeux" />
            <div className="flex-1">
              <div className="font-bold text-gray-100 flex justify-between">
                <span>Vjeux <span className="text-gray-500 font-normal">@Vjeux</span></span>
                <span className="text-gray-600 text-sm">#{idx + 1}</span>
              </div>
              <div className="text-gray-100 mt-2">
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🏅"} {sub.handle ? sub.handle : sub.author}
                <br /><br />
                {sub.boldSummary || "This submission was particularly interesting because it successfully implemented the core requirements in a novel way."}
                <br /><br />
                Check out the repo: {sub.repo}
              </div>

              {/* Mock Video Attachments */}
              <div className="mt-4 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 aspect-video flex items-center justify-center relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Video className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                <div className="absolute bottom-2 left-2 text-xs font-mono text-white/90 bg-black/50 px-1 rounded">
                  COMPRESSED • 2.1MB
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReadmePreview = () => (
    <div className="bg-[#0d1117] border border-gray-700 rounded-xl p-6 font-mono text-sm text-gray-300 overflow-x-auto shadow-inner">
      <h3 className="text-gray-500 mb-4 select-none"># README.md Preview</h3>
      <div className="whitespace-pre-wrap select-all selection:bg-indigo-500/30">
        {`## Submissions\n\n`}
        {submissions.map((sub, idx) => (
          `* **${sub.author}** ${idx < 3 ? `($${sub.prize})` : ''}: ${sub.blurb || "Great submission that solves the problem."}
  * Repo: ${sub.repo}
  * Video: [Link](${sub.videoUrl})
`
        ))}
      </div>
    </div>
  );

  const renderPreviewPanel = () => (
    <div className="h-full flex flex-col">
      {/* Preview Tabs */}
      <div className="flex bg-[#161b22] border-b border-gray-800 p-1 gap-1">
        <button
          onClick={() => setActiveTab("twitter")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "twitter" ? 'bg-sky-900/20 text-sky-400 shadow-sm' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
        >
          <Twitter className="w-4 h-4" /> Twitter View
        </button>
        <button
          onClick={() => setActiveTab("readme")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "readme" ? 'bg-gray-700/40 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
        >
          <Github className="w-4 h-4" /> README View
        </button>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d1117] custom-scrollbar">
        {activeTab === "twitter" ? renderTwitterPreview() : renderReadmePreview()}
      </div>
    </div>
  );

  // --- Rendering Main Layout ---
  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-indigo-500/30 flex flex-col">

      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-800 bg-[#161b22] px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-100">Running Admin</h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Weekly Challenge #36</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 mr-6 pr-6 border-r border-gray-800">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Total Prize Pool</div>
              <div className="text-sm font-mono text-green-400 font-bold">$300.00</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold">Submissions</div>
              <div className="text-sm font-mono text-indigo-400 font-bold">{submissions.length}</div>
            </div>
          </div>

          <button
            onClick={() => setSubmissions(initialSubmissions)}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            title="Reset Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={simulateProcessing}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/50 ${isProcessing ? 'bg-indigo-900 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/40'}`}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isProcessing ? "Publishing..." : "Publish Results"}
          </button>
        </div>
      </nav>

      {/* Main Split Layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

        {/* Left Panel: Editor List */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-gray-800 bg-[#0f1115]">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0f1115]/50 backdrop-blur text-sm">
            <span className="font-semibold text-gray-400">Submission Ranking</span>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 1st $150</span>
              <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400"></span> 2nd $100</span>
              <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-amber-700"></span> 3rd $50</span>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderRankingList()}
            <div className="mt-8 text-center">
              <button className="text-xs text-gray-600 hover:text-gray-400 flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                + Import more submissions from GitHub Issues
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Preview (Hidden on small mobile, strictly split on desktop) */}
        <div className="flex-1 min-w-0 bg-[#0d1117] relative flex flex-col h-[50vh] md:h-auto border-t md:border-t-0 md:border-l border-gray-800">
          {renderPreviewPanel()}
        </div>

      </div>

      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-[2px]">
          <div className="text-center animate-in zoom-in duration-300">
            <div className="text-6xl animate-bounce mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2 text-shadow-lg">Published Successfully!</h2>
            <p className="text-gray-300">All assets processed and threads posted.</p>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-gray-100">{processingStep}</div>
            <p className="text-gray-500 text-sm">Please do not close this window</p>
          </div>
          <div className="w-80 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-progress w-full origin-left-right"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Completion36;
