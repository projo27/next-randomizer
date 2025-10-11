// 'use server';

const CARDINAL_DIRECTIONS = ["North", "East", "South", "West"];
const INTERCARDINAL_DIRECTIONS = ["Northeast", "Southeast", "Southwest", "Northwest"];

export async function getRandomDirection(includeIntercardinal: boolean): Promise<string> {
    const directions = includeIntercardinal
      ? [...CARDINAL_DIRECTIONS, ...INTERCARDINAL_DIRECTIONS]
      : CARDINAL_DIRECTIONS;
    
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
}
