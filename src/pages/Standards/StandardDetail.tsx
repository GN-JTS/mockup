import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  Standard,
  Task,
  Subtask,
  Department,
  Enrollment,
  MasteredSubtask,
} from "@/types";
import { UserRole } from "@/utils/constants";
import { useNotifications } from "@/context/NotificationContext";
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const StandardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [masteredSubtasks, setMasteredSubtasks] = useState<MasteredSubtask[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return;

      try {
        const [
          standardData,
          tasksData,
          subtasksData,
          departmentsData,
          enrollmentsData,
          masteredData,
        ] = await Promise.all([
          mockApi.getStandardById(id),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
          mockApi.getDepartments(),
          mockApi.getEnrollmentsByEmployee(user.id),
          mockApi.getMasteredSubtasks(user.id),
        ]);

        if (!standardData) {
          showToast("Standard not found", "error");
          navigate("/standards");
          return;
        }

        setStandard(standardData);
        setTasks(tasksData);
        setSubtasks(subtasksData);
        setDepartment(
          departmentsData.find((d) => d.id === standardData.departmentId) ||
            null
        );

        // Check if user is enrolled
        const existingEnrollment = enrollmentsData.find(
          (e) => e.standardId === id
        );
        setEnrollment(existingEnrollment || null);
        setMasteredSubtasks(masteredData);
      } catch (error) {
        console.error("Failed to load standard details:", error);
        showToast("Failed to load standard details", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, showToast]);

  const handleEnroll = async () => {
    if (!standard || !user) return;

    setEnrolling(true);
    try {
      // In a real app, this would create an assignment request
      showToast(
        "Enrollment request will be submitted to your training manager",
        "info"
      );
      // Simulate enrollment request creation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast(
        "Enrollment request submitted successfully! Your manager will review it.",
        "success"
      );
    } catch (error) {
      showToast("Failed to submit enrollment request", "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Standard not found</p>
        <button
          onClick={() => navigate("/standards")}
          className="btn btn-primary mt-4"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const standardSubtasks = subtasks.filter((st) =>
    standard.subtaskIds.includes(st.id)
  );
  const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
  const standardTasks = tasks.filter((t) => taskIds.includes(t.id));

  const isMastered = (subtaskId: string) =>
    masteredSubtasks.some((ms) => ms.subtaskId === subtaskId);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/standards")}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Catalog
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {standard.title}
            </h1>
            <p className="text-gray-600 mt-2">{department?.name}</p>
            <p className="text-gray-700 mt-4">{standard.description}</p>
          </div>
          {enrollment && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
              Enrolled
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium text-gray-900">
                {standard.estimatedDuration}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <BookOpenIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Requirements</p>
              <p className="font-medium text-gray-900">
                {standardSubtasks.length} Subtasks
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Applicable Grades</p>
              <p className="font-medium text-gray-900">
                {standard.grades.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Enroll Button */}
        {user?.role === UserRole.EMPLOYEE && !enrollment && (
          <div className="mt-6">
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn btn-primary"
            >
              {enrolling ? "Submitting..." : "Request Enrollment"}
            </button>
          </div>
        )}
      </div>

      {/* Prerequisites */}
      {standard.prerequisites && standard.prerequisites.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Prerequisites
          </h2>
          <div className="space-y-2">
            {standard.prerequisites.map((prereqId) => {
              const prereq = standardTasks.find((s) => s.id === prereqId);
              return (
                <div
                  key={prereqId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">
                    {prereq?.title || prereqId}
                  </span>
                  <span className="text-sm text-gray-600">Required</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks and Subtasks */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tasks & Subtasks
        </h2>
        <div className="space-y-6">
          {standardTasks.map((task) => {
            const taskSubtasks = standardSubtasks.filter(
              (st) => st.taskId === task.id
            );

            return (
              <div
                key={task.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>

                <div className="space-y-2">
                  {taskSubtasks.map((subtask) => {
                    const mastered = isMastered(subtask.id);
                    return (
                      <div
                        key={subtask.id}
                        className={`flex items-start p-3 rounded-lg ${
                          mastered ? "bg-green-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">
                              {subtask.title}
                            </h4>
                            {mastered && (
                              <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {subtask.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Requirements:</span>{" "}
                            {subtask.requirements}
                          </p>
                          {subtask.resources &&
                            subtask.resources.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StandardDetail;
