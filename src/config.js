// src/config.js

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  VOLT_AGENT_URL: import.meta.env.VITE_VOLT_AGENT_URL || "http://localhost:3141",
  AGENT_ID: "volt-canoe-eduardo",
};
