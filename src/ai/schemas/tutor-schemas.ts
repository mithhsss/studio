/**
 * @fileOverview Zod schemas and TypeScript types for the AI Tutor flows.
 */
import { z } from 'zod';

// Schemas for Interactive Learn Flow
export const InteractiveLearnInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation so far.'),
});
export type InteractiveLearnInput = z.infer<typeof InteractiveLearnInputSchema>;

export const InteractiveLearnOutputSchema = z.object({
  response: z.string().describe("The AI tutor's next response in the conversation."),
});
export type InteractiveLearnOutput = z.infer<typeof InteractiveLearnOutputSchema>;


// Schemas for Quiz Flow
export const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The full text of the quiz question.'),
  questionType: z.enum(['multiple-choice', 'short-answer', 'true-false']).describe('The type of question.'),
  options: z.array(z.string()).optional().describe('A list of options for multiple-choice questions.'),
  correctAnswer: z.string().describe('The correct answer for the question. For multiple-choice, this should be one of the options.'),
  explanation: z.string().describe('A detailed explanation for why the correct answer is right.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

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


// Schemas for Scenario Sandbox Flow
export const ScenarioSandboxInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a scenario.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation so far.'),
});
export type ScenarioSandboxInput = z.infer<typeof ScenarioSandboxInputSchema>;

export const ScenarioSandboxOutputSchema = z.object({
  response: z.string().describe("The AI tutor's next response in the scenario conversation."),
});
export type ScenarioSandboxOutput = z.infer<typeof ScenarioSandboxOutputSchema>;

// Schemas for Roadmap Flow
export const GenerateRoadmapInputSchema = z.object({
  currentSkills: z.array(z.string()).describe('A list of the user\'s current skills.'),
  goal: z.string().describe('The user\'s primary learning or career goal.'),
  timeline: z.string().describe('The desired timeline to achieve the goal (e.g., "1 Month", "3 Months").'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const ResourceSchema = z.object({
  name: z.string().describe('The name of the resource.'),
  url: z.string().url().describe('A direct URL to the resource.'),
});

const SubtopicSchema = z.object({
  title: z.string().describe('The title of the sub-topic.'),
  description: z.string().describe('A brief explanation of what the sub-topic covers and why it is important.'),
  freeResources: z.array(ResourceSchema).describe('A list of high-quality, free-to-access learning resources.'),
  premiumResources: z.array(ResourceSchema).describe('A list of high-quality premium or paid learning resources.'),
});

const RoadmapStepSchema = z.object({
  week: z.number().int().describe('The week number for this step in the roadmap.'),
  title: z.string().describe('A concise title for the main focus of this week/step.'),
  subtopics: z.array(SubtopicSchema).describe('A list of specific sub-topics to learn during this step.'),
});

export const RoadmapSchema = z.array(RoadmapStepSchema);
export type Roadmap = z.infer<typeof RoadmapSchema>;

export const GenerateRoadmapOutputSchema = z.object({
    roadmap: RoadmapSchema,
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;
