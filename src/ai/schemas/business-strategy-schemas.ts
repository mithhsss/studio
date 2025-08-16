
/**
 * @fileOverview Zod schemas and TypeScript types for the Business Strategy Analysis flow.
 */
import { z } from 'genkit';

export const GenerateStrategyInputSchema = z.object({
  businessIdea: z.string().describe('A detailed description of the business idea to be analyzed.'),
});
export type GenerateStrategyInput = z.infer<typeof GenerateStrategyInputSchema>;

const SWOTSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

const PESTLESchema = z.object({
  political: z.array(z.string()),
  economic: z.array(z.string()),
  social: z.array(z.string()),
  technological: z.array(z.string()),
  legal: z.array(z.string()),
  environmental: z.array(z.string()),
});

const PortersForceSchema = z.object({
  force: z.string(),
  level: z.enum(['Low', 'Moderate', 'High']),
  points: z.array(z.string()),
});

const CATWOESchema = z.object({
  customers: z.array(z.string()),
  actors: z.array(z.string()),
  transformation: z.array(z.string()),
  worldview: z.array(z.string()),
  owner: z.array(z.string()),
  environmental: z.array(z.string()),
});

const MarketSizeSchema = z.object({
  tam: z.string().describe('Total Addressable Market'),
  sam: z.string().describe('Serviceable Addressable Market'),
  som: z.string().describe('Serviceable Obtainable Market'),
});

const SuccessRoadmapStepSchema = z.object({
    step: z.number().describe("The step number (1-10)."),
    title: z.string().describe("A concise title for the step."),
    description: z.string().describe("A brief explanation of the action or milestone for this step."),
});

export const GenerateStrategyOutputSchema = z.object({
  viabilityScore: z.number().min(0).max(10),
  scoreJustification: z.string(),
  coreIdea: z.string(),
  usp: z.string(),
  swot: SWOTSchema,
  pestle: PESTLESchema,
  porters: z.array(PortersForceSchema),
  catwoe: CATWOESchema,
  marketSize: MarketSizeSchema,
  successRoadmap: z.array(SuccessRoadmapStepSchema).length(10).describe("A 10-step roadmap to success for the business idea."),
});
export type GenerateStrategyOutput = z.infer<typeof GenerateStrategyOutputSchema>;
