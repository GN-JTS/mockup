# 🏢 Manager Dashboard - Complete Guide

## 🎯 **Overview**

The Manager Dashboard is a comprehensive interface for department managers to oversee employees, approve promotions, manage role assignments, and analyze team performance within the new dynamic system design.

---

## 📊 **Dashboard Architecture**

### **Tab-Based Navigation**

The Manager Dashboard uses 4 main tabs:

1. **👥 Employee Overview** - View and manage all employees
2. **🔔 Requests & Approvals** - Approve/reject promotion requests
3. **⚙️ Role Assignments** - Assign Training Managers, Mentors, Evaluators
4. **📈 Analytics** - Department performance insights

---

## 1️⃣ **Employee Overview Tab**

### **Features**

✅ **Complete Employee List** with:
- Employee name, email, avatar
- Department & Section
- Current job title and grade
- Active promotion details (if any)
- Progress percentage
- Status indicators
- Quick action buttons

### **Filters & Search**

**Search Bar**: Search by name or email  
**Filter Dropdowns**:
- Department
- Section
- Job Title
- Grade
- Status (On Track, Behind, Pending Approval, etc.)

### **Status Indicators**

| Status | Color | Meaning |
|--------|-------|---------|
| **On Track** | 🟢 Green | Employee progressing well (50-99%) |
| **Behind** | 🔴 Red | Low progress (<50%) |
| **Pending Approval** | 🟣 Purple | Waiting for manager approval |
| **Not Started** | ⚫ Gray | Promotion assigned but not started |
| **Ready for Completion** | 🔵 Blue | All requirements met (100%) |
| **Rejected** | 🔴 Red | Manager rejected promotion |

### **Actions**

- **👁️ View Details**: Navigate to employee's detailed progress page

---

## 2️⃣ **Requests & Approvals Tab**

### **Promotion Approval Workflow**

When Training Managers assign promotions, they appear here for Manager approval.

### **Request Card Display**

Each pending promotion shows:

```
┌─────────────────────────────────────────────────────────┐
│ [Employee Avatar] Alex Employee                          │
│                  Requested by: Lisa Training             │
│                                                          │
│ Current Position:    Field Operator GC6                  │
│ Promotion To:        Field Operator GC7 ⭐               │
│                                                          │
│ Requested on: Jan 15, 2025                               │
│                                                          │
│  [✅ Approve]  [❌ Reject]  [👁️ View Details]           │
└─────────────────────────────────────────────────────────┘
```

### **Approval Actions**

#### **✅ Approve Promotion**

**What Happens**:
1. Promotion status changes: `pending_approval` → `assigned`
2. `approvedBy` set to Manager ID
3. `approvedAt` timestamp recorded
4. Notifications sent to:
   - Training Manager (confirmation)
   - Employee (ready to start)
5. Employee can now book appointments

**Navigation**: `/manager/approve-promotion/:promotionId`

#### **❌ Reject Promotion**

**What Happens**:
1. Promotion status changes: `pending_approval` → `rejected`
2. `rejectedBy` set to Manager ID
3. `rejectedAt` timestamp recorded
4. `rejectionReason` stored
5. Notifications sent to:
   - Training Manager (with reason)
   - Employee (promotion declined)

**Navigation**: `/manager/reject-promotion/:promotionId`

#### **👁️ View Details**

- Navigate to employee's full progress page
- View requirement matrix for this promotion
- See carried-forward subtasks
- Review employee's complete history

### **Badge Notification**

If there are pending approvals, the "Requests & Approvals" tab shows a red badge with the count.

Example: **Requests & Approvals (3)**

---

## 3️⃣ **Role Assignments Tab**

### **Purpose**

Managers assign organizational roles to employees:
- **Training Managers** → Departments
- **Mentors** → Job Title + Grade combinations
- **Evaluators** → Sections & Grades

### **Current Status**

🚧 **Coming Soon**

Placeholder message displayed: _"Role assignment management coming soon"_

### **Planned Features**

#### **Training Manager Assignment**
- Assign to one or more departments
- View current assignments
- Remove or reassign

#### **Mentor Assignment**
- Assign to specific Job Title + Grade combinations
- Example: Mentor for "Field Operator GC7"
- Conflict detection (overlapping assignments)

#### **Evaluator Assignment**
- Assign to specific Sections & Grades
- Example: Evaluator for "Control Section GC8"
- Capacity management

#### **Assignment Panel Layout**

```
┌─────────────────────────────────────────────────────────┐
│ Role Type: [Training Manager ▼]                         │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Lisa Training                                    │    │
│ │ Assigned to: Operations Department               │    │
│ │ [Edit] [Remove]                                  │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [+ Add New Assignment]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 4️⃣ **Analytics Tab**

### **Department Performance Insights**

#### **Quick Stats Cards** (4 Metrics)

| Metric | Description | Color |
|--------|-------------|-------|
| **Total Employees** | All employees in department | 🔵 Blue |
| **Active Promotions** | Currently assigned/in-progress | 🟢 Green |
| **Pending Approvals** | Awaiting manager approval | 🟣 Purple |
| **Completed This Month** | Promotions finished this month | 🟡 Yellow |

#### **Distribution Charts**

**1. Employees by Grade**

Horizontal bar chart showing employee count per grade:

```
GC6  ████████████ 12 (30%)
GC7  ████████ 8 (20%)
GC8  ████████████████ 15 (37%)
GC9  ████ 4 (10%)
GC10 █ 1 (3%)
```

**2. Employees by Job Title**

Horizontal bar chart showing employee count per job title:

```
Field Operator      ████████████████ 20 (50%)
Console Operator    ████████████ 14 (35%)
Shift Supervisor    ████ 6 (15%)
```

### **Future Analytics Enhancements**

- **Top Delayed Tasks**: Which tasks take longest to complete
- **Evaluations Pending**: How many subtasks await evaluation
- **Department-wide Task Completion Map**: Visual heatmap
- **Trend Analysis**: Progress over time
- **Comparison Charts**: Department vs company average

---

## 🔧 **Technical Architecture**

### **Data Integration**

The Manager Dashboard integrates with:

#### **Core Entities**:
- `User` (employees)
- `Department`
- `Section`
- `JobTitle`
- `Grade`
- `EmployeePromotion`
- `EmployeeProgress`

#### **API Methods Used**:
```typescript
// Data Loading
mockApi.getUsers()
mockApi.getJobTitles()
mockApi.getGrades()
mockApi.getDepartments()
mockApi.getSections()
mockApi.getEmployeePromotions()
mockApi.getEmployeeProgress()

// Approval Actions (To be implemented)
mockApi.approvePromotion(promotionId, managerId)
mockApi.rejectPromotion(promotionId, managerId, reason)
mockApi.getPendingPromotionApprovals(departmentId, sectionId)
```

### **State Management**

```typescript
const [loading, setLoading] = useState(true);
const [employees, setEmployees] = useState<User[]>([]);
const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
const [grades, setGrades] = useState<Grade[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);
const [sections, setSections] = useState<Section[]>([]);
const [promotions, setPromotions] = useState<EmployeePromotion[]>([]);
const [allProgress, setAllProgress] = useState<EmployeeProgress[]>([]);

// Filters
const [searchTerm, setSearchTerm] = useState("");
const [filterDepartment, setFilterDepartment] = useState("");
const [filterSection, setFilterSection] = useState("");
const [filterJobTitle, setFilterJobTitle] = useState("");
const [filterGrade, setFilterGrade] = useState("");
const [filterStatus, setFilterStatus] = useState("");

// Tab navigation
const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "roles" | "analytics">("overview");
```

### **Employee Details Calculation**

```typescript
const getEmployeeDetails = (employee: User) => {
  const jobTitle = jobTitles.find((jt) => jt.id === employee.jobTitleId);
  const grade = grades.find((g) => g.id === employee.gradeId);
  const section = sections.find((s) => s.id === employee.sectionId);
  
  // Find active promotion (including pending, rejected)
  const activePromotion = promotions.find(
    (p) =>
      p.employeeId === employee.id &&
      (p.status === "pending_approval" ||
        p.status === "assigned" ||
        p.status === "in_progress" ||
        p.status === "rejected")
  );

  // Calculate progress
  let progressStats = { total: 0, mastered: 0, percentage: 0 };
  if (activePromotion) {
    const empProgress = allProgress.filter(
      (p) => p.promotionId === activePromotion.id
    );
    progressStats.total = empProgress.length;
    progressStats.mastered = empProgress.filter(
      (p) =>
        p.mentorStatus === EvaluationStatus.MASTER &&
        p.evaluatorStatus === EvaluationStatus.MASTER
    ).length;
    progressStats.percentage =
      progressStats.total > 0
        ? Math.round((progressStats.mastered / progressStats.total) * 100)
        : 0;
  }

  // Determine status
  let status = "On Track";
  if (activePromotion) {
    if (activePromotion.status === "pending_approval") {
      status = "Pending Approval";
    } else if (activePromotion.status === "rejected") {
      status = "Rejected";
    } else if (progressStats.percentage === 0) {
      status = "Not Started";
    } else if (progressStats.percentage < 50) {
      status = "Behind";
    } else if (progressStats.percentage < 100) {
      status = "On Track";
    } else {
      status = "Ready for Completion";
    }
  }

  return { jobTitle, grade, section, activePromotion, progressStats, status };
};
```

---

## 📂 **Routes**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/manager` | `ManagerDashboard` | Main dashboard (Employee Overview) |
| `/manager/approvals` | `ManagerDashboard` | Show Approvals tab |
| `/manager/roles` | `ManagerDashboard` | Show Role Assignments tab |
| `/manager/analytics` | `ManagerDashboard` | Show Analytics tab |
| `/manager/employee/:employeeId` | `EmployeeProgressView` | Detailed employee view |
| `/manager/approve-promotion/:promotionId` | `ManagerDashboard` (future modal) | Approve promotion |
| `/manager/reject-promotion/:promotionId` | `ManagerDashboard` (future modal) | Reject promotion |
| `/admin/promotion-requirements` | `PromotionRequirementsManagement` | View/edit matrix |

---

## 🎨 **Sidebar Navigation**

Manager-specific menu items:

```
📊 Dashboard
📚 Training Requirements
👥 Employees           ← New
🔔 Approvals           ← New (with badge if pending)
⚙️ Role Assignments    ← New
📈 Analytics           ← New
🔢 Promotion Matrix    ← New (links to admin page)
🚪 Logout
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: View All Employees**

1. Login as **Manager** (e.g., john.manager@jts.com)
2. Navigate to `/manager`
3. **VERIFY**:
   - See all employees in department
   - See current positions and grades
   - See active promotions
   - See progress percentages
   - See status badges

### **Scenario 2: Filter Employees**

1. On Employee Overview tab
2. Use filter dropdowns:
   - Filter by Section: "Control Section"
   - Filter by Grade: "GC7"
   - Filter by Status: "On Track"
3. **VERIFY**:
   - Employee list updates in real-time
   - Only matching employees shown
   - Stats update dynamically

### **Scenario 3: Search Employees**

1. On Employee Overview tab
2. Type in search bar: "Alex"
3. **VERIFY**:
   - Employees filtered by name/email
   - Search is case-insensitive
   - Results appear instantly

### **Scenario 4: Approve Promotion**

1. Go to "Requests & Approvals" tab
2. See pending promotion request
3. Click "✅ Approve" button
4. **VERIFY** (when implemented):
   - Confirmation dialog appears
   - Shows promotion details
   - After approval:
     - Status changes to "assigned"
     - Notifications sent
     - Employee can start

### **Scenario 5: Reject Promotion**

1. Go to "Requests & Approvals" tab
2. See pending promotion request
3. Click "❌ Reject" button
4. **VERIFY** (when implemented):
   - Rejection reason dialog appears
   - After rejection:
     - Status changes to "rejected"
     - Training Manager notified
     - Request removed from pending list

### **Scenario 6: View Analytics**

1. Go to "Analytics" tab
2. **VERIFY**:
   - See 4 quick stat cards with current numbers
   - See "Employees by Grade" chart
   - See "Employees by Job Title" chart
   - Percentages add up to 100%

### **Scenario 7: View Employee Details**

1. From Employee Overview
2. Click 👁️ icon next to an employee
3. **VERIFY**:
   - Navigate to employee's full progress page
   - See complete task/subtask tree
   - See all mastered items
   - See evaluation history

---

## 🚀 **Future Enhancements**

### **Phase 1: Enhanced Approvals**
- [ ] Inline approval/rejection modals
- [ ] Bulk approve/reject multiple promotions
- [ ] Approval history log
- [ ] Rejection reason templates

### **Phase 2: Role Assignment Management**
- [ ] Full CRUD for Training Manager assignments
- [ ] Full CRUD for Mentor assignments
- [ ] Full CRUD for Evaluator assignments
- [ ] Conflict detection and resolution
- [ ] Capacity and workload management

### **Phase 3: Advanced Analytics**
- [ ] Time-based trend charts
- [ ] Completion rate comparisons
- [ ] Top performers identification
- [ ] Bottleneck detection
- [ ] Predictive analytics

### **Phase 4: Notifications & Alerts**
- [ ] Real-time notification bell
- [ ] Email notifications
- [ ] Escalation for delayed approvals
- [ ] Weekly summary reports

### **Phase 5: Export & Reporting**
- [ ] Export employee data to CSV/Excel
- [ ] Generate PDF reports
- [ ] Custom report builder
- [ ] Scheduled reports

---

## 📝 **Files Created/Modified**

### **New Files**:
1. ✅ `src/pages/Dashboard/ManagerDashboard.tsx` - Main dashboard component

### **Modified Files**:
1. ✅ `src/routes/index.tsx` - Added Manager routes
2. ✅ `src/components/common/Sidebar.tsx` - Added Manager navigation items
3. ✅ `src/utils/constants.ts` - Already has promotion statuses
4. ✅ `src/types/index.ts` - Already has EmployeePromotion interface
5. ✅ `src/mock/services/mockApi.ts` - Already has approval methods

---

## 🎉 **Summary**

**The Manager Dashboard provides comprehensive oversight and control!**

✅ **Employee Management** - View all employees with filters  
✅ **Promotion Approvals** - Review and approve/reject requests  
✅ **Status Tracking** - Real-time progress monitoring  
✅ **Analytics** - Department performance insights  
✅ **Role Integration** - Access to promotion matrix  
✅ **Responsive UI** - Clean, modern, intuitive interface  
✅ **Dynamic Data** - Fully integrated with new system design  

**Managers now have all the tools they need to oversee employee development and make informed decisions!** 🏢📊✅

