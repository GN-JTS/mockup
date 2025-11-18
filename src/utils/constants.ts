// User Roles
export enum UserRole {
  ADMIN = "admin",
  UPPER_MANAGER = "upper_manager",
  MANAGER = "manager",
  TRAINING_MANAGER = "training_manager",
  MENTOR = "mentor",
  EVALUATOR = "evaluator",
  EMPLOYEE = "employee",
}

// Assignment Request Statuses (DEPRECATED - keeping for compatibility)
export enum AssignmentStatus {
  PENDING_MANAGER = "pending_manager",
  PENDING_EMPLOYEE = "pending_employee",
  APPROVED = "approved",
  REJECTED = "rejected",
  ACTIVE = "active",
}

// Promotion Statuses
export enum PromotionStatus {
  PENDING_APPROVAL = "pending_approval", // Waiting for manager approval
  PENDING_EMPLOYEE_APPROVAL = "pending_employee_approval", // Waiting for employee approval
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected", // Manager or employee rejected
}

// Evaluation Statuses - Can go directly to Master or through attempts
export enum EvaluationStatus {
  NOT_STARTED = "not_started",
  ATTEMPT_1 = "attempt_1",
  ATTEMPT_2 = "attempt_2",
  MASTER = "master",
}

// Appointment Request Statuses
export enum AppointmentStatus {
  PENDING = "pending",
  PROPOSED = "proposed",
  APPROVED = "approved",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Appointment Types
export enum AppointmentType {
  MENTORSHIP = "mentorship",
  EVALUATION = "evaluation",
}

// Calendar Slot Status
export enum CalendarSlotStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  PENDING_APPROVAL = "pending_approval",
  BLOCKED = "blocked",
}

// Role Display Names
export const RoleDisplayNames: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.UPPER_MANAGER]: "Upper Manager",
  [UserRole.MANAGER]: "Manager",
  [UserRole.TRAINING_MANAGER]: "Training Manager",
  [UserRole.MENTOR]: "Mentor",
  [UserRole.EVALUATOR]: "Evaluator",
  [UserRole.EMPLOYEE]: "Employee",
};

// Status Display Names
export const AssignmentStatusNames: Record<AssignmentStatus, string> = {
  [AssignmentStatus.PENDING_MANAGER]: "Pending Manager Approval",
  [AssignmentStatus.PENDING_EMPLOYEE]: "Pending Employee Approval",
  [AssignmentStatus.APPROVED]: "Approved",
  [AssignmentStatus.REJECTED]: "Rejected",
  [AssignmentStatus.ACTIVE]: "Active",
};

export const PromotionStatusNames: Record<PromotionStatus, string> = {
  [PromotionStatus.PENDING_APPROVAL]: "Pending Manager Approval",
  [PromotionStatus.PENDING_EMPLOYEE_APPROVAL]: "Pending Employee Approval",
  [PromotionStatus.ASSIGNED]: "Assigned",
  [PromotionStatus.IN_PROGRESS]: "In Progress",
  [PromotionStatus.COMPLETED]: "Completed",
  [PromotionStatus.CANCELLED]: "Cancelled",
  [PromotionStatus.REJECTED]: "Rejected",
};

export const EvaluationStatusNames: Record<EvaluationStatus, string> = {
  [EvaluationStatus.NOT_STARTED]: "Not Started",
  [EvaluationStatus.ATTEMPT_1]: "Attempt 1",
  [EvaluationStatus.ATTEMPT_2]: "Attempt 2",
  [EvaluationStatus.MASTER]: "Master",
};

export const AppointmentStatusNames: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: "Pending",
  [AppointmentStatus.PROPOSED]: "Proposed",
  [AppointmentStatus.APPROVED]: "Approved",
  [AppointmentStatus.CONFIRMED]: "Confirmed",
  [AppointmentStatus.REJECTED]: "Rejected",
  [AppointmentStatus.COMPLETED]: "Completed",
  [AppointmentStatus.CANCELLED]: "Cancelled",
};

// Status Colors for Badges
export const PromotionStatusColors: Record<PromotionStatus, string> = {
  [PromotionStatus.PENDING_APPROVAL]: "bg-purple-100 text-purple-800",
  [PromotionStatus.PENDING_EMPLOYEE_APPROVAL]: "bg-orange-100 text-orange-800",
  [PromotionStatus.ASSIGNED]: "bg-blue-100 text-blue-800",
  [PromotionStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [PromotionStatus.COMPLETED]: "bg-green-100 text-green-800",
  [PromotionStatus.CANCELLED]: "bg-gray-100 text-gray-800",
  [PromotionStatus.REJECTED]: "bg-red-100 text-red-800",
};

export const EvaluationStatusColors: Record<EvaluationStatus, string> = {
  [EvaluationStatus.NOT_STARTED]: "bg-gray-100 text-gray-800",
  [EvaluationStatus.ATTEMPT_1]: "bg-yellow-100 text-yellow-800",
  [EvaluationStatus.ATTEMPT_2]: "bg-orange-100 text-orange-800",
  [EvaluationStatus.MASTER]: "bg-green-100 text-green-800",
};

export const AssignmentStatusColors: Record<AssignmentStatus, string> = {
  [AssignmentStatus.PENDING_MANAGER]: "bg-blue-100 text-blue-800",
  [AssignmentStatus.PENDING_EMPLOYEE]: "bg-purple-100 text-purple-800",
  [AssignmentStatus.APPROVED]: "bg-green-100 text-green-800",
  [AssignmentStatus.REJECTED]: "bg-red-100 text-red-800",
  [AssignmentStatus.ACTIVE]: "bg-emerald-100 text-emerald-800",
};

export const AppointmentStatusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [AppointmentStatus.PROPOSED]: "bg-blue-100 text-blue-800",
  [AppointmentStatus.APPROVED]: "bg-green-100 text-green-800",
  [AppointmentStatus.CONFIRMED]: "bg-emerald-100 text-emerald-800",
  [AppointmentStatus.REJECTED]: "bg-red-100 text-red-800",
  [AppointmentStatus.COMPLETED]: "bg-gray-100 text-gray-800",
  [AppointmentStatus.CANCELLED]: "bg-gray-100 text-gray-800",
};
