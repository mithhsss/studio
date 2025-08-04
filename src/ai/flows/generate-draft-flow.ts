'use server';

/**
 * @fileOverview A Genkit flow for generating a full draft from a content outline.
 *
 * - generateDraft - A function that takes an outline and generates a full draft.
 * - GenerateDraftInput - The input type for the generateDraft function.
 * - GenerateDraftOutput - The return type for the generateDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDraftInputSchema = z.object({
  title: z.string().describe('The title of the content.'),
  hook: z.string().describe('The introductory hook to grab the reader\'s attention.'),
  mainPoints: z.array(z.string()).describe('The main points to cover in the content.'),
  cta: z.string().describe('The call to action for the end of the content.'),
});
export type GenerateDraftInput = z.infer<typeof GenerateDraftInputSchema>;

const GenerateDraftOutputSchema = z.object({
  draft: z.string().describe('The fully generated draft in Markdown format.'),
});
export type GenerateDraftOutput = z.infer<typeof GenerateDraftOutputSchema>;

export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutput> {
  return generateDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDraftPrompt',
  input: {schema: GenerateDraftInputSchema},
  output: {schema: GenerateDraftOutputSchema},
  prompt: `You are an expert content creator. Your task is to generate a full draft for a blog post based on the provided outline. Write in a clear, engaging, and informative style. Format the output in Markdown.

Title: {{{title}}}

Hook: {{{hook}}}

Main Points:
{{#each mainPoints}}
- {{{this}}}
{{/each}}

Call to Action: {{{cta}}}

Please generate a compelling draft based on this structure.`,
});

const generateDraftFlow = ai.defineFlow(
  {
    name: 'generateDraftFlow',
    inputSchema: GenerateDraftInputSchema,
    outputSchema: GenerateDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
