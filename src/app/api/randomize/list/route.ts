// src/app/api/randomize/list/route.ts
import { NextResponse } from 'next/server';
import { randomizeList } from '@/app/actions/list-randomizer-action';

/**
 * @swagger
 * /api/randomize/list:
 *   post:
 *     summary: Randomizes a list of items.
 *     description: Takes a list of items and a count, and returns a random selection from that list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of strings to randomize.
 *                 example: ["Apple", "Banana", "Orange", "Grape"]
 *               count:
 *                 type: integer
 *                 description: The number of items to pick from the list.
 *                 example: 2
 *     responses:
 *       200:
 *         description: A successful response with the randomized items.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request, usually due to invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request) {
  try {
    // TODO: Implement middleware for authentication and rate limiting here.
    // Example:
    // const apiKey = request.headers.get('X-API-Key');
    // if (!isValidApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    //
    // const isRateLimited = await checkRateLimit(apiKey);
    // if (isRateLimited) {
    //   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    // }

    const body = await request.json();
    const { items, count } = body;

    // --- Basic Input Validation ---
    if (!Array.isArray(items) || items.some(i => typeof i !== 'string')) {
      return NextResponse.json({ error: '`items` must be an array of strings.' }, { status: 400 });
    }
    if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0) {
      return NextResponse.json({ error: '`count` must be a positive integer.' }, { status: 400 });
    }

    // --- Call the core logic ---
    // We can reuse the server action directly.
    const result = await randomizeList(items, count);

    // --- Return the successful response ---
    return NextResponse.json({ result });

  } catch (error: any) {
    // --- Error Handling ---
    // Handle specific errors from the action, e.g., validation errors.
    if (error.message.includes("Cannot pick") || error.message.includes("at least one item")) {
       return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle other unexpected errors
    console.error('[API /randomize/list] Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}