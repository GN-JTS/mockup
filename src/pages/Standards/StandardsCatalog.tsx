import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { Standard, Department, Task, Subtask } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const StandardsCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [standardsData, departmentsData, tasksData, subtasksData] =
          await Promise.all([
            mockApi.getStandards(),
            mockApi.getDepartments(),
            mockApi.getTasks(),
            mockApi.getSubtasks(),
          ]);

        setStandards(standardsData);
        setDepartments(departmentsData);
        setTasks(tasksData);
        setSubtasks(subtasksData);
      } catch (error) {
        console.error("Failed to load standards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStandards =
    selectedDepartment === "all"
      ? standards
      : standards.filter((s) => s.departmentId === selectedDepartment);

  const getSubtasksForStandard = (standard: Standard) => {
    return subtasks.filter((st) => standard.subtaskIds.includes(st.id));
  };

  const getTasksForStandard = (standard: Standard) => {
    const standardSubtasks = getSubtasksForStandard(standard);
    const taskIds = [...new Set(standardSubtasks.map((st) => st.taskId))];
    return tasks.filter((t) => taskIds.includes(t.id));
  };

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
          Training Standards Catalog
        </h1>
        <p className="text-gray-600 mt-1">
          Browse available training standards and certification paths
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Department:
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStandards.map((standard) => {
          const department = departments.find(
            (d) => d.id === standard.departmentId
          );
          const standardTasks = getTasksForStandard(standard);
          const standardSubtasks = getSubtasksForStandard(standard);

          return (
            <div
              key={standard.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/standards/${standard.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {standard.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {department?.name}
                  </p>
                </div>
                <AcademicCapIcon className="h-8 w-8 text-primary-600 shrink-0" />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4">
                {standard.description}
              </p>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>Duration: {standard.estimatedDuration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  <span>
                    {standardTasks.length} Tasks, {standardSubtasks.length}{" "}
                    Subtasks
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  <span>Grades: {standard.grades.join(", ")}</span>
                </div>
              </div>

              {/* Prerequisites */}
              {standard.prerequisites && standard.prerequisites.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Prerequisites:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {standard.prerequisites.map((prereqId) => {
                      const prereq = standards.find((s) => s.id === prereqId);
                      return (
                        <span
                          key={prereqId}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {prereq?.title || prereqId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button className="btn btn-primary w-full mt-4">
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStandards.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            No standards found for the selected department
          </p>
        </div>
      )}
    </div>
  );
};

export default StandardsCatalog;
