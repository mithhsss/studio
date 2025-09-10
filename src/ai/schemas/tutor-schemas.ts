
/**
 * @fileOverview Zod schemas and TypeScript types for the AI Tutor flows.
 */
import { z } from 'zod';

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
  technicalSkills: z.array(z.string()).describe("A list of the user's current technical skills."),
  nonTechnicalSkills: z.array(z.string()).describe("A list of the user's current non-technical skills."),
  goal: z.string().describe("The user's primary learning or career goal."),
  timePerWeek: z.string().describe("The amount of time the user can commit to learning per week."),
  learningStyle: z.enum(['videos', 'reading', 'hands-on', 'mixed']).describe("The user's preferred learning style."),
  resourceType: z.enum(['free', 'premium', 'both']).describe("The user's preference for free or paid resources."),
  timeline: z.string().describe('The desired timeline to achieve the goal (e.g., "1 Month", "3 Months").'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const ResourceSchema = z.object({
  name: z.string().describe('The name or title of the resource.'),
  url: z.string().describe('A valid URL link to the resource.'),
  reason: z.string().describe('A brief justification for why this resource is being recommended.'),
});

const RoadmapStageSchema = z.object({
  stage: z.number().describe('The stage number or week in the roadmap (e.g., 1, 2, 3).'),
  title: z.string().describe('A clear, customized name for the stage (e.g., "Week 1: Foundations of UX").'),
  objective: z.string().describe('A concise statement of the learning goals for this stage.'),
  subtopics: z.array(z.object({
      title: z.string().describe('The title of this specific subtopic.'),
      description: z.string().describe('A paragraph explaining the subtopic.'),
      freeResources: z.array(ResourceSchema).describe('A list of free resources for learning this subtopic.'),
      premiumResources: z.array(ResourceSchema).optional().describe('A list of premium (paid) resources for this subtopic.'),
      project: z.string().describe('A hands-on practice project or exercise to apply the knowledge from this subtopic.'),
    })).min(3).describe('An array of at least 3-4 detailed subtopics to cover in this stage.'),
  estimatedDuration: z.string().describe("A time estimate for this stage (e.g., \"1 week\", \"10 days\") based on the user's weekly time commitment."),
});

const PortfolioProjectSchema = z.object({
    name: z.string().describe("The name of the portfolio project."),
    description: z.string().describe("A brief description of the project."),
});

const CommunitySchema = z.object({
    name: z.string().describe("The name of the community or platform."),
    url: z.string().describe("A valid URL to the community."),
});


export const GenerateRoadmapOutputSchema = z.object({
    topics: z.array(z.object({
        id: z.string().describe("A unique string identifier for the main topic."),
        label: z.string().describe("The descriptive title for the main topic."),
        subtopics: z.array(z.object({
            label: z.string().describe("The title of the subtopic."),
            subs: z.array(z.string()).optional().describe("An array of sub-subtopic strings.")
        })).describe("An array of subtopic objects."),
    })).describe("A hierarchical list of topics and subtopics for the roadmap graph."),
    detailedStages: z.array(RoadmapStageSchema).describe("An array of detailed, stage-by-stage learning plans."),
    portfolioProjects: z.array(PortfolioProjectSchema).describe("A list of 2-3 project ideas to showcase their new skills."),
    communities: z.array(CommunitySchema).describe("A list of 2-3 relevant online communities, forums, or networking platforms."),
    careerTips: z.string().describe("Advice on certifications or career steps to take after completing the roadmap."),
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

// Schemas for Interactive Learn Flow
export const InteractiveLearnInputSchema = z.object({
  topic: z.string().describe('The main topic the user wants to learn.'),
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
