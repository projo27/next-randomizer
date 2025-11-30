// src/app/actions/google-sheet-randomizer-action.ts
"use server";

import { z } from "zod";
import { getSheetData, getSheetsFromSpreadsheet } from "@/services/google-sheet-service";

const SheetNamesInputSchema = z.object({
  spreadsheetId: z.string(),
  accessToken: z.string().optional(),
});

const RandomizeRowsInputSchema = z.object({
  spreadsheetId: z.string(),
  sheetName: z.string(),
  count: z.number().min(1),
  accessToken: z.string().optional(),
});

/**
 * Server action to get the names of all sheets in a spreadsheet.
 */
export async function getSheetNamesAction(
  input: z.infer<typeof SheetNamesInputSchema>
): Promise<string[]> {
  const validatedInput = SheetNamesInputSchema.parse(input);
  const names = await getSheetsFromSpreadsheet(
    validatedInput.spreadsheetId,
    validatedInput.accessToken
  );
  return names;
}

/**
 * Server action to get random rows from a specific sheet.
 */
export async function randomizeSheetRowsAction(
  input: z.infer<typeof RandomizeRowsInputSchema>
): Promise<string[][]> {
  const validatedInput = RandomizeRowsInputSchema.parse(input);
  const allRows = await getSheetData(
    validatedInput.spreadsheetId,
    validatedInput.sheetName,
    validatedInput.accessToken
  );

  if (allRows.length <= 1) {
    // Only header or empty sheet
    return allRows;
  }

  const header = allRows[0];
  const dataRows = allRows.slice(1);

  if (validatedInput.count >= dataRows.length) {
    // If count is more than available rows, return all data rows shuffled
    const shuffledData = dataRows.sort(() => 0.5 - Math.random());
    return [header, ...shuffledData];
  }

  // Fisher-Yates shuffle
  const shuffled = [...dataRows];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selectedRows = shuffled.slice(0, validatedInput.count);

  return [header, ...selectedRows];
}
