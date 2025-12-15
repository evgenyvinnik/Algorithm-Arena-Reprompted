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
  17: {
    name: 'Karaoke Box',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-17-karaoke-box',
  },
  18: {
    name: 'VC Simulator',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-18-vc-simulator',
  },
  19: {
    name: 'Falling Breakout',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-19-falling-breakout',
  },
  20: {
    name: 'Extravagant Button',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-20-extravagant-button',
  },
  21: {
    name: 'Unconventional Clock',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-21-unconventional-clock',
  },
  22: {
    name: 'Concert Effects',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-22-concert-effects',
  },
  23: {
    name: 'Unconventional Randomness',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-23-unconventional-randomness',
  },
  24: {
    name: 'Stairs Animation',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-24-stairs-animations',
  },
  25: {
    name: 'Grid Group',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-25-grid-group',
  },
  26: {
    name: 'Loser Tournament',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-26-loser-tournament',
  },
  27: {
    name: 'Mouse Programming',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-27-mouse-programming',
  },
  28: {
    name: 'Airplane Loading',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-28-airplane-loading',
  },
  29: {
    name: 'Tech Cards',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-29-tech-cards',
  },
  30: {
    name: 'Vacation Planner',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-30-vacation-planner',
  },
  31: {
    name: 'Daily Ping',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-31-daily-ping',
  },
  32: {
    name: 'Press Record',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-32-press-record',
  },
  33: {
    name: 'ARC not AGI',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-33-arc-not-agi',
  },
  34: {
    name: 'Mini Minecraft',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-34-mini-minecraft',
  },
  35: {
    name: 'Baseball Reflex',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-35-baseball-reflex',
  },
  36: {
    name: 'Challenge Running',
    url: 'https://github.com/Algorithm-Arena/weekly-challenge-36-challenge-running',
  },
};

const humanReviewLinks = {
  1: 'Both failed spectacularly.',
  2: "Gemini 3 works well, Opus 4.5 doesn't achieve the goal",
  3: 'Both failed - results are underwheliming',
  4: "Gemini 3 works well, Opus 4.5 doesn't achieve the goal",
  5: "I don't think either did a good job",
  6: 'Both did fairly good job!',
  7: 'Both did quite terrible job',
  8: 'Opus 4.5 implementation is much better',
  9: 'Gemini 3 implementation is much better',
  10: 'Opus 4.5 provided better UI',
  11: 'Gemini 3 implementation is smaller, bu Opus 4.5 is better',
  12: 'Mine winning submission was better 😛',
  13: 'Opus 4.5 implementation is better - at least it is fun',
  14: 'Free Money printer is ready',
  15: 'Opus 4.5 implementation is just so, so much better',
  16: 'Opus 4.5 implementation is much better',
  17: 'Both meh, but Opus 4.5 is still somehow better',
  18: 'Opus 4.5 - better UI, Gemini 3 - more realistic numbers',
  19: 'Both made a working game, both games are boring',
  20: 'Opus 4.5 implementaiton rules!',
  21: 'Gemini 3 - my eyes 😭, Opus 4.5 - pretty',
  22: 'MY EYES! 😵‍💫 I would say Gemini 3 is better',
  23: 'I am no expert, but I enjoyed Opus 4.5 result more',
  24: 'Gemini 3 did it better',
  25: 'Not sure if any implementation is good',
  26: 'Opus 4.5 - Better UI (as usual)',
  27: 'Gemini 3 implementation is a disaster',
  28: 'Both failed spectacularly 😖',
  29: 'Opus 4.5 - much better job!',
  30: 'Opus 4.5 made an actually useful tool, Gemini 3 - too',
  31: 'Opus 4.5 - much better job!',
  32: 'Gemini 3 cannot make UI pretty unless being asked :(',
  33: 'Yet again, Gemini - disaster, Opus 4.5 - 👌',
  34: 'Opus 4.5 - this is Minecraft, Gemini 3 - 🗿',
  35: 'Opus 4.5 - unusable, Gemini 3 - also unusable',
  36: 'Result of the personal challenge - AGI is not here yet',
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
