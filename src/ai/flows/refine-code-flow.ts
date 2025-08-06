'use server';

/**
 * @fileOverview A Genkit flow for refining existing code based on user prompts.
 *
 * - refineCode - A function that takes existing code files and a prompt, and returns the modified files.
 * - RefineCodeInput - The input type for the refineCode function.
 * - RefineCodeOutput - The return type for the refineCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FileSchema = z.object({
  filename: z.string().describe('The name of the file.'),
  code: z.string().describe('The complete code content of the file.'),
});

const RefineCodeInputSchema = z.object({
  prompt: z.string().describe("The user's instruction for how to modify the code."),
  files: z.array(FileSchema).describe('An array of the current code files to be modified.'),
});
export type RefineCodeInput = z.infer<typeof RefineCodeInputSchema>;

const RefineCodeOutputSchema = z.object({
    modifiedFiles: z.array(FileSchema).describe('An array of only the files that were modified, including their full updated code.')
});
export type RefineCodeOutput = z.infer<typeof RefineCodeOutputSchema>;

export async function refineCode(input: RefineCodeInput): Promise<RefineCodeOutput> {
  return refineCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineCodePrompt',
  input: {schema: RefineCodeInputSchema},
  output: {schema: RefineCodeOutputSchema},
  prompt: `You are an expert software developer who modifies code based on user requests.
Your task is to analyze the user's prompt and the provided code files. You must then return a list of *only the files that need to be changed*. For each changed file, you must return the *complete, updated code content*.

User's Request:
"{{{prompt}}}"

Current Code Files:
{{#each files}}
---
File: {{{this.filename}}}
\`\`\`
{{{this.code}}}
\`\`\`
---
{{/each}}

Carefully review the request and the files, apply the changes, and return the result in the specified format. Do not return files that were not changed.`,
});

const refineCodeFlow = ai.defineFlow(
  {
    name: 'refineCodeFlow',
    inputSchema: RefineCodeInputSchema,
    outputSchema: RefineCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
