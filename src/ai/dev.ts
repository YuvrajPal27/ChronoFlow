import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-task.ts';
import '@/ai/flows/scrape-website-for-task-details.ts';