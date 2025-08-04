'use server';

/**
 * @fileOverview A Genkit flow for generating a content outline from a topic and goal.
 *
 * - generateOutline - A function that takes a topic and goal and generates an outline.
 * - GenerateOutlineInput - The input type for the generateOutline function.
 * - GenerateOutlineOutput - The return type for the generateOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutlineInputSchema = z.object({
  topic: z.string().describe('The core topic or question for the content.'),
  goal: z.string().describe('The primary goal of the content (e.g., educate, discuss).'),
});
export type GenerateOutlineInput = z.infer<typeof GenerateOutlineInputSchema>;

const GenerateOutlineOutputSchema = z.object({
  title: z.string().describe('A compelling title suggestion for the content.'),
  hook: z.string().describe('An engaging introductory hook to capture the reader\'s attention.'),
  mainPoints: z.array(z.string()).describe('A list of 3-5 main points or sections for the content body.'),
  cta: z.string().describe('A relevant call to action for the end of the piece.'),
});
export type GenerateOutlineOutput = z.infer<typeof GenerateOutlineOutputSchema>;

export async function generateOutline(input: GenerateOutlineInput): Promise<GenerateOutlineOutput> {
  return generateOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutlinePrompt',
  input: {schema: GenerateOutlineInputSchema},
  output: {schema: GenerateOutlineOutputSchema},
  prompt: `You are an expert content strategist. Your task is to generate a blog post outline based on a user's topic and goal.

Topic: {{{topic}}}
Goal: {{{goal}}}

Please generate a compelling outline that includes a title, an engaging hook, 3 to 5 main points, and a concluding call to action.`,
});

const generateOutlineFlow = ai.defineFlow(
  {
    name: 'generateOutlineFlow',
    inputSchema: GenerateOutlineInputSchema,
    outputSchema: GenerateOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
