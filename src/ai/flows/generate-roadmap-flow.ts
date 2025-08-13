
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
    - Each stage should represent a logical progression from foundational to advanced concepts.
    - If the user is advanced, skip beginner stages and focus on depth.
    - If the timeline is short, compress topics into fewer, more intensive stages.
2.  **For Each Stage, Provide:**
    - **Stage Name:** A clear, customized name for the stage.
    - **Objective:** A concise statement of the learning goals for this stage.
    - **Key Topics:** A bulleted list of essential topics to master.
    - **Free Resources:** A list of free resources (articles, videos, tutorials). For each, provide the name, a valid URL, and a brief reason why it's useful.
    - **Premium Resources:** A list of premium resources (courses, books), if the user allows. Include name, URL, and justification.
    - **Hands-On Practice:** Suggest 1-2 practical projects or exercises to apply the knowledge.
    - **Estimated Duration:** Provide a time estimate (e.g., in weeks or days) based on the user's weekly time commitment.
3.  **Final Roadmap Output:**
    - Present the entire roadmap in a clean, readable Markdown format with clear headings for each stage and section.
    - Conclude the roadmap with the following sections:
        - **Portfolio Project Ideas:** Suggest 2-3 project ideas to showcase their new skills.
        - **Community & Networking:** Recommend 2-3 relevant online communities, forums, or networking platforms.
        - **Career & Certification Tips:** Offer advice on certifications or career steps to take after completing the roadmap.
        - **Sample Weekly Schedule:** Provide an optional, sample weekly learning schedule based on their time commitment.

Generate the comprehensive and personalized roadmap now.`,
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
