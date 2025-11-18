# 🔍 Promotion Requirements Matrix - Debug Guide

## ✅ **What I Fixed**

1. **Added Console Debug Logging** - See exactly what data is loaded
2. **Added Visual Summary Stats** - Shows data counts at a glance
3. **Enhanced Error Handling** - Better alerts and error messages
4. **Improved Data Matching** - Debug logs for requirement lookups

---

## 🧪 **How to Test**

### **Step 1: Open the Matrix Page**

```bash
npm run dev
```

Navigate to: `/admin/promotion-requirements`

### **Step 2: Check Browser Console**

**Press F12** and go to **Console** tab

You should see:

```
=== PROMOTION MATRIX DEBUG ===
Job Titles: (3) [{id: 'job-field-operator', name: 'Field Operator'}, ...]
Grades: (5) [{id: 'grade-gc6', name: 'GC6', levelIndex: 6}, ...]
Tasks: (2) [{id: 'task-1', title: 'Duty1.0...'}, ...]
Subtasks: (17) [{id: 'subtask-1.1', ...}, ...]
Requirements: (15) [{id: 'pr-field-gc6', jobTitleId: 'job-field-operator', ...}, ...]
============================
```

### **Step 3: Check Summary Stats on Page**

You should see 5 stat boxes showing:

- **Job Titles**: 3
- **Grades**: 5
- **Configured**: 15
- **Total Cells**: 15
- **Coverage**: 100%

---

## 📊 **Expected Matrix Display**

### **Field Operator Row**

| GC6                              | GC7                               | GC8                               | GC9                               | GC10                                |
| -------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- | ----------------------------------- |
| ✓ Configured (1 task, 1 subtask) | ✓ Configured (1 task, 3 subtasks) | ✓ Configured (1 task, 5 subtasks) | ✓ Configured (1 task, 7 subtasks) | ✓ Configured (2 tasks, 10 subtasks) |

### **Console Operator Row**

| GC6         | GC7                               | GC8                               | GC9                               | GC10                               |
| ----------- | --------------------------------- | --------------------------------- | --------------------------------- | ---------------------------------- |
| + Configure | ✓ Configured (1 task, 3 subtasks) | ✓ Configured (1 task, 5 subtasks) | ✓ Configured (1 task, 6 subtasks) | ✓ Configured (2 tasks, 9 subtasks) |

### **Shift Supervisor Row**

| GC6         | GC7         | GC8         | GC9                                 | GC10                                |
| ----------- | ----------- | ----------- | ----------------------------------- | ----------------------------------- |
| + Configure | + Configure | + Configure | ✓ Configured (2 tasks, 10 subtasks) | ✓ Configured (2 tasks, 17 subtasks) |

---

## 🔍 **Troubleshooting**

### **Issue 1: Matrix Shows All "Configure" Buttons**

**Symptom**: No cells show "✓ Configured"

**Check Console For**:

```
Requirements: (0) []  // ❌ Empty array
```

**Fix**: The mock data isn't loading. Check if `promotionRequirements.ts` is properly exported in `src/mock/data/index.ts`

**Verify**:

```typescript
// src/mock/data/index.ts should have:
export * from "./promotionRequirements";
```

---

### **Issue 2: Some Cells Don't Match**

**Symptom**: Should show "Configured" but shows "Configure"

**Check Console For**:

```
Checking: job-field-operator + grade-gc7 = NOT FOUND
```

**Fix**: ID mismatch between:

- User's `jobTitleId` in `users.ts`
- `jobTitleId` in `promotionRequirements.ts`
- `id` in `jobTitles.ts`

**Verify IDs Match**:

```typescript
// jobTitles.ts
{ id: "job-field-operator", name: "Field Operator" }

// promotionRequirements.ts
{ jobTitleId: "job-field-operator", gradeId: "grade-gc7", ... }

// users.ts
{ jobTitleId: "job-field-operator", gradeId: "grade-gc6", ... }
```

---

### **Issue 3: Numbers Don't Add Up**

**Symptom**: Summary shows wrong counts

**Check**:

1. **Job Titles count** - Should be 3

   - job-field-operator
   - job-console-operator
   - job-shift-supervisor

2. **Grades count** - Should be 5

   - grade-gc6, grade-gc7, grade-gc8, grade-gc9, grade-gc10

3. **Requirements count** - Should be 15

   - See console: `Requirements: (15) [...]`

4. **Coverage** - Should be 100% (15/15)

---

### **Issue 4: Modal Shows No Tasks**

**Symptom**: Click a cell, modal opens but no tasks listed

**Check Console For**:

```
Tasks: (0) []  // ❌ Empty
Subtasks: (0) []  // ❌ Empty
```

**Fix**: Tasks/subtasks not loading

**Verify**:

```typescript
// src/mock/data/index.ts should have:
export * from "./tasks";
```

---

### **Issue 5: Can't Save New Requirement**

**Symptom**: Click "Save" but nothing happens

**Check Console For**:

```
Saving requirement: {jobTitleId: '...', gradeId: '...', required: [...]}
Creating new requirement
New requirement: {...}
```

**If you see error**:

```
Failed to save requirement: [error message]
```

**Check**:

1. Is `createPromotionRequirement` method in `mockApi.ts`?
2. Are you selecting at least one subtask?
3. Check if ID generation works: `pr-field-gc7` format

---

## ✅ **Quick Verification Checklist**

Run this in browser console after page loads:

```javascript
// 1. Check all data loaded
console.log("Job Titles:", window.mockJobTitles?.length || 0);
console.log("Grades:", window.mockGrades?.length || 0);
console.log("Requirements:", window.mockPromotionRequirements?.length || 0);

// 2. Check specific requirement
const testReq = window.mockPromotionRequirements?.find(
  (r) => r.id === "pr-field-gc7"
);
console.log("Test Requirement (pr-field-gc7):", testReq);

// 3. Check ID format
if (testReq) {
  console.log("  Job Title ID:", testReq.jobTitleId);
  console.log("  Grade ID:", testReq.gradeId);
  console.log("  Tasks:", testReq.required.length);
  console.log(
    "  Subtasks:",
    testReq.required.flatMap((r) => r.subtaskIds).length
  );
}
```

**Expected Output**:

```
Job Titles: 3
Grades: 5
Requirements: 15
Test Requirement (pr-field-gc7): {id: 'pr-field-gc7', jobTitleId: 'job-field-operator', ...}
  Job Title ID: job-field-operator
  Grade ID: grade-gc7
  Tasks: 1
  Subtasks: 3
```

---

## 📞 **Still Having Issues?**

**Send me the console output showing**:

1. The "=== PROMOTION MATRIX DEBUG ===" section
2. Any "Checking:" lines that say "NOT FOUND"
3. Any error messages
4. Screenshot of the matrix page

I'll be able to identify the exact issue immediately! 🎯

---

## ✅ **Expected Final State**

When everything works:

- ✅ Summary shows: 3 Job Titles, 5 Grades, 15 Configured, 15 Total, 100% Coverage
- ✅ Matrix shows 15 "✓ Configured" cells (green checkmarks)
- ✅ Clicking any configured cell opens modal with tasks pre-selected
- ✅ Clicking "+ Configure" opens empty modal
- ✅ Can edit and save requirements
- ✅ No console errors

**The matrix should be fully functional!** 🚀
