export const APP_NAME = 'StudyBuddy AI';
export const APP_DESCRIPTION = 'Your intelligent study companion powered by AI';

export const GEMINI_MODEL = 'gemini-1.5-flash';

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'var(--color-success)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-warning)' },
  { value: 'hard', label: 'Hard', color: 'var(--color-error)' },
];

export const QUIZ_QUESTION_COUNTS = [5, 10, 15, 20];

export const SUGGESTED_PROMPTS = [
  { icon: '📚', text: 'Explain quantum computing in simple terms' },
  { icon: '🧠', text: 'Help me understand recursion with examples' },
  { icon: '📝', text: 'Create a study plan for learning React' },
  { icon: '🔬', text: 'What are the key differences between DNA and RNA?' },
  { icon: '📊', text: 'Explain Big O notation with examples' },
  { icon: '🌍', text: 'Summarize the causes of World War II' },
  { icon: '💻', text: 'Explain the SOLID principles in software engineering' },
  { icon: '🧬', text: 'How does machine learning differ from deep learning?' },
];

export const SYSTEM_PROMPT = `You are StudyBuddy AI, an intelligent and friendly study companion. Your role is to:
- Explain concepts clearly and concisely
- Use analogies and real-world examples to make complex topics accessible
- Break down difficult subjects into manageable pieces
- Encourage active learning by asking follow-up questions
- Provide accurate, well-structured information
- Use bullet points, numbered lists, and headers for readability
- Include code examples when discussing programming topics
- Be supportive and encouraging

Always format your responses using Markdown for better readability.`;
