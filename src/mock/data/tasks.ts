import { Task, Subtask } from "@/types";

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Duty1.0 Perform common Tasks",
    description: "Common operational tasks for Control Section personnel",
    sectionId: "sec-1", // Migrated to default section
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Operate Yogokawa DC Console",
    description: "Operating and maintaining the Yokogawa DCS console system",
    sectionId: "sec-1", // Migrated to default section
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];

export const mockSubtasks: Subtask[] = [
  // Task 1: Duty1.0 Perform common Tasks
  {
    id: "subtask-1.1",
    taskId: "task-1",
    title: "1.1 Perform/Accept Shift tasks",
    description: "Perform and accept shift tasks and handovers",
    requirements:
      "Must complete shift handover procedures and accept all assigned shift tasks",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Shift Handover Procedures", "Task Checklist"],
  },
  {
    id: "subtask-1.2",
    taskId: "task-1",
    title: "1.2 Report Emergency Conditions",
    description: "Identify and report emergency conditions promptly",
    requirements:
      "Must recognize emergency conditions and follow proper reporting procedures",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Emergency Response Manual", "Reporting Protocols"],
  },
  {
    id: "subtask-1.3",
    taskId: "task-1",
    title: "1.3 Respond to Plan Emergency",
    description: "Execute emergency response plan when required",
    requirements:
      "Must follow emergency response plan and demonstrate proper actions",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Emergency Response Plan", "Emergency Drills Documentation"],
  },
  {
    id: "subtask-1.4",
    taskId: "task-1",
    title: "1.4 Report, Monitor, and Correct Abnormal Conditions",
    description:
      "Identify, report, monitor and take corrective action for abnormal conditions",
    requirements:
      "Must detect abnormal conditions, report them, and take appropriate corrective measures",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Abnormal Conditions Guide",
      "Corrective Actions Manual",
      "Monitoring Procedures",
    ],
  },
  {
    id: "subtask-1.5",
    taskId: "task-1",
    title: "1.5 Inspect Fire and Safety Equipment",
    description: "Conduct regular inspections of fire and safety equipment",
    requirements:
      "Must perform systematic inspections and document findings according to safety standards",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Fire Safety Inspection Checklist", "Safety Equipment Manual"],
  },
  {
    id: "subtask-1.6",
    taskId: "task-1",
    title: "1.6 Top Up Lubrication",
    description: "Perform lubrication top-up procedures on equipment",
    requirements:
      "Must identify lubrication points and apply correct lubricant types and quantities",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Lubrication Schedule", "Lubricant Specifications"],
  },
  {
    id: "subtask-1.7",
    taskId: "task-1",
    title: "1.7 Bypass and isolate control valves for maintenance",
    description:
      "Safely bypass and isolate control valves for maintenance work",
    requirements:
      "Must follow lockout/tagout procedures and properly isolate valves for safe maintenance",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Valve Isolation Procedures",
      "LOTO Standards",
      "Bypass Procedures",
    ],
  },
  {
    id: "subtask-1.8",
    taskId: "task-1",
    title: "1.8 Return control valve to service",
    description: "Safely return control valves to service after maintenance",
    requirements:
      "Must verify valve integrity and return to service following proper startup procedures",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Startup Procedures", "Valve Commissioning Checklist"],
  },
  {
    id: "subtask-1.9",
    taskId: "task-1",
    title: "1.9 Bypass filters and isolate for maintenance",
    description: "Bypass and isolate filters for maintenance activities",
    requirements:
      "Must safely bypass filter systems and isolate for maintenance without process disruption",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Filter Bypass Procedures", "Isolation Standards"],
  },
  {
    id: "subtask-1.10",
    taskId: "task-1",
    title: "1.10 Switch over pumps and isolate for maintenance",
    description: "Switch pump operations and isolate for maintenance",
    requirements:
      "Must perform pump switchover and isolation following safe operating procedures",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Pump Operating Procedures", "Switchover Guidelines"],
  },
  {
    id: "subtask-1.11",
    taskId: "task-1",
    title: "1.11 Return Pumps to service",
    description: "Return pumps to service after maintenance completion",
    requirements:
      "Must verify pump readiness and return to service following commissioning procedures",
    sectionId: "sec-1", // Migrated to default section
    resources: ["Pump Startup Procedures", "Commissioning Checklist"],
  },
  // Task 2: Operate Yogokawa DC Console
  {
    id: "subtask-2.1",
    taskId: "task-2",
    title: "2.1 Demonstrate knowledge of basic features",
    description: "Show understanding of basic Yokogawa DCS console features",
    requirements:
      "Must demonstrate proficiency in basic console navigation, alarm acknowledgment, and trend viewing",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Yokogawa DCS Basic Training",
      "Console User Manual",
      "Navigation Guide",
    ],
  },
  {
    id: "subtask-2.2",
    taskId: "task-2",
    title: "2.2 Operate with proficiency",
    description: "Operate the console system with proficiency and confidence",
    requirements:
      "Must perform routine console operations efficiently and handle multiple tasks simultaneously",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Advanced Console Operations",
      "Multi-tasking Guide",
      "Efficiency Standards",
    ],
  },
  {
    id: "subtask-2.3",
    taskId: "task-2",
    title: "2.3 Demonstrate expertise good enough to train other employees",
    description: "Exhibit expert-level knowledge sufficient to train others",
    requirements:
      "Must demonstrate comprehensive system knowledge and ability to instruct and mentor other operators",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Train-the-Trainer Program",
      "Mentoring Guidelines",
      "Expert-Level Operations",
    ],
  },
  {
    id: "subtask-2.4",
    taskId: "task-2",
    title: "2.4 Ability to analyse data and provide resolution to problems",
    description: "Analyze console data and resolve operational problems",
    requirements:
      "Must interpret system data, diagnose issues, and implement effective solutions",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Data Analysis Techniques",
      "Troubleshooting Guide",
      "Problem Resolution Framework",
    ],
  },
  {
    id: "subtask-2.5",
    taskId: "task-2",
    title:
      "2.5 Perform tasks related to system maintenance (backup/restore, tuning, system updates)",
    description:
      "Conduct system maintenance including backups, tuning, and updates",
    requirements:
      "Must perform system backups, database maintenance, tuning operations, and apply system updates",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "System Maintenance Manual",
      "Backup Procedures",
      "Update Guidelines",
    ],
  },
  {
    id: "subtask-2.6",
    taskId: "task-2",
    title: "2.6 Ability to recommend optimization strategies",
    description: "Provide recommendations for console and process optimization",
    requirements:
      "Must analyze system performance and provide actionable optimization recommendations",
    sectionId: "sec-1", // Migrated to default section
    resources: [
      "Optimization Strategies",
      "Performance Analysis Tools",
      "Best Practices Guide",
    ],
  },
];
