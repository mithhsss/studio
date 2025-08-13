
'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized learning roadmap.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GenerateRoadmapInputSchema = z.object({
  currentSkills: z.array(z.string()).describe('A list of the user\'s current skills.'),
  goal: z.string().describe('The user\'s primary learning or career goal.'),
  timeline: z.string().describe('The desired timeline to achieve the goal (e.g., "1 Month", "3 Months").'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

// Output Schema
const ResourceSchema = z.object({
  name: z.string().describe('The name of the resource.'),
  url: z.string().url().describe('A direct URL to the resource.'),
});

const SubtopicSchema = z.object({
  title: z.string().describe('The title of the sub-topic.'),
  description: z.string().describe('A brief explanation of what the sub-topic covers and why it is important.'),
  freeResources: z.array(ResourceSchema).describe('A list of high-quality, free-to-access learning resources.'),
  premiumResources: z.array(ResourceSchema).describe('A list of high-quality premium or paid learning resources.'),
});

const RoadmapStepSchema = z.object({
  week: z.number().int().describe('The week number for this step in the roadmap.'),
  title: z.string().describe('A concise title for the main focus of this week/step.'),
  subtopics: z.array(SubtopicSchema).describe('A list of specific sub-topics to learn during this step.'),
});

export const RoadmapSchema = z.array(RoadmapStepSchema);
export type Roadmap = z.infer<typeof RoadmapSchema>;

const GenerateRoadmapOutputSchema = z.object({
    roadmap: RoadmapSchema,
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career coach and learning strategist. Your task is to generate a personalized, week-by-week learning roadmap for a user based on their skills, goals, and desired timeline.

User's Details:
- Current Skills: {{#each currentSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Learning Goal: {{{goal}}}
- Desired Timeline: {{{timeline}}}

Instructions:
1.  Analyze the user's starting point and their ultimate goal.
2.  Break down the required learning journey into logical, weekly steps that are achievable within the specified timeline.
3.  For each week, define a clear title for the main focus.
4.  Within each week, list 1-2 specific subtopics.
5.  For each subtopic, provide:
    - A concise description of the topic and its importance.
    - A list of 1-2 high-quality, real, and publicly accessible free resources (articles, videos, tutorials).
    - A list of 0-1 high-quality premium resources (courses, books, certificates). Ensure the URLs are valid.
6.  The final output must be a JSON object containing a 'roadmap' array, strictly adhering to the specified output schema.
7.  The number of weeks in the roadmap should be appropriate for the user's timeline. For a 1-month timeline, generate 3-4 weeks. For 3 months, 8-12 weeks, etc.

Generate the roadmap now.`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
