# 📊 Google Sheets Task Management System

**Version 2.0** - Production-ready, fully configurable task management system for Google Sheets

## 🌟 Overview

A comprehensive task management solution built with Google Apps Script that transforms Google Sheets into a powerful project management tool. Perfect for teams of any size, fully customizable to match your organization's terminology and workflows.

## ✨ Key Features

### 📋 **Core Task Management**
- Multi-stage workflow (Carpark → Waiting → To Do → In Progress → Completed → Archived)
- Drag-and-drop status changes
- Smart priority sorting (supports both numeric "1, 2, 3" and text-prefixed "AI-1, A2, P-5")
- Custom labels and categories
- Due date tracking with visual indicators
- Automatic timestamp management

### 👥 **Person Sheets**
- Individual sheets for each team member
- Real-time sync with main task sheets
- Add new tasks directly on person sheets
- Edit any field (Task, Priority, Label, Pillar, Status)
- Tasks automatically move when status changes
- Smart sorting: Status → Urgent → Priority

### 📦 **Fulfillment/Pillar Views**
- Filter tasks by department, pillar, or category
- Interactive editing with auto-sync
- Tasks disappear when pillar changes
- Same smart sorting as person sheets

### 🎨 **Kanban Board**
- Visual overview of all active tasks
- Color-coded by status
- Urgent tasks highlighted
- Hover to see details (description, assigned person, pillar)
- Click to navigate to source sheet

### 🔍 **Advanced Search**
- Full-text search across all tasks
- Filter by status, person, label, or pillar
- Find tasks instantly in large datasets
- Click results to navigate to task

### 📊 **Analytics & Reporting**
- Completion rate metrics
- Tasks by stage breakdown
- Workload by person
- Tasks by pillar/department
- Overdue task tracking
- Auto-generated Analytics sheet

### 📧 **Email Notifications**
- Daily reminders for due dates
- Overdue task alerts
- Due today/tomorrow notifications
- 3-day advance warnings
- Customizable notification schedule

### ⚙️ **Configuration System**
- **Fully customizable terminology** - Rename "Pillar" to "Department", "Category", etc.
- **Dynamic range detection** - No hard-coded cell ranges
- **Flexible column system** - Add your own custom fields
- **Performance caching** - Reduces API calls
- **Setup wizard** - Easy onboarding for new users

## 🚀 Getting Started

### Installation

1. **Create a new Google Sheet** or open an existing one
2. **Open Script Editor**: Extensions → Apps Script
3. **Create the following files** and paste the code:
   - `Code.gs` - Main task management logic
   - `Config.gs` - Configuration management
   - `Features.gs` - Search, analytics, notifications
   - `Sidebar.gs` - Add task sidebar
   - `TaskSidebar.html` - Task creation UI
   - `SearchDialog.html` - Search interface

4. **Save the project**: File → Save (or Ctrl/Cmd + S)
5. **Refresh your Google Sheet**: Close and reopen
6. **Run Setup**: Task Tools → ⚙️ Configuration → Setup Configuration Helper
7. **Customize Settings**: Modify the generated Settings sheet to match your needs

### Quick Setup

1. Open the **Task Tools** menu
2. Click **⚙️ Configuration → 📋 Setup Configuration Helper**
3. Customize your Settings sheet:
   - **Column B**: Stage names (e.g., Backlog, In Progress, Done)
   - **Column E**: Team member names
   - **Column G**: Pillars/departments
   - **Column I**: Labels (Urgent, Bug, Feature, etc.)
4. Create your task sheets matching the stage names
5. Click **👤 Update Person Sheets** to generate individual sheets
6. Start adding tasks!

## 📖 How to Use

### Adding Tasks

**Method 1: Sidebar**
1. Task Tools → ➕ Add New Task
2. Fill in the form
3. Click Submit

**Method 2: Direct Entry**
1. Go to any task sheet (To Do, In Progress, etc.)
2. Type in row 5 or below
3. Fill in columns A-K
4. Task is automatically tracked!

**Method 3: Person Sheets**
1. Go to your personal sheet
2. Type in any empty row
3. Select a status from dropdown
4. Task created on main sheet automatically!

### Searching Tasks

1. Task Tools → 🔍 Search Tasks
2. Enter search term
3. Optional: Use advanced filters (status, person, pillar, label)
4. Click Search
5. Click any result to view details

### Viewing Analytics

1. Task Tools → 📊 Analytics & Reports → 📈 Generate Analytics
2. View the Analytics sheet
3. See metrics:
   - Total tasks & completion rate
   - Tasks by stage
   - Workload by person
   - Tasks by pillar
   - Overdue count

### Email Notifications

**Setup** (one-time):
1. Task Tools → 📊 Analytics & Reports → 📧 Setup Email Notifications
2. Authorize the script when prompted
3. Notifications will be sent daily at 8 AM

**Test**:
- Task Tools → 📊 Analytics & Reports → ✉️ Send Test Notification

**Note**: You'll need to add email addresses to your Settings sheet for this to work. See Configuration section.

## ⚙️ Configuration

### Settings Sheet Structure

The Settings sheet controls all aspects of the system:

#### Stage Names (Column B, rows 3+)
```
Carpark
Waiting
To Do
In Progress
Completed
Archived
```
**Customize**: Use your own names (Backlog, In Review, Done, etc.)

#### Team Members (Column E, rows 13+)
```
Allan
Janine
John Doe
Jane Smith
```
**Add more**: Just add names in consecutive rows

#### Pillars/Departments (Column G, rows 13+)
```
Fulfillment
Design
Engineering
Marketing
Operations
```
**Rename**: Change "Pillar" to anything that fits your org

#### Labels (Column I, rows 3+)
```
Urgent
Important
Bug
Feature
Documentation
```
**Customize**: Add your own categories

### Column Structure

| Column | Field | Description |
|--------|-------|-------------|
| A | Task | Task title/name |
| B | Description | Detailed description |
| C | Priority | Numeric (1, 2, 3) or prefixed (AI-1, A2) |
| D | Label | Category/tag |
| E | Pillar | Department/area |
| F | Who | Assigned person |
| G | Due Date | Target completion date |
| H | Status | Current stage |
| I | Date Completed | Auto-filled when completed |
| J | Last Updated | Auto-updated on any change |
| K | Created Date | Auto-filled on creation |

### Customization

To rename "Pillar" to "Department" or another term:
1. Open `Config.gs`
2. Find the `getCustomColumnConfig` function
3. Change `displayName: 'Pillar'` to your preferred term
4. Update column headers in your task sheets

## 🎯 Best Practices

1. **Use consistent naming** - Keep stage names consistent across Settings and sheet names
2. **Regular updates** - Run "Update Person Sheets" weekly or when team changes
3. **Clean up** - Archive old completed tasks to improve performance
4. **Meaningful priorities** - Use numeric (1-10) for core work, prefixed (AI-1, A2) for grouped tasks
5. **Set due dates** - Enable email notifications for better tracking
6. **Search frequently** - Use search instead of scrolling through large sheets

## 🔧 Advanced Features

### Batch Operations

Update multiple tasks by:
1. Selecting rows in a task sheet
2. Using Find & Replace for bulk updates
3. Person sheets will sync automatically

### Custom Views

Create filtered views in any sheet:
1. Data → Create a filter
2. Save custom filter views
3. Share views with team members

### Integration Ideas

- **Calendar sync**: Export due dates to Google Calendar
- **Slack integration**: Post updates to Slack channels
- **Time tracking**: Add time estimate and actual columns
- **Dependencies**: Add "Blocked By" column for task dependencies

## 🐛 Troubleshooting

### Tasks not syncing to person sheets
- Run: Task Tools → 👤 Update Person Sheets
- Check that "Who" column matches person name exactly

### Dropdowns not working
- Run: Task Tools → ⚙️ Configuration → 🔧 Fix Status Values
- Ensure Settings sheet exists and has data

### Slow performance
- Run: Task Tools → ⚙️ Configuration → 🗑️ Clear Config Cache
- Archive old completed tasks
- Reduce number of rows with validation

### Search not finding tasks
- Check spelling
- Try broader search terms
- Use advanced filters

## 📚 Documentation

- **CHANGELOG.md** - Detailed version history
- **PERSON_SHEETS_FEATURE.md** - In-depth person sheets guide
- **NEW_FEATURE_SUMMARY.md** - Quick feature overview

## 🤝 Contributing

This is an open-source project! Contributions welcome:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

MIT License - Free to use and modify

## 🙏 Credits

Built by Allan Alomes
GitHub: https://github.com/oliveoi1/google-sheets-task-management

## 📞 Support

- **Issues**: Open a GitHub issue
- **Questions**: Check existing issues or create a new one
- **Feature Requests**: We'd love to hear your ideas!

## 🗺️ Roadmap

Future enhancements:
- [ ] Drag-and-drop Kanban board
- [ ] Time tracking integration
- [ ] Gantt chart view
- [ ] Mobile app companion
- [ ] Advanced permissions system
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Dependencies and subtasks
- [ ] Export to PDF reports
- [ ] API integration framework

---

**Made with ❤️ for productivity**

*Star this repo if you find it useful!*
