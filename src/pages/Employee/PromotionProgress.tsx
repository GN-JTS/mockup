import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockApi } from "@/mock/services/mockApi";
import {
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
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PromotionProgress = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();

  const [promotion, setPromotion] = useState<EmployeePromotion | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [requirement, setRequirement] = useState<PromotionRequirement | null>(
    null
  );
  const [jobTitle, setJobTitle] = useState<JobTitle | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPromotionData();
  }, [promotionId]);

  // Auto-refresh when page becomes visible (e.g., returning from notifications)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && promotionId) {
        console.log("📱 Page visible - refreshing promotion data");
        handleRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [promotionId]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    console.log("🔄 Manually refreshing promotion data...");
    await loadPromotionData();
    setRefreshing(false);
  };

  const loadPromotionData = async () => {
    if (!promotionId) return;

    try {
      const promotionData = await mockApi.getEmployeePromotionById(promotionId);
      if (!promotionData) {
        console.error("Promotion not found");
        return;
      }
      setPromotion(promotionData);

      const [
        requirementData,
        progressData,
        jobTitleData,
        gradeData,
        tasksData,
        subtasksData,
      ] = await Promise.all([
        mockApi.getPromotionRequirementById(promotionData.requirementId),
        mockApi.getEmployeeProgressByPromotion(promotionId),
        mockApi.getJobTitleById(promotionData.targetJobTitleId),
        mockApi.getGradeById(promotionData.targetGradeId),
        mockApi.getTasks(),
        mockApi.getSubtasks(),
      ]);

      console.log(
        `📊 Loaded ${progressData.length} progress records for promotion`
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
      setJobTitle(jobTitleData || null);
      setGrade(gradeData || null);
      setTasks(tasksData);
      setSubtasks(subtasksData);

      // Auto-expand all tasks
      if (requirementData) {
        const taskIds = new Set(
          requirementData.required.map((req) => req.taskId)
        );
        setExpandedTasks(taskIds);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load promotion data:", error);
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

  if (!promotion || !requirement) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Promotion not found</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
          Back to Dashboard
        </button>
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
      <div className="card bg-linear-to-r from-primary-500 to-primary-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary-100 hover:text-white transition-colors"
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

        <h1 className="text-3xl font-bold mb-2">My Promotion Progress</h1>
        {jobTitle && grade && (
          <p className="text-primary-100 text-lg">
            Target: {jobTitle.name} - {grade.name}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-primary-100">
              {masteredCount} of {totalCount} subtasks mastered
            </p>
            {lastUpdated && (
              <p className="text-xs text-primary-200">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-700">Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <CheckCircleIcon className="h-5 w-5 text-indigo-600" />
              <CheckCircleIcon className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-700">Mentor / Evaluator</span>
          </div>
        </div>
      </div>

      {/* Tasks & Subtasks Tree */}
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
        <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/appointments/book")}
            className="btn btn-primary flex-1"
          >
            Book Appointment
          </button>
          <button
            onClick={() => navigate("/")}
            className="btn btn-secondary flex-1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionProgress;
