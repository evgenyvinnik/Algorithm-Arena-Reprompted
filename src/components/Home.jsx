import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const gemini3Completions = Array.from({ length: 36 }, (_, i) => i + 1);
  const opus45Completions = Array.from({ length: 36 }, (_, i) => i + 1);

  return (
    <div className="home-container">
      <h1 className="home-title">Algorithm Arena Reprompted</h1>
      
      <div className="columns-container">
        {/* Gemini 3 Column */}
        <div>
          <h2 className="column-header gemini-header">
            Gemini 3
          </h2>
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
          <h2 className="column-header opus-header">
            Opus 4.5
          </h2>
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
