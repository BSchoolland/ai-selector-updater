# AI Selector Updater

A web application that combines AI capabilities with web scraping to automatically generate and test CSS selectors for extracting data from web pages.

## Features

- Web interface for inputting URLs and describing desired data
- AI-powered analysis of HTML content
- Automatic generation and testing of CSS selectors
- Real-time feedback on selector effectiveness
- In-memory storage of successful selectors
- Puppeteer-based web page rendering

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/BSchoolland/ai-selector-updater.git
cd ai-selector-updater
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter a URL and describe the data you want to extract (e.g., "product titles and prices", "article headlines")

4. The AI system will analyze the page and generate appropriate CSS selectors

## Project Structure

- `server.mjs` - Express server setup and main application logic
- `public/index.html` - Web interface
- `minimal-ai-system/`
  - `ai-response.mjs` - AI integration and response handling
  - `tools.mjs` - Selector management tools and utilities

## Available Tools

- `addSelector` - Adds a new CSS selector with a specified name
- `quickTestSelector` - Tests a selector without saving it
- `removeSelector` - Removes a stored selector by name
- `clearAllSelectors` - Clears all stored selectors
- `markComplete` - Finalizes the selector generation process

## Dependencies

- Express - Web server framework
- Puppeteer - Headless browser automation
- JSDOM - DOM manipulation for selector testing
- dotenv - Environment variable management
- node-fetch - HTTP client
- OpenAI API - AI model integration 