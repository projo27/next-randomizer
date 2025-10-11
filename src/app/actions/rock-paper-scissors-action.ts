// 'use server';

type RpsResult = "Rock" | "Paper" | "Scissors";
const MOVES: RpsResult[] = ["Rock", "Paper", "Scissors"];

export async function playRps(count: number): Promise<RpsResult[]> {
    const results: RpsResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(MOVES[Math.floor(Math.random() * MOVES.length)]);
    }
    return results;
}
