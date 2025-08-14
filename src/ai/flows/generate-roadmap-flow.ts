
'use server';
/**
 * @fileOverview A Genkit flow for generating a personalized learning roadmap as a graph.
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
  prompt: `You are an expert AI Career Coach and Learning Strategist. Your task is to generate a comprehensive, personalized learning roadmap for a user.

The output must be a single, valid JSON object containing two main parts:
1.  A visual graph representation ('nodes' and 'edges') for the react-flow library.
2.  A detailed, stage-by-stage breakdown of the learning plan ('detailedStages').

**User Profile:**
- **Goal:** {{{goal}}}
- **Timeline:** {{{timeline}}}
- **Weekly Time Commitment:** {{{timePerWeek}}}
- **Learning Style:** {{{learningStyle}}}
- **Resource Preference:** {{{resourceType}}}
- **Current Technical Skills:** {{#each technicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- **Current Non-Technical Skills:** {{#each nonTechnicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Instructions for JSON Generation:**

**Part 1: React Flow Graph ('nodes' and 'edges')**
- Create a clear, hierarchical layout.
- **Vertical Spine:** Design a central vertical spine with fixed phases. Start with 'Basics', move to 'Intermediate', then 'Advanced', and end with 'Future Scope'. These should not be renamed. Position them vertically with a consistent x-coordinate (e.g., x: 0).
- **Branching Topics:** From each phase on the spine, create branches for main topics.
- **Sub-Topics:** From each main topic, create smaller branches for specific skills or technologies. These can also have sub-sub-topics if a concept is complex.
- **Node IDs:** Use a clear and logical ID system (e.g., 'spine-1', 'topic-1-1', 'subtopic-1-1-1').
- **Positioning:** Position nodes logically. The spine should be vertical. Branches should extend horizontally from the spine.
- Every node must have an 'id' (string), 'type' (set to 'roadmapNode'), 'data' (with a 'label' string), and a 'position' ({x, y}).
- Every edge must have an 'id' (e.g., 'e-spine-1-topic-1-1'), 'source', and 'target'.

**Part 2: Detailed Stages ('detailedStages')**
- Dynamically determine the number of stages based on the user's goal and timeline. A 3-month timeline should have more stages than a 1-month timeline.
- For each stage:
    - **stage**: The stage number (e.g., 1).
    - **title**: A descriptive title for the stage.
    - **objective**: A clear goal for what the user will learn in this stage.
    - **subtopics**: An array of AT LEAST 3-4 detailed subtopics.
        - For each subtopic, provide: 'title', 'description', a 'project' idea, and 'freeResources' array.
        - If the user allows premium resources, also include a 'premiumResources' array.
        - Each resource object must have a 'name', 'url', and a 'reason' it's recommended.
    - **estimatedDuration**: An estimate like "1 week" or "10 days".

**Part 3: Final Recommendations**
- **portfolioProjects**: Provide 2-3 project ideas that would be suitable for a portfolio.
- **communities**: Suggest 2-3 online communities or forums.
- **careerTips**: Give advice on next steps after completing the roadmap (e.g., certifications, job search strategies).

Generate a complete and valid JSON object following all instructions. Ensure the content is tailored to the user's profile. Do not include any other text or explanation.`,
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
