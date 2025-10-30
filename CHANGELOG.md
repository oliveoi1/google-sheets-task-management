# Changelog

## October 29, 2025 - Code Improvements

### Backup Created
- All original files backed up to `backup_originals_20251029/`
- Created: Code.gs, Sidebar.gs, TaskSidebar.html

### Bug Fixes

#### TaskSidebar.html
- **Fixed:** Form reset bug - replaced non-existent `taskForm` reference
- **Added:** Proper field-by-field reset after submission
- **Added:** Success and failure handlers with user feedback alerts
- **Improved:** Better user experience with clear status messages

#### Code.gs
- **Fixed:** Inconsistent sorting behavior with non-numeric priorities
- **Fixed:** Potential errors when sheets have no data rows
- **Fixed:** Hard-to-maintain magic numbers scattered throughout code

#### Sidebar.gs  
- **Removed:** Duplicate `sortByPriority()` function
- **Updated:** Now references consolidated function from Code.gs

### New Features

#### Constants Section (Code.gs)
Added comprehensive constants at the top of the file:

```javascript
SHEET_NAMES = {
  CARPARK, WAITING, TODO, IN_PROGRESS,
  COMPLETED, ARCHIVED, KANBAN, SETTINGS, FULFILLMENT
}

COLUMNS = {
  TASK, DESCRIPTION, PRIORITY, LABEL, PILLAR,
  DUE_DATE, STATUS, DATE_COMPLETED, LAST_UPDATED, CREATED_DATE
}

TASK_SHEETS = [array of valid task sheet names]
DATA_START_ROW = 5
DATE_FORMAT = "dd/MM/yyyy"
CARD_HEIGHT = 60
```

#### Error Handling
Added try-catch blocks and null checks to:
- `updateFullfillmentSheet()`
- `resortAllTaskTabs()`
- `rebuildKanbanBoard()`
- `getDropdownOptions()`
- `addTask()`

All functions now:
- Check for missing sheets before operating
- Log errors to Apps Script Logger
- Display user-friendly error dialogs
- Gracefully handle missing optional sheets

### Code Quality Improvements

1. **Maintainability**
   - All hard-coded values replaced with named constants
   - Sheet names now referenced from central SHEET_NAMES object
   - Column indices now use descriptive names (COLUMNS.TASK vs 1)

2. **Robustness**
   - Better handling of edge cases (empty sheets, missing data)
   - More defensive range calculations
   - Improved logging for debugging

3. **User Experience**
   - Toast notifications now show actual counts
   - Error messages are more informative
   - Failed operations don't silently fail

### Testing Recommendations

After deploying these changes, test:
1. Adding a task via sidebar (verify form reset works)
2. Resort all tasks (verify error handling for missing sheets)
3. Rebuild Kanban board (verify graceful handling of missing task sheets)
4. Move a task between sheets (verify constants work correctly)
5. Add task with non-numeric priority (verify sorting still works)

### Migration Notes

No breaking changes - all improvements are backward compatible.
Simply copy the updated files to your Google Apps Script project.

### Files Modified
- Code.gs (147 changes, major refactoring)
- Sidebar.gs (31 changes)
- TaskSidebar.html (12 changes)
- README.md (updated documentation)

