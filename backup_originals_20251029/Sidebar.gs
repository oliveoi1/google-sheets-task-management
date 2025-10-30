function showTaskSidebar() {

  const html = HtmlService.createHtmlOutputFromFile('TaskSidebar')

    .setTitle('Add Task');

  SpreadsheetApp.getUi().showSidebar(html);

}



function getDropdownOptions() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');

  const statuses = sheet.getRange('B3:B8').getValues().flat().filter(String);

  const labels = sheet.getRange('I3:I8').getValues().flat().filter(String);

  const pillars = sheet.getRange('G13:G20').getValues().flat().filter(String);

  return { statuses, labels, pillars };

}



function addTask(task) {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheet = ss.getSheetByName(task.status);

  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");



  const row = [

    task.title || "",

    task.description || "",

    task.priority || "",

    task.label || "",

    task.pillar || "",

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



  if (task.status === "Completed" || task.status === "Archived") {

    sortIfCompletedOrArchived(sheet);

  } else {

    sortByPriority(sheet);

  }

}



function sortByPriority(sheet) {

  const startRow = 5;

  const numRows = sheet.getLastRow() - startRow + 1;

  if (numRows <= 0) return;



  const range = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn());

  const values = range.getValues();



  const parsed = values.map((row, i) => {

    const priority = parseFloat(row[2]);

    return { row, index: i, priority: isNaN(priority) ? Infinity : priority };

  });



  parsed.sort((a, b) => a.priority - b.priority);



  const sorted = parsed.map(p => p.row);

  range.setValues(sorted);

}



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

