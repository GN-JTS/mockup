# 🧪 Promotion Matrix - Testing Guide

## ✅ **Enhanced Debug Logging Added**

I've added comprehensive logging to help identify exactly why configurations aren't showing.

---

## 🔍 **What to Do NOW**

### **Step 1: Start Dev Server**

```bash
cd /Volumes/DATA/Work/JTS/Mockups/jts-mockup
npm run dev
```

### **Step 2: Open Matrix Page**

Navigate to: `/admin/promotion-requirements`

### **Step 3: Open Browser Console**

**Press F12** → Go to **Console** tab

---

## 📊 **What You'll See in Console**

### **1. Initial Data Load**

```
=== PROMOTION MATRIX DEBUG ===
Job Titles: (3) [...]
Grades: (5) [...]
Tasks: (2) [...]
Subtasks: (17) [...]
Requirements: (15) [...]

Requirement IDs:
  pr-field-gc6: job-field-operator + grade-gc6 = 1 tasks
  pr-field-gc7: job-field-operator + grade-gc7 = 1 tasks
  pr-field-gc8: job-field-operator + grade-gc8 = 1 tasks
  pr-field-gc9: job-field-operator + grade-gc9 = 1 tasks
  pr-field-gc10: job-field-operator + grade-gc10 = 2 tasks
  pr-console-gc7: job-console-operator + grade-gc7 = 1 tasks
  pr-console-gc8: job-console-operator + grade-gc8 = 1 tasks
  pr-console-gc9: job-console-operator + grade-gc9 = 1 tasks
  pr-console-gc10: job-console-operator + grade-gc10 = 2 tasks
  pr-supervisor-gc9: job-shift-supervisor + grade-gc9 = 2 tasks
  pr-supervisor-gc10: job-shift-supervisor + grade-gc10 = 2 tasks
  ...
============================
```

**✅ Expected**: Should show 15 requirements with correct IDs

**❌ If you see**: `Requirements: (0) []` → Requirements not loading!

---

### **2. Before Rendering Matrix**

```
📊 RENDERING MATRIX with data:
   Job Titles: 3 ['job-field-operator', 'job-console-operator', 'job-shift-supervisor']
   Grades: 5 ['grade-gc6', 'grade-gc7', 'grade-gc8', 'grade-gc9', 'grade-gc10']
   Requirements: 15 ['job-field-operator+grade-gc6', 'job-field-operator+grade-gc7', ...]
```

**✅ Expected**: Job Titles=3, Grades=5, Requirements=15

**❌ If you see**: Requirements=0 → Data lost between load and render!

---

### **3. Cell Matching Checks**

For EACH cell in the matrix, you'll see:

```
🔍 Looking for: jobTitleId="job-field-operator", gradeId="grade-gc6"
   Requirements array length: 15
   ✅ FOUND: pr-field-gc6
```

**✅ Expected**: See "✅ FOUND" for 15 cells

**❌ If you see**:

```
🔍 Looking for: jobTitleId="job-field-operator", gradeId="grade-gc7"
   Requirements array length: 15
   ❌ NOT FOUND
   Available for job-field-operator: ['grade-gc6', 'grade-gc8', 'grade-gc9', 'grade-gc10']
```

This means the requirement exists but with DIFFERENT ID!

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Requirements array is empty (length: 0)**

**Console shows**:

```
Requirements: (0) []
```

**Cause**: Mock data not exported or not loading

**Fix**:

1. Check `src/mock/data/index.ts` has:

   ```typescript
   export * from "./promotionRequirements";
   ```

2. Check `src/mock/data/promotionRequirements.ts` exists and has:

   ```typescript
   export const mockPromotionRequirements: PromotionRequirement[] = [...]
   ```

3. Restart dev server: `npm run dev`

---

### **Issue 2: IDs Don't Match**

**Console shows**:

```
🔍 Looking for: jobTitleId="job-field-operator", gradeId="grade-gc7"
   ❌ NOT FOUND
   Available for job-field-operator: ['gc7', 'gc8', 'gc9']
```

**Notice**: Looking for `grade-gc7` but available shows `gc7` (missing "grade-" prefix)

**Cause**: ID mismatch in `promotionRequirements.ts`

**Fix**: Update `promotionRequirements.ts` to use correct IDs:

```typescript
{
  id: "pr-field-gc7",
  jobTitleId: "job-field-operator",  // ✅ Correct
  gradeId: "grade-gc7",              // ✅ Must have "grade-" prefix
  required: [...]
}
```

---

### **Issue 3: Data Loads But Lost Before Render**

**Console shows**:

```
=== PROMOTION MATRIX DEBUG ===
Requirements: (15) [...]  // ✅ Has data

📊 RENDERING MATRIX with data:
   Requirements: 0 []      // ❌ Lost data!
```

**Cause**: State not updating properly

**Fix**: Check React state in component - requirements might not be set correctly

---

## 📸 **Send Me This Info**

If it's still not working, **copy and paste** from console:

### **1. Initial Load Section**

```
=== PROMOTION MATRIX DEBUG ===
[PASTE EVERYTHING HERE]
============================
```

### **2. Rendering Section**

```
📊 RENDERING MATRIX with data:
[PASTE EVERYTHING HERE]
```

### **3. First Few Cell Checks**

```
🔍 Looking for: jobTitleId="...", gradeId="..."
[PASTE 3-4 EXAMPLES HERE]
```

### **4. Screenshot**

Take a screenshot showing:

- The matrix page
- The browser console with logs

---

## ✅ **Expected Successful Output**

### **Console Should Show**:

```
=== PROMOTION MATRIX DEBUG ===
Job Titles: (3) [...]
Grades: (5) [...]
Requirements: (15) [...]

Requirement IDs:
  pr-field-gc6: job-field-operator + grade-gc6 = 1 tasks
  pr-field-gc7: job-field-operator + grade-gc7 = 1 tasks
  [... 13 more ...]
============================

📊 RENDERING MATRIX with data:
   Job Titles: 3 ['job-field-operator', 'job-console-operator', 'job-shift-supervisor']
   Grades: 5 ['grade-gc6', 'grade-gc7', 'grade-gc8', 'grade-gc9', 'grade-gc10']
   Requirements: 15 ['job-field-operator+grade-gc6', ...]

🔍 Looking for: jobTitleId="job-field-operator", gradeId="grade-gc6"
   Requirements array length: 15
   ✅ FOUND: pr-field-gc6

🔍 Looking for: jobTitleId="job-field-operator", gradeId="grade-gc7"
   Requirements array length: 15
   ✅ FOUND: pr-field-gc7

[... 13 more "✅ FOUND" messages ...]
```

### **Matrix Page Should Show**:

- Summary: **3** Job Titles, **5** Grades, **15** Configured, **15** Total, **100%** Coverage
- Matrix with **15 green checkmarks** showing "✓ Configured"
- Each configured cell shows task/subtask counts

---

## 🎯 **The Logs Will Tell Us EXACTLY:**

1. ✅ Is data loading? (Check Requirements count)
2. ✅ Is data persisting to render? (Check both load and render logs)
3. ✅ Are IDs matching? (Check "✅ FOUND" vs "❌ NOT FOUND")
4. ✅ What IDs are we using? (Check "Available for..." messages)

**With these logs, I can fix the issue in seconds!** 🚀

---

## 📞 **Next Step**

1. Open the page
2. Copy console output
3. Send it to me
4. I'll identify and fix the exact issue!
