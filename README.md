# Pipa Canoe Adventures - AI Chatbot Integration

A modern, responsive website for Pipa Canoe Adventures featuring an integrated AI chatbot powered by VoltAgent and Deep Chat. The website showcases canoe tour services in Pipa, Brazil, with real-time customer support through an intelligent conversational assistant.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Overview

This project combines a beautiful, responsive website for Pipa Canoe Adventures with an AI-powered chatbot that can answer customer questions about tours, pricing, availability, and general information about canoe experiences in Pipa, Brazil.

### Key Components

- **Frontend**: Modern HTML5 website with Tailwind CSS
- **AI Backend**: VoltAgent framework running a specialized canoe booking bot
- **Chat Interface**: Deep Chat web component for seamless user interaction
- **Integration**: Custom JavaScript handler bridging Deep Chat and VoltAgent APIs

## Features

### Website Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Video Background**: Immersive hero section with canoe adventure footage
- **Multi-language Support**: English, Portuguese, and Spanish
- **Image Gallery**: Showcase of canoe tours and Pipa's natural beauty
- **Contact Form**: Direct booking and inquiry functionality
- **Interactive Map**: Google Maps integration showing Pipa location

### Chatbot Features

- **Natural Language Processing**: Powered by Gemini 2.0 Flash model
- **Tour Information**: Answers questions about available tours and experiences
- **Booking Assistance**: Helps customers with reservation inquiries
- **Entity Extraction**: Identifies tour names, dates, and party sizes
- **Intent Detection**: Understands customer goals and responds appropriately
- **Contextual Responses**: Maintains conversation context for better assistance

## Technology Stack

### Frontend

- **HTML5**: Semantic markup with accessibility features
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **JavaScript**: Vanilla ES6+ for interactivity and API integration
- **Deep Chat**: Web component for chat interface
- **Google Fonts**: Lora and Open Sans typography

### Backend/AI

- **VoltAgent**: TypeScript AI agent framework
- **Gemini 2.0 Flash**: Google's latest language model
- **Node.js**: Runtime environment for VoltAgent
- **LibSQL**: Database for conversation memory storage

### Integration

- **REST API**: HTTP communication between frontend and VoltAgent
- **JSON**: Data exchange format
- **CORS**: Cross-origin resource sharing configuration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Deep Chat     │◄──►│   Custom JS     │◄──►│   VoltAgent     │
│   Component     │    │   Handler       │    │   HTTP Server   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   User Interface│    │  Message Format │    │  AI Processing  │
│   - Chat Window │    │  Transformation │    │  - Gemini Model │
│   - Styling     │    │  - Deep Chat ►  │    │  - Tool Calling │
│   - Placement   │    │    VoltAgent    │    │  - Memory       │
│                 │    │  - VoltAgent ►  │    │                 │
│                 │    │    Deep Chat    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git
- Text editor or IDE
- Modern web browser

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pipa-canoe-adventures
```

### 2. Set Up VoltAgent Backend

```bash
# Install VoltAgent dependencies
npm install @voltagent/core @voltagent/vercel-ai @ai-sdk/google

# Create VoltAgent configuration file
# (See Configuration section below)
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google AI API Key for Gemini model
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# VoltAgent Configuration
VOLTAGENT_PORT=3141
VOLTAGENT_HOST=localhost

# Database Configuration (optional)
DATABASE_URL=file:./canoe_agent.db
```

### 4. Create VoltAgent Configuration

Create `voltagent.config.js`:

```javascript
import { VoltAgent, Agent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { google } from "@ai-sdk/google";

const canoeAgent = new Agent({
  name: "volt-canoe-eduardo",
  instructions: `You are a helpful assistant for Pipa Canoe Adventures, a canoe tour company in Pipa, Brazil. 
  
  You help customers with:
  - Information about canoe tours and experiences
  - Pricing and availability questions
  - Booking assistance and reservations
  - Details about Pipa's natural attractions
  - Tour recommendations based on preferences
  
  Be friendly, knowledgeable, and enthusiastic about the beautiful waters around Pipa.`,
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [
    {
      name: "extractEntities",
      description:
        "Extracts tour-related entities like tour name, number of people, and date from a user message.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
    {
      name: "detectIntent",
      description: "Detect the user's intent from their message.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
    },
  ],
});

new VoltAgent({
  agents: { canoeAgent },
  server: {
    port: 3141,
    enableSwaggerUI: true,
  },
});
```

### 5. Start VoltAgent Server

```bash
npm run dev
# or
node voltagent.config.js
```

You should see:

```
═══════════════════════════════════════════════════
VOLTAGENT SERVER STARTED SUCCESSFULLY
═══════════════════════════════════════════════════
✓ HTTP Server: http://localhost:3141
Test your agents with VoltOps Console: https://console.voltagent.dev
═══════════════════════════════════════════════════
```

### 6. Set Up Frontend

The frontend files are already configured. Simply serve them using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using Live Server (VS Code extension)
# Right-click index.html > "Open with Live Server"
```

### 7. Test the Integration

1. Open your browser to `http://localhost:8000` (or your server URL)
2. Click the chat button in the bottom-right corner
3. Test with messages like:
   - "What canoe tours do you offer?"
   - "How much does a sunset tour cost?"
   - "I want to book a tour for 4 people"

## Configuration

### Deep Chat Styling

The chat interface is styled to match the website's branding in the HTML:

```html
<deep-chat
  id="deep-chat"
  style="
    --deep-chat-button-background-color: #ff6b6b;
    --deep-chat-button-icon-color: #ffffff;
    --deep-chat-header-background-color: #ff6b6b;
    --deep-chat-title-text-color: #ffffff;
    --deep-chat-primary-color: #ff6b6b;
    --deep-chat-font-family: 'Open Sans', sans-serif;
  "
></deep-chat>
```

### VoltAgent Agent Configuration

The agent can be customized in the VoltAgent configuration:

```javascript
const canoeAgent = new Agent({
  name: "volt-canoe-eduardo",
  instructions: "Custom instructions here...",
  llm: new VercelAIProvider(),
  model: google("gemini-2.0-flash-exp"),
  tools: [...], // Custom tools
  maxTokens: 1000,
  temperature: 0.7
});
```

### Message Format Transformation

The JavaScript handler transforms between Deep Chat and VoltAgent formats:

```javascript
// Deep Chat sends:
{
  "messages": [
    {"role": "user", "text": "Hello"}
  ]
}

// Transformed to VoltAgent format:
{
  "input": "Hello",
  "options": {"maxTokens": 1000}
}

// VoltAgent responds:
{
  "text": "Hello! How can I help you?",
  "usage": {...}
}

// Transformed back to Deep Chat format:
{
  "text": "Hello! How can I help you?"
}
```

## Deployment

### VoltAgent Backend

Deploy to platforms that support Node.js:

**Railway:**

```bash
# Connect to Railway
railway login
railway init
railway add

# Set environment variables
railway variables set GOOGLE_AI_API_KEY=your_key_here
railway deploy
```

**Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### Frontend

Deploy to static hosting platforms:

**Netlify:**

```bash
# Build command: Not needed (static files)
# Publish directory: . (root)
```

**Vercel:**

```bash
vercel --prod
```

**GitHub Pages:**

- Push to GitHub repository
- Enable Pages in repository settings
- Select source branch

### CORS Configuration

For production, configure CORS in VoltAgent:

```javascript
new VoltAgent({
  agents: { canoeAgent },
  server: {
    port: 3141,
    cors: {
      origin: ["https://your-domain.com"],
      credentials: true,
    },
  },
});
```

## Troubleshooting

### Common Issues

**1. Chat not responding**

- Check browser console for errors
- Verify VoltAgent is running on localhost:3141
- Test direct API call: `curl -X POST http://localhost:3141/agents/volt-canoe-eduardo/text -H "Content-Type: application/json" -d '{"input": "Hello", "options": {"maxTokens": 100}}'`

**2. CORS errors**

- Ensure VoltAgent CORS is configured for your domain
- For local development, serve frontend from a local server, not file://

**3. 404 errors**

- Verify agent name matches exactly: "volt-canoe-eduardo"
- Check VoltAgent logs for errors
- Confirm API endpoints are available

**4. Response formatting issues**

- Check browser console logs
- Verify response transformation logic
- Ensure VoltAgent returns expected format

### Debug Mode

Enable detailed logging:

```javascript
// In chatbot.js
console.log("Sending message to Volt Agent:", userMessage);
console.log("Full Volt Agent response:", result);
console.log("Extracted response text:", responseText);
```

## API Reference

### VoltAgent Endpoints

**List Agents**

```
GET /agents
Response: {
  "success": true,
  "data": [
    {
      "id": "volt-canoe-eduardo",
      "name": "volt-canoe-eduardo",
      "description": "Canoe query and booking bot",
      "status": "idle",
      "model": "gemini-2.0-flash-exp"
    }
  ]
}
```

**Generate Text Response**

```
POST /agents/volt-canoe-eduardo/text
Body: {
  "input": "What tours do you offer?",
  "options": {
    "maxTokens": 1000
  }
}

Response: {
  "text": "We offer several amazing canoe tours...",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 150,
    "totalTokens": 175
  }
}
```

**Stream Response**

```
POST /agents/volt-canoe-eduardo/stream
Body: {
  "input": "Tell me about sunset tours",
  "options": {
    "maxTokens": 1000
  }
}

Response: Server-Sent Events stream
data: {"textDelta": "Our "}
data: {"textDelta": "sunset "}
data: {"textDelta": "tours "}
...
data: [DONE]
```

### Deep Chat Integration

**Message Handler**

```javascript
chatElement.connect = {
  handler: async (body, signals) => {
    // body.messages - Array of conversation messages
    // signals.onResponse() - Send response to chat
    // signals.onError() - Send error message
  },
};
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

### Development Guidelines

- Follow JavaScript ES6+ standards
- Maintain responsive design principles
- Test on multiple browsers and devices
- Keep accessibility in mind
- Document any new configuration options
- Ensure VoltAgent compatibility

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For technical support or questions:

- Create an issue in the repository
- Check VoltAgent documentation: https://voltagent.dev/docs/
- Deep Chat documentation: https://deepchat.dev/docs/

---

**Pipa Canoe Adventures** - Experience the magic of Pipa from the water with our guided canoe excursions and intelligent booking assistant.
