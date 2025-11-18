import { SectionJobTitleMapping, SectionGradeMapping } from "@/types";

// Section → Job Title Mappings
// Defines which job titles are available in each section
export const mockSectionJobTitleMappings: SectionJobTitleMapping[] = [
  // Section 1 (Control Section) - All job titles
  {
    id: "mapping-sec1-field",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mapping-sec1-console",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mapping-sec1-supervisor",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 2 (Maintenance Section) - Example: Only Field Operator
  {
    id: "mapping-sec2-field",
    sectionId: "sec-2",
    jobTitleId: "job-field-operator",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 3 (Production Section) - Example: Console Operator and Supervisor
  {
    id: "mapping-sec3-console",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mapping-sec3-supervisor",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

// Section → Grade Mappings
// Defines which grades are available for each job title in each section
export const mockSectionGradeMappings: SectionGradeMapping[] = [
  // Section 1 - Field Operator: Grades GC6-GC10
  {
    id: "grade-mapping-sec1-field-gc6",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc6",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-field-gc7",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc7",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-field-gc8",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc8",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-field-gc9",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc9",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-field-gc10",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc10",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 1 - Console Operator: Grades GC7-GC10
  {
    id: "grade-mapping-sec1-console-gc7",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc7",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-console-gc8",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc8",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-console-gc9",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc9",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-console-gc10",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc10",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 1 - Shift Supervisor: Grades GC9-GC10
  {
    id: "grade-mapping-sec1-supervisor-gc9",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc9",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec1-supervisor-gc10",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc10",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 2 - Field Operator: Grades GC6-GC8 (different range)
  {
    id: "grade-mapping-sec2-field-gc6",
    sectionId: "sec-2",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc6",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec2-field-gc7",
    sectionId: "sec-2",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc7",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec2-field-gc8",
    sectionId: "sec-2",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc8",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 3 - Console Operator: Grades GC7-GC9
  {
    id: "grade-mapping-sec3-console-gc7",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc7",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec3-console-gc8",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc8",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec3-console-gc9",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc9",
    createdAt: "2024-01-15T10:00:00Z",
  },
  // Section 3 - Shift Supervisor: Grades GC9-GC10
  {
    id: "grade-mapping-sec3-supervisor-gc9",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc9",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "grade-mapping-sec3-supervisor-gc10",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc10",
    createdAt: "2024-01-15T10:00:00Z",
  },
];
