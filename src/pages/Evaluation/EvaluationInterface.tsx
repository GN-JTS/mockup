import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { SubtaskEvaluation, Subtask, User } from "@/types";
import { EvaluationStatus, EvaluationStatusNames } from "@/utils/constants";
import { useNotifications } from "@/context/NotificationContext";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

const EvaluationInterface = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [evaluation, setEvaluation] = useState<SubtaskEvaluation | null>(null);
  const [subtask, setSubtask] = useState<Subtask | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Rubric scoring state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState<EvaluationStatus | null>(null);

  // Mock rubric criteria
  const rubricCriteria: RubricCriterion[] = [
    {
      id: "knowledge",
      name: "Knowledge & Understanding",
      description: "Demonstrates understanding of concepts and procedures",
      maxScore: 5,
    },
    {
      id: "execution",
      name: "Execution & Technique",
      description: "Performs tasks correctly with proper technique",
      maxScore: 5,
    },
    {
      id: "safety",
      name: "Safety & Compliance",
      description: "Follows safety protocols and regulations",
      maxScore: 5,
    },
    {
      id: "efficiency",
      name: "Efficiency & Quality",
      description: "Completes work efficiently with high quality",
      maxScore: 5,
    },
    {
      id: "independence",
      name: "Independence",
      description: "Can perform tasks with minimal supervision",
      maxScore: 5,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return;

      try {
        const evalsData = await mockApi.getSubtaskEvaluations();
        const eval_ = evalsData.find((e) => e.id === id);

        if (!eval_) {
          showToast("Evaluation not found", "error");
          navigate(-1);
          return;
        }

        const [subtaskData, usersData] = await Promise.all([
          mockApi.getSubtasks(),
          mockApi.getUsers(),
        ]);

        const subtaskItem = subtaskData.find((s) => s.id === eval_.subtaskId);
        const employeeItem = usersData.find((u) => u.id === eval_.employeeId);

        setEvaluation(eval_);
        setSubtask(subtaskItem || null);
        setEmployee(employeeItem || null);

        // Initialize scores to 0
        const initialScores: Record<string, number> = {};
        rubricCriteria.forEach((criterion) => {
          initialScores[criterion.id] = 0;
        });
        setScores(initialScores);
      } catch (error) {
        console.error("Failed to load evaluation:", error);
        showToast("Failed to load evaluation", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, showToast]);

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );
  const maxScore = rubricCriteria.reduce((sum, c) => sum + c.maxScore, 0);
  const scorePercentage = (totalScore / maxScore) * 100;

  const handleSubmit = async () => {
    if (!evaluation || !decision) {
      showToast("Please select a decision", "warning");
      return;
    }

    if (!feedback.trim()) {
      showToast("Please provide feedback", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const isMentor = user!.role === "mentor";
      const updates: any = {
        [isMentor ? "mentorStatus" : "evaluatorStatus"]: decision,
        [isMentor ? "mentorFeedback" : "evaluatorFeedback"]: feedback,
        [isMentor ? "mentorEvaluatedAt" : "evaluatorEvaluatedAt"]:
          new Date().toISOString(),
      };

      if (!isMentor) {
        updates.evaluatorId = user!.id;
      }

      await mockApi.updateSubtaskEvaluation(evaluation.id, updates);

      showToast("Evaluation submitted successfully!", "success");
      navigate(-1);
    } catch (error) {
      showToast("Failed to submit evaluation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!evaluation || !subtask || !employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Evaluation not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const isMentor = user!.role === "mentor";
  const currentStatus = isMentor
    ? evaluation.mentorStatus
    : evaluation.evaluatorStatus;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Evaluate Subtask
            </h1>
            <p className="text-gray-600 mt-1">
              {isMentor ? "Mentor" : "Evaluator"} Evaluation
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
            Current: {EvaluationStatusNames[currentStatus]}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Employee</p>
            <p className="font-medium text-gray-900">{employee.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Subtask</p>
            <p className="font-medium text-gray-900">{subtask.title}</p>
          </div>
        </div>
      </div>

      {/* Subtask Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Subtask Details
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Description</p>
            <p className="text-gray-600">{subtask.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Requirements</p>
            <p className="text-gray-600">{subtask.requirements}</p>
          </div>
          {subtask.resources && subtask.resources.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Resources
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {subtask.resources.map((resource, idx) => (
                  <li key={idx}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation History */}
      {evaluation.history && evaluation.history.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Evaluation History
          </h2>
          <div className="space-y-2">
            {evaluation.history.map((hist) => (
              <div
                key={hist.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {hist.evaluatorRole === "mentor" ? "Mentor" : "Evaluator"}{" "}
                    Evaluation
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(hist.evaluatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  Status: {EvaluationStatusNames[hist.status]}
                </p>
                <p className="text-sm text-gray-600">{hist.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rubric Scoring */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Rubric
        </h2>

        <div className="space-y-4">
          {rubricCriteria.map((criterion) => (
            <div
              key={criterion.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {criterion.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {criterion.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className="text-lg font-bold text-gray-900">
                    {scores[criterion.id]}
                  </span>
                  <span className="text-sm text-gray-600">
                    /{criterion.maxScore}
                  </span>
                </div>
              </div>

              {/* Score Slider */}
              <div className="mt-3">
                <input
                  type="range"
                  min="0"
                  max={criterion.maxScore}
                  value={scores[criterion.id]}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [criterion.id]: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Score */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              Total Score
            </span>
            <span className="text-2xl font-bold text-primary-600">
              {totalScore}/{maxScore} ({scorePercentage.toFixed(0)}%)
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Detailed Feedback <span className="text-red-500">*</span>
        </h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="input"
          rows={6}
          placeholder="Provide detailed feedback on the employee's performance, areas of strength, and areas for improvement..."
          required
        ></textarea>
      </div>

      {/* Decision */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Evaluation Decision <span className="text-red-500">*</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setDecision(EvaluationStatus.MASTER)}
            className={`p-6 border-2 rounded-lg transition-all ${
              decision === EvaluationStatus.MASTER
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CheckCircleIcon
              className={`h-12 w-12 mx-auto mb-3 ${
                decision === EvaluationStatus.MASTER
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            />
            <h3 className="font-semibold text-gray-900 mb-1">Master</h3>
            <p className="text-sm text-gray-600">
              Demonstrated complete mastery of this subtask
            </p>
            <p className="text-xs text-gray-500 mt-2">Typically 85%+ score</p>
          </button>

          {currentStatus === EvaluationStatus.NOT_STARTED && (
            <button
              onClick={() => setDecision(EvaluationStatus.ATTEMPT_1)}
              className={`p-6 border-2 rounded-lg transition-all ${
                decision === EvaluationStatus.ATTEMPT_1
                  ? "border-yellow-600 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <XCircleIcon
                className={`h-12 w-12 mx-auto mb-3 ${
                  decision === EvaluationStatus.ATTEMPT_1
                    ? "text-yellow-600"
                    : "text-gray-400"
                }`}
              />
              <h3 className="font-semibold text-gray-900 mb-1">Attempt 1</h3>
              <p className="text-sm text-gray-600">
                Needs more practice before re-evaluation
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Will have 2 more attempts
              </p>
            </button>
          )}

          {currentStatus === EvaluationStatus.ATTEMPT_1 && (
            <button
              onClick={() => setDecision(EvaluationStatus.ATTEMPT_2)}
              className={`p-6 border-2 rounded-lg transition-all ${
                decision === EvaluationStatus.ATTEMPT_2
                  ? "border-orange-600 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <XCircleIcon
                className={`h-12 w-12 mx-auto mb-3 ${
                  decision === EvaluationStatus.ATTEMPT_2
                    ? "text-orange-600"
                    : "text-gray-400"
                }`}
              />
              <h3 className="font-semibold text-gray-900 mb-1">Attempt 2</h3>
              <p className="text-sm text-gray-600">
                Showing progress but needs one more try
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Final attempt before escalation
              </p>
            </button>
          )}
        </div>

        {decision && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong>{" "}
              {decision === EvaluationStatus.MASTER
                ? "This will mark the subtask as mastered and allow progression."
                : "The employee will need additional practice and re-evaluation."}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="card">
        <div className="flex space-x-4">
          <button
            onClick={handleSubmit}
            disabled={!decision || !feedback.trim() || submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </button>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationInterface;
