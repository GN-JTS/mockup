import { User } from "@/types";
import { UserRole } from "@/utils/constants";

export const mockUsers: User[] = [
  // Admin
  {
    id: "user-1",
    name: "Sarah Admin",
    email: "sarah.admin@jts.com",
    role: UserRole.ADMIN,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc10", // GC10
  },
  // Upper Managers
  {
    id: "user-2",
    name: "John UpperManager",
    email: "john.upper@jts.com",
    role: UserRole.UPPER_MANAGER,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc10", // GC10
  },
  // Managers
  {
    id: "user-3",
    name: "Emily Manager",
    email: "emily.manager@jts.com",
    role: UserRole.MANAGER,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc9", // GC9
  },
  {
    id: "user-4",
    name: "Michael Manager",
    email: "michael.manager@jts.com",
    role: UserRole.TRAINING_MANAGER, // Changed to Training Manager
    departmentId: "dept-2",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc9", // GC9
  },
  // Training Managers
  {
    id: "user-5",
    name: "Lisa Training",
    email: "lisa.training@jts.com",
    role: UserRole.TRAINING_MANAGER,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc9", // GC9
  },
  {
    id: "user-6",
    name: "David Training",
    email: "david.training@jts.com",
    role: UserRole.TRAINING_MANAGER,
    departmentId: "dept-2",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc9", // GC9
  },
  // Mentors
  {
    id: "user-7",
    name: "Robert Mentor",
    email: "robert.mentor@jts.com",
    role: UserRole.MENTOR,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator", // Field Operator
    gradeId: "grade-gc10", // GC10
    mentorFor: [
      {
        departmentId: "dept-1",
        sectionId: "sec-1",
        gradeId: "grade-gc7", // Can mentor employees targeting GC7
      },
    ],
  },
  {
    id: "user-8",
    name: "Jennifer Mentor",
    email: "jennifer.mentor@jts.com",
    role: UserRole.MENTOR,
    departmentId: "dept-1",
    sectionId: "sec-2",
    jobTitleId: "job-console-operator", // Console Operator
    gradeId: "grade-gc10", // GC10
    mentorFor: [
      {
        departmentId: "dept-1",
        sectionId: "sec-2",
        gradeId: "grade-gc8", // Can mentor employees targeting GC8
      },
    ],
  },
  {
    id: "user-9",
    name: "William Mentor",
    email: "william.mentor@jts.com",
    role: UserRole.MENTOR,
    departmentId: "dept-2",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator", // Console Operator
    gradeId: "grade-gc10", // GC10
    mentorFor: [
      {
        departmentId: "dept-2",
        sectionId: "sec-3",
        gradeId: "grade-gc9", // Can mentor employees targeting GC9
      },
    ],
  },
  // Evaluators
  {
    id: "user-10",
    name: "Patricia Evaluator",
    email: "patricia.eval@jts.com",
    role: UserRole.EVALUATOR,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc10", // GC10
    evaluatorFor: [
      {
        departmentId: "dept-1",
        sectionId: "sec-1",
        gradeId: "grade-gc7", // Can evaluate employees targeting GC7
      },
    ],
  },
  {
    id: "user-11",
    name: "James Evaluator",
    email: "james.eval@jts.com",
    role: UserRole.EVALUATOR,
    departmentId: "dept-1",
    sectionId: "sec-2",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc10", // GC10
    evaluatorFor: [
      {
        departmentId: "dept-1",
        sectionId: "sec-2",
        gradeId: "grade-gc8", // Can evaluate employees targeting GC8
      },
    ],
  },
  {
    id: "user-12",
    name: "Linda Evaluator",
    email: "linda.eval@jts.com",
    role: UserRole.EVALUATOR,
    departmentId: "dept-2",
    sectionId: "sec-3",
    jobTitleId: "job-shift-supervisor", // Shift Supervisor
    gradeId: "grade-gc10", // GC10
    evaluatorFor: [
      {
        departmentId: "dept-2",
        sectionId: "sec-3",
        gradeId: "grade-gc9", // Can evaluate employees targeting GC9
      },
    ],
  },
  // Employees
  {
    id: "user-13",
    name: "Alex Employee",
    email: "alex.emp@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator", // Field Operator
    gradeId: "grade-gc6", // GC6 (currently, working toward GC7)
  },
  {
    id: "user-14",
    name: "Maria Employee",
    email: "maria.emp@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-2",
    jobTitleId: "job-console-operator", // Console Operator
    gradeId: "grade-gc7", // GC7 (currently, working toward GC8)
  },
  {
    id: "user-15",
    name: "Chris Employee",
    email: "chris.emp@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator", // Field Operator
    gradeId: "grade-gc6", // GC6 (just starting, working toward GC7)
  },
  {
    id: "user-16",
    name: "Diana Employee",
    email: "diana.emp@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-2",
    sectionId: "sec-3",
    jobTitleId: "job-console-operator", // Console Operator
    gradeId: "grade-gc8", // GC8 (working toward GC9)
  },
  {
    id: "user-17",
    name: "Sarah Johnson",
    email: "sarah.johnson@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc6",
  },
  {
    id: "user-18",
    name: "Michael Chen",
    email: "michael.chen@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc7",
  },
  {
    id: "user-19",
    name: "Emma Wilson",
    email: "emma.wilson@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-console-operator",
    gradeId: "grade-gc7",
  },
  {
    id: "user-20",
    name: "James Brown",
    email: "james.brown@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc8",
  },
  {
    id: "user-21",
    name: "Olivia Davis",
    email: "olivia.davis@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-shift-supervisor",
    gradeId: "grade-gc9",
  },
  {
    id: "user-22",
    name: "William Martinez",
    email: "william.martinez@jts.com",
    role: UserRole.EMPLOYEE,
    departmentId: "dept-1",
    sectionId: "sec-1",
    jobTitleId: "job-field-operator",
    gradeId: "grade-gc6",
  },
];
