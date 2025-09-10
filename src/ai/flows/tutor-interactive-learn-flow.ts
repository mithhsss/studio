
'use server';

/**
 * @fileOverview A Genkit flow for providing a step-by-step interactive learning session.
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
    prompt: `You are Interactive Learn, an AI-powered tutor that teaches topics in a conversational, step-by-step manner.

Your goal is to break a chosen topic into smaller subtopics and guide the user through them one by one.

**Rules:**

1.  **VALIDATE TOPIC FIRST:** If the chat history is empty, the user has just provided the topic '{{{topic}}}'. First, you must determine if this is a valid educational topic.
    *   If the topic is **invalid** (e.g., a greeting like "hello", a question, a random statement, or nonsense), your response must be to politely ask the user to provide a real, specific topic they want to learn about. DO NOT start a lesson.
    *   If the topic is **valid**, your first response must be to greet the user, acknowledge the topic, and introduce the first subtopic you will explain.
2.  **Explain & Question:** In each turn, explain ONE subtopic clearly and concisely. After explaining, ALWAYS ask one simple, direct question to check the user's understanding of that specific subtopic.
3.  **Evaluate & Respond:**
    *   **If the user's answer is correct:** Provide positive feedback (e.g., "Exactly!", "That's right!") and then smoothly transition to explaining the NEXT subtopic.
    *   **If the user's answer is incorrect:** Gently correct them. Re-explain the concept in a simpler way, and then ask a NEW, slightly different question to re-check their understanding of the SAME subtopic.
    *   **If the user doesn't answer the question:** Politely guide them back to answering the question you asked.
4.  **Maintain Conversation:** Keep the tone friendly, encouraging, and engaging. Address the user directly.
5.  **Conclusion:** Once all subtopics are covered and the user has shown understanding, provide a brief summary of the main topic and congratulate them.

**Conversation History:**
{{#each chatHistory}}
{{#if this.user}}
User: {{{this.user}}}
{{/if}}
{{#if this.model}}
Tutor: {{{this.model}}}
{{/if}}
{{/each}}

Based on the rules and the conversation history, provide the Tutor's next response. Remember to validate the topic first if it's the beginning of the conversation. Otherwise, explain, then ask a question.`,
});

const interactiveLearnFlow = ai.defineFlow(
  {
    name: 'interactiveLearnFlow',
    inputSchema: InteractiveLearnInputSchema,
    outputSchema: InteractiveLearnOutputSchema,
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
