'use server';

export async function randomizeDates(
    startDate: Date,
    endDate: Date,
    count: number,
    includeTime: boolean,
    startTime: string,
    endTime: string,
): Promise<Date[]> {

    const tempStartDate = new Date(startDate);
    const tempEndDate = new Date(endDate);

    if (includeTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      tempStartDate.setHours(startHours, startMinutes, 0, 0);
      tempEndDate.setHours(endHours, endMinutes, 0, 0);
    } else {
      tempStartDate.setHours(0, 0, 0, 0);
      tempEndDate.setHours(23, 59, 59, 999);
    }

    const startMs = tempStartDate.getTime();
    const endMs = tempEndDate.getTime();
    const generatedDates: Date[] = [];
    const generatedTimestamps = new Set();

    let maxTries = count * 100;

    while (generatedDates.length < count && maxTries > 0) {
      const randomMs = startMs + Math.random() * (endMs - startMs);
      const randomDate = new Date(randomMs);

      if (!includeTime) {
        randomDate.setHours(0, 0, 0, 0);
      }

      const timestamp = randomDate.getTime();

      if (!generatedTimestamps.has(timestamp)) {
        generatedTimestamps.add(timestamp);
        generatedDates.push(randomDate);
      }
      maxTries--;
    }

    if (maxTries === 0) {
      throw new Error('Could not generate the requested number of unique dates. Try a larger date/time range.');
    }

    return generatedDates.sort((a, b) => a.getTime() - b.getTime());
}
