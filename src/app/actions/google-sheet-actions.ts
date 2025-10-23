'use server';

import { google } from 'googleapis';
import { getAuthenticatedClient } from '@/lib/google-auth';

/**
 * Extracts the spreadsheet ID from a Google Sheet URL.
 * @param url The Google Sheet URL.
 * @returns The spreadsheet ID or null if not found.
 */
function getSheetIdFromUrl(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

/**
 * Fetches rows from a Google Sheet.
 * @param spreadsheetId The ID of the spreadsheet.
 * @param sheetName The name of the sheet.
 * @param accessToken Optional access token for private sheets.
 * @returns A promise that resolves to an array of rows.
 */
async function fetchSheetData(spreadsheetId: string, sheetName: string, accessToken?: string): Promise<any[][]> {
    
    const sheets = google.sheets('v4');
    let auth;

    if (accessToken) {
        auth = getAuthenticatedClient(accessToken);
    } else {
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: sheetName,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }
        // Filter out header row if it exists
        return rows.slice(1);
    } catch (error: any) {
        console.error('The API returned an error: ' + error);
        if (error.code === 403) {
            throw new Error("Permission denied. Make sure the Google Sheet is public ('Anyone with the link can view') or that you have granted access.");
        }
         if (error.code === 404) {
            throw new Error(`Sheet with name "${sheetName}" not found in the spreadsheet.`);
        }
        throw new Error('Failed to fetch sheet data. Please check the URL, sheet name, and permissions.');
    }
}

/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


/**
 * Randomizes rows from a Google Sheet.
 */
export async function randomizeSheet({
    sheetUrl,
    sheetName,
    numberOfRows,
    accessToken
}: {
    sheetUrl: string;
    sheetName: string;
    numberOfRows: number;
    accessToken?: string;
}): Promise<any[][]> {
    const spreadsheetId = getSheetIdFromUrl(sheetUrl);

    if (!spreadsheetId) {
        throw new Error('Invalid Google Sheet URL. Please provide a valid URL.');
    }
    if (!sheetName) {
        throw new Error('Please provide the name of the sheet to randomize.');
    }
    if (isNaN(numberOfRows) || numberOfRows <= 0) {
        throw new Error('Please enter a valid number of rows to pick.');
    }

    const data = await fetchSheetData(spreadsheetId, sheetName, accessToken);

    if (data.length === 0) {
        throw new Error('No data found in the sheet (after excluding the header row).');
    }
    if (numberOfRows > data.length) {
        throw new Error(`Cannot pick ${numberOfRows} rows. There are only ${data.length} rows of data available.`);
    }

    const shuffledData = shuffleArray(data);
    return shuffledData.slice(0, numberOfRows);
}