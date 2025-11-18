import { EmployeePromotion } from "@/types";

export const mockEmployeePromotions: EmployeePromotion[] = [
  // Sarah Johnson - Field Operator GC6 → GC7 (Pending Manager Approval)
  {
    id: "promo-pending-1",
    employeeId: "user-17", // Sarah Johnson
    targetJobTitleId: "job-field-operator", // Field Operator
    targetGradeId: "grade-gc7", // GC7
    status: "pending_approval",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-18T09:30:00Z",
    requirementId: "pr-field-gc7",
  },

  // James Brown - Console Operator GC7 → GC8 (Pending Manager Approval)
  {
    id: "promo-pending-2",
    employeeId: "user-20", // James Brown
    targetJobTitleId: "job-console-operator", // Console Operator
    targetGradeId: "grade-gc8", // GC8
    status: "pending_approval",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-18T10:15:00Z",
    requirementId: "pr-console-gc8",
  },

  // Olivia Davis - Field Operator GC7 → GC8 (Pending Manager Approval)
  {
    id: "promo-pending-3",
    employeeId: "user-21", // Olivia Davis
    targetJobTitleId: "job-field-operator", // Field Operator
    targetGradeId: "grade-gc8", // GC8
    status: "pending_approval",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-18T11:00:00Z",
    requirementId: "pr-field-gc8",
  },

  // Test Employee - Field Operator GC6 → GC7 (Pending Employee Approval - Manager already approved)
  {
    id: "promo-pending-employee-1",
    employeeId: "user-13", // Alex Employee (for testing)
    targetJobTitleId: "job-field-operator", // Field Operator
    targetGradeId: "grade-gc7", // GC7
    status: "pending_employee_approval",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-19T09:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-11-19T10:30:00Z",
    requirementId: "pr-field-gc7",
  },

  // Alex Employee - Field Operator GC6 → GC7 (In Progress - some completed)
  {
    id: "promo-1",
    employeeId: "user-13", // Alex Employee
    targetJobTitleId: "job-field-operator", // Field Operator
    targetGradeId: "grade-gc7", // GC7
    status: "in_progress",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-10-15T10:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-10-15T14:30:00Z",
    requirementId: "pr-field-gc7",
  },

  // Maria Employee - Console Operator GC7 → GC8 (In Progress - midway)
  {
    id: "promo-2",
    employeeId: "user-14", // Maria Employee
    targetJobTitleId: "job-console-operator", // Console Operator
    targetGradeId: "grade-gc8", // GC8
    status: "in_progress",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-10-20T10:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-10-20T15:00:00Z",
    requirementId: "pr-console-gc8",
  },

  // Chris Employee - Field Operator GC6 → GC7 (Assigned - just started)
  {
    id: "promo-3",
    employeeId: "user-15", // Chris Employee
    targetJobTitleId: "job-field-operator", // Field Operator
    targetGradeId: "grade-gc7", // GC7
    status: "assigned",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-10T10:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-11-10T16:00:00Z",
    requirementId: "pr-field-gc7",
  },

  // Diana Employee - Console Operator GC8 → GC9 (In Progress - almost done)
  {
    id: "promo-4",
    employeeId: "user-16", // Diana Employee
    targetJobTitleId: "job-console-operator", // Console Operator
    targetGradeId: "grade-gc9", // GC9
    status: "in_progress",
    assignedBy: "user-6", // David Training (different department)
    assignedAt: "2024-09-15T10:00:00Z",
    approvedBy: "user-4", // Michael Manager (dept-2 manager)
    approvedAt: "2024-09-15T14:00:00Z",
    requirementId: "pr-console-gc9",
  },

  // Michael Chen - Field Operator GC7 → GC8 (Assigned)
  {
    id: "promo-5",
    employeeId: "user-18", // Michael Chen
    targetJobTitleId: "job-field-operator",
    targetGradeId: "grade-gc8",
    status: "assigned",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-15T10:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-11-15T14:30:00Z",
    requirementId: "pr-field-gc8",
  },

  // Emma Wilson - Console Operator GC7 → GC8 (In Progress)
  {
    id: "promo-6",
    employeeId: "user-19", // Emma Wilson
    targetJobTitleId: "job-console-operator",
    targetGradeId: "grade-gc8",
    status: "in_progress",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-10-25T10:00:00Z",
    approvedBy: "user-3", // Emily Manager
    approvedAt: "2024-10-25T13:00:00Z",
    requirementId: "pr-console-gc8",
  },

  // William Martinez - Field Operator GC6 → GC7 (Rejected by Manager)
  {
    id: "promo-rejected-1",
    employeeId: "user-22", // William Martinez
    targetJobTitleId: "job-field-operator",
    targetGradeId: "grade-gc7",
    status: "rejected",
    assignedBy: "user-5", // Lisa Training
    assignedAt: "2024-11-17T09:00:00Z",
    rejectedBy: "user-3", // Emily Manager
    rejectedAt: "2024-11-17T16:00:00Z",
    rejectionReason:
      "Employee needs more time at current level to build foundational skills before advancing.",
    requirementId: "pr-field-gc7",
  },
];
