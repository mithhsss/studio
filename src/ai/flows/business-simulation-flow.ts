
'use server';

/**
 * @fileOverview A Genkit flow for running a turn-based business simulation.
 *
 * - runBusinessSimulation - A function that simulates a business scenario.
 */

import { ai } from '@/ai/genkit';
import { BusinessSimulationInputSchema, BusinessSimulationOutputSchema, type BusinessSimulationInput, type BusinessSimulationOutput } from '../schemas/business-simulation-schemas';


export async function runBusinessSimulation(input: BusinessSimulationInput): Promise<BusinessSimulationOutput> {
  return businessSimulationFlow(input);
}


const prompt = ai.definePrompt({
  name: 'businessSimulationPrompt',
  input: { schema: BusinessSimulationInputSchema },
  output: { schema: BusinessSimulationOutputSchema },
  prompt: `You are a Business Strategy Simulator. Your task is to generate the next turn in a business simulation based on the user's business, their choices, and the simulation history.

**Business Profile:**
- Idea: {{{businessIdea}}}
- Founder's Expertise: {{{userExpertise}}}
- Starting Capital: {{{startingCapital}}}
- Market: {{{market}}}

**Simulation Rules:**
- If the history is empty, this is the first turn (Year 1). Create an initial market scenario and a set of choices.
- If history is present, analyze the last user choice and generate a realistic outcome for the next year.
- The events should be logical consequences of previous choices and market conditions. Introduce unexpected market shifts, competitor actions, or opportunities.
- Dynamically adjust the financial summary based on the outcome of the user's choice. Be realistic (e.g., marketing costs money, new products generate revenue, etc.).
- The choices you provide must be distinct, strategic, and have clear trade-offs.

**Simulation History:**
{{#each history}}
- {{#if (eq this.role 'user')}}CEO Choice:{{else}}Simulator Event:{{/if}} {{{this.content}}}
{{/each}}

Generate the next turn of the simulation. Provide a new event, three strategic choices, and the updated financial summary.`,
});


const businessSimulationFlow = ai.defineFlow(
  {
    name: 'businessSimulationFlow',
    inputSchema: BusinessSimulationInputSchema,
    outputSchema: BusinessSimulationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
