
'use server';

/**
 * @fileOverview A Genkit flow for generating feedback on a completed mock interview.
 */

import { ai } from '@/ai/genkit';
import {
  GetInterviewFeedbackInputSchema,
  GetInterviewFeedbackOutputSchema,
  type GetInterviewFeedbackInput,
  type GetInterviewFeedbackOutput,
} from '../schemas/mock-interview-schemas';

export async function getInterviewFeedback(
  input: GetInterviewFeedbackInput
): Promise<GetInterviewFeedbackOutput> {
  return getInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getInterviewFeedbackPrompt',
  input: { schema: GetInterviewFeedbackInputSchema },
  output: { schema: GetInterviewFeedbackOutputSchema },
  prompt: `You are an expert hiring manager and interview coach reviewing a completed mock interview.
Your task is to provide a detailed, constructive performance report based on the user's resume, the job description, and the full interview transcript.

**Job Description:**
---
{{{jobDescription}}}
---

**User's Resume:**
---
{{{resumeText}}}
---

**Interview Transcript:**
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}

**Instructions for Feedback Report:**
1.  **Overall Performance:** Write a brief, overall summary of the candidate's performance.
2.  **Clarity & Conciseness:** Evaluate how clear, concise, and easy to understand the user's answers were.
3.  **Relevance:** Assess how well the user's answers related to the questions asked and the requirements in the job description.
4.  **Strengths:** Identify 2-3 specific strengths the user demonstrated. Use examples from the transcript.
5.  **Areas for Improvement:** Identify 2-3 key areas where the user can improve. Provide specific, actionable advice and cite examples from the transcript where they went wrong.
6.  **Next Steps:** Suggest 2 concrete next steps for the user to take to improve their interviewing skills for this type of role.

Generate the entire report in the specified structured JSON format. Be professional, fair, and insightful.`,
});

const getInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'getInterviewFeedbackFlow',
    inputSchema: GetInterviewFeedbackInputSchema,
    outputSchema: GetInterviewFeedbackOutputSchema,
  },
  async (input) => {
    // Reformat chat history for Handlebars compatibility
    const formattedHistory = input.chatHistory.map((msg) => {
      if (msg.role === 'user') {
        return { role: 'User', content: msg.content };
      } else {
        return { role: 'Interviewer', content: msg.content };
      }
    });

    const { output } = await prompt({
      ...input,
      chatHistory: formattedHistory,
    });
    return output!;
  }
);
