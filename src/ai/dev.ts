
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-career-questions.ts';
import '@/ai/flows/analyze-resume-flow.ts';
import '@/ai/flows/generate-outline-flow.ts';
import '@/ai/flows/generate-draft-flow.ts';
import '@/ai/flows/generate-ideas-flow.ts';
import '@/ai/flows/refine-content-flow.ts';
import '@/ai/flows/chat-with-idea-flow.ts';
import '@/ai/flows/combine-ideas-flow.ts';
import '@/ai/flows/expand-idea-flow.ts';
import '@/ai/flows/tutor-interactive-learn-flow.ts';
import '@/ai/flows/tutor-quiz-flow.ts';
import '@/ai/flows/tutor-scenario-flow.ts';
import '@/ai/flows/generate-roadmap-flow.ts';
import '@/ai/schemas/tutor-schemas.ts';
import '@/ai/flows/mock-interview-flow.ts';
import '@/ai/flows/generate-strategy-flow.ts';
