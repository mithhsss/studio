/**
 * @fileOverview Zod schemas and TypeScript types for the Mock Interview flow.
 */
import { z } from 'genkit';

export const MockInterviewInputSchema = z.object({
  resumeText: z.string().describe("The user's resume text."),
  jobDescription: z.string().describe('The job description for the role the user is interviewing for.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the interview conversation so far.'),
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

export const MockInterviewOutputSchema = z.object({
  response: z.string().describe("The interviewer's next question, comment, or feedback."),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;
