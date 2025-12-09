import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import './App.css';

// Import all Gemini 3 completions
const gemini3Components = {};
for (let i = 1; i <= 36; i++) {
  gemini3Components[i] = React.lazy(() => import(`./components/gemini3/Completion${i}.jsx`));
}

// Import all Opus 4.5 completions
const opus45Components = {};
for (let i = 1; i <= 36; i++) {
  opus45Components[i] = React.lazy(() => import(`./components/opus45/Completion${i}.jsx`));
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <nav style={{ 
          padding: '10px 20px', 
          backgroundColor: '#282c34', 
          color: 'white',
          marginBottom: '20px'
        }}>
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            🏠 Home
          </Link>
        </nav>
        
        <React.Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Gemini 3 routes */}
            {Object.keys(gemini3Components).map((num) => {
              const Component = gemini3Components[num];
              return (
                <Route 
                  key={`gemini3-${num}`}
                  path={`/gemini3/${num}`} 
                  element={<Component />} 
                />
              );
            })}
            
            {/* Opus 4.5 routes */}
            {Object.keys(opus45Components).map((num) => {
              const Component = opus45Components[num];
              return (
                <Route 
                  key={`opus45-${num}`}
                  path={`/opus45/${num}`} 
                  element={<Component />} 
                />
              );
            })}
          </Routes>
        </React.Suspense>
      </div>
    </Router>
  );
}

export default App;
