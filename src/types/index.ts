import {
  UserRole,
  AssignmentStatus,
  EvaluationStatus,
  AppointmentStatus,
  AppointmentType,
  CalendarSlotStatus,
} from "@/utils/constants";

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  sectionId: string;
  jobTitleId: string;
  gradeId: string;
  avatar?: string;
  mentorFor?: {
    departmentId: string;
    sectionId: string;
    gradeId: string;
  }[];
  evaluatorFor?: {
    departmentId: string;
    sectionId: string;
    gradeId: string;
  }[];
}

// Department & Organization
export interface Department {
  id: string;
  name: string;
  parentId?: string;
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
}

// Task & Subtask
export interface Task {
  id: string;
  title: string;
  description: string;
  sectionId?: string; // Section-specific task (if undefined, global)
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  requirements: string;
  sectionId?: string; // Section-specific subtask (if undefined, global)
  resources?: string[];
}

// Job Title
export interface JobTitle {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  sectionId?: string; // Section-specific job title (if undefined, global)
}

// Grade
export interface Grade {
  id: string;
  name: string;
  description?: string;
}

// Promotion Requirement (defines what's needed for jobTitle+grade+section)
export interface PromotionRequirement {
  id: string;
  sectionId: string; // Required - section-specific requirement matrix
  jobTitleId: string;
  gradeId: string;
  required: {
    taskId: string;
    subtaskIds: string[];
  }[];
  createdAt: string;
  updatedAt: string;
  version?: number; // For versioning support
  isActive?: boolean; // Active/published version
}

// Section → Job Title Mapping
export interface SectionJobTitleMapping {
  id: string;
  sectionId: string;
  jobTitleId: string;
  createdAt: string;
}

// Section → Grade Mapping (grades available for a job title in a section)
export interface SectionGradeMapping {
  id: string;
  sectionId: string;
  jobTitleId: string;
  gradeId: string;
  createdAt: string;
}

// Requirement Matrix Version (for versioning)
export interface RequirementMatrixVersion {
  id: string;
  requirementId: string;
  version: number;
  sectionId: string;
  jobTitleId: string;
  gradeId: string;
  required: {
    taskId: string;
    subtaskIds: string[];
  }[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  notes?: string;
}

// Employee Promotion (assignment to work toward a promotion)
export interface EmployeePromotion {
  id: string;
  employeeId: string;
  targetJobTitleId: string;
  targetGradeId: string;
  status:
    | "pending_approval"
    | "pending_employee_approval"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rejected";
  assignedBy: string;
  assignedAt: string;
  approvedBy?: string; // Manager who approved
  approvedAt?: string;
  rejectedBy?: string; // Manager or employee who rejected
  rejectedAt?: string;
  rejectionReason?: string;
  employeeApprovedBy?: string; // Employee who accepted
  employeeApprovedAt?: string;
  employeeRejectedBy?: string; // Employee who rejected
  employeeRejectedAt?: string;
  employeeRejectionReason?: string;
  completedAt?: string;
  requirementId: string;
}

// Employee Progress per Subtask
export interface EmployeeProgress {
  id: string;
  promotionId: string;
  employeeId: string;
  subtaskId: string;
  mentorStatus: EvaluationStatus;
  evaluatorStatus: EvaluationStatus;
  mentorId?: string;
  evaluatorId?: string;
  mentorFeedback?: string;
  evaluatorFeedback?: string;
  mentorEvaluatedAt?: string;
  evaluatorEvaluatedAt?: string;
  history: EvaluationHistoryEntry[];
}

export interface EvaluationHistoryEntry {
  id: string;
  evaluatorId: string;
  evaluatorRole: "mentor" | "evaluator";
  status: EvaluationStatus;
  feedback: string;
  evaluatedAt: string;
}

// Calendar
export interface CalendarSlot {
  id: string;
  userId: string; // mentor or evaluator
  date: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: CalendarSlotStatus;
  appointmentId?: string;
}

export interface WorkingHours {
  userId: string;
  dayOfWeek: number; // 0-6, 0=Sunday
  startTime: string;
  endTime: string;
}

// Appointment Request
export interface AppointmentRequest {
  id: string;
  employeeId: string;
  mentorOrEvaluatorId: string;
  promotionId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  proposedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  subtaskIds: string[];
}

// Appointment (Confirmed)
export interface Appointment {
  id: string;
  appointmentRequestId: string;
  employeeId: string;
  mentorOrEvaluatorId: string;
  promotionId: string;
  type: AppointmentType;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "completed" | "cancelled";
  notes?: string;
  subtaskIds: string[];
  completedAt?: string;
}

// Mentor/Evaluator Assignment
export interface MentorEvaluatorAssignment {
  id: string;
  userId: string;
  role: "mentor" | "evaluator";
  departmentIds: string[];
  sectionIds: string[];
}

// Certificate
export interface Certificate {
  id: string;
  employeeId: string;
  promotionId: string;
  jobTitleId: string;
  gradeId: string;
  issueDate: string;
  certificateNumber: string;
  issuedBy: string;
  masteredSubtaskIds: string[];
}

// Previously Mastered Subtasks (for hierarchical certificates)
export interface MasteredSubtask {
  employeeId: string;
  subtaskId: string;
  masteredAt: string;
  certificateId: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type:
    | "assignment_request"
    | "appointment_request"
    | "appointment_proposed"
    | "evaluation_complete"
    | "certificate_issued";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
