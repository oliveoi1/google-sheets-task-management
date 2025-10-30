# New Feature Added: Person Sheets 👤

## What's New?

You can now create individual sheets for each person showing only their assigned tasks!

## Quick Start

### 1. Add People to Settings
In your Settings sheet, add names to `E13:E20`:
```
E13: John Smith
E14: Jane Doe
E15: Bob Wilson
...
```

### 2. Assign Tasks
In any task sheet, use Column F dropdown to assign tasks to people.

### 3. Generate Person Sheets
Click: **Task Tools → 👤 Update Person Sheets**

### 4. View Personal Tasks
Each person gets their own sheet showing:
- All tasks assigned to them
- From: Carpark, Waiting, To Do, In Progress, Completed
- Sorted by priority
- Editable Status column for moving tasks

## What Changed?

### Column Layout Update ⚠️
Column F is now "Who" (assigned person), so all subsequent columns shifted:

**Old Layout:**
- F = Due Date
- G = Status  
- H = Date Completed
- I = Last Updated
- J = Created Date

**New Layout:**
- F = **Who** (NEW)
- G = Due Date
- H = Status
- I = Date Completed
- J = Last Updated
- K = Created Date

### Menu Update
New menu item: **👤 Update Person Sheets**

### Form Update
Task creation form now includes "Assigned To" dropdown

### Smart Status Changes
You can now change task status on person sheets too! It works just like the main sheets.

## Files Modified

1. **Code.gs**
   - Updated COLUMNS constant (added WHO)
   - Added `updatePersonSheets()` function
   - Enhanced `onEdit()` to support person sheets
   - Updated `updateFullfillmentSheet()` headers

2. **Sidebar.gs**
   - Added WHO to task creation
   - Added people to dropdown options

3. **TaskSidebar.html**
   - Added "Assigned To" dropdown
   - Populates from Settings!E13:E20

## Benefits

✅ **Individual Views** - Each person sees only their tasks
✅ **Less Clutter** - Focus on what matters to you  
✅ **Easy Updates** - Change status directly on your sheet
✅ **Cross-Status View** - See all your tasks regardless of stage
✅ **Auto-Sorted** - Always sorted by priority

## Next Steps

1. Copy the updated files to your Google Apps Script
2. Add person names to Settings!E13:E20
3. Start assigning tasks using Column F
4. Run "Update Person Sheets" from the menu
5. Share the good news with your team!

## Documentation

See **PERSON_SHEETS_FEATURE.md** for complete documentation including:
- Detailed workflow examples
- Troubleshooting guide
- Best practices
- Technical details

---

**Date Added:** October 29, 2025
**Requested By:** User requirement for person-specific task views

