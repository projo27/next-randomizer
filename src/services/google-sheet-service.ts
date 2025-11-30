// src/services/google-sheet-service.ts
"use server";

import { google } from "googleapis";

// --- Authentication ---

// Function to get an authenticated Sheets API client
const getSheetsClient = async (accessToken?: string) => {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  if (accessToken) {
    // Use user's credentials
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.sheets({ version: "v4", auth: oauth2Client });
  } else {
    // Use Application Default Credentials (API Key) for public sheets
    // Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment
    const authClient = await auth.getClient();
    return google.sheets({ version: "v4", auth: authClient });
  }
};


// --- API Functions ---

/**
 * Fetches the names of all sheets (tabs) in a given spreadsheet.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param accessToken Optional. The user's OAuth 2.0 access token for private sheets.
 * @returns A promise that resolves to an array of sheet names.
 */
export async function getSheetsFromSpreadsheet(spreadsheetId: string, accessToken?: string): Promise<string[]> {
  try {
    const sheets = await getSheetsClient(accessToken);
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });

    const sheetNames = response.data.sheets?.map(sheet => sheet.properties?.title ?? '').filter(Boolean) ?? [];
    return sheetNames;

  } catch (error: any) {
    console.error("Google Sheets API error (getSheetsFromSpreadsheet):", error.message);
    if (error.code === 403) {
      throw new Error("Permission denied. Make sure the sheet is public or you have granted access.");
    }
    throw new Error("Failed to fetch sheet names from Google Sheets.");
  }
}

/**
 * Fetches all data from a specific sheet.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param sheetName The name of the sheet (tab) to fetch data from.
 * @param accessToken Optional. The user's OAuth 2.0 access token for private sheets.
 * @returns A promise that resolves to a 2D array of strings representing the sheet data.
 */
export async function getSheetData(spreadsheetId: string, sheetName: string, accessToken?: string): Promise<string[][]> {
  try {
    const sheets = await getSheetsClient(accessToken);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName, // Fetches the entire sheet
    });

    return response.data.values as string[][] || [];

  } catch (error: any) {
    console.error("Google Sheets API error (getSheetData):", error.message);
    if (error.code === 403) {
      throw new Error("Permission denied. Make sure the sheet is public or you have granted access.");
    }
    throw new Error("Failed to fetch data from the specified sheet.");
  }
}
