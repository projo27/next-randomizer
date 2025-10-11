// 'use server';

type CoinResult = "Heads" | "Tails";

export async function flipCoins(count: number): Promise<CoinResult[]> {
    const results: CoinResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.random() < 0.5 ? "Heads" : "Tails");
    }
    return results;
}
