'use server';

/**
 * @fileOverview A Genkit flow for expanding a creative idea into a more detailed plan.
 *
 * - expandIdea - A function that takes an idea and the original brief and returns an expanded plan.
 * - ExpandIdeaInput - The input type for the expandIdea function.
 * - ExpandIdeaOutput - The return type for the expandIdea function.
 */

import { ai } from '@/ai/genkit';
import { ExpandIdeaInputSchema, ExpandIdeaOutputSchema, type ExpandIdeaInput, type ExpandIdeaOutput } from '../schemas/idea-generation-schemas';

export async function expandIdea(input: ExpandIdeaInput): Promise<ExpandIdeaOutput> {
  return expandIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expandIdeaPrompt',
  input: { schema: ExpandIdeaInputSchema },
  output: { schema: ExpandIdeaOutputSchema },
  prompt: `You are a strategic planner and business consultant. Your task is to expand a given creative idea into a more concrete and actionable plan.

You were originally given the following creative brief:
- Core Subject: {{{brief.subject}}}
- Target Audience: {{{brief.audience}}}
- Creativity Lens: {{{brief.lens}}}
{{#if brief.constraints}}- Key Constraints: {{{brief.constraints}}}{{/if}}
{{#if brief.other}}- Other Goals: {{{brief.other}}}{{/if}}
{{#if brief.detailedDescription}}- Detailed Description: {{{brief.detailedDescription}}}{{/if}}

Based on that brief, you generated the following idea:
- Idea Title: {{{idea.title}}}
- Idea Summary: {{{idea.longDesc}}}

Now, expand this idea. Provide a more detailed, structured breakdown including:
1.  **Core Concept**: A single, powerful sentence that captures the essence of the idea.
2.  **Key Features**: A bulleted list of 3-4 primary features or components.
3.  **Target Audience Appeal**: A brief explanation of why this idea will resonate with the specified audience.
4.  **Monetization Strategy**: A high-level suggestion for how this idea could generate revenue.
5.  **Next Steps**: 3 concrete, actionable next steps.
6.  **Potential Risks**: 3 potential risks or challenges.

Return the entire plan in the specified structured format.`,
});


const expandIdeaFlow = ai.defineFlow(
  {
    name: 'expandIdeaFlow',
    inputSchema: ExpandIdeaInputSchema,
    outputSchema: ExpandIdeaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
