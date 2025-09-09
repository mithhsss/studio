'use server';

/**
 * @fileOverview A Genkit flow for providing a real-world scenario sandbox for a user to apply their knowledge.
 */

import { ai } from '@/ai/genkit';
import type { ScenarioSandboxInput, ScenarioSandboxOutput } from '@/ai/schemas/tutor-schemas';
import { ScenarioSandboxInputSchema, ScenarioSandboxOutputSchema } from '@/ai/schemas/tutor-schemas';

export async function scenarioSandbox(input: ScenarioSandboxInput): Promise<ScenarioSandboxOutput> {
  return scenarioSandboxFlow(input);
}

const prompt = ai.definePrompt({
    name: 'scenarioSandboxPrompt',
    input: { schema: ScenarioSandboxInputSchema },
    output: { schema: ScenarioSandboxOutputSchema },
    prompt: `You are an AI Tutor running a Scenario Sandbox session. Your goal is to give the user a real-world problem where they can apply their knowledge of a specific topic.

Topic: {{{topic}}}

Follow these rules:
- If the chat history is empty, start by generating a relevant and practical real-world problem or project scenario that requires knowledge of the topic.
- The scenario should challenge the user to think critically.
- Guide the user step-by-step. After presenting the initial scenario, ask them how they would proceed.
- Wait for their response before revealing the next step or providing more information.
- Provide feedback on their approach and ask follow-up questions.
- Use Markdown for clear formatting (headings, lists, code blocks).
- Keep your tone professional but encouraging.

Conversation History:
{{#each chatHistory}}
{{#if this.user}}
User: {{{this.user}}}
{{/if}}
{{#if this.model}}
Tutor: {{{this.model}}}
{{/if}}
{{/each}}

Based on the conversation history, provide the next response as the Tutor.`,
});

const scenarioSandboxFlow = ai.defineFlow(
  {
    name: 'scenarioSandboxFlow',
    inputSchema: ScenarioSandboxInputSchema,
    outputSchema: ScenarioSandboxOutputSchema,
  },
  async (input) => {
    // Reformat chat history for Handlebars compatibility
    const formattedHistory = input.chatHistory.map(msg => {
      if (msg.role === 'user') {
        return { user: msg.content };
      } else {
        return { model: msg.content };
      }
    });
    
    const { output } = await prompt({
        ...input,
        chatHistory: formattedHistory,
    });
    return output!;
  }
);
