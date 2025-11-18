import PromotionBadge from "@/components/common/PromotionBadge";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  EmployeeProgress,
  EmployeePromotion,
  Grade,
  JobTitle,
  Subtask,
  Task,
  User,
} from "@/types";
import { EvaluationStatus, PromotionStatus } from "@/utils/constants";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PromotionEvaluationInterface = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promotion, setPromotion] = useState<EmployeePromotion | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [targetJobTitle, setTargetJobTitle] = useState<JobTitle | null>(null);
  const [targetGrade, setTargetGrade] = useState<Grade | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Evaluation state
  const [evaluationChanges, setEvaluationChanges] = useState<
    Map<string, { status: EvaluationStatus; feedback: string }>
  >(new Map());

  const isMentor = user?.role === "mentor";
  const isEvaluator = user?.role === "evaluator";

  useEffect(() => {
    loadData();
  }, [promotionId]);

  const loadData = async () => {
    if (!promotionId) return;

    try {
      const [promotionData, progressData, tasksData, subtasksData] =
        await Promise.all([
          mockApi.getEmployeePromotionById(promotionId),
          mockApi.getEmployeeProgressByPromotion(promotionId),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
        ]);

      setPromotion(promotionData || null);
      setProgress(progressData);
      setTasks(tasksData);
      setSubtasks(subtasksData);

      // Load employee and job title/grade if promotion exists
      if (promotionData) {
        const [emp, targetJT, targetG] = await Promise.all([
          mockApi.getUserById(promotionData.employeeId),
          mockApi.getJobTitleById(promotionData.targetJobTitleId),
          mockApi.getGradeById(promotionData.targetGradeId),
        ]);

        setEmployee(emp || null);
        setTargetJobTitle(targetJT || null);
        setTargetGrade(targetG || null);
      }

      // Expand all tasks by default
      setExpandedTasks(new Set(tasksData.map((t) => t.id)));
    } catch (error) {
      console.error("Failed to load evaluation data:", error);
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

  const handleStatusChange = (
    subtaskId: string,
    status: EvaluationStatus,
    currentFeedback?: string
  ) => {
    setEvaluationChanges(
      new Map(evaluationChanges).set(subtaskId, {
        status,
        feedback: currentFeedback || "",
      })
    );
  };

  const handleFeedbackChange = (
    subtaskId: string,
    feedback: string,
    currentStatus?: EvaluationStatus
  ) => {
    setEvaluationChanges(
      new Map(evaluationChanges).set(subtaskId, {
        status: currentStatus || EvaluationStatus.NOT_STARTED,
        feedback,
      })
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Save all evaluation changes
      for (const [subtaskId, changes] of evaluationChanges.entries()) {
        const prog = getSubtaskProgress(subtaskId);
        if (prog) {
          const updates: any = {
            updatedAt: new Date().toISOString(),
          };

          if (isMentor) {
            updates.mentorStatus = changes.status;
            updates.mentorFeedback = changes.feedback;
            updates.mentorId = user.id;
            updates.mentorEvaluatedAt = new Date().toISOString();
          } else if (isEvaluator) {
            updates.evaluatorStatus = changes.status;
            updates.evaluatorFeedback = changes.feedback;
            updates.evaluatorId = user.id;
            updates.evaluatorEvaluatedAt = new Date().toISOString();
          }

          await mockApi.updateEmployeeProgress(prog.id, updates);
        }
      }

      // Reload data
      await loadData();
      setEvaluationChanges(new Map());

      // Check if all subtasks are mastered
      const allMastered = progress.every(
        (p) =>
          p.mentorStatus === EvaluationStatus.MASTER &&
          p.evaluatorStatus === EvaluationStatus.MASTER
      );

      if (allMastered && promotion) {
        // Mark promotion as completed
        await mockApi.updateEmployeePromotionStatus(
          promotion.id,
          PromotionStatus.COMPLETED
        );

        // Issue certificate
        if (targetJobTitle && targetGrade && employee) {
          await mockApi.createCertificate({
            employeeId: employee.id,
            promotionId: promotion.id,
            jobTitleId: targetJobTitle.id,
            gradeId: targetGrade.id,
            issuedBy: user.id,
            masteredSubtaskIds: progress.map((p) => p.subtaskId),
          });
        }

        alert("Promotion completed! Certificate has been issued.");
        navigate(isMentor ? "/mentor-dashboard" : "/evaluator-dashboard");
      } else {
        alert("Evaluation saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save evaluation:", error);
      alert("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  const getTaskSubtasks = (taskId: string) => {
    return subtasks
      .filter((st) => st.taskId === taskId)
      .filter((st) => progress.some((p) => p.subtaskId === st.id));
  };

  const getEvaluationProgress = () => {
    const roleStatus = isMentor ? "mentorStatus" : "evaluatorStatus";
    const total = progress.length;
    const mastered = progress.filter(
      (p) => p[roleStatus] === EvaluationStatus.MASTER
    ).length;
    return { total, mastered };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!promotion || !employee) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Evaluation data not found</p>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-4">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { total, mastered } = getEvaluationProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-linear-to-r from-blue-500 to-blue-700 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isMentor ? "Mentor" : "Evaluator"} Evaluation
            </h1>
            <p className="text-blue-100 mt-1">
              Evaluate {employee.name}'s progress
            </p>
          </div>
          {targetJobTitle && targetGrade && (
            <PromotionBadge
              jobTitle={targetJobTitle}
              grade={targetGrade}
              variant="target"
              size="lg"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm">Total Subtasks</p>
            <p className="text-2xl font-bold mt-1">{total}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm">Mastered</p>
            <p className="text-2xl font-bold mt-1">{mastered}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-blue-100 text-sm">Progress</p>
            <p className="text-2xl font-bold mt-1">
              {((mastered / total) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Evaluation Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Evaluate Subtasks
          </h2>
          <button
            onClick={handleSave}
            disabled={saving || evaluationChanges.size === 0}
            className="btn btn-primary"
          >
            {saving ? "Saving..." : "Save Evaluations"}
          </button>
        </div>

        <div className="space-y-4">
          {tasks
            .filter((task) => getTaskSubtasks(task.id).length > 0)
            .map((task) => {
              const taskSubtasks = getTaskSubtasks(task.id);
              const isExpanded = expandedTasks.has(task.id);

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
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {task.title}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-600">
                      {taskSubtasks.length} subtasks
                    </span>
                  </button>

                  {/* Subtasks */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {taskSubtasks.map((subtask) => {
                        const prog = getSubtaskProgress(subtask.id);
                        const currentStatus = isMentor
                          ? prog?.mentorStatus
                          : prog?.evaluatorStatus;
                        const currentFeedback = isMentor
                          ? prog?.mentorFeedback
                          : prog?.evaluatorFeedback;

                        const changes = evaluationChanges.get(subtask.id);
                        const displayStatus =
                          changes?.status ||
                          currentStatus ||
                          EvaluationStatus.NOT_STARTED;
                        const displayFeedback =
                          changes?.feedback || currentFeedback || "";

                        return (
                          <div key={subtask.id} className="p-6 bg-white">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {subtask.title}
                            </h4>
                            {subtask.description && (
                              <p className="text-sm text-gray-600 mb-4">
                                {subtask.description}
                              </p>
                            )}

                            {/* Status Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                              {[
                                EvaluationStatus.NOT_STARTED,
                                EvaluationStatus.ATTEMPT_1,
                                EvaluationStatus.ATTEMPT_2,
                                EvaluationStatus.MASTER,
                              ].map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(
                                      subtask.id,
                                      status,
                                      displayFeedback
                                    )
                                  }
                                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                    displayStatus === status
                                      ? status === EvaluationStatus.MASTER
                                        ? "border-green-600 bg-green-50 text-green-700"
                                        : status ===
                                          EvaluationStatus.NOT_STARTED
                                        ? "border-gray-600 bg-gray-50 text-gray-700"
                                        : "border-yellow-600 bg-yellow-50 text-yellow-700"
                                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                                  }`}
                                >
                                  {status === EvaluationStatus.MASTER &&
                                    displayStatus === status && (
                                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                                    )}
                                  {status === EvaluationStatus.NOT_STARTED
                                    ? "Not Started"
                                    : status === EvaluationStatus.ATTEMPT_1
                                    ? "Attempt 1"
                                    : status === EvaluationStatus.ATTEMPT_2
                                    ? "Attempt 2"
                                    : "Mastered"}
                                </button>
                              ))}
                            </div>

                            {/* Feedback */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback
                              </label>
                              <textarea
                                value={displayFeedback}
                                onChange={(e) =>
                                  handleFeedbackChange(
                                    subtask.id,
                                    e.target.value,
                                    displayStatus
                                  )
                                }
                                className="input"
                                rows={3}
                                placeholder="Provide feedback on this subtask..."
                              />
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
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving || evaluationChanges.size === 0}
            className="btn btn-primary"
          >
            {saving
              ? "Saving..."
              : evaluationChanges.size > 0
              ? `Save ${evaluationChanges.size} Changes`
              : "No Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionEvaluationInterface;
