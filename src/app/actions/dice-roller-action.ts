// 'use server';

export async function rollDice(numberOfDice: number, diceType: number): Promise<number[]> {
    const results: number[] = [];
    for (let i = 0; i < numberOfDice; i++) {
      results.push(Math.floor(Math.random() * diceType) + 1);
    }
    return results;
}
