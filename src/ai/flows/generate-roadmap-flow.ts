
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
  prompt: `You are an expert AI Career Coach and Learning Strategist. Your task is to generate a visual learning roadmap as a graph for a user. The output must be a valid JSON object containing 'nodes' and 'edges' for the react-flow library.

**User Profile:**
- **Goal:** {{{goal}}}
- **Timeline:** {{{timeline}}}
- **Current Skills:** {{#each technicalSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Instructions:**

1.  **Create a Core Path:**
    - Design a main vertical spine of 4-6 core concept nodes. These are the major milestones (e.g., 'Foundations', 'Core Tools', 'Advanced Topics', 'Specialization').
    - Assign sequential integer IDs (e.g., '1', '2', '3').
    - Position them vertically with a consistent x-coordinate (e.g., x: 250) and increasing y-coordinates (e.g., y: 0, y: 200, y: 400).
    - Create 'straight' edges to connect these core nodes sequentially.

2.  **Create Topic Branches:**
    - For each core node, create 1-2 major topic branches that logically extend from it.
    - These branch nodes should have IDs prefixed by their parent (e.g., '2-1', '2-2' for children of node '2').
    - Position these branch nodes horizontally away from the main spine (e.g., x: 0 or x: 500).
    - Connect the core node to its main branch nodes with an edge.

3.  **Create Skill Sub-nodes:**
    - For each major topic branch, create 2-4 specific skill or technology sub-nodes.
    - Prefix their IDs appropriately (e.g., '2-1-1', '2-1-2').
    - Position them around their parent topic branch node.
    - Connect the topic branch node to its skill sub-nodes.

4.  **Node and Edge Formatting:**
    - **Nodes:** Every node must have an 'id' (string), 'type' (set to 'roadmapNode'), 'data' (with a 'label' string), and a 'position' (with 'x' and 'y' numbers).
    - **Edges:** Every edge must have an 'id' (e.g., 'e-1-2'), 'source' (parent node id), and 'target' (child node id). Edges connecting the main spine can be styled differently.

**Example Output Structure:**

\`\`\`json
{
  "nodes": [
    { "id": "1", "type": "roadmapNode", "data": { "label": "Core Concept 1" }, "position": { "x": 250, "y": 0 } },
    { "id": "1-1", "type": "roadmapNode", "data": { "label": "Topic Branch A" }, "position": { "x": 500, "y": 0 } },
    { "id": "1-1-1", "type": "roadmapNode", "data": { "label": "Specific Skill" }, "position": { "x": 700, "y": -50 } }
  ],
  "edges": [
    { "id": "e-1-1-1", "source": "1", "target": "1-1" },
    { "id": "e-1-1-1-1-1-1", "source": "1-1", "target": "1-1-1" }
  ]
}
\`\`\`

Generate a complete and valid JSON object for the user's roadmap based on their profile. Do not include any other text or explanation.`,
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
