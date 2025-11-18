// Mock API service with setTimeout to simulate async operations
import {
  mockUsers,
  mockDepartments,
  mockSections,
  mockTasks,
  mockSubtasks,
  mockJobTitles,
  mockGrades,
  mockPromotionRequirements,
  mockEmployeePromotions,
  mockEmployeeProgress,
  mockAppointmentRequests,
  mockAppointments,
  mockCalendarSlots,
  mockWorkingHours,
  mockCertificates,
  mockNotifications,
  mockSectionJobTitleMappings,
  mockSectionGradeMappings,
} from "../data";
import { AppointmentStatus } from "@/utils/constants";

// Simulate API delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API endpoints
export const mockApi = {
  // Auth
  async login(email: string, _password: string) {
    await delay(800);
    const user = mockUsers.find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");
    return { user, token: "mock-jwt-token" };
  },

  async getCurrentUser() {
    await delay(300);
    // Return first employee user for demo
    return mockUsers.find((u) => u.id === "user-13") || mockUsers[0];
  },

  // Users
  async getUsers() {
    await delay(500);
    return [...mockUsers];
  },

  async getUserById(id: string) {
    await delay(300);
    return mockUsers.find((u) => u.id === id);
  },

  // Departments & Sections
  async getDepartments() {
    await delay(300);
    return [...mockDepartments];
  },

  async getSections() {
    await delay(300);
    return [...mockSections];
  },

  // Tasks & Subtasks
  async getTasks() {
    await delay(400);
    return [...mockTasks];
  },

  async getTasksBySection(sectionId: string) {
    await delay(400);
    return mockTasks.filter(
      (t) => t.sectionId === sectionId || !t.sectionId // Include global tasks
    );
  },

  async assignTaskToSection(taskId: string, sectionId: string) {
    await delay(500);
    const task = mockTasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    task.sectionId = sectionId;
    task.updatedAt = new Date().toISOString();
    return task;
  },

  async getSubtasks() {
    await delay(400);
    return [...mockSubtasks];
  },

  async getSubtasksBySectionAndTask(sectionId: string, taskId: string) {
    await delay(400);
    return mockSubtasks.filter(
      (st) =>
        st.taskId === taskId && (st.sectionId === sectionId || !st.sectionId) // Include global subtasks
    );
  },

  async assignSubtaskToSectionTask(
    subtaskId: string,
    sectionId: string,
    taskId: string
  ) {
    await delay(500);
    const subtask = mockSubtasks.find((st) => st.id === subtaskId);
    if (!subtask) {
      throw new Error("Subtask not found");
    }
    if (subtask.taskId !== taskId) {
      throw new Error("Subtask does not belong to the specified task");
    }
    subtask.sectionId = sectionId;
    return subtask;
  },

  async getSubtasksByTaskId(taskId: string) {
    await delay(300);
    return mockSubtasks.filter((st) => st.taskId === taskId);
  },

  // Job Titles
  async getJobTitles() {
    await delay(500);
    return [...mockJobTitles];
  },

  async getJobTitlesBySection(sectionId: string) {
    await delay(400);
    // Get job titles that are mapped to this section
    const mappedJobTitleIds = mockSectionJobTitleMappings
      .filter((m) => m.sectionId === sectionId)
      .map((m) => m.jobTitleId);
    return mockJobTitles.filter(
      (jt) =>
        mappedJobTitleIds.includes(jt.id) ||
        jt.sectionId === sectionId ||
        !jt.sectionId // Include global job titles
    );
  },

  async getSectionJobTitleMappings(sectionId: string) {
    await delay(300);
    return mockSectionJobTitleMappings.filter((m) => m.sectionId === sectionId);
  },

  async assignJobTitleToSection(jobTitleId: string, sectionId: string) {
    await delay(500);
    // Check if mapping already exists
    const existing = mockSectionJobTitleMappings.find(
      (m) => m.sectionId === sectionId && m.jobTitleId === jobTitleId
    );
    if (existing) {
      return existing;
    }
    const newMapping = {
      id: `mapping-${Date.now()}`,
      sectionId,
      jobTitleId,
      createdAt: new Date().toISOString(),
    };
    mockSectionJobTitleMappings.push(newMapping);
    return newMapping;
  },

  async getJobTitleById(id: string) {
    await delay(300);
    return mockJobTitles.find((jt) => jt.id === id);
  },

  async createJobTitle(jobTitle: any) {
    await delay(600);
    const newJobTitle = {
      id: `job-${Date.now()}`,
      ...jobTitle,
    };
    mockJobTitles.push(newJobTitle);
    return newJobTitle;
  },

  async updateJobTitle(id: string, updates: any) {
    await delay(500);
    const index = mockJobTitles.findIndex((jt) => jt.id === id);
    if (index !== -1) {
      mockJobTitles[index] = {
        ...mockJobTitles[index],
        ...updates,
      };
      return mockJobTitles[index];
    }
    throw new Error("Job title not found");
  },

  async deleteJobTitle(id: string) {
    await delay(500);
    const index = mockJobTitles.findIndex((jt) => jt.id === id);
    if (index !== -1) {
      mockJobTitles.splice(index, 1);
      return true;
    }
    throw new Error("Job title not found");
  },

  // Grades
  async getGrades() {
    await delay(500);
    return [...mockGrades];
  },

  async getGradesBySectionAndJobTitle(sectionId: string, jobTitleId: string) {
    await delay(400);
    // Get grades that are mapped to this section + job title combination
    const mappedGradeIds = mockSectionGradeMappings
      .filter((m) => m.sectionId === sectionId && m.jobTitleId === jobTitleId)
      .map((m) => m.gradeId);
    return mockGrades.filter((g) => mappedGradeIds.includes(g.id));
  },

  async getSectionGradeMappings(sectionId: string, jobTitleId: string) {
    await delay(300);
    return mockSectionGradeMappings.filter(
      (m) => m.sectionId === sectionId && m.jobTitleId === jobTitleId
    );
  },

  async assignGradeToSectionJobTitle(
    sectionId: string,
    jobTitleId: string,
    gradeId: string
  ) {
    await delay(500);
    // Check if mapping already exists
    const existing = mockSectionGradeMappings.find(
      (m) =>
        m.sectionId === sectionId &&
        m.jobTitleId === jobTitleId &&
        m.gradeId === gradeId
    );
    if (existing) {
      return existing;
    }
    const newMapping = {
      id: `grade-mapping-${Date.now()}`,
      sectionId,
      jobTitleId,
      gradeId,
      createdAt: new Date().toISOString(),
    };
    mockSectionGradeMappings.push(newMapping);
    return newMapping;
  },

  async getGradeById(id: string) {
    await delay(300);
    return mockGrades.find((g) => g.id === id);
  },

  async createGrade(grade: any) {
    await delay(600);
    const newGrade = {
      id: `grade-${Date.now()}`,
      ...grade,
    };
    mockGrades.push(newGrade);
    return newGrade;
  },

  async updateGrade(id: string, updates: any) {
    await delay(500);
    const index = mockGrades.findIndex((g) => g.id === id);
    if (index !== -1) {
      mockGrades[index] = {
        ...mockGrades[index],
        ...updates,
      };
      return mockGrades[index];
    }
    throw new Error("Grade not found");
  },

  async deleteGrade(id: string) {
    await delay(500);
    const index = mockGrades.findIndex((g) => g.id === id);
    if (index !== -1) {
      mockGrades.splice(index, 1);
      return true;
    }
    throw new Error("Grade not found");
  },

  // Promotion Requirements
  async getPromotionRequirements() {
    await delay(500);
    return [...mockPromotionRequirements];
  },

  async getPromotionRequirementById(id: string) {
    await delay(300);
    return mockPromotionRequirements.find((pr) => pr.id === id);
  },

  async getPromotionRequirementByJobAndGrade(
    jobTitleId: string,
    gradeId: string
  ) {
    await delay(300);
    return mockPromotionRequirements.find(
      (pr) => pr.jobTitleId === jobTitleId && pr.gradeId === gradeId
    );
  },

  async getPromotionRequirementBySectionJobGrade(
    sectionId: string,
    jobTitleId: string,
    gradeId: string
  ) {
    await delay(300);
    return mockPromotionRequirements.find(
      (pr) =>
        pr.sectionId === sectionId &&
        pr.jobTitleId === jobTitleId &&
        pr.gradeId === gradeId
    );
  },

  async getPromotionRequirementsBySection(sectionId: string) {
    await delay(400);
    return mockPromotionRequirements.filter((pr) => pr.sectionId === sectionId);
  },

  async comparePromotionRequirements(
    currentReqId: string,
    targetReqId: string
  ) {
    await delay(500);
    const currentReq = mockPromotionRequirements.find(
      (pr) => pr.id === currentReqId
    );
    const targetReq = mockPromotionRequirements.find(
      (pr) => pr.id === targetReqId
    );
    if (!currentReq || !targetReq) {
      throw new Error("One or both requirements not found");
    }
    // Import comparison utility
    const { compareRequirements } = await import("@/utils/promotionComparison");
    return compareRequirements(currentReq, targetReq);
  },

  async createPromotionRequirement(requirement: any) {
    await delay(600);
    const newRequirement = {
      id: `req-${Date.now()}`,
      ...requirement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPromotionRequirements.push(newRequirement);
    return newRequirement;
  },

  async updatePromotionRequirement(id: string, updates: any) {
    await delay(500);
    const index = mockPromotionRequirements.findIndex((pr) => pr.id === id);
    if (index !== -1) {
      mockPromotionRequirements[index] = {
        ...mockPromotionRequirements[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return mockPromotionRequirements[index];
    }
    throw new Error("Promotion requirement not found");
  },

  async deletePromotionRequirement(id: string) {
    await delay(500);
    const index = mockPromotionRequirements.findIndex((pr) => pr.id === id);
    if (index !== -1) {
      mockPromotionRequirements.splice(index, 1);
      return true;
    }
    throw new Error("Promotion requirement not found");
  },

  // Employee Promotions
  async getEmployeePromotions() {
    await delay(500);
    return [...mockEmployeePromotions];
  },

  async getEmployeePromotionById(id: string) {
    await delay(300);
    return mockEmployeePromotions.find((ep) => ep.id === id);
  },

  async getEmployeePromotionsByEmployee(employeeId: string) {
    await delay(400);
    return mockEmployeePromotions.filter((ep) => ep.employeeId === employeeId);
  },

  async createEmployeePromotion(promotion: any) {
    await delay(600);
    const newPromotion = {
      id: `promo-${Date.now()}`,
      ...promotion,
      assignedAt: new Date().toISOString(),
    };
    mockEmployeePromotions.push(newPromotion);
    return newPromotion;
  },

  async updateEmployeePromotionStatus(id: string, status: string) {
    await delay(500);
    const index = mockEmployeePromotions.findIndex((ep) => ep.id === id);
    if (index !== -1) {
      mockEmployeePromotions[index].status = status as any;
      if (status === "completed") {
        mockEmployeePromotions[index].completedAt = new Date().toISOString();
      }
      return mockEmployeePromotions[index];
    }
    throw new Error("Employee promotion not found");
  },

  async approvePromotion(promotionId: string, managerId: string) {
    await delay(600);
    const index = mockEmployeePromotions.findIndex(
      (ep) => ep.id === promotionId
    );
    if (index !== -1) {
      mockEmployeePromotions[index].status = "pending_employee_approval" as any;
      mockEmployeePromotions[index].approvedBy = managerId;
      mockEmployeePromotions[index].approvedAt = new Date().toISOString();
      console.log(
        `✅ Manager approved promotion: ${promotionId}, status changed to 'pending_employee_approval'`
      );
      return mockEmployeePromotions[index];
    }
    throw new Error("Promotion not found");
  },

  async approvePromotionByEmployee(promotionId: string, employeeId: string) {
    await delay(600);
    const index = mockEmployeePromotions.findIndex(
      (ep) => ep.id === promotionId && ep.employeeId === employeeId
    );
    if (index !== -1) {
      mockEmployeePromotions[index].status = "assigned" as any;
      mockEmployeePromotions[index].employeeApprovedBy = employeeId;
      mockEmployeePromotions[index].employeeApprovedAt =
        new Date().toISOString();
      console.log(
        `✅ Employee approved promotion: ${promotionId}, status changed to 'assigned'`
      );
      return mockEmployeePromotions[index];
    }
    throw new Error("Promotion not found");
  },

  async rejectPromotionByEmployee(
    promotionId: string,
    employeeId: string,
    reason?: string
  ) {
    await delay(600);
    const index = mockEmployeePromotions.findIndex(
      (ep) => ep.id === promotionId && ep.employeeId === employeeId
    );
    if (index !== -1) {
      mockEmployeePromotions[index].status = "rejected" as any;
      mockEmployeePromotions[index].employeeRejectedBy = employeeId;
      mockEmployeePromotions[index].employeeRejectedAt =
        new Date().toISOString();
      mockEmployeePromotions[index].employeeRejectionReason = reason;
      console.log(
        `❌ Employee rejected promotion: ${promotionId}, reason: ${
          reason || "Not specified"
        }`
      );
      return mockEmployeePromotions[index];
    }
    throw new Error("Promotion not found");
  },

  async rejectPromotion(
    promotionId: string,
    managerId: string,
    reason?: string
  ) {
    await delay(600);
    const index = mockEmployeePromotions.findIndex(
      (ep) => ep.id === promotionId
    );
    if (index !== -1) {
      mockEmployeePromotions[index].status = "rejected" as any;
      mockEmployeePromotions[index].rejectedBy = managerId;
      mockEmployeePromotions[index].rejectedAt = new Date().toISOString();
      mockEmployeePromotions[index].rejectionReason = reason;
      console.log(
        `❌ Manager rejected promotion: ${promotionId}, reason: ${
          reason || "Not specified"
        }`
      );
      return mockEmployeePromotions[index];
    }
    throw new Error("Promotion not found");
  },

  async getPendingPromotionApprovals(
    departmentId?: string,
    sectionId?: string
  ) {
    await delay(500);
    return mockEmployeePromotions.filter((ep) => {
      if (ep.status !== "pending_approval") return false;
      if (!departmentId && !sectionId) return true;

      // Filter by department/section if provided
      const employee = mockUsers.find((u) => u.id === ep.employeeId);
      if (!employee) return false;

      if (departmentId && employee.departmentId !== departmentId) return false;
      if (sectionId && employee.sectionId !== sectionId) return false;

      return true;
    });
  },

  // Employee Progress
  async getEmployeeProgress() {
    await delay(500);
    return [...mockEmployeeProgress];
  },

  async getEmployeeProgressByPromotion(promotionId: string) {
    await delay(400);
    return mockEmployeeProgress.filter((ep) => ep.promotionId === promotionId);
  },

  async getEmployeeProgressByEmployee(employeeId: string) {
    await delay(400);
    return mockEmployeeProgress.filter((ep) => ep.employeeId === employeeId);
  },

  // Get all mastered subtasks from completed promotions + current level
  async getMasteredSubtasksForEmployee(employeeId: string) {
    await delay(400);

    const masteredSubtasks: string[] = [];

    // 1. Get employee's current job title, grade, and section
    const employee = mockUsers.find((u) => u.id === employeeId);
    if (
      employee &&
      employee.jobTitleId &&
      employee.gradeId &&
      employee.sectionId
    ) {
      // Find the requirement for employee's CURRENT level (section-specific)
      const currentRequirement = mockPromotionRequirements.find(
        (r) =>
          r.sectionId === employee.sectionId &&
          r.jobTitleId === employee.jobTitleId &&
          r.gradeId === employee.gradeId
      );

      if (currentRequirement) {
        // ALL subtasks for current level are considered mastered
        currentRequirement.required.forEach((reqTask) => {
          reqTask.subtaskIds.forEach((subtaskId) => {
            if (!masteredSubtasks.includes(subtaskId)) {
              masteredSubtasks.push(subtaskId);
            }
          });
        });
        console.log(
          `📚 Employee's current level (${employee.gradeId}) requires ${masteredSubtasks.length} subtasks - all marked as mastered`
        );
      }
    }

    // 2. Find all completed promotions for this employee
    const completedPromotions = mockEmployeePromotions.filter(
      (ep) => ep.employeeId === employeeId && ep.status === "completed"
    );

    // 3. Get all progress records for completed promotions where subtask is mastered
    completedPromotions.forEach((promotion) => {
      const progressRecords = mockEmployeeProgress.filter(
        (ep) =>
          ep.promotionId === promotion.id &&
          (ep.mentorStatus === "mastered" || ep.evaluatorStatus === "mastered")
      );
      progressRecords.forEach((pr) => {
        if (!masteredSubtasks.includes(pr.subtaskId)) {
          masteredSubtasks.push(pr.subtaskId);
        }
      });
    });

    return masteredSubtasks;
  },

  async updateEmployeeProgress(id: string, updates: any) {
    await delay(600);
    const index = mockEmployeeProgress.findIndex((ep) => ep.id === id);
    if (index !== -1) {
      mockEmployeeProgress[index] = {
        ...mockEmployeeProgress[index],
        ...updates,
      };
      return mockEmployeeProgress[index];
    }
    throw new Error("Employee progress not found");
  },

  async saveEmployeeProgressBatch(progressArray: any[]) {
    await delay(800);
    progressArray.forEach((progress) => {
      const existingIndex = mockEmployeeProgress.findIndex(
        (ep) =>
          ep.subtaskId === progress.subtaskId &&
          ep.promotionId === progress.promotionId
      );

      if (existingIndex >= 0) {
        mockEmployeeProgress[existingIndex] = {
          ...mockEmployeeProgress[existingIndex],
          ...progress,
        };
      } else {
        mockEmployeeProgress.push({
          id: `progress-${Date.now()}-${Math.random()}`,
          ...progress,
          history: [],
        });
      }
    });
    return true;
  },

  // Appointments
  async getAppointmentRequests() {
    await delay(500);
    return [...mockAppointmentRequests];
  },

  async getAppointmentRequestsByEmployee(employeeId: string) {
    await delay(400);
    return mockAppointmentRequests.filter((ar) => ar.employeeId === employeeId);
  },

  async getAppointmentRequestsByMentorEvaluator(userId: string) {
    await delay(400);
    return mockAppointmentRequests.filter(
      (ar) => ar.mentorOrEvaluatorId === userId
    );
  },

  async createAppointmentRequest(data: any) {
    await delay(600);
    const newRequest = {
      id: `req-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAppointmentRequests.push(newRequest);
    return newRequest;
  },

  async updateAppointmentRequest(id: string, updates: any) {
    await delay(500);
    const index = mockAppointmentRequests.findIndex((ar) => ar.id === id);
    if (index !== -1) {
      mockAppointmentRequests[index] = {
        ...mockAppointmentRequests[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return mockAppointmentRequests[index];
    }
    throw new Error("Appointment request not found");
  },

  async getAppointments() {
    await delay(500);
    return [...mockAppointments];
  },

  async getAppointmentsByEmployee(employeeId: string) {
    await delay(400);
    return mockAppointments.filter((a) => a.employeeId === employeeId);
  },

  async getAppointmentsByUser(userId: string) {
    await delay(400);
    return mockAppointments.filter(
      (a) => a.employeeId === userId || a.mentorOrEvaluatorId === userId
    );
  },

  async createAppointment(appointment: any) {
    await delay(500);
    const newAppointment = {
      ...appointment,
      id: appointment.id || `appt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  async getAppointmentRequestsByMentor(mentorId: string) {
    await delay(400);
    return mockAppointmentRequests.filter(
      (ar) => ar.mentorOrEvaluatorId === mentorId && ar.type === "mentorship"
    );
  },

  async getAppointmentRequestsByEvaluator(evaluatorId: string) {
    await delay(400);
    return mockAppointmentRequests.filter(
      (ar) => ar.mentorOrEvaluatorId === evaluatorId && ar.type === "evaluation"
    );
  },

  // Calendar
  async getCalendarSlots(userId: string) {
    await delay(400);
    return mockCalendarSlots.filter((cs) => cs.userId === userId);
  },

  async getWorkingHours(userId: string) {
    await delay(300);
    return mockWorkingHours.filter((wh) => wh.userId === userId);
  },

  async updateCalendarSlot(id: string, updates: any) {
    await delay(400);
    const index = mockCalendarSlots.findIndex((cs) => cs.id === id);
    if (index !== -1) {
      mockCalendarSlots[index] = { ...mockCalendarSlots[index], ...updates };
      return mockCalendarSlots[index];
    }
    throw new Error("Calendar slot not found");
  },

  // Certificates
  async getCertificates() {
    await delay(500);
    return [...mockCertificates];
  },

  async getCertificatesByEmployee(employeeId: string) {
    await delay(400);
    return mockCertificates.filter((c) => c.employeeId === employeeId);
  },

  // Mentor/Evaluator Filtering (using new user.mentorFor/evaluatorFor system)
  async getMentorsByDepartmentSection(
    departmentId: string,
    sectionId: string,
    gradeId?: string
  ) {
    await delay(400);
    return mockUsers.filter((u) => {
      if (u.role !== "mentor" || !u.mentorFor) return false;
      return u.mentorFor.some(
        (scope) =>
          scope.departmentId === departmentId &&
          scope.sectionId === sectionId &&
          (!gradeId || scope.gradeId === gradeId)
      );
    });
  },

  async getEvaluatorsByDepartmentSection(
    departmentId: string,
    sectionId: string,
    gradeId?: string
  ) {
    await delay(400);
    return mockUsers.filter((u) => {
      if (u.role !== "evaluator" || !u.evaluatorFor) return false;
      return u.evaluatorFor.some(
        (scope) =>
          scope.departmentId === departmentId &&
          scope.sectionId === sectionId &&
          (!gradeId || scope.gradeId === gradeId)
      );
    });
  },

  // Notifications
  async getNotifications(userId: string) {
    await delay(400);
    return mockNotifications.filter((n) => n.userId === userId);
  },

  async markNotificationAsRead(id: string) {
    await delay(300);
    const index = mockNotifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      mockNotifications[index].read = true;
      return mockNotifications[index];
    }
    throw new Error("Notification not found");
  },

  async createNotification(notification: any) {
    await delay(400);
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}`,
    };
    mockNotifications.push(newNotification);
    return newNotification;
  },

  // Create certificate (when promotion completed)
  async createCertificate(certificate: any) {
    await delay(600);
    const newCert = {
      id: `cert-${Date.now()}`,
      certificateNumber: `CERT-${Date.now()}`,
      ...certificate,
      issueDate: new Date().toISOString(),
    };
    mockCertificates.push(newCert);
    return newCert;
  },

  // Update appointment request status
  async updateAppointmentStatus(appointmentId: string, status: string) {
    await delay(400);
    const index = mockAppointmentRequests.findIndex(
      (a) => a.id === appointmentId
    );
    if (index >= 0) {
      mockAppointmentRequests[index].status = status as any;
      return mockAppointmentRequests[index];
    }
    throw new Error("Appointment request not found");
  },

  // Propose new appointment time (mentor/evaluator counter-proposes)
  async proposeNewAppointmentTime(
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) {
    await delay(400);
    const index = mockAppointmentRequests.findIndex(
      (a) => a.id === appointmentId
    );
    if (index >= 0) {
      mockAppointmentRequests[index].proposedDate = newDate;
      mockAppointmentRequests[index].proposedStartTime = newStartTime;
      mockAppointmentRequests[index].proposedEndTime = newEndTime;
      mockAppointmentRequests[index].status = AppointmentStatus.PROPOSED;
      return mockAppointmentRequests[index];
    }
    throw new Error("Appointment request not found");
  },
};
