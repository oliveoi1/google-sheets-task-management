# 🚀 Complete Setup Guide

## Quick Start (5 Minutes)

### Option 1: Automated Setup Wizard (Recommended)

1. **Install the scripts** in your Google Sheet (Extensions → Apps Script)
2. **Copy all `.gs` and `.html` files**
3. **Save and close** the script editor
4. **Refresh your Google Sheet**
5. **Go to**: Task Tools → ⚙️ Configuration → **🎯 Complete Setup Wizard**
6. **Follow the prompts** - The wizard will:
   - Create your Settings sheet
   - Install all required triggers
   - Set up task stage sheets
   - Configure everything automatically

✅ **Done!** Your system is ready to use.

---

### Option 2: Manual Setup

If you prefer to set things up manually or troubleshoot issues:

## Step 1: Install Scripts

### Files You Need:
1. **Code.gs** - Main task management logic
2. **Config.gs** - Configuration management system
3. **Features.gs** - Search, analytics, notifications
4. **TriggerSetup.gs** - Trigger management (NEW!)
5. **Sidebar.gs** - Add task sidebar
6. **TaskSidebar.html** - Task creation interface
7. **SearchDialog.html** - Search interface

### Installation:
1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete the default `Code.gs` content
4. Create files with exact names above
5. Paste corresponding code into each file
6. **File → Save all** (or Ctrl/Cmd + S)

## Step 2: Required Triggers

Triggers enable automation. **You must set these up!**

### Method A: Automatic (Easiest)
1. Refresh your Google Sheet
2. Go to **Task Tools → ⚙️ Configuration → ⚡ Setup All Triggers**
3. Click through authorization prompts
4. ✅ Done!

### Method B: Manual Setup

If automatic setup fails, install triggers manually:

#### 1. onOpen Trigger
**Purpose**: Loads the Task Tools menu when spreadsheet opens

**Setup**:
1. Apps Script Editor → Triggers (clock icon on left)
2. Click **+ Add Trigger**
3. Choose function: `onOpen`
4. Event source: **From spreadsheet**
5. Event type: **On open**
6. **Save**

#### 2. onEdit Trigger  
**Purpose**: Enables interactive editing on person/fulfillment sheets

**Setup**:
1. Triggers → **+ Add Trigger**
2. Choose function: `onEdit`
3. Event source: **From spreadsheet**
4. Event type: **On edit**
5. **Save**

#### 3. Daily Notification Trigger (Optional)
**Purpose**: Sends daily email reminders for due dates

**Setup**:
1. Triggers → **+ Add Trigger**
2. Choose function: `sendDueDateNotifications`
3. Event source: **Time-driven**
4. Type: **Day timer**
5. Time: **8am to 9am** (or your preferred time)
6. **Save**

### Verify Triggers

Run: **Task Tools → ⚙️ Configuration → 👁️ View Current Triggers**

Should show:
- ✅ onOpen
- ✅ onEdit  
- ✅ sendDueDateNotifications (if notifications enabled)

## Step 3: Settings Sheet

### Method A: Automatic
Run: **Task Tools → ⚙️ Configuration → 📋 Settings Sheet Helper**

### Method B: Manual Creation

Create a sheet named **"Settings"** with this structure:

#### Row 1: Title
| A | B | C | D |
|---|---|---|---|
| Task Management Configuration | | | |

#### Rows 3-8: Stage Names (Column B)
| A | B |
|---|---|
| Stage Names: | Carpark |
| | Waiting |
| | To Do |
| | In Progress |
| | Completed |
| | Archived |

#### Rows 3-8: Labels (Column I)
| H | I |
|---|---|
| Labels: | Urgent |
| | Important |
| | Bug |
| | Feature |
| | Low Priority |
| | Documentation |

#### Rows 13-20: Pillars (Column G)
| F | G |
|---|---|
| Pillars/Departments: | Fulfillment |
| | Design |
| | Engineering |
| | Marketing |
| | Operations |

#### Rows 13-20: Team Members (Column E)
| D | E |
|---|---|
| Team Members: | Allan |
| | Janine |
| | John Doe |
| | Jane Smith |

**Customize** all values to match your organization!

## Step 4: Create Task Sheets

### Method A: Automatic
The setup wizard will ask if you want to create these automatically.

### Method B: Manual Creation

Create sheets with these **exact names** (matching your Settings!B3:B8):
- Carpark
- Waiting
- To Do
- In Progress
- Completed
- Archived

#### Sheet Structure (for each):

**Row 1**: Sheet title (e.g., "To Do Tasks")
**Row 2**: Instructions
**Row 4**: Headers

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Task | Description | Priority | Label | Pillar | Who | Due Date | Status | Date Completed | Last Updated | Created Date |

**Row 5+**: Data starts here

## Step 5: Test Everything

Run: **Task Tools → ⚙️ Configuration → 🧪 Test Triggers**

Should show all green checkmarks ✅

## Step 6: First Tasks

### Add Your First Task:
1. **Task Tools → ➕ Add New Task**
2. Fill out the form
3. Click Submit
4. ✅ Task appears on the selected stage sheet!

### Generate Person Sheets:
1. **Task Tools → 👤 Update Person Sheets**
2. A sheet is created for each person in Settings!E13:E20
3. ✅ Each person can now see their tasks!

### Build Kanban Board:
1. **Task Tools → ↻ Rebuild Kanban Board**
2. ✅ Visual overview created!

## Troubleshooting

### "Script authorization required"
1. Run any function
2. Click **Review Permissions**
3. Choose your Google account
4. Click **Advanced → Go to [project name] (unsafe)**
5. Click **Allow**

### "Triggers not working"
1. Check: **Apps Script → Triggers**
2. Verify `onOpen` and `onEdit` exist
3. If missing: **Task Tools → ⚙️ Configuration → ⚡ Setup All Triggers**

### "Menu not appearing"
1. **Close and reopen** the spreadsheet
2. If still missing, run `onOpen` manually from Apps Script
3. Check triggers are installed

### "Person sheets not updating"
- Person sheets are snapshots
- Run: **Task Tools → 👤 Update Person Sheets** to refresh

### "Dropdowns not working"
1. Check Settings sheet exists and has data
2. Run: **Task Tools → ⚙️ Configuration → 🔧 Fix Status Values**
3. Clear cache: **Task Tools → ⚙️ Configuration → 🗑️ Clear Config Cache**

### "Slow performance"
1. Clear config cache
2. Archive old completed tasks
3. Reduce person sheet size (archive completed tasks)

## Authorization Scopes

The script requires these permissions:

- **View and manage spreadsheets** - To read/write task data
- **Display as web app** - To show sidebars and dialogs
- **Send email** (optional) - For notifications only
- **Manage triggers** - To set up automation

These are safe and standard for Google Sheets add-ons.

## Verification Checklist

Before starting to use the system, verify:

- [ ] All `.gs` and `.html` files uploaded to Apps Script
- [ ] `onOpen` trigger exists (check Triggers page)
- [ ] `onEdit` trigger exists (check Triggers page)
- [ ] Settings sheet exists with your data
- [ ] Task stage sheets created (matching Settings!B3:B8)
- [ ] Task Tools menu appears when sheet opens
- [ ] Can add a test task via sidebar
- [ ] Person sheets generate correctly
- [ ] Kanban board builds correctly

## Next Steps

Once setup is complete:

1. **Customize Settings** - Add your real team members and stages
2. **Import Tasks** - Add existing tasks manually or via copy/paste
3. **Share with Team** - Give edit access to team members
4. **Train Users** - Show them how to use person sheets
5. **Enable Notifications** - Set up email reminders
6. **Generate Analytics** - Review progress weekly

## Need Help?

- **Built-in Help**: Task Tools → ℹ️ About & Features
- **Person Sheet Help**: Task Tools → ℹ️ Person Sheet Help
- **GitHub Issues**: https://github.com/oliveoi1/google-sheets-task-management/issues
- **Test Functions**: Task Tools → ⚙️ Configuration → 🧪 Test Triggers

---

**Setup Time**: 5-10 minutes for automated, 15-20 minutes for manual

**Recommended**: Use the automated wizard - it handles everything!

