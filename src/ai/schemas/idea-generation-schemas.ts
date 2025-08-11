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

export const IdeaSchema = z.object({
    title: z.string().describe('A short, catchy title for the idea.'),
    shortDesc: z.string().describe('A one-sentence summary of the idea.'),
    longDesc: z.string().describe('A more detailed paragraph explaining the idea, its value, and how it might work.'),
    previewPoints: z.array(z.string()).length(2).describe('A list of exactly two key bullet points that highlight the most exciting aspects of the idea.'),
    tags: z.array(z.string()).describe('A list of 2-3 relevant keywords or tags for the idea (e.g., "team-building", "innovative").'),
});
export type Idea = z.infer<typeof IdeaSchema>;

export const GenerateIdeasOutputSchema = z.object({
    ideas: z.array(IdeaSchema).length(4).describe('An array of exactly 4 generated ideas that fit the user\'s criteria.'),
});
export type GenerateIdeasOutput = z.infer<typeof GenerateIdeasOutputSchema>;


// Schemas for chat-with-idea flow
export const ChatWithIdeaInputSchema = z.object({
  idea: IdeaSchema.describe("The creative idea that is the subject of the conversation."),
  message: z.string().describe("The user's message or question about the idea."),
});
export type ChatWithIdeaInput = z.infer<typeof ChatWithIdeaInputSchema>;


export const ChatWithIdeaOutputSchema = z.object({
  response: z.string().describe("The AI's conversational response to the user's message."),
});
export type ChatWithIdeaOutput = z.infer<typeof ChatWithIdeaOutputSchema>;


// Schemas for combine-ideas flow
export const CombineIdeasInputSchema = z.object({
  idea1: IdeaSchema.describe("The first creative idea."),
  idea2: IdeaSchema.describe("The second creative idea to combine with the first."),
});
export type CombineIdeasInput = z.infer<typeof CombineIdeasInputSchema>;


export const CombineIdeasOutputSchema = z.object({
    combinedIdea: IdeaSchema.describe("The new, hybrid idea resulting from the combination.")
});
export type CombineIdeasOutput = z.infer<typeof CombineIdeasOutputSchema>;

// Schemas for expand-idea flow
export const ExpandIdeaInputSchema = z.object({
  idea: IdeaSchema.describe("The creative idea to be expanded."),
  brief: GenerateIdeasInputSchema.describe("The original brainstorming brief that generated the idea.")
});
export type ExpandIdeaInput = z.infer<typeof ExpandIdeaInputSchema>;

export const ExpandIdeaOutputSchema = z.object({
  title: z.string().describe("The original title of the idea."),
  expandedIdea: z.object({
    coreFeatures: z.string().describe("Explanation of what the idea does, how it works, and the value it provides to users."),
    audienceFit: z.string().describe("Description of who the idea is for, their needs, and how it stands out for them."),
    roadmap: z.string().describe("Step-by-step plan from MVP to full-scale launch, including tools or resources."),
    monetization: z.string().describe("Revenue models, scaling possibilities, and long-term financial viability."),
    challenges: z.string().describe("Anticipated risks plus proactive solutions or mitigation strategies."),
    growthOpportunities: z.string().describe("How the idea can evolve over time, including future features, integrations, or partnerships."),
  }).describe("The expanded version of the idea, broken into strategic categories.")
});
export type ExpandIdeaOutput = z.infer<typeof ExpandIdeaOutputSchema>;
