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
  prompt: `You are a master creative synthesizer with a talent for merging concepts into innovative hybrids.

You will be given two ideas with titles, detailed descriptions, and tags.
Your task is to:
1. Identify the unique strengths, themes, and opportunities in each idea.
2. Merge them into one fresh, cohesive, and imaginative concept that feels natural yet surprising.

For the final output, create a **single JSON object** called \`combinedIdea\` with:
- **title**: A catchy and memorable name for the new concept.
- **description**: A clear and engaging explanation of the hybrid idea, highlighting the fusion of both originals.
- **previewPoints**: Exactly 2 bullet points summarizing the most exciting or distinctive features of the new idea.
- **tags**: A set of relevant, concise tags combining and expanding from both original ideas.

**Input format:**
Idea 1:
- Title: {{{idea1.title}}}
- Description: {{{idea1.longDesc}}}
- Tags: {{#each idea1.tags}}{{{this}}}{{/each}}

Idea 2:
- Title: {{{idea2.title}}}
- Description: {{{idea2.longDesc}}}
- Tags: {{#each idea2.tags}}{{{this}}}{{/each}}

**Output format (JSON):**
{
  "combinedIdea": {
    "title": "...",
    "description": "...",
    "previewPoints": ["...", "..."],
    "tags": ["...", "...", "..."]
  }
}`,
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
