import { GoogleSpreadsheet } from "google-spreadsheet";
import credJson from "../../creds.json";

export const authenticateSpreadsheet = async (sheetId, creds) => {
  const doc = new GoogleSpreadsheet(sheetId);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc;
};

export const getSheetByName = (sheetDoc, sheetName) => {
  return sheetDoc.sheetsByTitle[sheetName];
};
