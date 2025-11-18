# ⚡ Quick Fix - Manager Dashboard Shows No Data

## 🎯 **THE FASTEST WAY TO FIX THIS**

### **Step 1: Open Browser Console (F12)**

Look for THIS message:

```
❌ CRITICAL: currentUser is null/undefined!
```

If you see this → **YOU'RE NOT LOGGED IN**

**Fix**:

1. Go to `/login`
2. Login as: `emily.manager@jts.com`
3. Password: (whatever is set in your mock login)

---

### **Step 2: Check Console for Loading Message**

You should see:

```
============================================================
🔵 MANAGER DASHBOARD - Loading Data...
============================================================
```

**If you DON'T see this** → Dashboard not loading at all

**Fix**:

1. Check for JavaScript errors (red text in console)
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Restart dev server: `npm run dev`

---

### **Step 3: Check Employee Count**

Look for this line in console:

```
🔍 Filtering Employees:
  - Employees in Manager's Department: 9  ← SHOULD BE 9
```

**If it says 0** → Department mismatch problem

**Fix**: Run this in console:

```javascript
// Check manager's department
console.log("Manager dept:", currentUser?.departmentId);

// Check employees
mockApi.getUsers().then((users) => {
  const employees = users.filter((u) => u.role === "employee");
  console.log("All employees by department:");
  employees.forEach((e) => {
    console.log(`  ${e.name}: dept="${e.departmentId}"`);
  });
});
```

If Emily Manager's `departmentId` is NOT "dept-1", that's the problem.

---

### **Step 4: Verify Pending Promotions**

Look for:

```
📋 Promotion Analysis:
  - Pending Approval: 3  ← SHOULD BE 3
```

**If it says 0** → No pending promotions found

**Fix**: Check `/src/mock/data/employeePromotions.ts`

Should have 3 promotions with:

```typescript
status: "pending_approval";
```

---

## 🚀 **ONE-LINE DIAGNOSTIC**

Copy and paste this into browser console:

```javascript
console.log("USER:", currentUser?.name, "DEPT:", currentUser?.departmentId);
mockApi
  .getUsers()
  .then((u) =>
    console.log(
      "EMPLOYEES IN DEPT-1:",
      u.filter((x) => x.role === "employee" && x.departmentId === "dept-1")
        .length
    )
  );
mockApi
  .getEmployeePromotions()
  .then((p) =>
    console.log(
      "PENDING:",
      p.filter((x) => x.status === "pending_approval").length
    )
  );
```

**Expected Output**:

```
USER: Emily Manager DEPT: dept-1
EMPLOYEES IN DEPT-1: 9
PENDING: 3
```

**If you see different numbers → THAT'S THE PROBLEM!**

---

## 🔧 **Quick Fixes**

### **Fix #1: Not Logged In**

```
Problem: currentUser is null
Solution: Go to /login and login as emily.manager@jts.com
```

### **Fix #2: Wrong Department**

```
Problem: Manager dept is not "dept-1"
Solution: Check /src/mock/data/users.ts
Verify user-3 (Emily Manager) has: departmentId: "dept-1"
```

### **Fix #3: No Employees**

```
Problem: EMPLOYEES IN DEPT-1: 0
Solution: Check /src/mock/data/users.ts
Verify 9 employees have: departmentId: "dept-1" AND role: UserRole.EMPLOYEE
```

### **Fix #4: No Pending Promotions**

```
Problem: PENDING: 0
Solution: Check /src/mock/data/employeePromotions.ts
Verify 3 promotions have: status: "pending_approval"
```

### **Fix #5: Data Not Loading**

```
Problem: No console output at all
Solution:
1. Check for red JavaScript errors
2. Hard refresh (Ctrl+Shift+R)
3. Restart: npm run dev
4. Clear browser cache
```

---

## 📊 **Visual Indicators**

### **If Dashboard is EMPTY, you'll see a big diagnostic screen**:

```
┌───────────────────────────────────┐
│   ❌  No Data Loaded              │
│                                    │
│   🔍 Diagnostic Information       │
│   Current User: Emily Manager     │
│   Department ID: dept-1           │
│   Employees Found: 0  ← PROBLEM!  │
│                                    │
│   [Try Reload Data]                │
└───────────────────────────────────┘
```

This screen shows you EXACTLY what's wrong:

- Current User → Should be "Emily Manager"
- Department ID → Should be "dept-1"
- Employees Found → Should be "9"

---

## ✅ **Success Looks Like**

### **Console Output**:

```
✅ MANAGER DASHBOARD LOADED: 9 employees, 3 pending approvals
```

### **Dashboard Shows**:

- ✅ Employee Overview: 9 employees in table
- ✅ Requests & Approvals: Badge shows "(3)"
- ✅ All names and details visible (no "N/A")
- ✅ Analytics: Charts with data

---

## 🆘 **Emergency Commands**

Run these if nothing else works:

```bash
# 1. Kill dev server
Ctrl+C

# 2. Clear node_modules and reinstall
rm -rf node_modules
npm install

# 3. Restart
npm run dev

# 4. Clear browser cache completely
# Chrome: Ctrl+Shift+Delete → Clear Everything
# Firefox: Ctrl+Shift+Delete → Clear Everything
```

---

## 📞 **Still Stuck?**

1. **Copy full console output** (Ctrl+A in console, Ctrl+C)
2. **Run the one-line diagnostic above**
3. **Share the results**:
   - What does USER say?
   - What does DEPT say?
   - What does EMPLOYEES IN DEPT-1 say?
   - What does PENDING say?

The numbers will tell us exactly what's wrong! 🎯
