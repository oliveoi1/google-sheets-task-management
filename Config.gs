// ====================================
// CONFIGURATION MANAGEMENT SYSTEM
// ====================================
// This file manages all user-configurable settings
// Makes the system adaptable for any organization

// Cache for configuration to avoid repeated reads
let CONFIG_CACHE = null;
let CONFIG_CACHE_TIME = null;
const CACHE_DURATION_MS = 30000; // 30 seconds

/**
 * Get configuration from Settings sheet with caching
 * This reduces API calls and improves performance
 */
function getConfig() {
  const now = new Date().getTime();
  
  // Return cached config if still valid
  if (CONFIG_CACHE && CONFIG_CACHE_TIME && (now - CONFIG_CACHE_TIME < CACHE_DURATION_MS)) {
    return CONFIG_CACHE;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName('Settings');
  
  if (!settingsSheet) {
    throw new Error('Settings sheet not found. Please ensure you have a Settings sheet.');
  }
  
  // Build configuration object
  const config = {
    // Core sheet names (these are fixed for now but could be made flexible)
    sheetNames: {
      settings: 'Settings',
      kanban: 'Kanban Board',
      fulfillment: 'Fullfillment'
    },
    
    // Task stage names - read from Settings
    stages: getStageNames(settingsSheet),
    
    // Custom column configuration
    customColumns: getCustomColumnConfig(settingsSheet),
    
    // People/team members
    people: getPeopleList(settingsSheet),
    
    // Dropdown data sources
    dropdowns: getDropdownData(settingsSheet),
    
    // Column mappings
    columns: {
      TASK: 1,
      DESCRIPTION: 2,
      PRIORITY: 3,
      LABEL: 4,
      PILLAR: 5,
      WHO: 6,
      DUE_DATE: 7,
      STATUS: 8,
      DATE_COMPLETED: 9,
      LAST_UPDATED: 10,
      CREATED_DATE: 11
    },
    
    // Display settings
    dataStartRow: 5,
    dateFormat: "dd/MM/yyyy",
    cardHeight: 60,
    
    // Feature flags
    features: {
      emailNotifications: true,
      analytics: true,
      search: true
    }
  };
  
  // Cache the configuration
  CONFIG_CACHE = config;
  CONFIG_CACHE_TIME = now;
  
  return config;
}

/**
 * Clear configuration cache (call this when Settings change)
 */
function clearConfigCache() {
  CONFIG_CACHE = null;
  CONFIG_CACHE_TIME = null;
}

/**
 * Get stage names dynamically from Settings sheet
 * Looks for data in column B starting from row 3
 */
function getStageNames(settingsSheet) {
  try {
    // Try to find stage names in Settings!B3:B20 (flexible range)
    const stageData = settingsSheet.getRange('B3:B20').getValues().flat().filter(String);
    
    if (stageData.length === 0) {
      // Fallback to default stage names
      return {
        CARPARK: 'Carpark',
        WAITING: 'Waiting',
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        ARCHIVED: 'Archived'
      };
    }
    
    // Build stage object dynamically
    const stages = {};
    stageData.forEach(stageName => {
      const key = stageName.toUpperCase().replace(/\s+/g, '_');
      stages[key] = stageName;
    });
    
    return stages;
  } catch (error) {
    Logger.log('Error reading stage names: ' + error);
    // Return defaults
    return {
      CARPARK: 'Carpark',
      WAITING: 'Waiting',
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      ARCHIVED: 'Archived'
    };
  }
}

/**
 * Get custom column configuration
 * This allows users to rename "Pillar" to "Department", "Category", etc.
 */
function getCustomColumnConfig(settingsSheet) {
  try {
    // Check if there's a "Column Config" section in Settings
    // For now, return defaults but structure is ready for customization
    return {
      label: {
        displayName: 'Label',
        dataRange: 'I3:I20', // Where dropdown options are stored
        enabled: true
      },
      pillar: {
        displayName: 'Pillar', // Users could change this to "Department", "Category", etc.
        dataRange: 'G13:G20',
        enabled: true
      },
      // Future: Allow users to add more custom columns
      // custom1: { displayName: 'Custom Field 1', dataRange: 'X1:X20', enabled: true }
    };
  } catch (error) {
    Logger.log('Error reading custom column config: ' + error);
    return {};
  }
}

/**
 * Get people/team member list dynamically
 * Searches for people data in Settings sheet
 */
function getPeopleList(settingsSheet) {
  try {
    // Find people in Settings!E13:E50 (extended range for flexibility)
    const peopleData = settingsSheet.getRange('E13:E50').getValues()
      .flat()
      .filter(String)
      .map(name => name.toString().trim());
    
    return peopleData;
  } catch (error) {
    Logger.log('Error reading people list: ' + error);
    return [];
  }
}

/**
 * Get all dropdown data sources
 */
function getDropdownData(settingsSheet) {
  try {
    return {
      statuses: settingsSheet.getRange('B3:B8').getValues().flat().filter(String),
      labels: settingsSheet.getRange('I3:I20').getValues().flat().filter(String),
      pillars: settingsSheet.getRange('G13:G20').getValues().flat().filter(String),
      people: getPeopleList(settingsSheet)
    };
  } catch (error) {
    Logger.log('Error reading dropdown data: ' + error);
    return {
      statuses: [],
      labels: [],
      pillars: [],
      people: []
    };
  }
}

/**
 * Helper to get array of task sheet names (stages that hold tasks)
 */
function getTaskSheets() {
  const config = getConfig();
  const stages = config.stages;
  
  // Return all stages except potentially some excluded ones
  return Object.values(stages);
}

/**
 * Setup function to help new users configure the system
 * Creates a beautifully formatted Settings sheet
 */
function setupConfigurationHelper() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  let settingsSheet = ss.getSheetByName('Settings');
  
  if (!settingsSheet) {
    const result = ui.alert(
      'Settings Sheet Not Found',
      'Would you like to create a formatted Settings sheet with default configuration?',
      ui.ButtonSet.YES_NO
    );
    
    if (result === ui.Button.YES) {
      settingsSheet = ss.insertSheet('Settings');
      
      // ==== TITLE ====
      settingsSheet.getRange('A1').setValue('📊 Task Management Configuration')
        .setFontWeight('bold')
        .setFontSize(16)
        .setFontFamily('Arial')
        .setFontColor('#1D1D1F');
      
      // ==== STAGE NAMES SECTION ====
      settingsSheet.getRange('A3').setValue('📋 Stage Names')
        .setFontWeight('bold')
        .setFontSize(12)
        .setBackground('#7D9D8E')  // Sage green
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      settingsSheet.getRange('B3').setValue('Stage Name')
        .setFontWeight('bold')
        .setBackground('#7D9D8E')  // Sage green
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      // Stage data area with extra rows for customization
      settingsSheet.getRange('B4:B12').setValues([
        ['Carpark'],
        ['Waiting'],
        ['To Do'],
        ['In Progress'],
        ['Completed'],
        ['Archived'],
        [''],  // Extra rows for user
        [''],
        ['']
      ]).setBackground('#E8EFE8');  // Soft sage tint
      
      // ==== LABELS SECTION ====
      settingsSheet.getRange('D3').setValue('🏷️ Task Labels')
        .setFontWeight('bold')
        .setFontSize(12)
        .setBackground('#A8B89F')  // Soft moss green
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      settingsSheet.getRange('E3').setValue('Label Name')
        .setFontWeight('bold')
        .setBackground('#A8B89F')  // Soft moss green
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      // Labels data area with extra rows
      settingsSheet.getRange('E4:E12').setValues([
        ['Urgent'],
        ['Important'],
        ['Low Priority'],
        ['Bug'],
        ['Feature'],
        ['Documentation'],
        [''],  // Extra rows for user
        [''],
        ['']
      ]).setBackground('#EEF1ED');  // Soft moss tint
      
      // ==== TEAM MEMBERS SECTION ====  
      settingsSheet.getRange('A14').setValue('👥 Team Members')
        .setFontWeight('bold')
        .setFontSize(12)
        .setBackground('#B8A394')  // Natural taupe
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      settingsSheet.getRange('B14').setValue('Name')
        .setFontWeight('bold')
        .setBackground('#B8A394')  // Natural taupe
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      // Team data area
      settingsSheet.getRange('B15:B23').setValues([
        ['Your Name'],
        ['Team Member 1'],
        ['Team Member 2'],
        ['Team Member 3'],
        ['Team Member 4'],
        ['Team Member 5'],
        ['Team Member 6'],
        ['Team Member 7'],
        ['Team Member 8']
      ]).setBackground('#F0EBE6');  // Soft warm beige
      
      // ==== PILLARS/DEPARTMENTS SECTION ====
      // Clear columns D and E in the Team/Pillar section to avoid duplicates
      settingsSheet.getRange('D15:E23').clearContent();
      
      settingsSheet.getRange('D14').setValue('🏛️ Pillars/Departments (Column G)')
        .setFontWeight('bold')
        .setFontSize(12)
        .setBackground('#8B9DAF')  // Soft slate blue
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      settingsSheet.getRange('G14').setValue('Pillar Name')
        .setFontWeight('bold')
        .setBackground('#8B9DAF')  // Soft slate blue
        .setFontColor('white')
        .setHorizontalAlignment('center');
      
      // Pillars data area - NOTE: This is column G (code reads from G13:G20)
      settingsSheet.getRange('G15:G23').setValues([
        ['Fulfillment'],
        ['Design'],
        ['Engineering'],
        ['Marketing'],
        ['Operations'],
        ['Sales'],
        ['Support'],
        ['Finance'],
        ['HR']
      ]).setBackground('#E5EAF0');  // Soft slate tint
      
      // ==== COLUMN WIDTHS ====
      settingsSheet.setColumnWidth(1, 150);  // A
      settingsSheet.setColumnWidth(2, 150);  // B
      settingsSheet.setColumnWidth(3, 30);   // C (spacer)
      settingsSheet.setColumnWidth(4, 200);  // D
      settingsSheet.setColumnWidth(5, 150);  // E
      settingsSheet.setColumnWidth(6, 30);   // F (spacer)
      settingsSheet.setColumnWidth(7, 150);  // G
      settingsSheet.setColumnWidth(8, 50);   // H (hidden spacer)
      settingsSheet.setColumnWidth(9, 50);   // I (keep narrow, not used visually)
      
      // ==== INSTRUCTIONS ====
      settingsSheet.getRange('A25').setValue('ℹ️ Instructions:')
        .setFontWeight('bold')
        .setFontSize(11)
        .setFontColor('#007AFF');
      
      settingsSheet.getRange('A26').setValue(
        '• Edit the values above to customize your task management system\n' +
        '• Stage Names (Column B): These become your main task sheets\n' +
        '• Labels (Column E): Categories for tasks (Urgent, Bug, etc.)\n' +
        '• Team Members (Column B): People who can be assigned tasks\n' +
        '• Pillars (Column G): Departments or project areas\n' +
        '• Add more rows as needed by typing below existing entries'
      ).setFontSize(10)
        .setFontColor('#86868B')
        .setWrap(true);
      
      settingsSheet.setRowHeight(26, 120);
      
      // ==== BORDERS ====
      settingsSheet.getRange('A3:B12').setBorder(true, true, true, true, true, true, '#E5E5E7', SpreadsheetApp.BorderStyle.SOLID);
      settingsSheet.getRange('D3:E12').setBorder(true, true, true, true, true, true, '#E5E5E7', SpreadsheetApp.BorderStyle.SOLID);
      settingsSheet.getRange('A14:B23').setBorder(true, true, true, true, true, true, '#E5E5E7', SpreadsheetApp.BorderStyle.SOLID);
      settingsSheet.getRange('D14:G23').setBorder(true, true, true, true, true, true, '#E5E5E7', SpreadsheetApp.BorderStyle.SOLID);
      
      // Populate the actual data columns that code reads from
      // Labels: Code reads from I3:I20 (extended range)
      settingsSheet.getRange('I3:I12').setValues([
        ['Urgent'],
        ['Important'],
        ['Low Priority'],
        ['Bug'],
        ['Feature'],
        ['Documentation'],
        [''],
        [''],
        [''],
        ['']
      ]);
      
      // Team: Code reads from E13:E23
      settingsSheet.getRange('E13:E23').setValues([
        [''],  // E13 blank (code starts E13:E20)
        [''],
        ['Your Name'],
        ['Team Member 1'],
        ['Team Member 2'],
        ['Team Member 3'],
        ['Team Member 4'],
        ['Team Member 5'],
        ['Team Member 6'],
        ['Team Member 7'],
        ['Team Member 8']
      ]);
      
      // Pillars: Code reads from G13:G23
      settingsSheet.getRange('G13:G23').setValues([
        [''],  // G13 blank
        [''],
        ['Fulfillment'],
        ['Design'],
        ['Engineering'],
        ['Marketing'],
        ['Operations'],
        ['Sales'],
        ['Support'],
        ['Finance'],
        ['HR']
      ]);
      
      ui.alert('Success!', '✅ Beautifully formatted Settings sheet created!\n\n📝 Please customize the values to match your organization.', ui.ButtonSet.OK);
    }
  } else {
    ui.alert(
      'Configuration Helper',
      'Settings sheet already exists!\n\n' +
      'Current configuration:\n' +
      '• Stages: Found in B3:B20\n' +
      '• Labels: Found in I3:I20\n' +
      '• Pillars: Found in G13:G20\n' +
      '• Team: Found in E13:E50\n\n' +
      'Modify these ranges to customize your setup.',
      ui.ButtonSet.OK
    );
  }
}

