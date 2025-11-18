import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockApi } from "@/mock/services/mockApi";
import {
  User,
  EmployeePromotion,
  EmployeeProgress,
  PromotionRequirement,
  JobTitle,
  Grade,
  Task,
  Subtask,
} from "@/types";
import { EvaluationStatus } from "@/utils/constants";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const EmployeeProgressView = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<User | null>(null);
  const [activePromotion, setActivePromotion] =
    useState<EmployeePromotion | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [requirement, setRequirement] = useState<PromotionRequirement | null>(
    null
  );
  const [jobTitle, setJobTitle] = useState<JobTitle | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [currentJobTitle, setCurrentJobTitle] = useState<JobTitle | null>(null);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && employeeId) {
        console.log("📱 Training Manager view visible - refreshing data");
        handleRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [employeeId]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    console.log("🔄 Training Manager refreshing employee progress...");
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    if (!employeeId) return;

    try {
      const employeeData = await mockApi.getUserById(employeeId);
      if (!employeeData) {
        navigate("/training-manager");
        return;
      }
      setEmployee(employeeData);

      const promotions = await mockApi.getEmployeePromotionsByEmployee(
        employeeId
      );
      const active = promotions.find(
        (p) =>
          p.status === "assigned" ||
          p.status === "in_progress" ||
          p.status === "pending_approval"
      );

      if (!active) {
        setLoading(false);
        return;
      }

      // Log if promotion is pending approval
      if (active.status === "pending_approval") {
        console.log("⏳ Promotion is pending manager approval");
      }

      setActivePromotion(active);

      const [
        requirementData,
        progressData,
        targetJobTitleData,
        targetGradeData,
        currentJobTitleData,
        currentGradeData,
        tasksData,
        subtasksData,
      ] = await Promise.all([
        mockApi.getPromotionRequirementById(active.requirementId),
        mockApi.getEmployeeProgressByPromotion(active.id),
        mockApi.getJobTitleById(active.targetJobTitleId),
        mockApi.getGradeById(active.targetGradeId),
        mockApi.getJobTitleById(employeeData.jobTitleId),
        mockApi.getGradeById(employeeData.gradeId),
        mockApi.getTasks(),
        mockApi.getSubtasks(),
      ]);

      console.log(
        `📊 [Training Manager] Loaded ${progressData.length} progress records`
      );
      console.log(
        `   Mastered: ${
          progressData.filter(
            (p) =>
              p.mentorStatus === EvaluationStatus.MASTER ||
              p.evaluatorStatus === EvaluationStatus.MASTER
          ).length
        }`
      );

      setRequirement(requirementData || null);
      setProgress(progressData);
      setJobTitle(targetJobTitleData || null);
      setGrade(targetGradeData || null);
      setCurrentJobTitle(currentJobTitleData || null);
      setCurrentGrade(currentGradeData || null);
      setTasks(tasksData);
      setSubtasks(subtasksData);
      setLastUpdated(new Date());

      // Auto-expand all tasks
      if (requirementData) {
        setExpandedTasks(
          new Set(requirementData.required.map((req) => req.taskId))
        );
      }
    } catch (error) {
      console.error("Failed to load employee progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getSubtaskProgress = (subtaskId: string) => {
    return progress.find((p) => p.subtaskId === subtaskId);
  };

  const getStatusIcon = (
    status: EvaluationStatus,
    role: "mentor" | "evaluator"
  ) => {
    const colorClass = role === "mentor" ? "text-indigo-600" : "text-red-600";

    switch (status) {
      case EvaluationStatus.MASTER:
        return <CheckCircleIcon className={`h-5 w-5 ${colorClass}`} />;
      case EvaluationStatus.ATTEMPT_1:
      case EvaluationStatus.ATTEMPT_2:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case EvaluationStatus.NOT_STARTED:
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.MASTER:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Mastered
          </span>
        );
      case EvaluationStatus.ATTEMPT_2:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Attempt 2
          </span>
        );
      case EvaluationStatus.ATTEMPT_1:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Attempt 1
          </span>
        );
      case EvaluationStatus.NOT_STARTED:
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            Not Started
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Employee not found</p>
        <button
          onClick={() => navigate("/training-manager")}
          className="btn btn-primary mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!activePromotion || !requirement) {
    return (
      <div className="space-y-6">
        <div className="card">
          <button
            onClick={() => navigate("/training-manager")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {employee.name}
          </h1>
          <p className="text-gray-600">No active promotion</p>
        </div>
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            This employee does not have an active promotion assignment.
          </p>
          <button
            onClick={() => navigate(`/training-manager/assign/${employee.id}`)}
            className="btn btn-primary"
          >
            Assign Promotion
          </button>
        </div>
      </div>
    );
  }

  const masteredCount = progress.filter(
    (p) =>
      p.mentorStatus === EvaluationStatus.MASTER &&
      p.evaluatorStatus === EvaluationStatus.MASTER
  ).length;
  const totalCount = progress.length;
  const percentage =
    totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-linear-to-r from-indigo-500 to-purple-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/training-manager")}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
            <p className="text-indigo-100">Promotion Progress Tracking</p>
          </div>
          <img
            src={
              employee.avatar ||
              `https://ui-avatars.com/api/?name=${employee.name}&background=random`
            }
            alt={employee.name}
            className="h-16 w-16 rounded-full border-4 border-white/20"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Current</p>
            <p className="font-semibold">
              {currentJobTitle?.name} {currentGrade?.name}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Target</p>
            <p className="font-semibold">
              {jobTitle?.name} {grade?.name}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Progress</p>
            <p className="font-semibold">{percentage}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-indigo-100 text-xs mb-1">Mastered</p>
            <p className="font-semibold">
              {masteredCount}/{totalCount}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {lastUpdated && (
            <p className="text-xs text-indigo-200 mt-2 text-right">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress Tree */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Required Tasks & Subtasks
        </h2>

        <div className="space-y-4">
          {requirement.required.map((reqTask) => {
            const task = tasks.find((t) => t.id === reqTask.taskId);
            if (!task) return null;

            const taskSubtasks = subtasks.filter((st) =>
              reqTask.subtaskIds.includes(st.id)
            );
            const isExpanded = expandedTasks.has(task.id);
            const taskMasteredCount = taskSubtasks.filter((st) => {
              const prog = getSubtaskProgress(st.id);
              return (
                prog &&
                prog.mentorStatus === EvaluationStatus.MASTER &&
                prog.evaluatorStatus === EvaluationStatus.MASTER
              );
            }).length;

            return (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Task Header */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {taskMasteredCount} / {taskSubtasks.length}
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            taskSubtasks.length > 0
                              ? (taskMasteredCount / taskSubtasks.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </button>

                {/* Subtasks */}
                {isExpanded && (
                  <div className="divide-y divide-gray-200">
                    {taskSubtasks.map((subtask) => {
                      const prog = getSubtaskProgress(subtask.id);
                      return (
                        <div key={subtask.id} className="p-4 bg-white">
                          <div className="flex items-start gap-4">
                            {/* Status Icons */}
                            <div className="flex gap-2 pt-1">
                              {getStatusIcon(
                                prog?.mentorStatus ||
                                  EvaluationStatus.NOT_STARTED,
                                "mentor"
                              )}
                              {getStatusIcon(
                                prog?.evaluatorStatus ||
                                  EvaluationStatus.NOT_STARTED,
                                "evaluator"
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {subtask.title}
                                  </p>
                                  {subtask.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {subtask.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 items-end ml-4">
                                  {getStatusBadge(
                                    prog?.mentorStatus ||
                                      EvaluationStatus.NOT_STARTED
                                  )}
                                  {getStatusBadge(
                                    prog?.evaluatorStatus ||
                                      EvaluationStatus.NOT_STARTED
                                  )}
                                </div>
                              </div>

                              {/* Feedback */}
                              {prog && (
                                <div className="mt-3 space-y-2">
                                  {prog.mentorFeedback && (
                                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                      <p className="text-xs font-medium text-indigo-900 mb-1">
                                        Mentor Feedback:
                                      </p>
                                      <p className="text-sm text-indigo-800">
                                        {prog.mentorFeedback}
                                      </p>
                                      {prog.mentorEvaluatedAt && (
                                        <p className="text-xs text-indigo-600 mt-1">
                                          {new Date(
                                            prog.mentorEvaluatedAt
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {prog.evaluatorFeedback && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-xs font-medium text-red-900 mb-1">
                                        Evaluator Feedback:
                                      </p>
                                      <p className="text-sm text-red-800">
                                        {prog.evaluatorFeedback}
                                      </p>
                                      {prog.evaluatorEvaluatedAt && (
                                        <p className="text-xs text-red-600 mt-1">
                                          {new Date(
                                            prog.evaluatorEvaluatedAt
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate(`/training-manager/appointments/${employeeId}`)
            }
            className="btn btn-secondary flex-1"
          >
            View Appointments
          </button>
          <button
            onClick={() => navigate(`/training-manager/history/${employeeId}`)}
            className="btn btn-secondary flex-1"
          >
            View History
          </button>
          <button
            onClick={() => navigate("/training-manager")}
            className="btn btn-primary flex-1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProgressView;
