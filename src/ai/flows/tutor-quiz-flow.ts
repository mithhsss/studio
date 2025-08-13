'use server';

/**
 * @fileOverview Genkit flows for generating and evaluating quizzes.
 */

import { ai } from '@/ai/genkit';
import type { 
    GenerateQuizInput, 
    GenerateQuizOutput, 
    EvaluateQuizInput, 
    EvaluateQuizOutput 
} from '@/ai/schemas/tutor-schemas';
import { 
    GenerateQuizInputSchema, 
    GenerateQuizOutputSchema, 
    EvaluateQuizInputSchema, 
    EvaluateQuizOutputSchema
} from '@/ai/schemas/tutor-schemas';


/**
 * Generates a quiz based on the user's specifications.
 */
export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateQuizPrompt',
      input: { schema: GenerateQuizInputSchema },
      output: { schema: GenerateQuizOutputSchema },
      prompt: `Generate a quiz based on the following criteria:
Topic: {{{topic}}}
Number of Questions: {{{numQuestions}}}
Difficulty: {{{difficulty}}}

Use a mix of question types (multiple-choice, short-answer, true-false). For multiple-choice, provide 4 options.
Ensure the questions and answers are accurate and align with the specified difficulty level.
Provide a detailed explanation for each correct answer.`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);


/**
 * Evaluates a completed quiz.
 */
export async function evaluateQuiz(input: EvaluateQuizInput): Promise<EvaluateQuizOutput> {
  return evaluateQuizFlow(input);
}

const evaluateQuizFlow = ai.defineFlow(
  {
    name: 'evaluateQuizFlow',
    inputSchema: EvaluateQuizInputSchema,
    outputSchema: EvaluateQuizOutputSchema,
  },
  async ({ questions, userAnswers }) => {
    let correctCount = 0;
    const results = questions.map((q, i) => {
      const isCorrect = q.correctAnswer.toLowerCase().trim() === userAnswers[i].toLowerCase().trim();
      if (isCorrect) {
        correctCount++;
      }
      return {
        question: q.questionText,
        userAnswer: userAnswers[i],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = (correctCount / questions.length) * 100;
    
    // Simple feedback generation logic
    let feedback = '';
    if (score === 100) {
      feedback = "Perfect score! You have an excellent understanding of this topic.";
    } else if (score >= 75) {
      feedback = "Great job! You have a solid grasp of the main concepts. Review the explanations for any questions you missed to solidify your knowledge.";
    } else if (score >= 50) {
      feedback = "Good effort. You understand some of the basics, but there are areas for improvement. Focus on the topics from the questions you answered incorrectly.";
    } else {
      feedback = "It looks like this topic is challenging for you. A review of the fundamental concepts would be a great next step. Don't be discouraged!";
    }

    return { score, results, feedback };
  }
);
