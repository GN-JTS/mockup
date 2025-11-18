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
  AppointmentRequest,
} from "@/types";
import {
  EvaluationStatus,
  EvaluationStatusNames,
  EvaluationStatusColors,
  AppointmentStatusNames,
} from "@/utils/constants";
import {
  formatDate,
  formatPercentage,
  formatDateTime,
} from "@/utils/formatters";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const StandardProgress = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [standard, setStandard] = useState<Standard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [evaluations, setEvaluations] = useState<SubtaskEvaluation[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return;

      try {
        const [
          enrollmentData,
          standardsData,
          tasksData,
          subtasksData,
          evalsData,
          mentorsData,
          evaluatorsData,
          appointmentsData,
        ] = await Promise.all([
          mockApi.getEnrollmentById(id),
          mockApi.getStandards(),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
          mockApi.getSubtaskEvaluationsByEmployee(user.id),
          mockApi.getMentorsByDepartmentSection(
            user.departmentId,
            user.sectionId
          ),
          mockApi.getEvaluatorsByDepartmentSection(
            user.departmentId,
            user.sectionId
          ),
          mockApi.getAppointmentRequestsByEmployee(user.id),
        ]);

        if (!enrollmentData) {
          navigate("/");
          return;
        }

        const standardData = standardsData.find(
          (s) => s.id === enrollmentData.standardId
        );

        setEnrollment(enrollmentData);
        setStandard(standardData || null);
        setTasks(tasksData);
        setSubtasks(subtasksData);
        setEvaluations(evalsData.filter((e) => e.enrollmentId === id));
        setMentors(mentorsData);
        setEvaluators(evaluatorsData);
        setAppointments(appointmentsData);

        // Expand all tasks by default
        if (standardData) {
          const standardSubtasks = subtasksData.filter((st) =>
            standardData.subtaskIds.includes(st.id)
          );
          const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
          setExpandedTasks(new Set(taskIds));
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);

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

  const getSubtaskMentor = (evaluation: SubtaskEvaluation | undefined) => {
    if (!evaluation || !evaluation.mentorId) return null;
    return mentors.find((m) => m.id === evaluation.mentorId);
  };

  const getSubtaskEvaluator = (evaluation: SubtaskEvaluation | undefined) => {
    if (!evaluation || !evaluation.evaluatorId) return null;
    return evaluators.find((e) => e.id === evaluation.evaluatorId);
  };

  const getSubtaskAppointments = (subtaskId: string) => {
    return appointments.filter((a) => a.subtaskIds.includes(subtaskId));
  };

  const handleBookAppointment = (type: "mentor" | "evaluator") => {
    // Navigate to appointment booking with enrollment (Standard-level)
    navigate("/appointments/book", {
      state: { enrollmentId: id, type, standardId: standard?.id },
    });
  };

  const canBookEvaluator = () => {
    if (!standard) return false;

    // Check if ALL subtasks are Master by mentor
    return standardSubtasks.every((st) => {
      const evaluation = getSubtaskEvaluation(st.id);
      return evaluation?.mentorStatus === EvaluationStatus.MASTER;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!enrollment || !standard) {
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
  const masteredSubtasks = evaluations.filter(
    (e) =>
      e.mentorStatus === EvaluationStatus.MASTER &&
      e.evaluatorStatus === EvaluationStatus.MASTER
  ).length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {standard.title}
            </h1>
            <p className="text-gray-600 mt-2">{standard.description}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
              <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
              <span>•</span>
              <span>Duration: {standard.estimatedDuration}</span>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-lg font-medium ${
              enrollment.status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {enrollment.status === "completed" ? "Completed" : "In Progress"}
          </span>
        </div>

        {/* Overall Progress */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-medium text-gray-900">
              {masteredSubtasks}/{totalSubtasks} Subtasks Mastered (
              {formatPercentage((masteredSubtasks / totalSubtasks) * 100)})
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{
                width: `${(masteredSubtasks / totalSubtasks) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Progress Tree */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progress Tree - Tasks & Subtasks
        </h2>

        <div className="space-y-4">
          {standardTasks.map((task) => {
            const taskSubtasks = standardSubtasks.filter(
              (st) => st.taskId === task.id
            );
            const isExpanded = expandedTasks.has(task.id);
            const taskMastered = taskSubtasks.every((st) => {
              const eval_ = getSubtaskEvaluation(st.id);
              return (
                eval_?.mentorStatus === EvaluationStatus.MASTER &&
                eval_?.evaluatorStatus === EvaluationStatus.MASTER
              );
            });

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
                    </div>
                  </div>
                  {taskMastered && (
                    <CheckCircleIcon className="h-6 w-6 text-green-600 ml-3" />
                  )}
                </button>

                {/* Subtasks */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white">
                    {taskSubtasks.map((subtask) => {
                      const evaluation = getSubtaskEvaluation(subtask.id);
                      const mentor = getSubtaskMentor(evaluation);
                      const evaluator = getSubtaskEvaluator(evaluation);
                      const subtaskAppointments = getSubtaskAppointments(
                        subtask.id
                      );
                      const upcomingAppointments = subtaskAppointments.filter(
                        (a) =>
                          ["pending", "proposed", "confirmed"].includes(
                            a.status
                          )
                      );

                      const mentorComplete =
                        evaluation?.mentorStatus === EvaluationStatus.MASTER;
                      const evaluatorComplete =
                        evaluation?.evaluatorStatus === EvaluationStatus.MASTER;
                      const fullyMastered = mentorComplete && evaluatorComplete;

                      return (
                        <div
                          key={subtask.id}
                          className={`border rounded-lg p-4 ${
                            fullyMastered
                              ? "bg-green-50 border-green-200"
                              : "border-gray-200"
                          }`}
                        >
                          {/* Subtask Header */}
                          <div className="flex items-start justify-between mb-3">
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

                          {/* Evaluation Status */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {/* Mentor Status */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Mentor Evaluation
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${
                                    EvaluationStatusColors[
                                      evaluation?.mentorStatus ||
                                        EvaluationStatus.NOT_STARTED
                                    ]
                                  }`}
                                >
                                  {
                                    EvaluationStatusNames[
                                      evaluation?.mentorStatus ||
                                        EvaluationStatus.NOT_STARTED
                                    ]
                                  }
                                </span>
                              </div>
                              {mentor && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  <span>{mentor.name}</span>
                                </div>
                              )}
                              {evaluation?.mentorFeedback && (
                                <p className="text-xs text-gray-600 italic">
                                  "{evaluation.mentorFeedback}"
                                </p>
                              )}
                            </div>

                            {/* Evaluator Status */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Evaluator Assessment
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded ${
                                    EvaluationStatusColors[
                                      evaluation?.evaluatorStatus ||
                                        EvaluationStatus.NOT_STARTED
                                    ]
                                  }`}
                                >
                                  {
                                    EvaluationStatusNames[
                                      evaluation?.evaluatorStatus ||
                                        EvaluationStatus.NOT_STARTED
                                    ]
                                  }
                                </span>
                              </div>
                              {evaluator && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  <span>{evaluator.name}</span>
                                </div>
                              )}
                              {evaluation?.evaluatorFeedback && (
                                <p className="text-xs text-gray-600 italic">
                                  "{evaluation.evaluatorFeedback}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Appointments */}
                          {upcomingAppointments.length > 0 && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                <CalendarIcon className="h-4 w-4 inline mr-1" />
                                Upcoming Appointments
                              </p>
                              {upcomingAppointments.map((apt) => (
                                <div
                                  key={apt.id}
                                  className="text-sm text-blue-800"
                                >
                                  {formatDateTime(
                                    new Date(
                                      apt.requestedDate +
                                        "T" +
                                        apt.requestedStartTime
                                    )
                                  )}{" "}
                                  - {AppointmentStatusNames[apt.status]}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status Display */}
                          <div className="flex space-x-2">
                            {fullyMastered && (
                              <div className="flex items-center text-sm text-green-700 font-medium">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Fully Mastered
                              </div>
                            )}
                          </div>

                          {/* Resources */}
                          {subtask.resources &&
                            subtask.resources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Resources:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
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

      {/* Action Buttons - Standard-Level Evaluation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Book Standard Evaluation
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Evaluation appointments are made at the{" "}
          <strong>Standard level</strong>. The mentor/evaluator will assess all
          tasks and subtasks during the appointment.
        </p>
        <div className="flex space-x-4">
          {masteredSubtasks < totalSubtasks && (
            <button
              onClick={() => handleBookAppointment("mentor")}
              className="btn btn-primary"
            >
              <CalendarIcon className="h-5 w-5 mr-2 inline" />
              Book Mentor Evaluation
            </button>
          )}
          {canBookEvaluator() && masteredSubtasks === totalSubtasks && (
            <button
              onClick={() => handleBookAppointment("evaluator")}
              className="btn btn-primary"
            >
              <CalendarIcon className="h-5 w-5 mr-2 inline" />
              Book Evaluator Assessment
            </button>
          )}
          {masteredSubtasks === totalSubtasks && !canBookEvaluator() && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex-1">
              <p className="text-yellow-800 text-sm">
                <strong>Waiting for mentor mastery:</strong> All tasks and
                subtasks must be marked as Master by the mentor before booking
                evaluator assessment.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate("/appointments")}
            className="btn btn-secondary"
          >
            <ClockIcon className="h-5 w-5 mr-2 inline" />
            View All Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default StandardProgress;
