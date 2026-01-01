'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-and-randomize-news.ts';
import '@/ai/flows/ootd-generator-flow.ts';
import '@/ai/flows/travel-recommender-flow.ts';
import '@/ai/flows/ootd-generator-runware.ts';
import '@/ai/flows/science-fact-flow.ts';
import '@/ai/flows/random-walk-flow.ts';
import '@/ai/flows/today-cooking-flow.ts';
