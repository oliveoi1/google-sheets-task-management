# 🎨 Apple-Inspired Styling Guide

Transform your Google Sheets task management system into a beautiful, Apple-like experience.

## 🎯 Design Principles

### Apple's Core Design Values

1. **Clarity** - Content is paramount, design should enhance not distract
2. **Deference** - The interface helps users understand and interact with content
3. **Depth** - Visual layers convey hierarchy and position
4. **Consistency** - Use familiar patterns throughout
5. **Beauty** - Subtle details create emotional connection

## 🎨 Color Palette

### Apple System Colors (for Google Sheets)

**Primary Colors:**
- **Blue**: `#007AFF` - Primary actions, links, active states
- **Green**: `#34C759` - Success, completed
- **Orange**: `#FF9500` - Warnings, attention
- **Red**: `#FF3B30` - Errors, urgent

**Neutral Colors:**
- **Gray 1**: `#F5F5F7` - Light backgrounds
- **Gray 2**: `#E5E5E7` - Borders, dividers
- **Gray 3**: `#86868B` - Secondary text
- **Gray 6**: `#1D1D1F` - Primary text
- **White**: `#FFFFFF` - Backgrounds

### Status-Based Color Coding

```
Carpark    → #FDE2DD (soft red) with #C45F5F header
Waiting    → #FBE8C6 (soft yellow) with #9B5E1F header  
To Do      → #DCE9F8 (soft blue) with #1D3973 header
In Progress → #FFF5CC (soft amber) with #A17700 header
Completed  → #DFF2DB (soft green) with #395C29 header
```

## 📝 Typography for Sheets

### Font Recommendations

1. **Primary**: Arial (Google Sheets default, closest to SF Pro)
2. **Alternative**: Roboto (clean, modern)
3. **Monospace**: Roboto Mono (for priorities, codes)

### Text Hierarchy

**Headers (Row 4):**
- Font: Arial
- Size: 10pt
- Weight: Bold
- Color: White on colored header

**Data Rows:**
- Font: Arial
- Size: 10pt
- Weight: Normal
- Color: #1D1D1F (near-black)

**Secondary Info:**
- Font: Arial
- Size: 9pt
- Weight: Normal  
- Color: #86868B (gray)

## 🏗️ Sheet Layout Best Practices

### 1. Task Sheets (Carpark, To Do, etc.)

```
Row 1: Title
- Merge A1:K1
- Font Size: 14pt
- Font Weight: Bold
- Background: White
- Text Color: #1D1D1F
- Alignment: Left
- Padding: 8px

Row 2: Instructions
- Merge A2:K2
- Font Size: 9pt
- Font Style: Italic
- Text Color: #86868B
- Background: White

Row 3: Spacer
- Leave blank
- Height: 8px

Row 4: Headers
- Bold, 10pt
- Background: Status color (darker shade)
- Text: White
- Alignment: Center
- Freeze this row

Row 5+: Data
- Alternating rows (banding)
- Light: White
- Dark: #F5F5F7
```

### 2. Column Widths (Apple-like spacing)

```
A - Task:            250px (generous for readability)
B - Description:     300px (space for details)
C - Priority:        80px  (compact for numbers)
D - Label:          120px (fixed tags)
E - Pillar:         120px (fixed categories)
F - Who:            100px (names)
G - Due Date:       100px (dates)
H - Status:         120px (dropdown)
I - Date Completed: 120px (dates)
J - Last Updated:   120px (dates)
K - Created Date:   120px (dates)
```

### 3. Visual Hierarchy

**Use bold sparingly:**
- Headers only
- Important titles
- Status indicators

**Use color meaningfully:**
- Urgent → Red tint (#FF3B30)
- Complete → Green tint (#34C759)
- Blocked → Orange tint (#FF9500)

## 🎨 Applying Apple Styling to Sheets

### Step 1: Format Headers

1. Select Row 4 (headers)
2. **Format → Text** → Bold
3. **Format → Align** → Center
4. **Format → Number** → Plain text
5. **Format → Fill color** → Status color
6. **Format → Text color** → White
7. **View → Freeze** → 4 rows

### Step 2: Set Column Alignment

**Left-align:**
- Task (A)
- Description (B)
- Label (D)
- Pillar (E)
- Who (F)

**Center-align:**
- Priority (C)
- Due Date (G)
- Status (H)
- Date Completed (I)
- Last Updated (J)
- Created Date (K)

### Step 3: Apply Banded Rows

1. Select data range (A4:K[last row])
2. **Format → Alternating colors**
3. Choose: Light gray 1
4. Header: Status color
5. Color 1: White (`#FFFFFF`)
6. Color 2: Gray 1 (`#F5F5F7`)

### Step 4: Add Subtle Borders

1. Select entire data range
2. **Format → Borders**
3. Style: Horizontal only
4. Color: `#E5E5E7` (light gray)
5. Width: 1px

### Step 5: Conditional Formatting (Advanced)

**Highlight Urgent Tasks:**
```
Apply to: Column D (Label)
Format cells if: Text contains "Urgent"
Background: rgba(255, 59, 48, 0.1) → #FFE7E6
Text color: #FF3B30
```

**Highlight Overdue:**
```
Apply to: Column G (Due Date)
Format cells if: Date is before "today"
Background: #FFE7E6
Text color: #FF3B30
```

**Highlight Completed:**
```
Apply to: Full row where Status = "Completed"
Background: #DFF2DB
Text strikethrough: Yes (optional)
```

## 📊 Kanban Board Styling

### Card Design (Limited by Google Sheets)

**What we can control:**
- Background colors (by status)
- Text formatting
- Border colors
- Cell padding

**Best practices:**
```
Card Height: 60px (set via script)
Card Width: 180px (set via script)
Card Padding: Add spaces in content for visual padding
Card Background: Status-specific light colors
Card Border: White (3px) for separation
```

### Kanban Column Headers

```
Row 5 Headers:
- Bold
- 11pt
- White text
- Dark status color background
- Center-aligned
- Clickable (HYPERLINK formula for navigation)
```

## 🎯 Person Sheets Styling

### Follow Main Sheet Style

**Additional touches:**
```
Row 1: "[Name]'s Tasks"
- Font: 14pt Bold
- Color: #1D1D1F
- Left-aligned

Row 2: Snapshot notice
- Font: 9pt Italic
- Color: #86868B
- Right-aligned

Row 4: Same headers as main sheets
```

### Visual Grouping

Use subtle background colors to group by status:

```
Carpark rows    → #FDE2DD (10% opacity)
Waiting rows    → #FBE8C6 (10% opacity)
To Do rows      → #DCE9F8 (10% opacity)
In Progress rows → #FFF5CC (10% opacity)
Completed rows  → #DFF2DB (10% opacity)
```

## 🎨 Settings Sheet Styling

### Clean, Organized Layout

```
Row 1: "Task Management Configuration"
- Font: 18pt Bold
- Color: #1D1D1F

Sections: Use bold headers
- "Stage Names"
- "Team Members"  
- "Pillars/Departments"
- "Labels"

Data: Use light backgrounds
- Background: #F5F5F7
- Border: 1px #E5E5E7
```

## ✨ Polish & Details

### 1. Remove Gridlines

**View → Show → Gridlines** (uncheck)
- Makes colors pop
- Cleaner, modern look
- More Apple-like

### 2. Optimize Spacing

- Row height: 21px (default is fine)
- Add blank rows between sections
- Use merged cells sparingly

### 3. Protection & Permissions

**Protect:**
- Header rows (prevent accidental edits)
- Formula cells
- Status columns on read-only views

**Use:** Light yellow warning for protected cells

### 4. Named Ranges

Create named ranges for:
- `Statuses`
- `TeamMembers`
- `Pillars`
- `Labels`

Makes formulas cleaner and more Apple-like (semantic naming)

## 📱 Mobile Considerations

While primarily desktop, consider:
- Wider columns for touch targets
- Larger fonts (11pt minimum)
- High contrast for readability
- Simplified views for small screens

## 🎨 Quick Setup: Apply All Styles

### For Each Task Sheet:

1. **Headers** → Bold, center, white text, status color background
2. **Banding** → Light gray alternating (#F5F5F7 / #FFFFFF)
3. **Borders** → Horizontal only, light gray
4. **Alignment** → Center: Priority & dates, Left: Everything else
5. **Freeze** → First 4 rows
6. **Gridlines** → Off

### For Kanban:

1. **Remove gridlines**
2. **Background** → White
3. **Cards** → Status colors (via script)
4. **Spacing** → Column widths 180px, row heights 60px

### For Person Sheets:

1. **Same as task sheets**
2. **Add name header**
3. **Bold column headers**
4. **Alternating colors**

## 🚀 Implementation Checklist

- [ ] Apply color palette to all sheets
- [ ] Set typography (Arial, 10pt, bold headers)
- [ ] Configure column widths
- [ ] Set column alignments
- [ ] Apply banded rows
- [ ] Add subtle borders
- [ ] Freeze header rows
- [ ] Turn off gridlines
- [ ] Set up conditional formatting
- [ ] Protect header rows
- [ ] Test on mobile (if applicable)

## 💡 Pro Tips

1. **Less is more** - Don't overuse color
2. **Consistency** - Same patterns across all sheets
3. **White space** - Let content breathe
4. **Subtle shadows** - Use borders instead of heavy shadows
5. **Hierarchy** - Size and weight over color
6. **Test** - View on different screen sizes
7. **Iterate** - Refine based on usage

## 📖 Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [SF Symbols](https://developer.apple.com/sf-symbols/) (for icon inspiration)

---

**Result**: A clean, modern, Apple-inspired Google Sheets experience that's both beautiful and functional.

Remember: Apple design is about **clarity, simplicity, and attention to detail**. Every pixel matters!

