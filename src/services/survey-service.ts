import { db } from "@/lib/firebase-config";
import {
  doc,
  runTransaction,
  collection,
  increment,
  getDocs,
  getDoc,
} from "firebase/firestore";

const SURVEYS_COLLECTION = "surveys";
const SURVEY_LIST_COLLECTION = "surveyList";

/**
 * Retrieves the list of available survey options from Firestore.
 * This is currently specific to the new tool survey.
 * @returns An array of tool names.
 */
export async function getSurveyList(): Promise<string[]> {
  try {
    const surveyListCol = collection(db, SURVEY_LIST_COLLECTION);
    const snapshot = await getDocs(surveyListCol);
    const toolList = snapshot.docs.map((doc) => doc.id);
    return toolList.sort();
  } catch (error) {
    console.error("Error getting survey list:", error);
    return [];
  }
}

/**
 * Increments the vote count for given tools in a Firestore transaction.
 * Also adds new tools to the surveyList collection.
 * @param surveyId The ID of the survey document (e.g., 'newToolRequests').
 * @param toolNames An array of tool names to vote for.
 * @param allSurveyOptions The current list of all survey options.
 */
export async function incrementSurveyVotes(
  surveyId: string,
  toolNames: string[],
  allSurveyOptions: string[],
): Promise<void> {
  const surveyDocRef = doc(db, SURVEYS_COLLECTION, surveyId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Update vote counts
      const surveyDoc = await transaction.get(surveyDocRef);
      const updates: { [key: string]: any } = {};

      toolNames.forEach((toolName) => {
        updates[toolName] = increment(1);
      });

      if (!surveyDoc.exists()) {
        transaction.set(surveyDocRef, updates);
      } else {
        transaction.update(surveyDocRef, updates);
      }

      // 2. If this is the new tool survey, add any new "other" tools to the surveyList collection.
      if (surveyId === "newToolRequests") {
        const newTools = toolNames.filter(
          (tool) =>
            !allSurveyOptions.some(
              (opt) => opt.toLowerCase() === tool.toLowerCase(),
            ),
        );

        for (const newTool of newTools) {
          // Use the tool name as the document ID. Add a placeholder field.
          const newToolRef = doc(db, SURVEY_LIST_COLLECTION, newTool);
          transaction.set(newToolRef, { addedByUser: true });
        }
      }
    });
  } catch (error) {
    console.error(`Error incrementing votes for survey '${surveyId}':`, error);
    throw error;
  }
}

/**
 * Retrieves the current results of a specific survey.
 * @param surveyId The ID of the survey document to retrieve.
 * @returns A promise that resolves to an object mapping item names to vote counts.
 */
export async function getSurveyResults(
  surveyId: string,
): Promise<{ [key: string]: number }> {
  try {
    const surveyDocRef = doc(db, SURVEYS_COLLECTION, surveyId);
    const docSnap = await getDoc(surveyDocRef);
    return (docSnap.exists() ? docSnap.data() : {}) as {
      [key: string]: number;
    };
  } catch (error) {
    console.error(`Error getting results for survey '${surveyId}':`, error);
    return {};
  }
}
