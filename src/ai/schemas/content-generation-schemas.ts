/**
 * @fileOverview Zod schemas and TypeScript types for the Content Generation flows.
 */
import { z } from 'zod';

export const RefineContentInputSchema = z.object({
  text: z.string().describe("The text content to be refined."),
  command: z.string().describe("The specific command for how to refine the text (e.g., 'Change the tone to be more professional', 'Suggest an analogy', 'Generate relevant hashtags')."),
});
export type RefineContentInput = z.infer<typeof RefineContentInputSchema>;


export const RefineContentOutputSchema = z.object({
  refinedText: z.string().describe("The resulting text after applying the refinement command."),
});
export type RefineContentOutput = z.infer<typeof RefineContentOutputSchema>;
