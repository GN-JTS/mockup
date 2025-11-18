# 🔍 Debugging Guide - Training Manager Issues

## 🚨 **Reported Issues**

1. ❌ Job title and grade not shown in dashboard
2. ❌ Available Promotion Options not shown in assignment page
3. ❌ Configure matrix doesn't retrieve data

---

## ✅ **Debug Logging Added**

I've added comprehensive console logging to help identify the issues. Follow these steps:

### **Step 1: Start Dev Server**

```bash
cd /Volumes/DATA/Work/JTS/Mockups/jts-mockup
npm run dev
```

### **Step 2: Open Browser Console**

1. Open `http://localhost:5173` in browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to **Console** tab

### **Step 3: Login as Training Manager**

```
Email: lisa.training@jts.com
Password: password
```

---

## 📊 **What to Check in Console**

### **Dashboard Debug Output**

When the dashboard loads, you should see:

```
=== TRAINING MANAGER DASHBOARD DEBUG ===
Scoped Employees: 8
Job Titles: 3
Grades: 5
Sample Employee: {id: 'user-13', name: 'Alex Employee', jobTitleId: 'job-field-operator', gradeId: 'grade-gc6', ...}
Sample Job Title Match: {id: 'job-field-operator', name: 'Field Operator'}
Sample Grade Match: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
========================================
```

**❌ If you see:**

- `Job Titles: 0` → Job titles not loading
- `Grades: 0` → Grades not loading
- `Sample Job Title Match: undefined` → ID mismatch
- `Sample Grade Match: undefined` → ID mismatch

---

### **Assignment Page Debug Output**

Click "Assign" on any employee, you should see:

```
=== ASSIGNMENT PAGE DEBUG ===
Employee: {id: 'user-17', name: 'Sarah Johnson', jobTitleId: 'job-field-operator', gradeId: 'grade-gc6', ...}
Current Job Title: {id: 'job-field-operator', name: 'Field Operator'}
Current Grade: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
All Job Titles: (3) [{...}, {...}, {...}]
All Grades: (5) [{...}, {...}, {...}, {...}, {...}]
Promotion Requirements: (11) [{...}, {...}, ...]
============================

=== CALCULATING AVAILABLE OPTIONS ===
Current Grade: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
Employee Job Title ID: job-field-operator
Promotion Requirements Count: 11

Checking req pr-field-gc6: jobTitle=job-field-operator, grade=grade-gc6, targetGrade= {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
  → Same job title, level 6 > 6? false

Checking req pr-field-gc7: jobTitle=job-field-operator, grade=grade-gc7, targetGrade= {id: 'grade-gc7', name: 'GC7', levelIndex: 7}
  → Same job title, level 7 > 6? true

...

Final available options: (4) [{requirement: {...}, jobTitle: {...}, grade: {...}, taskCount: 1, subtaskCount: 3}, ...]
=====================================
```

**❌ If you see:**

- `Current Job Title: null` → Job title not found (ID mismatch)
- `Current Grade: null` → Grade not found (ID mismatch)
- `Promotion Requirements Count: 0` → Requirements not loading
- `Final available options: (0) []` → No valid options (check filter logic)

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: Job Title/Grade Shows "N/A"**

**Possible Causes:**

1. Employee has wrong `jobTitleId` or `gradeId`
2. Job Title or Grade doesn't exist in mock data
3. ID mismatch (typo in IDs)

**Check:**

```javascript
// In console
console.log(
  "Employees:",
  mockUsers.filter((u) => u.role === "employee")
);
console.log("Job Titles:", mockJobTitles);
console.log("Grades:", mockGrades);
```

**Expected IDs:**

- Job Titles: `job-field-operator`, `job-console-operator`, `job-shift-supervisor`
- Grades: `grade-gc6`, `grade-gc7`, `grade-gc8`, `grade-gc9`, `grade-gc10`

---

### **Issue 2: No Available Promotion Options**

**Possible Causes:**

1. `currentGrade` is null/undefined
2. Promotion Requirements have wrong IDs
3. No requirements match employee's job title/grade progression

**Check in Console:**

- Does `Current Grade` have a value?
- Does `Promotion Requirements Count` > 0?
- Do any requirements match the employee's job title?

**Example Fix:**
If you see `pr-field-gc7` but employee has `job-field-operator` and it doesn't match, the IDs are misaligned.

---

### **Issue 3: Promotion Requirements Not Loading**

**Possible Causes:**

1. API method `getPromotionRequirements()` failing
2. Mock data file not imported correctly
3. Empty promotionRequirements array

**Check:**

```javascript
// In browser console
fetch("/src/mock/data/promotionRequirements.ts")
  .then((r) => r.text())
  .then(console.log);
```

Or check directly:

```typescript
// In code
console.log("Raw requirements:", mockPromotionRequirements);
```

---

## 📋 **Verification Checklist**

### **Data Integrity Check**

Run these in browser console after page loads:

```javascript
// 1. Check if mock data is loaded
console.log("Users loaded:", window.mockUsers?.length || "NOT LOADED");
console.log("Job Titles loaded:", window.mockJobTitles?.length || "NOT LOADED");
console.log("Grades loaded:", window.mockGrades?.length || "NOT LOADED");
console.log(
  "Requirements loaded:",
  window.mockPromotionRequirements?.length || "NOT LOADED"
);

// 2. Check ID matches
const testEmployee = mockUsers.find((u) => u.id === "user-13");
const testJobTitle = mockJobTitles.find(
  (jt) => jt.id === testEmployee.jobTitleId
);
const testGrade = mockGrades.find((g) => g.id === testEmployee.gradeId);

console.log("Test Employee:", testEmployee?.name);
console.log("  Job Title ID:", testEmployee?.jobTitleId);
console.log("  Job Title Found:", testJobTitle?.name || "NOT FOUND");
console.log("  Grade ID:", testEmployee?.gradeId);
console.log("  Grade Found:", testGrade?.name || "NOT FOUND");

// 3. Check promotion requirements
const testRequirements = mockPromotionRequirements.filter(
  (req) => req.jobTitleId === testEmployee.jobTitleId
);
console.log("Requirements for this job title:", testRequirements.length);
```

---

## 🎯 **Expected Results**

### **Dashboard Should Show:**

| Column           | Expected Value       | If Empty Check          |
| ---------------- | -------------------- | ----------------------- |
| Employee Name    | "Alex Employee"      | User data loaded?       |
| Current Position | "Field Operator"     | Job title ID match?     |
| Grade            | "GC6"                | Grade ID match?         |
| Active Promotion | "Field Operator GC7" | Promotion exists?       |
| Progress         | "33%" or "0%"        | Progress records exist? |

### **Assignment Page Should Show:**

**Current Position Section:**

- Employee: Sarah Johnson ✅
- Job Title: Field Operator ✅
- Grade: GC6 ✅

**Available Promotions (for Field Operator GC6):**

- Field Operator GC7 (1 task, 3 subtasks) ✅
- Field Operator GC8 (1 task, 5 subtasks) ✅
- Field Operator GC9 (1 task, 7 subtasks) ✅
- Field Operator GC10 (2 tasks, 9 subtasks) ✅

---

## 🚀 **Quick Fixes**

### **If Job Titles/Grades Don't Show**

**Check file:** `src/mock/data/users.ts`

```typescript
// Make sure employees have correct IDs
{
  id: "user-13",
  name: "Alex Employee",
  jobTitleId: "job-field-operator", // Must match jobTitles.ts
  gradeId: "grade-gc6",              // Must match grades.ts
}
```

**Check file:** `src/mock/data/jobTitles.ts`

```typescript
{
  id: "job-field-operator", // Must match user's jobTitleId
  name: "Field Operator"
}
```

### **If Promotion Options Don't Show**

**Check file:** `src/mock/data/promotionRequirements.ts`

```typescript
{
  id: "pr-field-gc7",
  jobTitleId: "job-field-operator", // Must match
  gradeId: "grade-gc7",              // Must match
  required: [{
    taskId: "task-1",
    subtaskIds: ["subtask-1.1", "subtask-1.2", "subtask-1.3"] // Note: dots not dashes!
  }]
}
```

---

## 📞 **Report Back**

After checking the console, please report:

1. **Dashboard Debug Output:**

   - How many employees loaded?
   - How many job titles/grades?
   - Is sample job title/grade found?

2. **Assignment Page Debug Output:**

   - Is current job title/grade found?
   - How many promotion requirements?
   - How many final available options?

3. **Any Error Messages:**
   - Copy exact error from console
   - Include full stack trace if available

This will help identify exactly where the issue is! 🔍
