'use server';


/**
 * @fileOverview A Genkit flow for combining two creative ideas into a single new one.
 *
 * - combineIdeas - A function that takes two ideas and returns a new, hybrid idea.
 * - CombineIdeasInput - The input type for the combineIdeas function.
 * - CombineIdeasOutput - The return type for the combineIdeas function.
 */


import { ai } from '@/ai/genkit';
import { CombineIdeasInputSchema, CombineIdeasOutputSchema, type CombineIdeasInput, type CombineIdeasOutput } from '../schemas/idea-generation-schemas';


export async function combineIdeas(input: CombineIdeasInput): Promise<CombineIdeasOutput> {
  return combineIdeasFlow(input);
}


const prompt = ai.definePrompt({
  name: 'combineIdeasPrompt',
  input: { schema: CombineIdeasInputSchema },
  output: { schema: CombineIdeasOutputSchema },
  prompt: `You are a master creative synthesizer. Your task is to combine two distinct ideas into a single, compelling new concept.

Idea 1:
- Title: {{{idea1.title}}}
- Description: {{{idea1.longDesc}}}
- Tags: {{#each idea1.tags}}{{{this}}}{{/each}}

Idea 2:
- Title: {{{idea2.title}}}
- Description: {{{idea2.longDesc}}}
- Tags: {{#each idea2.tags}}{{{this}}}{{/each}}

Analyze the core strengths of both ideas and merge them into a new, hybrid idea. The new idea should have its own catchy title, a clear description, two exciting preview points, and a set of relevant tags. Return the result as a single "combinedIdea" object.`,
});


const combineIdeasFlow = ai.defineFlow(
  {
    name: 'combineIdeasFlow',
    inputSchema: CombineIdeasInputSchema,
    outputSchema: CombineIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
