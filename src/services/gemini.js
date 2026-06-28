import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL, SYSTEM_PROMPT } from '../utils/constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

function getGenAI() {
  if (!genAI && API_KEY && API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

/**
 * Send a chat message and get a response
 */
export async function sendChatMessage(messages, userMessage) {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured. Please add your key to the .env file.');

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: 'You are StudyBuddy AI. Please follow these instructions for all responses: ' + SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand! I\'m StudyBuddy AI, your intelligent study companion. I\'ll explain concepts clearly, use analogies, break down complex topics, and format my responses beautifully with Markdown. How can I help you study today? 📚' }] },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

/**
 * Generate flashcards from text content
 */
export async function generateFlashcards(content, count = 10) {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured.');

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Generate exactly ${count} flashcards from the following study material. 
  
Return ONLY a valid JSON array with no markdown formatting, no code fences. Each object must have "front" (question) and "back" (answer) keys.

Example format: [{"front": "What is X?", "back": "X is..."}, ...]

Study material:
${content}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Extract JSON from potential markdown code blocks
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse flashcard response');
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate a quiz from a topic or content
 */
export async function generateQuiz(topic, count = 5, difficulty = 'medium') {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured.');

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Generate exactly ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array with no markdown formatting, no code fences. Each object must have:
- "question": the question text
- "options": array of exactly 4 answer choices (strings)
- "answer": the correct answer (must exactly match one of the options)
- "explanation": brief explanation of why the answer is correct

Example: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse quiz response');
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Summarize a document
 */
export async function summarizeDocument(content) {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured.');

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Summarize the following text in a clear, well-structured format using Markdown. Include:
1. A brief overview (2-3 sentences)
2. Key points (bullet list)
3. Important terms and definitions (if any)

Text:
${content}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Chat with context from a document
 */
export async function chatWithDocument(documentContent, question) {
  const ai = getGenAI();
  if (!ai) throw new Error('Gemini API key not configured.');

  const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are a study assistant. Answer the following question based ONLY on the provided document content. If the answer cannot be found in the document, say so clearly.

Document content:
${documentContent}

Question: ${question}

Provide a clear, well-formatted answer using Markdown.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured() {
  return API_KEY && API_KEY !== 'your_gemini_api_key_here';
}
