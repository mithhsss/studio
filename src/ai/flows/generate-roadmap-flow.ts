
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
  prompt: `You are an expert AI Career Coach and Learning Strategist. Your task is to generate a dynamic, multi-stage learning roadmap based on the user's detailed profile.

**User Profile:**
- **Goal:** {{{goal}}}
- **Timeline:** {{{timeline}}}
- **Time Commitment:** {{{timePerWeek}}} per week
- **Current Technical Skills:** {{#each technicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- **Current Non-Technical Skills:** {{#each nonTechnicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- **Learning Style:** {{{learningStyle}}}
- **Preferred Resources:** {{{resourceType}}}

**Instructions:**
1.  **Analyze and Design Dynamic Stages:**
    - The number of stages is not fixed. Determine them dynamically based on the gap between current skills and the user's goal.
    - Each stage should represent a logical progression from foundational to advanced concepts. A stage is typically a week.
    - If the user is advanced, skip beginner stages and focus on depth.
    - If the timeline is short, compress topics into fewer, more intensive stages.
2.  **For Each Stage, Provide:**
    - **stage:** A number representing the week (e.g., 1, 2).
    - **title:** A clear, customized name for the stage.
    - **objective:** A concise statement of the learning goals for this stage.
    - **subtopics:** Generate a list of AT LEAST 3-4 detailed subtopics. For each subtopic:
        - **title & description:** A clear title and a descriptive paragraph.
        - **freeResources:** A list of free resources (articles, videos, tutorials). For each, provide the name, a valid URL, and a brief reason why it's useful.
        - **premiumResources:** A list of premium resources (courses, books), if the user allows. Include name, URL, and justification.
        - **project:** Suggest a practical project or exercise to apply the knowledge.
    - **estimatedDuration:** Provide a time estimate (e.g., in weeks or days) based on the user's weekly time commitment.
3.  **Final Roadmap Output:**
    - The final JSON output must contain a single 'roadmap' object.
    - This 'roadmap' object MUST contain four properties: 'stages', 'portfolioProjects', 'communities', and 'careerTips'.
    - **stages**: This MUST be an array of stage objects, as described above. This is the most critical part.
    - **portfolioProjects**: Suggest 2-3 project ideas to showcase their new skills.
    - **communities**: Recommend 2-3 relevant online communities, forums, or networking platforms with their URLs.
    - **careerTips**: Offer advice on certifications or career steps to take after completing the roadmap.

Return the entire plan in the specified structured JSON format. Ensure all required fields, especially the 'stages' array, are populated correctly.`,
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
