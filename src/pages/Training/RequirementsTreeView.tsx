import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  Task,
  Subtask,
  EmployeePromotion,
  EmployeeProgress,
  JobTitle,
  Grade,
} from "@/types";
import { EvaluationStatus } from "@/utils/constants";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

type ViewMode = "all" | "my_requirements";

const RequirementsTreeView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [activePromotion, setActivePromotion] =
    useState<EmployeePromotion | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [targetJobTitle, setTargetJobTitle] = useState<JobTitle | null>(null);
  const [targetGrade, setTargetGrade] = useState<Grade | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [loading, setLoading] = useState(true);

  const isEmployee = user?.role === "employee";

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [tasksData, subtasksData] = await Promise.all([
        mockApi.getTasks(),
        mockApi.getSubtasks(),
      ]);

      setTasks(tasksData);
      setSubtasks(subtasksData);

      // If employee, load active promotion
      if (isEmployee) {
        const promotions = await mockApi.getEmployeePromotionsByEmployee(
          user.id
        );
        const active = promotions.find(
          (p) => p.status === "assigned" || p.status === "in_progress"
        );

        if (active) {
          setActivePromotion(active);

          const [progressData, jobTitle, grade] = await Promise.all([
            mockApi.getEmployeeProgressByPromotion(active.id),
            mockApi.getJobTitleById(active.targetJobTitleId),
            mockApi.getGradeById(active.targetGradeId),
          ]);

          setProgress(progressData);
          setTargetJobTitle(jobTitle || null);
          setTargetGrade(grade || null);
          setViewMode("my_requirements");
        }
      }

      // Expand all tasks by default
      setExpandedTasks(new Set(tasksData.map((t) => t.id)));
    } catch (error) {
      console.error("Failed to load requirements tree:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getSubtaskProgress = (subtaskId: string) => {
    return progress.find((p) => p.subtaskId === subtaskId);
  };

  const isSubtaskRequired = (subtaskId: string) => {
    return progress.some((p) => p.subtaskId === subtaskId);
  };

  const getSubtaskStatus = (subtaskId: string) => {
    const prog = getSubtaskProgress(subtaskId);
    if (!prog) return null;

    const mentorDone = prog.mentorStatus === EvaluationStatus.MASTER;
    const evaluatorDone = prog.evaluatorStatus === EvaluationStatus.MASTER;

    if (mentorDone && evaluatorDone) return "mastered";
    if (
      prog.mentorStatus === EvaluationStatus.ATTEMPT_1 ||
      prog.mentorStatus === EvaluationStatus.ATTEMPT_2 ||
      prog.evaluatorStatus === EvaluationStatus.ATTEMPT_1 ||
      prog.evaluatorStatus === EvaluationStatus.ATTEMPT_2
    )
      return "in_progress";
    return "not_started";
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "mastered":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case "not_started":
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      default:
        return <div className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "mastered":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Mastered
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Not Started
          </span>
        );
      default:
        return null;
    }
  };

  const getTaskSubtasks = (taskId: string) => {
    const taskSubtasks = subtasks.filter((st) => st.taskId === taskId);

    if (viewMode === "my_requirements") {
      return taskSubtasks.filter((st) => isSubtaskRequired(st.id));
    }

    return taskSubtasks;
  };

  const getFilteredTasks = () => {
    if (viewMode === "my_requirements") {
      return tasks.filter((task) => getTaskSubtasks(task.id).length > 0);
    }
    return tasks;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Training Requirements
        </h1>
        <p className="text-gray-600 mt-1">
          Browse all tasks and subtasks in the training system
        </p>
      </div>

      {/* Promotion Context for Employees */}
      {isEmployee && activePromotion && targetJobTitle && targetGrade && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Your Active Promotion
              </h3>
              <p className="text-lg font-semibold text-blue-900 mt-1">
                {targetJobTitle.name} - {targetGrade.name}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {
                  progress.filter(
                    (p) =>
                      p.mentorStatus === EvaluationStatus.MASTER &&
                      p.evaluatorStatus === EvaluationStatus.MASTER
                  ).length
                }
                /{progress.length} subtasks mastered
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">View:</span>
          </div>
          <div className="flex items-center gap-2">
            {isEmployee && activePromotion && (
              <>
                <button
                  onClick={() => setViewMode("my_requirements")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "my_requirements"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  My Requirements
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "all"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Tasks
                </button>
              </>
            )}
            {!isEmployee && (
              <span className="text-sm text-gray-600">
                Viewing all tasks ({filteredTasks.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="card">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const taskSubtasks = getTaskSubtasks(task.id);
              const isExpanded = expandedTasks.has(task.id);

              const masteredCount = taskSubtasks.filter(
                (st) => getSubtaskStatus(st.id) === "mastered"
              ).length;
              const inProgressCount = taskSubtasks.filter(
                (st) => getSubtaskStatus(st.id) === "in_progress"
              ).length;

              return (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Task Header */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {taskSubtasks.length} subtasks
                      </span>
                      {viewMode === "my_requirements" && (
                        <div className="flex items-center gap-2">
                          {masteredCount > 0 && (
                            <span className="text-xs font-medium text-green-600">
                              {masteredCount} mastered
                            </span>
                          )}
                          {inProgressCount > 0 && (
                            <span className="text-xs font-medium text-yellow-600">
                              {inProgressCount} in progress
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Subtasks */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {taskSubtasks.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No subtasks for this task
                        </div>
                      ) : (
                        taskSubtasks.map((subtask) => {
                          const status = getSubtaskStatus(subtask.id);
                          const prog = getSubtaskProgress(subtask.id);

                          return (
                            <div
                              key={subtask.id}
                              className="p-4 hover:bg-gray-50"
                            >
                              <div className="flex items-start gap-4">
                                <div className="shrink-0 mt-1">
                                  {getStatusIcon(status)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">
                                        {subtask.title}
                                      </h4>
                                      {subtask.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {subtask.description}
                                        </p>
                                      )}
                                      {subtask.requirements && (
                                        <p className="text-sm text-gray-500 mt-2">
                                          <span className="font-medium">
                                            Requirements:
                                          </span>{" "}
                                          {subtask.requirements}
                                        </p>
                                      )}
                                    </div>
                                    {status && (
                                      <div className="ml-4">
                                        {getStatusBadge(status)}
                                      </div>
                                    )}
                                  </div>

                                  {/* Progress Details for Employee */}
                                  {viewMode === "my_requirements" && prog && (
                                    <div className="mt-3 flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-600">
                                          Mentor:
                                        </span>
                                        <span
                                          className={`font-medium ${
                                            prog.mentorStatus ===
                                            EvaluationStatus.MASTER
                                              ? "text-green-600"
                                              : prog.mentorStatus ===
                                                  EvaluationStatus.ATTEMPT_1 ||
                                                prog.mentorStatus ===
                                                  EvaluationStatus.ATTEMPT_2
                                              ? "text-yellow-600"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {prog.mentorStatus ===
                                          EvaluationStatus.MASTER
                                            ? "Mastered"
                                            : prog.mentorStatus ===
                                              EvaluationStatus.ATTEMPT_1
                                            ? "Attempt 1"
                                            : prog.mentorStatus ===
                                              EvaluationStatus.ATTEMPT_2
                                            ? "Attempt 2"
                                            : "Not Started"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-600">
                                          Evaluator:
                                        </span>
                                        <span
                                          className={`font-medium ${
                                            prog.evaluatorStatus ===
                                            EvaluationStatus.MASTER
                                              ? "text-green-600"
                                              : prog.evaluatorStatus ===
                                                  EvaluationStatus.ATTEMPT_1 ||
                                                prog.evaluatorStatus ===
                                                  EvaluationStatus.ATTEMPT_2
                                              ? "text-yellow-600"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {prog.evaluatorStatus ===
                                          EvaluationStatus.MASTER
                                            ? "Mastered"
                                            : prog.evaluatorStatus ===
                                              EvaluationStatus.ATTEMPT_1
                                            ? "Attempt 1"
                                            : prog.evaluatorStatus ===
                                              EvaluationStatus.ATTEMPT_2
                                            ? "Attempt 2"
                                            : "Not Started"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Status Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default RequirementsTreeView;
