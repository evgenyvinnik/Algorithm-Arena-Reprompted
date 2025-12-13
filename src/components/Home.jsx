import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const promptLinks = {
  1: {
    name: "Stockfish Chess",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-1-stockfish-chess",
  },
  2: {
    name: "Double Lines",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-2-double-lines",
  },
  3: {
    name: "Bouncy Form",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-3-bouncy-form",
  },
  4: {
    name: "Encrypted Thread",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-4-encrypted-thread",
  },
  5: {
    name: "Copy Pasta",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-5-copy-pasta",
  },
  6: {
    name: "Pretty Shape",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-6-pretty-shape",
  },
  7: {
    name: "Scores Timeline",
    url: "https://github.com/Algorithm-Arena/weekly-challenge-7-scores-timeline",
  },
  8: { name: "Challenge 8", url: "https://github.com" },
  9: { name: "Challenge 9", url: "https://github.com" },
  10: { name: "Challenge 10", url: "https://github.com" },
  11: { name: "Challenge 11", url: "https://github.com" },
  12: { name: "Challenge 12", url: "https://github.com" },
  13: { name: "Challenge 13", url: "https://github.com" },
  14: { name: "Challenge 14", url: "https://github.com" },
  15: { name: "Challenge 15", url: "https://github.com" },
  16: { name: "Challenge 16", url: "https://github.com" },
  17: { name: "Challenge 17", url: "https://github.com" },
  18: { name: "Challenge 18", url: "https://github.com" },
  19: { name: "Challenge 19", url: "https://github.com" },
  20: { name: "Challenge 20", url: "https://github.com" },
  21: { name: "Challenge 21", url: "https://github.com" },
  22: { name: "Challenge 22", url: "https://github.com" },
  23: { name: "Challenge 23", url: "https://github.com" },
  24: { name: "Challenge 24", url: "https://github.com" },
  25: { name: "Challenge 25", url: "https://github.com" },
  26: { name: "Challenge 26", url: "https://github.com" },
  27: { name: "Challenge 27", url: "https://github.com" },
  28: { name: "Challenge 28", url: "https://github.com" },
  29: { name: "Challenge 29", url: "https://github.com" },
  30: { name: "Challenge 30", url: "https://github.com" },
  31: { name: "Challenge 31", url: "https://github.com" },
  32: { name: "Challenge 32", url: "https://github.com" },
  33: { name: "Challenge 33", url: "https://github.com" },
  34: { name: "Challenge 34", url: "https://github.com" },
  35: { name: "Challenge 35", url: "https://github.com" },
  36: { name: "Challenge 36", url: "https://github.com" },
};

const humanReviewLinks = {
  1: "Both failed spectacularly.",
  2: "Gemini3 works well, Opus 4.5 doesn't achieve the goal",
  3: "Both failed - results are underwheliming",
  4: "Gemini3 works well, Opus 4.5 doesn't achieve the goal",
  5: "I don't think either did a good job",
  6: "Both did fairly good job!",
  7: "Both did quite terrible job",
  8: "Not Implemented",
  9: "Not Implemented",
  10: "Not Implemented",
  11: "Not Implemented",
  12: "Not Implemented",
  13: "Not Implemented",
  14: "Not Implemented",
  15: "Not Implemented",
  16: "Not Implemented",
  17: "Not Implemented",
  18: "Not Implemented",
  19: "Not Implemented",
  20: "Not Implemented",
  21: "Not Implemented",
  22: "Not Implemented",
  23: "Not Implemented",
  24: "Not Implemented",
  25: "Not Implemented",
  26: "Not Implemented",
  27: "Not Implemented",
  28: "Not Implemented",
  29: "Not Implemented",
  30: "Not Implemented",
  31: "Not Implemented",
  32: "Not Implemented",
  33: "Not Implemented",
  34: "Not Implemented",
  35: "Not Implemented",
  36: "Not Implemented",
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
