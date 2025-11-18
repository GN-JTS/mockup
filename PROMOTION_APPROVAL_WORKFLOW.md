# 🔐 Promotion Approval Workflow

## 🎯 **Overview**

When a Training Manager assigns a promotion to an employee, the promotion now requires **Manager approval** before it becomes active. This ensures proper oversight and alignment with organizational goals.

---

## 📊 **Complete Workflow**

### **Step 1: Training Manager Assigns Promotion** 📝

1. Training Manager selects employee
2. Reviews available promotion options
3. Selects target job title and grade
4. System shows carried-forward subtasks (if any)
5. Training Manager confirms assignment

**System Actions**:

```typescript
// Create promotion with PENDING_APPROVAL status
const promotion = {
  status: "pending_approval", // ⏳ Awaiting manager approval
  assignedBy: trainingManagerId,
  assignedAt: new Date().toISOString(),
  // ... other fields
};

// Send notification to Manager
notification = {
  type: "promotion_approval_request",
  title: "Promotion Approval Required",
  message:
    "Training Manager has assigned a promotion to [Employee]. Your approval is required.",
  relatedId: promotionId,
};
```

**Result**:

- ✅ Promotion created with `pending_approval` status
- ✅ Progress records created (with carried-forward subtasks marked as mastered)
- ✅ Notification sent to Manager
- ✅ Training Manager sees: "Promotion request submitted. Awaiting Manager approval."

---

### **Step 2: Manager Reviews & Approves/Rejects** ✅❌

#### **Manager Dashboard Shows**:

- Pending promotion approval requests
- Employee details (current vs. target position)
- Number of carried-forward subtasks
- Number of new subtasks to complete
- Training Manager who requested it

#### **Manager Actions**:

**Option A: Approve** ✅

```typescript
await mockApi.approvePromotion(promotionId, managerId);

// Result:
// - status: "pending_approval" → "assigned"
// - approvedBy: managerId
// - approvedAt: timestamp
// - Notifications sent to: Training Manager, Employee
```

**Option B: Reject** ❌

```typescript
await mockApi.rejectPromotion(promotionId, managerId, reason);

// Result:
// - status: "pending_approval" → "rejected"
// - rejectedBy: managerId
// - rejectedAt: timestamp
// - rejectionReason: string
// - Notifications sent to: Training Manager, Employee
```

---

### **Step 3: Post-Approval Actions** 🚀

#### **If Approved**:

1. Promotion status changes to `assigned`
2. Employee can now see promotion in their dashboard
3. Employee can book mentorship/evaluation appointments
4. Mentor/Evaluator can start evaluating subtasks
5. Progress tracking becomes active

#### **If Rejected**:

1. Promotion status changes to `rejected`
2. Training Manager is notified with rejection reason
3. Employee is notified
4. Training Manager can create a new promotion request if needed

---

## 🔄 **Status Flow**

```
[Training Manager Assigns]
          ↓
   pending_approval  ⏳
          ↓
    [Manager Reviews]
          ↓
    ┌─────┴─────┐
    ↓           ↓
 APPROVE     REJECT
    ↓           ↓
assigned  →  rejected
    ↓
in_progress
    ↓
completed
```

---

## 📋 **New Status Types**

| Status             | Description                   | Who Can See                                   | Actions Available                          |
| ------------------ | ----------------------------- | --------------------------------------------- | ------------------------------------------ |
| `pending_approval` | Awaiting manager approval     | Manager, Training Manager                     | Manager: Approve/Reject                    |
| `assigned`         | Approved, ready to start      | Employee, Training Manager, Mentor, Evaluator | Employee: Book appointments, view progress |
| `in_progress`      | Employee started work         | All                                           | Mentor/Evaluator: Evaluate subtasks        |
| `completed`        | All requirements met          | All                                           | System: Issue certificate                  |
| `rejected`         | Manager rejected              | Training Manager, Manager                     | Training Manager: Create new request       |
| `cancelled`        | Cancelled by Training Manager | All                                           | None                                       |

---

## 🎨 **UI Updates**

### **Training Manager - Assignment Page**

**Success Message** (Updated):

```
✅ "Promotion request submitted!
   3 subtask(s) from current level + completed promotions will be carried forward.
   5 new subtask(s) to master.
   ⏳ Awaiting Manager approval."
```

### **Manager - Dashboard** (NEW)

**Pending Approvals Section**:

```
┌─────────────────────────────────────────────────┐
│ 📋 Pending Promotion Approvals (3)              │
├─────────────────────────────────────────────────┤
│ Alex Employee                                    │
│ Field Operator GC6 → Field Operator GC7          │
│ Requested by: Lisa Training                      │
│ 1 carried forward, 2 new subtasks                │
│                                                  │
│ [✅ Approve] [❌ Reject]                         │
└─────────────────────────────────────────────────┘
```

### **Employee - Dashboard**

**Before Approval**:

```
⏳ Promotion Request Pending
   Your manager is reviewing a promotion request.
   Target: Field Operator GC7
```

**After Approval**:

```
✅ Active Promotion
   Target: Field Operator GC7
   Progress: 33% (1 of 3 subtasks mastered)
   [View Details]
```

**After Rejection**:

```
❌ Promotion Request Declined
   Reason: [Manager's reason]
   Please speak with your Training Manager.
```

---

## 🔧 **Technical Implementation**

### **New API Methods**

```typescript
// Approve promotion
mockApi.approvePromotion(promotionId: string, managerId: string)
  → Returns: Updated EmployeePromotion with status="assigned"

// Reject promotion
mockApi.rejectPromotion(promotionId: string, managerId: string, reason?: string)
  → Returns: Updated EmployeePromotion with status="rejected"

// Get pending approvals for manager
mockApi.getPendingPromotionApprovals(departmentId?: string, sectionId?: string)
  → Returns: Array of EmployeePromotions with status="pending_approval"
```

### **Updated Data Model**

```typescript
interface EmployeePromotion {
  id: string;
  employeeId: string;
  targetJobTitleId: string;
  targetGradeId: string;
  status:
    | "pending_approval"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rejected";
  assignedBy: string; // Training Manager ID
  assignedAt: string;
  approvedBy?: string; // Manager ID (NEW)
  approvedAt?: string; // Approval timestamp (NEW)
  rejectedBy?: string; // Manager ID (NEW)
  rejectedAt?: string; // Rejection timestamp (NEW)
  rejectionReason?: string; // Reason for rejection (NEW)
  completedAt?: string;
  requirementId: string;
}
```

---

## 📊 **Console Logs**

### **When Training Manager Assigns**:

```
📋 Created promotion with status: pending_approval (requires manager approval)
📚 Loaded 1 mastered subtasks for Alex Employee
✅ Carrying forward mastered subtask: subtask-1.1
📨 Sent approval request notification to Manager
```

### **When Manager Approves**:

```
✅ Manager approved promotion: promo-123, status changed to 'assigned'
📨 Sent approval notification to Training Manager and Employee
```

### **When Manager Rejects**:

```
❌ Manager rejected promotion: promo-123, reason: "Employee needs more time at current level"
📨 Sent rejection notification to Training Manager and Employee
```

---

## 🧪 **Testing Scenario**

### **Complete End-to-End Test**

#### **Step 1: Training Manager Assigns**

1. Login as **Training Manager** (lisa.training@jts.com)
2. Navigate to `/training-manager/employees`
3. Click "Assign Promotion" for Alex Employee
4. Select Field Operator GC7
5. Click "Confirm Assignment"
6. **VERIFY**:
   - Success message shows "Awaiting Manager approval"
   - Console shows "status: pending_approval"
   - Notification sent

#### **Step 2: Manager Approves**

1. Login as **Manager** (manager in same department)
2. Navigate to Manager Dashboard
3. See "Pending Promotion Approvals" section
4. Review Alex Employee's promotion request
5. Click "Approve"
6. **VERIFY**:
   - Promotion status changes to "assigned"
   - Console shows "Manager approved promotion"
   - Training Manager receives notification
   - Employee receives notification

#### **Step 3: Employee Sees Approved Promotion**

1. Login as **Alex Employee**
2. Go to Dashboard
3. **VERIFY**:
   - Active promotion section shows
   - Progress shows 33% (1 mastered from carried forward)
   - Can book appointments

#### **Step 4: Test Rejection** (Optional)

1. Assign another promotion
2. Manager clicks "Reject" with reason
3. **VERIFY**:
   - Status changes to "rejected"
   - Training Manager notified with reason
   - Employee notified

---

## 🎯 **Benefits**

### **For Managers**

✅ **Control**: Approval oversight over promotions  
✅ **Alignment**: Ensure promotions align with business needs  
✅ **Visibility**: See all promotion requests in one place  
✅ **Documentation**: Track approval/rejection history

### **For Training Managers**

✅ **Clear Process**: Know when approval is needed  
✅ **Feedback Loop**: Understand rejection reasons  
✅ **Audit Trail**: Track who approved what

### **For Employees**

✅ **Transparency**: Know approval status  
✅ **Expectations**: Clear about next steps  
✅ **Communication**: Understand any delays or rejections

### **For System**

✅ **Compliance**: Proper approval workflow  
✅ **Audit Trail**: Complete history  
✅ **Flexibility**: Can add more approval levels later

---

## 📝 **Files Modified**

1. ✅ `src/utils/constants.ts`

   - Added `PENDING_APPROVAL` and `REJECTED` to `PromotionStatus` enum
   - Added status names and colors

2. ✅ `src/types/index.ts`

   - Updated `EmployeePromotion` interface with approval fields

3. ✅ `src/mock/services/mockApi.ts`

   - Added `approvePromotion()` method
   - Added `rejectPromotion()` method
   - Added `getPendingPromotionApprovals()` method

4. ✅ `src/pages/TrainingManager/AssignPromotion.tsx`

   - Changed initial status to `pending_approval`
   - Added notification to manager
   - Updated success message

5. ✅ `src/pages/TrainingManager/EmployeeProgressView.tsx`
   - Updated to include `pending_approval` in active promotion filter
   - Added console log for pending status

---

## 🚀 **Next Steps (To Complete)**

To fully implement this workflow, the following pages need to be created:

1. **Manager Dashboard** (`src/pages/Dashboard/ManagerDashboard.tsx`)

   - Show pending approval requests
   - Display employee details
   - Approve/Reject buttons with confirmation dialogs

2. **Manager Routes** (`src/routes/index.tsx`)

   - Add routes for Manager role
   - `/manager/approvals` - Pending requests
   - `/manager/approved` - Approved history
   - `/manager/rejected` - Rejected history

3. **Employee Dashboard Updates** (`src/pages/Dashboard/EmployeeDashboard.tsx`)

   - Show pending approval status
   - Show rejection message if rejected

4. **Notification System Updates**
   - Handle `promotion_approval_request` notification type
   - Handle `promotion_approved` notification type
   - Handle `promotion_rejected` notification type

---

## 🎉 **Result**

**Promotions now require Manager approval before becoming active, ensuring proper oversight and alignment with organizational goals!** 🔐✅

---

This approval workflow adds an essential layer of governance while maintaining the efficiency of the automated subtask carry-forward system! 🚀
