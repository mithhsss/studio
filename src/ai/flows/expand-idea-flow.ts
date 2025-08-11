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
  prompt: `You are a world-class venture strategist and product manager. Your task is to take a raw creative idea and expand it into a comprehensive, strategic plan.

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

Now, expand this idea into a full strategic plan. For each section, provide clear, actionable insights.

**IMPORTANT**: Do not use any Markdown formatting (e.g., no '**', no '#', no '-'). Use plain text with standard paragraph breaks.

The final output must be a JSON object with the following structure:
- **Core Features & Benefits**: Explain what it does, how it works, and the core value it provides to users.
- **Target Audience & Market Fit**: Define who it’s for, their needs, and how this idea uniquely serves them compared to alternatives.
- **Implementation Roadmap**: Detail a step-by-step plan from MVP to full launch. Mention key tools, platforms, or resources needed.
- **Monetization & Sustainability**: Describe potential revenue models, scaling opportunities, and how to ensure long-term financial viability.
- **Potential Challenges & Mitigation**: List anticipated risks and propose proactive solutions or contingency plans.
- **Growth & Innovation Opportunities**: Brainstorm how the idea could evolve, including future features, integrations, or partnerships.

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
