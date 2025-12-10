import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const promptLinks = {
  1: "https://github.com/Algorithm-Arena/weekly-challenge-1-stockfish-chess",
  2: "https://github.com/Algorithm-Arena/weekly-challenge-2-double-lines",
  3: "https://github.com/Algorithm-Arena/weekly-challenge-3-bouncy-form",
  4: "https://github.com/Algorithm-Arena/weekly-challenge-4-encrypted-thread",
  5: "https://github.com",
  6: "https://github.com",
  7: "https://github.com",
  8: "https://github.com",
  9: "https://github.com",
  10: "https://github.com",
  11: "https://github.com",
  12: "https://github.com",
  13: "https://github.com",
  14: "https://github.com",
  15: "https://github.com",
  16: "https://github.com",
  17: "https://github.com",
  18: "https://github.com",
  19: "https://github.com",
  20: "https://github.com",
  21: "https://github.com",
  22: "https://github.com",
  23: "https://github.com",
  24: "https://github.com",
  25: "https://github.com",
  26: "https://github.com",
  27: "https://github.com",
  28: "https://github.com",
  29: "https://github.com",
  30: "https://github.com",
  31: "https://github.com",
  32: "https://github.com",
  33: "https://github.com",
  34: "https://github.com",
  35: "https://github.com",
  36: "https://github.com",
};

const Home = () => {
  const gemini3Completions = Array.from({ length: 36 }, (_, i) => i + 1);
  const prompts = Array.from({ length: 36 }, (_, i) => i + 1);
  const opus45Completions = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <div className="home-container">
      <h1 className="home-title">Algorithm Arena Reprompted</h1>

      <div className="columns-container">
        {/* Gemini 3 Column */}
        <div>
          <h2 className="column-header gemini-header">Gemini 3</h2>
          <div className="completions-list">
            {gemini3Completions.map((num) => (
              <Link
                key={num}
                to={`/gemini3/${num}`}
                className="completion-link gemini-link"
              >
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
                href={promptLinks[num]}
                target="_blank"
                rel="noopener noreferrer"
                className="completion-link prompts-link"
              >
                Challenge {num}
              </a>
            ))}
          </div>
        </div>

        {/* Opus 4.5 Column */}
        <div>
          <h2 className="column-header opus-header">Opus 4.5</h2>
          <div className="completions-list">
            {opus45Completions.map((num) => (
              <Link
                key={num}
                to={`/opus45/${num}`}
                className="completion-link opus-link"
              >
                Completion {num}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
