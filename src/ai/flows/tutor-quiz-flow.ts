'use server';

/**
 * @fileOverview Genkit flows for generating and evaluating quizzes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for a single question in the quiz
export const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The full text of the quiz question.'),
  questionType: z.enum(['multiple-choice', 'short-answer', 'true-false']).describe('The type of question.'),
  options: z.array(z.string()).optional().describe('A list of options for multiple-choice questions.'),
  correctAnswer: z.string().describe('The correct answer for the question. For multiple-choice, this should be one of the options.'),
  explanation: z.string().describe('A detailed explanation for why the correct answer is right.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Schema for generating a quiz
export const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The array of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// Schema for evaluating a quiz
export const EvaluateQuizInputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The original questions that were asked.'),
  userAnswers: z.array(z.string()).describe('The answers provided by the user, in the same order as the questions.'),
});
export type EvaluateQuizInput = z.infer<typeof EvaluateQuizInputSchema>;

export const EvaluateQuizOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('The final score as a percentage.'),
  results: z.array(
    z.object({
      question: z.string(),
      userAnswer: z.string(),
      correctAnswer: z.string(),
      isCorrect: z.boolean(),
      explanation: z.string(),
    })
  ).describe('A detailed breakdown of each answer.'),
  feedback: z.string().describe('Overall feedback for the user, highlighting strong and weak areas.'),
});
export type EvaluateQuizOutput = z.infer<typeof EvaluateQuizOutputSchema>;


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
