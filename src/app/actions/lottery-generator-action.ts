// 'use server';

const NUMBERS = "0123456789";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function generateLottery(length: number, includeLetters: boolean): Promise<string> {
    let characterSet = NUMBERS;
    if (includeLetters) {
      characterSet += LETTERS;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
        result += characterSet.charAt(
          Math.floor(Math.random() * characterSet.length)
        );
    }
    return result;
}
