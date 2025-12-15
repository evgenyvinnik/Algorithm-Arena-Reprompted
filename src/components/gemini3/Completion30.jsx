import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, Coffee, Globe, Sun, Layers } from 'lucide-react';

const Completion30 = () => {
  const [vacationDays, setVacationDays] = useState(15);
  const [strategy, setStrategy] = useState('bridge');
  const [hoveredDate, setHoveredDate] = useState(null);

  const YEAR = 2025;

  // 2025 US Holidays (Same logic)
  const HOLIDAYS = useMemo(() => [
    { date: '2025-01-01', name: "New Year's Day" },
    { date: '2025-01-20', name: "Martin Luther King Jr. Day" },
    { date: '2025-02-17', name: "Presidents' Day" },
    { date: '2025-05-26', name: "Memorial Day" },
    { date: '2025-06-19', name: "Juneteenth" },
    { date: '2025-07-04', name: "Independence Day" },
    { date: '2025-09-01', name: "Labor Day" },
    { date: '2025-10-13', name: "Columbus Day" },
    { date: '2025-11-11', name: "Veterans Day" },
    { date: '2025-11-27', name: "Thanksgiving Day" },
    { date: '2025-12-25', name: "Christmas Day" },
  ], []);

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInYear = (year) => {
    const dates = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const allDates = useMemo(() => getDaysInYear(YEAR), []);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const getDayType = (date) => {
    const dateStr = formatDate(date);
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = HOLIDAYS.some(h => h.date === dateStr);

    if (isHoliday) return 'holiday';
    if (isWeekend) return 'weekend';
    return 'workday';
  };

  const calculateVacationDates = () => {
    const vacationSet = new Set();
    let daysToSpend = vacationDays;

    const isFree = (date) => {
      const type = getDayType(date);
      return type === 'weekend' || type === 'holiday' || vacationSet.has(formatDate(date));
    };

    if (strategy === 'bridge') {
      const potentialBridges = [];
      const yearTypes = allDates.map(d => ({ date: d, type: getDayType(d), dateStr: formatDate(d) }));
      let currentGap = [];

      for (let i = 0; i < yearTypes.length; i++) {
        const day = yearTypes[i];
        if (day.type === 'workday') {
          currentGap.push(day);
        } else {
          if (currentGap.length > 0) {
            potentialBridges.push({
              cost: currentGap.length,
              dates: [...currentGap],
              score: currentGap.length
            });
            currentGap = [];
          }
        }
      }
      potentialBridges.sort((a, b) => a.cost - b.cost);

      for (const bridge of potentialBridges) {
        if (daysToSpend >= bridge.cost) {
          bridge.dates.forEach(d => vacationSet.add(d.dateStr));
          daysToSpend -= bridge.cost;
        }
      }
      if (daysToSpend > 0) {
        for (let i = 0; i < allDates.length && daysToSpend > 0; i++) {
          const date = allDates[i];
          const dStr = formatDate(date);
          if (!isFree(date)) {
            if (date.getDay() === 5 || date.getDay() === 1) {
              vacationSet.add(dStr);
              daysToSpend--;
            }
          }
        }
        if (daysToSpend > 0) {
          for (let i = 0; i < allDates.length && daysToSpend > 0; i++) {
            const date = allDates[i];
            if (!isFree(date)) {
              vacationSet.add(formatDate(date));
              daysToSpend--;
            }
          }
        }
      }

    } else if (strategy === 'long_haul') {
      let bestStart = -1;
      let bestStreak = 0;
      for (let i = 0; i < allDates.length; i++) {
        let tempDays = daysToSpend;
        let currentStreak = 0;
        for (let j = i; j < allDates.length; j++) {
          const d = allDates[j];
          const type = getDayType(d);
          if (type === 'workday') {
            if (tempDays > 0) {
              tempDays--;
              currentStreak++;
            } else {
              break;
            }
          } else {
            currentStreak++;
          }
        }
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
          bestStart = i;
        }
      }
      if (bestStart !== -1) {
        let ptr = bestStart;
        while (daysToSpend > 0 && ptr < allDates.length) {
          const d = allDates[ptr];
          if (getDayType(d) === 'workday') {
            vacationSet.add(formatDate(d));
            daysToSpend--;
          }
          ptr++;
        }
      }

    } else if (strategy === 'balanced') {
      const months = new Array(12).fill(0).map(() => []);
      allDates.forEach(d => {
        if (getDayType(d) === 'workday') {
          months[d.getMonth()].push(d);
        }
      });

      let monthIdx = 0;
      let protection = 0;
      const findBestDay = (monthDays) => {
        const fridays = monthDays.filter(d => d.getDay() === 5 && !vacationSet.has(formatDate(d)));
        if (fridays.length > 0) return fridays[0];
        const mondays = monthDays.filter(d => d.getDay() === 1 && !vacationSet.has(formatDate(d)));
        if (mondays.length > 0) return mondays[0];
        return monthDays.find(d => !vacationSet.has(formatDate(d)));
      }
      while (daysToSpend > 0 && protection < 365) {
        protection++;
        const targetMonth = months[monthIdx];
        if (targetMonth) {
          const bestDay = findBestDay(targetMonth);
          if (bestDay) {
            vacationSet.add(formatDate(bestDay));
            daysToSpend--;
          }
        }
        monthIdx = (monthIdx + 1) % 12;
      }
    }
    return vacationSet;
  };

  const selectedVacationDates = useMemo(() => calculateVacationDates(), [vacationDays, strategy]);

  const stats = useMemo(() => {
    let maxStreak = 0;
    let currentStreak = 0;
    let totalOff = 0;
    let vacationsUsed = selectedVacationDates.size;
    allDates.forEach(d => {
      const dStr = formatDate(d);
      const type = getDayType(d);
      const isVacation = selectedVacationDates.has(dStr);
      if (type !== 'workday' || isVacation) {
        currentStreak++;
        totalOff++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }
    });
    maxStreak = Math.max(maxStreak, currentStreak);
    return { maxStreak, totalOff, vacationsUsed };
  }, [selectedVacationDates]);

  // STYLES
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      backgroundColor: '#0f1115',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '40px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    wrapper: {
      width: '100%',
      maxWidth: '1280px',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '40px',
      borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
      paddingBottom: '30px',
      flexWrap: 'wrap',
      gap: '20px',
    },
    titleGroup: {},
    h1: {
      fontSize: '3rem',
      fontWeight: '800',
      margin: '0 0 10px 0',
      background: 'linear-gradient(90deg, #34d399, #22d3ee)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: '1.1rem',
      margin: 0,
    },
    statsBar: {
      display: 'flex',
      gap: '30px',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #1e293b',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(5px)',
    },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statValue: { fontSize: '2rem', fontWeight: '800', lineHeight: 1 },
    statLabel: { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px', color: '#64748b', fontWeight: 'bold' },
    divider: { width: '1px', height: '40px', backgroundColor: '#334155' },

    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(250px, 300px) 1fr',
      gap: '40px',
    },
    leftPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    card: {
      backgroundColor: '#161b22',
      borderRadius: '16px',
      padding: '25px',
      border: '1px solid #1e293b',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    controlLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      letterSpacing: '0.5px',
    },
    rangeInput: {
      width: '100%',
      cursor: 'pointer',
      accentColor: '#10b981',
    },
    strategyBtn: (isActive, color) => ({
      width: '100%',
      padding: '16px',
      marginBottom: '10px',
      borderRadius: '12px',
      border: isActive ? `1px solid ${color}` : '1px solid #1e293b',
      background: isActive ? `${color}10` : '#161b22',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: isActive ? color : '#94a3b8',
      boxShadow: isActive ? `0 0 15px ${color}20` : 'none',
    }),

    calendarContainer: {
      backgroundColor: '#111318',
      borderRadius: '24px',
      padding: '30px',
      border: '1px solid #1e293b',
      position: 'relative',
      overflow: 'hidden',
    },
    monthsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px 40px',
      position: 'relative',
      zIndex: 10,
    },
    monthBlock: {},
    monthTitle: {
      color: '#64748b',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '10px',
      borderBottom: '1px solid #1e293b',
      paddingBottom: '5px',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
    },
    dayHeader: {
      color: '#475569',
      fontSize: '0.65rem',
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: '5px',
    },
    dayCell: (type, isVacation, isHovered) => {
      let bg = 'transparent';
      let color = '#475569';
      let transform = 'scale(1)';
      let zIndex = 1;
      let borderRadius = '4px';
      let boxShadow = 'none';

      if (type === 'weekend') {
        bg = 'rgba(30, 41, 59, 0.4)';
        color = '#64748b';
      }
      if (type === 'holiday') {
        bg = '#8b5cf6';
        color = 'white';
        borderRadius = '6px';
        boxShadow = '0 2px 5px rgba(139, 92, 246, 0.3)';
      }
      if (isVacation) {
        bg = '#10b981';
        color = 'white';
        transform = 'scale(1.15)';
        zIndex = 10;
        borderRadius = '50%';
        boxShadow = '0 2px 8px rgba(16, 185, 129, 0.4)';
      }
      if (isHovered && !isVacation) {
        bg = '#334155';
        color = '#e2e8f0';
        zIndex = 20;
      }

      return {
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: bg,
        color: color,
        transform: transform,
        zIndex: zIndex,
        borderRadius: borderRadius,
        boxShadow: boxShadow,
        cursor: 'default',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      };
    }
  };

  // Responsive overrides
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    styles.mainGrid.gridTemplateColumns = '1fr';
    styles.header.flexDirection = 'column';
    styles.header.alignItems = 'flex-start';
  }

  return (
    <div style={styles.container}>
      <style>{`
        /* Reset and Global Overrides for this component */
        input[type=range] {
          -webkit-appearance: none; 
          background: transparent; 
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px; width: 16px;
          border-radius: 50%;
          background: #10b981;
          margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 4px;
          background: #334155;
          border-radius: 2px;
        }
      `}</style>

      <div style={styles.wrapper}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.titleGroup}>
            <h1 style={styles.h1}>
              <Globe size={40} color="#10b981" />
              Vacation Planner
            </h1>
            <p style={styles.subtitle}>Algorithmically optimize your 2025 time off.</p>
          </div>

          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.vacationsUsed}</div>
              <div style={styles.statLabel}>Used</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#a855f7' }}>{stats.totalOff}</div>
              <div style={styles.statLabel}>Days Off</div>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#22d3ee' }}>{stats.maxStreak}</div>
              <div style={styles.statLabel}>Max Streak</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div style={styles.mainGrid}>

          {/* Sidebar Controls */}
          <div style={styles.leftPanel}>

            {/* Days Slider */}
            <div style={styles.card}>
              <div style={styles.controlLabel}>
                <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Briefcase size={16} color="#94a3b8" /> Available Days
                </span>
                <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{vacationDays}</span>
              </div>
              <input
                type="range" min="0" max="35"
                value={vacationDays}
                onChange={(e) => setVacationDays(Number(e.target.value))}
                style={styles.rangeInput}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', marginTop: '5px', fontFamily: 'monospace' }}>
                <span>0</span><span>35</span>
              </div>
            </div>

            {/* Strategies */}
            <div>
              <div style={{ ...styles.controlLabel, paddingLeft: '5px' }}>
                <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Layers size={16} color="#94a3b8" /> Strategy
                </span>
              </div>

              <button
                onClick={() => setStrategy('bridge')}
                style={styles.strategyBtn(strategy === 'bridge', '#10b981')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '700' }}>Bridge Builder</span>
                  <Coffee size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Connects holidays for efficiency</div>
              </button>

              <button
                onClick={() => setStrategy('long_haul')}
                style={styles.strategyBtn(strategy === 'long_haul', '#22d3ee')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '700' }}>Long Haul</span>
                  <Globe size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Maximize one continuous trip</div>
              </button>

              <button
                onClick={() => setStrategy('balanced')}
                style={styles.strategyBtn(strategy === 'balanced', '#a855f7')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '700' }}>Balanced Life</span>
                  <Sun size={18} />
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Periodic breaks throughout the year</div>
              </button>
            </div>

            {/* Legend */}
            <div style={{ ...styles.card, padding: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }}></div>Vacation</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 8, height: 8, background: '#8b5cf6', borderRadius: '4px' }}></div>Holiday</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 8, height: 8, background: 'rgba(30, 41, 59, 0.4)', borderRadius: '4px' }}></div>Weekend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 8, height: 8, border: '1px solid #334155', borderRadius: '4px' }}></div>Workday</div>
              </div>
            </div>

          </div>

          {/* Calendar Grid */}
          <div style={styles.calendarContainer}>
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

            <div style={styles.monthsGrid}>
              {MONTHS.map((monthName, mIdx) => {
                const monthDays = allDates.filter(d => d.getMonth() === mIdx);
                const startDay = monthDays[0].getDay();

                return (
                  <div key={monthName} style={styles.monthBlock}>
                    <div style={styles.monthTitle}>{monthName}</div>
                    <div style={styles.daysGrid}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} style={styles.dayHeader}>{d}</div>
                      ))}

                      {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`pad-${i}`} />
                      ))}

                      {monthDays.map(date => {
                        const dStr = formatDate(date);
                        const type = getDayType(date);
                        const holiday = HOLIDAYS.find(h => h.date === dStr);
                        const isVacation = selectedVacationDates.has(dStr);
                        const isHovered = hoveredDate && hoveredDate.dateStr === dStr;

                        return (
                          <div
                            key={dStr}
                            onMouseEnter={() => setHoveredDate({ date, type, holidayName: holiday?.name, dateStr: dStr })}
                            onMouseLeave={() => setHoveredDate(null)}
                            style={styles.dayCell(type, isVacation, isHovered)}
                            title={holiday ? holiday.name : undefined}
                          >
                            {date.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Completion30;
