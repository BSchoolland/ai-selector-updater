# Minimal AI System

A lightweight system for interacting with OpenAI's API with tool call support, extracted from the v2v-chatbot-api project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

```javascript
const { getAiResponse } = require('./ai-response');

// Example usage
async function example() {
    const history = [
        { role: 'user', content: 'Read the content from /example.html' }
    ];
    
    const systemPrompt = "You are a helpful AI assistant that can read web pages.";
    
    const finalHistory = await getAiResponse(history, systemPrompt);
    console.log('Final response:', finalHistory[finalHistory.length - 1].content);
}

example(); 