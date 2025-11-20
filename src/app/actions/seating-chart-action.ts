'use server';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a randomized seating chart.
 * @param rows The number of rows in the grid.
 * @param cols The number of columns in the grid.
 * @param participants An array of participant names.
 * @returns A 2D array representing the seating chart.
 */
export async function randomizeSeatingChart(
  rows: number,
  cols: number,
  participants: string[],
): Promise<string[][]> {
  const totalSeats = rows * cols;

  if (participants.length > totalSeats) {
    throw new Error(
      `Not enough seats. You need ${participants.length} seats, but the grid only has ${totalSeats}.`,
    );
  }

  const shuffledParticipants = shuffleArray(participants);

  const seatingChart: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill('Empty'),
  );

  let participantIndex = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (participantIndex < shuffledParticipants.length) {
        seatingChart[r][c] = shuffledParticipants[participantIndex];
        participantIndex++;
      } else {
        break;
      }
    }
  }

  // To make it more random, shuffle the assignment to grid cells
  const flatChart = seatingChart.flat();
  const shuffledFlatChart = shuffleArray(flatChart);

  const finalChart: string[][] = [];
  for (let i = 0; i < rows; i++) {
    finalChart.push(shuffledFlatChart.slice(i * cols, i * cols + cols));
  }

  return finalChart;
}
