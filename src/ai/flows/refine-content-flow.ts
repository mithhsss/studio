'use server';

/**
 * @fileOverview A Genkit flow for refining a block of text based on a specific command.
 *
 * - refineContent - A function that takes text and a command and returns the modified text.
 * - RefineContentInput - The input type for the refineContent function.
 * - RefineContentOutput - The return type for the refineContent function.
 */

import { ai } from '@/ai/genkit';
import { RefineContentInputSchema, RefineContentOutputSchema, type RefineContentInput, type RefineContentOutput } from '../schemas/content-generation-schemas';


export async function refineContent(input: RefineContentInput): Promise<RefineContentOutput> {
  return refineContentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'refineContentPrompt',
  input: { schema: RefineContentInputSchema },
  output: { schema: RefineContentOutputSchema },
  prompt: `You are an expert editor. Your task is to refine the following text based on the user's command, while ensuring the output remains consistent with the original key message and main points.

User's Command: "{{{command}}}"

Original Key Message: {{{goal}}}
Original Main Points:
{{#each mainPoints}}
- {{{this}}}
{{/each}}

Original Text to Refine:
---
{{{text}}}
---

Apply the command to the text and return the result in the 'refinedText' field. If the command is to generate hashtags, provide them as a single string appended to the original text.`,
});


const refineContentFlow = ai.defineFlow(
  {
    name: 'refineContentFlow',
    inputSchema: RefineContentInputSchema,
    outputSchema: RefineContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
