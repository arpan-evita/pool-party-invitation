/**
 * Google Apps Script to handle form submissions from the landing page.
 * 
 * Instructions:
 * 1. Create a new Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any existing code and paste this code.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select type "Web App".
 * 6. Set "Execute as" to "Me".
 * 7. Set "Who has access" to "Anyone".
 * 8. Authorize the script and copy the "Web App URL".
 * 9. Paste the URL into the 'scriptURL' variable in your 'main.js' file.
 */

const SHEET_NAME = 'Sheet1'; // Name of the sheet to append data to

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000); // Wait up to 30 seconds for a lock

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const body = JSON.parse(e.postData.contents);
    const newRow = headers.map(header => body[header] || '');

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    LockService.getScriptLock().releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Method not allowed').setMimeType(ContentService.MimeType.TEXT);
}
