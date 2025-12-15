import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Utility functions
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getWeekRange = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday),
    display: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
  };
};

const STORAGE_KEY = 'daily-ping-entries';

// Mood options with emojis
const MOODS = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
];

// Categories for tagging
const CATEGORIES = [
  { value: 'work', emoji: '💼', label: 'Work' },
  { value: 'personal', emoji: '🏠', label: 'Personal' },
  { value: 'health', emoji: '🏃', label: 'Health' },
  { value: 'social', emoji: '👥', label: 'Social' },
  { value: 'learning', emoji: '📚', label: 'Learning' },
  { value: 'creative', emoji: '🎨', label: 'Creative' },
];

// Prompt suggestions
const PROMPTS = [
  'What did you accomplish today?',
  'What are you grateful for?',
  'What challenged you today?',
  'What did you learn?',
  'How did you take care of yourself?',
  'What are you looking forward to?',
  'What would you do differently?',
  'Who made a positive impact on your day?',
];

const Completion31 = () => {
  // Use lazy initialization to load from localStorage
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [currentCategories, setCurrentCategories] = useState([]);
  const [view, setView] = useState('today'); // 'today', 'calendar', 'weekly', 'monthly', 'search'
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState(() => PROMPTS[0]);
  const [notification, setNotification] = useState(null);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Calculate streak using useMemo
  const streakCount = useMemo(() => {
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = formatDate(checkDate);
      if (entries[dateStr] && entries[dateStr].content) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0 && formatDate(checkDate) === formatDate(new Date())) {
        // Today might not have an entry yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  // Load entry for selected date - use a callback to handle date changes
  const handleDateChange = useCallback(
    (newDate) => {
      setSelectedDate(newDate);
      const entry = entries[newDate];
      if (entry) {
        setCurrentEntry(entry.content || '');
        setCurrentMood(entry.mood || '');
        setCurrentCategories(entry.categories || []);
      } else {
        setCurrentEntry('');
        setCurrentMood('');
        setCurrentCategories([]);
      }
    },
    [entries]
  );

  // Initialize entry fields when entries change (e.g., after load)
  useEffect(() => {
    const entry = entries[selectedDate];
    if (entry) {
      setCurrentEntry(entry.content || '');
      setCurrentMood(entry.mood || '');
      setCurrentCategories(entry.categories || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const saveEntry = useCallback(() => {
    if (!currentEntry.trim() && !currentMood) {
      setNotification({ type: 'error', message: 'Please add some content or select a mood!' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setEntries((prev) => ({
      ...prev,
      [selectedDate]: {
        content: currentEntry.trim(),
        mood: currentMood,
        categories: currentCategories,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));

    setNotification({ type: 'success', message: 'Entry saved successfully! 🎉' });
    setTimeout(() => setNotification(null), 3000);
  }, [currentEntry, currentMood, currentCategories, selectedDate]);

  const toggleCategory = (category) => {
    setCurrentCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const generateNewPrompt = () => {
    const newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setCurrentPrompt(newPrompt);
  };

  // Calendar generation
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, date: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      days.push({
        day,
        date: dateStr,
        hasEntry: !!entries[dateStr]?.content,
        mood: entries[dateStr]?.mood,
        isToday: dateStr === formatDate(new Date()),
        isFuture: date > new Date(),
      });
    }
    return days;
  }, [calendarMonth, entries]);

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const weeks = {};
    Object.entries(entries).forEach(([dateStr, entry]) => {
      const week = getWeekRange(dateStr);
      if (!weeks[week.start]) {
        weeks[week.start] = {
          range: week,
          entries: [],
          moods: {},
          categories: {},
        };
      }
      weeks[week.start].entries.push({ date: dateStr, ...entry });
      if (entry.mood) {
        weeks[week.start].moods[entry.mood] = (weeks[week.start].moods[entry.mood] || 0) + 1;
      }
      entry.categories?.forEach((cat) => {
        weeks[week.start].categories[cat] = (weeks[week.start].categories[cat] || 0) + 1;
      });
    });
    return Object.values(weeks).sort((a, b) => b.range.start.localeCompare(a.range.start));
  }, [entries]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const months = {};
    Object.entries(entries).forEach(([dateStr, entry]) => {
      const monthKey = dateStr.substring(0, 7);
      const date = new Date(dateStr + 'T12:00:00');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!months[monthKey]) {
        months[monthKey] = {
          key: monthKey,
          name: monthName,
          entries: [],
          moods: {},
          categories: {},
          totalWords: 0,
        };
      }
      months[monthKey].entries.push({ date: dateStr, ...entry });
      if (entry.mood) {
        months[monthKey].moods[entry.mood] = (months[monthKey].moods[entry.mood] || 0) + 1;
      }
      entry.categories?.forEach((cat) => {
        months[monthKey].categories[cat] = (months[monthKey].categories[cat] || 0) + 1;
      });
      months[monthKey].totalWords += entry.content?.split(/\s+/).filter(Boolean).length || 0;
    });
    return Object.values(months).sort((a, b) => b.key.localeCompare(a.key));
  }, [entries]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.entries(entries)
      .filter(
        ([, entry]) =>
          entry.content?.toLowerCase().includes(query) ||
          entry.categories?.some((c) => c.toLowerCase().includes(query))
      )
      .map(([date, entry]) => ({ date, ...entry }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const entryList = Object.values(entries);
    const totalEntries = entryList.length;
    const totalWords = entryList.reduce(
      (sum, e) => sum + (e.content?.split(/\s+/).filter(Boolean).length || 0),
      0
    );
    const moodCounts = {};
    const categoryCounts = {};
    entryList.forEach((e) => {
      if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      e.categories?.forEach((c) => {
        categoryCounts[c] = (categoryCounts[c] || 0) + 1;
      });
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalEntries,
      totalWords,
      avgWordsPerEntry: totalEntries ? Math.round(totalWords / totalEntries) : 0,
      topMood: topMood ? MOODS.find((m) => m.value === topMood[0]) : null,
      topCategory: topCategory ? CATEGORIES.find((c) => c.value === topCategory[0]) : null,
      streak: streakCount,
    };
  }, [entries, streakCount]);

  const renderTodayView = () => (
    <div style={styles.todayView}>
      <div style={styles.dateHeader}>
        <button
          style={styles.navButton}
          onClick={() => {
            const prev = new Date(selectedDate + 'T12:00:00');
            prev.setDate(prev.getDate() - 1);
            handleDateChange(formatDate(prev));
          }}
        >
          ← Previous
        </button>
        <div style={styles.dateInfo}>
          <h2 style={styles.currentDate}>{formatDisplayDate(selectedDate)}</h2>
          {selectedDate === formatDate(new Date()) && <span style={styles.todayBadge}>Today</span>}
        </div>
        <button
          style={styles.navButton}
          onClick={() => {
            const next = new Date(selectedDate + 'T12:00:00');
            next.setDate(next.getDate() + 1);
            if (next <= new Date()) {
              handleDateChange(formatDate(next));
            }
          }}
          disabled={selectedDate === formatDate(new Date())}
        >
          Next →
        </button>
      </div>

      {showPrompt && (
        <div style={styles.promptCard}>
          <div style={styles.promptHeader}>
            <span style={styles.promptLabel}>💭 Today's Prompt</span>
            <button style={styles.refreshButton} onClick={generateNewPrompt}>
              🔄
            </button>
          </div>
          <p style={styles.promptText}>{currentPrompt}</p>
          <button style={styles.hidePromptButton} onClick={() => setShowPrompt(false)}>
            Hide prompts
          </button>
        </div>
      )}

      <div style={styles.entrySection}>
        <div style={styles.moodSection}>
          <label style={styles.sectionLabel}>How are you feeling?</label>
          <div style={styles.moodGrid}>
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                style={{
                  ...styles.moodButton,
                  ...(currentMood === mood.value ? styles.moodButtonActive : {}),
                }}
                onClick={() => setCurrentMood(mood.value)}
                title={mood.label}
              >
                <span style={styles.moodEmoji}>{mood.emoji}</span>
                <span style={styles.moodLabel}>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.categoriesSection}>
          <label style={styles.sectionLabel}>What areas did you focus on?</label>
          <div style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                style={{
                  ...styles.categoryButton,
                  ...(currentCategories.includes(cat.value) ? styles.categoryButtonActive : {}),
                }}
                onClick={() => toggleCategory(cat.value)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.textSection}>
          <label style={styles.sectionLabel}>What happened today?</label>
          <textarea
            style={styles.entryTextarea}
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write about your day... What did you accomplish? What are you grateful for? Any challenges or learnings?"
            rows={8}
          />
          <div style={styles.wordCount}>
            {currentEntry.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        <button style={styles.saveButton} onClick={saveEntry}>
          💾 Save Entry
        </button>
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <div style={styles.calendarView}>
      <div style={styles.calendarHeader}>
        <button
          style={styles.calendarNavButton}
          onClick={() => {
            const prev = new Date(calendarMonth);
            prev.setMonth(prev.getMonth() - 1);
            setCalendarMonth(prev);
          }}
        >
          ←
        </button>
        <h2 style={styles.calendarTitle}>
          {calendarMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <button
          style={styles.calendarNavButton}
          onClick={() => {
            const next = new Date(calendarMonth);
            next.setMonth(next.getMonth() + 1);
            setCalendarMonth(next);
          }}
        >
          →
        </button>
      </div>

      <div style={styles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={styles.calendarWeekday}>
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            style={{
              ...styles.calendarDay,
              ...(day.hasEntry ? styles.calendarDayWithEntry : {}),
              ...(day.isToday ? styles.calendarDayToday : {}),
              ...(day.isFuture ? styles.calendarDayFuture : {}),
              ...(day.day === null ? styles.calendarDayEmpty : {}),
            }}
            onClick={() => {
              if (day.date && !day.isFuture) {
                handleDateChange(day.date);
                setView('today');
              }
            }}
          >
            {day.day && (
              <>
                <span style={styles.calendarDayNumber}>{day.day}</span>
                {day.mood && (
                  <span style={styles.calendarDayMood}>
                    {MOODS.find((m) => m.value === day.mood)?.emoji}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div style={styles.calendarLegend}>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }}></span>
          Has entry
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendDot, border: '2px solid #f59e0b' }}></span>
          Today
        </span>
      </div>
    </div>
  );

  const renderWeeklyView = () => (
    <div style={styles.summaryView}>
      <h2 style={styles.summaryTitle}>📊 Weekly Summaries</h2>
      {weeklySummary.length === 0 ? (
        <p style={styles.emptyMessage}>
          No entries yet. Start writing to see your weekly summaries!
        </p>
      ) : (
        <div style={styles.summaryList}>
          {weeklySummary.map((week) => (
            <div key={week.range.start} style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <h3 style={styles.summaryCardTitle}>{week.range.display}</h3>
                <span style={styles.entryCount}>
                  {week.entries.length} {week.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <div style={styles.summaryStats}>
                {Object.keys(week.moods).length > 0 && (
                  <div style={styles.statGroup}>
                    <span style={styles.statLabel}>Moods:</span>
                    <div style={styles.statTags}>
                      {Object.entries(week.moods).map(([mood, count]) => (
                        <span key={mood} style={styles.statTag}>
                          {MOODS.find((m) => m.value === mood)?.emoji} ×{count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {Object.keys(week.categories).length > 0 && (
                  <div style={styles.statGroup}>
                    <span style={styles.statLabel}>Focus areas:</span>
                    <div style={styles.statTags}>
                      {Object.entries(week.categories).map(([cat, count]) => (
                        <span key={cat} style={styles.statTag}>
                          {CATEGORIES.find((c) => c.value === cat)?.emoji} {cat} ×{count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.summaryEntries}>
                {week.entries
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((entry) => (
                    <div key={entry.date} style={styles.miniEntry}>
                      <div style={styles.miniEntryHeader}>
                        <span style={styles.miniEntryDate}>
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {entry.mood && (
                          <span>{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>
                        )}
                      </div>
                      <p style={styles.miniEntryContent}>
                        {entry.content?.substring(0, 150)}
                        {entry.content?.length > 150 ? '...' : ''}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMonthlyView = () => (
    <div style={styles.summaryView}>
      <h2 style={styles.summaryTitle}>📈 Monthly Overview</h2>
      {monthlySummary.length === 0 ? (
        <p style={styles.emptyMessage}>
          No entries yet. Start writing to see your monthly overview!
        </p>
      ) : (
        <div style={styles.summaryList}>
          {monthlySummary.map((month) => (
            <div key={month.key} style={styles.summaryCard}>
              <div style={styles.summaryCardHeader}>
                <h3 style={styles.summaryCardTitle}>{month.name}</h3>
                <span style={styles.entryCount}>
                  {month.entries.length} entries • {month.totalWords} words
                </span>
              </div>

              <div style={styles.monthlyStats}>
                <div style={styles.monthStat}>
                  <div style={styles.monthStatValue}>{month.entries.length}</div>
                  <div style={styles.monthStatLabel}>Days logged</div>
                </div>
                <div style={styles.monthStat}>
                  <div style={styles.monthStatValue}>{month.totalWords}</div>
                  <div style={styles.monthStatLabel}>Total words</div>
                </div>
                <div style={styles.monthStat}>
                  <div style={styles.monthStatValue}>
                    {Math.round(month.totalWords / month.entries.length) || 0}
                  </div>
                  <div style={styles.monthStatLabel}>Avg words/day</div>
                </div>
              </div>

              {Object.keys(month.moods).length > 0 && (
                <div style={styles.moodBreakdown}>
                  <span style={styles.statLabel}>Mood breakdown:</span>
                  <div style={styles.moodBar}>
                    {Object.entries(month.moods)
                      .sort((a, b) => b[1] - a[1])
                      .map(([mood, count]) => (
                        <div
                          key={mood}
                          style={{
                            ...styles.moodBarSegment,
                            flex: count,
                            backgroundColor:
                              mood === 'amazing'
                                ? '#10b981'
                                : mood === 'good'
                                  ? '#3b82f6'
                                  : mood === 'okay'
                                    ? '#f59e0b'
                                    : mood === 'tired'
                                      ? '#8b5cf6'
                                      : mood === 'stressed'
                                        ? '#ef4444'
                                        : '#6b7280',
                          }}
                          title={`${MOODS.find((m) => m.value === mood)?.label}: ${count}`}
                        >
                          {MOODS.find((m) => m.value === mood)?.emoji}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSearchView = () => (
    <div style={styles.searchView}>
      <div style={styles.searchHeader}>
        <h2 style={styles.searchTitle}>🔍 Search Entries</h2>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search your entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery && (
        <div style={styles.searchResults}>
          <p style={styles.searchResultCount}>
            Found {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'}
          </p>
          {searchResults.map((entry) => (
            <div key={entry.date} style={styles.searchResultCard}>
              <div style={styles.searchResultHeader}>
                <span style={styles.searchResultDate}>{formatDisplayDate(entry.date)}</span>
                {entry.mood && <span>{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>}
              </div>
              <p style={styles.searchResultContent}>
                {entry.content?.substring(0, 300)}
                {entry.content?.length > 300 ? '...' : ''}
              </p>
              <div style={styles.searchResultActions}>
                <button
                  style={styles.viewButton}
                  onClick={() => {
                    handleDateChange(entry.date);
                    setView('today');
                  }}
                >
                  View Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {notification && (
        <div
          style={{
            ...styles.notification,
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {notification.message}
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📝 Daily Ping</h1>
          <p style={styles.subtitle}>Your personal daily journal</p>
        </div>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statItemValue}>🔥 {stats.streak}</span>
            <span style={styles.statItemLabel}>Day streak</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statItemValue}>📝 {stats.totalEntries}</span>
            <span style={styles.statItemLabel}>Total entries</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statItemValue}>✍️ {stats.totalWords}</span>
            <span style={styles.statItemLabel}>Words written</span>
          </div>
          {stats.topMood && (
            <div style={styles.statItem}>
              <span style={styles.statItemValue}>{stats.topMood.emoji}</span>
              <span style={styles.statItemLabel}>Top mood</span>
            </div>
          )}
        </div>
      </header>

      <nav style={styles.nav}>
        {[
          { key: 'today', label: "📅 Today's Entry" },
          { key: 'calendar', label: '🗓️ Calendar' },
          { key: 'weekly', label: '📊 Weekly' },
          { key: 'monthly', label: '📈 Monthly' },
          { key: 'search', label: '🔍 Search' },
        ].map((item) => (
          <button
            key={item.key}
            style={{
              ...styles.navButton,
              ...(view === item.key ? styles.navButtonActive : {}),
            }}
            onClick={() => setView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {view === 'today' && renderTodayView()}
        {view === 'calendar' && renderCalendarView()}
        {view === 'weekly' && renderWeeklyView()}
        {view === 'monthly' && renderMonthlyView()}
        {view === 'search' && renderSearchView()}
      </main>

      <footer style={styles.footer}>
        <p>Daily Ping - Track your daily journey, one entry at a time 💫</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
  },
  header: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    padding: '24px',
    textAlign: 'center',
  },
  headerContent: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '2.5rem',
    margin: 0,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: '8px 0 0 0',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statItemValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  statItemLabel: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
  },
  todayView: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  dateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  currentDate: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1e293b',
  },
  todayBadge: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
  },
  promptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  promptLabel: {
    fontWeight: '600',
    color: '#92400e',
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  promptText: {
    fontSize: '1.1rem',
    color: '#78350f',
    margin: '0 0 12px 0',
    fontStyle: 'italic',
  },
  hidePromptButton: {
    background: 'none',
    border: 'none',
    color: '#92400e',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
  },
  entrySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionLabel: {
    display: 'block',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '12px',
    fontSize: '1rem',
  },
  moodSection: {},
  moodGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  moodButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  moodButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  moodEmoji: {
    fontSize: '1.8rem',
  },
  moodLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  categoriesSection: {},
  categoryGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryButton: {
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  categoryButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
  },
  textSection: {},
  entryTextarea: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    boxSizing: 'border-box',
  },
  wordCount: {
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  saveButton: {
    padding: '14px 32px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'center',
    transition: 'all 0.2s',
  },
  calendarView: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  calendarTitle: {
    margin: 0,
    color: '#1e293b',
  },
  calendarNavButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  calendarWeekday: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#64748b',
    padding: '8px',
    fontSize: '0.85rem',
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  calendarDayWithEntry: {
    backgroundColor: '#dbeafe',
    border: '2px solid #3b82f6',
  },
  calendarDayToday: {
    border: '3px solid #f59e0b',
  },
  calendarDayFuture: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  calendarDayNumber: {
    fontWeight: '600',
    color: '#334155',
  },
  calendarDayMood: {
    fontSize: '0.8rem',
    marginTop: '2px',
  },
  calendarLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '24px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  legendDot: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  summaryView: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  summaryTitle: {
    margin: '0 0 24px 0',
    color: '#1e293b',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#64748b',
    padding: '48px 24px',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  summaryCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  summaryCardTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.2rem',
  },
  entryCount: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  summaryStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  statGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  statTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statTag: {
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    border: '1px solid #e2e8f0',
  },
  summaryEntries: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  },
  miniEntry: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  miniEntryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  miniEntryDate: {
    fontWeight: '600',
    color: '#3b82f6',
    fontSize: '0.9rem',
  },
  miniEntryContent: {
    margin: 0,
    color: '#475569',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  monthlyStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  monthStat: {
    textAlign: 'center',
  },
  monthStatValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#3b82f6',
  },
  monthStatLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  moodBreakdown: {
    marginTop: '16px',
  },
  moodBar: {
    display: 'flex',
    borderRadius: '8px',
    overflow: 'hidden',
    marginTop: '8px',
    height: '32px',
  },
  moodBarSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.9rem',
    minWidth: '24px',
  },
  searchView: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  searchHeader: {
    marginBottom: '24px',
  },
  searchTitle: {
    margin: '0 0 16px 0',
    color: '#1e293b',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  searchResults: {},
  searchResultCount: {
    color: '#64748b',
    marginBottom: '16px',
  },
  searchResultCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
  },
  searchResultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  searchResultDate: {
    fontWeight: '600',
    color: '#3b82f6',
  },
  searchResultContent: {
    margin: '0 0 12px 0',
    color: '#475569',
    lineHeight: '1.5',
  },
  searchResultActions: {},
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: '#64748b',
    borderTop: '1px solid #e2e8f0',
    marginTop: '24px',
  },
};

export default Completion31;
