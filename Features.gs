// ====================================
// ADDITIONAL FEATURES
// ====================================
// Search, Email Notifications, Analytics

// ========== SEARCH FUNCTIONALITY ==========

/**
 * Show search dialog to find tasks across all sheets
 */
function showSearchDialog() {
  const html = HtmlService.createHtmlOutputFromFile('SearchDialog')
    .setWidth(500)
    .setHeight(600)
    .setTitle('Search Tasks');
  SpreadsheetApp.getUi().showModalDialog(html, 'Search Tasks');
}

/**
 * Search for tasks matching the query
 * @param {string} query - Search term
 * @param {object} filters - Optional filters (status, person, pillar, label)
 * @returns {array} Array of matching tasks with their location
 */
function searchTasks(query, filters = {}) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = getConfig();
    const taskSheets = getTaskSheets();
    const results = [];
    
    const queryLower = (query || '').toLowerCase();
    
    taskSheets.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      if (lastRow < config.dataStartRow) return;
      
      const data = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 11).getValues();
      
      data.forEach((row, index) => {
        const task = row[config.columns.TASK - 1];
        const description = row[config.columns.DESCRIPTION - 1];
        const priority = row[config.columns.PRIORITY - 1];
        const label = row[config.columns.LABEL - 1];
        const pillar = row[config.columns.PILLAR - 1];
        const who = row[config.columns.WHO - 1];
        const status = row[config.columns.STATUS - 1];
        
        // Skip empty rows
        if (!task) return;
        
        // Text search in task and description
        const matchesQuery = !query || 
          task.toString().toLowerCase().includes(queryLower) ||
          (description && description.toString().toLowerCase().includes(queryLower));
        
        // Apply filters
        const matchesStatus = !filters.status || status === filters.status;
        const matchesPerson = !filters.person || who === filters.person;
        const matchesPillar = !filters.pillar || pillar === filters.pillar;
        const matchesLabel = !filters.label || (label && label.toString().toLowerCase().includes(filters.label.toLowerCase()));
        
        if (matchesQuery && matchesStatus && matchesPerson && matchesPillar && matchesLabel) {
          results.push({
            task: task,
            description: description,
            priority: priority,
            label: label,
            pillar: pillar,
            who: who,
            status: status,
            sheet: sheetName,
            row: config.dataStartRow + index,
            link: `#gid=${sheet.getSheetId()}&range=A${config.dataStartRow + index}`
          });
        }
      });
    });
    
    return results;
  } catch (error) {
    Logger.log('searchTasks error: ' + error);
    throw error;
  }
}

// ========== EMAIL NOTIFICATIONS ========== 
// EMAIL NOTIFICATIONS DISABLED BY USER REQUEST
/*
/**
 * Check for upcoming and overdue tasks and send email notifications
 * Should be set up as a time-driven trigger (daily)
 */
/*
function sendDueDateNotifications() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = getConfig();
    
    if (!config.features.emailNotifications) {
      Logger.log('Email notifications are disabled');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);
    
    const taskSheets = getTaskSheets();
    const notificationsByPerson = {};
    
    // Collect tasks that need notifications
    taskSheets.forEach(sheetName => {
      // Skip completed and archived
      if (sheetName === config.stages.COMPLETED || sheetName === config.stages.ARCHIVED) return;
      
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;
      
      const lastRow = sheet.getLastRow();
      if (lastRow < config.dataStartRow) return;
      
      const data = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 11).getValues();
      
      data.forEach(row => {
        const task = row[config.columns.TASK - 1];
        const who = row[config.columns.WHO - 1];
        const dueDateStr = row[config.columns.DUE_DATE - 1];
        const status = row[config.columns.STATUS - 1];
        
        if (!task || !who || !dueDateStr) return;
        
        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        
        // Determine notification type
        let notificationType = null;
        if (dueDate < today) {
          notificationType = 'overdue';
        } else if (dueDate.getTime() === today.getTime()) {
          notificationType = 'due_today';
        } else if (dueDate.getTime() === tomorrow.getTime()) {
          notificationType = 'due_tomorrow';
        } else if (dueDate <= threeDays) {
          notificationType = 'due_soon';
        }
        
        if (notificationType) {
          if (!notificationsByPerson[who]) {
            notificationsByPerson[who] = {
              overdue: [],
              due_today: [],
              due_tomorrow: [],
              due_soon: []
            };
          }
          
          notificationsByPerson[who][notificationType].push({
            task: task,
            dueDate: Utilities.formatDate(dueDate, ss.getSpreadsheetTimeZone(), config.dateFormat),
            status: status
          });
        }
      });
    });
    
    // Send emails
    Object.keys(notificationsByPerson).forEach(person => {
      const notifications = notificationsByPerson[person];
      const hasNotifications = notifications.overdue.length > 0 || 
                               notifications.due_today.length > 0 || 
                               notifications.due_tomorrow.length > 0 || 
                               notifications.due_soon.length > 0;
      
      if (hasNotifications) {
        sendNotificationEmail(person, notifications, ss);
      }
    });
    
    Logger.log(`Sent notifications to ${Object.keys(notificationsByPerson).length} people`);
    
  } catch (error) {
    Logger.log('sendDueDateNotifications error: ' + error);
  }
}

/**
 * Send notification email to a person
 */
function sendNotificationEmail(person, notifications, spreadsheet) {
  // Note: This requires the person's email. You'd need to add email mapping in Settings
  // For now, we'll log it. Users can extend this with their email lookup logic
  
  const emailBody = buildNotificationEmailBody(person, notifications, spreadsheet);
  
  // TO-DO: Get person's email from Settings
  // For now, just log
  Logger.log(`Notification for ${person}:\n${emailBody}`);
  
  // Uncomment and modify when email mapping is available:
  // const email = getPersonEmail(person);
  // if (email) {
  //   MailApp.sendEmail({
  //     to: email,
  //     subject: `Task Due Date Reminders - ${spreadsheet.getName()}`,
  //     body: emailBody
  //   });
  // }
}

/**
 * Build notification email body
 */
function buildNotificationEmailBody(person, notifications, spreadsheet) {
  let body = `Hi ${person},\n\n`;
  body += `Here are your task reminders from "${spreadsheet.getName()}":\n\n`;
  
  if (notifications.overdue.length > 0) {
    body += `⚠️ OVERDUE TASKS (${notifications.overdue.length}):\n`;
    notifications.overdue.forEach(task => {
      body += `  • ${task.task} (Due: ${task.dueDate}) [${task.status}]\n`;
    });
    body += '\n';
  }
  
  if (notifications.due_today.length > 0) {
    body += `🔴 DUE TODAY (${notifications.due_today.length}):\n`;
    notifications.due_today.forEach(task => {
      body += `  • ${task.task} [${task.status}]\n`;
    });
    body += '\n';
  }
  
  if (notifications.due_tomorrow.length > 0) {
    body += `🟡 DUE TOMORROW (${notifications.due_tomorrow.length}):\n`;
    notifications.due_tomorrow.forEach(task => {
      body += `  • ${task.task} [${task.status}]\n`;
    });
    body += '\n';
  }
  
  if (notifications.due_soon.length > 0) {
    body += `🟢 DUE IN 3 DAYS (${notifications.due_soon.length}):\n`;
    notifications.due_soon.forEach(task => {
      body += `  • ${task.task} (Due: ${task.dueDate}) [${task.status}]\n`;
    });
    body += '\n';
  }
  
  body += `\nView spreadsheet: ${spreadsheet.getUrl()}\n\n`;
  body += `This is an automated reminder. Please don't reply to this email.`;
  
  return body;
}
*/
// END EMAIL NOTIFICATIONS

// ========== ANALYTICS & REPORTING ==========

/**
 * Generate analytics dashboard
 * Creates or updates an Analytics sheet with key metrics
 */
function generateAnalytics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = getConfig();
    
    if (!config.features.analytics) {
      SpreadsheetApp.getUi().alert('Analytics feature is disabled in configuration.');
      return;
    }
    
    // Get or create Analytics sheet
    let analyticsSheet = ss.getSheetByName('Analytics');
    if (!analyticsSheet) {
      analyticsSheet = ss.insertSheet('Analytics');
    } else {
      analyticsSheet.clear();
    }
    
    // Title
    analyticsSheet.getRange('A1').setValue('📊 Task Management Analytics')
      .setFontWeight('bold').setFontSize(14);
    analyticsSheet.getRange('A2').setValue(`Generated: ${new Date().toLocaleString()}`)
      .setFontSize(10).setFontStyle('italic');
    
    // Collect metrics
    const metrics = collectAnalyticsMetrics(config);
    
    // Display metrics
    let row = 4;
    
    // Overall summary
    analyticsSheet.getRange(`A${row}`).setValue('📈 Overall Summary').setFontWeight('bold').setFontSize(12);
    row += 2;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Total Tasks:', metrics.totalTasks]]);
    row++;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Completed Tasks:', metrics.completedTasks]]);
    row++;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Completion Rate:', `${metrics.completionRate}%`]]);
    row++;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Overdue Tasks:', metrics.overdueTasks]]);
    row += 2;
    
    // Tasks by stage
    analyticsSheet.getRange(`A${row}`).setValue('📊 Tasks by Stage').setFontWeight('bold').setFontSize(12);
    row += 2;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Stage', 'Count']]).setFontWeight('bold');
    row++;
    
    Object.keys(metrics.byStage).forEach(stage => {
      analyticsSheet.getRange(`A${row}:B${row}`).setValues([[stage, metrics.byStage[stage]]]);
      row++;
    });
    row += 2;
    
    // Tasks by person
    analyticsSheet.getRange(`A${row}`).setValue('👥 Tasks by Person').setFontWeight('bold').setFontSize(12);
    row += 2;
    analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Person', 'Active Tasks']]).setFontWeight('bold');
    row++;
    
    Object.keys(metrics.byPerson).forEach(person => {
      analyticsSheet.getRange(`A${row}:B${row}`).setValues([[person, metrics.byPerson[person]]]);
      row++;
    });
    row += 2;
    
    // Tasks by pillar
    if (Object.keys(metrics.byPillar).length > 0) {
      analyticsSheet.getRange(`A${row}`).setValue('🏛️ Tasks by Pillar').setFontWeight('bold').setFontSize(12);
      row += 2;
      analyticsSheet.getRange(`A${row}:B${row}`).setValues([['Pillar', 'Count']]).setFontWeight('bold');
      row++;
      
      Object.keys(metrics.byPillar).forEach(pillar => {
        analyticsSheet.getRange(`A${row}:B${row}`).setValues([[pillar, metrics.byPillar[pillar]]]);
        row++;
      });
    }
    
    // Auto-resize columns
    analyticsSheet.autoResizeColumns(1, 2);
    
    SpreadsheetApp.getActive().toast('✅ Analytics generated successfully!');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error generating analytics: ' + error.message);
    Logger.log('generateAnalytics error: ' + error);
  }
}

/**
 * Collect analytics metrics from all task sheets
 */
function collectAnalyticsMetrics(config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const taskSheets = getTaskSheets();
  
  const metrics = {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    overdueTasks: 0,
    byStage: {},
    byPerson: {},
    byPillar: {}
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  taskSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    
    const lastRow = sheet.getLastRow();
    if (lastRow < config.dataStartRow) return;
    
    const data = sheet.getRange(config.dataStartRow, 1, lastRow - config.dataStartRow + 1, 11).getValues();
    
    data.forEach(row => {
      const task = row[config.columns.TASK - 1];
      if (!task) return;
      
      metrics.totalTasks++;
      
      const status = row[config.columns.STATUS - 1];
      const who = row[config.columns.WHO - 1];
      const pillar = row[config.columns.PILLAR - 1];
      const dueDateStr = row[config.columns.DUE_DATE - 1];
      
      // Count by stage
      metrics.byStage[status] = (metrics.byStage[status] || 0) + 1;
      
      // Count completed
      if (status === config.stages.COMPLETED) {
        metrics.completedTasks++;
      }
      
      // Count by person (exclude completed/archived)
      if (who && status !== config.stages.COMPLETED && status !== config.stages.ARCHIVED) {
        metrics.byPerson[who] = (metrics.byPerson[who] || 0) + 1;
      }
      
      // Count by pillar
      if (pillar) {
        metrics.byPillar[pillar] = (metrics.byPillar[pillar] || 0) + 1;
      }
      
      // Count overdue
      if (dueDateStr && status !== config.stages.COMPLETED) {
        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          metrics.overdueTasks++;
        }
      }
    });
  });
  
  // Calculate completion rate
  if (metrics.totalTasks > 0) {
    metrics.completionRate = Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
  }
  
  return metrics;
}

/*
/**
 * Install time-driven trigger for daily email notifications
 * Run this once to set up automatic notifications
 */
/*
function installDailyNotificationTrigger() {
  // Delete existing triggers for this function
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
  
  SpreadsheetApp.getUi().alert('Daily notification trigger installed! Notifications will be sent at 8 AM daily.');
}
*/

