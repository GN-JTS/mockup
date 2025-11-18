import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  Enrollment,
  Standard,
  Task,
  Subtask,
  SubtaskEvaluation,
  User,
} from "@/types";
import {
  UserRole,
  EvaluationStatus,
  EvaluationStatusNames,
  EvaluationStatusColors,
} from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const EmployeeStandardView = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [standard, setStandard] = useState<Standard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [evaluations, setEvaluations] = useState<SubtaskEvaluation[]>([]);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const isMentor = user?.role === UserRole.MENTOR;
  const isEvaluator = user?.role === UserRole.EVALUATOR;

  useEffect(() => {
    const loadData = async () => {
      if (!enrollmentId || !user) return;

      try {
        const enrollmentData = await mockApi.getEnrollmentById(enrollmentId);
        if (!enrollmentData) {
          navigate("/");
          return;
        }

        const [standardsData, tasksData, subtasksData, evalsData, userData] =
          await Promise.all([
            mockApi.getStandards(),
            mockApi.getTasks(),
            mockApi.getSubtasks(),
            mockApi.getSubtaskEvaluationsByEnrollment(enrollmentId),
            mockApi.getUserById(enrollmentData.employeeId),
          ]);

        const standardData = standardsData.find(
          (s) => s.id === enrollmentData.standardId
        );

        setEnrollment(enrollmentData);
        setStandard(standardData || null);
        setTasks(tasksData);
        setSubtasks(subtasksData);
        setEvaluations(evalsData);
        setEmployee(userData);

        // Expand all tasks by default
        if (standardData) {
          const standardSubtasks = subtasksData.filter((st) =>
            standardData.subtaskIds.includes(st.id)
          );
          const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
          setExpandedTasks(new Set(taskIds));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [enrollmentId, user, navigate]);

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

  const handleStartEvaluation = () => {
    if (!enrollmentId) return;
    navigate(`/evaluate/${enrollmentId}`);
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
        <p className="text-gray-600">Enrollment not found</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
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

  // Calculate progress
  const totalSubtasks = standardSubtasks.length;
  const masteredByMentor = evaluations.filter(
    (e) => e.mentorStatus === EvaluationStatus.MASTER
  ).length;
  const masteredByEvaluator = evaluations.filter(
    (e) => e.evaluatorStatus === EvaluationStatus.MASTER
  ).length;
  const fullyMastered = evaluations.filter(
    (e) =>
      e.mentorStatus === EvaluationStatus.MASTER &&
      e.evaluatorStatus === EvaluationStatus.MASTER
  ).length;

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
          {isMentor ? "Mentor View" : "Evaluator View"}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Employee</p>
            <p className="font-medium text-gray-900">{employee.name}</p>
            <p className="text-sm text-gray-600">{employee.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Enrolled</p>
            <p className="font-medium text-gray-900">
              {formatDate(enrollment.enrolledAt)}
            </p>
            <p className="text-sm text-gray-600">
              Status:{" "}
              {enrollment.status === "completed" ? "Completed" : "In Progress"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium text-gray-900">
              {standard.estimatedDuration}
            </p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {isMentor ? "Mentor Progress" : "Evaluator Progress"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {isMentor ? masteredByMentor : masteredByEvaluator}/
                {totalSubtasks} Mastered (
                {(
                  ((isMentor ? masteredByMentor : masteredByEvaluator) /
                    totalSubtasks) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isMentor ? "bg-blue-600" : "bg-green-600"
                }`}
                style={{
                  width: `${
                    ((isMentor ? masteredByMentor : masteredByEvaluator) /
                      totalSubtasks) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {isEvaluator && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress (Both)
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {fullyMastered}/{totalSubtasks} Fully Mastered (
                  {((fullyMastered / totalSubtasks) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(fullyMastered / totalSubtasks) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Evaluate Standard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isMentor &&
                "Evaluate all tasks and subtasks for this employee's standard"}
              {isEvaluator &&
                "Conduct final assessment for this employee's standard"}
            </p>
          </div>
          <button onClick={handleStartEvaluation} className="btn btn-primary">
            Start Evaluation
          </button>
        </div>
      </div>

      {/* Hierarchical View */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Standard Breakdown - Tasks & Subtasks
        </h2>

        <div className="space-y-4">
          {standardTasks.map((task) => {
            const isExpanded = expandedTasks.has(task.id);
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
                  <div className="p-4 space-y-3 bg-white">
                    {taskSubtasks.map((subtask) => {
                      const evaluation = getSubtaskEvaluation(subtask.id);
                      const mentorStatus =
                        evaluation?.mentorStatus ||
                        EvaluationStatus.NOT_STARTED;
                      const evaluatorStatus =
                        evaluation?.evaluatorStatus ||
                        EvaluationStatus.NOT_STARTED;
                      const fullyMastered =
                        mentorStatus === EvaluationStatus.MASTER &&
                        evaluatorStatus === EvaluationStatus.MASTER;

                      return (
                        <div
                          key={subtask.id}
                          className={`border rounded-lg p-4 ${
                            fullyMastered
                              ? "bg-green-50 border-green-200"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="font-medium text-gray-900">
                                  {subtask.title}
                                </h4>
                                {fullyMastered && (
                                  <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                )}
                              </div>
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
                          </div>

                          {/* Status Display */}
                          <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Mentor Status:
                                </span>
                                <span
                                  className={`ml-2 px-2 py-1 text-xs font-medium rounded ${EvaluationStatusColors[mentorStatus]}`}
                                >
                                  {EvaluationStatusNames[mentorStatus]}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Evaluator Status:
                                </span>
                                <span
                                  className={`ml-2 px-2 py-1 text-xs font-medium rounded ${EvaluationStatusColors[evaluatorStatus]}`}
                                >
                                  {EvaluationStatusNames[evaluatorStatus]}
                                </span>
                              </div>
                            </div>

                            {/* Feedback */}
                            {evaluation?.mentorFeedback && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">
                                    Mentor Feedback:
                                  </span>{" "}
                                  {evaluation.mentorFeedback}
                                </p>
                              </div>
                            )}
                            {evaluation?.evaluatorFeedback && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">
                                    Evaluator Feedback:
                                  </span>{" "}
                                  {evaluation.evaluatorFeedback}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Resources */}
                          {subtask.resources &&
                            subtask.resources.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Resources:
                                </p>
                                <ul className="text-xs text-gray-600 list-disc list-inside">
                                  {subtask.resources.map((resource, idx) => (
                                    <li key={idx}>{resource}</li>
                                  ))}
                                </ul>
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
        </div>
      </div>
    </div>
  );
};

export default EmployeeStandardView;
