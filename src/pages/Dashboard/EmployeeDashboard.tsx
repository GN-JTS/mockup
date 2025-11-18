import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  EmployeePromotion,
  EmployeeProgress,
  JobTitle,
  Grade,
  Appointment,
  AppointmentRequest,
  Certificate,
  PromotionRequirement,
} from "@/types";
import {
  EvaluationStatus,
  AppointmentStatus,
  AppointmentType,
} from "@/utils/constants";
import PromotionBadge from "@/components/common/PromotionBadge";
import ProgressIndicator from "@/components/common/ProgressIndicator";
import {
  TrophyIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BellIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Current promotion data
  const [currentJobTitle, setCurrentJobTitle] = useState<JobTitle | null>(null);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [activePromotion, setActivePromotion] =
    useState<EmployeePromotion | null>(null);
  const [targetJobTitle, setTargetJobTitle] = useState<JobTitle | null>(null);
  const [targetGrade, setTargetGrade] = useState<Grade | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);

  // Pending employee approvals
  const [pendingEmployeeApprovals, setPendingEmployeeApprovals] = useState<
    EmployeePromotion[]
  >([]);
  const [pendingApprovalDetails, setPendingApprovalDetails] = useState<
    Map<
      string,
      {
        targetJobTitle: JobTitle | null;
        targetGrade: Grade | null;
        requirement: PromotionRequirement | null;
      }
    >
  >(new Map());

  // Completed promotions
  const [completedPromotions, setCompletedPromotions] = useState<
    EmployeePromotion[]
  >([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<AppointmentRequest[]>(
    []
  );
  const [proposedRequests, setProposedRequests] = useState<
    AppointmentRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load all employee data in parallel
      const [
        jobTitleData,
        gradeData,
        allPromotions,
        allProgress,
        allAppointments,
        allRequests,
        certsData,
      ] = await Promise.all([
        mockApi.getJobTitleById(user.jobTitleId),
        mockApi.getGradeById(user.gradeId),
        mockApi.getEmployeePromotionsByEmployee(user.id),
        mockApi.getEmployeeProgressByEmployee(user.id),
        mockApi.getAppointmentsByUser(user.id),
        mockApi.getAppointmentRequestsByEmployee(user.id),
        mockApi.getCertificatesByEmployee(user.id),
      ]);

      setCurrentJobTitle(jobTitleData || null);
      setCurrentGrade(gradeData || null);
      setCertificates(certsData);

      // Find pending employee approvals
      const pendingApprovals = allPromotions.filter(
        (p) => p.status === "pending_employee_approval"
      );
      setPendingEmployeeApprovals(pendingApprovals);

      // Load details for pending approvals
      const detailsMap = new Map<
        string,
        {
          targetJobTitle: JobTitle | null;
          targetGrade: Grade | null;
          requirement: PromotionRequirement | null;
        }
      >();
      for (const promotion of pendingApprovals) {
        const [targetJT, targetG, requirement] = await Promise.all([
          mockApi.getJobTitleById(promotion.targetJobTitleId),
          mockApi.getGradeById(promotion.targetGradeId),
          mockApi.getPromotionRequirementById(promotion.requirementId),
        ]);
        detailsMap.set(promotion.id, {
          targetJobTitle: targetJT || null,
          targetGrade: targetG || null,
          requirement: requirement || null,
        });
      }
      setPendingApprovalDetails(detailsMap);

      // Find active promotion (exclude pending_employee_approval as it's not active yet)
      const active = allPromotions.find(
        (p) => p.status === "assigned" || p.status === "in_progress"
      );

      if (active) {
        setActivePromotion(active);

        // Load target job title and grade
        const [targetJT, targetG] = await Promise.all([
          mockApi.getJobTitleById(active.targetJobTitleId),
          mockApi.getGradeById(active.targetGradeId),
        ]);

        setTargetJobTitle(targetJT || null);
        setTargetGrade(targetG || null);

        // Filter progress for active promotion
        const activeProgress = allProgress.filter(
          (p) => p.promotionId === active.id
        );
        setProgress(activeProgress);
      }

      // Completed promotions
      const completed = allPromotions.filter((p) => p.status === "completed");
      setCompletedPromotions(completed);

      // Appointments
      const upcoming = allAppointments.filter(
        (a) => a.status === "confirmed" && new Date(a.date) >= new Date()
      );
      setUpcomingAppointments(upcoming);

      // Appointment requests
      const pending = allRequests.filter(
        (r) =>
          r.status === AppointmentStatus.PENDING ||
          r.status === AppointmentStatus.CONFIRMED
      );
      setPendingRequests(pending);

      const proposed = allRequests.filter(
        (r) => r.status === AppointmentStatus.PROPOSED
      );
      setProposedRequests(proposed);
    } catch (error) {
      console.error("Failed to load employee dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposedTime = async (requestId: string) => {
    try {
      await mockApi.updateAppointmentRequest(requestId, {
        status: AppointmentStatus.CONFIRMED,
        updatedAt: new Date().toISOString(),
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to accept proposed time:", error);
    }
  };

  const handleRejectProposedTime = async (requestId: string) => {
    try {
      await mockApi.updateAppointmentRequest(requestId, {
        status: AppointmentStatus.REJECTED,
        updatedAt: new Date().toISOString(),
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to reject proposed time:", error);
    }
  };

  const handleApprovePromotion = async (promotionId: string) => {
    if (!user) return;
    try {
      await mockApi.approvePromotionByEmployee(promotionId, user.id);
      showToast("Promotion accepted successfully!", "success");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to approve promotion:", error);
      showToast("Failed to approve promotion", "error");
    }
  };

  const handleRejectPromotion = async (
    promotionId: string,
    reason?: string
  ) => {
    if (!user) return;
    const rejectionReason =
      reason ||
      window.prompt("Please provide a reason for rejecting this promotion:");
    if (rejectionReason === null) return; // User cancelled

    try {
      await mockApi.rejectPromotionByEmployee(
        promotionId,
        user.id,
        rejectionReason
      );
      showToast("Promotion rejected", "info");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to reject promotion:", error);
      showToast("Failed to reject promotion", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate progress statistics
  const getProgressStats = () => {
    if (!progress.length)
      return { total: 0, mastered: 0, inProgress: 0, notStarted: 0 };

    const total = progress.length;
    const mastered = progress.filter(
      (p) =>
        p.mentorStatus === EvaluationStatus.MASTER &&
        p.evaluatorStatus === EvaluationStatus.MASTER
    ).length;
    const inProgress = progress.filter(
      (p) =>
        (p.mentorStatus === EvaluationStatus.ATTEMPT_1 ||
          p.mentorStatus === EvaluationStatus.ATTEMPT_2 ||
          p.evaluatorStatus === EvaluationStatus.ATTEMPT_1 ||
          p.evaluatorStatus === EvaluationStatus.ATTEMPT_2) &&
        !(
          p.mentorStatus === EvaluationStatus.MASTER &&
          p.evaluatorStatus === EvaluationStatus.MASTER
        )
    ).length;
    const notStarted = progress.filter(
      (p) =>
        p.mentorStatus === EvaluationStatus.NOT_STARTED &&
        p.evaluatorStatus === EvaluationStatus.NOT_STARTED
    ).length;

    return { total, mastered, inProgress, notStarted };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-6">
      {/* Header with Current Position */}
      <div className="card bg-linear-to-r from-primary-500 to-primary-700 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-primary-100 mt-1">Employee Dashboard</p>
          </div>
          {currentJobTitle && currentGrade && (
            <PromotionBadge
              jobTitle={currentJobTitle}
              grade={currentGrade}
              variant="current"
              size="lg"
            />
          )}
        </div>

        {/* Current Position Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-primary-100 text-sm">Current Job Title</p>
            <p className="text-xl font-semibold mt-1">
              {currentJobTitle?.name || "N/A"}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-primary-100 text-sm">Current Grade</p>
            <p className="text-xl font-semibold mt-1">
              {currentGrade?.name || "N/A"}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-primary-100 text-sm">Active Promotions</p>
            <p className="text-xl font-semibold mt-1">
              {activePromotion ? "1" : "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Subtasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mastered</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.mastered}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircleIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Not Started</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.notStarted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Employee Approvals */}
      {pendingEmployeeApprovals.length > 0 && (
        <div className="card border-2 border-orange-300 bg-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <BellIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Promotion Approval Required
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Your manager has approved the following promotion(s). Please review
            and accept or reject them.
          </p>
          <div className="space-y-4">
            {pendingEmployeeApprovals.map((promotion) => {
              const details = pendingApprovalDetails.get(promotion.id);
              return (
                <div
                  key={promotion.id}
                  className="bg-white border border-orange-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Promotion Assignment
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">From:</span>{" "}
                          {currentJobTitle?.name} {currentGrade?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">To:</span>{" "}
                          {details?.targetJobTitle?.name || "Loading..."}{" "}
                          {details?.targetGrade?.name || ""}
                        </p>
                        {details?.requirement && (
                          <p className="text-sm text-gray-500 mt-2">
                            {details.requirement.required.length} tasks •{" "}
                            {
                              details.requirement.required.flatMap(
                                (r) => r.subtaskIds
                              ).length
                            }{" "}
                            subtasks required
                          </p>
                        )}
                        {promotion.approvedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Manager approved on:{" "}
                            {new Date(
                              promotion.approvedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprovePromotion(promotion.id)}
                      className="btn btn-primary flex-1"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2 inline" />
                      Accept Promotion
                    </button>
                    <button
                      onClick={() => handleRejectPromotion(promotion.id)}
                      className="btn btn-danger flex-1"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2 inline" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Promotion */}
      {activePromotion ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                My Active Promotion
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activePromotion.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {activePromotion.status === "in_progress"
                ? "In Progress"
                : "Assigned"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Target Promotion */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                Promotion Target
              </p>
              {targetJobTitle && targetGrade && (
                <PromotionBadge
                  jobTitle={targetJobTitle}
                  grade={targetGrade}
                  variant="target"
                />
              )}
            </div>

            {/* Progress Overview */}
            <div>
              <ProgressIndicator
                current={stats.mastered}
                total={stats.total}
                label="Overall Progress"
                showPercentage={true}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.mastered}
                </p>
                <p className="text-sm text-gray-600">Mastered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.notStarted}
                </p>
                <p className="text-sm text-gray-600">Not Started</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/promotions/${activePromotion.id}`)}
                className="btn btn-primary flex-1"
              >
                View Full Progress Tree
              </button>
              <button
                onClick={() => navigate("/appointments/book")}
                className="btn btn-secondary flex-1"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 bg-gray-50">
          <TrophyIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Promotion
          </h3>
          <p className="text-gray-600">
            You don't have any active promotions at the moment. Contact your
            Training Manager to get assigned.
          </p>
        </div>
      )}

      {/* Appointment Requests Section */}
      {proposedRequests.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BellIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Action Required: Proposed Time Changes
            </h2>
          </div>
          <div className="space-y-3">
            {proposedRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.type === AppointmentType.MENTORSHIP
                        ? "Mentorship"
                        : "Evaluation"}{" "}
                      Session - Time Change Proposed
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.notes}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Your Requested Time</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(request.requestedDate).toLocaleDateString()} at{" "}
                      {request.requestedStartTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Proposed New Time</p>
                    <p className="text-sm font-medium text-green-700">
                      {request.proposedDate &&
                        new Date(
                          request.proposedDate
                        ).toLocaleDateString()}{" "}
                      at {request.proposedStartTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAcceptProposedTime(request.id)}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Accept New Time
                  </button>
                  <button
                    onClick={() => handleRejectProposedTime(request.id)}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    Reject & Request Different Time
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Upcoming Appointments
            </h2>
          </div>

          {upcomingAppointments.length === 0 && pendingRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CalendarIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No upcoming appointments</p>
              <button
                onClick={() => navigate("/appointments/book")}
                className="btn btn-primary mt-4"
              >
                Book New Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Confirmed Appointments */}
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border-2 border-green-200 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.type === AppointmentType.MENTORSHIP
                        ? "Mentorship Session"
                        : "Evaluation Session"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(appointment.date).toLocaleDateString()} at{" "}
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                    {appointment.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    ✓ Confirmed
                  </span>
                </div>
              ))}

              {/* Pending Requests */}
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.type === AppointmentType.MENTORSHIP
                        ? "Mentorship Request"
                        : "Evaluation Request"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(request.requestedDate).toLocaleDateString()} at{" "}
                      {request.requestedStartTime}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {request.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-yellow-600">
                    ⏳ Pending Approval
                  </span>
                </div>
              ))}
            </div>
          )}

          {(upcomingAppointments.length > 0 || pendingRequests.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate("/appointments")}
                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                View All Appointments →
              </button>
            </div>
          )}
        </div>

        {/* Certificates & Completed Promotions */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AcademicCapIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              My Achievements
            </h2>
          </div>

          {certificates.length === 0 && completedPromotions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AcademicCapIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No certificates earned yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Complete your current promotion to earn your first certificate!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Certificates */}
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Certificate Earned
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cert.certificateNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/certificates/${cert.id}`)}
                      className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}

              {/* Completed Promotions */}
              {completedPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="p-4 border border-gray-200 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Promotion Completed
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {promo.completedAt &&
                          new Date(promo.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ))}

              {certificates.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate("/certificates")}
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    View All Certificates →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/requirements")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <AcademicCapIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Browse Requirements</p>
            <p className="text-sm text-gray-500 mt-1">
              View all available training requirements
            </p>
          </button>
          <button
            onClick={() => navigate("/appointments/book")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <CalendarIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Book Appointment</p>
            <p className="text-sm text-gray-500 mt-1">
              Schedule a mentorship or evaluation session
            </p>
          </button>
          <button
            onClick={() => navigate("/certificates")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <CheckCircleIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">My Certificates</p>
            <p className="text-sm text-gray-500 mt-1">
              View and download earned certificates
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
