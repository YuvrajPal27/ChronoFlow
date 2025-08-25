'use server';

/**
 * @fileOverview AI-powered task categorization flow.
 *
 * - categorizeTask - A function that categorizes a task based on its title and description.
 * - CategorizeTaskInput - The input type for the categorizeTask function.
 * - CategorizeTaskOutput - The return type for the categorizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTaskInputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().describe('The description of the task, which may contain a website url.'),
  userDefinedTags: z.array(z.string()).optional().describe('Optional tags provided by the user.'),
});
export type CategorizeTaskInput = z.infer<typeof CategorizeTaskInputSchema>;

const CategorizeTaskOutputSchema = z.object({
  category: z.string().describe('The predicted category of the task.'),
});
export type CategorizeTaskOutput = z.infer<typeof CategorizeTaskOutputSchema>;

export async function categorizeTask(input: CategorizeTaskInput): Promise<CategorizeTaskOutput> {
  return categorizeTaskFlow(input);
}

const categorizeTaskPrompt = ai.definePrompt({
  name: 'categorizeTaskPrompt',
  input: {schema: CategorizeTaskInputSchema},
  output: {schema: CategorizeTaskOutputSchema},
  prompt: `You are an AI assistant designed to categorize tasks based on their titles and descriptions.

  Analyze the following task information and determine the most appropriate category.

  Title: {{{title}}}
  Description: {{{description}}}
  User Defined Tags: {{#if userDefinedTags}}{{#each userDefinedTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

  Return ONLY the predicted category.`,
});

const categorizeTaskFlow = ai.defineFlow(
  {
    name: 'categorizeTaskFlow',
    inputSchema: CategorizeTaskInputSchema,
    outputSchema: CategorizeTaskOutputSchema,
  },
  async input => {
    const {output} = await categorizeTaskPrompt(input);
    return output!;
  }
);
