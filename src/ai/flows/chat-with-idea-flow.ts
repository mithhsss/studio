'use server';

/**
 * @fileOverview A Genkit flow for having a conversation about a specific creative idea.
 *
 * - chatWithIdea - A function that takes an idea and a user message and returns a conversational response.
 * - ChatWithIdeaInput - The input type for the chatWithIdea function.
 * - ChatWithIdeaOutput - The return type for the chatWithIdea function.
 */

import { ai } from '@/ai/genkit';
import { ChatWithIdeaInputSchema, ChatWithIdeaOutputSchema, type ChatWithIdeaInput, type ChatWithIdeaOutput } from '../schemas/idea-generation-schemas';

export async function chatWithIdea(input: ChatWithIdeaInput): Promise<ChatWithIdeaOutput> {
  return chatWithIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithIdeaPrompt',
  input: { schema: ChatWithIdeaInputSchema },
  output: { schema: ChatWithIdeaOutputSchema },
  prompt: `You are a creative strategist helping a user refine an idea. The user has selected an idea and has a question about it.

Current Idea:
- Title: {{{idea.title}}}
- Summary: {{{idea.shortDesc}}}
- Details: {{{idea.longDesc}}}

User's Message: "{{{message}}}"

Provide a helpful, conversational response to the user's message. Be encouraging and help them think through their idea.`,
});


const chatWithIdeaFlow = ai.defineFlow(
  {
    name: 'chatWithIdeaFlow',
    inputSchema: ChatWithIdeaInputSchema,
    outputSchema: ChatWithIdeaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
