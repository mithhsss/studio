'use server';

/**
 * @fileOverview A Genkit flow for generating creative ideas based on user criteria.
 * 
 * This file only exports the main `generateIdeas` function to comply with "use server" constraints.
 * Schemas and types are defined in `src/ai/schemas/idea-generation-schemas.ts`.
 */

import { ai } from '@/ai/genkit';
import type { GenerateIdeasInput, GenerateIdeasOutput } from '../schemas/idea-generation-schemas';
import { GenerateIdeasInputSchema, GenerateIdeasOutputSchema } from '../schemas/idea-generation-schemas';


const generateIdeasFlow = ai.defineFlow(
    {
        name: 'generateIdeasFlow',
        inputSchema: GenerateIdeasInputSchema,
        outputSchema: GenerateIdeasOutputSchema,
    },
    async (input) => {
        const prompt = ai.definePrompt({
            name: 'generateIdeasPrompt',
            input: { schema: GenerateIdeasInputSchema },
            output: { schema: GenerateIdeasOutputSchema },
            prompt: `You are an expert idea generator and creative strategist. Your task is to brainstorm 4 distinct, creative, and actionable ideas based on the user's provided criteria.

User's Criteria:
- Core Subject: {{{subject}}}
- Target Audience: {{{audience}}}
- Creativity Lens: Apply the '{{{lens}}}' mindset to your brainstorming.
{{#if constraints}}- Key Constraints: {{{constraints}}}{{/if}}
{{#if other}}- Other Goals: {{{other}}}{{/if}}
{{#if detailedDescription}}- Detailed Description: {{{detailedDescription}}}{{/if}}

For each of the 4 ideas, you must provide:
1.  A short, catchy title.
2.  A one-sentence summary.
3.  A longer paragraph describing the concept in more detail.
4.  Exactly two exciting preview bullet points.
5.  A list of 2-3 relevant tags.

Return the final list of ideas in the specified structured format. Ensure the ideas are diverse and genuinely creative.`,
        });

        const { output } = await prompt(input);
        return output!;
    }
);

export async function generateIdeas(input: GenerateIdeasInput): Promise<GenerateIdeasOutput> {
    return await generateIdeasFlow(input);
}