# Algorithm-Arena-Reprompted

Algorithm-Arena questions achieved with prompts

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
