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
  prompt: `You are a world-class venture strategist and product manager. Your task is to take a raw creative idea and expand it into a comprehensive, strategic plan based on the original brief.

Original Brief:
- Core Subject: {{{brief.subject}}}
- Target Audience: {{{brief.audience}}}
- Creativity Lens: {{{brief.lens}}}
{{#if brief.constraints}}- Key Constraints: {{{brief.constraints}}}{{/if}}
{{#if brief.other}}- Other Goals: {{{brief.other}}}{{/if}}
{{#if brief.detailedDescription}}- Detailed Description: {{{brief.detailedDescription}}}{{/if}}

Based on that brief, you generated the following idea:
- Idea Title: {{{idea.title}}}
- Idea Summary: {{{idea.longDesc}}}

Now, expand this idea into a full strategic plan. For each section, provide clear, actionable insights in the requested format.

**Output Structure (JSON):**

- **mainDescription**: A compelling 2-3 line description of the expanded idea.
- **coreFeatures**:
  - **points**: An array of 3-4 bullet points detailing the core features and benefits.
  - **summary**: A concise 3-line summary of the feature set.
- **targetAudience**:
  - **description**: A 6-7 line paragraph describing who it's for, their needs, and how the idea stands out.
- **implementationRoadmap**:
  - **steps**: An array of bullet points for the step-by-step plan from MVP to full launch. Include key tools or platforms.
- **monetization**:
  - **points**: An array of bullet points describing potential revenue models, scaling, and financial viability.
- **challenges**:
  - **points**: An array of bullet points detailing anticipated risks and proactive solutions.
- **growthOpportunities**:
  - **description**: A paragraph brainstorming how the idea could evolve (future features, partnerships, etc.).

Return the entire plan in the specified structured JSON format.`,
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
