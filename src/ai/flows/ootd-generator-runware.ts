"use server";

/**
 * @fileOverview A flow for generating an "Outfit of the Day" (OOTD) recommendation, using the Runware.ai SDK.
 *
 * - generateOotdRunware - A function that suggests an outfit based on user inputs.
 * - generateOotdImageRunware - A function that generates an image for a given outfit description using the Runware.ai SDK.
 * - OotdGeneratorInput - The input type for the generateOotdRunware function.
 * - OotdGeneratorOutput - The return type for the generateOotdRunware function.
 * - OotdImageGeneratorInput - The input type for the generateOotdImageRunware function.
 * - OotdImageGeneratorOutput - The return type for the generateOotdImageRunware function.
 */

import { ai } from "@/ai/genkit";
import { Runware } from "@runware/sdk-js";
import { z } from "genkit";

const OotdGeneratorInputSchema = z.object({
  gender: z
    .string()
    .describe("The gender for the outfit (e.g., Male, Female)."),
  style: z
    .string()
    .describe(
      "The desired fashion style (e.g., Casual, Formal, Streetwear, or All for random).",
    ),
  season: z
    .string()
    .describe("The current season (e.g., Rainy Season, Dry Season)."),
  height: z.number().describe("The height of the person in centimeters."),
  weight: z.number().describe("The weight of the person in kilograms."),
});
export type OotdGeneratorInput = z.infer<typeof OotdGeneratorInputSchema>;

const OotdGeneratorOutputSchema = z.object({
  outfitDescription: z
    .string()
    .describe("A creative and appealing description of the complete outfit."),
  items: z
    .array(z.string())
    .describe(
      'A list of individual clothing items that make up the outfit (e.g., "Blue flannel shirt", "Black denim jeans", "Leather boots").',
    ),
  styleUsed: z
    .string()
    .describe(
      'The specific fashion style that was chosen for the outfit, especially if the input was "All".',
    ),
  weightHealth: z
    .string()
    .describe("The body type of the person based on their height and weight."),
});
export type OotdGeneratorOutput = z.infer<typeof OotdGeneratorOutputSchema>;

const OotdImageGeneratorInputSchema = z.object({
  outfitDescription: z
    .string()
    .describe("The description of the outfit to be visualized."),
  gender: z
    .string()
    .describe("The gender for the outfit (e.g., Male, Female)."),
  height: z.number().describe("The height of the person in centimeters."),
  weight: z.number().describe("The weight of the person in kilograms."),
  items: z
    .array(z.string())
    .describe(
      'A list of individual clothing items that make up the outfit (e.g., "Blue flannel shirt", "Black denim jeans", "Leather boots").',
    ),
  weightHealth: z
    .string()
    .describe("The body type of the person based on their height and weight."),
  pose: z.string().describe("The pose of the person in the outfit"),
  cameraAngle: z.string().describe("The camera angle of the outfit"),
});
export type OotdImageGeneratorInput = z.infer<
  typeof OotdImageGeneratorInputSchema
>;

const OotdImageGeneratorOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'.",
    ),
});
export type OotdImageGeneratorOutput = z.infer<
  typeof OotdImageGeneratorOutputSchema
>;

export async function generateOotdRunware(
  input: OotdGeneratorInput,
): Promise<OotdGeneratorOutput> {
  return ootdGeneratorFlow(input);
}

export async function generateOotdImageRunware(
  input: OotdImageGeneratorInput,
): Promise<OotdImageGeneratorOutput> {
  return ootdImageGeneratorRunwareFlow(input);
}

const ootdPrompt = ai.definePrompt({
  name: "ootdGeneratorRunwarePrompt",
  input: {
    schema: OotdGeneratorInputSchema,
  },
  output: {
    schema: OotdGeneratorOutputSchema,
  },
  prompt: `You are a fashion stylist, known for edgy and futuristic styles. Your task is to generate a stylish and practical "Outfit of the Day" (OOTD) based on the user's preferences and body measurements.

User Preferences:
- Height: {{height}} cm
- Weight: {{weight}} kg
- Gender: {{gender}}
- Fashion Style: {{style}}
- Season: {{season}}

Instructions:
1.  If the style is "All", you must first randomly select one specific style from this list: Casual, Streetwear, Formal, Business Casual, Vintage, Bohemian, Minimalist, Sporty, Preppy, Grunge. Then, generate the outfit based on that chosen style.
2.  Create a complete outfit recommendation including a top, bottom, footwear, and at least one accessory.
3.  Consider the user's height and weight to suggest clothing that would be flattering for their body type.
4.  Write a compelling and descriptive summary of the outfit in 'outfitDescription'. Make it sound fashionable and unique to the Randomizer brand.
5.  List the individual clothing and accessory items in the 'items' array. Be specific about colors and materials where appropriate.
6.  Specify the style you chose in the 'styleUsed' field. If the user provided a specific style, use that one.
7.  Ensure the outfit is suitable for the specified season.
8.  All output must be in English.

Generate an OOTD now based on the user's preferences.`,
});

const ootdGeneratorFlow = ai.defineFlow(
  {
    name: "ootdGeneratorRunwareFlow",
    inputSchema: OotdGeneratorInputSchema,
    outputSchema: OotdGeneratorOutputSchema,
  },
  async (input: any) => {
    const { output } = await ootdPrompt(input);
    return output!;
  },
);

const ootdImageGeneratorRunwareFlow = ai.defineFlow(
  {
    name: "ootdImageGeneratorRunwareFlow",
    inputSchema: OotdImageGeneratorInputSchema,
    outputSchema: OotdImageGeneratorOutputSchema,
  },
  async (input: any) => {
    const {
      outfitDescription,
      gender,
      height,
      weight,
      items,
      weightHealth,
      pose,
      cameraAngle,
    } = input;

    const prompt = `A high-quality, realistic fashion photograph of a person wearing an outfit, in the style of Runware.ai (edgy, futuristic).
The person should reflect a ${gender} with ${weightHealth} body shape type appropriate for someone who is ${height} cm tall and ${weight} kg weight.
The outfit is described as: "${outfitDescription}"
The person pose is ${pose}
The camera angle is ${cameraAngle}.
The outfit items is: "${items.map((v: string) => "-" + v).join("\n")}"
The photo must be shot from a distance or an angle where the person's face is blurred. 
The background should be a minimalist and relate with the outfit.`;

    // console.log(prompt);

    const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
    if (!RUNWARE_API_KEY) {
      throw new Error(
        "Runware API key is not configured. Please set the RUNWARE_API_KEY environment variable.",
      );
    }

    const runware = new Runware({
      apiKey: RUNWARE_API_KEY,
      shouldReconnect: true,
      globalMaxRetries: 3,
    });

    try {
      // console.log("try to request images");

      const images = await runware.requestImages({
        positivePrompt: prompt,
        model: "runware:108@1",
        // model: "runware:101@1",
        width: 1024,
        height: 1024,
        outputType: "base64Data",
      });

      // console.log("images generated", images);

      if (images && images.length > 0) {
        const base64Image = images[0].imageBase64Data;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        return { imageUrl };
      } else {
        console.error("Runware SDK Error: No images returned");
        throw new Error(`Runware API request failed: No images returned`);
      }
    } catch (err: any) {
      console.error(err);
      throw new Error(
        err.message ||
          "An unexpected error occurred while generating the image with Runware.",
      );
    } finally {
      runware.disconnect();
    }
  },
);
