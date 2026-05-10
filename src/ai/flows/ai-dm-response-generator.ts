'use server';
/**
 * @fileOverview An AI agent for generating creative and effective direct message responses.
 *
 * - aiDmResponseGenerator - A function that handles the generation of DM responses.
 * - AiDmResponseGeneratorInput - The input type for the aiDmResponseGenerator function.
 * - AiDmResponseGeneratorOutput - The return type for the aiDmResponseGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDmResponseGeneratorInputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of keywords that trigger the direct message automation.'),
  campaignGoal: z.string().describe('The overall goal or objective of the direct message campaign (e.g., drive traffic to product page, increase newsletter sign-ups, promote a new offer).'),
  tone: z.string().optional().describe('The desired tone for the direct message (e.g., friendly, professional, exciting, informative). If not provided, a friendly and engaging tone should be used.'),
});
export type AiDmResponseGeneratorInput = z.infer<typeof AiDmResponseGeneratorInputSchema>;

const AiDmResponseGeneratorOutputSchema = z.object({
  suggestedResponse: z.string().describe('A creative and effective direct message response based on the provided keywords, campaign goal, and tone.'),
});
export type AiDmResponseGeneratorOutput = z.infer<typeof AiDmResponseGeneratorOutputSchema>;

export async function aiDmResponseGenerator(input: AiDmResponseGeneratorInput): Promise<AiDmResponseGeneratorOutput> {
  return aiDmResponseGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDmResponseGeneratorPrompt',
  input: {schema: AiDmResponseGeneratorInputSchema},
  output: {schema: AiDmResponseGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in crafting engaging and effective Instagram direct messages for marketing automations.

Your task is to generate a direct message response based on the following information:

Keywords that triggered the DM: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Campaign Goal: {{{campaignGoal}}}

{{#if tone}}Desired Tone: {{{tone}}}{{else}}Desired Tone: Friendly and engaging{{/if}}

Create a concise, persuasive, and engaging direct message that aligns with the campaign goal and the specified keywords. The message should encourage interaction or direct the user to the next desired action.

Suggested Response:`,
});

const aiDmResponseGeneratorFlow = ai.defineFlow(
  {
    name: 'aiDmResponseGeneratorFlow',
    inputSchema: AiDmResponseGeneratorInputSchema,
    outputSchema: AiDmResponseGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
