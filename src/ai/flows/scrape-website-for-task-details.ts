'use server';
/**
 * @fileOverview This file defines a Genkit flow that scrapes a website for task details and suggests relevant tags.
 *
 * - scrapeWebsiteForTaskDetails - A function that initiates the scraping and categorization process.
 * - ScrapeWebsiteForTaskDetailsInput - The input type for the scrapeWebsiteForTaskDetails function.
 * - ScrapeWebsiteForTaskDetailsOutput - The return type for the scrapeWebsiteForTaskDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { JSDOM } from 'jsdom';

const ScrapeWebsiteForTaskDetailsInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('The description of the task, which may contain a URL.'),
  userDefinedTags: z.array(z.string()).optional().describe('Optional user-defined tags for the task.'),
});
export type ScrapeWebsiteForTaskDetailsInput = z.infer<typeof ScrapeWebsiteForTaskDetailsInputSchema>;

const ScrapeWebsiteForTaskDetailsOutputSchema = z.object({
  suggestedCategory: z.string().describe('The AI-suggested category for the task.'),
  suggestedTags: z.array(z.string()).describe('AI-suggested tags for the task based on the website content.'),
});
export type ScrapeWebsiteForTaskDetailsOutput = z.infer<typeof ScrapeWebsiteForTaskDetailsOutputSchema>;

export async function scrapeWebsiteForTaskDetails(input: ScrapeWebsiteForTaskDetailsInput): Promise<ScrapeWebsiteForTaskDetailsOutput> {
  return scrapeWebsiteForTaskDetailsFlow(input);
}

async function extractContentFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${url} with status ${response.status}`);
      return null;
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const textContent = dom.window.document.body?.textContent || '';
    // Remove extra spaces and newlines
    return textContent.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error(`Error scraping URL: ${url}`, error);
    return null;
  }
}

const prompt = ai.definePrompt({
  name: 'scrapeWebsiteForTaskDetailsPrompt',
  input: {schema: ScrapeWebsiteForTaskDetailsInputSchema},
  output: {schema: ScrapeWebsiteForTaskDetailsOutputSchema},
  prompt: `You are an AI assistant designed to categorize tasks and suggest relevant tags based on a task's description, which may contain a URL to a website.

  Task Title: {{{taskTitle}}}
  Task Description: {{{taskDescription}}}
  User Defined Tags: {{#if userDefinedTags}}{{#each userDefinedTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

  Instructions:
  1. Extract content from the URL provided in the task description, if one exists. If there is no URL, or the URL cannot be accessed, indicate that no website content is available.
  2. Analyze the task title, description, and the extracted website content (if available) to determine the most appropriate category for the task.
  3. Suggest relevant tags that describe the task. Consider any user-defined tags already provided and supplement them with additional tags derived from the website content and task description.

  Output:
  Provide a suggested category and a list of suggested tags.

  Example Output Format:
  {
    "suggestedCategory": "Project Management",
    "suggestedTags": ["planning", "coordination", "deadlines"]
  }
`,
});

const scrapeWebsiteForTaskDetailsFlow = ai.defineFlow(
  {
    name: 'scrapeWebsiteForTaskDetailsFlow',
    inputSchema: ScrapeWebsiteForTaskDetailsInputSchema,
    outputSchema: ScrapeWebsiteForTaskDetailsOutputSchema,
  },
  async input => {
    let websiteContent: string | null = null;
    const urlRegex = /(https?:\/\/[^\\s]+)/g;
    const urls = input.taskDescription.match(urlRegex);

    if (urls && urls.length > 0) {
      // Just get the first URL
      websiteContent = await extractContentFromUrl(urls[0]);
      if (websiteContent) {
        console.log('Successfully scraped content from URL.');
      } else {
        console.warn('Failed to scrape content from URL, proceeding without it.');
      }
    } else {
      console.log('No URL found in task description.');
    }

    const augmentedInput = {
      ...input,
      websiteContent,
    };

    const {output} = await prompt(augmentedInput);
    return output!;
  }
);
