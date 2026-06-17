export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

async function callGemini(prompt: string): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new GeminiError('VITE_GEMINI_API_KEY is not configured.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new GeminiError(`Gemini API error: ${res.status}`);
  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new GeminiError('Empty response from Gemini.');
  return text.trim();
}

export async function suggestDiscussionQuestions(bookTitle: string, bookAuthor: string): Promise<string[]> {
  const prompt = `You are a book club facilitator. Generate exactly 5 short, thought-provoking discussion questions for the book «${bookTitle}» by ${bookAuthor}.
Format: a numbered list, one question per line (e.g. "1. ..."). No preamble, no conclusion — just the 5 questions.`;
  const text = await callGemini(prompt);
  return text
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 5)
    .slice(0, 5);
}

export async function generateCapsuleSummary(params: {
  clubName: string;
  bookTitle: string;
  bookAuthor: string;
  memberCount: number;
  totalPosts: number;
  totalReactions: number;
  topPostsSample: string;
  language: string;
}): Promise<string> {
  const prompt = `Write a warm, 3–4 sentence narrative summary of a book club reading experience.
Club name: "${params.clubName}"
Book: «${params.bookTitle}» by ${params.bookAuthor}
Members: ${params.memberCount}
Total posts in the club feed: ${params.totalPosts}
Total emoji reactions: ${params.totalReactions}
Sample posts from the feed:
${params.topPostsSample}

Write the summary in ${params.language}. Tone: nostalgic and celebratory. No preamble — just the paragraph.`;
  return callGemini(prompt);
}

export async function getMilestonePrompt(bookTitle: string, bookAuthor: string, milestone: 25 | 50 | 75): Promise<string> {
  try {
    const prompt = `A member of a reading club is reading «${bookTitle}» by ${bookAuthor}. They have just reached ${milestone}% of the book.
Generate exactly 1 short, curious reflection question for them to share with their club. Max 15 words. Casual, warm tone. No preamble — just the question itself.`;
    return await callGemini(prompt);
  } catch {
    return 'What are you thinking at this point in the book?';
  }
}

export async function getCatchUpSummary(
  bookTitle: string,
  bookAuthor: string,
  startChapter: string,
  endChapter: string
): Promise<string> {
  const prompt = `Summarize the main events of chapters ${startChapter} through ${endChapter} of «${bookTitle}» by ${bookAuthor}.
Keep the summary under 150 words. Focus on key plot points and character developments.
Do not add warnings, disclaimers, or commentary. Write in plain prose.`;
  return callGemini(prompt);
}
