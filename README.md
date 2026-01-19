# Pipa Canoe Adventures - AI Chatbot Integration

A modern, responsive React website for Pipa Canoe Adventures featuring an integrated AI chatbot powered by VoltAgent and Deep Chat. The website showcases canoe tour services in Pipa, Brazil, with real-time customer support through an intelligent conversational assistant.

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

This project combines a beautiful, responsive React application for Pipa Canoe Adventures with an AI-powered chatbot that can answer customer questions about tours, pricing, availability, and general information about canoe experiences in Pipa, Brazil.

### Key Components

- **Frontend**: Modern React 19 application built with Vite and Tailwind CSS
- **AI Backend**: VoltAgent framework running a specialized canoe booking bot
- **Chat Interface**: Deep Chat web component for seamless user interaction
- **Integration**: React-based handler bridging Deep Chat and VoltAgent APIs

## Features

### Website Features

- **React-based SPA**: Fast, smooth navigation using React Router
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Video Background**: Immersive hero section with canoe adventure footage
- **Multi-language Support**: English, Portuguese, and Spanish via React Context
- **Tour Booking**: Real-time availability and booking system
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

- **React 19**: Modern UI library for building the interface
- **Vite**: Next-generation frontend tooling for fast development
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router 7**: Declarative routing for React applications
- **Lucide React**: Beautiful & consistent icons
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
│   Deep Chat     │◄──►│   React Hook/   │◄──►│   VoltAgent     │
│   Component     │    │   API Client    │    │   HTTP Server   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   User Interface│    │  Message Format │    │  AI Processing  │
│   - React App   │    │  Transformation │    │  - Gemini Model │
│   - Tailwind    │    │  - Deep Chat ►  │    │  - Tool Calling │
│   - Components  │    │    VoltAgent    │    │  - Memory       │
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

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up VoltAgent Backend

```bash
# Install VoltAgent dependencies
npm install @voltagent/core @voltagent/vercel-ai @ai-sdk/google
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google AI API Key for Gemini model
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# VoltAgent Configuration
VOLTAGENT_PORT=3141
VOLTAGENT_HOST=localhost

# Frontend API URL
VITE_API_URL=http://localhost:8000
```

### 5. Start VoltAgent Server

Create a `voltagent.config.js` and run it:

```bash
node voltagent.config.js
```

### 6. Start Frontend Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Configuration

### Deep Chat Integration

The chat interface is integrated as a web component. Ensure it is properly configured in your React components.

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

## Deployment

### Frontend

Build the production-ready bundle:

```bash
npm run build
```

The output will be in the `dist` directory, which can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

## Troubleshooting

### Common Issues

**1. Chat not responding**

- Check browser console for errors
- Verify VoltAgent is running on localhost:3141
- Ensure CORS is configured correctly

**2. API Connection errors**

- Verify `VITE_API_URL` is set correctly in `.env`
- Ensure the backend booking API is running

## API Reference

### VoltAgent Endpoints

**Generate Text Response**

```
POST /agents/volt-canoe-eduardo/text
Body: {
  "input": "What tours do you offer?",
  "options": {
    "maxTokens": 1000
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly: `npm test`
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Pipa Canoe Adventures** - Experience the magic of Pipa from the water with our guided canoe excursions and intelligent booking assistant.
