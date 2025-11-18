import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  Standard,
  Task,
  Subtask,
  SubtaskEvaluation,
  Enrollment,
} from "@/types";
import {
  UserRole,
  EvaluationStatus,
  EvaluationStatusNames,
  EvaluationStatusColors,
} from "@/utils/constants";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MinusCircleIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

const StandardsTreeView = () => {
  const { user } = useAuth();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [evaluations, setEvaluations] = useState<SubtaskEvaluation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Tree expansion state
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(
    new Set()
  );
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Filtering
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isEmployee = user?.role === UserRole.EMPLOYEE;
  const isMentorOrEvaluator =
    user?.role === UserRole.MENTOR || user?.role === UserRole.EVALUATOR;
  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.UPPER_MANAGER;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [standardsData, tasksData, subtasksData] = await Promise.all([
          mockApi.getStandards(),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
        ]);

        setStandards(standardsData);
        setTasks(tasksData);
        setSubtasks(subtasksData);

        // Load role-specific data
        if (isEmployee) {
          const [enrollmentsData, evalsData] = await Promise.all([
            mockApi.getEnrollmentsByEmployee(user.id),
            mockApi.getSubtaskEvaluationsByEmployee(user.id),
          ]);
          setEnrollments(enrollmentsData);
          setEvaluations(evalsData);
        } else if (isMentorOrEvaluator) {
          // Load evaluations for mentor/evaluator's assigned employees
          const evalsData = await mockApi.getSubtaskEvaluations();
          setEvaluations(evalsData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isEmployee, isMentorOrEvaluator]);

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
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

  const expandAll = () => {
    setExpandedStandards(new Set(standards.map((s) => s.id)));
    setExpandedTasks(new Set(tasks.map((t) => t.id)));
  };

  const collapseAll = () => {
    setExpandedStandards(new Set());
    setExpandedTasks(new Set());
  };

  const getSubtaskStatus = (
    subtaskId: string,
    standardId: string
  ): {
    mentorStatus: EvaluationStatus;
    evaluatorStatus: EvaluationStatus;
    isEnrolled: boolean;
  } => {
    if (!isEmployee) {
      return {
        mentorStatus: EvaluationStatus.NOT_STARTED,
        evaluatorStatus: EvaluationStatus.NOT_STARTED,
        isEnrolled: false,
      };
    }

    // Check if employee is enrolled in this standard
    const enrollment = enrollments.find((e) => e.standardId === standardId);
    if (!enrollment) {
      return {
        mentorStatus: EvaluationStatus.NOT_STARTED,
        evaluatorStatus: EvaluationStatus.NOT_STARTED,
        isEnrolled: false,
      };
    }

    // Find evaluation for this subtask
    const evaluation = evaluations.find(
      (e) => e.subtaskId === subtaskId && e.enrollmentId === enrollment.id
    );

    return {
      mentorStatus: evaluation?.mentorStatus || EvaluationStatus.NOT_STARTED,
      evaluatorStatus:
        evaluation?.evaluatorStatus || EvaluationStatus.NOT_STARTED,
      isEnrolled: true,
    };
  };

  const getOverallSubtaskStatus = (subtaskId: string, standardId: string) => {
    const { mentorStatus, evaluatorStatus, isEnrolled } = getSubtaskStatus(
      subtaskId,
      standardId
    );

    if (!isEnrolled) return EvaluationStatus.NOT_STARTED;

    // If both are Master, it's fully mastered
    if (
      mentorStatus === EvaluationStatus.MASTER &&
      evaluatorStatus === EvaluationStatus.MASTER
    ) {
      return EvaluationStatus.MASTER;
    }

    // If mentor is not Master yet, show mentor status
    if (mentorStatus !== EvaluationStatus.MASTER) {
      return mentorStatus;
    }

    // If mentor is Master but evaluator is not, show evaluator status
    return evaluatorStatus;
  };

  const getStatusIcon = (
    status: EvaluationStatus,
    size: string = "h-5 w-5"
  ) => {
    switch (status) {
      case EvaluationStatus.MASTER:
        return <CheckCircleIcon className={`${size} text-green-600`} />;
      case EvaluationStatus.ATTEMPT_1:
        return <ClockIcon className={`${size} text-yellow-600`} />;
      case EvaluationStatus.ATTEMPT_2:
        return <MinusCircleIcon className={`${size} text-orange-600`} />;
      default:
        return <XCircleIcon className={`${size} text-gray-400`} />;
    }
  };

  const getStandardProgress = (standardId: string) => {
    if (!isEmployee) return { total: 0, mastered: 0, percentage: 0 };

    const standard = standards.find((s) => s.id === standardId);
    if (!standard) return { total: 0, mastered: 0, percentage: 0 };

    const standardSubtasks = subtasks.filter((st) =>
      standard.subtaskIds.includes(st.id)
    );
    const total = standardSubtasks.length;

    const mastered = standardSubtasks.filter((st) => {
      const status = getOverallSubtaskStatus(st.id, standardId);
      return status === EvaluationStatus.MASTER;
    }).length;

    const percentage = total > 0 ? (mastered / total) * 100 : 0;

    return { total, mastered, percentage };
  };

  const filteredStandards = standards.filter((standard) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesStandard = standard.title.toLowerCase().includes(query);
      const matchesTasks = tasks.some(
        (t) =>
          standard.subtaskIds.some((stId) =>
            subtasks.find((st) => st.id === stId && st.taskId === t.id)
          ) && t.title.toLowerCase().includes(query)
      );
      const matchesSubtasks = subtasks.some(
        (st) =>
          standard.subtaskIds.includes(st.id) &&
          st.title.toLowerCase().includes(query)
      );

      if (!matchesStandard && !matchesTasks && !matchesSubtasks) {
        return false;
      }
    }

    // Status filter (for employees)
    if (isEmployee && filterStatus !== "all") {
      const progress = getStandardProgress(standard.id);
      if (filterStatus === "completed" && progress.percentage !== 100) {
        return false;
      }
      if (
        filterStatus === "in-progress" &&
        (progress.percentage === 0 || progress.percentage === 100)
      ) {
        return false;
      }
      if (filterStatus === "not-started" && progress.percentage !== 0) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Standards, Tasks & Subtasks
        </h1>
        <p className="text-gray-600 mt-1">
          {isEmployee &&
            "View all training standards with your progress and status"}
          {isMentorOrEvaluator &&
            "View all training standards and their structure"}
          {isAdmin && "Complete hierarchical view of all training standards"}
        </p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standards, tasks, or subtasks..."
              className="input"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center space-x-3">
            {isEmployee && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Standards</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            )}

            <button onClick={expandAll} className="btn btn-secondary text-sm">
              Expand All
            </button>
            <button onClick={collapseAll} className="btn btn-secondary text-sm">
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {isEmployee && (
        <div className="card bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Status Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Master</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-gray-700">Attempt 1</span>
            </div>
            <div className="flex items-center">
              <MinusCircleIcon className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm text-gray-700">Attempt 2</span>
            </div>
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Not Started</span>
            </div>
          </div>
        </div>
      )}

      {/* Tree View */}
      <div className="space-y-3">
        {filteredStandards.map((standard) => {
          const isStandardExpanded = expandedStandards.has(standard.id);
          const standardSubtasks = subtasks.filter((st) =>
            standard.subtaskIds.includes(st.id)
          );
          const standardTaskIds = [
            ...new Set(standardSubtasks.map((st) => st.taskId)),
          ];
          const standardTasks = tasks.filter((t) =>
            standardTaskIds.includes(t.id)
          );
          const progress = isEmployee ? getStandardProgress(standard.id) : null;

          return (
            <div
              key={standard.id}
              className="card hover:shadow-md transition-shadow"
            >
              {/* Standard Level */}
              <button
                onClick={() => toggleStandard(standard.id)}
                className="w-full flex items-start justify-between text-left"
              >
                <div className="flex items-start flex-1">
                  {isStandardExpanded ? (
                    <ChevronDownIcon className="h-6 w-6 text-gray-500 mr-3 mt-1 shrink-0" />
                  ) : (
                    <ChevronRightIcon className="h-6 w-6 text-gray-500 mr-3 mt-1 shrink-0" />
                  )}
                  <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-3 mt-1 shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {standard.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {standard.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{standardTasks.length} tasks</span>
                      <span>•</span>
                      <span>{standardSubtasks.length} subtasks</span>
                      {isEmployee && progress && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-gray-900">
                            {progress.percentage.toFixed(0)}% Complete
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar (Employee Only) */}
                    {isEmployee && progress && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Tasks Level */}
              {isStandardExpanded && (
                <div className="mt-4 ml-9 space-y-3">
                  {standardTasks.map((task) => {
                    const isTaskExpanded = expandedTasks.has(task.id);
                    const taskSubtasks = standardSubtasks.filter(
                      (st) => st.taskId === task.id
                    );

                    return (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Task Header */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="w-full p-3 flex items-start bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start flex-1">
                            {isTaskExpanded ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 shrink-0" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 shrink-0" />
                            )}
                            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {task.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {task.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {taskSubtasks.length} subtask
                                {taskSubtasks.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Subtasks Level */}
                        {isTaskExpanded && (
                          <div className="p-3 space-y-2 bg-white">
                            {taskSubtasks.map((subtask) => {
                              const status = isEmployee
                                ? getOverallSubtaskStatus(
                                    subtask.id,
                                    standard.id
                                  )
                                : EvaluationStatus.NOT_STARTED;
                              const {
                                mentorStatus,
                                evaluatorStatus,
                                isEnrolled,
                              } = isEmployee
                                ? getSubtaskStatus(subtask.id, standard.id)
                                : {
                                    mentorStatus: EvaluationStatus.NOT_STARTED,
                                    evaluatorStatus:
                                      EvaluationStatus.NOT_STARTED,
                                    isEnrolled: false,
                                  };

                              return (
                                <div
                                  key={subtask.id}
                                  className={`p-3 border rounded-lg ${
                                    status === EvaluationStatus.MASTER
                                      ? "bg-green-50 border-green-200"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start">
                                    <ListBulletIcon className="h-5 w-5 text-gray-600 mr-3 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <h5 className="font-medium text-gray-900">
                                            {subtask.title}
                                          </h5>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {subtask.description}
                                          </p>
                                          <p className="text-sm text-gray-700 mt-2">
                                            <span className="font-medium">
                                              Requirements:
                                            </span>{" "}
                                            {subtask.requirements}
                                          </p>
                                        </div>

                                        {/* Status Indicators */}
                                        {isEmployee && isEnrolled && (
                                          <div className="ml-4 flex items-center space-x-2">
                                            {getStatusIcon(status, "h-6 w-6")}
                                          </div>
                                        )}
                                      </div>

                                      {/* Detailed Status (Employee) */}
                                      {isEmployee && isEnrolled && (
                                        <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <span className="text-gray-600">
                                                Mentor:
                                              </span>
                                              <span
                                                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${EvaluationStatusColors[mentorStatus]}`}
                                              >
                                                {
                                                  EvaluationStatusNames[
                                                    mentorStatus
                                                  ]
                                                }
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">
                                                Evaluator:
                                              </span>
                                              <span
                                                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded ${EvaluationStatusColors[evaluatorStatus]}`}
                                              >
                                                {
                                                  EvaluationStatusNames[
                                                    evaluatorStatus
                                                  ]
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Resources */}
                                      {subtask.resources &&
                                        subtask.resources.length > 0 && (
                                          <div className="mt-3">
                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                              Resources:
                                            </p>
                                            <ul className="text-xs text-gray-600 list-disc list-inside">
                                              {subtask.resources.map(
                                                (resource, idx) => (
                                                  <li key={idx}>{resource}</li>
                                                )
                                              )}
                                            </ul>
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
              )}
            </div>
          );
        })}

        {filteredStandards.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600">
              {searchQuery
                ? "No standards found matching your search"
                : "No standards available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardsTreeView;
