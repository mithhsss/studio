'use server';

/**
 * @fileOverview A Genkit flow for conducting an interactive learning session with a user.
 */

import { ai } from '@/ai/genkit';
import type { InteractiveLearnInput, InteractiveLearnOutput } from '@/ai/schemas/tutor-schemas';
import { InteractiveLearnInputSchema, InteractiveLearnOutputSchema } from '@/ai/schemas/tutor-schemas';

export async function interactiveLearn(input: InteractiveLearnInput): Promise<InteractiveLearnOutput> {
  return interactiveLearnFlow(input);
}

const interactiveLearnFlow = ai.defineFlow(
  {
    name: 'interactiveLearnFlow',
    inputSchema: InteractiveLearnInputSchema,
    outputSchema: InteractiveLearnOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'interactiveLearnPrompt',
        input: { schema: InteractiveLearnInputSchema },
        output: { schema: InteractiveLearnOutputSchema },
        prompt: `You are an AI Tutor engaging in an interactive learning session.
Your goal is to teach the user about the specified topic in a conversational, adaptive way.

Topic: {{{topic}}}

Follow these rules:
- If the chat history is empty, start by asking the user what they already know and where they'd like to begin (basics, intermediate, advanced).
- Teach concepts in small, digestible chunks.
- After explaining a concept, ask a short comprehension question to check their understanding.
- Provide feedback and adapt your explanation if the learner struggles.
- Use real-world analogies and examples.
- Use Markdown for clear formatting (headings, lists, code blocks).
- Keep your tone friendly, supportive, and encouraging.

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
    
    const { output } = await prompt(input);
    return output!;
  }
);
