/**
 * @fileOverview Zod schemas and TypeScript types for the Business Simulation flow.
 */
import { z } from 'genkit';

export const BusinessSimulationInputSchema = z.object({
  businessIdea: z.string().describe('A description of the business idea.'),
  userExpertise: z.enum(['Novice', 'Intermediate', 'Expert']).describe('The user\'s self-assessed expertise level.'),
  startingCapital: z.number().describe('The initial capital available for the business.'),
  market: z.string().describe('The target market or industry for the business.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the simulation turns so far. The user\'s role is \'CEO\'.'),
});
export type BusinessSimulationInput = z.infer<typeof BusinessSimulationInputSchema>;

export const BusinessSimulationOutputSchema = z.object({
  year: z.number().describe('The current year in the simulation.'),
  eventName: z.string().describe('The title of the key event that happened this turn.'),
  eventDescription: z.string().describe('A description of the event, opportunity, or challenge.'),
  choices: z.array(z.string()).length(3).describe('Three distinct choices for the user to make in response to the event.'),
  financialSummary: z.object({
    revenue: z.number(),
    expenses: z.number(),
    profit: z.number(),
    capital: z.number(),
  }).describe('An updated summary of the business financials.'),
});
export type BusinessSimulationOutput = z.infer<typeof BusinessSimulationOutputSchema>;
