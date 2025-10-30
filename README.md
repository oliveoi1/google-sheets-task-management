# Google Task Sheet - Apps Script

This folder contains the Google Apps Script code for managing tasks in a Google Sheets-based Kanban board system.

## File Structure

- **Code.gs** - Main Apps Script file containing all task management functions
- **Sidebar.gs** - Sidebar UI functions for adding new tasks
- **TaskSidebar.html** - HTML form interface for task creation
- **PERSON_SHEETS_FEATURE.md** - Documentation for the person sheets feature
- **CHANGELOG.md** - History of all changes and improvements

## Overview

This script provides a comprehensive task management system with:
- **Kanban Board View** - Visual overview of tasks across different status columns
- **Fulfillment View** - Filtered view of tasks in the "Fulfillment" pillar
- **Automated Task Movement** - Auto-moves tasks between sheets when status changes
- **Auto-sorting** - Keeps tasks organized by priority or completion date
- **Auto-timestamping** - Automatically tracks creation, completion, and update dates

## Required Sheet Structure

The Google Spreadsheet should have the following sheets:
1. **Settings** - Configuration data
2. **Carpark** - Tasks parked for later
3. **Waiting** - Tasks waiting on dependencies
4. **To Do** - Tasks ready to be worked on
5. **In Progress** - Tasks currently being worked on
6. **Completed** - Finished tasks
7. **Archived** - Archived tasks
8. **Kanban Board** - Visual kanban view (auto-generated)
9. **Fulfillment** - Filtered view (auto-generated)

### Settings Sheet Structure
- `B3:B8` = Status names (Carpark, Waiting, To Do, In Progress, Completed)
- `C3:C8` = Completed task count
- `D3:D8` = Total task count
- `E3:E8` = Total task ceiling
- `E13:E20` = **Person names** (for WHO assignment and person sheets)
- `G13:G20` = Pillar names for categorization
- `I3:I8` = Label options

### Task Sheet Columns
All task sheets (Carpark through Archived) should have:
- **Column A** - Task title
- **Column B** - Description
- **Column C** - Priority (numeric, lower = higher priority)
- **Column D** - Label
- **Column E** - Pillar (e.g., "Fulfillment")
- **Column F** - Who (assigned person, from Settings!E13:E20)
- **Column G** - Due Date
- **Column H** - Status (dropdown with sheet names)
- **Column I** - Date Completed
- **Column J** - Last Updated
- **Column K** - Created Date

Task data starts at row 5 (rows 1-4 are headers/formatting).

## Features

### Custom Menu ("Task Tools")
The script adds a custom menu with the following options:
- ➕ **Add New Task** - Opens sidebar for adding tasks
- ↻ **Rebuild Kanban Board** - Refreshes the visual Kanban board
- 📦 **Update Fulfillment View** - Updates the Fulfillment filtered view
- 👤 **Update Person Sheets** - Creates/updates individual sheets for each assigned person
- ↕ **Resort Tasks** - Re-sorts all task sheets

### Auto-Triggers
- **onOpen()** - Runs when spreadsheet opens, creates custom menu
- **onEdit(e)** - Runs on any cell edit, handles status changes and auto-fills dates

### Key Functions

#### `updateFullfillmentSheet()`
- Aggregates all tasks where Pillar = "Fulfillment"
- Creates/updates a dedicated "Fulfillment" sheet
- Protects the Status column from editing

#### `updatePersonSheets()` 🆕
- Reads person names from Settings!E13:E20
- Creates/updates a sheet for each person
- Shows tasks assigned to that person (from Carpark, Waiting, To Do, In Progress, Completed)
- Excludes Archived tasks
- Status column is editable for moving tasks
- Auto-sorts by priority

#### `resortAllTaskTabs()`
- Sorts Carpark, Waiting, To Do, In Progress by priority (Column C)
- Sorts Completed and Archived by completion date (Column H, newest first)

#### `onEdit(e)` - Enhanced 🆕
- Auto-fills Created Date when a new task is added (main sheets only)
- **Now supports both main task sheets AND person sheets**
- When Status (Column H) changes:
  - Moves task to corresponding sheet
  - Updates "Date Completed" if moved to Completed
  - Updates "Last Updated" timestamp
  - Sorts target sheet (and source if main sheet)
  - Rebuilds Kanban board
  - Shows reminder to update person sheets if moved from person sheet

#### `rebuildKanbanBoard()`
- Creates visual Kanban board with:
  - Sparkline progress bars for each status
  - Task count ratios (completed/total)
  - Clickable task cards linking to source sheets
  - Color-coded cards (special highlighting for "urgent" labels)
  - Task descriptions as cell comments

## Color Scheme

- **Carpark**: Red tones (#fde2dd, #c45f5f)
- **Waiting**: Orange/tan (#fbe8c6, #9b5e1f)
- **To Do**: Blue (#dce9f8, #1d3973)
- **In Progress**: Yellow (#fff5cc, #a17700)
- **Completed**: Green (#dff2db, #395c29)

Urgent tasks get darker variants of their status colors.

## Installation

1. Open your Google Sheet
2. Go to **Extensions** > **Apps Script**
3. Create/update the following files:
   - **Code.gs** - Copy contents from `Code.gs` in this folder
   - **Sidebar.gs** - Copy contents from `Sidebar.gs` in this folder  
   - **TaskSidebar.html** - Copy contents from `TaskSidebar.html` in this folder
4. Save the project (Ctrl+S or Cmd+S)
5. Refresh your Google Sheet to see the "Task Tools" menu

## Sidebar.gs Functions

#### `showTaskSidebar()`
- Opens an HTML sidebar for adding new tasks
- Loads `TaskSidebar.html` file (separate HTML file required)

#### `getDropdownOptions()` - Enhanced 🆕
- Fetches dropdown options from Settings sheet:
  - Statuses from `B3:B8`
  - Labels from `I3:I8`
  - Pillars from `G13:G20`
  - **People from `E13:E20`** 🆕
- Returns object with arrays for populating form dropdowns

#### `addTask(task)` - Enhanced 🆕
- Adds a new task to the appropriate status sheet
- **Now includes WHO (assigned person) in task data** 🆕
- Auto-fills timestamps (created, last updated)
- Fills "Date Completed" if status is "Completed"
- Finds first empty row or appends to end
- Sorts sheet after insertion

#### `sortByPriority(sheet)`
- Sorts tasks by priority (Column C) in ascending order
- Handles non-numeric priorities by placing them at the end
- More robust than the `sortSheetByPriority` in Code.gs

## TaskSidebar.html

The HTML sidebar form provides a user-friendly interface for adding tasks with:

### Form Fields:
- **Task Title** (text input, required)
- **Task Description** (textarea, optional)
- **Task Priority** (number input, min 1, required)
- **Task Label** (dropdown, populated from Settings)
- **Task Pillar** (dropdown, populated from Settings)
- **Assigned To** (dropdown, populated from Settings!E13:E20) 🆕
- **Task Due Date** (date picker, optional)
- **Task Status** (dropdown, populated from Settings)

### Features:
- Clean, simple styling with Arial font
- Auto-populates dropdowns on load via `getDropdownOptions()`
- Submits task data to `addTask()` function in Sidebar.gs
- Attempts to reset form after submission (note: references non-existent "taskForm" id)

### Bug Fix Needed:
The form reset references `document.getElementById("taskForm")` but there's no element with that ID. Should be changed to reset individual fields or wrap fields in a `<form>` tag.

## Notes

- Date format used: `dd/MM/yyyy`
- Kanban cards are set to 60px height with 180px column width
- The Kanban board shows tasks up to the "completed" count from Settings sheet

## Code Review Notes

✅ **Strengths:**
- Well-structured with clear function separation
- Good use of modern JavaScript (const, arrow functions, forEach)
- Comprehensive automation of task workflows
- User-friendly with toast notifications
- Protective measures (column protection in Fulfillment sheet)

⚠️ **Potential Improvements:**
1. No error handling for missing sheets or invalid data
2. Hard-coded sheet names make it less flexible
3. `rebuildKanbanBoard()` has high complexity (could be broken into smaller functions)
4. Some magic numbers (e.g., row 5, column indices) could be constants
5. No validation for required data structures before operations
6. Duplicate sort functions: `sortByPriority` in Sidebar.gs vs `sortSheetByPriority` in Code.gs (consider consolidating)
7. TaskSidebar.html form reset bug - references non-existent "taskForm" ID

## License

This is personal project code for task management in Google Sheets.

