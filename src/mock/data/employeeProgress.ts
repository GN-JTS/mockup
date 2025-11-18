import { EmployeeProgress } from "@/types";
import { EvaluationStatus } from "@/utils/constants";

export const mockEmployeeProgress: EmployeeProgress[] = [
  // =================================================================
  // PROMO-1: Alex Employee → Field Operator GC7 (In Progress)
  // Required: subtasks 1.1, 1.2, 1.3 (from pr-field-gc7)
  // =================================================================
  {
    id: "prog-1-1",
    promotionId: "promo-1",
    employeeId: "user-13",
    subtaskId: "subtask-1.1", // Perform/Accept Shift tasks
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-7", // Robert Mentor
    mentorFeedback:
      "Excellent understanding of shift handover procedures. Well done!",
    mentorEvaluatedAt: "2024-10-20T14:00:00Z",
    history: [],
  },
  {
    id: "prog-1-2",
    promotionId: "promo-1",
    employeeId: "user-13",
    subtaskId: "subtask-1.2", // Report Emergency Conditions
    mentorStatus: EvaluationStatus.ATTEMPT_1,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-7",
    mentorFeedback:
      "Good progress, but needs more practice with emergency reporting protocols.",
    mentorEvaluatedAt: "2024-10-25T10:00:00Z",
    history: [],
  },
  {
    id: "prog-1-3",
    promotionId: "promo-1",
    employeeId: "user-13",
    subtaskId: "subtask-1.3", // Respond to Plan Emergency
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-2: Maria Employee → Console Operator GC8 (In Progress)
  // Required: subtasks 1.1-1.4, 2.1-2.2 (from pr-console-gc8)
  // =================================================================
  {
    id: "prog-2-1",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-8", // Jennifer Mentor
    evaluatorId: "user-11", // James Evaluator
    mentorFeedback: "Perfect execution of shift tasks.",
    evaluatorFeedback: "Confirmed mastery. Ready for advanced tasks.",
    mentorEvaluatedAt: "2024-10-25T11:00:00Z",
    evaluatorEvaluatedAt: "2024-11-01T15:00:00Z",
    history: [],
  },
  {
    id: "prog-2-2",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.ATTEMPT_1,
    mentorId: "user-8",
    evaluatorId: "user-11",
    mentorFeedback: "Demonstrates clear understanding of emergency procedures.",
    evaluatorFeedback:
      "Good but needs to improve response time in high-pressure situations.",
    mentorEvaluatedAt: "2024-10-28T09:00:00Z",
    evaluatorEvaluatedAt: "2024-11-05T10:00:00Z",
    history: [],
  },
  {
    id: "prog-2-3",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback: "Shows excellent emergency response skills.",
    mentorEvaluatedAt: "2024-11-01T14:00:00Z",
    history: [],
  },
  {
    id: "prog-2-4",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-1.4",
    mentorStatus: EvaluationStatus.ATTEMPT_2,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback:
      "Improving but needs more consistency in monitoring abnormal conditions.",
    mentorEvaluatedAt: "2024-11-08T11:00:00Z",
    history: [],
  },
  {
    id: "prog-2-5",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-2.1",
    mentorStatus: EvaluationStatus.ATTEMPT_1,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback:
      "Knows basic console features but needs more hands-on practice.",
    mentorEvaluatedAt: "2024-11-10T09:00:00Z",
    history: [],
  },
  {
    id: "prog-2-6",
    promotionId: "promo-2",
    employeeId: "user-14",
    subtaskId: "subtask-2.2",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-3: Chris Employee → Field Operator GC7 (Assigned)
  // Required: subtasks 1.1, 1.2, 1.3 (just assigned, no progress yet)
  // =================================================================
  {
    id: "prog-3-1",
    promotionId: "promo-3",
    employeeId: "user-15",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-3-2",
    promotionId: "promo-3",
    employeeId: "user-15",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-3-3",
    promotionId: "promo-3",
    employeeId: "user-15",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-4: Diana Employee → Console Operator GC9 (In Progress - Almost Done)
  // Required: subtasks 1.1-1.6, 2.1-2.4 (from pr-console-gc9)
  // Most are mastered, just a few remaining
  // =================================================================
  {
    id: "prog-4-1",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9", // William Mentor
    evaluatorId: "user-12", // Linda Evaluator
    mentorFeedback: "Outstanding performance throughout training.",
    evaluatorFeedback: "Excellent. No issues identified.",
    mentorEvaluatedAt: "2024-09-20T10:00:00Z",
    evaluatorEvaluatedAt: "2024-09-25T14:00:00Z",
    history: [],
  },
  {
    id: "prog-4-2",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Quick response to emergency scenarios.",
    evaluatorFeedback: "Confirmed mastery.",
    mentorEvaluatedAt: "2024-09-25T11:00:00Z",
    evaluatorEvaluatedAt: "2024-10-01T09:00:00Z",
    history: [],
  },
  {
    id: "prog-4-3",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Excellent emergency plan execution.",
    evaluatorFeedback: "Fully meets requirements.",
    mentorEvaluatedAt: "2024-10-01T14:00:00Z",
    evaluatorEvaluatedAt: "2024-10-08T10:00:00Z",
    history: [],
  },
  {
    id: "prog-4-4",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.4",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Monitors and corrects abnormal conditions effectively.",
    evaluatorFeedback: "Verified competency.",
    mentorEvaluatedAt: "2024-10-10T11:00:00Z",
    evaluatorEvaluatedAt: "2024-10-15T14:00:00Z",
    history: [],
  },
  {
    id: "prog-4-5",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.5",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Strong analytical skills in trend identification.",
    evaluatorFeedback: "Confirmed.",
    mentorEvaluatedAt: "2024-10-18T09:00:00Z",
    evaluatorEvaluatedAt: "2024-10-22T15:00:00Z",
    history: [],
  },
  {
    id: "prog-4-6",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-1.6",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Performs lubrication tasks with precision.",
    evaluatorFeedback: "No concerns.",
    mentorEvaluatedAt: "2024-10-25T10:00:00Z",
    evaluatorEvaluatedAt: "2024-10-30T11:00:00Z",
    history: [],
  },
  {
    id: "prog-4-7",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-2.1",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.MASTER,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Deep knowledge of console features.",
    evaluatorFeedback: "Excellent demonstration.",
    mentorEvaluatedAt: "2024-11-01T14:00:00Z",
    evaluatorEvaluatedAt: "2024-11-05T10:00:00Z",
    history: [],
  },
  {
    id: "prog-4-8",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-2.2",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.ATTEMPT_1,
    mentorId: "user-9",
    evaluatorId: "user-12",
    mentorFeedback: "Operates console with high proficiency.",
    evaluatorFeedback:
      "Good but needs to demonstrate proficiency under more stress conditions.",
    mentorEvaluatedAt: "2024-11-08T09:00:00Z",
    evaluatorEvaluatedAt: "2024-11-12T14:00:00Z",
    history: [],
  },
  {
    id: "prog-4-9",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-2.3",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-9",
    mentorFeedback: "Can train others effectively on console basics.",
    mentorEvaluatedAt: "2024-11-13T11:00:00Z",
    history: [],
  },
  {
    id: "prog-4-10",
    promotionId: "promo-4",
    employeeId: "user-16",
    subtaskId: "subtask-2.4",
    mentorStatus: EvaluationStatus.ATTEMPT_1,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-9",
    mentorFeedback:
      "Good analytical skills, needs more complex problem scenarios.",
    mentorEvaluatedAt: "2024-11-15T10:00:00Z",
    history: [],
  },

  // =================================================================
  // PROMO-5: Michael Chen → Field Operator GC8 (Assigned - just started)
  // Required: subtasks 1.1, 1.2, 1.3, 1.4, 1.5 (from pr-field-gc8)
  // =================================================================
  {
    id: "prog-5-1",
    promotionId: "promo-5",
    employeeId: "user-18",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-5-2",
    promotionId: "promo-5",
    employeeId: "user-18",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-5-3",
    promotionId: "promo-5",
    employeeId: "user-18",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-5-4",
    promotionId: "promo-5",
    employeeId: "user-18",
    subtaskId: "subtask-1.4",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-5-5",
    promotionId: "promo-5",
    employeeId: "user-18",
    subtaskId: "subtask-1.5",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-6: Emma Wilson → Console Operator GC8 (In Progress - some done)
  // Required: subtasks 2.1, 2.2, 2.3, 2.4, 2.5 (from pr-console-gc8)
  // =================================================================
  {
    id: "prog-6-1",
    promotionId: "promo-6",
    employeeId: "user-19",
    subtaskId: "subtask-2.1",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback: "Excellent understanding of console operations basics.",
    mentorEvaluatedAt: "2024-11-01T10:00:00Z",
    history: [],
  },
  {
    id: "prog-6-2",
    promotionId: "promo-6",
    employeeId: "user-19",
    subtaskId: "subtask-2.2",
    mentorStatus: EvaluationStatus.MASTER,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback: "Strong performance on console monitoring tasks.",
    mentorEvaluatedAt: "2024-11-05T10:00:00Z",
    history: [],
  },
  {
    id: "prog-6-3",
    promotionId: "promo-6",
    employeeId: "user-19",
    subtaskId: "subtask-2.3",
    mentorStatus: EvaluationStatus.ATTEMPT_1,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    mentorId: "user-8",
    mentorFeedback: "Good progress, needs practice with advanced functions.",
    mentorEvaluatedAt: "2024-11-10T10:00:00Z",
    history: [],
  },
  {
    id: "prog-6-4",
    promotionId: "promo-6",
    employeeId: "user-19",
    subtaskId: "subtask-2.4",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-6-5",
    promotionId: "promo-6",
    employeeId: "user-19",
    subtaskId: "subtask-2.5",
    mentorStatus: EvaluationStatus.NOT_STARTED,
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-PENDING-1: Sarah Johnson → Field Operator GC7 (Pending Approval)
  // Required: subtasks 1.1, 1.2, 1.3 (from pr-field-gc7)
  // Current grade GC6 subtasks already mastered (carried forward)
  // =================================================================
  {
    id: "prog-pending-1-1",
    promotionId: "promo-pending-1",
    employeeId: "user-17",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-1",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T09:30:00Z",
      },
    ],
  },
  {
    id: "prog-pending-1-2",
    promotionId: "promo-pending-1",
    employeeId: "user-17",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New subtask for GC7
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-pending-1-3",
    promotionId: "promo-pending-1",
    employeeId: "user-17",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New subtask for GC7
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-PENDING-2: James Brown → Console Operator GC8 (Pending Approval)
  // Required: subtasks from pr-console-gc8
  // Current grade GC7 subtasks already mastered (carried forward)
  // =================================================================
  {
    id: "prog-pending-2-1",
    promotionId: "promo-pending-2",
    employeeId: "user-20",
    subtaskId: "subtask-2.1",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level GC7
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-2",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T10:15:00Z",
      },
    ],
  },
  {
    id: "prog-pending-2-2",
    promotionId: "promo-pending-2",
    employeeId: "user-20",
    subtaskId: "subtask-2.2",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level GC7
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-3",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T10:15:00Z",
      },
    ],
  },
  {
    id: "prog-pending-2-3",
    promotionId: "promo-pending-2",
    employeeId: "user-20",
    subtaskId: "subtask-2.3",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New for GC8
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-pending-2-4",
    promotionId: "promo-pending-2",
    employeeId: "user-20",
    subtaskId: "subtask-2.4",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New for GC8
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
  {
    id: "prog-pending-2-5",
    promotionId: "promo-pending-2",
    employeeId: "user-20",
    subtaskId: "subtask-2.5",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New for GC8
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },

  // =================================================================
  // PROMO-PENDING-3: Olivia Davis → Field Operator GC8 (Pending Approval)
  // Required: subtasks from pr-field-gc8
  // Current grade GC7 subtasks already mastered (carried forward)
  // =================================================================
  {
    id: "prog-pending-3-1",
    promotionId: "promo-pending-3",
    employeeId: "user-21",
    subtaskId: "subtask-1.1",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level GC7
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-4",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T11:00:00Z",
      },
    ],
  },
  {
    id: "prog-pending-3-2",
    promotionId: "promo-pending-3",
    employeeId: "user-21",
    subtaskId: "subtask-1.2",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level GC7
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-5",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T11:00:00Z",
      },
    ],
  },
  {
    id: "prog-pending-3-3",
    promotionId: "promo-pending-3",
    employeeId: "user-21",
    subtaskId: "subtask-1.3",
    mentorStatus: EvaluationStatus.MASTER, // Carried forward from current level GC7
    evaluatorStatus: EvaluationStatus.MASTER,
    history: [
      {
        id: "hist-6",
        evaluatorId: "user-5",
        evaluatorRole: "mentor" as const,
        status: EvaluationStatus.MASTER,
        feedback: "Carried forward from previous promotion",
        evaluatedAt: "2024-11-18T11:00:00Z",
      },
    ],
  },
  {
    id: "prog-pending-3-4",
    promotionId: "promo-pending-3",
    employeeId: "user-21",
    subtaskId: "subtask-1.4",
    mentorStatus: EvaluationStatus.NOT_STARTED, // New for GC8
    evaluatorStatus: EvaluationStatus.NOT_STARTED,
    history: [],
  },
];
