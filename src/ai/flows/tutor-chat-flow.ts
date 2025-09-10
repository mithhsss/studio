
'use server';

/**
 * @fileOverview A Genkit flow for a simple conversational chatbot within the AI Tutor.
 */

import { ai } from '@/ai/genkit';
import type { TutorChatInput, TutorChatOutput } from '@/ai/schemas/tutor-schemas';
import { TutorChatInputSchema, TutorChatOutputSchema } from '@/ai/schemas/tutor-schemas';

export async function tutorChat(input: TutorChatInput): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}

const prompt = ai.definePrompt({
    name: 'tutorChatPrompt',
    input: { schema: TutorChatInputSchema },
    output: { schema: TutorChatOutputSchema },
    prompt: `You are a helpful and encouraging AI Tutor. Your goal is to answer the user's questions clearly and concisely.

Conversation History:
{{#each chatHistory}}
{{#if (eq this.role 'user')}}
User: {{{this.content}}}
{{else}}
Tutor: {{{this.content}}}
{{/if}}
{{/each}}

Based on the conversation history, provide the next response as the Tutor.`,
});

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
