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
  prompt: `You are an expert content creator , blogs writer and storyteller.  
Your task is to write a complete blog post in Markdown format based on the given title, hook, and main points.  

**Requirements:**
- Write in a clear, engaging, and informative tone.  
- Start with a strong hook that draws readers in and sets the stage.  
- Expand each main point into detailed, well-structured sections with examples, insights, or relevant explanations.  
- Ensure smooth transitions between sections.  
- End with a concise closing paragraph that leaves readers with a clear takeaway or lasting impression (no call to action).  

**Input Structure:**
Title: {{{title}}}  
Hook: {{{hook}}}  
Main Points:  
{{#each mainPoints}}  
- {{{this}}}  
{{/each}}  

Now, generate the full Markdown draft based on the provided inputs.`,
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
