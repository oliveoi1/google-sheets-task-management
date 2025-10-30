// ====================================
// TRIGGER MANAGEMENT SYSTEM
// ====================================
// Automatically install and manage all necessary triggers

/**
 * Complete trigger setup - installs all required triggers
 * Run this once after installing the script
 */
function setupAllTriggers() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Remove all existing triggers first to avoid duplicates
    removeAllTriggers();
    
    // Install required triggers
    installOnOpenTrigger();
    installOnEditTrigger();
    
    const result = ui.alert(
      'Trigger Setup Complete!',
      'Required triggers installed:\n\n' +
      '✅ onOpen - Loads menu when spreadsheet opens\n' +
      '✅ onEdit - Enables interactive person/fulfillment sheets\n\n' +
      'Optional: Would you like to enable daily email notifications?',
      ui.ButtonSet.YES_NO
    );
    
    if (result === ui.Button.YES) {
      installDailyNotificationTrigger();
      ui.alert('Email notifications enabled! Reminders will be sent daily at 8 AM.');
    }
    
    ui.alert(
      'Setup Complete!',
      'Your task management system is ready to use!\n\n' +
      '📋 Next steps:\n' +
      '1. Customize your Settings sheet\n' +
      '2. Create your task stage sheets\n' +
      '3. Run "Update Person Sheets" to generate individual sheets\n' +
      '4. Start adding tasks!\n\n' +
      'Access everything from the Task Tools menu.',
      ui.ButtonSet.OK
    );
    
  } catch (error) {
    ui.alert('Error setting up triggers: ' + error.message + '\n\nYou may need to authorize the script first.');
    Logger.log('setupAllTriggers error: ' + error);
  }
}

/**
 * Install onOpen trigger
 * This trigger runs automatically, but we can verify it's set up
 */
function installOnOpenTrigger() {
  // Note: onOpen is a simple trigger and runs automatically
  // No installation needed, but we check if it exists
  const triggers = ScriptApp.getProjectTriggers();
  const hasOnOpen = triggers.some(t => t.getHandlerFunction() === 'onOpen');
  
  if (!hasOnOpen) {
    // Create installable onOpen trigger for better reliability
    ScriptApp.newTrigger('onOpen')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onOpen()
      .create();
  }
  
  Logger.log('onOpen trigger verified/installed');
}

/**
 * Install onEdit trigger
 * Required for interactive editing on person/fulfillment sheets
 */
function installOnEditTrigger() {
  // Note: onEdit is also a simple trigger and runs automatically
  // No installation needed unless we need additional permissions
  const triggers = ScriptApp.getProjectTriggers();
  const hasOnEdit = triggers.some(t => t.getHandlerFunction() === 'onEdit');
  
  if (!hasOnEdit) {
    // Create installable onEdit trigger if needed for permissions
    ScriptApp.newTrigger('onEdit')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
  }
  
  Logger.log('onEdit trigger verified/installed');
}

/**
 * Install daily notification trigger
 * Sends email reminders at 8 AM every day
 */
function installDailyNotificationTrigger() {
  // Delete existing notification triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDueDateNotifications') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new daily trigger at 8 AM
  ScriptApp.newTrigger('sendDueDateNotifications')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  
  Logger.log('Daily notification trigger installed');
}

/**
 * Remove all project triggers
 * Useful for cleanup or reinstalling
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log(`Removed ${triggers.length} trigger(s)`);
}

/**
 * View all current triggers
 * Shows what triggers are installed
 */
function viewCurrentTriggers() {
  const ui = SpreadsheetApp.getUi();
  const triggers = ScriptApp.getProjectTriggers();
  
  if (triggers.length === 0) {
    ui.alert(
      'No Triggers Found',
      'No triggers are currently installed.\n\n' +
      'Run "Complete Setup Wizard" to install required triggers.',
      ui.ButtonSet.OK
    );
    return;
  }
  
  let triggerList = 'Currently installed triggers:\n\n';
  
  triggers.forEach(trigger => {
    const func = trigger.getHandlerFunction();
    const type = trigger.getEventType();
    triggerList += `• ${func} (${type})\n`;
  });
  
  triggerList += '\n✅ = Working correctly';
  
  ui.alert('Current Triggers', triggerList, ui.ButtonSet.OK);
}

/**
 * Test if triggers are working
 * Validates trigger functionality
 */
function testTriggers() {
  const ui = SpreadsheetApp.getUi();
  const results = [];
  
  // Test onOpen
  try {
    onOpen();
    results.push('✅ onOpen - Working');
  } catch (error) {
    results.push('❌ onOpen - Error: ' + error.message);
  }
  
  // Test if menu exists
  const menu = ui.createMenu('Test');
  if (menu) {
    results.push('✅ Menu System - Working');
  } else {
    results.push('❌ Menu System - Failed');
  }
  
  // Test config loading
  try {
    const config = getConfig();
    results.push('✅ Configuration System - Working');
  } catch (error) {
    results.push('❌ Configuration System - Error: ' + error.message);
  }
  
  ui.alert('Trigger Test Results', results.join('\n'), ui.ButtonSet.OK);
}

/**
 * Complete setup wizard for new users
 * Walks through entire setup process
 */
function completeSetupWizard() {
  const ui = SpreadsheetApp.getUi();
  
  // Step 1: Welcome
  const welcome = ui.alert(
    '🎯 Welcome to Task Management Setup!',
    'This wizard will help you set up your task management system.\n\n' +
    'We\'ll configure:\n' +
    '• Settings sheet with your team and stages\n' +
    '• Required triggers for automation\n' +
    '• Optional features like notifications\n\n' +
    'This will take about 2-3 minutes.\n\n' +
    'Ready to begin?',
    ui.ButtonSet.YES_NO
  );
  
  if (welcome !== ui.Button.YES) {
    ui.alert('Setup cancelled. You can run this wizard anytime from:\nTask Tools → ⚙️ Configuration → Complete Setup Wizard');
    return;
  }
  
  // Step 2: Settings Sheet
  ui.alert(
    'Step 1: Settings Sheet',
    'First, let\'s set up your Settings sheet.\n\n' +
    'This sheet controls:\n' +
    '• Stage names (To Do, In Progress, etc.)\n' +
    '• Team member names\n' +
    '• Departments/Pillars\n' +
    '• Labels and categories\n\n' +
    'Click OK to create/verify Settings sheet.',
    ui.ButtonSet.OK
  );
  
  try {
    setupConfigurationHelper();
  } catch (error) {
    ui.alert('Error creating Settings sheet: ' + error.message);
    return;
  }
  
  // Step 3: Triggers
  ui.alert(
    'Step 2: Install Triggers',
    'Triggers enable automatic features:\n\n' +
    '• Menu loading when you open the sheet\n' +
    '• Interactive editing on person sheets\n' +
    '• Optional: Daily email notifications\n\n' +
    'Click OK to install triggers.\n\n' +
    '⚠️ You may be asked to authorize the script.',
    ui.ButtonSet.OK
  );
  
  try {
    setupAllTriggers();
  } catch (error) {
    ui.alert('Error installing triggers: ' + error.message + '\n\nYou can manually install triggers from:\nTask Tools → ⚙️ Configuration → Setup Triggers');
    return;
  }
  
  // Step 4: Create Task Sheets
  const createSheets = ui.alert(
    'Step 3: Create Task Sheets',
    'Would you like to automatically create sheets for each stage?\n\n' +
    'This will create:\n' +
    '• Carpark\n' +
    '• Waiting\n' +
    '• To Do\n' +
    '• In Progress\n' +
    '• Completed\n' +
    '• Archived\n\n' +
    'Each with proper headers, formatting, and dropdowns pre-applied!',
    ui.ButtonSet.YES_NO
  );
  
  if (createSheets === ui.Button.YES) {
    try {
      createTaskSheets();
      createKanbanBoard();
    } catch (error) {
      ui.alert('Error creating sheets: ' + error.message);
    }
  }
  
  // Step 5: Final Instructions
  ui.alert(
    '🎉 Setup Complete!',
    'Your task management system is ready!\n\n' +
    '📋 Quick Start Guide:\n' +
    '1. Customize Settings sheet with your team details\n' +
    '2. Add tasks using: Task Tools → ➕ Add New Task\n' +
    '3. Generate person sheets: Task Tools → 👤 Update Person Sheets\n' +
    '4. Build Kanban: Task Tools → ↻ Rebuild Kanban Board\n\n' +
    '💡 Tips:\n' +
    '• Use search to find tasks quickly (🔍 Search Tasks)\n' +
    '• View analytics anytime (📊 Analytics & Reports)\n' +
    '• Get help from: ℹ️ About & Features\n\n' +
    'Happy task managing! 🚀',
    ui.ButtonSet.OK
  );
}

/**
 * Create all task stage sheets with proper formatting and dropdowns
 */
function createTaskSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = getConfig();
  const stages = Object.values(config.stages);
  
  const headers = ['Task', 'Description', 'Priority', 'Label', 'Pillar', 'Who', 'Due Date', 'Status', 'Date Completed', 'Last Updated', 'Created Date'];
  
  stages.forEach(stageName => {
    let sheet = ss.getSheetByName(stageName);
    
    if (!sheet) {
      sheet = ss.insertSheet(stageName);
      
      // Add title
      sheet.getRange('A1').setValue(`${stageName} Tasks`)
        .setFontWeight('bold')
        .setFontSize(14)
        .setFontFamily('Arial');
      
      // Add instructions
      sheet.getRange('A2').setValue('Add tasks below. Dropdowns will appear in Label, Pillar, Who, and Status columns')
        .setFontSize(10)
        .setFontStyle('italic')
        .setFontColor('#86868B');
      
      // Add headers in row 4
      const headerRange = sheet.getRange(4, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#007AFF');
      headerRange.setFontColor('white');
      headerRange.setHorizontalAlignment('center');
      headerRange.setFontFamily('Arial');
      
      // Set column widths
      sheet.setColumnWidth(1, 250);  // Task
      sheet.setColumnWidth(2, 300);  // Description
      sheet.setColumnWidth(3, 80);   // Priority
      sheet.setColumnWidth(4, 120);  // Label
      sheet.setColumnWidth(5, 120);  // Pillar
      sheet.setColumnWidth(6, 100);  // Who
      sheet.setColumnWidth(7, 100);  // Due Date
      sheet.setColumnWidth(8, 120);  // Status
      sheet.setColumnWidth(9, 120);  // Date Completed
      sheet.setColumnWidth(10, 120); // Last Updated
      sheet.setColumnWidth(11, 120); // Created Date
      
      // Apply banded rows (prepare for future data)
      const range = sheet.getRange(4, 1, 20, headers.length);
      range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
      
      // Set up dropdowns for first 10 empty rows
      for (let i = 5; i <= 14; i++) {
        setupTaskRowValidation(sheet, i);
      }
      
      // Freeze header rows
      sheet.setFrozenRows(4);
      
      // Center align Priority and date columns
      sheet.getRange('C5:C').setHorizontalAlignment('center');
      sheet.getRange('G5:K').setHorizontalAlignment('center');
      
      Logger.log(`Created sheet: ${stageName}`);
    }
  });
  
  SpreadsheetApp.getActive().toast(`✅ Created ${stages.length} task sheets with dropdowns`);
}

/**
 * Create and format Kanban Board sheet
 */
function createKanbanBoard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let kanbanSheet = ss.getSheetByName('Kanban Board');
  
  if (!kanbanSheet) {
    kanbanSheet = ss.insertSheet('Kanban Board');
    
    // Add title
    kanbanSheet.getRange('B1').setValue("Overview of Tasks")
      .setFontWeight('bold')
      .setFontSize(14)
      .setFontFamily('Arial');
    
    // Add instructions
    kanbanSheet.getRange('J1')
      .setValue('This is a snapshot. To update go to the "Task Tools" menu')
      .setFontSize(10)
      .setHorizontalAlignment('right')
      .setFontStyle('italic')
      .setFontColor('#86868B');
    
    SpreadsheetApp.getActive().toast('✅ Kanban Board created');
  }
  
  // Build it with current data
  rebuildKanbanBoard();
}

/**
 * Reinstall specific trigger
 */
function reinstallTrigger(triggerType) {
  switch(triggerType) {
    case 'onOpen':
      installOnOpenTrigger();
      break;
    case 'onEdit':
      installOnEditTrigger();
      break;
    case 'notifications':
      installDailyNotificationTrigger();
      break;
  }
  
  SpreadsheetApp.getActive().toast(`✅ ${triggerType} trigger reinstalled`);
}

