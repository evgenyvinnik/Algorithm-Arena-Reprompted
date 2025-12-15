# Algorithm-Arena-Reprompted

Algorithm-Arena questions achieved with prompts.

Based on challenges from [Algorithm Arena](https://github.com/Algorithm-Arena).

## Project Goal

This project set out to answer a simple question: **Can modern LLMs implement complete, working applications from a single prompt?**

Each week, [Algorithm Arena](https://github.com/Algorithm-Arena) publishes a programming challenge. Rather than solving these challenges manually, I gave two frontier LLMs — **Claude Opus 4.5** and **Gemini 3 Pro** — minimal prompts pointing to the challenge repositories and asked them to produce self-contained React components.

### What Was Tested

- **Zero-shot implementation**: Each LLM received only the challenge URL and a filename convention — no hand-holding, no iterative refinement.
- **End-to-end capability**: Challenges ranged from UI widgets and games to algorithmic puzzles, compression, cryptography, and 3D graphics.
- **Code quality & usability**: Beyond correctness, I evaluated whether the generated UIs were actually usable without further tweaking.

### Key Findings

| Aspect | Opus 4.5 | Gemini 3 Pro |
|--------|----------|--------------|
| Functional correctness | Generally high | Generally high |
| UI polish | Richer, more styled | Minimal / bare-bones |
| Self-containment | Good | Good |
| Edge-case handling | Variable | Variable |

- Both models successfully produced **72 working React components** (36 each) across 36 distinct challenges.
- Opus 4.5 tended to generate more visually polished interfaces out of the box.
- Gemini 3 Pro often delivered correct logic but with spartan UIs, prompting me to later request "nice UI" explicitly.
- Neither model required multiple turns of debugging for the majority of challenges — most outputs ran on the first try.

### Conclusion

Modern LLMs can translate a problem description into a functioning, deployable application with remarkable reliability. The bottleneck is no longer "can it code?" but "does the output meet your taste?" — a matter of prompt tuning and model personality rather than fundamental capability.

## Prompt Format

Each challenge was given to the LLMs using the following prompt format:

```
Implement challenge as described on

https://github.com/Algorithm-Arena/weekly-challenge-{N}-{challenge-name}

Make sure to put everything into Completion{N}.jsx file
```

For example, for challenge #4:

```
Implement challenge as described on

https://github.com/Algorithm-Arena/weekly-challenge-4-encrypted-thread

Make sure to put everything into Completion4.jsx file
```

The LLMs were expected to read the challenge description from the GitHub repository and implement a complete solution as a single React component.

## Notes
Gemini 3 quickly converged on giving me the most barebone UI possible, to the point that output was impossible to use.
I eventually gave up and started to ask both LLMs to give me "nice UI" (I know - ambiguous request, but still)

## Tools Used

- **Opus 4.5 completions**: GitHub Copilot + Claude Opus 4.5 (Preview)
- **Gemini 3 completions**: Google AI Studio + Gemini 3 Pro (High)

## Features

- ⚡ Vite + React 19
- 🔧 React Compiler for automatic optimization
- 🎯 React Router with Hash Routing
- 📦 Pure JavaScript (no TypeScript)
- 🚀 GitHub Pages deployment
- 📊 Four-column comparison layout:
  - **Gemini 3** - AI completions from Gemini 3 model
  - **Opus 4.5** - AI completions from Claude Opus 4.5 model
  - **Prompts** - Links to original Algorithm Arena challenge repositories
  - **Human Review** - Personal opinions and evaluations
- 📝 72 completion components (36 for each model)

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── gemini3/         # 36 Gemini 3 completion components
│   │   ├── opus45/          # 36 Opus 4.5 completion components
│   │   └── Home.jsx         # Home page with four-column layout
│   ├── App.jsx              # Main app with routing configuration
│   └── main.jsx             # Entry point
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions workflow for deployment
└── vite.config.js           # Vite configuration with React Compiler
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Deploy to GitHub Pages

The project is configured to automatically deploy to GitHub Pages on push to main branch via GitHub Actions.

Alternatively, you can manually deploy using:

```bash
npm run deploy
```

## Technologies

- **Vite** - Fast build tool and dev server
- **React 19** - Latest React version with concurrent features
- **React Compiler** - Automatic optimization of React components
- **React Router** - Hash routing for GitHub Pages compatibility
- **GitHub Actions** - Automated CI/CD pipeline

## SLOC (source lines of code)

The repository SLOC was measured with `scripts/sloc.mjs` on 2025-12-14.

- **Total SLOC:** 167,693
- **Breakdown by extension (non-empty lines):**
  - `.js`: 131,157
  - `.jsx`: 36,065
  - `.css`: 172
  - `.mjs`: 120
  - `.md`: 77
  - `.html`: 55
  - `.json`: 47

(Counts include non-empty lines only; generated/binary directories were ignored per the script configuration.)
