# 🎓 Mastered Subtasks Carry-Forward Feature

## 📋 **Overview**

Employees should NOT be re-evaluated on subtasks they've already mastered in previous promotions. This feature automatically carries forward previously mastered subtasks to new promotion assignments.

---

## 🎯 **Business Logic**

### **Problem**

Without this feature:

- Employee completes Field Operator GC6 → masters `subtask-1.1`
- Gets assigned to Field Operator GC7 → requires `subtask-1.1`, `subtask-1.2`, `subtask-1.3`
- ❌ Employee would be re-evaluated on `subtask-1.1` again (redundant!)

### **Solution**

With carry-forward logic:

- Employee completes Field Operator GC6 → masters `subtask-1.1` ✅
- Gets assigned to Field Operator GC7
- ✅ System automatically marks `subtask-1.1` as "mastered" (carried forward)
- ⚡ Employee only needs evaluation on `subtask-1.2` and `subtask-1.3` (NEW subtasks)

---

## 🔧 **Implementation**

### **1. New API Method: `getMasteredSubtasksForEmployee()`**

**Location**: `src/mock/services/mockApi.ts`

**Purpose**: Fetches all subtask IDs that an employee has mastered from completed promotions.

**Logic**:

```typescript
async getMasteredSubtasksForEmployee(employeeId: string) {
  await delay(400);

  // Find all completed promotions for this employee
  const completedPromotions = mockEmployeePromotions.filter(
    (ep) => ep.employeeId === employeeId && ep.status === "completed"
  );

  // Get all progress records for completed promotions where subtask is mastered
  const masteredSubtasks: string[] = [];
  completedPromotions.forEach((promotion) => {
    const progressRecords = mockEmployeeProgress.filter(
      (ep) =>
        ep.promotionId === promotion.id &&
        (ep.mentorStatus === "mastered" || ep.evaluatorStatus === "mastered")
    );
    progressRecords.forEach((pr) => {
      if (!masteredSubtasks.includes(pr.subtaskId)) {
        masteredSubtasks.push(pr.subtaskId);
      }
    });
  });

  return masteredSubtasks;
}
```

**Returns**: Array of subtask IDs (e.g., `["subtask-1.1", "subtask-1.2", "subtask-1.3"]`)

---

### **2. Updated Assignment Logic**

**Location**: `src/pages/TrainingManager/AssignPromotion.tsx`

**Key Changes**:

#### **A. Load Mastered Subtasks on Page Load**

```typescript
const [masteredSubtasks, setMasteredSubtasks] = useState<string[]>([]);

useEffect(() => {
  if (employee) {
    loadMasteredSubtasks();
  }
}, [employee]);

const loadMasteredSubtasks = async () => {
  if (!employee) return;
  try {
    const mastered = await mockApi.getMasteredSubtasksForEmployee(employee.id);
    setMasteredSubtasks(mastered);
    console.log(
      `📚 Loaded ${mastered.length} mastered subtasks for ${employee.name}`
    );
  } catch (error) {
    console.error("Failed to load mastered subtasks:", error);
  }
};
```

#### **B. Check Each Subtask During Assignment**

```typescript
selectedRequirement.required.forEach((reqTask) => {
  reqTask.subtaskIds.forEach((subtaskId) => {
    const isAlreadyMastered = masteredSubtasks.includes(subtaskId);

    if (isAlreadyMastered) {
      carriedForwardCount++;
      console.log(`✅ Carrying forward mastered subtask: ${subtaskId}`);
    } else {
      newSubtasksCount++;
    }

    progressRecords.push({
      id: generateId(),
      promotionId: newPromotion.id,
      employeeId: employee.id,
      subtaskId: subtaskId,
      // Auto-mark as mastered if previously completed
      mentorStatus: isAlreadyMastered
        ? EvaluationStatus.MASTERED
        : EvaluationStatus.NOT_STARTED,
      evaluatorStatus: isAlreadyMastered
        ? EvaluationStatus.MASTERED
        : EvaluationStatus.NOT_STARTED,
      history: isAlreadyMastered
        ? [
            {
              timestamp: new Date().toISOString(),
              action: "Carried forward from previous promotion",
              performedBy: currentUser.id,
            },
          ]
        : [],
    });
  });
});
```

#### **C. Success Message**

```typescript
const successMessage =
  carriedForwardCount > 0
    ? `Promotion assigned successfully! ${carriedForwardCount} previously mastered subtask(s) carried forward. ${newSubtasksCount} new subtask(s) to complete.`
    : `Promotion assigned successfully to ${employee.name}!`;

showToast(successMessage, "success");
```

---

### **3. UI Feedback in Confirmation Dialog**

**Before Assignment**: Show training manager which subtasks will be carried forward.

```typescript
{
  selectedRequirement &&
    masteredSubtasks.length > 0 &&
    (() => {
      const allRequiredSubtasks = selectedRequirement.required.flatMap(
        (r) => r.subtaskIds
      );
      const commonSubtasks = allRequiredSubtasks.filter((sid) =>
        masteredSubtasks.includes(sid)
      );
      const newSubtasks = allRequiredSubtasks.length - commonSubtasks.length;

      return commonSubtasks.length > 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-green-900">
                {commonSubtasks.length} Previously Mastered Subtask
                {commonSubtasks.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-green-700 mt-1">
                These subtasks will be automatically marked as mastered.
                Employee only needs to complete {newSubtasks} new subtask
                {newSubtasks !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>
      ) : null;
    })();
}
```

**Visual Example**:

```
┌─────────────────────────────────────────────────────┐
│ ✓ 3 Previously Mastered Subtasks                    │
│                                                      │
│ These subtasks will be automatically marked as      │
│ mastered. Employee only needs to complete 5 new     │
│ subtasks.                                            │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 **Testing Scenario**

### **Scenario: Alex Employee Progression**

#### **Step 1: Alex Completes Field Operator GC6**

- **Requirements**: `subtask-1.1`
- Alex completes evaluation → `subtask-1.1` = **MASTERED** ✅
- Promotion marked as **COMPLETED**

#### **Step 2: Training Manager Assigns Field Operator GC7**

- **Requirements**: `subtask-1.1`, `subtask-1.2`, `subtask-1.3`

**System Behavior**:

1. Loads Alex's mastered subtasks → finds `subtask-1.1` ✅
2. Checks required subtasks for GC7:
   - `subtask-1.1` → **ALREADY MASTERED** → Auto-mark as mastered ✅
   - `subtask-1.2` → NEW → Requires evaluation ⏳
   - `subtask-1.3` → NEW → Requires evaluation ⏳
3. Shows confirmation dialog:
   ```
   ✓ 1 Previously Mastered Subtask
   Employee only needs to complete 2 new subtasks.
   ```
4. Creates `EmployeeProgress` records:
   ```typescript
   [
     {
       subtaskId: "subtask-1.1",
       mentorStatus: "mastered",      // ✅ Carried forward
       evaluatorStatus: "mastered",   // ✅ Carried forward
       history: [{ action: "Carried forward from previous promotion", ... }]
     },
     {
       subtaskId: "subtask-1.2",
       mentorStatus: "not_started",   // ⏳ Needs evaluation
       evaluatorStatus: "not_started"
     },
     {
       subtaskId: "subtask-1.3",
       mentorStatus: "not_started",   // ⏳ Needs evaluation
       evaluatorStatus: "not_started"
     }
   ]
   ```

#### **Step 3: Alex Views Progress**

- Sees `subtask-1.1` with ✅ "Mastered" badge
- Sees `subtask-1.2` and `subtask-1.3` as "Not Started"
- Total progress: 33% complete (1 of 3)

#### **Step 4: Mentor/Evaluator View**

- Sees `subtask-1.1` already marked as mastered (no action needed)
- Only evaluates `subtask-1.2` and `subtask-1.3`

---

## ✅ **Benefits**

1. **Efficiency**: No redundant evaluations
2. **Time Saving**: Employees focus only on new skills
3. **Recognition**: Previous achievements are preserved
4. **Motivation**: Progress feels cumulative, not repetitive
5. **Transparency**: Training manager sees exactly what's carried forward

---

## 📊 **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Employee Completes Promotion (GC6)                       │
│    → EmployeePromotion.status = "completed"                 │
│    → EmployeeProgress records have mentorStatus = "mastered"│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Training Manager Assigns New Promotion (GC7)             │
│    → Calls getMasteredSubtasksForEmployee(employeeId)       │
│    → Returns: ["subtask-1.1"]                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. System Checks Required Subtasks for GC7                  │
│    → ["subtask-1.1", "subtask-1.2", "subtask-1.3"]         │
│    → Finds "subtask-1.1" is already mastered               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Creates EmployeeProgress Records                         │
│    → subtask-1.1: mentorStatus = "mastered" (auto)         │
│    → subtask-1.2: mentorStatus = "not_started"             │
│    → subtask-1.3: mentorStatus = "not_started"             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Employee Sees Progress                                   │
│    → 1 subtask already mastered ✅                          │
│    → 2 subtasks require evaluation ⏳                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 **Console Logs**

When assigning a promotion, you'll see:

```
📚 Loaded 3 mastered subtasks for Alex Employee
🎓 Employee has 3 previously mastered subtasks: ['subtask-1.1', 'subtask-1.2', 'subtask-1.3']
✅ Carrying forward mastered subtask: subtask-1.1
✅ Carrying forward mastered subtask: subtask-1.2
```

---

## 📂 **Files Modified**

1. ✅ `src/mock/services/mockApi.ts`

   - Added `getMasteredSubtasksForEmployee()` method

2. ✅ `src/pages/TrainingManager/AssignPromotion.tsx`
   - Added `masteredSubtasks` state
   - Added `loadMasteredSubtasks()` function
   - Updated `handleAssign()` to check mastered subtasks
   - Updated confirmation dialog to show carried forward subtasks

---

## 🎯 **Result**

**Before**: Employee re-evaluated on same subtasks across multiple promotions

**After**: Employee only evaluated on NEW subtasks, previous achievements automatically recognized ✅

---

## 🚀 **How to Test**

1. **Start dev server**: `npm run dev`
2. **Login as Training Manager** (Lisa Training)
3. **Navigate to**: `/training-manager/assign/:employeeId`
4. **Select a promotion** that has common subtasks with a previous completed promotion
5. **Check confirmation dialog** - should show green box with "Previously Mastered Subtasks"
6. **Confirm assignment**
7. **Check employee progress view** - carried forward subtasks should be marked as "Mastered"
8. **Check console logs** - should show carry-forward messages

---

## 💡 **Edge Cases Handled**

1. ✅ **No Previous Promotions**: System works normally, all subtasks start as "not_started"
2. ✅ **All Subtasks Already Mastered**: All marked as mastered, employee auto-completes promotion
3. ✅ **Partial Overlap**: Only common subtasks carried forward, new ones require evaluation
4. ✅ **Multiple Completed Promotions**: All mastered subtasks from all promotions are included

---

## 📝 **Future Enhancements**

- [ ] Show detailed list of which subtasks are carried forward in the UI
- [ ] Add certificate/badge for subtasks mastered across multiple promotions
- [ ] Track "first mastered date" in history
- [ ] Allow manual override if training manager wants to re-evaluate a subtask

---

## 🎉 **Summary**

This feature ensures that employees are **never redundantly evaluated** on skills they've already proven, making the promotion system **more efficient, fair, and motivating**! 🚀
