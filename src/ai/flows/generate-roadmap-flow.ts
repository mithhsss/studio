'use server';

/**
 * @fileOverview A Genkit flow for generating a personalized learning roadmap.
 * This flow now focuses ONLY on generating the textual content of the roadmap.
 * The visual graph is generated on the client-side from this data.
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
  prompt: `You are an expert AI Career Coach and Learning Strategist. Your task is to generate a comprehensive, personalized learning plan based on the user's profile.

The output must be a single, valid JSON object.

**User Profile:**
- **Goal:** {{{goal}}}
- **Timeline:** {{{timeline}}}
- **Weekly Time Commitment:** {{{timePerWeek}}}
- **Learning Style:** {{{learningStyle}}}
- **Resource Preference:** {{{resourceType}}}
- **Current Technical Skills:** {{#if technicalSkills}}{{#each technicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}
- **Current Non-Technical Skills:** {{#if nonTechnicalSkills}}{{#each nonTechnicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None listed{{/if}}

**Instructions for JSON Generation:**

**Part 1: Hierarchical Topics ('topics')**
- Create a 'topics' array. This array should contain a number of main topic objects appropriate for the user's goal and timeline, ensuring there are AT LEAST 5 main topics,— but in most cases, try to provide MORE THAN 5 unless the timeline is very short.
- For each main topic object:
    - **id**: A unique string identifier.
    - **label**: A descriptive title for the main topic (e.g., "Data Engineering Fundamentals").
    - **subtopics**: An array of subtopic objects.
        - For each subtopic object:
            - **label**: The title of the subtopic (e.g., "Databases").
            - **subs**: An array of AT LEAST 2-3 sub-subtopic strings (e.g., "SQL Basics", "NoSQL Overview"). This is mandatory,but again, try to include more than the minimum when possible.

**Part 2: Detailed Stages ('detailedStages')**
- Create a 'detailedStages' array corresponding to the main topics.
- For each stage in the array:
    - **stage**: The stage number (e.g., 1).
    - **title**: A descriptive title for the stage.
    - **objective**: A clear goal for what the user will learn in this stage.
    - **subtopics**: An array of AT LEAST 3-4 detailed subtopics,but ideally MORE for deeper coverage.
        - For each subtopic, provide: 'title', 'description', a 'project' idea, and 'freeResources' array.
        - If the user allows premium resources, also include a 'premiumResources' array.
        - Each resource object must have a 'name', 'url', and a 'reason' it's recommended.
    - **estimatedDuration**: An estimate like "1 week" or "10 days".

**Part 3: Final Recommendations (in the root of the JSON)**
- **portfolioProjects**: Provide an array of 2-3 project ideas that would be suitable for a portfolio. Each object in the array should have a 'name' and 'description'.
- **communities**: Suggest an array of 2-3 online communities or forums. Each object should have a 'name' and 'url'.
- **careerTips**: Give a string of advice on next steps after completing the roadmap (e.g., certifications, job search strategies).

Generate a complete and valid JSON object following all instructions. Ensure the content is tailored to the user's profile. Do not include any other text, markdown, or explanation outside of the JSON object.`,
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
