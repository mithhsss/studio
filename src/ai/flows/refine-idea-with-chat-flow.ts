
'use server';

/**
 * @fileOverview A Genkit flow for finalizing an idea based on a chat history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { IdeaSchema } from '../schemas/idea-generation-schemas';

const RefineWithChatInputSchema = z.object({
    idea: IdeaSchema.describe("The original creative idea before the refinement conversation."),
    chatHistory: z.array(z.object({
        sender: z.enum(['user', 'ai']),
        text: z.string()
    })).describe("The full conversation history between the user and the AI about refining the idea.")
});

const RefineWithChatOutputSchema = z.object({
    refinedIdea: z.object({
        title: z.string().describe('The finalized title for the idea, incorporating feedback from the chat.'),
        shortDesc: z.string().describe('The finalized one-sentence summary for the idea.'),
        longDesc: z.string().describe('The finalized detailed paragraph for the idea.'),
        previewPoints: z.array(z.string()).length(2).describe('The two finalized key bullet points that highlight the most exciting aspects.'),
    }).describe("The fully refined idea after processing the conversation.")
});

export type RefineWithChatInput = z.infer<typeof RefineWithChatInputSchema>;
export type RefineWithChatOutput = z.infer<typeof RefineWithChatOutputSchema>;


export async function refineIdeaWithChatHistory(input: RefineWithChatInput): Promise<RefineWithChatOutput> {
  return refineIdeaWithChatHistoryFlow(input);
}


const prompt = ai.definePrompt({
  name: 'refineIdeaWithChatPrompt',
  input: { schema: RefineWithChatInputSchema },
  output: { schema: RefineWithChatOutputSchema },
  prompt: `You are an expert idea synthesizer. Your task is to analyze a creative idea and the subsequent refinement conversation, and then produce a final, updated version of the idea.

**Original Idea:**
- Title: {{{idea.title}}}
- Short Description: {{{idea.shortDesc}}}
- Long Description: {{{idea.longDesc}}}
- Preview Points:
  - {{{idea.previewPoints.0}}}
  - {{{idea.previewPoints.1}}}

**Refinement Conversation:**
{{#each chatHistory}}
{{#if (eq this.sender 'user')}}User: {{else}}AI: {{/if}}{{{this.text}}}
{{/each}}

**Your Task:**
Based on the entire conversation, update the idea's title, short description, long description, and two preview points to reflect the user's feedback and the agreed-upon changes.

Produce a single JSON object containing the 'refinedIdea' with all the updated fields.`,
});


const refineIdeaWithChatHistoryFlow = ai.defineFlow(
  {
    name: 'refineIdeaWithChatHistoryFlow',
    inputSchema: RefineWithChatInputSchema,
    outputSchema: RefineWithChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
