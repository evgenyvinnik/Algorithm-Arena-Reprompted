import React, { useState, useCallback } from 'react';

// Sample submissions data
const SAMPLE_SUBMISSIONS = [
  {
    id: 1,
    name: 'Interactive Audio Visualizer',
    author: 'johndoe',
    githubUrl: 'https://github.com/johndoe/audio-viz',
    twitterHandle: '@johndoe_dev',
    videoUrl: 'https://youtube.com/watch?v=example1',
    blurb: '',
    rank: 1,
    prize: 150,
  },
  {
    id: 2,
    name: 'Real-time Collaboration Tool',
    author: 'janecoder',
    githubUrl: 'https://github.com/janecoder/collab-tool',
    twitterHandle: '@janecodes',
    videoUrl: 'https://youtube.com/watch?v=example2',
    blurb: '',
    rank: 2,
    prize: 100,
  },
  {
    id: 3,
    name: 'AI Powered Drawing Assistant',
    author: 'aiartist',
    githubUrl: 'https://github.com/aiartist/draw-ai',
    twitterHandle: '@aiartist_',
    videoUrl: 'https://youtube.com/watch?v=example3',
    blurb: '',
    rank: 3,
    prize: 50,
  },
  {
    id: 4,
    name: 'Particle Physics Simulator',
    author: 'physicsdev',
    githubUrl: 'https://github.com/physicsdev/particles',
    twitterHandle: '',
    videoUrl: 'attachment.mp4',
    blurb: '',
    rank: 4,
    prize: 0,
  },
];

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #f9ca24, #f0932b, #eb4d4b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    textShadow: '0 0 30px rgba(249, 202, 36, 0.3)',
  },
  subtitle: {
    color: '#a4b0be',
    fontSize: '18px',
    marginTop: '10px',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    padding: '25px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  submissionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'grab',
  },
  submissionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  rankBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#fff',
  },
  submissionName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginLeft: '12px',
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#a4b0be',
    fontSize: '13px',
    marginBottom: '10px',
  },
  blurbInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  prizeInput: {
    width: '80px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#4ade80',
    fontSize: '14px',
    fontWeight: 'bold',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  outputArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '12px',
    padding: '20px',
    fontFamily: 'Monaco, monospace',
    fontSize: '13px',
    color: '#e0e0e0',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: '400px',
    overflowY: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  inactiveTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#a4b0be',
  },
  paymentSummary: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(74, 222, 128, 0.3)',
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  videoStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#a4b0be',
    marginTop: '8px',
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    color: '#a4b0be',
    fontSize: '13px',
    marginBottom: '6px',
  },
  textInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  challengeForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
};

const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return 'linear-gradient(135deg, #f9ca24 0%, #f0932b 100%)';
    case 2:
      return 'linear-gradient(135deg, #a4b0be 0%, #636e72 100%)';
    case 3:
      return 'linear-gradient(135deg, #cd6133 0%, #8b4513 100%)';
    default:
      return 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
  }
};

const SubmissionItem = ({ submission, onUpdate, onDragStart, onDragOver, onDrop }) => {
  return (
    <div
      style={{
        ...styles.submissionItem,
        borderLeft: `4px solid ${submission.rank <= 3 ? ['#f9ca24', '#a4b0be', '#cd6133'][submission.rank - 1] : '#4a5568'}`,
      }}
      draggable
      onDragStart={(e) => onDragStart(e, submission.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, submission.id)}
    >
      <div style={styles.submissionHeader}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ ...styles.rankBadge, background: getRankColor(submission.rank) }}>
            #{submission.rank}
          </div>
          <span style={styles.submissionName}>{submission.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#a4b0be', fontSize: '14px' }}>$</span>
          <input
            type="number"
            value={submission.prize}
            onChange={(e) => onUpdate(submission.id, 'prize', parseInt(e.target.value) || 0)}
            style={styles.prizeInput}
            min="0"
            step="10"
          />
        </div>
      </div>
      <div style={styles.authorInfo}>
        <span>👤 {submission.author}</span>
        {submission.twitterHandle && <span>🐦 {submission.twitterHandle}</span>}
        <a
          href={submission.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#60a5fa', textDecoration: 'none' }}
        >
          📦 GitHub
        </a>
      </div>
      <input
        type="text"
        placeholder="Add your blurb about this submission..."
        value={submission.blurb}
        onChange={(e) => onUpdate(submission.id, 'blurb', e.target.value)}
        style={styles.blurbInput}
      />
      <div style={styles.videoStatus}>
        <span>🎥 {submission.videoUrl.includes('youtube') ? 'YouTube' : 'Attached'}</span>
        <span style={{ color: '#4ade80' }}>• Ready for processing</span>
      </div>
    </div>
  );
};

const Completion36 = () => {
  const [submissions, setSubmissions] = useState(SAMPLE_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState('twitter');
  const [challengeInfo, setChallengeInfo] = useState({
    number: 36,
    title: 'Challenge Running',
    totalPrize: 300,
    boldBlurb: 'Automate challenge result publishing',
    explanation: 'Build a tool to help publish weekly challenge results across multiple platforms',
    socialBlurb: 'This week: automate the boring stuff! 🚀',
  });
  const [videoProcessing, setVideoProcessing] = useState({});
  const [draggedId, setDraggedId] = useState(null);

  const handleUpdateSubmission = useCallback((id, field, value) => {
    setSubmissions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)));
  }, []);

  const handleDragStart = useCallback((e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      if (draggedId === targetId) return;

      setSubmissions((prev) => {
        const newSubs = [...prev];
        const draggedIndex = newSubs.findIndex((s) => s.id === draggedId);
        const targetIndex = newSubs.findIndex((s) => s.id === targetId);

        const [dragged] = newSubs.splice(draggedIndex, 1);
        newSubs.splice(targetIndex, 0, dragged);

        return newSubs.map((sub, idx) => ({ ...sub, rank: idx + 1 }));
      });
      setDraggedId(null);
    },
    [draggedId]
  );

  const generateTwitterThread = () => {
    const rankedSubs = [...submissions].sort((a, b) => a.rank - b.rank);
    let thread = `🏆 Weekly Challenge #${challengeInfo.number} - ${challengeInfo.title} Results!\n\n`;
    thread += `${challengeInfo.boldBlurb}\n`;
    thread += `${challengeInfo.explanation}\n\n`;
    thread += `Prize pool: $${challengeInfo.totalPrize}\n\n`;
    thread += `Thread with all the amazing submissions 🧵👇\n\n---\n\n`;

    rankedSubs.forEach((sub, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';
      const handle = sub.twitterHandle || `@${sub.author}`;
      thread += `${medal} #${idx + 1}: "${sub.name}" by ${handle}\n`;
      if (sub.blurb) thread += `${sub.blurb}\n`;
      thread += `${sub.githubUrl}\n`;
      if (sub.prize > 0) thread += `💰 Prize: $${sub.prize}\n`;
      thread += `\n---\n\n`;
    });

    thread += `Thanks to everyone who participated! 🙏\n`;
    thread += `New challenge dropping soon... stay tuned! 🔥`;

    return thread;
  };

  const generateThreadsPost = () => {
    const rankedSubs = [...submissions].sort((a, b) => a.rank - b.rank);
    let post = `🏆 Weekly Challenge #${challengeInfo.number} Results!\n\n`;
    post += `${challengeInfo.title}\n`;
    post += `${challengeInfo.socialBlurb}\n\n`;

    rankedSubs.slice(0, 3).forEach((sub, idx) => {
      const medal = ['🥇', '🥈', '🥉'][idx];
      post += `${medal} ${sub.name} by ${sub.author}\n`;
      if (sub.blurb) post += `   "${sub.blurb}"\n`;
    });

    if (rankedSubs.length > 3) {
      post += `\n+ ${rankedSubs.length - 3} more amazing submissions!\n`;
    }

    post += `\nFull results & videos in thread below 👇`;

    return post;
  };

  const generateReadmeUpdate = () => {
    const rankedSubs = [...submissions].sort((a, b) => a.rank - b.rank);
    let readme = `## Challenge #${challengeInfo.number} - ${challengeInfo.title}\n\n`;
    readme += `### Winners\n\n`;

    rankedSubs.forEach((sub, idx) => {
      const position =
        idx === 0
          ? '🥇 Winner'
          : idx === 1
            ? '🥈 2nd Place'
            : idx === 2
              ? '🥉 3rd Place'
              : `#${idx + 1}`;
      readme += `#### ${position}: ${sub.name}\n`;
      readme += `- **Author:** [@${sub.author}](https://github.com/${sub.author})\n`;
      readme += `- **Repository:** [${sub.name}](${sub.githubUrl})\n`;
      if (sub.blurb) readme += `- **Judge's note:** ${sub.blurb}\n`;
      if (sub.prize > 0) readme += `- **Prize:** $${sub.prize}\n`;
      readme += `\n`;
    });

    return readme;
  };

  const generatePaymentList = () => {
    const winners = submissions.filter((s) => s.prize > 0).sort((a, b) => b.prize - a.prize);
    let list = `💰 Payment Summary for Challenge #${challengeInfo.number}\n`;
    list += `${'='.repeat(50)}\n\n`;

    let total = 0;
    winners.forEach((sub) => {
      list += `${sub.author.padEnd(20)} ${sub.twitterHandle.padEnd(15)} $${sub.prize}\n`;
      total += sub.prize;
    });

    list += `${'='.repeat(50)}\n`;
    list += `Total: $${total}\n\n`;
    list += `Action items:\n`;
    winners.forEach((sub) => {
      list += `[ ] Send $${sub.prize} to ${sub.author}\n`;
    });

    return list;
  };

  const handleProcessVideos = () => {
    submissions.forEach((sub) => {
      setVideoProcessing((prev) => ({ ...prev, [sub.id]: { status: 'processing', progress: 0 } }));

      // Simulate video processing
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setVideoProcessing((prev) => ({
            ...prev,
            [sub.id]: { status: 'complete', progress: 100 },
          }));
        } else {
          setVideoProcessing((prev) => ({
            ...prev,
            [sub.id]: { status: 'processing', progress },
          }));
        }
      }, 500);
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getOutputContent = () => {
    switch (activeTab) {
      case 'twitter':
        return generateTwitterThread();
      case 'threads':
        return generateThreadsPost();
      case 'readme':
        return generateReadmeUpdate();
      case 'payments':
        return generatePaymentList();
      default:
        return '';
    }
  };

  const totalPrize = submissions.reduce((sum, sub) => sum + sub.prize, 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏃 Challenge Running Tool</h1>
        <p style={styles.subtitle}>Automate publishing results for Algorithm Arena challenges</p>
      </header>

      <div style={styles.mainContent}>
        {/* Challenge Info Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Challenge Information</h2>
          <div style={styles.challengeForm}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Challenge Number</label>
              <input
                type="number"
                value={challengeInfo.number}
                onChange={(e) =>
                  setChallengeInfo((prev) => ({ ...prev, number: parseInt(e.target.value) || 0 }))
                }
                style={styles.textInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Total Prize Pool ($)</label>
              <input
                type="number"
                value={challengeInfo.totalPrize}
                onChange={(e) =>
                  setChallengeInfo((prev) => ({
                    ...prev,
                    totalPrize: parseInt(e.target.value) || 0,
                  }))
                }
                style={styles.textInput}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Challenge Title</label>
              <input
                type="text"
                value={challengeInfo.title}
                onChange={(e) => setChallengeInfo((prev) => ({ ...prev, title: e.target.value }))}
                style={styles.textInput}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Bold Blurb (headline)</label>
              <input
                type="text"
                value={challengeInfo.boldBlurb}
                onChange={(e) =>
                  setChallengeInfo((prev) => ({ ...prev, boldBlurb: e.target.value }))
                }
                style={styles.textInput}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Explanation</label>
              <input
                type="text"
                value={challengeInfo.explanation}
                onChange={(e) =>
                  setChallengeInfo((prev) => ({ ...prev, explanation: e.target.value }))
                }
                style={styles.textInput}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Social Media Blurb</label>
              <input
                type="text"
                value={challengeInfo.socialBlurb}
                onChange={(e) =>
                  setChallengeInfo((prev) => ({ ...prev, socialBlurb: e.target.value }))
                }
                style={styles.textInput}
              />
            </div>
          </div>
        </div>

        {/* Video Processing Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎥 Video Processing</h2>
          <p style={{ color: '#a4b0be', marginBottom: '20px', fontSize: '14px' }}>
            Download and recompress videos for Twitter/Threads/Facebook (under 10MB)
          </p>
          <button
            style={{ ...styles.button, ...styles.primaryButton, marginBottom: '20px' }}
            onClick={handleProcessVideos}
          >
            🔄 Process All Videos
          </button>
          {submissions.map((sub) => (
            <div key={sub.id} style={{ marginBottom: '12px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}
              >
                <span style={{ color: '#fff', fontSize: '13px' }}>{sub.name}</span>
                <span style={{ color: '#a4b0be', fontSize: '12px' }}>
                  {videoProcessing[sub.id]?.status === 'complete'
                    ? '✅ Ready'
                    : videoProcessing[sub.id]?.status === 'processing'
                      ? '⏳ Processing...'
                      : '⏸️ Pending'}
                </span>
              </div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${videoProcessing[sub.id]?.progress || 0}%`,
                    background:
                      videoProcessing[sub.id]?.status === 'complete'
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : 'linear-gradient(90deg, #667eea, #764ba2)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submissions Card - Full Width */}
        <div style={{ ...styles.card, ...styles.fullWidth }}>
          <h2 style={styles.cardTitle}>
            🏅 Submissions{' '}
            <span style={{ fontSize: '14px', color: '#a4b0be', fontWeight: 'normal' }}>
              (drag to reorder)
            </span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {submissions.map((sub) => (
              <SubmissionItem
                key={sub.id}
                submission={sub}
                onUpdate={handleUpdateSubmission}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>

        {/* Output Generator Card - Full Width */}
        <div style={{ ...styles.card, ...styles.fullWidth }}>
          <h2 style={styles.cardTitle}>📤 Generate Output</h2>
          <div style={styles.tabContainer}>
            {[
              { id: 'twitter', label: '🐦 Twitter Thread' },
              { id: 'threads', label: '🧵 Threads Post' },
              { id: 'readme', label: '📄 README Update' },
              { id: 'payments', label: '💰 Payment List' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.activeTab : styles.inactiveTab),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={styles.outputArea}>{getOutputContent()}</div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={() => copyToClipboard(getOutputContent())}
            >
              📋 Copy to Clipboard
            </button>
            <button style={{ ...styles.button, ...styles.secondaryButton }}>
              💾 Download as File
            </button>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div style={{ ...styles.card, ...styles.fullWidth }}>
          <h2 style={styles.cardTitle}>💵 Payment Summary</h2>
          <div style={styles.paymentSummary}>
            {submissions
              .filter((s) => s.prize > 0)
              .sort((a, b) => b.prize - a.prize)
              .map((sub) => (
                <div key={sub.id} style={styles.paymentRow}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{sub.author}</span>
                    <span style={{ color: '#a4b0be', marginLeft: '10px', fontSize: '13px' }}>
                      ({sub.twitterHandle || 'No Twitter'})
                    </span>
                  </div>
                  <span
                    style={{
                      color: '#4ade80',
                      fontWeight: 'bold',
                      fontSize: '18px',
                    }}
                  >
                    ${sub.prize}
                  </span>
                </div>
              ))}
            <div
              style={{
                ...styles.paymentRow,
                borderBottom: 'none',
                marginTop: '10px',
                paddingTop: '15px',
                borderTop: '2px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
                Total Payout
              </span>
              <span
                style={{
                  color: '#4ade80',
                  fontWeight: 'bold',
                  fontSize: '24px',
                }}
              >
                ${totalPrize}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion36;
