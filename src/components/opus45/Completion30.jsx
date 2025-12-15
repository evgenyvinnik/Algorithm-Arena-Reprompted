import React, { useState, useMemo } from 'react';

// US Federal Holidays for 2025-2026
const federalHolidays = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day' },
  { date: '2025-02-17', name: "Presidents' Day" },
  { date: '2025-05-26', name: 'Memorial Day' },
  { date: '2025-06-19', name: 'Juneteenth' },
  { date: '2025-07-04', name: 'Independence Day' },
  { date: '2025-09-01', name: 'Labor Day' },
  { date: '2025-10-13', name: 'Columbus Day' },
  { date: '2025-11-11', name: 'Veterans Day' },
  { date: '2025-11-27', name: 'Thanksgiving Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day' },
  { date: '2026-02-16', name: "Presidents' Day" },
  { date: '2026-05-25', name: 'Memorial Day' },
  { date: '2026-06-19', name: 'Juneteenth' },
  { date: '2026-07-03', name: 'Independence Day (Observed)' },
  { date: '2026-09-07', name: 'Labor Day' },
  { date: '2026-10-12', name: 'Columbus Day' },
  { date: '2026-11-11', name: 'Veterans Day' },
  { date: '2026-11-26', name: 'Thanksgiving Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
];

const holidayDates = new Set(federalHolidays.map((h) => h.date));
const holidayMap = Object.fromEntries(federalHolidays.map((h) => [h.date, h.name]));

// Utility functions
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isHoliday = (dateStr) => holidayDates.has(dateStr);

// Calculate vacation opportunities around holidays
const findVacationOpportunities = (startDate, endDate) => {
  const opportunities = [];

  federalHolidays.forEach((holiday) => {
    const holidayDate = parseDate(holiday.date);
    if (holidayDate < startDate || holidayDate > endDate) return;

    const dayOfWeek = holidayDate.getDay();

    // Find surrounding weekends and calculate potential long breaks
    const scenarios = [];

    // Scenario: Take days before holiday to connect to previous weekend
    if (dayOfWeek >= 2 && dayOfWeek <= 5) {
      // Tuesday to Friday
      let daysNeeded = 0;
      let totalDaysOff = 1; // The holiday itself
      const vacationDays = [];

      // Count backwards to previous weekend
      for (let i = 1; i <= dayOfWeek - 1; i++) {
        const checkDate = addDays(holidayDate, -i);
        const checkStr = formatDate(checkDate);
        if (!isWeekend(checkDate) && !isHoliday(checkStr)) {
          daysNeeded++;
          vacationDays.push(checkStr);
        }
        totalDaysOff++;
      }
      // Add the weekend
      totalDaysOff += 2;

      if (daysNeeded > 0 && daysNeeded <= 5) {
        scenarios.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          vacationDaysNeeded: daysNeeded,
          totalDaysOff,
          efficiency: totalDaysOff / daysNeeded,
          vacationDays,
          description: `Take ${daysNeeded} day(s) before ${holiday.name} for a ${totalDaysOff}-day break`,
        });
      }
    }

    // Scenario: Take days after holiday to connect to next weekend
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      // Monday to Thursday
      let daysNeeded = 0;
      let totalDaysOff = 1; // The holiday itself
      const vacationDays = [];

      // Count forwards to next weekend
      for (let i = 1; i <= 5 - dayOfWeek; i++) {
        const checkDate = addDays(holidayDate, i);
        const checkStr = formatDate(checkDate);
        if (!isWeekend(checkDate) && !isHoliday(checkStr)) {
          daysNeeded++;
          vacationDays.push(checkStr);
        }
        totalDaysOff++;
      }
      // Add the weekend
      totalDaysOff += 2;

      if (daysNeeded > 0 && daysNeeded <= 5) {
        scenarios.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          vacationDaysNeeded: daysNeeded,
          totalDaysOff,
          efficiency: totalDaysOff / daysNeeded,
          vacationDays,
          description: `Take ${daysNeeded} day(s) after ${holiday.name} for a ${totalDaysOff}-day break`,
        });
      }
    }

    // Scenario: Bridge between holiday and weekend (both directions)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      let daysNeededBefore = 0;
      let daysNeededAfter = 0;
      const vacationDays = [];
      let totalDaysOff = 1;

      // Count to previous weekend
      for (let i = 1; i < dayOfWeek; i++) {
        const checkDate = addDays(holidayDate, -i);
        const checkStr = formatDate(checkDate);
        if (!isWeekend(checkDate) && !isHoliday(checkStr)) {
          daysNeededBefore++;
          vacationDays.push(checkStr);
        }
        totalDaysOff++;
      }
      totalDaysOff += 2; // Previous weekend

      // Count to next weekend
      for (let i = 1; i <= 5 - dayOfWeek; i++) {
        const checkDate = addDays(holidayDate, i);
        const checkStr = formatDate(checkDate);
        if (!isWeekend(checkDate) && !isHoliday(checkStr)) {
          daysNeededAfter++;
          vacationDays.push(checkStr);
        }
        totalDaysOff++;
      }
      totalDaysOff += 2; // Next weekend

      const totalNeeded = daysNeededBefore + daysNeededAfter;
      if (totalNeeded > 0 && totalNeeded <= 5) {
        scenarios.push({
          holidayName: holiday.name,
          holidayDate: holiday.date,
          vacationDaysNeeded: totalNeeded,
          totalDaysOff,
          efficiency: totalDaysOff / totalNeeded,
          vacationDays,
          description: `Take ${totalNeeded} day(s) around ${holiday.name} for a ${totalDaysOff}-day break`,
        });
      }
    }

    opportunities.push(...scenarios);
  });

  // Sort by efficiency (most days off per vacation day used)
  return opportunities.sort((a, b) => b.efficiency - a.efficiency);
};

// Generate optimal vacation plan
const generateVacationPlan = (vacationDays, startDate, endDate) => {
  const opportunities = findVacationOpportunities(startDate, endDate);
  const selectedVacations = [];
  const usedDates = new Set();
  let remainingDays = vacationDays;

  // Greedy algorithm: pick highest efficiency opportunities first
  for (const opp of opportunities) {
    if (remainingDays <= 0) break;
    if (opp.vacationDaysNeeded > remainingDays) continue;

    // Check if any vacation days overlap
    const hasOverlap = opp.vacationDays.some((d) => usedDates.has(d));
    if (hasOverlap) continue;

    selectedVacations.push(opp);
    opp.vacationDays.forEach((d) => usedDates.add(d));
    remainingDays -= opp.vacationDaysNeeded;
  }

  // If we still have days left, suggest standalone weeks
  if (remainingDays >= 5) {
    // Find a good week that doesn't overlap
    let current = new Date(startDate);
    while (current < endDate && remainingDays >= 5) {
      // Find next Monday
      while (current.getDay() !== 1 && current < endDate) {
        current = addDays(current, 1);
      }

      const weekDays = [];
      let canUse = true;
      for (let i = 0; i < 5; i++) {
        const day = addDays(current, i);
        const dayStr = formatDate(day);
        if (usedDates.has(dayStr) || isHoliday(dayStr) || isWeekend(day) || day > endDate) {
          canUse = false;
          break;
        }
        weekDays.push(dayStr);
      }

      if (canUse && weekDays.length === 5) {
        selectedVacations.push({
          holidayName: 'Full Week Off',
          holidayDate: weekDays[0],
          vacationDaysNeeded: 5,
          totalDaysOff: 9,
          efficiency: 1.8,
          vacationDays: weekDays,
          description: `Take a full week off starting ${weekDays[0]} for 9 consecutive days off`,
        });
        weekDays.forEach((d) => usedDates.add(d));
        remainingDays -= 5;
      }

      current = addDays(current, 7);
    }
  }

  // Use remaining days for long weekends
  while (remainingDays > 0) {
    let found = false;
    let current = new Date(startDate);

    while (current < endDate && !found) {
      // Look for Friday or Monday that's not used
      if (current.getDay() === 5) {
        // Friday
        const dayStr = formatDate(current);
        if (!usedDates.has(dayStr) && !isHoliday(dayStr)) {
          selectedVacations.push({
            holidayName: 'Long Weekend',
            holidayDate: dayStr,
            vacationDaysNeeded: 1,
            totalDaysOff: 3,
            efficiency: 3,
            vacationDays: [dayStr],
            description: `Take Friday ${dayStr} off for a 3-day weekend`,
          });
          usedDates.add(dayStr);
          remainingDays--;
          found = true;
        }
      } else if (current.getDay() === 1) {
        // Monday
        const dayStr = formatDate(current);
        if (!usedDates.has(dayStr) && !isHoliday(dayStr)) {
          selectedVacations.push({
            holidayName: 'Long Weekend',
            holidayDate: dayStr,
            vacationDaysNeeded: 1,
            totalDaysOff: 3,
            efficiency: 3,
            vacationDays: [dayStr],
            description: `Take Monday ${dayStr} off for a 3-day weekend`,
          });
          usedDates.add(dayStr);
          remainingDays--;
          found = true;
        }
      }
      current = addDays(current, 1);
    }

    if (!found) break;
  }

  return {
    selectedVacations: selectedVacations.sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)),
    usedDates,
    remainingDays,
    totalDaysOff: selectedVacations.reduce((sum, v) => sum + v.totalDaysOff, 0),
    totalVacationDaysUsed: vacationDays - remainingDays,
  };
};

// Calendar component
const Calendar = ({ year, month, plan }) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthName = firstDay.toLocaleString('default', { month: 'long' });

  const days = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(<div key={`pad-${i}`} style={styles.emptyDay}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const weekend = isWeekend(date);
    const holiday = isHoliday(dateStr);
    const vacation = plan?.usedDates?.has(dateStr);

    let dayStyle = { ...styles.day };
    let label = null;

    if (vacation) {
      dayStyle = { ...dayStyle, ...styles.vacationDay };
      label = '🏖️';
    } else if (holiday) {
      dayStyle = { ...dayStyle, ...styles.holidayDay };
      label = '🎉';
    } else if (weekend) {
      dayStyle = { ...dayStyle, ...styles.weekendDay };
    }

    days.push(
      <div key={day} style={dayStyle} title={holiday ? holidayMap[dateStr] : ''}>
        <span>{day}</span>
        {label && <span style={styles.dayLabel}>{label}</span>}
      </div>
    );
  }

  return (
    <div style={styles.calendar}>
      <h3 style={styles.monthTitle}>
        {monthName} {year}
      </h3>
      <div style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={styles.weekDay}>
            {d}
          </div>
        ))}
      </div>
      <div style={styles.daysGrid}>{days}</div>
    </div>
  );
};

const Completion30 = () => {
  const [vacationDays, setVacationDays] = useState(15);
  const [startYear, setStartYear] = useState(2025);

  const startDate = useMemo(() => new Date(startYear, 0, 1), [startYear]);
  const endDate = useMemo(() => new Date(startYear, 11, 31), [startYear]);

  const plan = useMemo(() => {
    return generateVacationPlan(vacationDays, startDate, endDate);
  }, [vacationDays, startDate, endDate]);

  const months = useMemo(() => {
    const result = [];
    for (let m = 0; m < 12; m++) {
      result.push({ year: startYear, month: m });
    }
    return result;
  }, [startYear]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏝️ Vacation Planner</h1>
      <p style={styles.subtitle}>
        Optimize your time off by strategically planning vacations around holidays!
      </p>

      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Vacation Days Available:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={vacationDays}
            onChange={(e) => setVacationDays(Math.max(1, parseInt(e.target.value) || 1))}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Year:</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            style={styles.select}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{plan.totalVacationDaysUsed}</div>
          <div style={styles.summaryLabel}>Vacation Days Used</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{plan.totalDaysOff}</div>
          <div style={styles.summaryLabel}>Total Days Off</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>
            {plan.totalVacationDaysUsed > 0
              ? (plan.totalDaysOff / plan.totalVacationDaysUsed).toFixed(1)
              : 0}
            x
          </div>
          <div style={styles.summaryLabel}>Efficiency</div>
        </div>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendBox, ...styles.weekendDay }}></span> Weekend
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendBox, ...styles.holidayDay }}></span> 🎉 Holiday
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.legendBox, ...styles.vacationDay }}></span> 🏖️ Vacation
        </span>
      </div>

      <div style={styles.calendarsGrid}>
        {months.map(({ year, month }) => (
          <Calendar key={`${year}-${month}`} year={year} month={month} plan={plan} />
        ))}
      </div>

      <div style={styles.planDetails}>
        <h2 style={styles.planTitle}>📅 Suggested Vacation Plan</h2>
        {plan.selectedVacations.length === 0 ? (
          <p>No vacations planned yet. Increase your available vacation days!</p>
        ) : (
          <div style={styles.vacationList}>
            {plan.selectedVacations.map((vacation, index) => (
              <div key={index} style={styles.vacationItem}>
                <div style={styles.vacationHeader}>
                  <span style={styles.vacationName}>{vacation.holidayName}</span>
                  <span style={styles.vacationEfficiency}>
                    {vacation.vacationDaysNeeded} PTO → {vacation.totalDaysOff} days off
                  </span>
                </div>
                <p style={styles.vacationDescription}>{vacation.description}</p>
                <div style={styles.vacationDates}>
                  <strong>Take off:</strong>{' '}
                  {vacation.vacationDays.map((d) => (
                    <span key={d} style={styles.dateTag}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.tips}>
        <h3>💡 Tips for Maximizing Your Time Off</h3>
        <ul>
          <li>Book vacations around federal holidays to extend your time off</li>
          <li>Monday or Friday off gives you a 3-day weekend with just 1 PTO day</li>
          <li>Plan early to get better deals on flights and accommodations</li>
          <li>Consider shoulder seasons (spring/fall) for fewer crowds and better prices</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1.1rem',
    marginBottom: '24px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    fontSize: '16px',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
    width: '80px',
  },
  select: {
    padding: '8px 12px',
    fontSize: '16px',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
  },
  summary: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: '16px 32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e40af',
  },
  summaryLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
  },
  legendBox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  calendarsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  monthTitle: {
    textAlign: 'center',
    marginBottom: '12px',
    color: '#1e293b',
  },
  weekDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '8px',
  },
  weekDay: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.8rem',
    color: '#64748b',
    padding: '4px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  day: {
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    borderRadius: '6px',
    backgroundColor: '#fff',
    position: 'relative',
    cursor: 'default',
  },
  emptyDay: {
    aspectRatio: '1',
  },
  weekendDay: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  holidayDay: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '600',
  },
  vacationDay: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: '600',
    border: '2px solid #3b82f6',
  },
  dayLabel: {
    fontSize: '0.6rem',
    position: 'absolute',
    bottom: '2px',
  },
  planDetails: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  planTitle: {
    color: '#1e293b',
    marginBottom: '16px',
  },
  vacationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  vacationItem: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '16px',
    borderLeft: '4px solid #3b82f6',
  },
  vacationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  vacationName: {
    fontWeight: '600',
    fontSize: '1.1rem',
    color: '#1e40af',
  },
  vacationEfficiency: {
    backgroundColor: '#dbeafe',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    color: '#1e40af',
  },
  vacationDescription: {
    color: '#475569',
    margin: '0 0 12px 0',
  },
  vacationDates: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  dateTag: {
    backgroundColor: '#e0e7ff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#3730a3',
  },
  tips: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
};

export default Completion30;
