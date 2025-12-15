import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Save, Trash2, Award, Zap, Activity } from 'lucide-react';

// --- Utility Functions ---

const STORAGE_KEY = 'daily_ping_entries_v1';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Fix for Timezone offset issues ensuring we show the correct "local" day for the string
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + userTimezoneOffset);
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
};

const calculateStreak = (entries) => {
  const sortedDates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
  if (sortedDates.length === 0) return 0;

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today is logged
  const hasToday = entries[getTodayDateString()];

  // Logic works by checking backward from today (or yesterday if today isn't done yet)
  let checkDate = new Date(today);

  // If we haven't logged today, streak continues from yesterday
  if (!hasToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < sortedDates.length; i++) {
    const entryDate = new Date(sortedDates[i] + 'T00:00:00'); // Force midnight

    if (entryDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (entryDate.getTime() > checkDate.getTime()) {
      // Duplicate or future date, ignore
      continue;
    } else {
      // Break in chain
      break;
    }
  }
  return streak;
};

// --- Components ---

const MoodSelector = ({ selected, onSelect }) => {
  const moods = [
    { value: 'great', label: '🤩', color: 'bg-green-500' },
    { value: 'good', label: '😊', color: 'bg-blue-500' },
    { value: 'neutral', label: '😐', color: 'bg-gray-500' },
    { value: 'stress', label: '😓', color: 'bg-orange-500' },
    { value: 'bad', label: '😫', color: 'bg-red-500' },
  ];

  return (
    <div className="flex gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onSelect(mood.value)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200
            ${selected === mood.value
              ? `scale-110 ring-2 ring-offset-2 ring-offset-slate-900 ring-${mood.color.replace('bg-', '')}`
              : 'opacity-50 hover:opacity-100 hover:scale-105'
            }
            ${selected === mood.value ? mood.color : 'bg-slate-700'}
          `}
          title={mood.value}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
};

const Heatmap = ({ entries }) => {
  // Generate last 365 days
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  }, []);

  const getIntensityClass = (date) => {
    const entry = entries[date];
    if (!entry) return 'bg-slate-800';

    // Intensity based on content length or mood? Let's do mood for color, simple presence for now
    if (!entry.mood) return 'bg-emerald-900';

    switch (entry.mood) {
      case 'great': return 'bg-green-400';
      case 'good': return 'bg-emerald-500';
      case 'neutral': return 'bg-slate-500';
      case 'stress': return 'bg-orange-400';
      case 'bad': return 'bg-red-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end mb-1">
        <h3 className="text-sm font-medium text-slate-400">Activity & Mood Map</h3>
        <div className="text-xs text-slate-500 flex gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
            <div className="w-3 h-3 rounded-sm bg-red-500"></div>
            <div className="w-3 h-3 rounded-sm bg-orange-400"></div>
            <div className="w-3 h-3 rounded-sm bg-slate-500"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map((date) => (
          <div
            key={date}
            className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 ${getIntensityClass(date)}`}
            title={`${date}: ${entries[date]?.summary || 'No entry'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const Completion31 = () => {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [draft, setDraft] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');

  // Load entry into form when date selection changes
  useEffect(() => {
    const entry = entries[selectedDate];
    if (entry) {
      setDraft(entry.text || '');
      setMood(entry.mood || 'neutral');
      setTags(entry.tags ? entry.tags.join(', ') : '');
    } else {
      setDraft('');
      setMood('neutral');
      setTags('');
    }
  }, [selectedDate, entries]);

  const handleSave = () => {
    if (!draft.trim()) return;

    const newEntries = {
      ...entries,
      [selectedDate]: {
        id: Date.now(),
        date: selectedDate,
        text: draft,
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      }
    };

    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const handleDelete = () => {
    const newEntries = { ...entries };
    delete newEntries[selectedDate];
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setDraft('');
    setMood('neutral');
    setTags('');
  };

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const totalEntries = Object.keys(entries).length;

  // Navigation
  const changeDate = (days) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent inline-flex items-center gap-2">
              <Activity className="w-8 h-8 text-emerald-400" />
              Daily Ping
            </h1>
            <p className="text-slate-400 mt-1">Capture your days, reflect on your life.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono leading-none">{streak}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Day Streak</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl border border-slate-700/50 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono leading-none">{totalEntries}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Logs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Editor */}
          <div className="lg:col-span-2 space-y-6">

            {/* Editor Card */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl ring-1 ring-white/5 relative overflow-hidden group">
              {/* Decorative gradient blob */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>

              {/* Date Navigation */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {formatDate(selectedDate)}
                  </h2>
                  <span className="text-xs font-mono text-emerald-400 font-medium">
                    {selectedDate === getTodayDateString() ? 'TODAY' : 'HISTORY'}
                  </span>
                </div>

                <button
                  onClick={() => changeDate(1)}
                  className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={selectedDate >= getTodayDateString()}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Input Area */}
              <div className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">How was your day?</label>
                  <MoodSelector selected={mood} onSelect={setMood} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">What happened?</label>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Wrote some code, went for a run, cooked dinner..."
                    className="w-full h-48 bg-slate-900/50 rounded-xl p-4 text-slate-100 placeholder-slate-500 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none font-light leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="work, exercise, learning"
                    className="w-full bg-slate-900/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Heatmap Card */}
            <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl p-6 border border-slate-700 shadow-xl overflow-x-auto">
              <Heatmap entries={entries} />
            </div>

          </div>

          {/* Right Column: Timeline/History */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2 p-1">
              <Calendar className="w-5 h-5 text-slate-400" />
              Recent History
            </h3>

            <div className="space-y-4">
              {Object.keys(entries)
                .sort((a, b) => new Date(b) - new Date(a))
                .slice(0, 10)
                .map((date) => (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      group cursor-pointer p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02]
                      ${selectedDate === date
                        ? 'bg-slate-800/80 border-emerald-500/50 shadow-emerald-500/10'
                        : 'bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-slate-300">{formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      {entries[date].mood && (
                        <span className="text-lg" title={entries[date].mood}>
                          {{
                            'great': '🤩',
                            'good': '😊',
                            'neutral': '😐',
                            'stress': '😓',
                            'bad': '😫',
                          }[entries[date].mood]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {entries[date].text}
                    </p>
                    {entries[date].tags && entries[date].tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {entries[date].tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {Object.keys(entries).length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>No entries yet.</p>
                  <p className="text-sm mt-2">Start your journey today!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion31;

