# Person Sheets Feature

## Overview

This feature automatically creates individual sheets for each person, showing only the tasks assigned to them. Each person gets their own view of tasks they're responsible for across all active statuses.

## How It Works

### 1. Setup

**Column F - "Who" (Assigned Person)**
- Each task sheet now includes a "Who" column in position F
- This column uses a dropdown populated from `Settings!E13:E20`
- Assign a person to each task by selecting from the dropdown

### 2. Generate Person Sheets

**Menu: Task Tools → 👤 Update Person Sheets**

This function:
- Reads the list of people from `Settings!E13:E20`
- Creates/updates a sheet for each person
- Filters tasks assigned to that person from these sheets:
  - ✅ Carpark
  - ✅ Waiting
  - ✅ To Do
  - ✅ In Progress
  - ✅ Completed
  - ❌ Archived (excluded)

### 3. Person Sheet Structure

Each person sheet includes:

**Headers (Row 1-3)**
- Title: "[Person Name]'s Tasks"
- Instruction: "This is a snapshot. To update go to the Task Tools menu. You can change Status to move tasks."

**Task Table (Row 4+)**
Columns: Task | Description | Priority | Label | Pillar | Who | Due Date | Status | Date Completed | Last Updated | Created Date

**Features:**
- ✅ Sorted by priority (lowest number = highest priority)
- ✅ Banded rows for easy reading
- ✅ Status column is EDITABLE - you can move tasks to different statuses
- ✅ Empty state message if no tasks assigned

### 4. Moving Tasks from Person Sheets

**You can use the Status dropdown on person sheets just like the main sheets!**

When you change a task's status on a person sheet:
1. ✅ Task moves to the target sheet (e.g., "To Do" → "In Progress")
2. ✅ Row is deleted from person sheet
3. ✅ Date Completed and Last Updated are updated
4. ✅ Target sheet is sorted
5. ✅ Kanban board is rebuilt
6. 💡 Reminder toast: "Remember to update person sheets via Task Tools menu"

**Important:** After moving tasks, run **Task Tools → 👤 Update Person Sheets** to refresh all person views.

## Workflow Examples

### Example 1: Assign and View Tasks

1. Open any task sheet (e.g., "To Do")
2. In column F, select a person from the dropdown
3. Go to **Task Tools → 👤 Update Person Sheets**
4. Navigate to the person's sheet to see their tasks

### Example 2: Person Updates Task Status

1. Person opens their personal sheet
2. Finds a task in "To Do" status
3. Changes status dropdown from "To Do" to "In Progress"
4. Task automatically moves to the "In Progress" main sheet
5. Manager/admin clicks **Task Tools → 👤 Update Person Sheets** to refresh all views

### Example 3: Daily Standup

Each person can:
1. Open their personal sheet
2. See all tasks assigned to them across all stages
3. Update status as work progresses
4. Team lead refreshes person sheets once daily to ensure sync

## Settings Configuration

**Location:** Settings sheet, `E13:E20`

```
E13: John Smith
E14: Jane Doe
E15: Bob Wilson
E16: 
E17: 
E18: 
E19: 
E20: 
```

- Add/remove names as needed
- Person sheets will auto-generate based on non-empty cells
- Names are case and space sensitive - ensure consistency

## Technical Details

### Column Mapping Update

The `COLUMNS` constant now includes:
```javascript
WHO: 6  // Column F - Assigned person
```

All subsequent columns shifted right:
- Due Date: G (was F)
- Status: H (was G)
- Date Completed: I (was H)
- Last Updated: J (was I)
- Created Date: K (was J)

### New Functions

**`updatePersonSheets()`**
- Main function to generate/update person sheets
- Reads people from Settings!E13:E20
- Filters tasks by WHO column
- Creates formatted sheets with headers and banding

**`onEdit()` - Enhanced**
- Now detects edits on person sheets
- Dynamically gets person list from Settings
- Handles status changes on person sheets
- Provides reminder toast for refresh

### Add Task Sidebar

The task creation form now includes:
- **"Assigned To" dropdown** - populated from Settings!E13:E20
- Auto-includes WHO value when creating new tasks

## Best Practices

### ✅ Do's

1. **Regularly Update Person Sheets**
   - Run after bulk status changes
   - Run at start of day for fresh view
   - Consider scheduling updates

2. **Consistent Naming**
   - Use exact same spelling in Settings
   - Watch for extra spaces
   - Use full names or agreed abbreviations

3. **Clear Assignments**
   - Assign one person per task
   - Use "Unassigned" or leave blank if not yet assigned

### ❌ Don'ts

1. **Don't Edit Data on Person Sheets Directly**
   - Except for Status column
   - Changes won't sync to main sheets
   - Use main sheets or Task Tools menu

2. **Don't Delete Person Sheets Manually**
   - They'll be regenerated on next update
   - To remove, delete the name from Settings!E13:E20

3. **Don't Forget to Refresh**
   - Person sheets are snapshots
   - Must run "Update Person Sheets" to sync

## Troubleshooting

### Person Sheet Not Appearing

**Check:**
- Is the name in Settings!E13:E20?
- Are there any tasks assigned to this person?
- Did you run "Update Person Sheets" after adding the name?

### Tasks Not Showing on Person Sheet

**Check:**
- Is the task in Carpark, Waiting, To Do, In Progress, or Completed? (Archived excluded)
- Does the WHO column exactly match the name in Settings?
- Did you refresh person sheets after assignment?

### Status Change Not Working

**Check:**
- Are you editing Column H (Status)?
- Is the new status a valid sheet name?
- Check Apps Script execution log for errors

## Future Enhancements (Not Yet Implemented)

Potential improvements:
- Auto-refresh person sheets on timer
- Email notifications when tasks assigned
- Person-specific metrics/dashboards
- Filter by date range
- Include/exclude Completed tasks option

## Support

For issues or questions:
1. Check Apps Script Logger (Extensions → Apps Script → Executions)
2. Verify Settings!E13:E20 has correct names
3. Ensure all main task sheets exist
4. Review error messages in alert dialogs

