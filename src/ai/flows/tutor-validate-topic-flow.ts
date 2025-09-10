
'use server';

/**
 * @fileOverview A Genkit flow for validating a user-provided topic for the interactive tutor.
 */

import { ai } from '@/ai/genkit';
import {
  ValidateTopicInputSchema,
  ValidateTopicOutputSchema,
  type ValidateTopicInput,
  type ValidateTopicOutput,
} from '@/ai/schemas/tutor-schemas';

export async function validateTopic(
  input: ValidateTopicInput
): Promise<ValidateTopicOutput> {
  return validateTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateTopicPrompt',
  input: { schema: ValidateTopicInputSchema },
  output: { schema: ValidateTopicOutputSchema },
  prompt: `You are a topic validation expert for an AI learning platform.
Your task is to determine if the user's input is a valid, specific, and reasonable topic for a learning session.

The topic must NOT be:
- A greeting (e.g., "hello", "good morning")
- A question (e.g., "how are you?")
- Nonsense or a random string of characters
- Overly broad or ambiguous (e.g., "history", "science")
- A command (e.g., "write me a story")

The topic SHOULD be a concept, skill, or subject that can be taught, such as "JavaScript Promises", "Photosynthesis", "How to negotiate a salary", or "The basics of chess".

User's Topic: "{{{topic}}}"

Analyze the topic and return a JSON object with 'isValid' and a 'reason'.
- If the topic is valid, set isValid to true and reason to an empty string.
- If the topic is invalid, set isValid to false and provide a brief, user-friendly reason (e.g., "This sounds like a greeting. Please provide a topic you'd like to learn about.").`,
});

const validateTopicFlow = ai.defineFlow(
  {
    name: 'validateTopicFlow',
    inputSchema: ValidateTopicInputSchema,
    outputSchema: ValidateTopicOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
