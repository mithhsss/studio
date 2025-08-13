
'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized learning roadmap.
 */

import {ai} from '@/ai/genkit';
import { GenerateRoadmapInputSchema, GenerateRoadmapOutputSchema, type GenerateRoadmapInput, type GenerateRoadmapOutput } from '@/ai/schemas/tutor-schemas';


export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert career coach and learning strategist for professionals. Your task is to generate a highly detailed, personalized, week-by-week learning roadmap for a user based on their skills, goals, and desired timeline.

User's Details:
- Current Skills: {{#each currentSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Learning Goal: {{{goal}}}
- Desired Timeline: {{{timeline}}}

Instructions:
1.  Analyze the user's starting point and their ultimate goal with a professional audience in mind.
2.  Break down the required learning journey into a significant number of logical, weekly steps that are achievable within the specified timeline.
3.  For each week, define a clear, professional title for the main focus.
4.  Within each week, list a minimum of 3-4 specific, in-depth subtopics.
5.  For each subtopic, provide:
    - A concise description of the topic and its importance in a professional context.
    - A list of 1-2 high-quality, real, and publicly accessible free resources (articles, videos, tutorials).
    - A list of 0-1 high-quality premium resources (courses, books, certificates). Ensure the URLs are valid.
6.  The final output must be a JSON object containing a 'roadmap' array, strictly adhering to the specified output schema.
7.  The number of weeks in the roadmap should be appropriate for the user's timeline. For a 1-month timeline, generate 3-4 weeks. For 3 months, 8-12 weeks, etc.

Generate the comprehensive professional roadmap now.`,
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
