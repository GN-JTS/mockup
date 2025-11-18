# 📊 Training Manager - Promotion Status Visibility

## 🎯 **Overview**

Training Managers can now see the complete approval status of all promotion requests they've submitted, including:

- ⏳ **Pending Manager Approval** - Waiting for manager review
- ✅ **Assigned** - Approved and active
- 🔄 **In Progress** - Employee is working on tasks
- ❌ **Rejected** - Manager declined the request
- ✓ **Completed** - Successfully finished

---

## 📋 **Dashboard Updates**

### **1. Summary Statistics (Header Cards)**

The dashboard header now shows **5 key metrics**:

```
┌──────────────────────────────────────────────────────────────────┐
│  Total Employees  │ ⏳ Pending Approval │ Active │ Completed │ ❌ Rejected │
│        8          │         2           │   3    │     5     │      1      │
└──────────────────────────────────────────────────────────────────┘
```

**Metrics Tracked**:

- **Total Employees**: All employees under Training Manager's scope
- **⏳ Pending Approval**: Promotions waiting for manager approval
- **Active Promotions**: Promotions currently assigned/in-progress
- **Completed**: Successfully finished promotions
- **❌ Rejected**: Promotions rejected by manager

---

### **2. Employee List Table - New Status Column**

Added a **"Status"** column to show the current promotion approval status for each employee.

#### **Table Layout**:

| Employee      | Current Position     | Active Promotion     | **Status**                      | Progress | Actions         |
| ------------- | -------------------- | -------------------- | ------------------------------- | -------- | --------------- |
| Alex Employee | Field Operator GC6   | Field Operator GC7   | **⏳ Pending Manager Approval** | 0%       | [View]          |
| Sarah Johnson | Field Operator GC6   | Console Operator GC7 | **✅ Assigned**                 | 33%      | [View] [Assign] |
| Michael Chen  | Console Operator GC8 | Shift Supervisor GC9 | **🔄 In Progress**              | 67%      | [View] [Assign] |

---

### **3. Status Badge Colors**

Each status is displayed with a distinct color-coded badge:

| Status             | Badge                       | Color     | When Shown                       |
| ------------------ | --------------------------- | --------- | -------------------------------- |
| `pending_approval` | ⏳ Pending Manager Approval | 🟣 Purple | Manager hasn't reviewed yet      |
| `assigned`         | ✅ Assigned                 | 🔵 Blue   | Manager approved, ready to start |
| `in_progress`      | 🔄 In Progress              | 🟡 Yellow | Employee started working         |
| `completed`        | ✓ Completed                 | 🟢 Green  | All requirements met             |
| `rejected`         | ❌ Rejected by Manager      | 🔴 Red    | Manager declined                 |
| `cancelled`        | Cancelled                   | ⚫ Gray   | Training Manager cancelled       |

---

## 🔄 **Status Workflow Visibility**

### **Complete Status Progression**:

```
Training Manager Assigns
          ↓
  ⏳ pending_approval
          ↓
  Manager Reviews
     ↓         ↓
  APPROVE    REJECT
     ↓         ↓
✅ assigned  ❌ rejected
     ↓
🔄 in_progress
     ↓
✓ completed
```

---

## 🎨 **Visual Examples**

### **Status Badge in Table**

#### **Pending Approval**:

```
┌────────────────────────────────────┐
│ ⏳ Pending Manager Approval        │  (Purple Badge)
└────────────────────────────────────┘
```

#### **Assigned (Approved)**:

```
┌────────────────────────────────────┐
│ ✅ Assigned                        │  (Blue Badge)
└────────────────────────────────────┘
```

#### **In Progress**:

```
┌────────────────────────────────────┐
│ 🔄 In Progress                     │  (Yellow Badge)
└────────────────────────────────────┘
```

#### **Rejected**:

```
┌────────────────────────────────────┐
│ ❌ Rejected by Manager             │  (Red Badge)
└────────────────────────────────────┘
```

#### **Completed**:

```
┌────────────────────────────────────┐
│ ✓ Completed                        │  (Green Badge)
└────────────────────────────────────┘
```

---

## 📊 **What Training Managers Can Now See**

### **1. At-a-Glance Dashboard Stats**

- How many promotions are waiting for manager approval
- How many are active
- How many were rejected
- Total completed promotions

### **2. Per-Employee Status**

- Current promotion status for each employee
- Visual color-coding for quick identification
- Progress percentage (for assigned/in-progress promotions)

### **3. Actionable Insights**

- **Pending Approval**: Waiting for manager - no action needed from Training Manager
- **Assigned**: Ready for employee to start - can view progress
- **In Progress**: Employee is working - can track progress
- **Rejected**: Need to discuss with manager or adjust promotion
- **Completed**: Celebration time! 🎉

---

## 🔍 **Technical Implementation**

### **Updated Components**

#### **Dashboard Statistics**:

```typescript
// Count promotions by status
const pendingApprovalCount = promotions.filter(
  (p) =>
    p.status === "pending_approval" &&
    employees.some((e) => e.id === p.employeeId)
).length;

const rejectedCount = promotions.filter(
  (p) => p.status === "rejected" && employees.some((e) => e.id === p.employeeId)
).length;
```

#### **Employee Details Lookup**:

```typescript
const getEmployeeDetails = (employee: User) => {
  // Include all current promotion statuses
  const activePromotion = promotions.find(
    (p) =>
      p.employeeId === employee.id &&
      (p.status === "pending_approval" ||
        p.status === "assigned" ||
        p.status === "in_progress" ||
        p.status === "rejected")
  );
  // ...
};
```

#### **Status Badge Display**:

```tsx
<span
  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    PromotionStatusColors[
      details.activePromotion.status as keyof typeof PromotionStatusColors
    ]
  }`}
>
  {details.activePromotion.status === "pending_approval" && "⏳ "}
  {details.activePromotion.status === "rejected" && "❌ "}
  {details.activePromotion.status === "assigned" && "✅ "}
  {details.activePromotion.status === "in_progress" && "🔄 "}
  {details.activePromotion.status === "completed" && "✓ "}
  {
    PromotionStatusNames[
      details.activePromotion.status as keyof typeof PromotionStatusNames
    ]
  }
</span>
```

---

## 📂 **Files Modified**

1. ✅ **`src/pages/Dashboard/TrainingManagerDashboard.tsx`**
   - Added `pendingApprovalCount` and `rejectedCount` to statistics
   - Added 5th stat card for "Rejected" promotions
   - Updated header grid to show 5 cards (was 3)
   - Added "Status" column to employee table
   - Updated `getEmployeeDetails()` to include `pending_approval` and `rejected` statuses
   - Added status badge with colors and icons
   - Imported `PromotionStatusColors` and `PromotionStatusNames`

---

## 🧪 **Testing Scenarios**

### **Scenario 1: View Pending Approval**

1. Login as **Training Manager** (lisa.training@jts.com)
2. Go to Dashboard
3. **VERIFY**:
   - Header shows "⏳ Pending Approval" count
   - Employee table shows purple "⏳ Pending Manager Approval" badge
   - Progress shows 0% or initial carried-forward percentage

### **Scenario 2: View Rejected Request**

1. (Assume manager rejected a promotion)
2. Login as **Training Manager**
3. Go to Dashboard
4. **VERIFY**:
   - Header shows "❌ Rejected" count > 0
   - Employee table shows red "❌ Rejected by Manager" badge
   - Training Manager can click to view rejection reason (future enhancement)

### **Scenario 3: Track Status Changes**

1. Assign a promotion (status: `pending_approval`)
2. Wait for manager approval
3. Refresh dashboard
4. **VERIFY**:
   - Status changes from "⏳ Pending" to "✅ Assigned"
   - Badge color changes from purple to blue
   - Progress tracking becomes active

### **Scenario 4: Filter by Status**

(Future Enhancement)

- Add dropdown to filter employees by promotion status
- Show only "Pending Approval" employees
- Show only "Rejected" employees
- Show only "In Progress" employees

---

## 💡 **Benefits**

### **For Training Managers**

✅ **Complete Visibility**: See all promotion request statuses at a glance  
✅ **No Guessing**: Know exactly which promotions are waiting for approval  
✅ **Track Rejections**: Identify rejected requests and take action  
✅ **Progress Monitoring**: See real-time status updates  
✅ **Better Planning**: Understand workload and bottlenecks

### **For Managers**

✅ **Accountability**: Training Managers can track approval timelines  
✅ **Transparency**: Clear visibility into what's pending

### **For Employees**

✅ **Indirect Benefit**: Training Managers can proactively follow up  
✅ **Faster Processing**: Better tracking = faster approvals

---

## 🚀 **Next Steps (Future Enhancements)**

### **1. Status Filters**

Add dropdown filters to show only:

- Pending approval requests
- Rejected requests
- Active promotions
- Completed promotions

### **2. Rejection Details View**

When clicking on a rejected promotion, show:

- Rejection reason
- Who rejected it
- When it was rejected
- Suggested actions

### **3. Notification Integration**

Send notifications to Training Manager when:

- Manager approves promotion
- Manager rejects promotion
- Employee completes promotion

### **4. Bulk Actions**

Allow Training Manager to:

- Cancel multiple pending requests
- Re-submit rejected requests
- Export status report

### **5. Timeline View**

Show a timeline of status changes:

```
Assigned by Training Manager → Pending Approval → Approved by Manager → In Progress → Completed
     ↓                              ↓                   ↓                  ↓            ↓
   Jan 1                         Jan 2              Jan 3              Jan 10       Feb 1
```

---

## 📝 **Summary**

**Training Managers now have complete visibility into the approval status of all promotion requests!**

✅ **5 Dashboard Statistics** - Including pending approval and rejected counts  
✅ **Status Column in Employee Table** - Visual badges for each promotion  
✅ **Color-Coded Badges** - Easy visual identification  
✅ **Comprehensive Status Tracking** - From pending to completed  
✅ **Real-Time Updates** - See status changes immediately

---

## 🎉 **Result**

Training Managers can now:

- 📊 **Track** all promotion requests they've submitted
- ⏳ **Monitor** pending manager approvals
- ❌ **Identify** rejected requests for follow-up
- ✅ **Celebrate** approved promotions
- 🔄 **Follow** employee progress in real-time

**No more wondering about promotion approval status!** 🚀
