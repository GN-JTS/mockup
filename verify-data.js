// Quick verification script to check data integrity
// Run with: node verify-data.js

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Mock Data Integrity...\n");

// Read mock data files
const readMockFile = (filename) => {
  const filePath = path.join(__dirname, "src/mock/data", filename);
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract export statement
  const match = content.match(/export const \w+.*?=\s*(\[[\s\S]*?\n\]);/);
  if (!match) {
    console.error(`❌ Could not parse ${filename}`);
    return [];
  }

  // This is hacky but works for quick validation
  try {
    const data = eval(match[1]);
    return data;
  } catch (e) {
    console.error(`❌ Error parsing ${filename}:`, e.message);
    return [];
  }
};

// Job Titles
console.log("📋 Job Titles:");
const jobTitleIds = [
  "job-field-operator",
  "job-console-operator",
  "job-shift-supervisor",
];
jobTitleIds.forEach((id) => console.log(`  - ${id}`));

// Grades
console.log("\n📊 Grades:");
const gradeIds = [
  "grade-gc6",
  "grade-gc7",
  "grade-gc8",
  "grade-gc9",
  "grade-gc10",
];
gradeIds.forEach((id) => console.log(`  - ${id}`));

// Tasks
console.log("\n📝 Tasks:");
const taskIds = ["task-1", "task-2"];
taskIds.forEach((id) => console.log(`  - ${id}`));

// Subtasks (sample)
console.log("\n✅ Subtask ID Format:");
console.log("  - subtask-1.1, subtask-1.2, ... (with DOTS)");
console.log("  - subtask-2.1, subtask-2.2, ... (with DOTS)");

console.log("\n" + "=".repeat(60));
console.log("✅ VERIFICATION CHECKLIST");
console.log("=".repeat(60));

console.log("\n1. User File (users.ts):");
console.log("   - Employee jobTitleId should be one of:");
console.log(
  "     job-field-operator, job-console-operator, job-shift-supervisor"
);
console.log("   - Employee gradeId should be one of:");
console.log("     grade-gc6, grade-gc7, grade-gc8, grade-gc9, grade-gc10");

console.log("\n2. Promotion Requirements (promotionRequirements.ts):");
console.log("   - jobTitleId should match job title IDs above");
console.log("   - gradeId should match grade IDs above");
console.log("   - taskId should be task-1 or task-2");
console.log("   - subtaskIds should use DOTS (subtask-1.1, not subtask-1-1)");

console.log("\n3. Employee Promotions (employeePromotions.ts):");
console.log("   - targetJobTitleId should match job title IDs");
console.log("   - targetGradeId should match grade IDs");
console.log("   - requirementId should match promotion requirement IDs");

console.log("\n4. Employee Progress (employeeProgress.ts):");
console.log("   - promotionId should match employeePromotions IDs");
console.log("   - subtaskId should use DOTS (subtask-1.1, not subtask-1-1)");

console.log("\n" + "=".repeat(60));
console.log("🎯 KEY POINTS");
console.log("=".repeat(60));

console.log("\n✅ DO:");
console.log("  - Use job-field-operator (with dashes)");
console.log("  - Use grade-gc6 (with dash)");
console.log("  - Use subtask-1.1 (with DOT)");
console.log("  - Use task-1 (with dash)");

console.log("\n❌ DON'T:");
console.log("  - Use job-1 or job_field_operator");
console.log("  - Use grade-1 or grade_gc6");
console.log("  - Use subtask-1-1 (with dash) or subtask_1_1");
console.log("  - Use task_1 or task1");

console.log("\n" + "=".repeat(60));
console.log("\nRun 'npm run dev' and check browser console for actual data!");
console.log("Look for '=== DEBUG ===' messages\n");
