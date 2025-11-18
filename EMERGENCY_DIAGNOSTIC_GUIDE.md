# 🚨 Emergency Diagnostic Guide - Manager Dashboard Shows No Data

## ⚠️ **Problem**

Manager Dashboard shows:

- ❌ No employees
- ❌ No requests/approvals
- ❌ No role assignments
- ❌ No analytics data

---

## 🔍 **Immediate Diagnostic Steps**

### **Step 1: Check Browser Console (MOST IMPORTANT)**

1. Press **F12** or **Cmd+Option+I** (Mac)
2. Go to **Console** tab
3. Look for one of these messages:

#### **Scenario A: See "❌ CRITICAL: currentUser is null/undefined!"**

```
❌ CRITICAL: currentUser is null/undefined!
Cannot load Manager Dashboard without logged-in user
```

**Problem**: User not logged in  
**Solution**:

1. Go back to login page
2. Login as `emily.manager@jts.com`
3. Check AuthContext is working

---

#### **Scenario B: See "⚠️ NO EMPLOYEES FOUND IN MANAGER'S DEPARTMENT!"**

```
🔍 Filtering Employees:
  - Manager Department ID: dept-1
  - Total Employees in System: 10
  - Employees in Manager's Department: 0
⚠️ NO EMPLOYEES FOUND IN MANAGER'S DEPARTMENT!
```

**Problem**: Department filtering mismatch  
**Solution**: Check Step 2 below

---

#### **Scenario C: See successful load but still no data**

```
✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals
```

**Problem**: React state not updating or rendering issue  
**Solution**: Check Step 3 below

---

#### **Scenario D: No console output at all**

**Problem**: Dashboard not loading or JavaScript error  
**Solution**:

1. Check for red JavaScript errors in console
2. Look for build/compile errors
3. Refresh page with **Ctrl+Shift+R** (hard refresh)

---

### **Step 2: Check Current User Data**

Run this in **Browser Console**:

```javascript
// Check current user
console.log("Current User:", currentUser);
```

**Expected Output**:

```javascript
{
  id: "user-3",
  name: "Emily Manager",
  role: "manager",
  departmentId: "dept-1",  // ← THIS IS CRITICAL
  sectionId: "sec-1",
  jobTitleId: "job-shift-supervisor",
  gradeId: "grade-gc9"
}
```

**If departmentId is missing or wrong**:

1. Check `/src/mock/data/users.ts` - verify Emily Manager has `departmentId: "dept-1"`
2. Check AuthContext - ensure login preserves all user fields
3. Try logging out and back in

---

### **Step 3: Run Diagnostic Test**

Run this command in **Browser Console**:

```javascript
// Import and run test
import { testManagerDashboardData } from "./src/utils/testManagerData.ts";
testManagerDashboardData();
```

Or if that doesn't work, run these commands manually:

```javascript
// 1. Check all users
const users = await mockApi.getUsers();
console.log("Total users:", users.length);

// 2. Check employees
const employees = users.filter((u) => u.role === "employee");
console.log("Total employees:", employees.length);

// 3. Check dept-1 employees
const dept1Employees = employees.filter((u) => u.departmentId === "dept-1");
console.log("Dept-1 employees:", dept1Employees.length);
dept1Employees.forEach((e) => console.log(`  - ${e.name} (${e.id})`));

// 4. Check promotions
const promotions = await mockApi.getEmployeePromotions();
console.log("Total promotions:", promotions.length);

// 5. Check pending promotions
const pending = promotions.filter((p) => p.status === "pending_approval");
console.log("Pending promotions:", pending.length);
pending.forEach((p) => {
  const emp = employees.find((e) => e.id === p.employeeId);
  console.log(`  - ${emp?.name || p.employeeId}`);
});
```

**Expected Results**:

```
Total users: 22
Total employees: 10
Dept-1 employees: 9
  - Alex Employee (user-13)
  - Maria Employee (user-14)
  - Chris Employee (user-15)
  - Sarah Johnson (user-17)
  - Michael Chen (user-18)
  - Emma Wilson (user-19)
  - James Brown (user-20)
  - Olivia Davis (user-21)
  - William Martinez (user-22)
Total promotions: 10
Pending promotions: 3
  - Sarah Johnson
  - James Brown
  - Olivia Davis
```

---

### **Step 4: Check Mock Data Files**

Verify these files exist and have data:

#### **1. `/src/mock/data/users.ts`**

Check Emily Manager (user-3):

```typescript
{
  id: "user-3",
  name: "Emily Manager",
  email: "emily.manager@jts.com",
  role: UserRole.MANAGER,
  departmentId: "dept-1", // ← MUST BE dept-1
  sectionId: "sec-1",
  jobTitleId: "job-shift-supervisor",
  gradeId: "grade-gc9",
}
```

Check employees have `departmentId: "dept-1"`:

```typescript
{
  id: "user-13",
  name: "Alex Employee",
  role: UserRole.EMPLOYEE,
  departmentId: "dept-1", // ← MUST MATCH MANAGER
  // ...
}
```

#### **2. `/src/mock/data/employeePromotions.ts`**

Check for 3 pending promotions:

```typescript
{
  id: "promo-pending-1",
  employeeId: "user-17", // Sarah Johnson
  status: "pending_approval", // ← MUST BE pending_approval
  // ...
}
```

---

### **Step 5: Check Network/API Calls**

1. Open **Network** tab in DevTools
2. Reload page
3. Look for failed requests (red entries)
4. Check if mock API calls are working

---

## 🔧 **Common Fixes**

### **Fix 1: Clear Browser Cache**

```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear cache manually:
# Chrome: Settings > Privacy > Clear browsing data
# Firefox: Settings > Privacy & Security > Cookies and Site Data
```

### **Fix 2: Restart Dev Server**

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd jts-mockup
npm run dev
```

### **Fix 3: Check Mock Data Exports**

Verify `/src/mock/data/index.ts` exports everything:

```typescript
export { mockUsers } from "./users";
export { mockEmployeePromotions } from "./employeePromotions";
export { mockJobTitles } from "./jobTitles";
export { mockGrades } from "./grades";
// etc...
```

### **Fix 4: Verify Mock API**

Check `/src/mock/services/mockApi.ts` has methods:

```typescript
async getUsers() {
  await delay(500);
  return [...mockUsers];
},

async getEmployeePromotions() {
  await delay(500);
  return [...mockEmployeePromotions];
},
```

---

## 📊 **Visual Diagnostic on Page**

If Manager Dashboard loads with no data, you should see:

```
┌─────────────────────────────────────────┐
│  ❌  No Data Loaded                     │
│                                          │
│  The Manager Dashboard couldn't load    │
│  any employee data.                     │
│                                          │
│  🔍 Diagnostic Information              │
│  Current User: Emily Manager            │
│  Department ID: dept-1                  │
│  Role: manager                          │
│  Employees Found: 0  ← PROBLEM          │
│  Promotions Found: 10                   │
│                                          │
│  🛠️ Troubleshooting Steps              │
│  1. Open browser console (F12)          │
│  2. Look for debug output               │
│  3. Verify you're logged in             │
│  4. Check mock data files               │
│  5. Refresh and check logs              │
│                                          │
│  [Try Reload Data]  [Return to Login]  │
└─────────────────────────────────────────┘
```

Click **"Try Reload Data"** to retry loading.

---

## 🎯 **Expected Console Output**

When everything works correctly, you should see:

```
============================================================
🔵 MANAGER DASHBOARD - Loading Data...
============================================================
📊 Current User: {id: 'user-3', name: 'Emily Manager', role: 'manager', departmentId: 'dept-1'}
🏢 Manager Department: dept-1
👤 Manager Role: manager

📦 Raw Data Loaded:
  - Users: 22
  - Job Titles: 3
  - Grades: 5
  - Departments: 2
  - Sections: 3
  - Promotions: 10
  - Progress Records: 420

🔍 Filtering Employees:
  - Manager Department ID: dept-1
  - Total Employees in System: 10
  - Employees in Manager's Department: 9  ← SHOULD BE 9

👥 Sample Managed Employees:
  - Alex Employee (user-13): job-field-operator grade-gc6
  - Maria Employee (user-14): job-console-operator grade-gc7
  - Chris Employee (user-15): job-field-operator grade-gc6

📋 Promotion Analysis:
  - Total Promotions: 10
  - Pending Approval: 3  ← SHOULD BE 3
  - Assigned: 2
  - In Progress: 4
  - Rejected: 1

============================================================
✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals
============================================================
```

---

## 📞 **Still Not Working?**

### **Checklist**:

- [ ] Browser console is open (F12)
- [ ] Logged in as emily.manager@jts.com
- [ ] Hard refreshed page (Ctrl+Shift+R)
- [ ] Checked console for errors
- [ ] Ran diagnostic commands
- [ ] Verified mock data files exist
- [ ] Restarted dev server
- [ ] Cleared browser cache

### **Next Steps**:

1. **Copy full console output** (all messages)
2. **Take screenshot** of the no-data screen
3. **Check these specific things**:

   - Does `/src/mock/data/users.ts` exist?
   - Does Emily Manager (user-3) have `departmentId: "dept-1"`?
   - Do 9 employees have `departmentId: "dept-1"`?
   - Are there 3 promotions with `status: "pending_approval"`?

4. **Try these commands in console**:

```javascript
// Check if files are loading
import * as users from "./src/mock/data/users.ts";
console.log("Users file:", users);

import * as promotions from "./src/mock/data/employeePromotions.ts";
console.log("Promotions file:", promotions);
```

---

## 🎉 **Success Criteria**

Dashboard is working correctly when you see:

✅ Employee Overview shows 9 employees  
✅ Requests & Approvals shows badge "(3)"  
✅ 3 approval cards visible  
✅ All employee names and details shown (no "N/A" or "undefined")  
✅ Analytics shows charts with data  
✅ Console shows "✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals"  
✅ No red errors in console

---

## 🔑 **Quick Copy-Paste Diagnostic**

Run this all at once in browser console:

```javascript
console.log("=== MANAGER DASHBOARD DIAGNOSTIC ===");
console.log("1. Current User:", currentUser);
console.log("2. Department ID:", currentUser?.departmentId);

mockApi.getUsers().then((users) => {
  const employees = users.filter((u) => u.role === "employee");
  const dept1 = employees.filter((u) => u.departmentId === "dept-1");
  console.log("3. Total employees:", employees.length);
  console.log("4. Dept-1 employees:", dept1.length);
  if (dept1.length > 0) {
    console.log("5. Dept-1 employee names:");
    dept1.forEach((e) => console.log(`   - ${e.name}`));
  }
});

mockApi.getEmployeePromotions().then((proms) => {
  const pending = proms.filter((p) => p.status === "pending_approval");
  console.log("6. Total promotions:", proms.length);
  console.log("7. Pending approvals:", pending.length);
  if (pending.length > 0) {
    console.log("8. Pending promotion IDs:");
    pending.forEach((p) => console.log(`   - ${p.id}`));
  }
});

console.log("=== END DIAGNOSTIC ===");
```

Expected output should show 9 employees and 3 pending approvals.

---

**If you see different numbers, that's where the problem is!** 🎯
