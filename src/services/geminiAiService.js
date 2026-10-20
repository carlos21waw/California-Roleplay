import { GoogleGenAI } from '@google/genai';
import config from '../config/config.js';
import logger from './logger.js';

let aiClient = null;

function getAiClient() {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      logger.error('[GeminiAiService] Failed to initialize GoogleGenAI client:', err.message);
      return null;
    }
  }
  return aiClient;
}

/**
 * Checks if Gemini AI is configured
 */
export function isAiConfigured() {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * Generates creative AI text responses for ER:LC and design tasks
 */
export async function generateDesignContent(prompt, systemInstruction = 'You are an expert graphic designer and creative director for Silence Designs, specializing in Roblox ER:LC (Emergency Response: Liberty County) liveries, community branding, law enforcement departments, fire rescue aesthetics, and server identities. Provide concise, punchy, well-formatted responses.') {
  if (!isAiConfigured()) {
    throw new Error('Google Gemini API is not configured on this bot. Please set `GEMINI_API_KEY` in your `.env` file.');
  }

  const ai = getAiClient();
  if (!ai) {
    throw new Error('Failed to create Gemini AI client. Please check your `GEMINI_API_KEY`.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75,
        maxOutputTokens: 1024
      }
    });

    if (response && response.text) {
      return response.text.trim();
    }
    throw new Error('No response text returned from Gemini API.');
  } catch (err) {
    logger.error('[GeminiAiService] Generation failed:', err.message);
    throw new Error(`AI generation error: ${err.message}`);
  }
}

export default {
  isAiConfigured,
  generateDesignContent
};
