import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { useNotifications } from "@/context/NotificationContext";
import {
  Enrollment,
  Standard,
  Task,
  Subtask,
  SubtaskEvaluation,
  User,
} from "@/types";
import {
  EvaluationStatus,
  EvaluationStatusNames,
  EvaluationStatusColors,
  UserRole,
} from "@/utils/constants";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const StandardEvaluationInterface = () => {
  const { id } = useParams<{ id: string }>(); // enrollment ID
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [standard, setStandard] = useState<Standard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [evaluations, setEvaluations] = useState<SubtaskEvaluation[]>([]);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Local evaluation state (for editing)
  const [localEvaluations, setLocalEvaluations] = useState<
    Map<string, { status: EvaluationStatus; feedback: string }>
  >(new Map());

  const isMentor = user?.role === UserRole.MENTOR;
  const isEvaluator = user?.role === UserRole.EVALUATOR;

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return;

      try {
        const [enrollmentData, standardsData, tasksData, subtasksData] =
          await Promise.all([
            mockApi.getEnrollmentById(id),
            mockApi.getStandards(),
            mockApi.getTasks(),
            mockApi.getSubtasks(),
          ]);

        if (!enrollmentData) {
          showToast("Enrollment not found", "error");
          navigate("/");
          return;
        }

        const standardData = standardsData.find(
          (s) => s.id === enrollmentData.standardId
        );

        // Get evaluations for this enrollment
        const evalsData = await mockApi.getSubtaskEvaluationsByEnrollment(id);

        // Get employee data using the employeeId from enrollment
        const employeeData = await mockApi.getUserById(
          enrollmentData.employeeId
        );

        setEnrollment(enrollmentData);
        setStandard(standardData || null);
        setTasks(tasksData);
        setSubtasks(subtasksData);
        setEvaluations(evalsData);
        setEmployee(employeeData);

        // Initialize local evaluation state
        const localEvalMap = new Map();
        evalsData.forEach((evaluation) => {
          const status = isMentor
            ? evaluation.mentorStatus
            : evaluation.evaluatorStatus;
          const feedback = isMentor
            ? evaluation.mentorFeedback || ""
            : evaluation.evaluatorFeedback || "";

          localEvalMap.set(evaluation.subtaskId, { status, feedback });
        });
        setLocalEvaluations(localEvalMap);

        // Expand all tasks by default
        if (standardData) {
          const standardSubtasks = subtasksData.filter((st) =>
            standardData.subtaskIds.includes(st.id)
          );
          const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
          setExpandedTasks(new Set(taskIds));
        }
      } catch (error) {
        console.error("Failed to load evaluation data:", error);
        showToast("Failed to load evaluation data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, isMentor, navigate, showToast]);

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getSubtaskEvaluation = (subtaskId: string) => {
    return evaluations.find((e) => e.subtaskId === subtaskId);
  };

  const getLocalEvaluation = (subtaskId: string) => {
    return (
      localEvaluations.get(subtaskId) || {
        status: EvaluationStatus.NOT_STARTED,
        feedback: "",
      }
    );
  };

  const updateLocalEvaluation = (
    subtaskId: string,
    status: EvaluationStatus,
    feedback: string
  ) => {
    const newMap = new Map(localEvaluations);
    newMap.set(subtaskId, { status, feedback });
    setLocalEvaluations(newMap);
  };

  const canEvaluatorEvaluate = () => {
    if (!standard) return false;

    // Check if ALL subtasks are Master by mentor
    const standardSubtasks = subtasks.filter((st) =>
      standard.subtaskIds.includes(st.id)
    );

    return standardSubtasks.every((st) => {
      const evaluation = getSubtaskEvaluation(st.id);
      return evaluation?.mentorStatus === EvaluationStatus.MASTER;
    });
  };

  const calculateProgress = () => {
    if (!standard) return { total: 0, completed: 0, percentage: 0 };

    const standardSubtasks = subtasks.filter((st) =>
      standard.subtaskIds.includes(st.id)
    );
    const total = standardSubtasks.length;

    const completed = standardSubtasks.filter((st) => {
      const local = getLocalEvaluation(st.id);
      return local.status === EvaluationStatus.MASTER;
    }).length;

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, percentage };
  };

  const handleSaveEvaluations = async () => {
    if (!enrollment || !user) return;

    setSaving(true);
    try {
      // Save all evaluations
      const updates = Array.from(localEvaluations.entries()).map(
        ([subtaskId, { status, feedback }]) => ({
          subtaskId,
          enrollmentId: enrollment.id,
          employeeId: enrollment.employeeId,
          ...(isMentor
            ? {
                mentorId: user.id,
                mentorStatus: status,
                mentorFeedback: feedback,
                mentorEvaluatedAt: new Date().toISOString(),
              }
            : {
                evaluatorId: user.id,
                evaluatorStatus: status,
                evaluatorFeedback: feedback,
                evaluatorEvaluatedAt: new Date().toISOString(),
              }),
        })
      );

      await mockApi.saveSubtaskEvaluations(updates);

      // Check if standard is complete
      const allMaster = Array.from(localEvaluations.values()).every(
        (e) => e.status === EvaluationStatus.MASTER
      );

      if (allMaster && isEvaluator) {
        // Mark enrollment as completed
        await mockApi.updateEnrollmentStatus(enrollment.id, "completed");
        showToast(
          "Standard evaluation completed! Certificate will be issued.",
          "success"
        );
      } else {
        showToast(
          `Evaluation saved successfully as ${
            isMentor ? "Mentor" : "Evaluator"
          }`,
          "success"
        );
      }

      navigate("/");
    } catch (error) {
      console.error("Failed to save evaluations:", error);
      showToast("Failed to save evaluations", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!enrollment || !standard || !employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Evaluation data not found</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (isEvaluator && !canEvaluatorEvaluate()) {
    return (
      <div className="text-center py-12 card max-w-2xl mx-auto">
        <XCircleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Evaluation Not Ready
        </h2>
        <p className="text-gray-600 mb-4">
          The mentor must mark ALL tasks and subtasks as <strong>Master</strong>{" "}
          before evaluator assessment can begin.
        </p>
        <p className="text-gray-700 font-medium mb-6">
          Please wait for the mentor to complete their evaluation of this
          standard.
        </p>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const standardSubtasks = subtasks.filter((st) =>
    standard.subtaskIds.includes(st.id)
  );
  const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
  const standardTasks = tasks.filter((t) => taskIds.includes(t.id));

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
          {isMentor ? "Mentor Evaluation" : "Evaluator Assessment"}
        </span>
      </div>

      {/* Standard & Employee Info */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {standard.title}
            </h1>
            <p className="text-gray-600 mt-2">{standard.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Employee</p>
            <p className="font-medium text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-600">{employee.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Evaluator</p>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-600">
              {isMentor ? "Mentor" : "Evaluator"}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Evaluation Progress
            </span>
            <span className="text-sm font-medium text-gray-900">
              {progress.completed}/{progress.total} Mastered (
              {progress.percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning for Evaluator */}
      {isEvaluator && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <ClockIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">
                Evaluator Assessment
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                You are conducting the final assessment. All tasks and subtasks
                have been mastered by the mentor. Your evaluation will determine
                if the employee passes this standard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Evaluation Instructions
        </h2>
        <p className="text-gray-700 mb-3">
          Evaluate each subtask individually. Select the appropriate status for
          each:
        </p>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>
            <span className="font-medium text-yellow-700">Attempt 1:</span>{" "}
            First evaluation attempt - needs improvement
          </li>
          <li>
            <span className="font-medium text-orange-700">Attempt 2:</span>{" "}
            Second evaluation attempt - still needs work
          </li>
          <li>
            <span className="font-medium text-green-700">Master:</span> Employee
            has fully mastered this subtask
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-3">
          <strong>Note:</strong> All subtasks must reach <strong>Master</strong>{" "}
          status {isMentor && "before the evaluator can assess."}{" "}
          {isEvaluator && "for the standard to be completed."}
        </p>
      </div>

      {/* Evaluation Tree */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Evaluate Tasks & Subtasks
        </h2>

        <div className="space-y-4">
          {standardTasks.map((task) => {
            const taskSubtasks = standardSubtasks.filter(
              (st) => st.taskId === task.id
            );
            const isExpanded = expandedTasks.has(task.id);

            return (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Task Header */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1 text-left">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-3" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-3" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {task.title}
                      </h3>
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

                {/* Subtasks */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-white">
                    {taskSubtasks.map((subtask) => {
                      const evaluation = getSubtaskEvaluation(subtask.id);
                      const localEval = getLocalEvaluation(subtask.id);

                      return (
                        <div
                          key={subtask.id}
                          className="border border-gray-300 rounded-lg p-4"
                        >
                          {/* Subtask Info */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900">
                              {subtask.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {subtask.description}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-medium">Requirements:</span>{" "}
                              {subtask.requirements}
                            </p>
                          </div>

                          {/* Previous Status (if exists) */}
                          {evaluation && (
                            <div className="mb-4 p-3 bg-gray-50 rounded">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Mentor Status:
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                                      EvaluationStatusColors[
                                        evaluation.mentorStatus
                                      ]
                                    }`}
                                  >
                                    {
                                      EvaluationStatusNames[
                                        evaluation.mentorStatus
                                      ]
                                    }
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Evaluator Status:
                                  </span>
                                  <span
                                    className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                                      EvaluationStatusColors[
                                        evaluation.evaluatorStatus
                                      ]
                                    }`}
                                  >
                                    {
                                      EvaluationStatusNames[
                                        evaluation.evaluatorStatus
                                      ]
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Evaluation Form */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Evaluation Status
                              </label>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    updateLocalEvaluation(
                                      subtask.id,
                                      EvaluationStatus.ATTEMPT_1,
                                      localEval.feedback
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                    localEval.status ===
                                    EvaluationStatus.ATTEMPT_1
                                      ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                                      : "border-gray-200 hover:border-yellow-300"
                                  }`}
                                >
                                  Attempt 1
                                </button>
                                <button
                                  onClick={() =>
                                    updateLocalEvaluation(
                                      subtask.id,
                                      EvaluationStatus.ATTEMPT_2,
                                      localEval.feedback
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                    localEval.status ===
                                    EvaluationStatus.ATTEMPT_2
                                      ? "border-orange-600 bg-orange-50 text-orange-700"
                                      : "border-gray-200 hover:border-orange-300"
                                  }`}
                                >
                                  Attempt 2
                                </button>
                                <button
                                  onClick={() =>
                                    updateLocalEvaluation(
                                      subtask.id,
                                      EvaluationStatus.MASTER,
                                      localEval.feedback
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                    localEval.status === EvaluationStatus.MASTER
                                      ? "border-green-600 bg-green-50 text-green-700"
                                      : "border-gray-200 hover:border-green-300"
                                  }`}
                                >
                                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                                  Master
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feedback / Notes
                              </label>
                              <textarea
                                value={localEval.feedback}
                                onChange={(e) =>
                                  updateLocalEvaluation(
                                    subtask.id,
                                    localEval.status,
                                    e.target.value
                                  )
                                }
                                className="input"
                                rows={3}
                                placeholder="Provide feedback, recommendations, or notes..."
                              />
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

      {/* Action Buttons */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="btn btn-secondary">
            Cancel
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Evaluation Progress</p>
              <p className="text-lg font-bold text-gray-900">
                {progress.completed}/{progress.total} Mastered
              </p>
            </div>
            <button
              onClick={handleSaveEvaluations}
              disabled={saving || progress.completed === 0}
              className="btn btn-primary"
            >
              {saving ? "Saving..." : "Save Evaluation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardEvaluationInterface;
