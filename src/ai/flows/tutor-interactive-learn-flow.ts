
'use server';

/**
 * @fileOverview A Genkit flow for providing an interactive, personalized learning session.
 */

import { ai } from '@/ai/genkit';
import type { InteractiveLearnInput, InteractiveLearnOutput } from '@/ai/schemas/tutor-schemas';
import { InteractiveLearnInputSchema, InteractiveLearnOutputSchema } from '@/ai/schemas/tutor-schemas';

export async function interactiveLearn(input: InteractiveLearnInput): Promise<InteractiveLearnOutput> {
  return interactiveLearnFlow(input);
}

const prompt = ai.definePrompt({
    name: 'interactiveLearnPrompt',
    input: { schema: InteractiveLearnInputSchema },
    output: { schema: InteractiveLearnOutputSchema },
    prompt: `You are an expert AI Tutor. Your goal is to provide a personalized, interactive learning session on a specific topic.

Topic: {{{topic}}}

Follow these rules:
- If the chat history is empty, start by introducing the topic and explaining the very first core concept in a simple, easy-to-understand way. Then, ask one clear question to check for understanding.
- Analyze the user's response in the chat history.
- If the user is correct, affirm their understanding, introduce the next logical concept, and ask another question.
- If the user is incorrect or confused, gently correct them, re-explain the concept from a different angle, and ask a new question to solidify their understanding.
- Keep your explanations concise (2-3 paragraphs) and always end with a single question.
- Maintain a professional, encouraging, and patient tone.
- Use Markdown for clear formatting (headings, lists, bold text, code blocks).

Conversation History (User and you, the AI Tutor):
{{#each chatHistory}}
{{#if (eq role 'user')}}
User: {{{content}}}
{{else}}
Tutor: {{{content}}}
{{/if}}
{{/each}}

Based on the full conversation history, provide the Tutor's next response. Remember to explain a concept and then ask a question.`,
});


const interactiveLearnFlow = ai.defineFlow(
  {
    name: 'interactiveLearnFlow',
    inputSchema: InteractiveLearnInputSchema,
    outputSchema: InteractiveLearnOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
