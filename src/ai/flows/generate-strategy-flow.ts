
'use server';

/**
 * @fileOverview A Genkit flow for generating a comprehensive business strategy analysis.
 */

import { ai } from '@/ai/genkit';
import { GenerateStrategyInputSchema, GenerateStrategyOutputSchema, type GenerateStrategyInput, type GenerateStrategyOutput } from '../schemas/business-strategy-schemas';

export async function generateStrategy(input: GenerateStrategyInput): Promise<GenerateStrategyOutput> {
  return generateStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStrategyPrompt',
  input: { schema: GenerateStrategyInputSchema },
  output: { schema: GenerateStrategyOutputSchema },
  prompt: `You are an expert business strategy analyst. Your task is to perform a comprehensive business strategy analysis for the provided business idea. Be thorough, insightful, and professional. The output must be a single, valid JSON object adhering to the specified schema.

Business Idea:
---
{{{businessIdea}}}
---

**Analysis Instructions:**

1.  **Viability Score:** Provide a score from 0.0 to 10.0 representing the idea's viability. Justify the score with a clear, concise explanation.
2.  **Core Idea & USP:** Identify the single most game-changing aspect of the business and its unique selling proposition (USP).
3.  **SWOT Analysis:** List 3-5 key points for Strengths, Weaknesses, Opportunities, and Threats.
4.  **PESTLE Analysis:** List 2-4 key factors for Political, Economic, Social, Technological, Legal, and Environmental categories.
5.  **Porter's Five Forces:** Analyze each of the five forces (Competitive Rivalry, Supplier Power, Buyer Power, Threat of Substitution, Threat of New Entry). For each force, provide a level (Low, Moderate, High) and 2-3 bullet points explaining the reasoning.
6.  **CATWOE Analysis:** Identify the key stakeholders and elements for Customers, Actors, Transformation Process, Worldview, Owner, and Environmental Constraints. Provide 2-3 points for each.
7.  **Market Size:** Provide concise descriptions for the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM).
8.  **Growth Simulation:** Generate a 10-year growth projection. Provide labels for 10 years (e.g., "Year 1", "Year 2", etc.). For each year, provide projected revenue figures for "optimistic," "realistic," and "pessimistic" scenarios. The numbers should show a logical growth curve.

Generate the entire analysis as a single JSON object.`,
});

const generateStrategyFlow = ai.defineFlow(
  {
    name: 'generateStrategyFlow',
    inputSchema: GenerateStrategyInputSchema,
    outputSchema: GenerateStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
