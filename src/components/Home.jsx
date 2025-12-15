import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const promptLinks = {
  1: {
    name: 'Stockfish Chess',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-1-stockfish-chess',
  },
  2: {
    name: 'Double Lines',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-2-double-lines',
  },
  3: {
    name: 'Bouncy Form',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-3-bouncy-form',
  },
  4: {
    name: 'Encrypted Thread',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-4-encrypted-thread',
  },
  5: {
    name: 'Copy Pasta',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-5-copy-pasta',
  },
  6: {
    name: 'Pretty Shape',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-6-pretty-shape',
  },
  7: {
    name: 'Scores Timeline',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-7-scores-timeline',
  },
  8: {
    name: 'Ultimate Tic-Tac-Toe',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-8-ultimate-tic-tac-toe',
  },
  9: {
    name: 'Dragon Ball',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-9-dragon-ball',
  },
  10: {
    name: 'Password Generator',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-10-password-generator',
  },
  11: {
    name: 'Mini Code Golf',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-11-mini-code-golf',
  },
  12: {
    name: 'Fools Cursor',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-12-fools-cursor',
  },
  13: {
    name: '3-Body Eclipse',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-13-three-body-eclipse',
  },
  14: {
    name: 'Lightbulb Coin',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-14-lightbulb-coin',
  },
  15: {
    name: 'Cactus Generator',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-15-cactus-generator',
  },
  16: {
    name: 'Branded QRCode',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-16-branded-qrcode',
  },
  17: { name: 'Challenge 17', url: 'https://github.com' },
  18: { name: 'Challenge 18', url: 'https://github.com' },
  19: { name: 'Challenge 19', url: 'https://github.com' },
  20: { name: 'Challenge 20', url: 'https://github.com' },
  21: { name: 'Challenge 21', url: 'https://github.com' },
  22: { name: 'Challenge 22', url: 'https://github.com' },
  23: { name: 'Challenge 23', url: 'https://github.com' },
  24: { name: 'Challenge 24', url: 'https://github.com' },
  25: { name: 'Challenge 25', url: 'https://github.com' },
  26: { name: 'Challenge 26', url: 'https://github.com' },
  27: { name: 'Challenge 27', url: 'https://github.com' },
  28: { name: 'Challenge 28', url: 'https://github.com' },
  29: { name: 'Challenge 29', url: 'https://github.com' },
  30: { name: 'Challenge 30', url: 'https://github.com' },
  31: { name: 'Challenge 31', url: 'https://github.com' },
  32: { name: 'Challenge 32', url: 'https://github.com' },
  33: { name: 'Challenge 33', url: 'https://github.com' },
  34: { name: 'Challenge 34', url: 'https://github.com' },
  35: { name: 'Challenge 35', url: 'https://github.com' },
  36: { name: 'Challenge 36', url: 'https://github.com' },
};

const humanReviewLinks = {
  1: 'Both failed spectacularly.',
  2: "Gemini3 works well, Opus 4.5 doesn't achieve the goal",
  3: 'Both failed - results are underwheliming',
  4: "Gemini3 works well, Opus 4.5 doesn't achieve the goal",
  5: "I don't think either did a good job",
  6: 'Both did fairly good job!',
  7: 'Both did quite terrible job',
  8: 'Opus 4.5 implementation is much better',
  9: 'Gemini3 implementation is much better',
  10: 'Opus 4.5 provided better UI',
  11: 'Gemini3 implementation is smaller, bu Opus 4.5 is better',
  12: 'Mine winning submission was better 😛',
  13: 'Opus 4.5 implementation is better - at least it is fun',
  14: 'Free Money printer is ready',
  15: 'Opus 4.5 implementation is just so, so much better',
  16: 'Opus 4.5 implementation is much better',
  17: 'Not Implemented',
  18: 'Not Implemented',
  19: 'Not Implemented',
  20: 'Not Implemented',
  21: 'Not Implemented',
  22: 'Not Implemented',
  23: 'Not Implemented',
  24: 'Not Implemented',
  25: 'Not Implemented',
  26: 'Not Implemented',
  27: 'Not Implemented',
  28: 'Not Implemented',
  29: 'Not Implemented',
  30: 'Not Implemented',
  31: 'Not Implemented',
  32: 'Not Implemented',
  33: 'Not Implemented',
  34: 'Not Implemented',
  35: 'Not Implemented',
  36: 'Not Implemented',
};

const Home = () => {
  const gemini3Completions = Array.from({ length: 36 }, (_, i) => i + 1);
  const prompts = Array.from({ length: 36 }, (_, i) => i + 1);
  const humanReviews = Array.from({ length: 36 }, (_, i) => i + 1);
  const opus45Completions = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <div className="home-container">
      <h1 className="home-title">Algorithm Arena Reprompted</h1>

      <div className="columns-container">
        {/* Gemini 3 Column */}
        <div>
          <h2 className="column-header gemini-header">Gemini 3 Pro</h2>
          <div className="completions-list">
            {gemini3Completions.map((num) => (
              <Link key={num} to={`/gemini3/${num}`} className="completion-link gemini-link">
                Completion {num}
              </Link>
            ))}
          </div>
        </div>

        {/* Opus 4.5 Column */}
        <div>
          <h2 className="column-header opus-header">Opus 4.5</h2>
          <div className="completions-list">
            {opus45Completions.map((num) => (
              <Link key={num} to={`/opus45/${num}`} className="completion-link opus-link">
                Completion {num}
              </Link>
            ))}
          </div>
        </div>

        {/* Prompts Column */}
        <div>
          <h2 className="column-header prompts-header">Prompts</h2>
          <div className="completions-list">
            {prompts.map((num) => (
              <a
                key={num}
                href={promptLinks[num].url}
                target="_blank"
                rel="noopener noreferrer"
                className="completion-link prompts-link"
              >
                {promptLinks[num].name}
              </a>
            ))}
          </div>
        </div>

        {/* Human Review Column */}
        <div>
          <h2 className="column-header review-header">Human Review</h2>
          <div className="completions-list">
            {humanReviews.map((num) => (
              <div key={num} className="review-link">
                {humanReviewLinks[num]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
