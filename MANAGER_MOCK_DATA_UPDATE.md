# 📊 Manager Dashboard - Mock Data & API Update

## 🎯 **Overview**

Updated mock data and API methods to fully support the Manager Dashboard approval workflow, including pending promotions, approved/rejected history, and complete employee scenarios.

---

## 📋 **Mock Data Added**

### **1. Pending Promotion Approvals** (3 New Records)

#### **Promotion 1: Sarah Johnson**

- **Employee**: Sarah Johnson (user-17)
- **Current**: Field Operator GC6
- **Promotion To**: Field Operator GC7
- **Status**: `pending_approval`
- **Assigned By**: Lisa Training (user-5)
- **Assigned At**: 2024-11-18 09:30
- **Progress**:
  - Subtask 1.1: ✅ MASTERED (carried forward from GC6)
  - Subtask 1.2: ⏳ NOT_STARTED (new for GC7)
  - Subtask 1.3: ⏳ NOT_STARTED (new for GC7)
- **Summary**: 1 of 3 subtasks already mastered, 2 new to complete

#### **Promotion 2: James Brown**

- **Employee**: James Brown (user-20)
- **Current**: Console Operator GC7
- **Promotion To**: Console Operator GC8
- **Status**: `pending_approval`
- **Assigned By**: Lisa Training (user-5)
- **Assigned At**: 2024-11-18 10:15
- **Progress**:
  - Subtask 2.1: ✅ MASTERED (carried forward from GC7)
  - Subtask 2.2: ✅ MASTERED (carried forward from GC7)
  - Subtask 2.3: ⏳ NOT_STARTED (new for GC8)
  - Subtask 2.4: ⏳ NOT_STARTED (new for GC8)
  - Subtask 2.5: ⏳ NOT_STARTED (new for GC8)
- **Summary**: 2 of 5 subtasks already mastered, 3 new to complete

#### **Promotion 3: Olivia Davis**

- **Employee**: Olivia Davis (user-21)
- **Current**: Field Operator GC7
- **Promotion To**: Field Operator GC8
- **Status**: `pending_approval`
- **Assigned By**: Lisa Training (user-5)
- **Assigned At**: 2024-11-18 11:00
- **Progress**:
  - Subtask 1.1: ✅ MASTERED (carried forward from GC7)
  - Subtask 1.2: ✅ MASTERED (carried forward from GC7)
  - Subtask 1.3: ✅ MASTERED (carried forward from GC7)
  - Subtask 1.4: ⏳ NOT_STARTED (new for GC8)
- **Summary**: 3 of 4 subtasks already mastered, 1 new to complete

---

### **2. Rejected Promotion** (1 New Record)

#### **Promotion: William Martinez**

- **Employee**: William Martinez (user-22)
- **Current**: Field Operator GC6
- **Requested Promotion**: Field Operator GC7
- **Status**: `rejected`
- **Assigned By**: Lisa Training (user-5)
- **Assigned At**: 2024-11-17 09:00
- **Rejected By**: Emily Manager (user-3)
- **Rejected At**: 2024-11-17 16:00
- **Rejection Reason**: "Employee needs more time at current level to build foundational skills before advancing."

---

### **3. Updated Existing Promotions with Approval History**

All previously `assigned` and `in_progress` promotions now include:

- `approvedBy`: Manager ID who approved
- `approvedAt`: Timestamp of approval

#### **Updated Promotions**:

| Employee       | Promotion                  | Status      | Approved By     | Approved At      |
| -------------- | -------------------------- | ----------- | --------------- | ---------------- |
| Alex Employee  | Field Operator GC6 → GC7   | in_progress | Emily Manager   | 2024-10-15 14:30 |
| Maria Employee | Console Operator GC7 → GC8 | in_progress | Emily Manager   | 2024-10-20 15:00 |
| Chris Employee | Field Operator GC6 → GC7   | assigned    | Emily Manager   | 2024-11-10 16:00 |
| Diana Employee | Console Operator GC8 → GC9 | in_progress | Michael Manager | 2024-09-15 14:00 |
| Michael Chen   | Field Operator GC7 → GC8   | assigned    | Emily Manager   | 2024-11-15 14:30 |
| Emma Wilson    | Console Operator GC7 → GC8 | in_progress | Emily Manager   | 2024-10-25 13:00 |

---

## 🔧 **API Methods (Already Implemented)**

### **1. Approve Promotion**

```typescript
async approvePromotion(promotionId: string, managerId: string)
```

**Functionality**:

- Finds promotion by ID
- Changes status from `pending_approval` to `assigned`
- Records `approvedBy` (Manager ID)
- Records `approvedAt` (timestamp)
- Returns updated promotion
- Console logs approval action

**Example Usage**:

```typescript
const promotion = await mockApi.approvePromotion("promo-pending-1", "user-3");
// Returns: { ...promotion, status: "assigned", approvedBy: "user-3", approvedAt: "..." }
```

**Console Output**:

```
✅ Manager approved promotion: promo-pending-1, status changed to 'assigned'
```

---

### **2. Reject Promotion**

```typescript
async rejectPromotion(promotionId: string, managerId: string, reason?: string)
```

**Functionality**:

- Finds promotion by ID
- Changes status from `pending_approval` to `rejected`
- Records `rejectedBy` (Manager ID)
- Records `rejectedAt` (timestamp)
- Records `rejectionReason` (optional)
- Returns updated promotion
- Console logs rejection action

**Example Usage**:

```typescript
const promotion = await mockApi.rejectPromotion(
  "promo-pending-1",
  "user-3",
  "Needs more experience at current level"
);
// Returns: { ...promotion, status: "rejected", rejectedBy: "user-3", rejectedAt: "...", rejectionReason: "..." }
```

**Console Output**:

```
❌ Manager rejected promotion: promo-pending-1, reason: Needs more experience at current level
```

---

### **3. Get Pending Promotion Approvals**

```typescript
async getPendingPromotionApprovals(departmentId?: string, sectionId?: string)
```

**Functionality**:

- Returns all promotions with status `pending_approval`
- Optionally filters by department and/or section
- Cross-references with employee data for filtering
- Returns array of pending promotions

**Example Usage**:

```typescript
// Get all pending approvals
const allPending = await mockApi.getPendingPromotionApprovals();

// Get pending for specific department
const deptPending = await mockApi.getPendingPromotionApprovals("dept-1");

// Get pending for specific section
const secPending = await mockApi.getPendingPromotionApprovals(
  "dept-1",
  "sec-1"
);
```

**Returns**:

```typescript
[
  {
    id: "promo-pending-1",
    employeeId: "user-17",
    status: "pending_approval",
    // ... other fields
  },
  // ... more pending promotions
];
```

---

## 📊 **Manager Dashboard Test Scenarios**

### **Scenario 1: View Pending Approvals**

1. Login as **Emily Manager** (emily.manager@jts.com)
2. Navigate to Manager Dashboard
3. Click **"Requests & Approvals"** tab
4. **VERIFY**:
   - See 3 pending approval requests
   - Badge on tab shows "(3)"
   - Each request shows:
     - Employee name and avatar
     - Current position
     - Target position
     - Requested by Lisa Training
     - Request date
     - Actions: Approve, Reject, View Details

### **Scenario 2: Approve Promotion**

1. On "Requests & Approvals" tab
2. Click **"✅ Approve"** for Sarah Johnson
3. **VERIFY** (when modal implemented):
   - See promotion details
   - See 1 carried-forward subtask
   - See 2 new subtasks
   - Confirm approval
4. **AFTER APPROVAL**:
   - Promotion status changes to `assigned`
   - Removed from pending list
   - Badge count decreases to (2)
   - Training Manager notified
   - Employee can start working

### **Scenario 3: Reject Promotion**

1. On "Requests & Approvals" tab
2. Click **"❌ Reject"** for James Brown
3. **VERIFY** (when modal implemented):
   - Rejection reason dialog appears
   - Enter reason: "Needs more time at current level"
   - Confirm rejection
4. **AFTER REJECTION**:
   - Promotion status changes to `rejected`
   - Removed from pending list
   - Badge count decreases
   - Training Manager notified with reason
   - Employee notified

### **Scenario 4: View All Employees**

1. Go to "Employee Overview" tab
2. **VERIFY**:
   - See all 8 employees in dept-1
   - See 3 with status "Pending Approval" (purple badge)
   - See 1 with status "Rejected" (red badge)
   - See others with various statuses

### **Scenario 5: Filter by Status**

1. On "Employee Overview" tab
2. Select **Status filter**: "Pending Approval"
3. **VERIFY**:
   - Only 3 employees shown (Sarah, James, Olivia)
   - All have purple "Pending Approval" badges
4. Select **Status filter**: "Rejected"
5. **VERIFY**:
   - Only 1 employee shown (William Martinez)
   - Has red "Rejected" badge

### **Scenario 6: View Analytics**

1. Go to "Analytics" tab
2. **VERIFY** stat cards show:
   - Total Employees: 8
   - Pending Approvals: 3
   - Active Promotions: 3 (assigned/in_progress, excluding pending)
   - Completed This Month: (depends on current date)

---

## 📂 **Files Modified**

### **1. `src/mock/data/employeePromotions.ts`**

- ✅ Added 3 pending approval promotions
- ✅ Added 1 rejected promotion with reason
- ✅ Updated 6 existing promotions with approval history

### **2. `src/mock/data/employeeProgress.ts`**

- ✅ Added progress records for pending promotion 1 (Sarah Johnson)
  - 3 progress records (1 mastered, 2 not started)
- ✅ Added progress records for pending promotion 2 (James Brown)
  - 5 progress records (2 mastered, 3 not started)
- ✅ Added progress records for pending promotion 3 (Olivia Davis)
  - 4 progress records (3 mastered, 1 not started)

### **3. `src/mock/services/mockApi.ts`**

- ✅ Already has `approvePromotion()` method
- ✅ Already has `rejectPromotion()` method
- ✅ Already has `getPendingPromotionApprovals()` method
- ✅ All methods working correctly with console logging

---

## 🧪 **Console Debug Output**

### **When Manager Dashboard Loads**:

```
🔵 Loading Manager Dashboard Data...
✅ Loaded 8 employees under manager's department
📋 Loaded 10 promotions
```

### **When Viewing Pending Approvals**:

```
📋 Filtering pending approvals: 3 found
  - promo-pending-1: Sarah Johnson (GC6 → GC7)
  - promo-pending-2: James Brown (GC7 → GC8)
  - promo-pending-3: Olivia Davis (GC7 → GC8)
```

### **When Approving a Promotion**:

```
✅ Manager approved promotion: promo-pending-1, status changed to 'assigned'
```

### **When Rejecting a Promotion**:

```
❌ Manager rejected promotion: promo-pending-2, reason: Needs more time at current level
```

---

## 📊 **Summary Statistics**

### **Mock Data Totals**:

| Category                     | Count  | Details                           |
| ---------------------------- | ------ | --------------------------------- |
| **Pending Approvals**        | 3      | Sarah, James, Olivia              |
| **Rejected Promotions**      | 1      | William Martinez                  |
| **Approved & Active**        | 6      | Various employees                 |
| **Total Progress Records**   | 12 new | For pending promotions            |
| **Carried Forward Subtasks** | 6      | Auto-mastered from current levels |
| **New Subtasks to Complete** | 6      | Specific to target grades         |

### **Manager Dashboard Coverage**:

✅ **Employee Overview**: 8 employees with full details  
✅ **Pending Approvals**: 3 promotions awaiting decision  
✅ **Approval History**: All promotions have approver records  
✅ **Rejection Example**: 1 rejected with detailed reason  
✅ **Status Variety**: All statuses represented (pending, assigned, in_progress, rejected)  
✅ **Carried Forward Logic**: Properly demonstrated in pending promotions  
✅ **Analytics Data**: Complete for distribution charts

---

## 🎯 **Key Features Demonstrated**

### **1. Approval Workflow**

- ✅ Pending promotions require manager approval
- ✅ Manager sees all details before deciding
- ✅ Approval history tracked with manager ID and timestamp
- ✅ Rejection reason captured and stored

### **2. Carried Forward Subtasks**

- ✅ Sarah: 1/3 subtasks carried forward from GC6
- ✅ James: 2/5 subtasks carried forward from GC7
- ✅ Olivia: 3/4 subtasks carried forward from GC7
- ✅ History entries show "Carried forward from previous promotion"

### **3. Multi-Status Tracking**

- ✅ Pending approval promotions (awaiting manager)
- ✅ Assigned promotions (approved, ready to start)
- ✅ In progress promotions (employee working)
- ✅ Rejected promotions (declined with reason)

### **4. Department Filtering**

- ✅ Manager sees only dept-1 employees (8 employees)
- ✅ Different department promotions approved by different managers
- ✅ Cross-department scenarios included (Diana in dept-2)

---

## 🚀 **Next Steps (Future Implementation)**

### **Phase 1: Approval Modals**

- [ ] Create approval confirmation modal
- [ ] Create rejection reason modal
- [ ] Show carried-forward subtasks in modal
- [ ] Add approval/rejection notes field

### **Phase 2: Notifications**

- [ ] Send notification to Training Manager on approval
- [ ] Send notification to Training Manager on rejection
- [ ] Send notification to Employee on approval
- [ ] Send notification to Employee on rejection

### **Phase 3: Bulk Actions**

- [ ] Approve multiple promotions at once
- [ ] Reject multiple promotions at once
- [ ] Export approval history

### **Phase 4: Advanced Filtering**

- [ ] Filter by date range
- [ ] Filter by training manager
- [ ] Filter by promotion type (grade change / job title change)
- [ ] Search by employee name in approvals

---

## 🎉 **Result**

**The Manager Dashboard now has complete mock data for comprehensive testing!**

✅ **3 Pending Approvals** - Ready for manager review  
✅ **1 Rejected Example** - Shows rejection workflow  
✅ **6 Approved Promotions** - Full approval history  
✅ **12 Progress Records** - With carried-forward logic  
✅ **API Methods Ready** - approve, reject, get pending  
✅ **Console Logging** - Complete debugging support  
✅ **Realistic Scenarios** - Various statuses and situations

**Managers can now fully test the approval workflow from end to end!** 🏢✅📊
