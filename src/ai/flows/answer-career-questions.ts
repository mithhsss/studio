'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering career-related questions.
 *
 * - answerCareerQuestion - A function that accepts a career-related question and returns an answer.
 * - AnswerCareerQuestionInput - The input type for the answerCareerQuestion function.
 * - AnswerCareerQuestionOutput - The return type for the answerCareerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCareerQuestionInputSchema = z.object({
  question: z.string().describe('The career-related question to answer.'),
});
export type AnswerCareerQuestionInput = z.infer<typeof AnswerCareerQuestionInputSchema>;

const AnswerCareerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the career-related question.'),
});
export type AnswerCareerQuestionOutput = z.infer<typeof AnswerCareerQuestionOutputSchema>;

export async function answerCareerQuestion(input: AnswerCareerQuestionInput): Promise<AnswerCareerQuestionOutput> {
  return answerCareerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerCareerQuestionPrompt',
  input: {schema: AnswerCareerQuestionInputSchema},
  output: {schema: AnswerCareerQuestionOutputSchema},
  prompt: `You are a helpful AI career advisor. Answer the following question:

Question: {{{question}}}`,
});

const answerCareerQuestionFlow = ai.defineFlow(
  {
    name: 'answerCareerQuestionFlow',
    inputSchema: AnswerCareerQuestionInputSchema,
    outputSchema: AnswerCareerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
