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
 * Creates a template Settings sheet if one doesn't exist
 */
function setupConfigurationHelper() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  let settingsSheet = ss.getSheetByName('Settings');
  
  if (!settingsSheet) {
    const result = ui.alert(
      'Settings Sheet Not Found',
      'Would you like to create a template Settings sheet with default configuration?',
      ui.ButtonSet.YES_NO
    );
    
    if (result === ui.Button.YES) {
      settingsSheet = ss.insertSheet('Settings');
      
      // Create template structure
      settingsSheet.getRange('A1').setValue('Task Management Configuration').setFontWeight('bold').setFontSize(14);
      
      // Stage names
      settingsSheet.getRange('A3').setValue('Stage Names:').setFontWeight('bold');
      settingsSheet.getRange('B3:B8').setValues([
        ['Carpark'],
        ['Waiting'],
        ['To Do'],
        ['In Progress'],
        ['Completed'],
        ['Archived']
      ]);
      
      // Labels
      settingsSheet.getRange('H3').setValue('Labels:').setFontWeight('bold');
      settingsSheet.getRange('I3:I8').setValues([
        ['Urgent'],
        ['Important'],
        ['Low Priority'],
        ['Bug'],
        ['Feature'],
        ['Documentation']
      ]);
      
      // Pillars/Departments
      settingsSheet.getRange('F13').setValue('Pillars/Departments:').setFontWeight('bold');
      settingsSheet.getRange('G13:G16').setValues([
        ['Fulfillment'],
        ['Design'],
        ['Engineering'],
        ['Marketing']
      ]);
      
      // Team Members
      settingsSheet.getRange('D13').setValue('Team Members:').setFontWeight('bold');
      settingsSheet.getRange('E13:E16').setValues([
        ['Allan'],
        ['Janine'],
        ['Team Member 3'],
        ['Team Member 4']
      ]);
      
      ui.alert('Success!', 'Template Settings sheet created. Please customize it to match your organization.', ui.ButtonSet.OK);
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

