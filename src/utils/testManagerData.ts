// Test utility to diagnose Manager Dashboard data issues
// Run this in the browser console by importing it

import { mockApi } from "@/mock/services/mockApi";
import { UserRole } from "@/utils/constants";

export async function testManagerDashboardData() {
  console.log("=".repeat(80));
  console.log("🧪 MANAGER DASHBOARD DATA DIAGNOSTIC TEST");
  console.log("=".repeat(80));

  try {
    // 1. Check all users
    console.log("\n📊 STEP 1: Loading All Users");
    const allUsers = await mockApi.getUsers();
    console.log(`✅ Total users loaded: ${allUsers.length}`);

    // 2. Find managers
    console.log("\n👔 STEP 2: Finding Managers");
    const managers = allUsers.filter((u) => u.role === UserRole.MANAGER);
    console.log(`✅ Total managers: ${managers.length}`);
    managers.forEach((m) => {
      console.log(
        `  - ${m.name} (${m.id}): dept=${m.departmentId}, section=${m.sectionId}`
      );
    });

    // 3. Find employees by department
    console.log("\n👥 STEP 3: Finding Employees by Department");
    const employees = allUsers.filter((u) => u.role === UserRole.EMPLOYEE);
    console.log(`✅ Total employees in system: ${employees.length}`);

    const employeesByDept: Record<string, any[]> = {};
    employees.forEach((emp) => {
      if (!employeesByDept[emp.departmentId]) {
        employeesByDept[emp.departmentId] = [];
      }
      employeesByDept[emp.departmentId].push(emp);
    });

    Object.entries(employeesByDept).forEach(([deptId, emps]) => {
      console.log(`  - Department ${deptId}: ${emps.length} employees`);
      emps.forEach((e) => {
        console.log(`    • ${e.name} (${e.id}): ${e.jobTitleId} ${e.gradeId}`);
      });
    });

    // 4. Test filtering for dept-1 (Emily Manager's department)
    console.log("\n🔍 STEP 4: Testing Filter for dept-1");
    const dept1Employees = employees.filter((e) => e.departmentId === "dept-1");
    console.log(`✅ Employees in dept-1: ${dept1Employees.length}`);
    if (dept1Employees.length === 0) {
      console.error("❌ PROBLEM: No employees found in dept-1!");
      console.log("🔍 All employee department IDs:");
      employees.forEach((e) => {
        console.log(`  - ${e.name}: departmentId="${e.departmentId}"`);
      });
    } else {
      console.log("✅ dept-1 employees found:");
      dept1Employees.forEach((e) => {
        console.log(`  - ${e.name} (${e.id})`);
      });
    }

    // 5. Check promotions
    console.log("\n📋 STEP 5: Checking Promotions");
    const promotions = await mockApi.getEmployeePromotions();
    console.log(`✅ Total promotions: ${promotions.length}`);

    const promotionsByStatus: Record<string, number> = {};
    promotions.forEach((p) => {
      promotionsByStatus[p.status] = (promotionsByStatus[p.status] || 0) + 1;
    });

    console.log("📊 Promotions by status:");
    Object.entries(promotionsByStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    // 6. Check pending promotions for dept-1 employees
    console.log("\n⏳ STEP 6: Checking Pending Promotions for dept-1");
    const pendingPromotions = promotions.filter(
      (p) =>
        p.status === "pending_approval" &&
        dept1Employees.some((e) => e.id === p.employeeId)
    );
    console.log(
      `✅ Pending promotions for dept-1: ${pendingPromotions.length}`
    );

    if (pendingPromotions.length === 0) {
      console.warn("⚠️ No pending promotions found for dept-1 employees");
      const allPending = promotions.filter(
        (p) => p.status === "pending_approval"
      );
      console.log(`📊 All pending promotions in system: ${allPending.length}`);
      allPending.forEach((p) => {
        const emp = employees.find((e) => e.id === p.employeeId);
        console.log(
          `  - ${emp?.name || p.employeeId}: dept=${emp?.departmentId}`
        );
      });
    } else {
      pendingPromotions.forEach((p) => {
        const emp = dept1Employees.find((e) => e.id === p.employeeId);
        const assignedBy = allUsers.find((u) => u.id === p.assignedBy);
        console.log(
          `  - ${emp?.name}: assigned by ${assignedBy?.name || p.assignedBy}`
        );
      });
    }

    // 7. Check job titles and grades
    console.log("\n🏢 STEP 7: Checking Job Titles and Grades");
    const jobTitles = await mockApi.getJobTitles();
    const grades = await mockApi.getGrades();
    console.log(`✅ Job Titles: ${jobTitles.length}`);
    jobTitles.forEach((jt) => console.log(`  - ${jt.id}: ${jt.name}`));
    console.log(`✅ Grades: ${grades.length}`);
    grades.forEach((g) => console.log(`  - ${g.id}: ${g.name}`));

    // 8. Summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 DIAGNOSTIC SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Users: ${allUsers.length}`);
    console.log(`Managers: ${managers.length}`);
    console.log(`Employees: ${employees.length}`);
    console.log(`Employees in dept-1: ${dept1Employees.length}`);
    console.log(`Total Promotions: ${promotions.length}`);
    console.log(`Pending Promotions for dept-1: ${pendingPromotions.length}`);
    console.log(`Job Titles: ${jobTitles.length}`);
    console.log(`Grades: ${grades.length}`);

    console.log("\n🎯 EXPECTED vs ACTUAL:");
    console.log(
      `  Employees in dept-1: Expected 9, Got ${dept1Employees.length} ${
        dept1Employees.length === 9 ? "✅" : "❌"
      }`
    );
    console.log(
      `  Pending Approvals: Expected 3, Got ${pendingPromotions.length} ${
        pendingPromotions.length === 3 ? "✅" : "❌"
      }`
    );
    console.log(
      `  Job Titles: Expected 3, Got ${jobTitles.length} ${
        jobTitles.length === 3 ? "✅" : "❌"
      }`
    );
    console.log(
      `  Grades: Expected 5, Got ${grades.length} ${
        grades.length === 5 ? "✅" : "❌"
      }`
    );

    if (
      dept1Employees.length === 9 &&
      pendingPromotions.length === 3 &&
      jobTitles.length === 3 &&
      grades.length === 5
    ) {
      console.log("\n✅ ALL DATA CHECKS PASSED!");
      console.log(
        "If Manager Dashboard still shows no data, check AuthContext and currentUser"
      );
    } else {
      console.log("\n❌ DATA ISSUES DETECTED!");
      console.log("Check the steps above to see what's missing");
    }

    console.log("=".repeat(80));

    return {
      allUsers,
      managers,
      employees,
      dept1Employees,
      promotions,
      pendingPromotions,
      jobTitles,
      grades,
    };
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
    throw error;
  }
}

// Export for console use
if (typeof window !== "undefined") {
  (window as any).testManagerDashboardData = testManagerDashboardData;
}
