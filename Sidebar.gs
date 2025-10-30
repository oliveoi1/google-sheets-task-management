function showTaskSidebar() {
  try {
    // Check if Settings sheet exists
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName('Settings');
    
    if (!settingsSheet) {
      SpreadsheetApp.getUi().alert(
        'Settings Sheet Required',
        'Please run the Setup Wizard first:\n\n' +
        'Task Tools → ⚙️ Configuration → 🎯 Complete Setup Wizard\n\n' +
        'This will create your Settings sheet and task sheets.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }
    
    const html = HtmlService.createHtmlOutputFromFile('TaskSidebar')
      .setTitle('Add Task')
      .setWidth(300);
    SpreadsheetApp.getUi().showSidebar(html);
    
  } catch (error) {
    Logger.log('showTaskSidebar error: ' + error);
    SpreadsheetApp.getUi().alert('Error showing sidebar: ' + error.message);
  }
}

function getDropdownOptions() {

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
    if (!sheet) {
      throw new Error('Settings sheet not found');
    }
    const statuses = sheet.getRange('B4:B12').getValues().flat().filter(String);
    const labels = sheet.getRange('E4:E12').getValues().flat().filter(String);
    const pillars = sheet.getRange('E15:E23').getValues().flat().filter(String);
    const people = sheet.getRange('B15:B23').getValues().flat().filter(String);
    return { statuses, labels, pillars, people };

  } catch (error) {
    Logger.log('getDropdownOptions error: ' + error);
    throw error;
  }
}

function addTask(task) {

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(task.status);
    if (!sheet) {
      throw new Error(`Sheet "${task.status}" not found`);
    }
    const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");
  const row = [
    task.title || "",
    task.description || "",
    task.priority || "",
    task.label || "",
    task.pillar || "",
    task.who || "",         // Who (Column F)
    task.dueDate || "",
    task.status || "",
    task.status === "Completed" ? now : "", // Date Completed
    now, // Last Updated
    now  // Creation Date
  ];
  const data = sheet.getRange("A5:A" + sheet.getLastRow()).getValues();
  const emptyIndex = data.findIndex(r => !r[0]);
  const targetRow = emptyIndex !== -1 ? emptyIndex + 5 : sheet.getLastRow() + 1;
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  
  // Set up data validation (dropdowns) for the new row
  setupTaskRowValidation(sheet, targetRow);
  
  if (task.status === "Completed" || task.status === "Archived") {
    sortIfCompletedOrArchived(sheet);
  } else {
    sortSheetByPriority(sheet);
  }
  return "Task added successfully";

  } catch (error) {
    Logger.log('addTask error: ' + error);
    throw error;
  }
}

// Note: sortSheetByPriority is now defined in Code.gs with improved logic

// This function has been consolidated to avoid duplication

function sortIfCompletedOrArchived(sheet) {
  const sheetName = sheet.getName();
  if (sheetName === 'Completed' || sheetName === 'Archived') {
    const dateCol = 8; // Column H = Date Completed
    const startRow = 5;
    const lastRow = sheet.getLastRow();
    const numRows = lastRow - startRow + 1;
    if (numRows > 0) {
      const range = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn());
      range.sort({ column: dateCol, ascending: false });
    }
  }
}
