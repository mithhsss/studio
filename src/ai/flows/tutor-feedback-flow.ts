
'use server';

/**
 * @fileOverview A Genkit flow for providing feedback on an interactive learning session.
 */

import { ai } from '@/ai/genkit';
import { TutorFeedbackInputSchema, TutorFeedbackOutputSchema, type TutorFeedbackInput, type TutorFeedbackOutput } from '@/ai/schemas/tutor-schemas';


export async function getTutorFeedback(input: TutorFeedbackInput): Promise<TutorFeedbackOutput> {
    return getTutorFeedbackFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getTutorFeedbackPrompt',
    input: { schema: TutorFeedbackInputSchema },
    output: { schema: TutorFeedbackOutputSchema },
    prompt: `You are an AI Tutor summarizing a learning session. The user has finished an interactive lesson on the topic of '{{{topic}}}'.
Analyze the entire conversation provided in the chat history and generate a comprehensive feedback report.

**Your Task:**

1.  **Performance Score**: Act as a strict but fair evaluator. Base the score from 0 to 10 on the user's answers, engagement, and demonstrated understanding. A perfect 10 requires mastery. Penalize incorrect answers and award points for clear, correct explanations. Do not give high scores for effort alone.
2.  **Overall Summary:** Provide a brief summary of what the user learned.
3.  **Strengths:** Identify 1-2 key strengths the user demonstrated during the session (e.g., quick understanding, good questions).
4.  **Areas for Improvement:** Critically identify 1-2 areas where the user struggled or could improve. Be direct but constructive.
5.  **Next Steps:** Suggest 2-3 specific, actionable next steps for the user to continue their learning journey on this topic. This could include related topics, practice exercises, or recommended resources with full URLs if applicable.

**Conversation History:**
{{#each chatHistory}}
{{role}}: {{{content}}}
{{/each}}

Please provide the score and the detailed feedback in the required JSON format.`,
});

const getTutorFeedbackFlow = ai.defineFlow(
  {
    name: 'getTutorFeedbackFlow',
    inputSchema: TutorFeedbackInputSchema,
    outputSchema: TutorFeedbackOutputSchema,
  },
  async (input) => {
    // Reformat chat history for Handlebars compatibility
    const formattedHistory = input.chatHistory.map(msg => {
      if (msg.role === 'user') {
        return { role: 'User', content: msg.content };
      } else {
        return { role: 'Tutor', content: msg.content };
      }
    });

    const { output } = await prompt({
        ...input,
        chatHistory: formattedHistory,
    });
    return output!;
  }
);
