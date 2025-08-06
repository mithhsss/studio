'use server';

/**
 * @fileOverview A Genkit flow for generating code components based on user specifications.
 *
 * - generateCode - A function that takes a component blueprint and returns generated code and anatomy.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  description: z.string().describe('A detailed description of the component to be generated.'),
  framework: z.string().describe('The frontend framework (e.g., React, Vue, Svelte).'),
  language: z.string().describe('The programming language (e.g., JavaScript, TypeScript).'),
  styling: z.string().describe('The styling solution (e.g., Tailwind CSS, CSS Modules, Styled Components).'),
  techStack: z.string().describe('Associated technologies (e.g., Next.js, Vite, Firebase).'),
  schema: z.string().optional().describe('An optional data schema (e.g., JSON) to guide code generation.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  files: z.array(z.object({
    filename: z.string().describe('The name of the generated file (e.g., "pricing-table.jsx").'),
    code: z.string().describe('The complete code content for the file.'),
  })).describe('An array of generated files, including filenames and their code content.'),
  anatomy: z.object({
      visualStructure: z.string().describe('A tree-like representation of the component\'s HTML/JSX structure.'),
      propsAndState: z.array(z.string()).describe('A list of the component\'s props and internal state variables.'),
      dependencies: z.array(z.string()).describe('A list of external libraries or internal modules the component depends on (e.g., "react", "prop-types"). Provide exact package names for dependencies.'),
      logicExplanation: z.string().describe('A brief explanation of the component\'s core logic.'),
  }).describe('A detailed breakdown of the generated component\'s architecture.')
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are an expert software developer specializing in creating high-quality frontend components. Your task is to generate a complete, production-ready component based on the user's specifications.

You must return a structured response containing:
1.  An array of file objects, each with a \`filename\` and its corresponding \`code\`. Generate all necessary files, such as JSX/TSX components, CSS/styling files, and storybook files if applicable.
2.  A detailed component \`anatomy\` breaking down its structure, props, state, dependencies, and logic. For dependencies, list the exact npm package names (e.g., "react", "prop-types").

User Specifications:
- Component Description: {{{description}}}
- Framework: {{{framework}}}
- Language: {{{language}}}
- Styling: {{{styling}}}
- Tech Stack: {{{techStack}}}
{{#if schema}}
- Data Schema Example:
\`\`\`
{{{schema}}}
\`\`\`
{{/if}}

Generate the component and its anatomy according to these specifications. Ensure the code is clean, well-commented, and follows best practices for the specified framework and language.`,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
