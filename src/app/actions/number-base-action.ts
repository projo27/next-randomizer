// 'use server';

interface Result {
  decimal: number;
  binary: string;
  octal: string;
  hex: string;
}

export async function generateRandomNumberInBases(min: number, max: number): Promise<Result> {
    if (min >= max) {
      throw new Error("Minimum number must be less than the maximum number.");
    }
    if (max > 1000000) {
      throw new Error("Maximum number cannot be greater than 1,000,000 to ensure performance.");
    }

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return {
        decimal: randomNumber,
        binary: randomNumber.toString(2),
        octal: randomNumber.toString(8),
        hex: randomNumber.toString(16).toUpperCase(),
    };
}
