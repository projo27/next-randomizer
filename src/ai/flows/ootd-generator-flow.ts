'use server';

/**
 * @fileOverview A flow for generating an "Outfit of the Day" (OOTD) recommendation.
 *
 * - generateOotd - A function that suggests an outfit based on gender, style, and season.
 * - generateOotdImage - A function that generates an image for a given outfit description.
 * - OotdGeneratorInput - The input type for the generateOotd function.
 * - OotdGeneratorOutput - The return type for the generateOotd function.
 * - OotdImageGeneratorInput - The input type for the generateOotdImage function.
 * - OotdImageGeneratorOutput - The return type for the generateOotdImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OotdGeneratorInputSchema = z.object({
  gender: z.string().describe('The gender for the outfit (e.g., Male, Female).'),
  style: z.string().describe('The desired fashion style (e.g., Casual, Formal, Streetwear, or All for random).'),
  season: z.string().describe('The current season (e.g., Rainy Season, Dry Season).'),
  height: z.number().describe('The height of the person in centimeters.'),
  weight: z.number().describe('The weight of the person in kilograms.'),
});
export type OotdGeneratorInput = z.infer<typeof OotdGeneratorInputSchema>;

const OotdGeneratorOutputSchema = z.object({
  outfitDescription: z.string().describe('A creative and appealing description of the complete outfit.'),
  items: z.array(z.string()).describe('A list of individual clothing items that make up the outfit (e.g., "Blue flannel shirt", "Black denim jeans", "Leather boots").'),
  styleUsed: z.string().describe('The specific fashion style that was chosen for the outfit, especially if the input was "All".'),
  weightHealth: z.string().describe('The body type of the person based on their height and weight.')
});
export type OotdGeneratorOutput = z.infer<typeof OotdGeneratorOutputSchema>;

const OotdImageGeneratorInputSchema = z.object({
  outfitDescription: z.string().describe('The description of the outfit to be visualized.'),
  gender: z.string().describe('The gender for the outfit (e.g., Male, Female).'),
  height: z.number().describe('The height of the person in centimeters.'),
  weight: z.number().describe('The weight of the person in kilograms.'),
  items: z.array(z.string()).describe('A list of individual clothing items that make up the outfit (e.g., "Blue flannel shirt", "Black denim jeans", "Leather boots").'),
  weightHealth: z.string().describe('The body type of the person based on their height and weight.'),
  pose: z.string().describe('The pose of the person in the outfit'),
  cameraAngle: z.string().describe('The camera angle of the outfit'),
});
export type OotdImageGeneratorInput = z.infer<typeof OotdImageGeneratorInputSchema>;

const OotdImageGeneratorOutputSchema = z.object({
  imageUrl: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type OotdImageGeneratorOutput = z.infer<typeof OotdImageGeneratorOutputSchema>;


export async function generateOotd(input: OotdGeneratorInput): Promise<OotdGeneratorOutput> {
  return ootdGeneratorFlow(input);
}

export async function generateOotdImage(input: OotdImageGeneratorInput): Promise<OotdImageGeneratorOutput> {
  return ootdImageGeneratorFlow(input);
}

const ootdPrompt = ai.definePrompt({
  name: 'ootdGeneratorPrompt',
  input: {
    schema: OotdGeneratorInputSchema,
  },
  output: {
    schema: OotdGeneratorOutputSchema,
  },
  prompt: `You are a creative and knowledgeable fashion stylist. Your task is to generate a stylish and practical "Outfit of the Day" (OOTD) based on the user's preferences and body measurements.

User Preferences:
- Height: {{height}} cm
- Weight: {{weight}} kg
- Gender: {{gender}}
- Fashion Style: {{style}}
- Season: {{season}}

Instructions:
1.  If the style is "All", you must first randomly select one specific style from this list: Casual, Streetwear, Formal, Business Casual, Vintage, Bohemian, Minimalist, Sporty, Preppy, Grunge. Then, generate the outfit based on that chosen style.
2.  Create a complete outfit recommendation including a top, bottom, footwear, and at least one accessory.
3.  Consider the user's height and weight to suggest clothing that would be flattering for their body type. For example, you might suggest certain cuts or styles that elongate the figure for a shorter person, or styles that add shape for a slender person.
4.  Write a compelling and descriptive summary of the outfit in 'outfitDescription'. Make it sound fashionable and appealing.
5.  List the individual clothing and accessory items in the 'items' array. Be specific about colors and materials where appropriate.
6.  Specify the style you chose in the 'styleUsed' field. If the user provided a specific style, use that one.
7.  Ensure the outfit is suitable for the specified season. For example, recommend warmer, layered clothing for 'Rainy Season' or light, breathable fabrics for 'Dry Season'.
8.  All output must be in English.

Example for 'Female', '165 cm', '100 kg', 'Casual', 'Dry Season':
{
  "outfitDescription": "Stay cool and chic in the dry season with this refreshing and classic combo. A lightweight white linen blouse paired with high-waisted khaki culottes creates a comfortable and elegant silhouette that flatters your frame. Espadrille sandals and a straw tote bag add the perfect summer touch.",
  "items": [
    "White short-sleeve linen blouse",
    "High-waisted khaki-colored cotton culottes",
    "Espadrille sandals with ties",
    "Woven straw tote bag",
    "Cat-eye sunglasses"
  ],
  "styleUsed": "Casual",
  "weightHealth: "Obese"
}

Generate an OOTD now based on the user's preferences.`,
});

const ootdGeneratorFlow = ai.defineFlow(
  {
    name: 'ootdGeneratorFlow',
    inputSchema: OotdGeneratorInputSchema,
    outputSchema: OotdGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await ootdPrompt(input);
    return output!;
  }
);


const ootdImageGeneratorFlow = ai.defineFlow(
  {
    name: 'ootdImageGeneratorFlow',
    inputSchema: OotdImageGeneratorInputSchema,
    outputSchema: OotdImageGeneratorOutputSchema,
  },
  async (input) => {
    const { outfitDescription, gender, height, weight, items, weightHealth, pose, cameraAngle  } = input;
    const prompt = `The person should reflect a ${gender} ${weightHealth} body type appropriate for someone who is ${height}cm tall and ${weight}kg weight.
A high-quality, realistic fashion photograph of a person wearing an outfit,
The outfit is described as: "${outfitDescription}"
The person pose is ${pose}
The camera angle is ${cameraAngle}.
The outfit items is: "${items.join("\n")}"
The photo must be shot from a distance or an angle where the person's face is blured, 
No items on the photo, only show the person and the outfit
The background should fit with the person and clothes selected.`;
// The background should be a clean, minimalist studio setting to keep focus on the clothes.`;
    console.log(prompt);

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: prompt
    }).catch(err => {
      console.error(err);
      return { media: null };
    });
    return { imageUrl: media?.url || "" };
  }
);
