// ====== SETTINGS ======

// Required sheet structure:

// - Settings!B3:B8 = Status names (Carpark, Waiting, etc.)

// - Settings!C3:C8 = Completed task count

// - Settings!D3:D8 = Total task count

// - Settings!E3:E8 = Total task ceiling

// - SPARKLINE built as: {completed, total-completed}

// ====== CONSTANTS ======
const SHEET_NAMES = {
  CARPARK: "Carpark",
  WAITING: "Waiting",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  KANBAN: "Kanban Board",
  SETTINGS: "Settings",
  FULFILLMENT: "Fullfillment"
};
const TASK_SHEETS = [
  SHEET_NAMES.CARPARK,
  SHEET_NAMES.WAITING,
  SHEET_NAMES.TODO,
  SHEET_NAMES.IN_PROGRESS,
  SHEET_NAMES.COMPLETED,
  SHEET_NAMES.ARCHIVED
];
const COLUMNS = {
  TASK: 1,           // A
  DESCRIPTION: 2,    // B
  PRIORITY: 3,       // C
  LABEL: 4,          // D
  PILLAR: 5,         // E
  WHO: 6,            // F - Assigned person
  DUE_DATE: 7,       // G
  STATUS: 8,         // H
  DATE_COMPLETED: 9, // I
  LAST_UPDATED: 10,  // J
  CREATED_DATE: 11   // K
};
const DATA_START_ROW = 5;
const DATE_FORMAT = "dd/MM/yyyy";
const CARD_HEIGHT = 60;

// Helper function to sort person sheets by Status > Urgent > Priority
// Helper function to extract numeric value from priority (handles "AI-1", "1", etc.)
// Pure numbers (1, 2, 3) come first, then text-prefixed numbers (A1, AI-1, etc.)
function extractPriorityNumber(priority) {
  if (!priority) return Infinity;
  
  const priorityStr = priority.toString().trim();
  if (priorityStr === '') return Infinity;
  
  // First try parsing as a plain number (no letters)
  const asNumber = parseFloat(priorityStr);
  if (!isNaN(asNumber) && /^\d+(\.\d+)?$/.test(priorityStr)) {
    // Pure number: 1, 2, 3... - these sort first
    return asNumber;
  }
  
  // If that fails, try extracting numbers from text like "AI-1", "A2", "P-5", etc.
  const match = priorityStr.match(/(\d+)/);
  if (match) {
    // Text + number: add 10000 to push after pure numbers
    // So: 1, 2, 3 come before A1 (10001), A2 (10002), AI-1 (10001)
    return 10000 + parseFloat(match[1]);
  }
  
  // If no number found, sort to end
  return Infinity;
}

function sortPersonSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) return;
  
  const numRows = lastRow - DATA_START_ROW + 1;
  if (numRows <= 0) return;
  
  const range = sheet.getRange(DATA_START_ROW, 1, numRows, sheet.getLastColumn());
  const values = range.getValues();
  
  // Define status priority order
  const statusOrder = {
    [SHEET_NAMES.CARPARK]: 1,
    [SHEET_NAMES.WAITING]: 2,
    [SHEET_NAMES.TODO]: 3,
    [SHEET_NAMES.IN_PROGRESS]: 4,
    [SHEET_NAMES.COMPLETED]: 5,
    [SHEET_NAMES.ARCHIVED]: 6
  };
  
  // Sort with custom logic
  const sorted = values.map((row, i) => ({ row, index: i })).sort((a, b) => {
    const statusA = a.row[COLUMNS.STATUS - 1];
    const statusB = b.row[COLUMNS.STATUS - 1];
    const labelA = (a.row[COLUMNS.LABEL - 1] || "").toString().toLowerCase();
    const labelB = (b.row[COLUMNS.LABEL - 1] || "").toString().toLowerCase();
    const priorityA = extractPriorityNumber(a.row[COLUMNS.PRIORITY - 1]);
    const priorityB = extractPriorityNumber(b.row[COLUMNS.PRIORITY - 1]);
    
    // 1. Sort by Status first
    const statusOrderA = statusOrder[statusA] || 999;
    const statusOrderB = statusOrder[statusB] || 999;
    if (statusOrderA !== statusOrderB) {
      return statusOrderA - statusOrderB;
    }
    
    // 2. Within same status, Urgent items come first
    const isUrgentA = labelA.includes('urgent');
    const isUrgentB = labelB.includes('urgent');
    if (isUrgentA && !isUrgentB) return -1;
    if (!isUrgentA && isUrgentB) return 1;
    
    // 3. Then sort by Priority (ascending: 1, 2, 3...)
    return priorityA - priorityB;
  });
  
  const sortedValues = sorted.map(item => item.row);
  range.setValues(sortedValues);
}

// Helper function to set up data validation (dropdowns) for a task row
function setupTaskRowValidation(sheet, row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!settingsSheet) return;
  
  try {
    // Column F: Who dropdown (from Settings E13:E20)
    const peopleRange = settingsSheet.getRange('E13:E20');
    const whoValidation = SpreadsheetApp.newDataValidation()
      .requireValueInRange(peopleRange, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(row, COLUMNS.WHO).setDataValidation(whoValidation);
    
    // Column H: Status dropdown (valid sheet names)
    // Allow invalid values temporarily to avoid errors when status is empty
    const statusValidation = SpreadsheetApp.newDataValidation()
      .requireValueInList(TASK_SHEETS, true)
      .setAllowInvalid(true)  // Allow invalid so empty cells don't cause errors
      .build();
    sheet.getRange(row, COLUMNS.STATUS).setDataValidation(statusValidation);
    
    // Column D: Label dropdown (from Settings I3:I8) - if exists
    const labelsRange = settingsSheet.getRange('I3:I8');
    const labelValidation = SpreadsheetApp.newDataValidation()
      .requireValueInRange(labelsRange, true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(row, COLUMNS.LABEL).setDataValidation(labelValidation);
    
    // Column E: Pillar dropdown (from Settings G13:G20) - if exists
    const pillarsRange = settingsSheet.getRange('G13:G20');
    const pillarValidation = SpreadsheetApp.newDataValidation()
      .requireValueInRange(pillarsRange, true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(row, COLUMNS.PILLAR).setDataValidation(pillarValidation);
    
  } catch (error) {
    Logger.log('Error setting up validation: ' + error);
  }
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Task Tools')
    .addItem('➕ Add New Task', 'showTaskSidebar')
    .addItem('🔍 Search Tasks', 'showSearchDialog')
    .addSeparator()
    .addItem('↻ Rebuild Kanban Board', 'rebuildKanbanBoard')
    .addItem('📦 Update Fullfillment View', 'updateFullfillmentSheet')
    .addItem('👤 Update Person Sheets', 'updatePersonSheets')
    .addItem('↕ Resort Tasks', 'resortAllTaskTabs')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Analytics & Reports')
      .addItem('📈 Generate Analytics', 'generateAnalytics')
      .addItem('📧 Setup Email Notifications', 'installDailyNotificationTrigger')
      .addItem('✉️ Send Test Notification', 'sendDueDateNotifications'))
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Configuration')
      .addItem('🎯 Complete Setup Wizard (Stage 1)', 'completeSetupWizard')
      .addItem('📋 Create Task Sheets (Stage 2)', 'createTaskSheetsWizard')
      .addSeparator()
      .addItem('⚡ Setup All Triggers', 'setupAllTriggers')
      .addItem('👁️ View Current Triggers', 'viewCurrentTriggers')
      .addItem('🧪 Test Triggers', 'testTriggers')
      .addSeparator()
      .addItem('📊 Settings Sheet Helper', 'setupConfigurationHelper')
      .addItem('🔧 Fix Status Values', 'fixInvalidStatusValues')
      .addItem('🗑️ Clear Config Cache', 'clearConfigCache'))
    .addSeparator()
    .addItem('ℹ️ Person Sheet Help', 'showPersonSheetHelp')
    .addItem('ℹ️ About & Features', 'showAboutDialog')
    .addToUi();
}

function showAboutDialog() {
  const ui = SpreadsheetApp.getUi();
  const aboutText =
    '📊 GOOGLE SHEETS TASK MANAGEMENT SYSTEM\n' +
    'Version 2.0 - Enhanced & Configurable\n\n' +
    '✨ KEY FEATURES:\n\n' +
    '📋 Core Functionality:\n' +
    '   • Multi-stage task tracking (Carpark → Waiting → To Do → In Progress → Completed)\n' +
    '   • Interactive person sheets with auto-sync\n' +
    '   • Pillar/department filtering (Fulfillment view)\n' +
    '   • Visual Kanban board\n' +
    '   • Smart priority sorting (handles numeric & text formats)\n\n' +
    '🔍 New Features:\n' +
    '   • Advanced search with filters\n' +
    '   • Analytics dashboard with metrics\n' +
    '   • Email notifications for due dates\n' +
    '   • Configurable settings (terminology, ranges)\n' +
    '   • Performance optimizations with caching\n\n' +
    '⚙️ Configuration:\n' +
    '   • All ranges dynamically detected\n' +
    '   • Customize column names and fields\n' +
    '   • Easy setup wizard for new users\n\n' +
    '🚀 Getting Started:\n' +
    '   1. Go to Task Tools → ⚙️ Configuration → Setup Helper\n' +
    '   2. Customize your Settings sheet\n' +
    '   3. Start adding tasks!\n\n' +
    '📖 Documentation:\n' +
    'https://github.com/oliveoi1/google-sheets-task-management\n\n' +
    'Built with ❤️ for productivity';
  
  ui.alert('About Task Management System', aboutText, ui.ButtonSet.OK);
}

function showPersonSheetHelp() {
  const ui = SpreadsheetApp.getUi();
  const helpText = 
    '📋 PERSON SHEET FEATURES:\n\n' +
    '✅ ADD NEW TASKS:\n' +
    '   • Type a task title in column A\n' +
    '   • Fill in details (Description, Priority, etc.)\n' +
    '   • Select a Status - task will be created!\n\n' +
    '✅ EDIT EXISTING TASKS:\n' +
    '   • Task/Description: Updates sync to main sheets\n' +
    '   • Priority/Label/Pillar: Updates sync & re-sorts\n' +
    '   • Status: Task moves, stays on your sheet\n' +
    '   • Who: If changed to someone else, task leaves your sheet\n\n' +
    '📊 SMART SORTING:\n' +
    '   • Grouped by: Carpark → Waiting → To Do → In Progress → Completed\n' +
    '   • Within each group: Urgent tasks first, then by Priority (1, 2, 3...)\n' +
    '   • Auto-sorts when you change Status, Priority, or Label\n\n' +
    '💡 TIP: Changes sync automatically - no refresh needed!';
  
  ui.alert('How to Use Person Sheets', helpText, ui.ButtonSet.OK);
}

function fixInvalidStatusValues() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let fixedCount = 0;
    
    // Skip Archived and Completed sheets - they don't need validation updates
    const sheetsToFix = [
      SHEET_NAMES.CARPARK,
      SHEET_NAMES.WAITING,
      SHEET_NAMES.TODO,
      SHEET_NAMES.IN_PROGRESS
    ];
    
    sheetsToFix.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      if (lastRow < DATA_START_ROW) return;
      
      // Get all Status column values
      const statusRange = sheet.getRange(DATA_START_ROW, COLUMNS.STATUS, lastRow - DATA_START_ROW + 1, 1);
      
      // IMPORTANT: Remove existing data validation first
      statusRange.clearDataValidations();
      
      const statusValues = statusRange.getValues();
      
      // Fix invalid values - set to current sheet name
      const fixedValues = statusValues.map(row => {
        const currentStatus = row[0];
        if (!currentStatus || !TASK_SHEETS.includes(currentStatus)) {
          fixedCount++;
          return [sheetName]; // Set to current sheet name
        }
        return row;
      });
      
      // Write the corrected values
      statusRange.setValues(fixedValues);
      
      // Re-apply data validation to all rows (but only if there are tasks)
      const numRows = lastRow - DATA_START_ROW + 1;
      if (numRows > 0 && numRows < 100) {  // Only for sheets with < 100 rows
        for (let i = DATA_START_ROW; i <= lastRow; i++) {
          setupTaskRowValidation(sheet, i);
        }
      } else if (numRows > 0) {
        // For large sheets, just log it
        Logger.log(`Skipped validation refresh for ${sheetName} (${numRows} rows - too many)`);
      }
    });
    
    SpreadsheetApp.getActive().toast(`✅ Fixed ${fixedCount} invalid status value(s). Run "Update Person Sheets" now.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error fixing status values: ' + error.message);
    Logger.log('fixInvalidStatusValues error: ' + error);
  }
}

function updateFullfillmentSheet() {

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const fullfillmentTasks = [];

  // Loop through each task sheet (exclude Archived)
  const includeSheetsForFullfillment = [
    SHEET_NAMES.CARPARK,
    SHEET_NAMES.WAITING,
    SHEET_NAMES.TODO,
    SHEET_NAMES.IN_PROGRESS,
    SHEET_NAMES.COMPLETED
  ];

  includeSheetsForFullfillment.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow < DATA_START_ROW) return;
    const data = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, 11).getValues(); // A to K (includes Who column)
    const filtered = data.filter(row => {
      const pillar = row[COLUMNS.PILLAR - 1]; // Column E (array index 4)
      return pillar && pillar.toString().toLowerCase() === "fullfillment";
    });
    fullfillmentTasks.push(...filtered);
  });

  // Get or create the Fullfillment sheet
  let fullfillmentSheet = ss.getSheetByName(SHEET_NAMES.FULFILLMENT);
  if (!fullfillmentSheet) {
    fullfillmentSheet = ss.insertSheet(SHEET_NAMES.FULFILLMENT);
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
  const headers = ["Task", "Description", "Priority", "Label", "Pillar", "Who", "Due Date", "Status", "Date Completed", "Last Updated", "Created Date"];
  const headerRange = fullfillmentSheet.getRange(4, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold"); // Make headers bold

  // Write data starting in row 5
  if (fullfillmentTasks.length > 0) {
    fullfillmentSheet.getRange(DATA_START_ROW, 1, fullfillmentTasks.length, fullfillmentTasks[0].length).setValues(fullfillmentTasks);
    
    // Set up data validation (dropdowns) for each task row (first 50 to avoid timeout)
    const rowsToValidate = Math.min(fullfillmentTasks.length, 50);
    for (let i = 0; i < rowsToValidate; i++) {
      setupTaskRowValidation(fullfillmentSheet, DATA_START_ROW + i);
    }
  } else {
    fullfillmentSheet.getRange(DATA_START_ROW, 1).setValue("No tasks found.");
  }

  // Sort by Status > Urgent > Priority
  if (fullfillmentTasks.length > 0) {
    sortPersonSheet(fullfillmentSheet); // Use same sort logic as person sheets
  }

  // Apply banded rows (includes header + data + empty rows)
  const lastDataRow = fullfillmentSheet.getLastRow();
  const emptyRowsToSetup = 10;
  const totalRows = Math.max(lastDataRow, DATA_START_ROW) - 4 + 1 + emptyRowsToSetup;
  const range = fullfillmentSheet.getRange(4, 1, totalRows, headers.length);
  const band = fullfillmentSheet.getBandings();
  if (band.length > 0) band.forEach(b => b.remove());
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  // Center align Priority and Date columns
  const columnsToCenter = [COLUMNS.PRIORITY, COLUMNS.DUE_DATE, COLUMNS.DATE_COMPLETED, COLUMNS.LAST_UPDATED, COLUMNS.CREATED_DATE];
  columnsToCenter.forEach(colNum => {
    fullfillmentSheet.getRange(DATA_START_ROW, colNum, totalRows - 1).setHorizontalAlignment("center");
  });

  // Set up dropdowns on empty rows below data
  const maxRows = fullfillmentSheet.getMaxRows();
  const rowsNeeded = lastDataRow + emptyRowsToSetup;
  
  if (rowsNeeded > maxRows) {
    fullfillmentSheet.insertRowsAfter(maxRows, rowsNeeded - maxRows);
  }
  
  for (let i = 1; i <= emptyRowsToSetup; i++) {
    setupTaskRowValidation(fullfillmentSheet, lastDataRow + i);
  }

  SpreadsheetApp.getActive().toast("✅ Fulfillment sheet updated successfully.");

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error updating Fulfillment sheet: ' + error.message);
    Logger.log('updateFullfillmentSheet error: ' + error);
  }
}

function updatePersonSheets() {

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (!settingsSheet) {
      throw new Error('Settings sheet not found');
    }

    // Get list of people from Settings!E13:E20
    const peopleData = settingsSheet.getRange('E13:E20').getValues().flat().filter(String);
    if (peopleData.length === 0) {
      SpreadsheetApp.getUi().alert('No people found in Settings!E13:E20');
      return;
    }

    // Sheets to include in person views (exclude Archived)
    const includeSheets = [
      SHEET_NAMES.CARPARK,
      SHEET_NAMES.WAITING,
      SHEET_NAMES.TODO,
      SHEET_NAMES.IN_PROGRESS,
      SHEET_NAMES.COMPLETED
    ];
    let updatedCount = 0;

    // Create/update a sheet for each person
    peopleData.forEach(person => {
      const personTasks = [];

      // Loop through each included task sheet
      includeSheets.forEach(sheetName => {
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) return;
        const lastRow = sheet.getLastRow();
        if (lastRow < DATA_START_ROW) return;
        const data = sheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, 11).getValues(); // A to K
        const filtered = data.filter(row => {
          const assignedTo = row[COLUMNS.WHO - 1]; // Column F
          return assignedTo && assignedTo.toString().trim() === person.trim();
        });
        personTasks.push(...filtered);
      });

      // Get or create the person's sheet
      let personSheet = ss.getSheetByName(person);
      if (!personSheet) {
        personSheet = ss.insertSheet(person);
      } else {
        personSheet.clear(); // Clear old data
      }

      // Set title in A1
      personSheet.getRange("A1")
        .setValue(`${person}'s Tasks`)
        .setFontWeight("bold")
        .setFontSize(14)
        .setFontFamily("Arial");

      // Set instruction message in B1
      personSheet.getRange("B1").setValue('This is a snapshot. To update go to the "Task Tools" menu. You can change Status to move tasks.');

      // Set headers in row 4
      const headers = ["Task", "Description", "Priority", "Label", "Pillar", "Who", "Due Date", "Status", "Date Completed", "Last Updated", "Created Date"];
      const headerRange = personSheet.getRange(4, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight("bold"); // Make headers bold

  // Write data starting in row 5
  if (personTasks.length > 0) {
    // Clean up Status values before writing to ensure they match sheet names
    const cleanedTasks = personTasks.map(taskRow => {
      const statusValue = taskRow[COLUMNS.STATUS - 1];
      // Ensure Status value is valid, otherwise leave empty
      if (!TASK_SHEETS.includes(statusValue)) {
        taskRow[COLUMNS.STATUS - 1] = ""; // Clear invalid status
      }
      return taskRow;
    });
    
    personSheet.getRange(DATA_START_ROW, 1, cleanedTasks.length, cleanedTasks[0].length).setValues(cleanedTasks);
    
    // Set up data validation (dropdowns) - but only for first 50 rows to avoid timeout
    const rowsToValidate = Math.min(cleanedTasks.length, 50);
    for (let i = 0; i < rowsToValidate; i++) {
      setupTaskRowValidation(personSheet, DATA_START_ROW + i);
    }
    if (cleanedTasks.length > 50) {
      Logger.log(`Only applied validation to first 50 rows for ${person} (has ${cleanedTasks.length} tasks)`);
    }
  } else {
    personSheet.getRange(DATA_START_ROW, 1).setValue("No tasks assigned.");
  }

      // Sort by Status > Urgent > Priority
      if (personTasks.length > 0) {
        sortPersonSheet(personSheet);
      }

      // Apply banded rows (includes header + data + empty rows)
      const lastDataRow = personSheet.getLastRow();
      const emptyRowsToSetup = 10;
      const totalRows = Math.max(lastDataRow, DATA_START_ROW) - 4 + 1 + emptyRowsToSetup; // Include empty rows in banding
      const range = personSheet.getRange(4, 1, totalRows, headers.length);
      const band = personSheet.getBandings();
      if (band.length > 0) band.forEach(b => b.remove());
      range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

      // Center align Priority and Date columns
      // Priority = Column C, Due Date = Column G, Date Completed = Column I, Last Updated = Column J, Created Date = Column K
      const columnsToCenter = [COLUMNS.PRIORITY, COLUMNS.DUE_DATE, COLUMNS.DATE_COMPLETED, COLUMNS.LAST_UPDATED, COLUMNS.CREATED_DATE];
      columnsToCenter.forEach(colNum => {
        personSheet.getRange(DATA_START_ROW, colNum, totalRows - 1).setHorizontalAlignment("center");
      });

      // ✨ Set up dropdowns on empty rows below data (for easy new task entry)
      const maxRows = personSheet.getMaxRows();
      const rowsNeeded = lastDataRow + emptyRowsToSetup;
      
      // Add more rows if needed
      if (rowsNeeded > maxRows) {
        personSheet.insertRowsAfter(maxRows, rowsNeeded - maxRows);
      }
      
      for (let i = 1; i <= emptyRowsToSetup; i++) {
        setupTaskRowValidation(personSheet, lastDataRow + i);
      }

      updatedCount++;
    });
    SpreadsheetApp.getActive().toast(`✅ ${updatedCount} person sheet(s) updated successfully.`);

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error updating person sheets: ' + error.message);
    Logger.log('updatePersonSheets error: ' + error);
  }
}

function resortAllTaskTabs() {

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sortedCount = 0;
    TASK_SHEETS.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (!sheet) {
        Logger.log(`Warning: Sheet "${name}" not found, skipping.`);
        return;
      }
      if (name === SHEET_NAMES.COMPLETED || name === SHEET_NAMES.ARCHIVED) {
        sortIfCompletedOrArchived(sheet);
      } else {
        sortSheetByPriority(sheet);
      }
      sortedCount++;
    });
    SpreadsheetApp.getActive().toast(`✅ ${sortedCount} task tab(s) resorted.`);

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error resorting task tabs: ' + error.message);
    Logger.log('resortAllTaskTabs error: ' + error);
  }
}

function onEdit(e) {
  if (!e || !e.range) return;
  const range = e.range;
  const sheet = range.getSheet();
  const col = range.getColumn();
  const row = range.getRow();
  const sheetName = sheet.getName();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Get list of person names from Settings
  const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  let personNames = [];
  if (settingsSheet) {

    try {
      personNames = settingsSheet.getRange('E13:E20').getValues().flat().filter(String).map(n => n.trim());

    } catch (e) {
      Logger.log('Error getting person names: ' + e);
    }
  }

  // Check if this is a task sheet, person sheet, or fulfillment sheet
  const isTaskSheet = TASK_SHEETS.includes(sheetName);
  const isPersonSheet = personNames.includes(sheetName);
  const isFullfillmentSheet = sheetName === SHEET_NAMES.FULFILLMENT;
  
  if ((!isTaskSheet && !isPersonSheet && !isFullfillmentSheet) || row < DATA_START_ROW) return;
  const taskValue = sheet.getRange(row, COLUMNS.TASK).getDisplayValue();
  const createdDateCell = sheet.getRange(row, COLUMNS.CREATED_DATE);

  // ✅ Auto-fill 'Created Date' if blank and task title exists (only on main task sheets)
  if (isTaskSheet && taskValue && !createdDateCell.getValue()) {
    const today = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), DATE_FORMAT);
    createdDateCell.setValue(today);
  }

  // ✅ Check if editing editable columns: Task, Description, Status, Priority, Label, Pillar, or Who
  const editableColumns = [COLUMNS.TASK, COLUMNS.DESCRIPTION, COLUMNS.STATUS, COLUMNS.PRIORITY, COLUMNS.LABEL, COLUMNS.PILLAR, COLUMNS.WHO];
  if (!editableColumns.includes(col)) return;
  
  const now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), DATE_FORMAT);
  const newValue = range.getDisplayValue().trim();
  
  // Special validation for Status column
  if (col === COLUMNS.STATUS && !TASK_SHEETS.includes(newValue)) return;
  
  // ✨ SPECIAL HANDLING FOR FULFILLMENT SHEET
  if (isFullfillmentSheet) {
    // On fulfillment sheet, sync changes to main sheets
    const taskTitle = sheet.getRange(row, COLUMNS.TASK).getValue();
    const currentPillar = sheet.getRange(row, COLUMNS.PILLAR).getValue();
    
    // Handle empty task - might be a new row being added
    if (!taskTitle || taskTitle.trim() === "") return;
    
    // Check if this is a new task (doesn't exist on any main sheet)
    let isNewTask = true;
    
    // Find which main sheet has this task
    let oldStatusSheet = null;
    let taskRowIndex = -1;
    let taskRowData = null;
    
    for (const checkSheetName of TASK_SHEETS) {
      const checkSheet = ss.getSheetByName(checkSheetName);
      if (!checkSheet) continue;
      
      const lastRow = checkSheet.getLastRow();
      if (lastRow < DATA_START_ROW) continue;
      
      const taskData = checkSheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, checkSheet.getLastColumn()).getValues();
      
      // Find matching task by title and pillar = "Fulfillment"
      for (let i = 0; i < taskData.length; i++) {
        const taskPillar = (taskData[i][COLUMNS.PILLAR - 1] || "").toString().toLowerCase();
        if (taskData[i][COLUMNS.TASK - 1] === taskTitle && taskPillar === "fullfillment") {
          oldStatusSheet = checkSheet;
          taskRowIndex = DATA_START_ROW + i;
          taskRowData = taskData[i];
          isNewTask = false;
          break;
        }
      }
      if (oldStatusSheet) break;
    }
    
    // IF NEW TASK: Create it on the appropriate main sheet
    if (isNewTask) {
      const statusValue = sheet.getRange(row, COLUMNS.STATUS).getValue() || SHEET_NAMES.TODO;
      const targetSheet = ss.getSheetByName(statusValue);
      
      if (targetSheet) {
        const lastCol = sheet.getLastColumn();
        const newTaskData = sheet.getRange(row, 1, 1, Math.min(lastCol, 11)).getValues()[0];
        
        // Ensure Pillar is set to "Fulfillment"
        if (!newTaskData[COLUMNS.PILLAR - 1] || newTaskData[COLUMNS.PILLAR - 1].toString().toLowerCase() !== "fullfillment") {
          newTaskData[COLUMNS.PILLAR - 1] = "Fulfillment";
          sheet.getRange(row, COLUMNS.PILLAR).setValue("Fulfillment");
        }
        
        // Set timestamps
        newTaskData[COLUMNS.LAST_UPDATED - 1] = now;
        newTaskData[COLUMNS.CREATED_DATE - 1] = now;
        if (statusValue === SHEET_NAMES.COMPLETED) {
          newTaskData[COLUMNS.DATE_COMPLETED - 1] = now;
        }
        
        targetSheet.appendRow(newTaskData);
        const newRow = targetSheet.getLastRow();
        setupTaskRowValidation(targetSheet, newRow);
        
        if ([SHEET_NAMES.COMPLETED, SHEET_NAMES.ARCHIVED].includes(statusValue)) {
          sortIfCompletedOrArchived(targetSheet);
        } else {
          sortSheetByPriority(targetSheet);
        }
        
        sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
        sheet.getRange(row, COLUMNS.CREATED_DATE).setValue(now);
        
        sortPersonSheet(sheet);
        
        const lastDataRow = sheet.getLastRow();
        const maxRows = sheet.getMaxRows();
        const rowsNeeded = lastDataRow + 5;
        if (rowsNeeded > maxRows) {
          sheet.insertRowsAfter(maxRows, rowsNeeded - maxRows);
        }
        for (let i = 1; i <= 5; i++) {
          setupTaskRowValidation(sheet, lastDataRow + i);
        }
        
        rebuildKanbanBoard();
        SpreadsheetApp.getActive().toast(`✅ New fulfillment task created on '${statusValue}' sheet!`);
      }
      return;
    }
    
    // EXISTING TASK: Update it on main sheets
    if (oldStatusSheet && taskRowData) {
      let rowValues = taskRowData;
      rowValues[col - 1] = newValue;
      rowValues[COLUMNS.LAST_UPDATED - 1] = now;
      
      // If Status changed, handle moving between sheets
      if (col === COLUMNS.STATUS) {
        const targetSheet = ss.getSheetByName(newValue);
        if (targetSheet && targetSheet.getName() !== oldStatusSheet.getName()) {
          rowValues[COLUMNS.DATE_COMPLETED - 1] = (newValue === SHEET_NAMES.COMPLETED) ? now : rowValues[COLUMNS.DATE_COMPLETED - 1];
          rowValues[COLUMNS.STATUS - 1] = newValue;
          
          targetSheet.appendRow(rowValues);
          const newRow = targetSheet.getLastRow();
          setupTaskRowValidation(targetSheet, newRow);
          
          oldStatusSheet.deleteRow(taskRowIndex);
          
          if ([SHEET_NAMES.COMPLETED, SHEET_NAMES.ARCHIVED].includes(newValue)) {
            sortIfCompletedOrArchived(targetSheet);
          } else {
            sortSheetByPriority(targetSheet);
          }
          sortSheetByPriority(oldStatusSheet);
          
          sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
          if (newValue === SHEET_NAMES.COMPLETED) {
            sheet.getRange(row, COLUMNS.DATE_COMPLETED).setValue(now);
          }
          
          sortPersonSheet(sheet);
          rebuildKanbanBoard();
          SpreadsheetApp.getActive().toast(`✅ Task moved to '${newValue}' on main sheets.`);
        }
      }
      // If Pillar changed away from Fulfillment, remove from sheet
      else if (col === COLUMNS.PILLAR && newValue.toLowerCase() !== "fullfillment") {
        oldStatusSheet.getRange(taskRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        sheet.deleteRow(row);
        SpreadsheetApp.getActive().toast(`✅ Pillar changed to '${newValue}' - removed from Fulfillment sheet.`);
      }
      // For other columns, update in place
      else {
        oldStatusSheet.getRange(taskRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
        
        if ([COLUMNS.PRIORITY, COLUMNS.LABEL, COLUMNS.STATUS].includes(col)) {
          sortPersonSheet(sheet);
        }
        
        const columnNames = {
          [COLUMNS.TASK]: "Task",
          [COLUMNS.DESCRIPTION]: "Description",
          [COLUMNS.PRIORITY]: "Priority",
          [COLUMNS.LABEL]: "Label",
          [COLUMNS.PILLAR]: "Pillar",
          [COLUMNS.WHO]: "Who"
        };
        SpreadsheetApp.getActive().toast(`✅ ${columnNames[col]} updated on main sheets.`);
      }
    }
    return;
  }
  
  // ✨ SPECIAL HANDLING FOR PERSON SHEETS
  if (isPersonSheet) {
    // On person sheets, sync changes to main sheets
    const taskTitle = sheet.getRange(row, COLUMNS.TASK).getValue();
    const currentWho = sheet.getRange(row, COLUMNS.WHO).getValue();
    
    // Handle empty task - might be a new row being added
    if (!taskTitle || taskTitle.trim() === "") return;
    
    // Check if this is a new task (doesn't exist on any main sheet)
    let isNewTask = true;
    
    // Find which main sheet has this task (that's the old status)
    let oldStatusSheet = null;
    let taskRowIndex = -1;
    let taskRowData = null;
    
    for (const sheetName of TASK_SHEETS) {
      const checkSheet = ss.getSheetByName(sheetName);
      if (!checkSheet) continue;
      
      const lastRow = checkSheet.getLastRow();
      if (lastRow < DATA_START_ROW) continue;
      
      const taskData = checkSheet.getRange(DATA_START_ROW, 1, lastRow - DATA_START_ROW + 1, checkSheet.getLastColumn()).getValues();
      
      // Find matching task
      for (let i = 0; i < taskData.length; i++) {
        if (taskData[i][COLUMNS.TASK - 1] === taskTitle && 
            taskData[i][COLUMNS.WHO - 1] === sheetName) { // Match by task title and person name
          oldStatusSheet = checkSheet;
          taskRowIndex = DATA_START_ROW + i;
          taskRowData = taskData[i];
          isNewTask = false;
          break;
        }
      }
      if (oldStatusSheet) break;
    }
    
    // ✨ IF NEW TASK: Create it on the appropriate main sheet
    if (isNewTask) {
      const statusValue = sheet.getRange(row, COLUMNS.STATUS).getValue() || SHEET_NAMES.TODO;
      const targetSheet = ss.getSheetByName(statusValue);
      
      if (targetSheet) {
        // Get all values from the person sheet row
        const lastCol = sheet.getLastColumn();
        const newTaskData = sheet.getRange(row, 1, 1, Math.min(lastCol, 11)).getValues()[0];
        
        // Ensure Who is set to current person if blank
        if (!newTaskData[COLUMNS.WHO - 1]) {
          newTaskData[COLUMNS.WHO - 1] = sheetName;
          sheet.getRange(row, COLUMNS.WHO).setValue(sheetName);
        }
        
        // Set timestamps
        newTaskData[COLUMNS.LAST_UPDATED - 1] = now;
        newTaskData[COLUMNS.CREATED_DATE - 1] = now;
        if (statusValue === SHEET_NAMES.COMPLETED) {
          newTaskData[COLUMNS.DATE_COMPLETED - 1] = now;
        }
        
        // Add to target main sheet
        targetSheet.appendRow(newTaskData);
        const newRow = targetSheet.getLastRow();
        setupTaskRowValidation(targetSheet, newRow);
        
        // Sort the target sheet
        if ([SHEET_NAMES.COMPLETED, SHEET_NAMES.ARCHIVED].includes(statusValue)) {
          sortIfCompletedOrArchived(targetSheet);
        } else {
          sortSheetByPriority(targetSheet);
        }
        
        // Update timestamps on person sheet
        sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
        sheet.getRange(row, COLUMNS.CREATED_DATE).setValue(now);
        
        // Sort person sheet to put new task in correct position
        sortPersonSheet(sheet);
        
        // Set up dropdowns on the next few empty rows
        const lastDataRow = sheet.getLastRow();
        const maxRows = sheet.getMaxRows();
        const rowsNeeded = lastDataRow + 5;
        
        // Add more rows if needed
        if (rowsNeeded > maxRows) {
          sheet.insertRowsAfter(maxRows, rowsNeeded - maxRows);
        }
        
        for (let i = 1; i <= 5; i++) {
          setupTaskRowValidation(sheet, lastDataRow + i);
        }
        
        rebuildKanbanBoard();
        SpreadsheetApp.getActive().toast(`✅ New task created on '${statusValue}' sheet!`);
      }
      return; // Exit after creating new task
    }
    
    // ✨ EXISTING TASK: Update it on main sheets
    if (oldStatusSheet && taskRowData) {
      let rowValues = taskRowData;
      
      // Update the changed column
      rowValues[col - 1] = newValue;
      rowValues[COLUMNS.LAST_UPDATED - 1] = now;
      
      // If Status changed, handle moving between sheets
      if (col === COLUMNS.STATUS) {
        const targetSheet = ss.getSheetByName(newValue);
        if (targetSheet && targetSheet.getName() !== oldStatusSheet.getName()) {
          // Update dates for status change
          rowValues[COLUMNS.DATE_COMPLETED - 1] = (newValue === SHEET_NAMES.COMPLETED) ? now : rowValues[COLUMNS.DATE_COMPLETED - 1];
          rowValues[COLUMNS.STATUS - 1] = newValue;
          
          // Move to target sheet
          targetSheet.appendRow(rowValues);
          const newRow = targetSheet.getLastRow();
          setupTaskRowValidation(targetSheet, newRow);
          
          // Delete from old status sheet
          oldStatusSheet.deleteRow(taskRowIndex);
          
          // Sort sheets
          if ([SHEET_NAMES.COMPLETED, SHEET_NAMES.ARCHIVED].includes(newValue)) {
            sortIfCompletedOrArchived(targetSheet);
          } else {
            sortSheetByPriority(targetSheet);
          }
          sortSheetByPriority(oldStatusSheet);
          
          // Update person sheet dates
          sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
          if (newValue === SHEET_NAMES.COMPLETED) {
            sheet.getRange(row, COLUMNS.DATE_COMPLETED).setValue(now);
          }
          
          // Re-sort person sheet after status change
          sortPersonSheet(sheet);
          
          rebuildKanbanBoard();
          SpreadsheetApp.getActive().toast(`✅ Task moved to '${newValue}' on main sheets.`);
        }
      } 
      // If Who changed to someone else, remove from person sheet
      else if (col === COLUMNS.WHO && newValue !== sheetName) {
        // Update on main sheet
        oldStatusSheet.getRange(taskRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        
        // Remove from current person sheet
        sheet.deleteRow(row);
        
        SpreadsheetApp.getActive().toast(`✅ Task reassigned to '${newValue}' and removed from your sheet.`);
      }
      // For Task, Description, Priority, Label, Pillar - just update in place
      else {
        // Update on main sheet
        oldStatusSheet.getRange(taskRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
        
        // Update Last Updated on person sheet
        sheet.getRange(row, COLUMNS.LAST_UPDATED).setValue(now);
        
        // Re-sort person sheet if Priority, Label, or Status changed
        if ([COLUMNS.PRIORITY, COLUMNS.LABEL, COLUMNS.STATUS].includes(col)) {
          sortPersonSheet(sheet);
        }
        
        const columnNames = {
          [COLUMNS.TASK]: "Task",
          [COLUMNS.DESCRIPTION]: "Description",
          [COLUMNS.PRIORITY]: "Priority",
          [COLUMNS.LABEL]: "Label",
          [COLUMNS.PILLAR]: "Pillar",
          [COLUMNS.WHO]: "Who"
        };
        SpreadsheetApp.getActive().toast(`✅ ${columnNames[col]} updated on main sheets.`);
      }
    }
    return; // Exit early for person sheets
  }
  
  // ✨ STANDARD HANDLING FOR MAIN TASK SHEETS - Only for Status changes
  if (col !== COLUMNS.STATUS) return; // Only handle status moves on main sheets
  
  const newStatus = newValue;
  const sourceSheet = sheet;
  const targetSheet = ss.getSheetByName(newStatus);
  if (!targetSheet || targetSheet.getName() === sourceSheet.getName()) return;
  
  const lastCol = sourceSheet.getLastColumn();
  let rowValues = sourceSheet.getRange(row, 1, 1, lastCol).getValues()[0];

  // Update 'Date Completed' and 'Last Updated'
  rowValues[COLUMNS.DATE_COMPLETED - 1] = (newStatus === SHEET_NAMES.COMPLETED) ? now : rowValues[COLUMNS.DATE_COMPLETED - 1];
  rowValues[COLUMNS.LAST_UPDATED - 1] = now;
  targetSheet.appendRow(rowValues);
  
  // Set up data validation (dropdowns) for the newly added row
  const newRow = targetSheet.getLastRow();
  setupTaskRowValidation(targetSheet, newRow);
  
  sourceSheet.deleteRow(row);
  if ([SHEET_NAMES.COMPLETED, SHEET_NAMES.ARCHIVED].includes(newStatus)) {
    sortIfCompletedOrArchived(targetSheet);
  } else {
    sortSheetByPriority(targetSheet);
  }
  sortSheetByPriority(sourceSheet);
  rebuildKanbanBoard(`✅ Task moved to '${newStatus}' and sheets sorted.`);
}

function sortSheetByPriority(sheet) {
  const numRows = sheet.getLastRow() - DATA_START_ROW + 1;
  if (numRows <= 0) return;
  const range = sheet.getRange(DATA_START_ROW, 1, numRows, sheet.getLastColumn());
  const values = range.getValues();

  // Parse priorities and handle non-numeric values (supports "AI-1", "1", etc.)
  const parsed = values.map((row, i) => {
    const priority = extractPriorityNumber(row[COLUMNS.PRIORITY - 1]);
    return { row, index: i, priority: priority };
  });

  // Sort by priority (non-numeric values go to end)
  parsed.sort((a, b) => a.priority - b.priority);
  const sorted = parsed.map(p => p.row);
  range.setValues(sorted);
}

function sortIfCompletedOrArchived(sheet) {
  const sheetName = sheet.getName();
  if (sheetName === SHEET_NAMES.COMPLETED || sheetName === SHEET_NAMES.ARCHIVED) {
    const dateCol = COLUMNS.DATE_COMPLETED;
    const lastRow = sheet.getLastRow();
    const numRows = lastRow - DATA_START_ROW + 1;
    if (numRows > 0) {
      const range = sheet.getRange(DATA_START_ROW, 1, numRows, sheet.getLastColumn());
      range.sort({ column: dateCol, ascending: false });
    }
  }
}

function rebuildKanbanBoard() {

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const kanbanSheet = ss.getSheetByName(SHEET_NAMES.KANBAN);
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (!kanbanSheet) {
      throw new Error(`Sheet "${SHEET_NAMES.KANBAN}" not found. Please create it first.`);
    }
    if (!settingsSheet) {
      throw new Error(`Sheet "${SHEET_NAMES.SETTINGS}" not found. Please create it first.`);
    }
  const statusOrder = [
    SHEET_NAMES.CARPARK,
    SHEET_NAMES.WAITING,
    SHEET_NAMES.TODO,
    SHEET_NAMES.IN_PROGRESS,
    SHEET_NAMES.COMPLETED
  ];
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
  const START_ROW = DATA_START_ROW;

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
    if (!sheet) {
      Logger.log(`Warning: Sheet "${status}" not found, skipping in Kanban.`);
      return;
    }
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
    const taskRows = sheet.getRange(DATA_START_ROW, 1, Math.max(0, lastRow - DATA_START_ROW + 1), 9).getValues()
      .filter(row => row[COLUMNS.TASK - 1]); // Task Title column
    const showTasks = taskRows.slice(0, displayCount);
    showTasks.forEach((row, idx) => {
      const r = START_ROW + idx + 1;
      const cell = kanbanSheet.getRange(r, col);
      const isUrgent = (row[COLUMNS.LABEL - 1] || "").toString().toLowerCase().includes("urgent");
      const bg = isUrgent ? colors.urgent : colors.light;
      const title = row[COLUMNS.TASK - 1];
      const description = row[COLUMNS.DESCRIPTION - 1];
      const who = row[COLUMNS.WHO - 1];
      const pillar = row[COLUMNS.PILLAR - 1];
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
      
      // Build hover comment with Description, Who, and Pillar
      let comment = '';
      if (description) {
        comment += description;
      }
      if (who) {
        comment += (comment ? '\n\n' : '') + '👤 Assigned to: ' + who;
      }
      if (pillar) {
        comment += (comment ? '\n' : '') + '🏛️ Pillar: ' + pillar;
      }
      if (comment) {
        cell.setComment(comment);
      }
      
      kanbanSheet.setRowHeight(r, CARD_HEIGHT);
    });
  });
  SpreadsheetApp.getActive().toast("✅ Kanban Board Updated");

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error rebuilding Kanban Board: ' + error.message);
    Logger.log('rebuildKanbanBoard error: ' + error);
  }
}
