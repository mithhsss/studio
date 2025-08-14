'use server';

/**
 * @fileOverview A Genkit flow for conducting a mock interview.
 *
 * - mockInterview - A function that simulates an interview based on a resume and job description.
 */

import { ai } from '@/ai/genkit';
import { MockInterviewInputSchema, MockInterviewOutputSchema, type MockInterviewInput, type MockInterviewOutput } from '../schemas/mock-interview-schemas';


export async function mockInterview(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}


const prompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: { schema: MockInterviewInputSchema },
  output: { schema: MockInterviewOutputSchema },
  prompt: `You are an expert hiring manager and interview coach for the role described below.
Your task is to conduct a realistic mock interview with the user based on their resume and the job description.

**Job Description:**
---
{{{jobDescription}}}
---

**User's Resume:**
---
{{{resumeText}}}
---

**Interview Rules:**
- If the chat history is empty, begin the interview by introducing yourself and asking the first question.
- Ask a mix of behavioral, technical, and situational questions relevant to the job description and the user's resume.
- Keep your questions concise. Ask one question at a time.
- After the user answers, provide brief feedback on their response if appropriate, then ask the next question.
- Maintain a professional and encouraging tone.
- After 5-6 questions, provide a summary of feedback and conclude the interview.

**Conversation History:**
{{#each chatHistory}}
{{#if (eq this.role 'user')}}
User: {{{this.content}}}
{{else}}
Interviewer: {{{this.content}}}
{{/if}}
{{/each}}

Based on the history, provide the interviewer's next response.`,
});


const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
