import { PromotionRequirement } from "@/types";

export const mockPromotionRequirements: PromotionRequirement[] = [
  // ===================================================================
  // FIELD OPERATOR PROGRESSION (GC6 → GC7 → GC8 → GC9 → GC10)
  // ===================================================================

  // Field Operator GC6 (Entry Level - Basic Tasks)
  {
    id: "pr-field-gc6",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc6",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: ["subtask-1.1"], // Just Perform/Accept Shift tasks
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Field Operator GC7 (Junior Level)
  {
    id: "pr-field-gc7",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc7",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Field Operator GC8 (Intermediate Level)
  {
    id: "pr-field-gc8",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc8",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Field Operator GC9 (Advanced Level)
  {
    id: "pr-field-gc9",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc9",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
          "subtask-1.6", // Conduct Minor Maintenance Tasks
          "subtask-1.7", // Perform Equipment Checks
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Field Operator GC10 (Expert Level - Multiple Tasks)
  {
    id: "pr-field-gc10",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc10",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
          "subtask-1.6", // Conduct Minor Maintenance Tasks
          "subtask-1.7", // Perform Equipment Checks
          "subtask-1.8", // Train Junior Operators
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // ===================================================================
  // CONSOLE OPERATOR PROGRESSION (GC7 → GC8 → GC9 → GC10)
  // ===================================================================

  // Console Operator GC7 (Entry Console Level)
  {
    id: "pr-console-gc7",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc7",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Console Operator GC8 (Junior Console Level)
  {
    id: "pr-console-gc8",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc8",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.4", // Respond to Alarms
          "subtask-2.5", // Perform System Diagnostics
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Console Operator GC9 (Advanced Console Level)
  {
    id: "pr-console-gc9",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc9",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.4", // Respond to Alarms
          "subtask-2.5", // Perform System Diagnostics
          "subtask-2.6", // Optimize Process Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Console Operator GC10 (Expert Console Level - Multi-Task)
  {
    id: "pr-console-gc10",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc10",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.4", // Respond to Alarms
          "subtask-2.5", // Perform System Diagnostics
          "subtask-2.6", // Optimize Process Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // ===================================================================
  // SHIFT SUPERVISOR PROGRESSION (GC9 → GC10)
  // ===================================================================

  // Shift Supervisor GC9 (Entry Supervisor Level)
  {
    id: "pr-supervisor-gc9",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc9",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
          "subtask-1.8", // Train Junior Operators
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.6", // Optimize Process Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Shift Supervisor GC10 (Senior Supervisor Level)
  {
    id: "pr-supervisor-gc10",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc10",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
          "subtask-1.6", // Conduct Minor Maintenance Tasks
          "subtask-1.7", // Perform Equipment Checks
          "subtask-1.8", // Train Junior Operators
          "subtask-1.9", // Review Process Documentation
          "subtask-1.10", // Lead Shift Meetings
          "subtask-1.11", // Coordinate with Maintenance
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.4", // Respond to Alarms
          "subtask-2.5", // Perform System Diagnostics
          "subtask-2.6", // Optimize Process Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // ===================================================================
  // LATERAL/CROSS-FUNCTIONAL PROMOTIONS
  // ===================================================================

  // Field Operator → Console Operator (Same Grade Lateral)
  {
    id: "pr-field-to-console-gc7",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc7",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },

  // Console Operator → Shift Supervisor (Promotion Path)
  {
    id: "pr-console-to-supervisor-gc9",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc9",
    sectionId: "sec-1", // Migrated to default section
    required: [
      {
        taskId: "task-1",
        subtaskIds: [
          "subtask-1.1", // Perform/Accept Shift tasks
          "subtask-1.2", // Report Emergency Conditions
          "subtask-1.3", // Respond to Plan Emergency
          "subtask-1.4", // Comply with Regulatory Requirements
          "subtask-1.5", // Maintain Safe Working Condition
          "subtask-1.8", // Train Junior Operators
        ],
      },
      {
        taskId: "task-2",
        subtaskIds: [
          "subtask-2.1", // Navigate DC System
          "subtask-2.2", // Adjust Setpoints/Parameters
          "subtask-2.3", // Monitor Process Variables
          "subtask-2.4", // Respond to Alarms
          "subtask-2.5", // Perform System Diagnostics
          "subtask-2.6", // Optimize Process Parameters
        ],
      },
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];
