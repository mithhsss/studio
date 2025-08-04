'use server';

/**
 * @fileOverview A Genkit flow for analyzing a user's resume and answering related questions.
 *
 * - analyzeResume - A function that takes a resume and a question and provides feedback.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  question: z.string().describe('The career-related question to answer based on the resume.'),
  resumeText: z.string().describe('The full text content of the user\'s resume.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  analysis: z.string().describe('The detailed analysis and answer regarding the user\'s resume.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert AI Career Mentor. Your task is to analyze the user's resume and provide constructive feedback based on their question.

User's Question: {{{question}}}

User's Resume:
---
{{{resumeText}}}
---

Please provide a detailed analysis and actionable advice. Structure your response clearly.`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
