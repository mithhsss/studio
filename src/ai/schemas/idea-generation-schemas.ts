/**
 * @fileOverview Zod schemas and TypeScript types for the Idea Generation flow.
 */
import { z } from 'zod';

export const GenerateIdeasInputSchema = z.object({
    subject: z.string().describe('The core subject or area for which ideas are needed (e.g., "company retreat", "new app feature").'),
    audience: z.string().describe('The target audience for these ideas (e.g., "remote employees", "power users").'),
    constraints: z.string().optional().describe('Any key constraints to consider (e.g., "budget under $10k", "must be virtual").'),
    other: z.string().optional().describe('Any other miscellaneous criteria or goals (e.g., "focus on wellness", "encourage collaboration").'),
    lens: z.string().describe('A "creativity lens" to guide the style of idea generation (e.g., "What If?", "Problem/Solution").'),
    detailedDescription: z.string().optional().describe('A more detailed, free-form description of the challenge or goal.'),
});
export type GenerateIdeasInput = z.infer<typeof GenerateIdeasInputSchema>;

const IdeaSchema = z.object({
    title: z.string().describe('A short, catchy title for the idea.'),
    shortDesc: z.string().describe('A one-sentence summary of the idea.'),
    longDesc: z.string().describe('A more detailed paragraph explaining the idea, its value, and how it might work.'),
    previewPoints: z.array(z.string()).length(2).describe('A list of exactly two key bullet points that highlight the most exciting aspects of the idea.'),
    tags: z.array(z.string()).describe('A list of 2-3 relevant keywords or tags for the idea (e.g., "team-building", "innovative").'),
});

export const GenerateIdeasOutputSchema = z.object({
    ideas: z.array(IdeaSchema).length(4).describe('An array of exactly 4 generated ideas that fit the user\'s criteria.'),
});
export type GenerateIdeasOutput = z.infer<typeof GenerateIdeasOutputSchema>;
