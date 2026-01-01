'use server';
/**
 * @fileOverview A flow for generating a random recipe of the day.
 *
 * - generateTodaysCooking - A function that suggests a recipe based on a country.
 * - generateRecipeImage - A function that generates an image for a given recipe.
 * - TodaysCookingInput - The input type for the generateTodaysCooking function.
 * - TodaysCookingOutput - The return type for the generateTodaysCooking function.
 * - RecipeImageGeneratorInput - The input type for the generateRecipeImage function.
 * - RecipeImageGeneratorOutput - The return type for the generateRecipeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Text Generation Schemas ---

const TodaysCookingInputSchema = z.object({
  country: z.string().describe('The country of origin for the cuisine (e.g., Indonesia, Italy, Japan).'),
});
export type TodaysCookingInput = z.infer<typeof TodaysCookingInputSchema>;

const TodaysCookingOutputSchema = z.object({
  dishName: z.string().describe('The name of the recommended dish.'),
  description: z.string().describe('A short, appealing description of the dish, including its taste profile and origin.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('A step-by-step list of cooking instructions.'),
});
export type TodaysCookingOutput = z.infer<typeof TodaysCookingOutputSchema>;

// --- Image Generation Schemas ---

const RecipeImageGeneratorInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to be visualized.'),
  description: z.string().describe('A short description of the dish for visual context.'),
  country: z.string().describe('The country of origin for styling cues.'),
});
export type RecipeImageGeneratorInput = z.infer<typeof RecipeImageGeneratorInputSchema>;

const RecipeImageGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type RecipeImageGeneratorOutput = z.infer<typeof RecipeImageGeneratorOutputSchema>;


// --- Exported Functions ---

export async function generateTodaysCooking(input: TodaysCookingInput): Promise<TodaysCookingOutput> {
  return todaysCookingFlow(input);
}

export async function generateRecipeImage(input: RecipeImageGeneratorInput): Promise<RecipeImageGeneratorOutput> {
  return recipeImageGeneratorFlow(input);
}


// --- Genkit Flows ---

const recipePrompt = ai.definePrompt({
  name: 'todaysCookingPrompt',
  input: { schema: TodaysCookingInputSchema },
  output: { schema: TodaysCookingOutputSchema },
  prompt: `You are an expert home cook and recipe creator. Your task is to generate a delicious and approachable recipe from the specified country.

Country of Origin: {{country}}

Instructions:
1.  Choose a popular and representative dish from the given country. The dish should be something a home cook can realistically make. Avoid overly complex or professional-level recipes.
2.  Provide a clear, appealing name for the dish in 'dishName'.
3.  Write a short, enticing description in 'description'. Mention its flavor profile (e.g., savory, spicy, sweet) and what makes it special.
4.  List all necessary ingredients clearly in the 'ingredients' array. Include quantities (e.g., "1 cup flour", "2 tbsp soy sauce").
5.  Provide clear, step-by-step cooking instructions in the 'instructions' array. Each step should be a separate string in the array.
6.  Ensure the entire recipe is practical for a home kitchen.
7.  All output must be in English.

Generate a recipe now.`,
});

const todaysCookingFlow = ai.defineFlow(
  {
    name: 'todaysCookingFlow',
    inputSchema: TodaysCookingInputSchema,
    outputSchema: TodaysCookingOutputSchema,
  },
  async (input) => {
    const { output } = await recipePrompt(input);
    return output!;
  }
);

const recipeImageGeneratorFlow = ai.defineFlow(
  {
    name: 'recipeImageGeneratorFlow',
    inputSchema: RecipeImageGeneratorInputSchema,
    outputSchema: RecipeImageGeneratorOutputSchema,
  },
  async (input) => {
    const { dishName, description, country } = input;
    const prompt = `A high-quality, realistic, and appetizing photograph of a freshly prepared "${dishName}". 
The dish is a classic from ${country} cuisine, described as: "${description}".
The presentation should be clean and modern, styled on a simple plate or bowl. The background should be a cozy kitchen or dining setting. 
Focus on the texture and colors of the food. The lighting should be bright and natural. Do not include any text or labels in the image.`;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: prompt,
    }).catch(err => {
      console.error("Image generation failed:", err);
      return { media: null };
    });

    return { imageUrl: media?.url || "" };
  }
);
