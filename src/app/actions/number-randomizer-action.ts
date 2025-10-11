// 'use server';

function getDecimalDigits(value: number): number {
    const valueStr = value.toString();
    if (valueStr.indexOf('.') > -1) {
      return valueStr.split('.')[1].length;
    }
    return 0;
}

export async function randomizeNumber(min: number, max: number, count: number): Promise<number[]> {
    const isIntegerRange = Number.isInteger(min) && Number.isInteger(max) && getDecimalDigits(min) === 0 && getDecimalDigits(max) === 0;

    if (isIntegerRange && count > (max - min + 1)) {
        throw new Error(`Cannot generate ${count} unique integers from a range of only ${max - min + 1} possibilities.`);
    }
    if (count > 1000) {
      throw new Error("Cannot generate more than 1000 numbers at a time.");
    }

    const decimalDigits = Math.max(getDecimalDigits(min), getDecimalDigits(max));
    const resultsSet = new Set<number>();
    let attempts = 0;

    while(resultsSet.size < count && attempts < count * 10) {
        const randomNumber = Math.random() * (max - min) + min;
        const roundedNumber = parseFloat(randomNumber.toFixed(decimalDigits));
        resultsSet.add(roundedNumber);
        attempts++;
    }
    
    const finalResults = Array.from(resultsSet);
    if(finalResults.length < count) {
        throw new Error(`Could only generate ${finalResults.length} unique numbers. Try a larger range or fewer numbers.`);
    }
    
    return finalResults.sort((a,b) => a - b);
}
