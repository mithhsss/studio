
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


// Schemas for Interview Feedback Flow
export const GetInterviewFeedbackInputSchema = z.object({
  resumeText: z.string().describe("The user's resume text."),
  jobDescription: z.string().describe('The job description for the role the user was interviewed for.'),
  chatHistory: z.array(z.object({
      role: z.enum(['user', 'model']),
      content: z.string()
  })).describe("The full conversation history of the mock interview.")
});
export type GetInterviewFeedbackInput = z.infer<typeof GetInterviewFeedbackInputSchema>;

export const GetInterviewFeedbackOutputSchema = z.object({
    overallPerformance: z.string().describe("A brief, overall summary of the candidate's performance."),
    clarityAndConciseness: z.string().describe("Evaluation of the clarity and conciseness of the user's answers."),
    relevance: z.string().describe("Assessment of how relevant the user's answers were to the questions and job description."),
    strengths: z.array(z.string()).describe("A list of 2-3 specific strengths demonstrated by the user, with examples."),
    areasForImprovement: z.array(z.string()).describe("A list of 2-3 key areas for improvement, with actionable advice and examples."),
    nextSteps: z.array(z.string()).describe("A list of 2 concrete next steps for the user to improve their interviewing skills."),
});
export type GetInterviewFeedbackOutput = z.infer<typeof GetInterviewFeedbackOutputSchema>;
