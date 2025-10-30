// ====== SETTINGS ======

// Required sheet structure:

// - Settings!B3:B8 = Status names (Carpark, Waiting, etc.)

// - Settings!C3:C8 = Completed task count

// - Settings!D3:D8 = Total task count

// - Settings!E3:E8 = Total task ceiling

// - SPARKLINE built as: {completed, total-completed}



function onOpen() {

  SpreadsheetApp.getUi()

    .createMenu('Task Tools')

    .addItem('➕ Add New Task', 'showTaskSidebar')

    .addItem('↻ Rebuild Kanban Board', 'rebuildKanbanBoard')

    .addItem('📦 Update Fullfillment View', 'updateFullfillmentSheet')

    .addItem('↕ Resort Tasks', 'resortAllTaskTabs')

    .addToUi();

}



function updateFullfillmentSheet() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheetNames = ["Carpark", "Waiting", "To Do", "In Progress", "Completed", "Archived"];

  const fullfillmentSheetName = "Fullfillment";

  const fullfillmentTasks = [];



  // Loop through each task sheet

  sheetNames.forEach(name => {

    const sheet = ss.getSheetByName(name);

    if (!sheet) return;



    const data = sheet.getRange(5, 1, sheet.getLastRow() - 4, 9).getValues(); // A to I

    const filtered = data.filter(row => {

      const pillar = row[4]; // Column E (index 4)

      return pillar && pillar.toString().toLowerCase() === "fullfillment";

    });



    fullfillmentTasks.push(...filtered);

  });



  // Get or create the Fullfillment sheet

  let fullfillmentSheet = ss.getSheetByName(fullfillmentSheetName);

  if (!fullfillmentSheet) {

    fullfillmentSheet = ss.insertSheet(fullfillmentSheetName);

  } else {

    fullfillmentSheet.clear(); // Clear old data

  }



  // Set title in A1

  fullfillmentSheet.getRange("A1")

    .setValue("Fullfillment Tasks")

    .setFontWeight("bold")

    .setFontSize(14)

    .setFontFamily("Arial");



  // Set instruction message in B1

  fullfillmentSheet.getRange("B1").setValue('This is a snapshot. To update go to the "Task Tools" menu');



  // Set headers in row 4

  const headers = ["Task", "Description", "Priority", "Label", "Pillar", "Due Date", "Status", "Date Completed", "Last Updated"];

  fullfillmentSheet.getRange(4, 1, 1, headers.length).setValues([headers]);



  // Write data starting in row 5

  if (fullfillmentTasks.length > 0) {

    fullfillmentSheet.getRange(5, 1, fullfillmentTasks.length, fullfillmentTasks[0].length).setValues(fullfillmentTasks);

  } else {

    fullfillmentSheet.getRange(5, 1).setValue("No tasks found.");

  }



  // Apply banded rows

  const range = fullfillmentSheet.getRange(4, 1, fullfillmentTasks.length + 1, headers.length);

  const band = fullfillmentSheet.getBandings();

  if (band.length > 0) band.forEach(b => b.remove());

  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);



  // Protect Column G (Status) from edits

  const lastRow = fullfillmentSheet.getLastRow();

  const statusRange = fullfillmentSheet.getRange(5, 7, lastRow - 4); // Column G from row 5 down

  const protection = statusRange.protect().setDescription("Protect Status Column");

  protection.removeEditors(protection.getEditors());

  if (!protection.canDomainEdit()) {

    protection.setWarningOnly(false); // prevent edits

  }

}



function resortAllTaskTabs() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const taskTabs = ["Carpark", "Waiting", "To Do", "In Progress", "Completed", "Archived"];



  taskTabs.forEach(name => {

    const sheet = ss.getSheetByName(name);

    if (!sheet) return;



    if (name === "Completed" || name === "Archived") {

      sortIfCompletedOrArchived(sheet);

    } else {

      sortSheetByPriority(sheet);

    }

  });



  SpreadsheetApp.getActive().toast("✅ All task tabs resorted.");

}



function onEdit(e) {

  if (!e || !e.range) return;



  const range = e.range;

  const sheet = range.getSheet();

  const col = range.getColumn();

  const row = range.getRow();

  const validSheets = ["Carpark", "Waiting", "To Do", "In Progress", "Completed", "Archived"];



  if (!validSheets.includes(sheet.getName()) || row < 5) return;



  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const taskValue = sheet.getRange(row, 1).getDisplayValue(); // Column A

  const createdDateCell = sheet.getRange(row, 10);             // Column J



  // ✅ Auto-fill 'Created Date' if blank and task title exists

  if (taskValue && !createdDateCell.getValue()) {

    const today = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");

    createdDateCell.setValue(today);

  }



  // ✅ Continue only if editing the Status column (Column G = 7)

  if (col !== 7) return;



  const newStatus = range.getDisplayValue().trim();

  if (!validSheets.includes(newStatus)) return;



  if (!taskValue || taskValue.trim() === "") return;



  const sourceSheet = sheet;

  const targetSheet = ss.getSheetByName(newStatus);

  if (!targetSheet || targetSheet.getName() === sourceSheet.getName()) return;



  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd/MM/yyyy");

  const lastCol = sourceSheet.getLastColumn();

  let rowValues = sourceSheet.getRange(row, 1, 1, lastCol).getValues()[0];



  // Update 'Date Completed' and 'Last Updated'

  rowValues[7] = (newStatus === "Completed") ? now : rowValues[7]; // Column H = Date Completed

  rowValues[8] = now;                                              // Column I = Last Updated



  targetSheet.appendRow(rowValues);

  sourceSheet.deleteRow(row);



  if (["Completed", "Archived"].includes(newStatus)) {

    sortIfCompletedOrArchived(targetSheet);

  } else {

    sortSheetByPriority(targetSheet);

  }

  sortSheetByPriority(sourceSheet);



  rebuildKanbanBoard(`✅ Task moved to '${newStatus}' and sheets sorted.`);

}



function sortSheetByPriority(sheet) {

  const startRow = 5;

  const lastRow = sheet.getLastRow();

  const numRows = lastRow - startRow + 1;

  if (numRows > 0) {

    const range = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn());

    range.sort({ column: 3, ascending: true }); // Column C = Priority

  }

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



function rebuildKanbanBoard() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const kanbanSheet = ss.getSheetByName("Kanban Board");

  const settingsSheet = ss.getSheetByName("Settings");



  const statusOrder = ["Carpark", "Waiting", "To Do", "In Progress", "Completed"];

  const columnMap = {

    "Carpark": 2,

    "Waiting": 4,

    "To Do": 6,

    "In Progress": 8,

    "Completed": 10

  };



  const colorMap = {

    "Carpark": { light: "#fde2dd", header: "#c45f5f", urgent: "#f6cccc" },

    "Waiting": { light: "#fbe8c6", header: "#9b5e1f", urgent: "#f8d8a8" },

    "To Do": { light: "#dce9f8", header: "#1d3973", urgent: "#aac6ec" },

    "In Progress": { light: "#fff5cc", header: "#a17700", urgent: "#ffe4a6" },

    "Completed": { light: "#dff2db", header: "#395c29", urgent: "#b9deb4" }

  };



  const START_ROW = 5;

  const CARD_HEIGHT = 60;



  // Clear and reset

  kanbanSheet.clear();

  const maxRows = kanbanSheet.getMaxRows();

  const maxCols = kanbanSheet.getMaxColumns();

  kanbanSheet.getRange(1, 1, maxRows, maxCols).clearNote().clearComment();



  kanbanSheet.insertRows(1, 1);

  kanbanSheet.getRange("B1").setValue("Overview of Allan's Tasks")

    .setFontWeight("bold")

    .setFontSize(14);



  // Add snapshot notice in cell J1

  const snapshotNote = 'This is a snapshot. To update go to the "Task Tools" menu';

  kanbanSheet.getRange('J1')

    .setValue(snapshotNote)

    .setFontSize(10)

    .setFontWeight("normal")

    .setHorizontalAlignment("right")

    .setFontFamily("Arial");



  statusOrder.forEach((status, i) => {

    const col = columnMap[status];

    const colors = colorMap[status];

    const settingsRow = i + 3;

    const sheet = ss.getSheetByName(status);

    if (!sheet) return;



    const completed = Number(settingsSheet.getRange(`C${settingsRow}`).getValue());

    const total = Number(settingsSheet.getRange(`E${settingsRow}`).getValue());

    const displayCount = completed;



    // Sparkline and header

    kanbanSheet.getRange(3, col).setFormula(`=SPARKLINE(Settings!C${settingsRow}:D${settingsRow},{"charttype","bar";"color1","${colors.light}";"color2","d9d9d9"})`)

      .setBackground("#eeeeee")

      .setHorizontalAlignment("center");



    kanbanSheet.getRange(4, col).setValue(`${completed}/${total}`)

      .setHorizontalAlignment("center")

      .setFontSize(10);



    kanbanSheet.getRange(5, col).setFormula(`=HYPERLINK("#gid=${sheet.getSheetId()}", "${status}")`)

      .setFontWeight("bold")

      .setFontSize(11)

      .setFontColor("white")

      .setBackground(colors.header)

      .setHorizontalAlignment("center");



    kanbanSheet.setColumnWidth(col, 180);



    // Extract tasks

    const lastRow = sheet.getLastRow();

    const taskRows = sheet.getRange(5, 1, Math.max(0, lastRow - 4), 9).getValues()

      .filter(row => row[0]); // A = Task Title



    const showTasks = taskRows.slice(0, displayCount);



    showTasks.forEach((row, idx) => {

      const r = START_ROW + idx + 1;

      const cell = kanbanSheet.getRange(r, col);

      const isUrgent = (row[3] || "").toString().toLowerCase().includes("urgent");

      const bg = isUrgent ? colors.urgent : colors.light;

      const title = row[0];

      const description = row[1];

      const link = `#gid=${sheet.getSheetId()}`;



      // Set task card with link and styling

      cell.setFormula(`=HYPERLINK("${link}", "${title}")`)

        .setFontWeight("normal")

        .setFontSize(9)

        .setFontFamily("Calibri")

        .setWrap(true)

        .setHorizontalAlignment("center")

        .setVerticalAlignment("middle")

        .setBackground(bg)

        .setBorder(true, true, true, true, false, false, "#ffffff", SpreadsheetApp.BorderStyle.SOLID);



      if (description) {

        cell.setComment(description);

      }



      kanbanSheet.setRowHeight(r, CARD_HEIGHT);

    });

  });



  SpreadsheetApp.getActive().toast("✅ Kanban Board Updated");

}

