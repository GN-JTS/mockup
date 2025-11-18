import {
  AppointmentRequest,
  Appointment,
  CalendarSlot,
  WorkingHours,
} from "@/types";
import {
  AppointmentStatus,
  AppointmentType,
  CalendarSlotStatus,
} from "@/utils/constants";

export const mockAppointmentRequests: AppointmentRequest[] = [
  // ===== Alex Employee (promo-1) =====
  // Pending request with Robert Mentor
  {
    id: "req-1",
    employeeId: "user-13", // Alex Employee
    mentorOrEvaluatorId: "user-7", // Robert Mentor
    promotionId: "promo-1",
    type: "mentorship" as AppointmentType,
    status: AppointmentStatus.PENDING,
    requestedDate: "2024-11-20",
    requestedStartTime: "10:00",
    requestedEndTime: "11:00",
    notes: "Need mentoring for subtask 1.3 - Respond to Plan Emergency",
    createdAt: "2024-11-15T09:00:00Z",
    updatedAt: "2024-11-15T09:00:00Z",
    subtaskIds: ["subtask-1.3"],
  },

  // ===== Maria Employee (promo-2) =====
  // Proposed alternative time by Jennifer Mentor
  {
    id: "req-2",
    employeeId: "user-14", // Maria Employee
    mentorOrEvaluatorId: "user-8", // Jennifer Mentor
    promotionId: "promo-2",
    type: "mentorship" as AppointmentType,
    status: AppointmentStatus.PROPOSED,
    requestedDate: "2024-11-19",
    requestedStartTime: "14:00",
    requestedEndTime: "15:00",
    proposedDate: "2024-11-20",
    proposedStartTime: "09:00",
    proposedEndTime: "10:00",
    proposedBy: "user-8",
    notes: "Re-evaluation for subtask 1.4 - Monitor Abnormal Conditions",
    createdAt: "2024-11-14T10:00:00Z",
    updatedAt: "2024-11-15T14:00:00Z",
    subtaskIds: ["subtask-1.4"],
  },

  // Confirmed request with James Evaluator
  {
    id: "req-3",
    employeeId: "user-14", // Maria Employee
    mentorOrEvaluatorId: "user-11", // James Evaluator
    promotionId: "promo-2",
    type: "evaluation" as AppointmentType,
    status: AppointmentStatus.CONFIRMED,
    requestedDate: "2024-11-22",
    requestedStartTime: "10:00",
    requestedEndTime: "11:30",
    notes: "Final evaluation for subtask 1.2 - Report Emergency Conditions",
    createdAt: "2024-11-10T09:00:00Z",
    updatedAt: "2024-11-11T10:00:00Z",
    subtaskIds: ["subtask-1.2"],
  },

  // ===== Chris Employee (promo-3) =====
  // Pending first mentorship session
  {
    id: "req-4",
    employeeId: "user-15", // Chris Employee
    mentorOrEvaluatorId: "user-7", // Robert Mentor
    promotionId: "promo-3",
    type: "mentorship" as AppointmentType,
    status: AppointmentStatus.PENDING,
    requestedDate: "2024-11-21",
    requestedStartTime: "14:00",
    requestedEndTime: "15:00",
    notes:
      "First mentorship session for subtask 1.1 - Perform/Accept Shift tasks",
    createdAt: "2024-11-16T10:00:00Z",
    updatedAt: "2024-11-16T10:00:00Z",
    subtaskIds: ["subtask-1.1"],
  },

  // ===== Diana Employee (promo-4) =====
  // Evaluator request for nearly completed promotion
  {
    id: "req-5",
    employeeId: "user-16", // Diana Employee
    mentorOrEvaluatorId: "user-12", // Linda Evaluator
    promotionId: "promo-4",
    type: "evaluation" as AppointmentType,
    status: AppointmentStatus.PENDING,
    requestedDate: "2024-11-23",
    requestedStartTime: "09:00",
    requestedEndTime: "11:00",
    notes: "Final evaluations for subtasks 2.2, 2.3, 2.4",
    createdAt: "2024-11-16T14:00:00Z",
    updatedAt: "2024-11-16T14:00:00Z",
    subtaskIds: ["subtask-2.2", "subtask-2.3", "subtask-2.4"],
  },

  // Mentor re-evaluation request
  {
    id: "req-6",
    employeeId: "user-16", // Diana Employee
    mentorOrEvaluatorId: "user-9", // William Mentor
    promotionId: "promo-4",
    type: "mentorship" as AppointmentType,
    status: AppointmentStatus.CONFIRMED,
    requestedDate: "2024-11-19",
    requestedStartTime: "10:00",
    requestedEndTime: "11:00",
    notes: "Re-evaluation for subtask 2.4 - Analyze data and resolve problems",
    createdAt: "2024-11-14T11:00:00Z",
    updatedAt: "2024-11-15T09:00:00Z",
    subtaskIds: ["subtask-2.4"],
  },
];

export const mockAppointments: Appointment[] = [
  // ===== Confirmed Appointments =====
  {
    id: "appt-1",
    appointmentRequestId: "req-3",
    employeeId: "user-14", // Maria Employee
    mentorOrEvaluatorId: "user-11", // James Evaluator
    promotionId: "promo-2",
    type: "evaluation" as AppointmentType,
    date: "2024-11-22",
    startTime: "10:00",
    endTime: "11:30",
    status: "confirmed",
    notes: "Final evaluation for subtask 1.2",
    subtaskIds: ["subtask-1.2"],
  },
  {
    id: "appt-2",
    appointmentRequestId: "req-6",
    employeeId: "user-16", // Diana Employee
    mentorOrEvaluatorId: "user-9", // William Mentor
    promotionId: "promo-4",
    type: "mentorship" as AppointmentType,
    date: "2024-11-19",
    startTime: "10:00",
    endTime: "11:00",
    status: "confirmed",
    notes: "Re-evaluation for subtask 2.4",
    subtaskIds: ["subtask-2.4"],
  },

  // ===== Completed Appointments =====
  {
    id: "appt-3",
    appointmentRequestId: "req-old-1",
    employeeId: "user-13", // Alex Employee
    mentorOrEvaluatorId: "user-7", // Robert Mentor
    promotionId: "promo-1",
    type: "mentorship" as AppointmentType,
    date: "2024-10-20",
    startTime: "14:00",
    endTime: "15:00",
    status: "completed",
    completedAt: "2024-10-20T15:00:00Z",
    notes: "Mentorship for subtask 1.1 - Completed successfully",
    subtaskIds: ["subtask-1.1"],
  },
  {
    id: "appt-4",
    appointmentRequestId: "req-old-2",
    employeeId: "user-13", // Alex Employee
    mentorOrEvaluatorId: "user-7", // Robert Mentor
    promotionId: "promo-1",
    type: "mentorship" as AppointmentType,
    date: "2024-10-25",
    startTime: "10:00",
    endTime: "11:00",
    status: "completed",
    completedAt: "2024-10-25T11:00:00Z",
    notes: "Mentorship for subtask 1.2 - Needs more practice",
    subtaskIds: ["subtask-1.2"],
  },
  {
    id: "appt-5",
    appointmentRequestId: "req-old-3",
    employeeId: "user-14", // Maria Employee
    mentorOrEvaluatorId: "user-8", // Jennifer Mentor
    promotionId: "promo-2",
    type: "mentorship" as AppointmentType,
    date: "2024-10-25",
    startTime: "11:00",
    endTime: "12:00",
    status: "completed",
    completedAt: "2024-10-25T12:00:00Z",
    notes: "Mentorship for subtask 1.1 - Mastered",
    subtaskIds: ["subtask-1.1"],
  },
  {
    id: "appt-6",
    appointmentRequestId: "req-old-4",
    employeeId: "user-16", // Diana Employee
    mentorOrEvaluatorId: "user-9", // William Mentor
    promotionId: "promo-4",
    type: "mentorship" as AppointmentType,
    date: "2024-11-13",
    startTime: "11:00",
    endTime: "12:00",
    status: "completed",
    completedAt: "2024-11-13T12:00:00Z",
    notes: "Mentorship for subtask 2.3 - Excellent performance",
    subtaskIds: ["subtask-2.3"],
  },
];

// Calendar slots for mentors/evaluators
export const mockCalendarSlots: CalendarSlot[] = [
  // ===== Robert Mentor (user-7) - Week of Nov 18-22 =====
  {
    id: "slot-1",
    userId: "user-7",
    date: "2024-11-18",
    startTime: "09:00",
    endTime: "10:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-2",
    userId: "user-7",
    date: "2024-11-18",
    startTime: "10:00",
    endTime: "11:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-3",
    userId: "user-7",
    date: "2024-11-18",
    startTime: "14:00",
    endTime: "15:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-4",
    userId: "user-7",
    date: "2024-11-19",
    startTime: "09:00",
    endTime: "10:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-5",
    userId: "user-7",
    date: "2024-11-19",
    startTime: "14:00",
    endTime: "15:00",
    status: CalendarSlotStatus.BLOCKED,
  },
  {
    id: "slot-6",
    userId: "user-7",
    date: "2024-11-20",
    startTime: "10:00",
    endTime: "11:00",
    status: CalendarSlotStatus.PENDING_APPROVAL,
    appointmentId: "req-1",
  },
  {
    id: "slot-7",
    userId: "user-7",
    date: "2024-11-21",
    startTime: "14:00",
    endTime: "15:00",
    status: CalendarSlotStatus.PENDING_APPROVAL,
    appointmentId: "req-4",
  },

  // ===== Jennifer Mentor (user-8) - Week of Nov 18-22 =====
  {
    id: "slot-8",
    userId: "user-8",
    date: "2024-11-19",
    startTime: "09:00",
    endTime: "10:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-9",
    userId: "user-8",
    date: "2024-11-19",
    startTime: "14:00",
    endTime: "15:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-10",
    userId: "user-8",
    date: "2024-11-20",
    startTime: "09:00",
    endTime: "10:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-11",
    userId: "user-8",
    date: "2024-11-20",
    startTime: "10:00",
    endTime: "11:00",
    status: CalendarSlotStatus.AVAILABLE,
  },

  // ===== William Mentor (user-9) - Week of Nov 18-22 =====
  {
    id: "slot-12",
    userId: "user-9",
    date: "2024-11-19",
    startTime: "08:00",
    endTime: "09:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-13",
    userId: "user-9",
    date: "2024-11-19",
    startTime: "10:00",
    endTime: "11:00",
    status: CalendarSlotStatus.BOOKED,
    appointmentId: "appt-2",
  },
  {
    id: "slot-14",
    userId: "user-9",
    date: "2024-11-20",
    startTime: "09:00",
    endTime: "10:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-15",
    userId: "user-9",
    date: "2024-11-20",
    startTime: "10:00",
    endTime: "11:00",
    status: CalendarSlotStatus.AVAILABLE,
  },

  // ===== Patricia Evaluator (user-10) - Week of Nov 18-22 =====
  {
    id: "slot-16",
    userId: "user-10",
    date: "2024-11-20",
    startTime: "09:00",
    endTime: "10:30",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-17",
    userId: "user-10",
    date: "2024-11-20",
    startTime: "14:00",
    endTime: "15:30",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-18",
    userId: "user-10",
    date: "2024-11-21",
    startTime: "09:00",
    endTime: "10:30",
    status: CalendarSlotStatus.AVAILABLE,
  },

  // ===== James Evaluator (user-11) - Week of Nov 18-22 =====
  {
    id: "slot-19",
    userId: "user-11",
    date: "2024-11-21",
    startTime: "14:00",
    endTime: "15:30",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-20",
    userId: "user-11",
    date: "2024-11-22",
    startTime: "10:00",
    endTime: "11:30",
    status: CalendarSlotStatus.BOOKED,
    appointmentId: "appt-1",
  },
  {
    id: "slot-21",
    userId: "user-11",
    date: "2024-11-22",
    startTime: "14:00",
    endTime: "15:30",
    status: CalendarSlotStatus.AVAILABLE,
  },

  // ===== Linda Evaluator (user-12) - Week of Nov 18-22 =====
  {
    id: "slot-22",
    userId: "user-12",
    date: "2024-11-22",
    startTime: "09:00",
    endTime: "10:30",
    status: CalendarSlotStatus.AVAILABLE,
  },
  {
    id: "slot-23",
    userId: "user-12",
    date: "2024-11-23",
    startTime: "09:00",
    endTime: "11:00",
    status: CalendarSlotStatus.PENDING_APPROVAL,
    appointmentId: "req-5",
  },
  {
    id: "slot-24",
    userId: "user-12",
    date: "2024-11-23",
    startTime: "14:00",
    endTime: "16:00",
    status: CalendarSlotStatus.AVAILABLE,
  },
];

export const mockWorkingHours: WorkingHours[] = [
  // Robert Mentor (user-7) - Mon-Fri, 9am-5pm
  { userId: "user-7", dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { userId: "user-7", dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { userId: "user-7", dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { userId: "user-7", dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { userId: "user-7", dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },

  // Jennifer Mentor (user-8) - Mon-Fri, 9am-5pm
  { userId: "user-8", dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  { userId: "user-8", dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
  { userId: "user-8", dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
  { userId: "user-8", dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
  { userId: "user-8", dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },

  // William Mentor (user-9) - Mon-Fri, 8am-4pm
  { userId: "user-9", dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
  { userId: "user-9", dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
  { userId: "user-9", dayOfWeek: 3, startTime: "08:00", endTime: "16:00" },
  { userId: "user-9", dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
  { userId: "user-9", dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },

  // Patricia Evaluator (user-10) - Mon-Fri, 9am-6pm
  { userId: "user-10", dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
  { userId: "user-10", dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
  { userId: "user-10", dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
  { userId: "user-10", dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
  { userId: "user-10", dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },

  // James Evaluator (user-11) - Mon-Fri, 9am-6pm
  { userId: "user-11", dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
  { userId: "user-11", dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
  { userId: "user-11", dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
  { userId: "user-11", dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
  { userId: "user-11", dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },

  // Linda Evaluator (user-12) - Mon-Fri, 9am-6pm
  { userId: "user-12", dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
  { userId: "user-12", dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
  { userId: "user-12", dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
  { userId: "user-12", dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
  { userId: "user-12", dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
];
