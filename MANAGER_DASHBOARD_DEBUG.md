# 🐛 Manager Dashboard - Debugging Guide

## 🎯 **Purpose**

This guide helps diagnose and fix data display issues in the Manager Dashboard.

---

## 📊 **Comprehensive Debugging Added**

### **Console Output When Loading**

When you open the Manager Dashboard, you should see detailed console logs:

```
============================================================
🔵 MANAGER DASHBOARD - Loading Data...
============================================================
📊 Current User: { id: "user-3", name: "Emily Manager", role: "manager", departmentId: "dept-1", ... }
🏢 Manager Department: dept-1
👤 Manager Role: manager

📦 Raw Data Loaded:
  - Users: 22
  - Job Titles: 3
  - Grades: 5
  - Departments: 2
  - Sections: 3
  - Promotions: 10
  - Progress Records: 150+

🔍 Filtering Employees:
  - Manager Department ID: dept-1
  - Total Employees in System: 10
  - Employees in Manager's Department: 9

👥 Sample Managed Employees:
  - Alex Employee (user-13): job-field-operator grade-gc6
  - Maria Employee (user-14): job-console-operator grade-gc7
  - Chris Employee (user-15): job-field-operator grade-gc6

📋 Promotion Analysis:
  - Total Promotions: 10
  - Pending Approval: 3
  - Assigned: 2
  - In Progress: 4
  - Rejected: 1

============================================================
✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals
============================================================
```

### **Approval Tab Debug Output**

When you click "Requests & Approvals" tab:

```
🔔 Approval Tab Debug:
  - Total Promotions: 10
  - Pending Promotions Found: 3
  - Pending: Sarah Johnson (promo-pending-1)
  - Pending: James Brown (promo-pending-2)
  - Pending: Olivia Davis (promo-pending-3)
```

---

## 🔍 **Troubleshooting Steps**

### **Step 1: Check Console Logs**

1. Open Chrome/Firefox DevTools (F12)
2. Go to Console tab
3. Login as Manager: `emily.manager@jts.com`
4. Navigate to Manager Dashboard
5. Look for the debug output above

### **Step 2: Verify Current User**

**Expected Output**:

```
📊 Current User: {
  id: "user-3",
  name: "Emily Manager",
  role: "manager",
  departmentId: "dept-1",
  sectionId: "sec-1"
}
```

**Problem**: If `departmentId` is missing or wrong
**Solution**: Check AuthContext and login function

### **Step 3: Verify Data Loading**

**Expected Output**:

```
📦 Raw Data Loaded:
  - Users: 22
  - Job Titles: 3
  - Grades: 5
  - Departments: 2
  - Sections: 3
  - Promotions: 10
  - Progress Records: 150+
```

**Problem**: If numbers are 0 or very low
**Solution**: Check mock data files are properly exported

### **Step 4: Verify Employee Filtering**

**Expected Output**:

```
🔍 Filtering Employees:
  - Manager Department ID: dept-1
  - Total Employees in System: 10
  - Employees in Manager's Department: 9
```

**Problem**: If "Employees in Manager's Department" is 0
**Solutions**:

1. Check manager's `departmentId` matches employees
2. Check employees have `role: UserRole.EMPLOYEE`
3. Run debug query:

```javascript
mockUsers.filter((u) => u.departmentId === "dept-1" && u.role === "employee");
```

### **Step 5: Check Empty State**

**If you see**:

```
⚠️ NO EMPLOYEES FOUND IN MANAGER'S DEPARTMENT!
🔍 Debugging - All employees by department:
{ "dept-1": 9, "dept-2": 1 }
```

**This means**: Employees exist but filtering failed
**Check**:

1. Manager's departmentId: `currentUser.departmentId`
2. Employees' departmentId values
3. Case sensitivity issues

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: No Data Shown**

**Symptoms**:

- Empty employee table
- No pending approvals
- "No employees found" message

**Debug Checklist**:

```javascript
// Check in console:
console.log("Current User:", currentUser);
console.log("Department ID:", currentUser?.departmentId);
console.log("All Users:", await mockApi.getUsers());
console.log("Promotions:", await mockApi.getEmployeePromotions());
```

**Fixes**:

1. **Manager not logged in correctly**:

   - Re-login as Emily Manager
   - Email: `emily.manager@jts.com`
   - Password: Check mock login

2. **Department mismatch**:

   - Manager's dept: Should be `dept-1`
   - Employees' dept: Should be `dept-1`
   - Check `src/mock/data/users.ts`

3. **Data not loading**:
   - Check mock API calls succeed
   - Check network tab for errors
   - Verify mock data exports

---

### **Issue 2: Approvals Not Showing**

**Symptoms**:

- Tab shows "No pending approval requests"
- But you know there are pending promotions

**Debug Output to Check**:

```
🔔 Approval Tab Debug:
  - Total Promotions: 10
  - Pending Promotions Found: 0  ❌ PROBLEM
```

**Fixes**:

1. **Check promotion status**:

```javascript
// In console:
const promotions = await mockApi.getEmployeePromotions();
const pending = promotions.filter((p) => p.status === "pending_approval");
console.log("Pending:", pending);
```

2. **Check employee association**:

```javascript
// Verify employees are in manager's list
const pending = promotions.filter((p) => p.status === "pending_approval");
pending.forEach((p) => {
  const emp = employees.find((e) => e.id === p.employeeId);
  console.log(`${p.id}: Employee ${emp ? "FOUND" : "NOT FOUND"}`);
});
```

3. **Check mock data**:

- Open `src/mock/data/employeePromotions.ts`
- Verify 3 promotions have `status: "pending_approval"`
- Verify `employeeId` values match employees in dept-1

---

### **Issue 3: Training Manager Name Shows "N/A"**

**Symptoms**:

- Approval cards show "Requested by: N/A"

**Cause**: Training Manager not found in lookup

**Fix Applied**: Changed lookup from `employees` to `allUsers`

**Verify**:

```javascript
// The code now uses:
const trainingManager = allUsers.find((u) => u.id === promotion.assignedBy);

// Instead of:
const trainingManager = employees.find((u) => u.id === promotion.assignedBy);
```

**Why**: Training Managers have role `TRAINING_MANAGER`, not `EMPLOYEE`, so they're not in the `employees` array.

---

## 📋 **Expected Mock Data**

### **Employees in dept-1** (9 total):

| ID      | Name             | Job Title        | Grade | Section |
| ------- | ---------------- | ---------------- | ----- | ------- |
| user-13 | Alex Employee    | Field Operator   | GC6   | sec-1   |
| user-14 | Maria Employee   | Console Operator | GC7   | sec-2   |
| user-15 | Chris Employee   | Field Operator   | GC6   | sec-1   |
| user-17 | Sarah Johnson    | Field Operator   | GC6   | sec-1   |
| user-18 | Michael Chen     | Field Operator   | GC7   | sec-1   |
| user-19 | Emma Wilson      | Console Operator | GC7   | sec-1   |
| user-20 | James Brown      | Field Operator   | GC8   | sec-1   |
| user-21 | Olivia Davis     | Shift Supervisor | GC9   | sec-1   |
| user-22 | William Martinez | Field Operator   | GC6   | sec-1   |

### **Pending Approvals** (3 total):

| ID              | Employee      | Current | Target | Assigned By   |
| --------------- | ------------- | ------- | ------ | ------------- |
| promo-pending-1 | Sarah Johnson | GC6     | GC7    | Lisa Training |
| promo-pending-2 | James Brown   | GC7     | GC8    | Lisa Training |
| promo-pending-3 | Olivia Davis  | GC7     | GC8    | Lisa Training |

---

## 🧪 **Test Scenarios**

### **Test 1: View Employees**

1. Login as Emily Manager
2. Go to Manager Dashboard
3. **Expected**: See Employee Overview tab by default
4. **Expected**: Table with 9 employees
5. **Expected**: Each employee shows:
   - Name, email, avatar
   - Section
   - Current Job Title + Grade
   - Active Promotion (if any)
   - Progress bar
   - Status badge

**If Empty**: Check console for filtering debug output

### **Test 2: View Pending Approvals**

1. Click "Requests & Approvals" tab
2. **Expected**: See badge "(3)" on tab
3. **Expected**: See 3 approval cards:
   - Sarah Johnson → GC7
   - James Brown → GC8
   - Olivia Davis → GC8
4. **Expected**: Each card shows:
   - Employee name with avatar
   - "Requested by: Lisa Training"
   - Current position
   - Target position
   - Request date
   - 3 buttons: Approve, Reject, View Details

**If Empty**: Check console "🔔 Approval Tab Debug" output

### **Test 3: Filter Employees**

1. On Employee Overview tab
2. Try filters:
   - Section: "Control Section"
   - Grade: "GC6"
   - Status: "Pending Approval"
3. **Expected**: Table updates in real-time
4. **Expected**: Only matching employees shown

### **Test 4: Search Employees**

1. Type in search box: "Sarah"
2. **Expected**: Only Sarah Johnson shown
3. Clear search
4. **Expected**: All 9 employees shown again

### **Test 5: View Analytics**

1. Click "Analytics" tab
2. **Expected**: See 4 stat cards:
   - Total Employees: 9
   - Active Promotions: 3
   - Pending Approvals: 3
   - Completed This Month: (varies)
3. **Expected**: See 2 distribution charts:
   - Employees by Grade
   - Employees by Job Title

---

## 🔍 **Quick Diagnostic Commands**

Run these in the browser console:

```javascript
// 1. Check current user
console.log("Current User:", currentUser);

// 2. Check employees in dept-1
const users = await mockApi.getUsers();
const dept1Employees = users.filter(
  (u) => u.departmentId === "dept-1" && u.role === "employee"
);
console.log("Dept-1 Employees:", dept1Employees.length, dept1Employees);

// 3. Check pending promotions
const promotions = await mockApi.getEmployeePromotions();
const pending = promotions.filter((p) => p.status === "pending_approval");
console.log("Pending Promotions:", pending.length, pending);

// 4. Check employees with pending promotions
pending.forEach((p) => {
  const emp = dept1Employees.find((e) => e.id === p.employeeId);
  console.log(`${p.id}:`, emp ? emp.name : "NOT IN DEPT-1");
});

// 5. Check all promotion statuses
const statuses = {};
promotions.forEach((p) => {
  statuses[p.status] = (statuses[p.status] || 0) + 1;
});
console.log("Promotion Statuses:", statuses);
```

---

## ✅ **Success Criteria**

**Manager Dashboard is working correctly if you see**:

✅ Console shows detailed debug output  
✅ "✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals"  
✅ Employee Overview tab shows 9 employees  
✅ Each employee has complete details (no "N/A" or "undefined")  
✅ Requests & Approvals tab shows "(3)" badge  
✅ 3 pending approval cards visible  
✅ Each card shows "Requested by: Lisa Training" (not "N/A")  
✅ Filters and search work correctly  
✅ Analytics tab shows charts with data  
✅ No console errors

---

## 🎯 **Fixes Applied**

### **1. Enhanced Console Logging** ✅

- Added comprehensive debug output
- Shows all data loading steps
- Highlights filtering logic
- Shows sample employees

### **2. Fixed Training Manager Lookup** ✅

- Changed from `employees` to `allUsers`
- Prevents "N/A" for Training Manager names
- Now correctly finds users with any role

### **3. Improved Approval Tab** ✅

- Added debug console logs
- Shows pending promotions count
- Lists each pending employee
- Better empty state message

### **4. Better Error Handling** ✅

- Try-catch with detailed error logging
- Graceful degradation if data fails
- User-friendly empty states

---

## 📞 **Still Having Issues?**

If data still not showing after following this guide:

1. **Clear browser cache** and reload
2. **Check browser console** for JavaScript errors
3. **Verify you're logged in** as Emily Manager
4. **Check network tab** for failed API calls
5. **Review mock data files** for correct IDs and statuses
6. **Copy console output** and share for analysis

---

## 🎉 **Expected Result**

After fixes, the Manager Dashboard should display:

- ✅ Full employee list with details
- ✅ 3 pending approval requests
- ✅ Complete employee information (no "N/A")
- ✅ Training Manager names visible
- ✅ Filters and search functional
- ✅ Analytics charts populated
- ✅ All tabs working correctly

**The Manager Dashboard is now fully functional with comprehensive debugging!** 🏢📊✅
