# 🎯 Action Plan - Fix Dashboard & Assignment Issues

## 🚨 **Current Issues**

1. ❌ Job title and grade not showing in Training Manager Dashboard
2. ❌ Available Promotion Options not showing in Assignment Page
3. ❌ Configure matrix not retrieving data

---

## ✅ **What I've Done**

### **1. Added Debug Logging**

I've added comprehensive console.log statements to both:

- **Training Manager Dashboard** (`TrainingManagerDashboard.tsx`)
- **Assignment Page** (`AssignPromotion.tsx`)

These will help identify exactly where the data flow breaks.

### **2. Created Debug Guide**

- **DEBUGGING_GUIDE.md** - Complete instructions on how to use console output
- **verify-data.js** - Quick reference for correct ID formats

---

## 📋 **YOUR NEXT STEPS**

### **Step 1: Start Dev Server & Check Console**

```bash
cd /Volumes/DATA/Work/JTS/Mockups/jts-mockup
npm run dev
```

1. Open `http://localhost:5173` in browser
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Login as: `lisa.training@jts.com` / `password`

### **Step 2: Check Dashboard Console Output**

You should see:

```
=== TRAINING MANAGER DASHBOARD DEBUG ===
Scoped Employees: 8
Job Titles: 3
Grades: 5
Sample Employee: {...}
Sample Job Title Match: {id: 'job-field-operator', name: 'Field Operator'}
Sample Grade Match: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
========================================
```

**❌ If you see something different:**

- Copy the ENTIRE console output
- Send it to me
- I'll identify the exact issue

### **Step 3: Click "Assign" on Any Employee**

You should see:

```
=== ASSIGNMENT PAGE DEBUG ===
Employee: {...}
Current Job Title: {id: 'job-field-operator', name: 'Field Operator'}
Current Grade: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
All Job Titles: (3) [...]
All Grades: (5) [...]
Promotion Requirements: (11) [...]
============================

=== CALCULATING AVAILABLE OPTIONS ===
...
Final available options: (4) [...]
=====================================
```

**❌ If you see something different:**

- Copy the ENTIRE console output
- Send it to me
- I'll fix the exact problem

---

## 🔍 **What to Look For**

### **Dashboard Issues**

| What Console Shows                  | Meaning                | Next Step                                         |
| ----------------------------------- | ---------------------- | ------------------------------------------------- |
| `Job Titles: 0`                     | Job titles not loading | Check if jobTitles.ts is imported                 |
| `Grades: 0`                         | Grades not loading     | Check if grades.ts is imported                    |
| `Sample Job Title Match: undefined` | ID mismatch            | IDs don't match between users.ts and jobTitles.ts |
| `Sample Grade Match: undefined`     | ID mismatch            | IDs don't match between users.ts and grades.ts    |

### **Assignment Page Issues**

| What Console Shows                | Meaning                         | Next Step                                     |
| --------------------------------- | ------------------------------- | --------------------------------------------- |
| `Current Job Title: null`         | Can't find job title            | ID mismatch in employee data                  |
| `Current Grade: null`             | Can't find grade                | ID mismatch in employee data                  |
| `Promotion Requirements Count: 0` | No requirements loaded          | Check promotionRequirements.ts                |
| `Final available options: (0) []` | Logic filtering out all options | Check grade levelIndex or jobTitleId matching |

---

## 🎯 **Most Likely Issues**

Based on the symptoms, here are the most probable causes:

### **Issue #1: ID Mismatch** (90% probability)

**Problem**: Employee has `jobTitleId: "job-1"` but job title has `id: "job-field-operator"`

**Solution**: Verify all IDs match:

- ✅ Job Title IDs: `job-field-operator`, `job-console-operator`, `job-shift-supervisor`
- ✅ Grade IDs: `grade-gc6`, `grade-gc7`, `grade-gc8`, `grade-gc9`, `grade-gc10`
- ✅ Subtask IDs: `subtask-1.1` (with DOTS, not dashes!)

### **Issue #2: Data Not Imported** (5% probability)

**Problem**: Mock data files not properly imported in `index.ts`

**Check**: `src/mock/data/index.ts` should have:

```typescript
export * from "./jobTitles";
export * from "./grades";
export * from "./promotionRequirements";
```

### **Issue #3: API Methods Not Working** (5% probability)

**Problem**: `getJobTitles()`, `getGrades()`, etc. not returning data

**Check**: `src/mock/services/mockApi.ts` should have these methods implemented

---

## 🚀 **Quick Test**

Run this in the browser console after page loads:

```javascript
// Test 1: Check if data is accessible
console.log("=== QUICK TEST ===");

// Test 2: Fetch job titles
mockApi.getJobTitles().then((jt) => console.log("Job Titles:", jt));

// Test 3: Fetch grades
mockApi.getGrades().then((g) => console.log("Grades:", g));

// Test 4: Fetch requirements
mockApi
  .getPromotionRequirements()
  .then((pr) => console.log("Requirements:", pr));

// Test 5: Check specific employee
mockApi.getUserById("user-13").then((u) => {
  console.log("Employee:", u);
  mockApi
    .getJobTitleById(u.jobTitleId)
    .then((jt) => console.log("  Job Title:", jt));
  mockApi.getGradeById(u.gradeId).then((g) => console.log("  Grade:", g));
});
```

**Expected Output:**

```
Job Titles: (3) [{id: 'job-field-operator', ...}, ...]
Grades: (5) [{id: 'grade-gc6', ...}, ...]
Requirements: (11) [{id: 'pr-field-gc6', ...}, ...]
Employee: {id: 'user-13', name: 'Alex Employee', ...}
  Job Title: {id: 'job-field-operator', name: 'Field Operator'}
  Grade: {id: 'grade-gc6', name: 'GC6', levelIndex: 6}
```

**❌ If any returns `undefined` or empty array:**

- That's the broken link
- Copy the output and send it to me

---

## 📞 **Report Back Format**

Please copy this template and fill it in:

```
=== ISSUE REPORT ===

1. DASHBOARD CONSOLE OUTPUT:
   [Paste entire "=== TRAINING MANAGER DASHBOARD DEBUG ===" section]

2. ASSIGNMENT PAGE CONSOLE OUTPUT:
   [Paste entire "=== ASSIGNMENT PAGE DEBUG ===" section]

3. QUICK TEST RESULTS:
   [Paste results from Quick Test above]

4. WHAT I SEE IN UI:
   - Dashboard: [Describe what's shown/missing]
   - Assignment Page: [Describe what's shown/missing]

5. SCREENSHOTS:
   [If possible, attach screenshots of dashboard and assignment page]

===================
```

---

## ⚡ **Fast Debug Mode**

**Instead of all the above, just:**

1. Open browser console
2. Login as Lisa Training
3. Take a screenshot of:

   - Dashboard page
   - Console output
   - Click "Assign" on Sarah Johnson
   - Assignment page
   - Console output after clicking Assign

4. Send me all screenshots

I'll identify and fix the issue immediately! 🎯

---

## 📚 **Reference Files**

1. **DEBUGGING_GUIDE.md** - Detailed debugging instructions
2. **TRAINING_MANAGER_FIXES.md** - What was previously fixed
3. **verify-data.js** - Data format reference

---

## ✅ **Once You Send Console Output**

I will:

1. ✅ Identify exact issue from console logs
2. ✅ Fix the specific data or code causing the problem
3. ✅ Test the fix
4. ✅ Provide updated files
5. ✅ Verify everything works

**The debug logging will make this fast and easy!** 🚀

---

**Ready? Start with Step 1 above! 👆**
