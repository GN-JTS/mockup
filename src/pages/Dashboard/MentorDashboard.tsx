import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  EmployeePromotion,
  EmployeeProgress,
  User,
  AppointmentRequest,
  Appointment,
  JobTitle,
  Grade,
} from "@/types";
import {
  EvaluationStatus,
  PromotionStatus,
  AppointmentStatus,
} from "@/utils/constants";
import PromotionBadge from "@/components/common/PromotionBadge";
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myEmployees, setMyEmployees] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<EmployeePromotion[]>([]);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<
    AppointmentRequest[]
  >([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [
          allUsers,
          allPromotions,
          allProgress,
          requests,
          appointments,
          jobTitlesData,
          gradesData,
        ] = await Promise.all([
          mockApi.getUsers(),
          mockApi.getEmployeePromotions(),
          mockApi.getEmployeeProgress(),
          mockApi.getAppointmentRequestsByMentor(user.id),
          mockApi.getAppointmentsByUser(user.id),
          mockApi.getJobTitles(),
          mockApi.getGrades(),
        ]);

        // Filter employees based on mentor scope AND their target promotion grade
        const employeesUnderMentorship = allUsers.filter((u) => {
          // Find active promotions for this employee
          const activePromotion = allPromotions.find(
            (p) =>
              p.employeeId === u.id &&
              (p.status === "assigned" || p.status === "in_progress")
          );

          if (!activePromotion) return false;

          // Check if mentor can handle this employee's target grade
          return user.mentorFor?.some(
            (scope) =>
              u.departmentId === scope.departmentId &&
              u.sectionId === scope.sectionId &&
              activePromotion.targetGradeId === scope.gradeId // Match target grade, not current
          );
        });

        const employeeIds = employeesUnderMentorship.map((e) => e.id);
        const relevantPromotions = allPromotions.filter((p) =>
          employeeIds.includes(p.employeeId)
        );
        const relevantProgress = allProgress.filter((p) =>
          employeeIds.includes(p.employeeId)
        );

        setMyEmployees(employeesUnderMentorship);
        setPromotions(relevantPromotions);
        setProgress(relevantProgress);
        setAppointmentRequests(requests.filter((r) => r.status === "pending"));
        setUpcomingAppointments(
          appointments.filter((a) => a.status === "confirmed")
        );
        setJobTitles(jobTitlesData);
        setGrades(gradesData);
      } catch (error) {
        console.error("Failed to load mentor dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getEmployeeMentorProgress = (employeeId: string) => {
    const employeeProgress = progress.filter(
      (p) => p.employeeId === employeeId
    );
    const total = employeeProgress.length;
    const mastered = employeeProgress.filter(
      (p) => p.mentorStatus === EvaluationStatus.MASTER
    ).length;
    const needsEvaluation = employeeProgress.filter(
      (p) =>
        p.mentorStatus === EvaluationStatus.NOT_STARTED ||
        p.mentorStatus === EvaluationStatus.ATTEMPT_1 ||
        p.mentorStatus === EvaluationStatus.ATTEMPT_2
    ).length;
    return { total, mastered, needsEvaluation };
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const request = appointmentRequests.find((r) => r.id === requestId);
      if (!request) {
        console.error("Request not found");
        return;
      }

      // Update request status to approved
      await mockApi.updateAppointmentRequest(requestId, {
        status: AppointmentStatus.APPROVED,
        updatedAt: new Date().toISOString(),
      });

      // Create appointment from approved request
      const appointment = {
        id: `appt-${Date.now()}`,
        appointmentRequestId: requestId,
        employeeId: request.employeeId,
        mentorOrEvaluatorId: request.mentorOrEvaluatorId,
        promotionId: request.promotionId,
        type: request.type,
        date: request.requestedDate,
        startTime: request.requestedStartTime,
        endTime: request.requestedEndTime,
        status: "confirmed",
        notes: request.notes,
        subtaskIds: request.subtaskIds,
      };

      await mockApi.createAppointment(appointment);

      // Send notification to employee
      const employee = await mockApi.getUserById(request.employeeId);
      if (employee) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: employee.id,
          type: "appointment_approved",
          title: "Appointment Approved",
          message: `Your ${
            request.type === "mentorship" ? "mentorship" : "evaluation"
          } appointment with ${user.name} has been approved.`,
          relatedId: appointment.id,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      // Refresh appointment requests
      const requests = await mockApi.getAppointmentRequestsByMentor(user.id);
      setAppointmentRequests(
        requests.filter((r) => r.status === AppointmentStatus.PENDING)
      );

      const appointments = await mockApi.getAppointmentsByUser(user.id);
      setUpcomingAppointments(
        appointments.filter((a) => a.status === "confirmed")
      );
    } catch (error) {
      console.error("Failed to approve appointment request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const request = appointmentRequests.find((r) => r.id === requestId);
      if (!request) {
        console.error("Request not found");
        return;
      }

      const reason = window.prompt(
        "Please provide a reason for rejecting this appointment:"
      );
      if (reason === null) return; // User cancelled

      await mockApi.updateAppointmentRequest(requestId, {
        status: AppointmentStatus.REJECTED,
        updatedAt: new Date().toISOString(),
      });

      // Send notification to employee
      const employee = await mockApi.getUserById(request.employeeId);
      if (employee) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: employee.id,
          type: "appointment_rejected",
          title: "Appointment Rejected",
          message: `Your ${
            request.type === "mentorship" ? "mentorship" : "evaluation"
          } appointment with ${user.name} has been rejected.${
            reason ? ` Reason: ${reason}` : ""
          }`,
          relatedId: requestId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      // Refresh appointment requests
      const requests = await mockApi.getAppointmentRequestsByMentor(user.id);
      setAppointmentRequests(
        requests.filter((r) => r.status === AppointmentStatus.PENDING)
      );
    } catch (error) {
      console.error("Failed to reject appointment request:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activePromotions = promotions.filter(
    (p) =>
      p.status === PromotionStatus.ASSIGNED ||
      p.status === PromotionStatus.IN_PROGRESS
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Guide employees through their promotion journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {myEmployees.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Promotions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {activePromotions.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Requests
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {appointmentRequests.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Upcoming Sessions
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {upcomingAppointments.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Appointment Requests */}
      {appointmentRequests.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Appointment Requests
          </h2>
          <div className="space-y-3">
            {appointmentRequests.map((request) => {
              const employee = myEmployees.find(
                (e) => e.id === request.employeeId
              );
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {employee?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(request.requestedDate).toLocaleDateString()} at{" "}
                      {request.requestedStartTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProposeNewTime(request.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Propose New Time
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Employees */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Employees
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Promotion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myEmployees.map((employee) => {
                const jobTitle = jobTitles.find(
                  (jt) => jt.id === employee.jobTitleId
                );
                const grade = grades.find((g) => g.id === employee.gradeId);
                const activePromotion = promotions.find(
                  (p) =>
                    p.employeeId === employee.id &&
                    (p.status === PromotionStatus.ASSIGNED ||
                      p.status === PromotionStatus.IN_PROGRESS)
                );
                const targetJobTitle = activePromotion
                  ? jobTitles.find(
                      (jt) => jt.id === activePromotion.targetJobTitleId
                    )
                  : null;
                const targetGrade = activePromotion
                  ? grades.find((g) => g.id === activePromotion.targetGradeId)
                  : null;
                const { total, mastered, needsEvaluation } =
                  getEmployeeMentorProgress(employee.id);

                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {jobTitle && grade && (
                        <PromotionBadge
                          jobTitle={jobTitle}
                          grade={grade}
                          variant="current"
                          size="sm"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activePromotion && targetJobTitle && targetGrade ? (
                        <PromotionBadge
                          jobTitle={targetJobTitle}
                          grade={targetGrade}
                          variant="target"
                          size="sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {total > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {mastered}/{total} Mastered
                          </p>
                          {needsEvaluation > 0 && (
                            <p className="text-xs text-orange-600">
                              {needsEvaluation} need evaluation
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activePromotion ? (
                        <button
                          onClick={() =>
                            navigate(
                              `/mentor/employee-promotion/${activePromotion.id}`
                            )
                          }
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View & Evaluate
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          No active promotion
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => {
              const employee = myEmployees.find(
                (e) => e.id === appointment.employeeId
              );
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {employee?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date).toLocaleDateString()} at{" "}
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Confirmed
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
